import { SEO } from '../../components/ui/SEO';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';

export function Privacy() {
  const language = useLanguageStore((state) => state.language);

  const content = {
    title: t('info.privacyPolicy', language),
    seoTitle: language === 'fa' ? 'سیاست حریم خصوصی' : 'Privacy Policy',
    seoDescription: language === 'fa' ? 'سیاست حریم خصوصی وایرو. بیاموزید چگونه از داده‌های شما محافظت می‌کنیم.' : 'VYRO privacy policy. Learn how we protect your data.',
    intro: language === 'fa' 
      ? 'در وایرو، ما به حریم خصوصی شما احترام می‌گذاریم و متعهد به محافظت از اطلاعات شخصی شما هستیم.'
      : 'At VYRO, we respect your privacy and are committed to protecting your personal information.',
    infoWeCollect: t('info.infoWeCollect', language),
    infoWeCollectDesc: language === 'fa' 
      ? 'اطلاعاتی که هنگام ایجاد حساب، ثبت سفارش یا تماس با ما ارائه می‌دهید جمع‌آوری می‌شود. این ممکن است شامل نام، ایمیل، آدرس ارسال و جزئیات پرداخت باشد.'
      : 'We collect information you provide when creating an account, placing an order, or contacting us. This may include your name, email, shipping address, and payment details.',
    howWeUse: t('info.howWeUse', language),
    howWeUseDesc: language === 'fa' 
      ? 'از اطلاعات شما برای پردازش سفارشات، ارتباط با شما و بهبود خدمات استفاده می‌کنیم.'
      : 'We use your information to process orders, communicate with you, improve our services, and send promotional emails if you opt in.',
    dataSecurity: t('info.dataSecurity', language),
    dataSecurityDesc: language === 'fa' 
      ? 'ما تدابیر امنیتی استاندارد صنعت را برای محافظت از داده‌های شما اجرا می‌کنیم. اطلاعات پرداخت به صورت امن توسط ارائه‌دهندگان پرداخت پردازش می‌شود.'
      : 'We implement industry-standard security measures to protect your data. Payment information is processed securely by our payment providers.',
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
          <h2 className="text-lg font-semibold text-primary">{content.infoWeCollect}</h2>
          <p>{content.infoWeCollectDesc}</p>
          <h2 className="text-lg font-semibold text-primary">{content.howWeUse}</h2>
          <p>{content.howWeUseDesc}</p>
          <h2 className="text-lg font-semibold text-primary">{content.dataSecurity}</h2>
          <p>{content.dataSecurityDesc}</p>
        </div>
      </div>
    </>
  );
}
