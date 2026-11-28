#Requires -Version 5.1
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

function Invoke-Git {
    $result = & git -C $repositoryRoot @args
    if ($LASTEXITCODE -ne 0) {
        throw "Git command failed: $($args[0]) (exit $LASTEXITCODE)."
    }
    $result
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$branch = Invoke-Git rev-parse --abbrev-ref HEAD
if ($branch -ne 'main') {
    throw 'Switch to the local main branch before deploying.'
}

$changes = Invoke-Git status --porcelain --untracked-files=normal
if ($changes) {
    throw 'The working tree has local changes. Commit the intended changes and clean up the working tree before deploying.'
}

$origin = Invoke-Git remote get-url --push --all origin
if (@($origin).Count -ne 1 -or $origin -notmatch '^(https://github\.com/|git@github\.com:|ssh://git@github\.com/)nimadstaran8-ctrl/VYRO(\.git)?/?$') {
    throw 'The push URL for origin must point to nimadstaran8-ctrl/VYRO on GitHub.'
}

$commit = Invoke-Git rev-parse HEAD
$token = $env:GH_TOKEN
if (-not $token) {
    $credential = "protocol=https`nhost=github.com`npath=nimadstaran8-ctrl/VYRO.git`n`n" |
        & git -C $repositoryRoot -c credential.interactive=never credential fill
    $passwordLine = $credential | Where-Object { $_.StartsWith('password=') } | Select-Object -First 1
    if ($LASTEXITCODE -ne 0 -or -not $passwordLine) {
        throw 'Sign in to GitHub with Git Credential Manager or set GH_TOKEN for this session.'
    }
    $token = $passwordLine.Substring(9)
}

$headers = @{
    Authorization          = "Bearer $token"
    Accept                 = 'application/vnd.github+json'
    'X-GitHub-Api-Version' = '2026-03-10'
}
$api = 'https://api.github.com/repos/nimadstaran8-ctrl/VYRO/actions'

try {
    $deployGate = Invoke-RestMethod -Uri "$api/variables/VYRO_DEPLOY_ENABLED" -Headers $headers -TimeoutSec 30
} catch {
    if ([int]$_.Exception.Response.StatusCode -eq 404) {
        throw 'VYRO_DEPLOY_ENABLED is missing or inaccessible. Set up VPS publishing and ensure the GitHub credential can read repository variables.'
    }
    throw
}
if ($deployGate.value -ne 'true') {
    throw 'VYRO_DEPLOY_ENABLED is not true. Complete the VPS setup before publishing.'
}

Write-Host "Pushing main at $commit..."
Invoke-Git push origin "${commit}:refs/heads/main"

$payload = @{ ref = 'main'; inputs = @{ commit = $commit } } | ConvertTo-Json
$dispatch = Invoke-RestMethod -Method Post -Uri "$api/workflows/ci-cd.yml/dispatches" `
    -Headers $headers -ContentType 'application/json' -Body $payload -TimeoutSec 30
if (-not $dispatch.workflow_run_id) {
    throw 'GitHub did not return a workflow run ID. Check GitHub Actions for the deployment status.'
}

$runUri = "$api/runs/$($dispatch.workflow_run_id)"
Write-Host "Waiting for deployment at $($dispatch.html_url)"
$startedWaiting = [DateTime]::UtcNow
$visibilityDeadline = $startedWaiting.AddMinutes(2)
$deadline = $startedWaiting.AddMinutes(30)
$run = $null
do {
    try {
        $run = Invoke-RestMethod -Uri $runUri -Headers $headers -TimeoutSec 30
    } catch {
        if ([int]$_.Exception.Response.StatusCode -ne 404) {
            throw
        }
        if ($null -ne $run -or [DateTime]::UtcNow -ge $visibilityDeadline) {
            throw "GitHub could not find workflow run $($dispatch.workflow_run_id). Check the run and your GitHub credential's Actions access at $($dispatch.html_url)."
        }
        Start-Sleep -Seconds 5
        continue
    }
    if ($run.head_sha -ne $commit) {
        throw "GitHub dispatched a different commit. Expected $commit. See $($dispatch.html_url)."
    }
    if ($run.status -eq 'completed') {
        break
    }
    Start-Sleep -Seconds 10
} while ([DateTime]::UtcNow -lt $deadline)

if ($run.status -ne 'completed') {
    throw "Timed out waiting for deployment. See $($dispatch.html_url)."
}
if ($run.conclusion -ne 'success') {
    throw "CI/CD ended with '$($run.conclusion)'. See $($dispatch.html_url)."
}

$jobs = Invoke-RestMethod -Uri "$runUri/jobs" -Headers $headers -TimeoutSec 30
$deployment = $jobs.jobs | Where-Object { $_.name -eq 'Deploy to the VPS' }
if ($deployment.conclusion -ne 'success') {
    throw "GitHub did not confirm that the VPS deployment succeeded. See $($dispatch.html_url)."
}

if ((Invoke-Git rev-parse HEAD) -ne $commit -or (Invoke-Git status --porcelain --untracked-files=normal)) {
    throw "The VPS deployment of $commit succeeded, but the local working tree changed during deployment."
}

Write-Host "VPS deployment verified for $commit."
