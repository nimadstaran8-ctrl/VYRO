import { SEO } from '../../components/ui/SEO';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';

export function Shipping() {
  const language = useLanguageStore((state) => state.language);

  return (
    <>
      <SEO
        title={t('nav.shipping', language)}
        description="VYRO shipping information. Delivery times, rates, and policies."
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold uppercase tracking-wider text-primary md:text-4xl">{t('info.shippingInfo', language)}</h1>
        <div className="mt-8 space-y-6 text-text-secondary">
          <p>{language === 'fa' ? 'ما تلاش می‌کنیم محصولات وایرو شما را در اسرع وقت به شما برسانیم. همه سفارشات ظرف ۱ تا ۲ روز کاری پردازش می‌شوند.' : 'We aim to get your VYRO pieces to you as quickly as possible. All orders are processed within 1–2 business days.'}</p>
          <h2 className="text-lg font-semibold text-primary">{language === 'fa' ? 'گزینه‌های ارسال' : 'Shipping Options'}</h2>
          <ul className="list-disc pl-5 rtl:pr-5 rtl:mr-5">
            <li>{t('info.standardShipping', language)}</li>
            <li>{t('info.expressShipping', language)}</li>
          </ul>
          <h2 className="text-lg font-semibold text-primary">{language === 'fa' ? 'ارسال بین‌المللی' : 'International Shipping'}</h2>
          <p>{t('info.internationalShipping', language)}</p>
          <h2 className="text-lg font-semibold text-primary">{language === 'fa' ? 'پیگیری سفارش' : 'Order Tracking'}</h2>
          <p>{t('info.orderTracking', language)}</p>
        </div>
      </div>
    </>
  );
}
