import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { SEO } from '../../components/ui/SEO';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Accordion } from '../../components/ui/Accordion';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const language = useLanguageStore((state) => state.language);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const faqItems = [
    {
      id: 'shipping-time',
      title: language === 'fa' ? 'ارسال چقدر طول می‌کشد؟' : 'How long does shipping take?',
      content: <p>{language === 'fa' ? 'ارسال استاندارد ۳ تا ۵ روز کاری طول می‌کشد. گزینه‌های سریع در صفحه پرداخت موجود است.' : 'Standard shipping takes 3–5 business days. Express options are available at checkout for faster delivery.'}</p>,
    },
    {
      id: 'returns',
      title: language === 'fa' ? 'سیاست مرجوعی شما چیست؟' : 'What is your return policy?',
      content: <p>{language === 'fa' ? 'ما ۳۰ روز مرجوعی آسان ارائه می‌دهیم. محصولات باید استفاده نشده با برچسب‌های اصلی باشند.' : 'We offer 30-day hassle-free returns. Items must be unworn with original tags attached.'}</p>,
    },
    {
      id: 'international',
      title: language === 'fa' ? 'آیا به صورت بین‌المللی ارسال می‌کنید؟' : 'Do you ship internationally?',
      content: <p>{language === 'fa' ? 'بله، به اکثر کشورها ارسال می‌کنیم. هزینه و زمان ارسال بین‌المللی در صفحه پرداخت محاسبه می‌شود.' : 'Yes, we ship to most countries. International shipping rates and delivery times are calculated at checkout.'}</p>,
    },
  ];

  return (
    <>
      <SEO
        title={t('nav.contact', language)}
        description="Get in touch with VYRO. Questions, feedback, or support — we're here to help."
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-semibold uppercase tracking-wider text-primary md:text-4xl">{t('info.contactUs', language)}</h1>
          <p className="mx-auto mt-4 max-w-lg text-text-secondary">
            {t('info.contactDesc', language)}
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 md:p-10">
            {submitted ? (
              <div className="py-12 text-center">
                <h2 className="text-xl font-semibold text-primary">{language === 'fa' ? 'پیام ارسال شد' : 'Message Sent'}</h2>
                <p className="mt-2 text-text-secondary">{language === 'fa' ? 'ممنون از تماس شما. به زودی پاسخ می‌دهیم.' : 'Thanks for reaching out. We\'ll get back to you soon.'}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input label={t('info.name', language)} required />
                <Input label={t('checkout.email', language)} type="email" required />
                <Input label={t('contact.subject', language) || 'Subject'} required />
                <Textarea label={t('contact.message', language) || 'Message'} rows={5} required />
                <Button type="submit" className="w-full">
                  {t('info.sendMessage', language)}
                </Button>
              </form>
            )}
          </div>

          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 text-center">
                <Mail size={20} className="mx-auto text-accent" />
                <p className="mt-3 text-sm font-medium text-primary">hello@vyro.com</p>
              </div>
              <div className="rounded-2xl bg-white p-5 text-center">
                <Phone size={20} className="mx-auto text-accent" />
                <p className="mt-3 text-sm font-medium text-primary">+1 234 567 890</p>
              </div>
              <div className="rounded-2xl bg-white p-5 text-center">
                <MapPin size={20} className="mx-auto text-accent" />
                <p className="mt-3 text-sm font-medium text-primary">New York, NY</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-primary">{t('nav.faq', language)}</h2>
              <Accordion items={faqItems} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
