import { useEffect, useRef, useSyncExternalStore } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStyleFinderStore } from '../store/styleFinderStore';
import type { Budget, Occasion, ShoppingFor } from '../types';
import { getProductById } from '../../../services/catalog/productService';
import { getAIStylistSettings } from '../../../services/settings/settingsService';
import { Button } from '../../../components/ui/Button';
import { AIStylistRecommendationCard } from './AIStylistRecommendationCard';
import { OutfitSetCard } from './OutfitSetCard';
import { useLanguageStore } from '../../../stores/languageStore';
import { t } from '../../../lib/i18n';
import { getBudgetRange, getRelaxationHintMessage } from '../services/recommendationEngine';
import type { StyleFinderAnswers } from '../types';
import { calculateRialFromUsd } from '../../../config/currency';
import { getUsdToTomanRate, subscribeToCurrency } from '../../../services/currency';
import { STYLES, COLORS } from '../../../constants/product';
import type { Color, Style } from '../../../types';

const styleLabels = (lang: 'fa' | 'en'): Record<Style, string> => ({
  Street: lang === 'fa' ? 'خیابانی' : 'Streetwear',
  Minimal: lang === 'fa' ? 'مینیمال' : 'Minimal',
  Classic: lang === 'fa' ? 'کلاسیک' : 'Classic',
  Sport: lang === 'fa' ? 'ورزشی' : 'Sporty',
  Luxury: lang === 'fa' ? 'لوکس' : 'Luxury',
  Casual: lang === 'fa' ? 'کژوال' : 'Casual',
});

const shoppingForOptions = (lang: 'fa' | 'en'): { value: ShoppingFor; label: string }[] => [
  { value: 'hat', label: t('styleFinder.hat', lang) },
  { value: 'glasses', label: t('styleFinder.glasses', lang) },
  { value: 'both', label: t('styleFinder.both', lang) },
];

const colorLabels = (lang: 'fa' | 'en'): Record<Color, string> => ({
  Black: lang === 'fa' ? 'مشکی' : 'Black',
  White: lang === 'fa' ? 'سفید' : 'White',
  Brown: lang === 'fa' ? 'قهوه‌ای' : 'Brown',
  Beige: lang === 'fa' ? 'بژ' : 'Beige',
  Green: lang === 'fa' ? 'سبز' : 'Green',
  Blue: lang === 'fa' ? 'آبی' : 'Blue',
  Gold: lang === 'fa' ? 'طلایی' : 'Gold',
});

const budgetOptions: Budget[] = ['under-30', '30-60', '60-100', '100-plus'];

function formatBudget(budget: Budget, language: 'fa' | 'en', rate: number): string {
  const [min, max] = getBudgetRange(budget);
  const numberFormat = new Intl.NumberFormat(language === 'fa' ? 'fa-IR' : 'en-US');
  const rial = (usd: number) => numberFormat.format(calculateRialFromUsd(usd, rate));

  if (budget === 'under-30') {
    return language === 'fa' ? `زیر ${rial(max)} ریال` : `Under ${rial(max)} IRR`;
  }
  if (budget === '100-plus') {
    return language === 'fa' ? `${rial(min)} ریال و بیشتر` : `${rial(min)} IRR and above`;
  }
  return language === 'fa' ? `${rial(min)} تا ${rial(max)} ریال` : `${rial(min)}–${rial(max)} IRR`;
}

const occasions = (lang: 'fa' | 'en'): { value: Occasion; label: string }[] => [
  { value: 'everyday', label: lang === 'fa' ? 'روزمره' : 'Everyday' },
  { value: 'travel', label: lang === 'fa' ? 'سفر' : 'Travel' },
  { value: 'outdoor', label: lang === 'fa' ? 'فضای باز' : 'Outdoor' },
  { value: 'special', label: lang === 'fa' ? 'مناسبت خاص' : 'Special Occasions' },
];

const STEP_COUNT = 5;

