import { SEO } from '../../components/ui/SEO';
import { StyleFinder as StyleFinderWidget } from '../../features/style-finder/components/StyleFinder';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';

export function StyleFinder() {
  const language = useLanguageStore((state) => state.language);

  return (
    <>
      <SEO
        title={t('nav.styleFinder', language)}
        description="Find a style that matches you. Answer a few simple questions at VYRO."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{t('styleFinder.styleAssistant', language)}</p>
          <h1 className="mt-2 text-3xl font-semibold uppercase tracking-wider text-primary md:text-4xl">
            {t('styleFinder.title', language)}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-text-secondary">
            {t('styleFinder.subtitle', language)}
          </p>
        </div>
        <StyleFinderWidget />
      </div>
    </>
  );
}
