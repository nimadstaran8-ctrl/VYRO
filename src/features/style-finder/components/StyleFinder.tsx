import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStyleFinderStore } from '../store/styleFinderStore';
import type { Budget, ShoppingFor } from '../store/styleFinderStore';
import { getProductById } from '../../../services/catalog/productService';
import { Button } from '../../../components/ui/Button';
import { RecommendationCard } from '../../../components/product/RecommendationCard';
import { useLanguageStore } from '../../../stores/languageStore';
import { t } from '../../../lib/i18n';
import type { Color, Style } from '../../../types';

const styles = (lang: string): { value: Style; label: string }[] => [
  { value: 'Street', label: lang === 'fa' ? 'خیابانی' : 'Street' },
  { value: 'Minimal', label: lang === 'fa' ? 'مینیمال' : 'Minimal' },
  { value: 'Classic', label: lang === 'fa' ? 'کلاسیک' : 'Classic' },
  { value: 'Sport', label: lang === 'fa' ? 'ورزشی' : 'Sport' },
  { value: 'Luxury', label: lang === 'fa' ? 'لوکس' : 'Luxury' },
  { value: 'Casual', label: lang === 'fa' ? 'کژوال' : 'Casual' },
];

const shoppingForOptions = (lang: string): { value: ShoppingFor; label: string }[] => [
  { value: 'hat', label: t('styleFinder.hat', lang as 'fa' | 'en') },
  { value: 'glasses', label: t('styleFinder.glasses', lang as 'fa' | 'en') },
  { value: 'both', label: t('styleFinder.both', lang as 'fa' | 'en') },
];

const colors = (lang: string): { value: Color; label: string }[] => [
  { value: 'Black', label: lang === 'fa' ? 'مشکی' : 'Black' },
  { value: 'White', label: lang === 'fa' ? 'سفید' : 'White' },
  { value: 'Brown', label: lang === 'fa' ? 'قهوه‌ای' : 'Brown' },
  { value: 'Beige', label: lang === 'fa' ? 'بژ' : 'Beige' },
  { value: 'Green', label: lang === 'fa' ? 'سبز' : 'Green' },
  { value: 'Blue', label: lang === 'fa' ? 'آبی' : 'Blue' },
];

const budgets = (lang: string): { value: Budget; label: string }[] => [
  { value: 'under-30', label: lang === 'fa' ? 'زیر ۳۰ دلار' : 'Under $30' },
  { value: '30-60', label: lang === 'fa' ? '۳۰ تا ۶۰ دلار' : '$30–$60' },
  { value: '60-100', label: lang === 'fa' ? '۶۰ تا ۱۰۰ دلار' : '$60–$100' },
  { value: '100-plus', label: lang === 'fa' ? 'بالای ۱۰۰ دلار' : '$100+' },
];

const stepTitles = (lang: string) => [
  t('styleFinder.yourStyle', lang as 'fa' | 'en'),
  t('styleFinder.whatShoppingFor', lang as 'fa' | 'en'),
  t('styleFinder.chooseColors', lang as 'fa' | 'en'),
  t('styleFinder.yourBudget', lang as 'fa' | 'en'),
];

export function StyleFinder() {
  const {
    answers,
    step,
    results,
    setStyle,
    setShoppingFor,
    toggleColor,
    setBudget,
    nextStep,
    prevStep,
    reset,
    findMatches,
  } = useStyleFinderStore();

  const language = useLanguageStore((state) => state.language);
  const currentStyles = styles(language);
  const currentShoppingFor = shoppingForOptions(language);
  const currentColors = colors(language);
  const currentBudgets = budgets(language);
  const currentStepTitles = stepTitles(language);

  const handleNext = () => {
    if (step === 3) {
      findMatches();
      nextStep();
    } else {
      nextStep();
    }
  };

  const topMatch = results[0] ? getProductById(results[0]) : null;

  const handleReset = () => {
    reset();
  };

  const canProceed =
    (step === 0 && answers.style) ||
    (step === 1 && answers.shoppingFor) ||
    (step === 2 && answers.colors.length > 0) ||
    (step === 3 && answers.budget);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm md:p-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-border'}`}
            />
          ))}
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          {t('common.step', language)} {step + 1} {t('common.of', language)} 4
        </span>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <Step key="step0" title={currentStepTitles[0]}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {currentStyles.map((s) => (
                <OptionCard
                  key={s.value}
                  label={s.label}
                  selected={answers.style === s.value}
                  onClick={() => setStyle(s.value)}
                />
              ))}
            </div>
          </Step>
        )}

        {step === 1 && (
          <Step key="step1" title={currentStepTitles[1]}>
            <div className="grid grid-cols-3 gap-3">
              {currentShoppingFor.map((opt) => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  selected={answers.shoppingFor === opt.value}
                  onClick={() => setShoppingFor(opt.value)}
                />
              ))}
            </div>
          </Step>
        )}

        {step === 2 && (
          <Step key="step2" title={currentStepTitles[2]}>
            <p className="mb-4 text-sm text-text-secondary">{t('styleFinder.selectOneOrMore', language)}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {currentColors.map((c) => (
                <OptionCard
                  key={c.value}
                  label={c.label}
                  selected={answers.colors.includes(c.value)}
                  onClick={() => toggleColor(c.value)}
                />
              ))}
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step key="step3" title={currentStepTitles[3]}>
            <div className="grid grid-cols-2 gap-3">
              {currentBudgets.map((b) => (
                <OptionCard
                  key={b.value}
                  label={b.label}
                  selected={answers.budget === b.value}
                  onClick={() => setBudget(b.value)}
                />
              ))}
            </div>
          </Step>
        )}

        {step === 4 && topMatch && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="text-center"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">{t('styleFinder.yourMatch', language)}</p>
            <h3 className="mb-6 text-2xl font-semibold text-primary">{t('styleFinder.weFoundYourVibe', language)}</h3>

            <div className="mx-auto max-w-xs">
              <RecommendationCard product={topMatch} matchScore={96} />
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary"
            >
              <RefreshCw size={16} />
              {t('styleFinder.startOver', language)}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {step < 4 && (
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-background disabled:opacity-40"
          >
            <ArrowLeft size={16} className="rtl:rotate-180" />
            {t('common.back', language)}
          </button>
          <Button onClick={handleNext} disabled={!canProceed}>
            {step === 3 ? t('styleFinder.findMyMatch', language) : t('common.next', language)}
            {step !== 3 && <ArrowRight size={16} className="ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />}
          </Button>
        </div>
      )}
    </div>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
    >
      <h3 className="mb-6 text-xl font-semibold text-primary md:text-2xl">{title}</h3>
      {children}
    </motion.div>
  );
}

function OptionCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-5 text-sm font-medium transition-all ${
        selected
          ? 'border-primary bg-primary text-white'
          : 'border-border bg-white text-primary hover:border-primary'
      }`}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}
