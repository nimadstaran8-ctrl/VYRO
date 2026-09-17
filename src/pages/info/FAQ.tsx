import { SEO } from '../../components/ui/SEO';
import { Accordion } from '../../components/ui/Accordion';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';

export function FAQ() {
  const language = useLanguageStore((state) => state.language);

  const faqItems = [
    {
      id: 'order-tracking',
      title: language === 'fa' ? 'چگونه می‌توانم سفارش خود را پیگیری کنم؟' : 'How can I track my order?',
      content: <p>{language === 'fa' ? 'پس از ارسال سفارش، ایمیلی با لینک پیگیری دریافت خواهید کرد. همچنین می‌توانید وضعیت سفارش را در حساب کاربری خود مشاهده کنید.' : 'Once your order ships, you will receive an email with a tracking link. You can also view order status in your account.'}</p>,
    },
    {
      id: 'shipping',
      title: language === 'fa' ? 'گزینه‌های ارسال چیست؟' : 'What are the shipping options?',
      content: <p>{language === 'fa' ? 'ما ارسال استاندارد (۳ تا ۵ روز کاری) و ارسال سریع (۱ تا ۲ روز کاری) ارائه می‌دهیم. ارسال استاندارد رایگان برای سفارشات بالای ۷۵ دلار.' : 'We offer standard shipping (3–5 business days) and express shipping (1–2 business days). Free standard shipping on orders over $75.'}</p>,
    },
    {
      id: 'returns',
      title: language === 'fa' ? 'مرجوعی چگونه کار می‌کند؟' : 'How do returns work?',
      content: <p>{language === 'fa' ? 'می‌توانید محصولات استفاده نشده را تا ۳۰ روز پس از تحویل مرجوع کنید. از داشبورد حساب یا با تماس با تیم پشتیبانی، مرجوعی را شروع کنید.' : 'You can return unworn items within 30 days of delivery. Start a return from your account or contact our support team.'}</p>,
    },
    {
      id: 'sizing',
      title: language === 'fa' ? 'سایز خود را چگونه پیدا کنم؟' : 'How do I find my size?',
      content: <p>{language === 'fa' ? 'اکثر کلاه‌ها و عینک‌های ما یک سایز یا قابل تنظیم هستند. صفحات محصول شامل جزئیات سایز و نکات تناسب هستند.' : 'Most of our hats and glasses are one-size or adjustable. Product pages include specific sizing details and fit notes.'}</p>,
    },
    {
      id: 'payment',
      title: language === 'fa' ? 'چه روش‌های پرداختی را می‌پذیرید؟' : 'What payment methods do you accept?',
      content: <p>{language === 'fa' ? 'ما تمام کارت‌های اعتباری اصلی، PayPal، Apple Pay و Google Pay را می‌پذیریم.' : 'We accept all major credit cards, PayPal, Apple Pay, and Google Pay.'}</p>,
    },
    {
      id: 'international',
      title: language === 'fa' ? 'آیا به صورت بین‌المللی ارسال می‌کنید؟' : 'Do you ship internationally?',
      content: <p>{language === 'fa' ? 'بله، به سراسر جهان ارسال می‌کنیم. هزینه و زمان ارسال بین‌المللی در صفحه پرداخت محاسبه می‌شود.' : 'Yes, we ship worldwide. International shipping costs and delivery times are calculated at checkout.'}</p>,
    },
  ];

  return (
    <>
      <SEO
        title={t('nav.faq', language)}
        description="Find answers to frequently asked questions about VYRO orders, shipping, returns, and products."
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-semibold uppercase tracking-wider text-primary md:text-4xl">{t('info.faq', language)}</h1>
          <p className="mt-4 text-text-secondary">{t('info.faqDesc', language)}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 md:p-10">
          <Accordion items={faqItems} />
        </div>
      </div>
    </>
  );
}
