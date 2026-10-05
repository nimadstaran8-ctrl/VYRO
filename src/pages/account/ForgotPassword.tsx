import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, Mail, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useLanguageStore } from '../../stores/languageStore';
import type { Language } from '../../lib/i18n';
import {
  resetPassword,
  validatePassword,
  PASSWORD_MIN_LENGTH,
  type AuthResult,
} from '../../features/account/services/userAuth';

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

type Step = 'identify' | 'set-new' | 'done';

export function ForgotPassword() {
  const navigate = useNavigate();
  const language = useLanguageStore((state) => state.language) as Language;

  const [step, setStep] = useState<Step>('identify');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const content = {
    title: language === 'fa' ? 'بازیابی رمز عبور' : 'Reset Password',
    identifyHelp:
      language === 'fa'
        ? 'نام کاربری و ایمیل حساب خود را وارد کنید'
        : 'Enter your username and account email',
    setNewHelp:
      language === 'fa'
        ? 'حساب پیدا شد. رمز عبور جدید را انتخاب کنید.'
        : 'Account verified. Choose a new password.',
    username: language === 'fa' ? 'نام کاربری' : 'Username',
    email: language === 'fa' ? 'ایمیل حساب' : 'Account Email',
    password: language === 'fa' ? 'رمز عبور جدید' : 'New Password',
    confirmPassword: language === 'fa' ? 'تکرار رمز عبور جدید' : 'Confirm New Password',
    continue: language === 'fa' ? 'ادامه' : 'Continue',
    verifying: language === 'fa' ? 'در حال بررسی...' : 'Verifying...',
    reset: language === 'fa' ? 'تغییر رمز عبور' : 'Change Password',
    resetting: language === 'fa' ? 'در حال تغییر...' : 'Changing...',
    usernameRequired: language === 'fa' ? 'نام کاربری الزامی است' : 'Username is required',
    emailRequired: language === 'fa' ? 'ایمیل الزامی است' : 'Email is required',
    passwordRequired: language === 'fa' ? 'رمز عبور الزامی است' : 'Password is required',
    passwordShort:
      language === 'fa'
        ? `رمز عبور باید حداقل ${PASSWORD_MIN_LENGTH} کاراکتر باشد`
        : `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    passwordMismatch: language === 'fa' ? 'رمزهای عبور یکسان نیستند' : 'Passwords do not match',
    accountNotFound:
      language === 'fa'
        ? 'حسابی با این نام کاربری و ایمیل پیدا نشد'
        : 'No account matches this username and email',
    genericError: language === 'fa' ? 'خطایی رخ داد. دوباره تلاش کنید.' : 'Something went wrong. Please try again.',
    successTitle: language === 'fa' ? 'رمز عبور تغییر کرد!' : 'Password changed!',
    successBody:
      language === 'fa'
        ? 'حالا با رمز عبور جدید وارد شوید.'
        : 'You can now sign in with your new password.',
    goLogin: language === 'fa' ? 'رفتن به صفحه ورود' : 'Go to Sign In',
    backToLogin: language === 'fa' ? 'بازگشت به ورود' : 'Back to Sign In',
  };

  const errorMessages: Record<string, string> = {
    'account-not-found': content.accountNotFound,
    'password-mismatch': content.passwordMismatch,
  };

  const describeError = (error: AuthResult['error']): string | undefined => {
    if (!error) return undefined;
    return errorMessages[error] ?? content.genericError;
  };

  const handleIdentify = (e: React.FormEvent) => {
    e.preventDefault();

    const next: FormErrors = {};
    if (!username.trim()) next.username = content.usernameRequired;
    if (!email.trim()) next.email = content.emailRequired;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // The account is verified on the server-side of this flow when the new
    // password is submitted; here we just collect the identity.
    setStep('set-new');
    setErrors({});
  };

  const handleSetNew = async (e: React.FormEvent) => {
    e.preventDefault();

    const next: FormErrors = {};
    const passwordError = validatePassword(password);
    next.password =
      passwordError === 'password-required' ? content.passwordRequired : passwordError ? content.passwordShort : undefined;
    if (!confirmPassword) {
      next.confirmPassword = content.passwordRequired;
    } else if (confirmPassword !== password) {
      next.confirmPassword = content.passwordMismatch;
    }
    setErrors(next);
    if (Object.keys(next).some((key) => next[key as keyof FormErrors])) return;

    setIsSubmitting(true);
    const result = await resetPassword({ username, email, password, confirmPassword });

    if (result.success) {
      setStep('done');
      setIsSubmitting(false);
      return;
    }

    if (result.error === 'account-not-found') {
      setStep('identify');
    }
    setErrors({ general: describeError(result.error) });
    setIsSubmitting(false);
  };

  if (step === 'done') {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl bg-surface p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h1 className="mt-4 text-xl font-semibold text-primary">{content.successTitle}</h1>
          <p className="mt-2 text-sm text-text-secondary">{content.successBody}</p>
          <Button
            className="mt-6 w-full"
            onClick={() => navigate('/login', { state: { username }, replace: true })}
          >
            {content.goLogin}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-sm">
            <KeyRound className="h-5 w-5 text-primary" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-primary">{content.title}</h1>
          <p className="mt-2 text-sm text-text-secondary">
            {step === 'identify' ? content.identifyHelp : content.setNewHelp}
          </p>
        </div>

        {step === 'identify' ? (
          <form
            onSubmit={handleIdentify}
            noValidate
            className="rounded-2xl bg-surface p-6 shadow-sm sm:p-8"
            aria-label={content.title}
          >
            {errors.general && (
              <div
                className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <div className="space-y-5">
              <div className="relative">
                <User className="pointer-events-none absolute start-3 top-[38px] h-4 w-4 text-text-secondary" />
                <Input
                  label={content.username}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
                  }}
                  error={errors.username}
                  autoComplete="username"
                  autoFocus
                  required
                  className="ps-9"
                />
              </div>

              <div className="relative">
                <Mail className="pointer-events-none absolute start-3 top-[38px] h-4 w-4 text-text-secondary" />
                <Input
                  label={content.email}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  error={errors.email}
                  autoComplete="email"
                  required
                  className="ps-9"
                />
              </div>

              <Button type="submit" className="w-full">
                {content.continue}
              </Button>
            </div>

            <p className="mt-6 text-center text-sm">
              <Link
                to="/login"
                className="font-medium text-text-secondary underline-offset-4 hover:text-primary hover:underline"
              >
                {content.backToLogin}
              </Link>
            </p>
          </form>
        ) : (
          <form
            onSubmit={handleSetNew}
            noValidate
            className="rounded-2xl bg-surface p-6 shadow-sm sm:p-8"
            aria-label={content.title}
          >
            {errors.general && (
              <div
                className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <div className="space-y-5">
              <div className="relative">
                <Lock className="pointer-events-none absolute start-3 top-[38px] h-4 w-4 text-text-secondary" />
                <Input
                  label={content.password}
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  error={errors.password}
                  autoComplete="new-password"
                  autoFocus
                  required
                  className="ps-9"
                />
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute start-3 top-[38px] h-4 w-4 text-text-secondary" />
                <Input
                  label={content.confirmPassword}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                  required
                  className="ps-9"
                />
              </div>

              <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
                {isSubmitting ? content.resetting : content.reset}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
