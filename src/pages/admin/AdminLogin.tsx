import { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useLanguageStore } from '../../stores/languageStore';
import type { Language } from '../../lib/i18n';
import { loginAdmin, isAdminAuthenticated } from '../../features/admin/services/adminAuth';

interface FormErrors {
  username?: string;
  password?: string;
  general?: string;
}

export function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const language = useLanguageStore((state) => state.language) as Language;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from || '/admin';

  // Already signed in in this browser session — go straight to the panel.
  if (isAdminAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  const content = {
    title: language === 'fa' ? 'ورود به پنل مدیریت' : 'Admin Login',
    subtitle: language === 'fa' ? 'وایرو' : 'VYRO',
    username: language === 'fa' ? 'نام کاربری' : 'Username',
    password: language === 'fa' ? 'رمز عبور' : 'Password',
    login: language === 'fa' ? 'ورود' : 'Sign In',
    loggingIn: language === 'fa' ? 'در حال ورود...' : 'Signing in...',
    usernameRequired: language === 'fa' ? 'نام کاربری الزامی است' : 'Username is required',
    passwordRequired: language === 'fa' ? 'رمز عبور الزامی است' : 'Password is required',
    invalidCredentials: language === 'fa' ? 'نام کاربری یا رمز عبور اشتباه است' : 'Invalid username or password',
    backToStore: language === 'fa' ? 'بازگشت به فروشگاه' : 'Back to Store',
    demoNotice:
      language === 'fa'
        ? 'این یک ورود نمایشی فرانت‌اند است و امنیت واقعی ندارد.'
        : 'This is a frontend demo login and provides no real security.',
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!username.trim()) next.username = content.usernameRequired;
    if (!password) next.password = content.passwordRequired;
    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const result = loginAdmin(username, password);

    if (result.success) {
      navigate(from, { replace: true });
      return;
    }

    setErrors({ general: content.invalidCredentials });
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-3xl font-bold tracking-tight text-primary">VYRO</span>
          <h1 className="mt-4 text-xl font-semibold text-primary">{content.title}</h1>
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

            <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? content.loggingIn : content.login}
            </Button>
          </div>

          <div className="mt-6 rounded-xl bg-background p-3">
            <p className="flex items-start gap-2 text-xs text-text-secondary">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{content.demoNotice}</span>
            </p>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-text-secondary hover:text-primary">
            {content.backToStore}
          </Link>
        </div>
      </div>
    </div>
  );
}
