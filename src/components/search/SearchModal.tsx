import { Search, X, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { searchProducts } from '../../services/catalog/productService';
import { truncate } from '../../lib/text';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';
import type { Product } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FALLBACK_IMAGE = '/images/site/fallback.svg';

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const language = useLanguageStore((state) => state.language);
  useLockBodyScroll(isOpen);

  const handleImageError = (productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => setQuery(''), 0);
      const focusTimeout = setTimeout(() => inputRef.current?.focus(), 50);
      return () => {
        clearTimeout(timeout);
        clearTimeout(focusTimeout);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const lowerQuery = query.trim().toLowerCase();

  const matchedProducts: Product[] = lowerQuery
    ? searchProducts(query)
    : [];

  const suggestions = lowerQuery
    ? [`${lowerQuery} cap`, `${lowerQuery} glasses`].slice(0, 2)
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-center bg-black/40 p-4 pt-24"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-fit w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-4">
              <Search size={20} className="text-text-secondary" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search.searchPlaceholder', language)}
                className="flex-1 bg-transparent text-lg text-primary placeholder:text-text-secondary/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-text-secondary hover:bg-background"
                aria-label={t('common.close', language)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              {!lowerQuery && (
                <div className="space-y-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {t('search.popularSearches', language)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['black cap', 'aviator', 'bucket hat', 'minimal'].map((term) => (
                      <Link
                        key={term}
                        to={`/search?q=${encodeURIComponent(term)}`}
                        onClick={onClose}
                        className="rounded-full border border-border px-4 py-2 text-sm text-primary transition-colors hover:bg-background"
                      >
                        {term}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {lowerQuery && (
                <div className="space-y-6">
                  {suggestions.length > 0 && (
                    <div>
                      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
                        {t('search.suggestions', language)}
                      </p>
                      <div className="space-y-1">
                        {suggestions.map((s) => (
                          <Link
                            key={s}
                            to={`/search?q=${encodeURIComponent(s)}`}
                            onClick={onClose}
                            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-primary hover:bg-background"
                          >
                            <span className="capitalize">{s}</span>
                            <ArrowRight size={14} className="text-text-secondary rtl:rotate-180" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchedProducts.length > 0 && (
                    <div>
                      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
                        {t('search.products', language)}
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {matchedProducts.slice(0, 4).map((product) => (
                          <Link
                            key={product.id}
                            to={`/product/${product.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-xl bg-background p-2 transition-colors hover:bg-black/5"
                          >
                            <img
                              src={imageErrors[product.id] ? FALLBACK_IMAGE : (product.primaryImage || product.images[0])}
                              alt={product.name}
                              className="h-14 w-14 rounded-lg object-cover"
                              loading="lazy"
                              onError={() => handleImageError(product.id)}
                            />
                            <div>
                              <p className="text-sm font-medium text-primary">{product.name}</p>
                              <p className="text-xs text-text-secondary">
                                {truncate(product.description, 30)}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchedProducts.length === 0 && (
                    <div className="py-8 text-center text-text-secondary">
                      {language === 'fa' 
                        ? `نتیجه‌ای برای "${query}" یافت نشد. جستجوی دیگری امتحان کنید.`
                        : `No results for "${query}". Try a different search term.`}
                    </div>
                  )}
                </div>
              )}
            </div>

            {lowerQuery && matchedProducts.length > 0 && (
              <div className="border-t border-border p-4">
                <Link
                  to={`/search?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-white hover:bg-primary/90"
                >
                  {t('search.viewAllResults', language)} "{query}"
                  <ArrowRight size={16} className="rtl:rotate-180" />
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
