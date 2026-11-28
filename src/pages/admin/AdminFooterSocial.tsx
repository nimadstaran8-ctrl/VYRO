import { useEffect, useState } from 'react';
import { Phone, Save, RotateCcw, Send } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useLanguageStore } from '../../stores/languageStore';
import { type Language } from '../../lib/i18n';
import { getSocialSettings, normalizeFooterPhone, type SocialSettings } from '../../services/settings';
import { defaultFooter, readStorefrontFooter, saveStorefrontFooter } from '../../services/settings/storefrontFooter';

type SocialPlatform = keyof SocialSettings;

interface PlatformConfig {
  key: SocialPlatform;
  label: string;
  icon: React.ReactNode;
}

function isValidHttpsUrl(value: string): boolean {
  if (!/^https:\/\//i.test(value) || value.length > 1024 || /[\s\\]/.test(value)) return false;
  try {
    const url = new URL(value);
    return url.hostname !== '' && !url.username && !url.password && url.port !== '0';
  } catch {
    return false;
  }
}

export function AdminFooterSocial() {
  const lang = useLanguageStore((state) => state.language);
  const language = lang as Language;
  const [formData, setFormData] = useState<SocialSettings>(defaultFooter);
  const [published, setPublished] = useState<SocialSettings>();
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<'load' | 'save' | 'unauthorized' | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [attemptedSave, setAttemptedSave] = useState(false);
  const fa = language === 'fa';

  useEffect(() => {
    const request = new AbortController();
    readStorefrontFooter(request.signal).then(footer => {
      setPublished(footer);
      setFormData(footer);
    }).catch(() => {
      if (!request.signal.aborted) setSaveError('load');
    });
    return () => request.abort();
  }, []);

  const platforms: PlatformConfig[] = [
    {
      key: 'instagram',
      label: language === 'fa' ? 'اینستاگرام' : 'Instagram',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
    {
      key: 'tiktok',
      label: language === 'fa' ? 'تیک‌تاک' : 'TikTok',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      ),
    },
    {
      key: 'telegram',
      label: language === 'fa' ? 'تلگرام' : 'Telegram',
      icon: <Send size={18} />,
    },
    {
      key: 'phone',
      label: fa ? 'شماره تلفن فوتر' : 'Footer phone number',
      icon: <Phone size={18} aria-hidden="true" />,
    },
  ];

  const errors: Partial<Record<SocialPlatform, string>> = {};
  const phone = formData.phone.trim() ? normalizeFooterPhone(formData.phone) : '';
  if (attemptedSave) {
    if (phone === null) errors.phone = fa ? 'شمارهٔ معتبر وارد کنید.' : 'Enter a valid phone number.';
    for (const platform of ['instagram', 'tiktok', 'telegram'] as const) {
      const url = formData[platform].trim();
      if (url && !isValidHttpsUrl(url)) {
        errors[platform] = fa ? 'لطفاً یک آدرس HTTPS معتبر وارد کنید.' : 'Enter a valid HTTPS URL.';
      }
    }
  }

  const hasChanges = published && platforms.some(({ key }) => formData[key] !== published[key]);
  const previousSettings = getSocialSettings();

  async function handleSave() {
    setAttemptedSave(true);
    setSaveMessage(null);
    setSaveError(null);
    if (phone === null || [formData.instagram, formData.tiktok, formData.telegram]
      .some(url => url.trim() && !isValidHttpsUrl(url.trim()))) return;

    setIsSaving(true);
    try {
      const footer = await saveStorefrontFooter({
        instagram: formData.instagram.trim(),
        tiktok: formData.tiktok.trim(),
        telegram: formData.telegram.trim(),
        phone,
      }, password);
      setPublished(footer);
      setFormData(footer);
      setPassword('');
      setSaveMessage(fa ? 'فوتر برای همهٔ بازدیدکنندگان به‌روزرسانی شد.' : 'The footer was updated for all visitors.');
    } catch (error) {
      setSaveError(error instanceof Error && error.message === 'unauthorized' ? 'unauthorized' : 'save');
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    setShowResetConfirm(false);
    setFormData(defaultFooter);
    setSaveMessage(null);
    setSaveError(null);
  }

  const content = {
    title: language === 'fa' ? 'فوتر و شبکه‌های اجتماعی' : 'Footer & Social Media Settings',
    subtitle: language === 'fa'
      ? 'آدرس شبکه‌های اجتماعی و شماره تلفن نمایش داده‌شده در فوتر را مدیریت کنید.'
      : 'Manage the social media links and contact number shown in the storefront footer.',
    save: language === 'fa' ? 'ذخیره تغییرات' : 'Save Changes',
    reset: language === 'fa' ? 'بازنشانی به پیش‌فرض' : 'Reset to Defaults',
    resetTitle: language === 'fa' ? 'بازنشانی تنظیمات' : 'Reset Settings',
    resetMessage: language === 'fa'
      ? 'مقادیر پیش‌فرض در فرم قرار می‌گیرند. برای انتشار آن‌ها، ذخیره را بزنید.'
      : 'Load the default values into the form. Select Save to publish them.',
    confirm: language === 'fa' ? 'بازنشانی' : 'Reset',
    cancel: language === 'fa' ? 'لغو' : 'Cancel',
    requiredHttps: language === 'fa'
      ? 'لینک‌ها باید HTTPS باشند. برای غیرفعال کردن هر دکمه، مقدارش را خالی بگذارید.'
      : 'Links must use HTTPS. Leave a field blank to disable its button.',
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary">{content.title}</h1>
          <p className="mt-1 text-sm text-text-secondary">{content.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowResetConfirm(true)}
            disabled={isSaving || !published}
          >
            <RotateCcw className="h-4 w-4 ltr:ml-2 rtl:mr-2" />
            {content.reset}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={isSaving || !hasChanges || !password}
          >
            <Save className="h-4 w-4 ltr:ml-2 rtl:mr-2" />
            {content.save}
          </Button>
        </div>
      </div>

      {saveMessage && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 dark:bg-green-950/20 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400">{saveMessage}</p>
        </div>
      )}

      {saveError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:bg-red-950/20 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{{
            load: fa ? 'تنظیمات سایت دریافت نشد. صفحه را دوباره بارگذاری کنید.' : 'Could not load the live settings. Reload the page.',
            unauthorized: fa ? 'رمز مالک درست نیست.' : 'The owner password is incorrect.',
            save: fa ? 'ذخیره انجام نشد. دوباره تلاش کنید.' : 'Could not save. Try again.',
          }[saveError]}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-primary font-medium">@</span>
            <h2 className="text-lg font-semibold text-primary">
              {language === 'fa' ? 'شبکه‌های اجتماعی' : 'Social Media Links'}
            </h2>
          </div>

          <p className="mb-4 text-sm text-text-secondary">{content.requiredHttps}</p>

          <div className="space-y-4">
            {platforms.map(({ key, label, icon }) => (
              <div key={key} className="flex items-start gap-3">
                <div className="mt-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {icon}
                </div>
                <div className="flex-1">
                  <Input
                    label={label}
                    type={key === 'phone' ? 'tel' : 'url'}
                    dir="ltr"
                    aria-label={label}
                    value={formData[key]}
                    onChange={event => setFormData(previous => ({ ...previous, [key]: event.target.value }))}
                    error={errors[key]}
                    placeholder={key === 'phone' ? '+98 912 …' : 'https://…'}
                    disabled={isSaving || !published}
                  />
                </div>
              </div>
            ))}
            {published && platforms.some(({ key }) => previousSettings[key] !== defaultFooter[key]) && (
              <Button type="button" variant="outline" disabled={isSaving} onClick={() => setFormData(previousSettings)}>
                {fa ? 'آوردن تنظیمات قدیمی این مرورگر به فرم' : 'Load this browser’s previous settings'}
              </Button>
            )}
            <Input
              type="password"
              autoComplete="current-password"
              label={fa ? 'رمز مالک برای انتشار تنظیمات' : 'Owner password'}
              value={password}
              disabled={isSaving || !published}
              onChange={event => setPassword(event.target.value)}
            />
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <ConfirmDialog
          isOpen={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          onConfirm={handleReset}
          title={content.resetTitle}
          message={content.resetMessage}
          confirmText={content.confirm}
          cancelText={content.cancel}
          variant="danger"
        />
      )}
    </div>
  );
}