export function StyleFinder() {
  const {
    answers,
    step,
    results,
    outfits,
    relaxationHints,
    setStyle,
    setShoppingFor,
    toggleColor,
    setBudget,
    setOccasion,
    nextStep,
    prevStep,
    reset,
    findMatches,
    goToStep,
  } = useStyleFinderStore();

  const language = useLanguageStore((state) => state.language);
  const rate = useSyncExternalStore(subscribeToCurrency, getUsdToTomanRate, getUsdToTomanRate);
  const aiSettings = getAIStylistSettings();

  const isAdvancingRef = useRef(false);

  useEffect(() => {
    isAdvancingRef.current = false;
  }, [step]);

  if (!aiSettings.enabled) {
    return <DisabledState language={language} />;
  }

  function handleSingleSelect<T>(setter: (value: T) => void, value: T) {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;
    setter(value);
    if (step === STEP_COUNT - 1) {
      findMatches();
    }
    goToStep(step + 1);
  }

  const handleNext = () => {
    if (step === STEP_COUNT - 1) {
      findMatches();
      nextStep();
    } else {
      nextStep();
    }
  };

  const handleReset = () => {
    reset();
  };

  const canProceed =
    (step === 0 && answers.style) ||
    (step === 1 && answers.shoppingFor) ||
    (step === 2) ||
    (step === 3) ||
    (step === 4 && answers.budget);

  const stepTitles = [
    t('aiStylist.yourStyle', language),
    t('aiStylist.whatShoppingFor', language),
    t('aiStylist.chooseColors', language),
    t('aiStylist.chooseOccasion', language),
    t('aiStylist.yourBudget', language),
  ];

  const visibleStyles = STYLES.filter((s) => aiSettings.enabledStyles.includes(s.value));

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-border bg-[url('/images/find-your-vibe-bg.png')] bg-cover bg-center bg-no-repeat p-6 shadow-2xl shadow-cyan-900/10 md:p-10 dark:border-white/10"
    >
      <div className="pointer-events-none absolute -end-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -start-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-white/80 dark:bg-black/80" />

      <div className="relative z-10 mb-8 flex items-center justify-between">
        <div className="flex gap-1.5">
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => step > i && goToStep(i)}
              disabled={step <= i}
              className={`h-1.5 rounded-full transition-all ${
                i <= step
                  ? 'w-10 bg-cyan-400'
                  : 'w-6 bg-border dark:bg-white/10'
              } ${step > i ? 'cursor-pointer hover:bg-cyan-300' : ''}`}
              aria-label={`${t('common.step', language)} ${i + 1}`}
            />
          ))}
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          {t('common.step', language)} {step + 1} {t('common.of', language)} {STEP_COUNT}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <Step key="step0" title={stepTitles[0]} subtitle={t('aiStylist.styleSubtitle', language)}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {visibleStyles.map((s) => (
                <OptionCard
                  key={s.value}
                  label={styleLabels(language)[s.value]}
                  selected={answers.style === s.value}
                  onClick={() => handleSingleSelect(setStyle, s.value)}
                />
              ))}
            </div>
          </Step>
        )}

        {step === 1 && (
          <Step key="step1" title={stepTitles[1]} subtitle={t('aiStylist.shoppingForSubtitle', language)}>
            <div className="grid grid-cols-3 gap-3">
              {shoppingForOptions(language).map((opt) => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  selected={answers.shoppingFor === opt.value}
                  onClick={() => handleSingleSelect(setShoppingFor, opt.value)}
                />
              ))}
            </div>
          </Step>
        )}

        {step === 2 && (
          <Step key="step2" title={stepTitles[2]} subtitle={t('aiStylist.colorsSubtitle', language)}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {COLORS.map((c) => (
                <OptionCard
                  key={c.value}
                  label={colorLabels(language)[c.value]}
                  selected={answers.colors.includes(c.value)}
                  onClick={() => toggleColor(c.value)}
                />
              ))}
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step key="step3" title={stepTitles[3]} subtitle={t('aiStylist.occasionSubtitle', language)}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {occasions(language).map((o) => (
                <OptionCard
                  key={o.value}
                  label={o.label}
                  selected={answers.occasion === o.value}
                  onClick={() => handleSingleSelect(setOccasion, o.value)}
                />
              ))}
            </div>
          </Step>
        )}

        {step === 4 && (
          <Step key="step4" title={stepTitles[4]} subtitle={t('aiStylist.budgetSubtitle', language)}>
            <div className="grid grid-cols-2 gap-3">
              {budgetOptions.map((budget) => (
                <OptionCard
                  key={budget}
                  label={formatBudget(budget, language, rate)}
                  selected={answers.budget === budget}
                  onClick={() => handleSingleSelect(setBudget, budget)}
                />
              ))}
            </div>
          </Step>
        )}

        {step === 5 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="relative z-10"
          >
            <ResultsHeader
              answers={answers}
              language={language}
              budgetLabel={answers.budget ? formatBudget(answers.budget, language, rate) : undefined}
            />

            {relaxationHints.length > 0 && (
              <div className="mb-6 rounded-xl border border-amber-400/20 bg-amber-950/20 p-4">
                <p className="text-sm font-medium text-amber-300">
                  {getRelaxationHintMessage(relaxationHints[0], language)}
                </p>
                {relaxationHints.length > 1 && (
                  <ul className="mt-2 list-inside list-disc text-xs text-amber-200/80">
                    {relaxationHints.slice(1).map((hint) => (
                      <li key={hint}>{getRelaxationHintMessage(hint, language)}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {results.length === 0 ? (
              <EmptyState language={language} onReset={handleReset} />
            ) : (
              <>
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((result) => {
                    const product = getProductById(result.productId);
                    if (!product) return null;
                    return (
                      <AIStylistRecommendationCard
                        key={product.id}
                        product={product}
                        score={result.score}
                        reasons={result.reasons}
                      />
                    );
                  })}
                </div>

                {outfits.length > 0 && (
                  <div className="mt-10">
                    <h3 className="mb-4 text-lg font-semibold text-primary dark:text-white">
                      {t('aiStylist.coordinatedSets', language)}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {outfits.map((outfit) => {
                        const hat = getProductById(outfit.hatId);
                        const glasses = getProductById(outfit.glassesId);
                        if (!hat || !glasses) return null;
                        return (
                          <OutfitSetCard
                            key={`${outfit.hatId}-${outfit.glassesId}`}
                            hat={hat}
                            glasses={glasses}
                            score={outfit.score}
                            reasons={outfit.reasons}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="ghost" onClick={handleReset} className="text-text-secondary hover:text-primary dark:text-slate-300 dark:hover:text-white">
                <RefreshCw size={16} className="ltr:mr-2 rtl:ml-2" />
                {t('styleFinder.startOver', language)}
              </Button>
              <Button variant="outline" onClick={() => goToStep(0)}>
                {t('aiStylist.editPreferences', language)}
                <ChevronRight size={16} className="ltr:ml-2 rtl:mr-2 rtl:rotate-180" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {step < 5 && (
        <div className="relative z-10 mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/5 disabled:opacity-40"
          >
            <ArrowLeft size={16} className="rtl:rotate-180" />
            {t('common.back', language)}
          </button>
          <Button onClick={handleNext} disabled={!canProceed} variant="accent">
            {step === STEP_COUNT - 1 ? t('styleFinder.findMyMatch', language) : t('common.next', language)}
            {step !== STEP_COUNT - 1 && (
              <ArrowRight size={16} className="ltr:ml-2 rtl:mr-2 rtl:rotate-180" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
      className="relative z-10"
    >
      <h3 className="mb-1 text-xl font-semibold text-primary dark:text-white md:text-2xl">{title}</h3>
      {subtitle && <p className="mb-6 text-sm text-text-secondary">{subtitle}</p>}
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
      className={`rounded-xl border px-4 py-5 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
        selected
          ? 'border-cyan-400 bg-cyan-400/10 text-cyan-800 shadow-lg shadow-cyan-400/10 dark:text-cyan-200'
          : 'border-border dark:border-white/10 bg-background dark:bg-white/5 text-text-secondary dark:text-slate-300 hover:border-cyan-400/30 hover:bg-black/5 dark:hover:bg-white/[0.07]'
      }`}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}

function ResultsHeader({
  answers,
  language,
  budgetLabel,
}: {
  answers: StyleFinderAnswers;
  language: 'fa' | 'en';
  budgetLabel?: string;
}) {
  const styleLabel = answers.style ? styleLabels(language)[answers.style] : undefined;
  const shoppingLabel = answers.shoppingFor
    ? shoppingForOptions(language).find((o) => o.value === answers.shoppingFor)?.label
    : undefined;
  const occasionLabel = answers.occasion
    ? occasions(language).find((o) => o.value === answers.occasion)?.label
    : undefined;

  return (
    <div className="mb-8 text-center">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
        <Sparkles size={12} />
        {t('aiStylist.poweredBy', language)}
      </div>
      <h3 className="mb-2 text-2xl font-semibold text-primary dark:text-white md:text-3xl">
        {t('styleFinder.weFoundYourVibe', language)}
      </h3>
      <p className="mx-auto max-w-lg text-sm text-text-secondary dark:text-slate-400">
        {t('aiStylist.resultsSubtitle', language)}
      </p>
      <div className="mx-auto mt-4 flex flex-wrap items-center justify-center gap-2">
        {styleLabel && <Tag label={styleLabel} />}
        {shoppingLabel && <Tag label={shoppingLabel} />}
        {occasionLabel && <Tag label={occasionLabel} />}
        {budgetLabel && <Tag label={budgetLabel} />}
        {answers.colors.map((color) => (
          <Tag key={color} label={colorLabels(language)[color]} />
        ))}
      </div>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border dark:border-white/10 bg-background dark:bg-white/5 px-2.5 py-1 text-xs text-text-secondary dark:text-slate-300">
      {label}
    </span>
  );
}

function EmptyState({
  language,
  onReset,
}: {
  language: 'fa' | 'en';
  onReset: () => void;
}) {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-border dark:border-white/10 bg-background dark:bg-white/5">
        <Sparkles size={24} className="text-text-secondary dark:text-slate-400" />
      </div>
      <h4 className="mb-2 text-lg font-medium text-primary dark:text-white">
        {t('aiStylist.noMatchesTitle', language)}
      </h4>
      <p className="mx-auto mb-6 max-w-sm text-sm text-text-secondary dark:text-slate-400">
        {t('aiStylist.noMatchesSubtitle', language)}
      </p>
      <Button variant="accent" onClick={onReset}>
        {t('styleFinder.startOver', language)}
      </Button>
    </div>
  );
}

function DisabledState({ language }: { language: 'fa' | 'en' }) {
  return (
    <div className="rounded-3xl border border-border dark:border-white/10 bg-surface dark:bg-slate-900 p-10 text-center">
      <Sparkles size={32} className="mx-auto mb-4 text-text-secondary dark:text-slate-500" />
      <h3 className="mb-2 text-xl font-semibold text-primary dark:text-white">
        {t('aiStylist.disabledTitle', language)}
      </h3>
      <p className="text-sm text-text-secondary dark:text-slate-400">{t('aiStylist.disabledSubtitle', language)}</p>
    </div>
  );
}
