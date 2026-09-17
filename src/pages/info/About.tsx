import { SEO } from '../../components/ui/SEO';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';

export function About() {
  const language = useLanguageStore((state) => state.language);

  const values = (lang: string) => [
    { title: t('info.design', lang as 'fa' | 'en'), desc: lang === 'fa' ? 'خطوط تمیز و جزئیات دقیق.' : 'Clean silhouettes and thoughtful details.' },
    { title: t('info.quality', lang as 'fa' | 'en'), desc: lang === 'fa' ? 'مواد با دوام که فراتر از فصل باقی می‌مانند.' : 'Materials made to last beyond the season.' },
    { title: t('info.comfort', lang as 'fa' | 'en'), desc: lang === 'fa' ? 'محصولاتی که به اندازه ظاهر خوب، احساس خوبی دارند.' : 'Pieces that feel as good as they look.' },
    { title: t('info.personalStyle', lang as 'fa' | 'en'), desc: lang === 'fa' ? 'لوازم جانبی که چیزی درباره شما می‌گویند.' : 'Accessories that say something about you.' },
  ];

  return (
    <>
      <SEO
        title={t('nav.about', language)}
        description="VYRO is made for people who believe small details can define a style."
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="aspect-[4/5] overflow-hidden rounded-2xl">
            <img
              src="/images/site/about-brand.svg"
              alt="VYRO brand story"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{t('info.aboutVyro', language)}</p>
            <h1 className="mt-4 text-3xl font-semibold uppercase tracking-wider text-primary md:text-4xl">
              {t('info.smallDetailsBigStyle', language)}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-text-secondary">
              {t('info.aboutDesc1', language)}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-text-secondary">
              {t('info.aboutDesc2', language)}
            </p>
          </div>
        </div>

        <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values(language).map((value) => (
            <div key={value.title} className="rounded-2xl bg-white p-6">
              <h3 className="text-lg font-semibold text-primary">{value.title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{value.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
