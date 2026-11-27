import type { Language } from '../../lib/i18n';

const catalogNames = new Map([
  ['Urban Black Cap', 'کلاه کپ مشکی شهری'],
  ['Minimal Beige Bucket Hat', 'کلاه باکت بژ مینیمال'],
  ['Classic Wool Fedora', 'کلاه فدورای پشمی کلاسیک'],
  ['Sport Performance Cap', 'کلاه کپ ورزشی'],
  ['Luxury Leather Cap', 'کلاه کپ چرمی لوکس'],
  ['Casual Knit Beanie', 'کلاه بافتنی روزمره'],
  ['Street Camo Cap', 'کلاه کپ استتار خیابانی'],
  ['Classic Straw Hat', 'کلاه حصیری کلاسیک'],
  ['Minimal White Cap', 'کلاه کپ سفید مینیمال'],
  ['Vintage Brown Trucker', 'کلاه تراکر قهوه‌ای وینتیج'],
  ['Noir Aviator Sunglasses', 'عینک آفتابی خلبانی مشکی'],
  ['Minimal Round Glasses', 'عینک گرد مینیمال'],
  ['Classic Tortoise Sunglasses', 'عینک آفتابی کلاسیک با طرح لاک‌پشتی'],
  ['Sport Wrap Sunglasses', 'عینک آفتابی ورزشی با فریم قوسی'],
  ['Luxury Gold Frame Glasses', 'عینک لوکس با فریم طلایی'],
  ['Casual Wayfarer Sunglasses', 'عینک آفتابی ویفرر روزمره'],
  ['Street Oversized Sunglasses', 'عینک آفتابی اورسایز خیابانی'],
  ['Classic Clubmaster Sunglasses', 'عینک آفتابی کلاب‌مستر کلاسیک'],
  ['Minimal Clear Frame Glasses', 'عینک مینیمال با فریم شفاف'],
  ['Blue Mirror Sport Sunglasses', 'عینک آفتابی ورزشی با لنز آینه‌ای آبی'],
]);

export function getPersianProductName(product: { name: string; nameFa?: string }): string | undefined {
  return product.nameFa?.trim() || catalogNames.get(product.name);
}

export function getProductName(product: { name: string; nameFa?: string }, language: Language): string {
  return language === 'fa' ? getPersianProductName(product) ?? product.name : product.name;
}
