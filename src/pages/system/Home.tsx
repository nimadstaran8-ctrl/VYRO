import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEO } from '../../components/ui/SEO';
import { Button } from '../../components/ui/Button';
import { ProductGrid } from '../../components/product/ProductGrid';
import { getFeaturedProducts } from '../../services/catalog/productService';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';

export function Home() {
  const featured = getFeaturedProducts(4);
  const language = useLanguageStore((state) => state.language);

  const heroText = language === 'fa' 
    ? { title: 'استایل خود را پیدا کن', subtitle: 'کلاه و عینک‌هایی طراحی شده برای استایل شما' }
    : { title: 'Find Your Vibe.', subtitle: 'Hats and glasses made for your style.' };

  const styleAssistantText = language === 'fa'
    ? { label: 'مشاور استایل', title: ' مطمئن نیستید چه چیزی به شما می‌آید؟', description: 'استایلی متناسب با شما پیدا کنید. به چند سوال ساده پاسخ دهید و یک پیشنهاد شخصی دریافت کنید.' }
    : { label: 'Style assistant', title: 'Not Sure What Fits You?', description: 'Find a style that matches you. Answer a few simple questions and get a personal recommendation.' };

  return (
    <>
      <SEO
        title="VYRO"
        description={language === 'fa' ? 'استایل خود را پیدا کنید. کلاه و عینک‌هایی طراحی شده برای استایل شما.' : 'Find Your Vibe. Hats and glasses made for your style.'}
      />

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary">
        <div className="absolute inset-0">
          <img
            src="/images/hero/hero-fashion.svg"
            alt="Fashion model wearing VYRO hat and glasses"
            className="h-full w-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-32 text-center sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl font-semibold uppercase tracking-tight text-white sm:text-7xl md:text-8xl"
          >
            {heroText.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mx-auto mt-6 max-w-md text-lg text-white/80 sm:text-xl"
          >
            {heroText.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button variant="accent" size="lg" asChild>
              <Link to="/shop">{t('common.browseAll', language)}</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link to="/style-finder">{t('nav.styleFinder', language)}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {language === 'fa' ? 'محصولات منتخب' : 'Selected pieces'}
          </p>
          <h2 className="mt-3 text-3xl font-semibold uppercase tracking-wider text-primary md:text-4xl">
            {language === 'fa' ? 'ویژه' : 'Featured'}
          </h2>
        </div>
        <ProductGrid products={featured} />
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{styleAssistantText.label}</p>
          <h2 className="mt-3 text-3xl font-semibold uppercase tracking-wider text-primary md:text-4xl">
            {styleAssistantText.title}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-text-secondary">
            {styleAssistantText.description}
          </p>
          <Button variant="accent" size="lg" className="mt-8" asChild>
            <Link to="/style-finder">{t('nav.styleFinder', language)}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
