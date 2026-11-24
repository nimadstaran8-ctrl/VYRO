import { Link } from 'react-router-dom';
import { Phone, Send } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';
import { getSocialSettings, normalizeFooterPhone } from '../../services/settings';

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

function isValidExternalUrl(value: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

interface SocialLinkProps {
  url: string;
  label: string;
  children: ReactNode;
  phone?: boolean;
}

function SocialLink({ url, label, children, phone = false }: SocialLinkProps) {
  const number = phone ? normalizeFooterPhone(url) : null;
  const href = phone ? (number ? `tel:${number}` : null) : (isValidExternalUrl(url) ? url : null);

  if (!href) {
    return (
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/40"
        aria-label={label}
        title={phone ? label : `${label} URL is not configured`}
      >
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      target={phone ? undefined : '_blank'}
      rel={phone ? undefined : 'noopener noreferrer'}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-accent hover:text-on-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary dark:focus-visible:ring-offset-surface"
      aria-label={label}
    >
      {children}
    </a>
  );
}

export function Footer() {
  const language = useLanguageStore((state) => state.language);
  const links = footerLinks(language);
  const social = getSocialSettings();

  return (
    <footer className="bg-primary text-white dark:bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="inline-block rounded-sm text-3xl font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary dark:focus-visible:ring-offset-surface"
            >
              VYRO
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              {language === 'fa'
                ? 'استایل خود را پیدا کنید. کلاه و عینک‌های ممتاز برای افرادی که استایل را بخشی از هویت خود می‌دانند.'
                : 'Find Your Vibe. Premium hats and sunglasses designed for individuals who see style as part of their identity.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <SocialLink url={social.instagram} label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </SocialLink>
              <SocialLink url={social.tiktok} label="TikTok">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </SocialLink>
              <SocialLink url={social.telegram} label="Telegram">
                <Send size={18} />
              </SocialLink>
              <SocialLink url={social.phone} label={language === 'fa' ? 'تماس تلفنی' : 'Phone call'} phone>
                <Phone size={18} aria-hidden="true" />
              </SocialLink>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">{t('nav.quickLinks', language)}</h3>
            <ul className="mt-4 space-y-2">
              {links.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="inline-block rounded-sm text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary dark:focus-visible:ring-offset-surface"
                  >
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
                  <Link
                    to={link.href}
                    className="inline-block rounded-sm text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary dark:focus-visible:ring-offset-surface"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} VYRO. {language === 'fa' ? 'تمام حقوق محفوظ است.' : 'All rights reserved.'}
          </p>
          <p className="text-xs text-white/70">{language === 'fa' ? 'سازنده: نیمادستاران' : 'Creator: Nima Dastaran'}</p>
        </div>
      </div>
    </footer>
  );
}
