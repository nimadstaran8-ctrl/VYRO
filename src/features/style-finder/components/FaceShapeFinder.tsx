import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductGrid } from '../../../components/product/ProductGrid';
import { ROUTES } from '../../../constants/routes';
import type { Language } from '../../../lib/i18n';
import { getProducts } from '../../../services/catalog/productService';

const shapes = {
  round: {
    fa: { label: 'گرد', clue: 'گونه‌های پهن و خط فک نرم', advice: 'فریم‌های زاویه‌دار مثل ویفرر به خطوط نرم صورت تعریف بیشتری می‌دهند.' },
    en: { label: 'Round', clue: 'Wide cheeks and a soft jawline', advice: 'Angular frames like wayfarers add definition to softer contours.' },
    frames: ['wayfarer', 'rectangular', 'square', 'clubmaster'],
  },
  square: {
    fa: { label: 'مربعی', clue: 'پیشانی و فک هم‌عرض با زاویه‌های مشخص', advice: 'فریم‌های گرد، بیضی و خلبانی زاویه‌های خط فک را نرم‌تر نشان می‌دهند.' },
    en: { label: 'Square', clue: 'A broad forehead and a defined jaw', advice: 'Round, oval and aviator frames soften the angles of a defined jaw.' },
    frames: ['round', 'oval', 'aviator'],
  },
  oval: {
    fa: { label: 'بیضی', clue: 'صورت کشیده‌تر با فک ملایم و باریک‌تر', advice: 'ویفرر، فریم گرد و مدل خلبانی نقطه‌های شروع خوبی‌اند. عرض فریم را با عرض صورتت مقایسه کن.' },
    en: { label: 'Oval', clue: 'A longer face with a gently tapered jaw', advice: 'Try wayfarers, round frames or aviators. Compare the frame width with the width of your face.' },
    frames: ['wayfarer', 'round', 'aviator'],
  },
  heart: {
    fa: { label: 'قلبی', clue: 'پیشانی پهن‌تر و چانهٔ باریک', advice: 'فریم‌های گرد و بیضی یا مدل خلبانی با قاب باریک، ظاهر ملایم‌تری دارند.' },
    en: { label: 'Heart', clue: 'A wider forehead and a narrow chin', advice: 'Try round or oval frames or slim aviators for a softer look.' },
    frames: ['aviator', 'oval', 'round'],
  },
  unsure: {
    fa: { label: 'مطمئن نیستم', clue: 'چند فرم مختلف را مقایسه کن', advice: 'چند مدل با فرم متفاوت را کنار هم ببین و از فریمی شروع کن که بیشتر به سلیقه‌ات می‌خورد.' },
    en: { label: 'I’m not sure', clue: 'Compare a few frame shapes', advice: 'Compare a few different shapes and start with the one you like best.' },
    frames: ['wayfarer', 'round', 'aviator', 'clubmaster'],
  },
};

type FaceShape = keyof typeof shapes;
const faceShapes = Object.keys(shapes) as FaceShape[];

const copy = {
  fa: {
    title: 'چه عینکی به فرم صورتم میاد؟',
    prompt: 'فرمی که بیشتر شبیه صورتته انتخاب کن و مدل‌های موجود VYRO رو ببین.',
    results: 'فریم‌های پیشنهادی',
    empty: 'در حال حاضر فریم پیشنهادی برای این فرم موجود نیست.',
    browse: 'دیدن همهٔ عینک‌ها',
  },
  en: {
    title: 'Which glasses suit my face shape?',
    prompt: 'Pick the description closest to your face to see frames available from VYRO.',
    results: 'Recommended frames',
    empty: 'No matching frames are available right now.',
    browse: 'Browse all glasses',
  },
};

export function FaceShapeFinder({ language }: { language: Language }) {
  const [selected, setSelected] = useState<FaceShape>();
  const labels = copy[language];
  const match = selected ? shapes[selected] : undefined;
  const products = match
    ? getProducts()
        .filter((product) => product.category === 'glasses'
          && product.status !== 'out-of-stock'
          && product.stock > 0)
        .map((product) => {
          const tags = product.tags.map((tag) => tag.trim().toLowerCase());
          return { product, rank: match.frames.findIndex((frame) => tags.includes(frame)) };
        })
        .filter(({ rank }) => rank >= 0)
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 4)
        .map(({ product }) => product)
    : [];

  return (
    <section aria-labelledby="face-shape-title" className="mb-16 rounded-3xl border border-border bg-surface p-5 sm:p-8">
      <h2 id="face-shape-title" className="text-2xl font-semibold text-primary sm:text-3xl">{labels.title}</h2>
      <p className="mt-2 text-text-secondary">{labels.prompt}</p>
      <fieldset aria-label={labels.title} className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {faceShapes.map((shape) => (
          <label key={shape} className="cursor-pointer">
            <input
              type="radio"
              name="face-shape"
              value={shape}
              checked={selected === shape}
              onChange={() => setSelected(shape)}
              className="peer sr-only"
            />
            <span className="flex h-full flex-col gap-1 rounded-xl border border-border bg-background p-3 transition-colors hover:border-cyan-500 peer-checked:border-cyan-500 peer-checked:bg-cyan-500/10 peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-500">
              <span className="font-semibold text-primary">{shapes[shape][language].label}</span>
              <span className="text-sm text-text-secondary">{shapes[shape][language].clue}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <p role="status" className={match ? 'mt-6 text-text-secondary' : 'sr-only'}>
        {match && (products.length ? match[language].advice : labels.empty)}
      </p>
      {match && (
        <div className="mt-4">
          {products.length > 0 && (
            <>
              <h3 className="mb-4 text-lg font-semibold text-primary">{labels.results}</h3>
              <ProductGrid products={products} />
            </>
          )}
          <Link to={ROUTES.GLASSES} className="mt-4 inline-block font-medium text-primary underline underline-offset-4">
            {labels.browse}
          </Link>
        </div>
      )}
    </section>
  );
}
