import type { ActivityLogEntry, ActivityLogType, ActivityLogDetail } from '../../types/activityLog';

const LOGS_STORAGE_KEY = 'vyro_logs_repository';

/**
 * Upper bound on stored entries. Logs are append-only diagnostics; the oldest
 * entries are dropped once the cap is reached so localStorage can't grow
 * unbounded.
 */
const MAX_LOG_ENTRIES = 500;

export interface LogStorageData {
  logs: ActivityLogEntry[];
  version: number;
}

function getStorageData(): LogStorageData {
  try {
    const data = localStorage.getItem(LOGS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as LogStorageData;
      return {
        version: parsed.version ?? 1,
        logs: Array.isArray(parsed.logs) ? parsed.logs : [],
      };
    }
  } catch {
  }
  return { logs: [], version: 1 };
}

function setStorageData(data: LogStorageData): void {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable or full — logging must never break the caller.
  }
}

function generateLogId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `LOG-${timestamp}-${random}`.toUpperCase();
}

/**
 * Records an activity log entry. Fire-and-forget: failures (quota, private
 * mode) are swallowed so that logging never disrupts the action being logged.
 */
export function logActivity(input: {
  type: ActivityLogType;
  entityId?: string;
  detail?: ActivityLogDetail;
}): void {
  const entry: ActivityLogEntry = {
    id: generateLogId(),
    type: input.type,
    entityId: input.entityId,
    detail: input.detail,
    createdAt: new Date().toISOString(),
  };

  const data = getStorageData();
  const logs = [entry, ...data.logs].slice(0, MAX_LOG_ENTRIES);
  setStorageData({ logs, version: 1 });
}

/** All entries, newest first. */
export function getActivityLogs(): ActivityLogEntry[] {
  return [...getStorageData().logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getActivityLogsByType(type: ActivityLogType): ActivityLogEntry[] {
  return getActivityLogs().filter((entry) => entry.type === type);
}

export function clearActivityLogs(): void {
  setStorageData({ logs: [], version: 1 });
}
