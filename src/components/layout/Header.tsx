import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Heart, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { SearchModal } from '../search/SearchModal';
import { LanguageSwitcher } from '../../features/language/components/LanguageSwitcher';
import { useLanguageStore } from '../../stores/languageStore';
import { cn } from '../../lib/utils';
import { t } from '../../lib/i18n';

const navLinks = [
  { label: 'nav.shop', href: '/shop' },
  { label: 'nav.hats', href: '/hats' },
  { label: 'nav.glasses', href: '/glasses' },
  { label: 'nav.styleFinder', href: '/style-finder' },
];

export function Header() {
  const { isScrolled } = useScrollPosition();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { toggleCart, getTotalItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const location = useLocation();
  const language = useLanguageStore((state) => state.language);

  useLockBodyScroll(mobileMenuOpen);

  const cartCount = getTotalItems();

  return (
    <>
      <header
        className={cn(
          'fixed left-0 right-0 top-0 z-40 transition-all duration-300',
          isScrolled ? 'bg-background/95 py-3 shadow-sm backdrop-blur-md' : 'bg-transparent py-5'
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-full p-2 text-primary hover:bg-black/5 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link to="/" className="text-2xl font-bold tracking-tight text-primary md:text-3xl">
            VYRO
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'relative text-sm font-medium text-primary transition-colors hover:text-text-secondary',
                  location.pathname === link.href && 'text-primary'
                )}
              >
                {t(link.label, language)}
                {location.pathname === link.href && (
                  <motion.span
                    layoutId="header-underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-full p-2 text-primary hover:bg-black/5"
              aria-label={t('nav.search', language)}
            >
              <Search size={20} />
            </button>
            <LanguageSwitcher />
            <Link
              to="/wishlist"
              className="relative hidden rounded-full p-2 text-primary hover:bg-black/5 sm:block"
              aria-label={t('nav.wishlist', language)}
            >
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-primary">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={toggleCart}
              className="relative rounded-full p-2 text-primary hover:bg-black/5"
              aria-label={t('nav.cart', language)}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-primary">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: language === 'fa' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: language === 'fa' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 start-0 z-50 w-full max-w-sm bg-background shadow-2xl lg:hidden rtl:origin-right"
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-primary">
                  VYRO
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full p-2 text-primary hover:bg-black/5"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>
              <nav className="flex flex-col p-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="border-b border-border py-4 text-lg font-medium text-primary transition-colors hover:text-text-secondary"
                  >
                    {t(link.label, language)}
                  </Link>
                ))}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 border-t border-border p-6">
                <div className="flex items-center justify-around">
                  <Link
                    to="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col items-center gap-1 text-sm text-primary"
                  >
                    <Heart size={20} />
                    {t('nav.wishlist', language)}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      toggleCart();
                    }}
                    className="flex flex-col items-center gap-1 text-sm text-primary"
                  >
                    <ShoppingBag size={20} />
                    {t('nav.cart', language)}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
