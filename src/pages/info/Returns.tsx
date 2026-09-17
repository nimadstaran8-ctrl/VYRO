import { SEO } from '../../components/ui/SEO';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';

export function Returns() {
  const language = useLanguageStore((state) => state.language);

  const content = {
    title: t('info.returnsPolicy', language),
    seoTitle: language === 'fa' ? 'مرجوعی' : 'Returns',
    seoDescription: language === 'fa' ? 'سیاست مرجوعی وایرو. مرجوعی آسان تا ۳۰ روز.' : 'VYRO return policy. Hassle-free returns within 30 days.',
    intro: language === 'fa' 
      ? 'ما می‌خواهیم شما از محصولات وایرو لذت ببرید. اگر کاملاً راضی نیستید، تا ۳۰ روز پس از تحویل مرجوعی آسان ارائه می‌دهیم.'
      : 'We want you to love your VYRO pieces. If you\'re not completely satisfied, we offer hassle-free returns within 30 days of delivery.',
    returnConditions: language === 'fa' ? 'شرایط مرجوعی' : 'Return Conditions',
    condition1: language === 'fa' ? 'محصولات باید استفاده نشده و در وضعیت اصلی باشند' : 'Items must be unworn and in original condition',
    condition2: language === 'fa' ? 'برچسب‌های اصلی باید متصل باشند' : 'Original tags must be attached',
    condition3: language === 'fa' ? 'هزینه ارسال برای محصولات معیوب یا نادرست رایگان است' : 'Return shipping is free for defective or incorrect items',
    howToReturn: language === 'fa' ? 'نحوه مرجوعی' : 'How to Return',
    howToReturnDesc: language === 'fa' 
      ? 'از داشبورد حساب کاربری یا با تماس با تیم پشتیبانی، مرجوعی را شروع کنید. در صورت امکان برچسب مرجوعی از پیش پرداخت شده برای شما ارسال می‌کنیم.'
      : 'Start a return from your account dashboard or contact our support team. We\'ll send you a prepaid return label where applicable.',
    refunds: language === 'fa' ? 'بازپرداخت' : 'Refunds',
    refundsDesc: language === 'fa' 
      ? 'بازپرداخت ظرف ۵ تا ۷ روز کاری پس از دریافت محصولات مرجوعی پردازش می‌شود.'
      : 'Refunds are processed within 5–7 business days after we receive your returned items.',
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
          <h2 className="text-lg font-semibold text-primary">{content.returnConditions}</h2>
          <ul className="list-disc ps-5">
            <li>{content.condition1}</li>
            <li>{content.condition2}</li>
            <li>{content.condition3}</li>
          </ul>
          <h2 className="text-lg font-semibold text-primary">{content.howToReturn}</h2>
          <p>{content.howToReturnDesc}</p>
          <h2 className="text-lg font-semibold text-primary">{content.refunds}</h2>
          <p>{content.refundsDesc}</p>
        </div>
      </div>
    </>
  );
}
