import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';

const footerLinks = (lang: string) => [
  { label: t('nav.shop', lang as 'fa' | 'en'), href: '/shop' },
  { label: t('nav.about', lang as 'fa' | 'en'), href: '/about' },
  { label: t('nav.contact', lang as 'fa' | 'en'), href: '/contact' },
  { label: t('nav.faq', lang as 'fa' | 'en'), href: '/faq' },
  { label: t('nav.shipping', lang as 'fa' | 'en'), href: '/shipping' },
  { label: t('nav.returns', lang as 'fa' | 'en'), href: '/returns' },
  { label: t('nav.privacy', lang as 'fa' | 'en'), href: '/privacy' },
  { label: t('nav.terms', lang as 'fa' | 'en'), href: '/terms' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const language = useLanguageStore((state) => state.language);
  const links = footerLinks(language);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`با تشکر از عضویت شما با ${email}!`);
    setEmail('');
  };

  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="text-3xl font-bold tracking-tight">
              VYRO
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              {language === 'fa' 
                ? 'استایل خود را پیدا کنید. کلاه و عینک‌های ممتاز برای افرادی که استایل را بخشی از هویت خود می‌دانند.'
                : 'Find Your Vibe. Premium hats and sunglasses designed for individuals who see style as part of their identity.'}
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white/10 p-2 transition-colors hover:bg-accent hover:text-primary"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white/10 p-2 transition-colors hover:bg-accent hover:text-primary"
                aria-label="TikTok"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a
                href="https://telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white/10 p-2 transition-colors hover:bg-accent hover:text-primary"
                aria-label="Telegram"
              >
                <Send size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">{t('nav.quickLinks', language)}</h3>
            <ul className="mt-4 space-y-2">
              {links.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">{t('nav.support', language)}</h3>
            <ul className="mt-4 space-y-2">
              {links.slice(4).map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">{t('nav.newsletter', language)}</h3>
            <p className="mt-4 text-sm text-white/70">{language === 'fa' ? '۱۰٪ تخفیف اولین سفارش شما.' : 'Get 10% off your first order.'}</p>
            <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'fa' ? 'ایمیل خود را وارد کنید' : 'Enter your email'}
                required
                className="flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/50 focus:border-accent focus:outline-none"
              />
              <Button type="submit" variant="accent" size="sm">
                {t('common.subscribe', language)}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} VYRO. {language === 'fa' ? 'تمام حقوق محفوظ است.' : 'All rights reserved.'}
          </p>
          <p className="text-xs text-white/50">{language === 'fa' ? 'طراحی شده برای استایل. ساخته شده برای شما.' : 'Designed for style. Built for you.'}</p>
        </div>
      </div>
    </footer>
  );
}
