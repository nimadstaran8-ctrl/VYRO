import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useLanguageStore } from '../../stores/languageStore';
import type { Language } from '../../lib/i18n';
import { loginUser, isUserAuthenticated, type AuthResult } from '../../features/account/services/userAuth';

interface FormErrors {
  username?: string;
  password?: string;
  general?: string;
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const language = useLanguageStore((state) => state.language) as Language;

  const [username, setUsername] = useState(
    (location.state as { username?: string } | null)?.username ?? ''
  );
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from || '/';

  // Already signed in — no need for the login form.
  if (isUserAuthenticated()) {
    return <Navigate to={from} replace />;
  }

  const content = {
    title: language === 'fa' ? 'ورود به حساب کاربری' : 'Sign In',
    subtitle: language === 'fa' ? 'برای مشاهده فروشگاه وارد شوید' : 'Sign in to browse the store',
    username: language === 'fa' ? 'نام کاربری' : 'Username',
    password: language === 'fa' ? 'رمز عبور' : 'Password',
    login: language === 'fa' ? 'ورود' : 'Sign In',
    loggingIn: language === 'fa' ? 'در حال ورود...' : 'Signing in...',
    usernameRequired: language === 'fa' ? 'نام کاربری الزامی است' : 'Username is required',
    passwordRequired: language === 'fa' ? 'رمز عبور الزامی است' : 'Password is required',
    forgotPassword: language === 'fa' ? 'رمز عبورم را فراموش کردم' : 'I forgot my password',
    noAccount: language === 'fa' ? 'حساب کاربری ندارید؟' : "Don't have an account?",
    register: language === 'fa' ? 'ثبت‌نام کنید' : 'Register',
  };

  const errorMessages: Record<string, string> = {
    'invalid-credentials':
      language === 'fa'
        ? 'نام کاربری یا رمز عبور اشتباه است'
        : 'Invalid username or password',
  };

  const describeError = (error: AuthResult['error']): string | undefined => {
    if (!error) return undefined;
    return (
      errorMessages[error] ??
      (language === 'fa' ? 'خطایی رخ داد. دوباره تلاش کنید.' : 'Something went wrong. Please try again.')
    );
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!username.trim()) next.username = content.usernameRequired;
    if (!password) next.password = content.passwordRequired;
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const result = await loginUser(username, password);

    if (result.success) {
      navigate(from, { replace: true });
      return;
    }

    setErrors({ general: describeError(result.error) });
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-primary">{content.title}</h1>
          <p className="mt-2 text-sm text-text-secondary">{content.subtitle}</p>
        </div>

        <form
          onSubmit={handleSubmit}
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
                autoComplete="current-password"
                required
                className="ps-9"
              />
            </div>

            <div className="text-end">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-text-secondary underline-offset-4 hover:text-primary hover:underline"
              >
                {content.forgotPassword}
              </Link>
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? content.loggingIn : content.login}
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-text-secondary">
            {content.noAccount}{' '}
            <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
              {content.register}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
