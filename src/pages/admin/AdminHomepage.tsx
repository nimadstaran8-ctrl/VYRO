import { useState, useEffect } from 'react';
import { Save, Image, Type, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useLanguageStore } from '../../stores/languageStore';
import { t, type Language } from '../../lib/i18n';
import { getHomepageSettings, updateHomepageSettings, type HomepageSettings } from '../../services/settings';
import { getAllImages } from '../../services/media';
import { Link } from 'react-router-dom';

export function AdminHomepage() {
  const lang = useLanguageStore((state) => state.language);
  const language = lang as Language;
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<HomepageSettings>({
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    featuredTitle: '',
    aboutTitle: '',
    aboutDescription: '',
    featuredProductIds: [],
    featuredCategoryIds: [],
  });

  useEffect(() => {
    const settings = getHomepageSettings();
    setFormData(settings);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    const result = updateHomepageSettings(formData);
    setIsSaving(false);
    
    if (result.success) {
      setSaveMessage(language === 'fa' ? 'تنظیمات با موفقیت ذخیره شد' : 'Settings saved successfully');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleChange = (field: keyof HomepageSettings, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const heroImages = getAllImages().filter(img => 
    img.location === 'hero' || img.location === 'banner' || img.location === 'site'
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary">{t('adminNav.homepage', language)}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {language === 'fa' ? 'مدیریت محتوای صفحه اصلی' : 'Manage homepage content'}
          </p>
        </div>
        <Button onClick={handleSave} isLoading={isSaving}>
          <Save className="h-4 w-4 ltr:ml-2 rtl:mr-2" />
          {language === 'fa' ? 'ذخیره تغییرات' : 'Save Changes'}
        </Button>
      </div>

      {saveMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm text-green-600">{saveMessage}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-surface rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-primary">
              {language === 'fa' ? 'بخش قهرمان (Hero)' : 'Hero Section'}
            </h2>
          </div>
          <div className="space-y-4">
            <Input
              label={language === 'fa' ? 'عنوان اصلی' : 'Main Title'}
              value={formData.heroTitle}
              onChange={(e) => handleChange('heroTitle', e.target.value)}
              placeholder={language === 'fa' ? 'استایل خود را پیدا کن' : 'Find Your Style'}
            />
            <Input
              label={language === 'fa' ? 'زیرعنوان' : 'Subtitle'}
              value={formData.heroSubtitle}
              onChange={(e) => handleChange('heroSubtitle', e.target.value)}
              placeholder={language === 'fa' ? 'کلاه و عینک‌هایی طراحی شده برای استایل شما' : 'Hats and glasses made for your style'}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary">
                {language === 'fa' ? 'تصویر پس‌زمینه' : 'Background Image'}
              </label>
              <div className="flex gap-4">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-background flex-shrink-0">
                  <img
                    src={formData.heroImage || '/images/site/fallback.svg'}
                    alt="Hero"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/site/fallback.svg';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    value={formData.heroImage}
                    onChange={(e) => handleChange('heroImage', e.target.value)}
                    placeholder="/images/hero/hero-fashion.svg"
                  />
                  <p className="mt-1 text-xs text-text-secondary">
                    {language === 'fa' ? 'برای انتخاب تصویر به کتابخانه تصاویر بروید.' : 'Go to Media Library to select an image.'}
                  </p>
                  <Link 
                    to="/admin/media" 
                    className="mt-2 inline-block text-sm text-primary hover:underline"
                  >
                    {language === 'fa' ? 'باز کردن کتابخانه تصاویر' : 'Open Media Library'}
                  </Link>
                </div>
              </div>
              {heroImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-text-secondary mb-2">{language === 'fa' ? 'تصاویر پیشنهادی:' : 'Suggested images:'}</p>
                  <div className="flex gap-2 flex-wrap">
                    {heroImages.slice(0, 5).map(img => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => handleChange('heroImage', img.url)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          formData.heroImage === img.url ? 'border-primary' : 'border-transparent hover:border-primary/50'
                        }`}
                      >
                        <img src={img.thumbnailUrl} alt={img.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-primary">
              {language === 'fa' ? 'بخش محصولات' : 'Featured Section'}
            </h2>
          </div>
          <Input
            label={language === 'fa' ? 'عنوان بخش' : 'Section Title'}
            value={formData.featuredTitle}
            onChange={(e) => handleChange('featuredTitle', e.target.value)}
            placeholder={language === 'fa' ? 'محصولات منتخب' : 'Featured Products'}
          />
        </div>

        <div className="bg-surface rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-primary">
              {language === 'fa' ? 'بخش درباره ما' : 'About Section'}
            </h2>
          </div>
          <div className="space-y-4">
            <Input
              label={language === 'fa' ? 'عنوان' : 'Title'}
              value={formData.aboutTitle}
              onChange={(e) => handleChange('aboutTitle', e.target.value)}
              placeholder={language === 'fa' ? 'درباره وایرو' : 'About Vyro'}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary">
                {language === 'fa' ? 'توضیحات' : 'Description'}
              </label>
              <textarea
                value={formData.aboutDescription}
                onChange={(e) => handleChange('aboutDescription', e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
                placeholder={language === 'fa' 
                  ? 'وایرو برای افرادی ساخته شده که باور دارند جزئیات کوچک می‌تواند استایل را تعریف کند.'
                  : 'Vyro is built for people who believe the small details can define style.'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
