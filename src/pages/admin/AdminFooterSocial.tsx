import { useState, useMemo } from 'react';
import { Save, RotateCcw, Send } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useLanguageStore } from '../../stores/languageStore';
import { type Language } from '../../lib/i18n';
import {
  getSocialSettings,
  updateSocialSettings,
  resetSocialSettings,
  type SocialSettings,
} from '../../services/settings';

type SocialPlatform = keyof SocialSettings;

interface PlatformConfig {
  key: SocialPlatform;
  label: string;
  icon: React.ReactNode;
}

function isValidHttpsUrl(value: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function AdminFooterSocial() {
  const lang = useLanguageStore((state) => state.language);
  const language = lang as Language;
  const [formData, setFormData] = useState<SocialSettings>(() => getSocialSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [touched, setTouched] = useState<Record<SocialPlatform, boolean>>({
    instagram: false,
    tiktok: false,
    telegram: false,
  });

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
  ];

  const errors = useMemo(() => {
    const next: Partial<Record<SocialPlatform, string>> = {};
    (['instagram', 'tiktok', 'telegram'] as SocialPlatform[]).forEach((key) => {
      const value = formData[key];
      if (touched[key] && !isValidHttpsUrl(value)) {
        next[key] = language === 'fa'
          ? 'لطفاً یک آدرس HTTPS معتبر وارد کنید'
          : 'Please enter a valid HTTPS URL';
      }
    });
    return next;
  }, [formData, touched, language]);

  const hasErrors = Object.keys(errors).length > 0;
  const hasChanges = useMemo(() => {
    const current = getSocialSettings();
    return (
      formData.instagram !== current.instagram ||
      formData.tiktok !== current.tiktok ||
      formData.telegram !== current.telegram
    );
  }, [formData]);

  const handleChange = (key: SocialPlatform) => (value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
    setSaveMessage(null);
    setSaveError(null);
  };

  const handleBlur = (key: SocialPlatform) => () => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleSave = () => {
    setTouched({ instagram: true, tiktok: true, telegram: true });
    setSaveMessage(null);
    setSaveError(null);

    if (hasErrors) {
      return;
    }

    setIsSaving(true);
    const result = updateSocialSettings(formData);
    setIsSaving(false);

    if (result.success) {
      setSaveMessage(language === 'fa' ? 'تنظیمات ذخیره شد' : 'Settings saved successfully');
      setTimeout(() => setSaveMessage(null), 3000);
    } else {
      setSaveError(result.error || (language === 'fa' ? 'خطا در ذخیره تنظیمات' : 'Failed to save settings'));
    }
  };

  const handleReset = () => {
    setShowResetConfirm(false);
    setSaveMessage(null);
    setSaveError(null);

    const result = resetSocialSettings();
    if (result.success) {
      setFormData(getSocialSettings());
      setSaveMessage(language === 'fa' ? 'تنظیمات به حالت پیش‌فرض بازنشانی شد' : 'Settings reset to defaults');
      setTimeout(() => setSaveMessage(null), 3000);
    } else {
      setSaveError(result.error || (language === 'fa' ? 'خطا در بازنشانی تنظیمات' : 'Failed to reset settings'));
    }
  };

  const content = {
    title: language === 'fa' ? 'فوتر و شبکه‌های اجتماعی' : 'Footer & Social Media Settings',
    subtitle: language === 'fa'
      ? 'آدرس شبکه‌های اجتماعی نمایش داده شده در فوتر را مدیریت کنید.'
      : 'Manage the social media links shown in the storefront footer.',
    save: language === 'fa' ? 'ذخیره تغییرات' : 'Save Changes',
    reset: language === 'fa' ? 'بازنشانی به پیش‌فرض' : 'Reset to Defaults',
    resetTitle: language === 'fa' ? 'بازنشانی تنظیمات' : 'Reset Settings',
    resetMessage: language === 'fa'
      ? 'آیا مطمئن هستید که می‌خواهید آدرس‌ها را به حالت پیش‌فرض بازنشانی کنید؟'
      : 'Are you sure you want to reset the URLs to their default values?',
    confirm: language === 'fa' ? 'بازنشانی' : 'Reset',
    cancel: language === 'fa' ? 'لغو' : 'Cancel',
    requiredHttps: language === 'fa'
      ? 'فقط آدرس‌های HTTPS مجاز هستند.'
      : 'Only HTTPS URLs are allowed.',
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
            disabled={isSaving}
          >
            <RotateCcw className="h-4 w-4 ltr:ml-2 rtl:mr-2" />
            {content.reset}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={isSaving || !hasChanges}
          >
            <Save className="h-4 w-4 ltr:ml-2 rtl:mr-2" />
            {content.save}
          </Button>
        </div>
      </div>

      {saveMessage && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-600">{saveMessage}</p>
        </div>
      )}

      {saveError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{saveError}</p>
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
                    type="url"
                    value={formData[key]}
                    onChange={(e) => handleChange(key)(e.target.value)}
                    onBlur={handleBlur(key)}
                    error={errors[key]}
                    placeholder={`https://www.${key}.com/...`}
                    disabled={isSaving}
                  />
                </div>
              </div>
            ))}
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
