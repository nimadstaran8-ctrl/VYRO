import { Sparkles } from 'lucide-react';
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
        description={t('aiStylist.seoDescription', language)}
      />
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-600">
            <Sparkles size={12} />
            {t('aiStylist.badge', language)}
          </div>
          <h1 className="mt-2 text-3xl font-semibold uppercase tracking-wider text-primary md:text-4xl">
            {t('aiStylist.title', language)}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-text-secondary">
            {t('aiStylist.subtitle', language)}
          </p>
        </div>
        <StyleFinderWidget />
      </div>
    </>
  );
}
