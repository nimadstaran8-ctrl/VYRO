import { SEO } from '../../components/ui/SEO';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';

export function Terms() {
  const language = useLanguageStore((state) => state.language);

  const content = {
    title: t('info.termsOfService', language),
    seoTitle: language === 'fa' ? 'شرایط استفاده' : 'Terms of Service',
    seoDescription: language === 'fa' ? 'شرایط استفاده وایرو. شرایط استفاده از وب‌سایت و خدمات ما.' : 'VYRO terms of service. Conditions for using our website and services.',
    intro: language === 'fa' 
      ? 'به وایرو خوش آمدید. با دسترسی یا استفاده از وب‌سایت ما، با این شرایط استفاده موافقت می‌کنید.'
      : 'Welcome to VYRO. By accessing or using our website, you agree to these terms of service.',
    ordersPayments: t('info.ordersPayments', language),
    ordersPaymentsDesc: language === 'fa' 
      ? 'همه سفارشات مشروط به موجودی و تأیید پرداخت هستند. قیمت‌ها به دلار آمریکا هستند و ممکن است بدون اطلاع تغییر کنند.'
      : 'All orders are subject to availability and confirmation of payment. Prices are listed in USD and may change without notice.',
    intellectualProperty: t('info.intellectualProperty', language),
    intellectualPropertyDesc: language === 'fa' 
      ? 'همه محتوای این وب‌سایت شامل تصاویر، لوگوها و متن متعلق به وایرو است و بدون اجازه قابل استفاده نیست.'
      : 'All content on this website, including images, logos, and text, is the property of VYRO and may not be used without permission.',
    limitationLiability: t('info.limitationLiability', language),
    limitationLiabilityDesc: language === 'fa' 
      ? 'وایرو مسئول هیچ خسارت غیرمستقیم، تصادفی یا ناشی از استفاده از وب‌سایت یا محصولات ما نیست.'
      : 'VYRO is not liable for any indirect, incidental, or consequential damages arising from the use of our website or products.',
  };

  return (
    <>
      <SEO
        title={content.seoTitle}
        description={content.seoDescription}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold uppercase tracking-wider text-primary md:text-4xl">{content.title}</h1>
        <div className="mt-8 space-y-6 text-text-secondary">
          <p>{content.intro}</p>
          <h2 className="text-lg font-semibold text-primary">{content.ordersPayments}</h2>
          <p>{content.ordersPaymentsDesc}</p>
          <h2 className="text-lg font-semibold text-primary">{content.intellectualProperty}</h2>
          <p>{content.intellectualPropertyDesc}</p>
          <h2 className="text-lg font-semibold text-primary">{content.limitationLiability}</h2>
          <p>{content.limitationLiabilityDesc}</p>
        </div>
      </div>
    </>
  );
}
