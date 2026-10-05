import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Lock, User, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useLanguageStore } from '../../stores/languageStore';
import type { Language } from '../../lib/i18n';
import {
  registerUser,
  isUserAuthenticated,
  PASSWORD_MIN_LENGTH,
  validateUsername,
  validateEmail,
  validatePassword,
  type AuthResult,
} from '../../features/account/services/userAuth';

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function Register() {
  const navigate = useNavigate();
  const language = useLanguageStore((state) => state.language) as Language;

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Already signed in — no need for the registration form.
  if (isUserAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const content = {
    title: language === 'fa' ? 'ثبت‌نام' : 'Create Account',
    subtitle:
      language === 'fa'
        ? 'برای ورود به فروشگاه حساب بسازید'
        : 'Create an account to enter the store',
    username: language === 'fa' ? 'نام کاربری' : 'Username',
    email: language === 'fa' ? 'ایمیل' : 'Email',
    password: language === 'fa' ? 'رمز عبور' : 'Password',
    confirmPassword: language === 'fa' ? 'تکرار رمز عبور' : 'Confirm Password',
    register: language === 'fa' ? 'ثبت‌نام' : 'Register',
    registering: language === 'fa' ? 'در حال ثبت‌نام...' : 'Creating account...',
    usernameRequired: language === 'fa' ? 'نام کاربری الزامی است' : 'Username is required',
    usernameInvalid:
      language === 'fa'
        ? 'نام کاربری باید ۳ تا ۳۲ حرف باشد و فقط شامل حروف، عدد یا خط تیره باشد'
        : 'Username must be 3–32 characters (letters, digits or underscore)',
    emailRequired: language === 'fa' ? 'ایمیل الزامی است' : 'Email is required',
    emailInvalid: language === 'fa' ? 'ایمیل معتبر نیست' : 'Enter a valid email address',
    passwordRequired: language === 'fa' ? 'رمز عبور الزامی است' : 'Password is required',
    passwordShort:
      language === 'fa'
        ? `رمز عبور باید حداقل ${PASSWORD_MIN_LENGTH} کاراکتر باشد`
        : `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    passwordMismatch: language === 'fa' ? 'رمزهای عبور یکسان نیستند' : 'Passwords do not match',
    usernameTaken: language === 'fa' ? 'این نام کاربری قبلاً استفاده شده است' : 'This username is already taken',
    emailTaken: language === 'fa' ? 'این ایمیل قبلاً استفاده شده است' : 'This email is already registered',
    storageUnavailable:
      language === 'fa'
        ? 'ذخیره‌سازی در مرورگر ممکن نیست (حالت ناشناس؟)'
        : 'Browser storage is unavailable (private mode?)',
    genericError: language === 'fa' ? 'خطایی رخ داد. دوباره تلاش کنید.' : 'Something went wrong. Please try again.',
    haveAccount: language === 'fa' ? 'قبلاً ثبت‌نام کرده‌اید؟' : 'Already have an account?',
    login: language === 'fa' ? 'وارد شوید' : 'Sign In',
    successTitle: language === 'fa' ? 'ثبت‌نام انجام شد!' : 'Account created!',
    successBody:
      language === 'fa'
        ? 'حالا با نام کاربری و رمز عبوری که ساختید وارد شوید.'
        : 'Now sign in with the username and password you just created.',
    goLogin: language === 'fa' ? 'رفتن به صفحه ورود' : 'Go to Sign In',
  };

  const errorMessages: Record<string, string> = {
    'username-taken': content.usernameTaken,
    'email-taken': content.emailTaken,
    'password-mismatch': content.passwordMismatch,
    'storage-unavailable': content.storageUnavailable,
  };

  const describeError = (error: AuthResult['error']): string | undefined => {
    if (!error) return undefined;
    return errorMessages[error] ?? content.genericError;
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    const usernameError = validateUsername(username);
    next.username = usernameError === 'username-required' ? content.usernameRequired : usernameError ? content.usernameInvalid : undefined;
    const emailError = validateEmail(email);
    next.email = emailError === 'email-required' ? content.emailRequired : emailError ? content.emailInvalid : undefined;
    const passwordError = validatePassword(password);
    next.password = passwordError === 'password-required' ? content.passwordRequired : passwordError ? content.passwordShort : undefined;
    if (!confirmPassword) {
      next.confirmPassword = content.passwordRequired;
    } else if (confirmPassword !== password) {
      next.confirmPassword = content.passwordMismatch;
    }
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).some((key) => nextErrors[key as keyof FormErrors])) return;

    setIsSubmitting(true);
    const result = await registerUser({ username, email, password, confirmPassword });

    if (result.success) {
      // Per the flow: register first, then sign in with the new credentials.
      setRegistered(true);
      setIsSubmitting(false);
      return;
    }

    setErrors({ general: describeError(result.error) });
    setIsSubmitting(false);
  };

  if (registered) {
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
              {isSubmitting ? content.registering : content.register}
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-text-secondary">
            {content.haveAccount}{' '}
            <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              {content.login}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
