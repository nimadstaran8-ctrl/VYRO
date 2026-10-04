import type { Language } from '../lib/i18n';
import type { ActivityLogEntry, ActivityLogSettingsSection, ActivityLogType } from '../types/activityLog';
import { getOrderStatusLabel } from './orderStatus';
import { formatProductPrice } from '../services/currency';

export const ACTIVITY_LOG_TYPES: ActivityLogType[] = [
  'order-created',
  'order-status',
  'order-deleted',
  'product-created',
  'product-updated',
  'product-deleted',
  'customer-created',
  'customer-deleted',
  'media-uploaded',
  'media-updated',
  'media-deleted',
  'settings-updated',
  'admin-login',
  'admin-logout',
];

export function getActivityLogTypeLabel(type: ActivityLogType, language: Language): string {
  const labels: Record<ActivityLogType, string> = {
    'order-created': language === 'fa' ? 'سفارش جدید' : 'New Order',
    'order-status': language === 'fa' ? 'تغییر وضعیت سفارش' : 'Order Status Change',
    'order-deleted': language === 'fa' ? 'حذف سفارش' : 'Order Deleted',
    'product-created': language === 'fa' ? 'افزودن محصول' : 'Product Added',
    'product-updated': language === 'fa' ? 'ویرایش محصول' : 'Product Updated',
    'product-deleted': language === 'fa' ? 'حذف محصول' : 'Product Deleted',
    'customer-created': language === 'fa' ? 'ثبت‌نام مشتری' : 'Customer Registered',
    'customer-deleted': language === 'fa' ? 'حذف مشتری' : 'Customer Deleted',
    'media-uploaded': language === 'fa' ? 'آپلود تصویر' : 'Image Uploaded',
    'media-updated': language === 'fa' ? 'ویرایش تصویر' : 'Image Updated',
    'media-deleted': language === 'fa' ? 'حذف تصویر' : 'Image Deleted',
    'settings-updated': language === 'fa' ? 'تغییر تنظیمات' : 'Settings Changed',
    'admin-login': language === 'fa' ? 'ورود مدیر' : 'Admin Login',
    'admin-logout': language === 'fa' ? 'خروج مدیر' : 'Admin Logout',
  };
  return labels[type];
}

export function getActivityLogTypeColor(type: ActivityLogType): string {
  const colors: Record<ActivityLogType, string> = {
    'order-created': 'bg-blue-100 text-blue-800',
    'order-status': 'bg-yellow-100 text-yellow-800',
    'order-deleted': 'bg-red-100 text-red-800',
    'product-created': 'bg-emerald-100 text-emerald-800',
    'product-updated': 'bg-purple-100 text-purple-800',
    'product-deleted': 'bg-red-100 text-red-800',
    'customer-created': 'bg-cyan-100 text-cyan-800',
    'customer-deleted': 'bg-red-100 text-red-800',
    'media-uploaded': 'bg-indigo-100 text-indigo-800',
    'media-updated': 'bg-purple-100 text-purple-800',
    'media-deleted': 'bg-red-100 text-red-800',
    'settings-updated': 'bg-gray-100 text-gray-700',
    'admin-login': 'bg-violet-100 text-violet-800',
    'admin-logout': 'bg-gray-100 text-gray-700',
  };
  return colors[type];
}

function getSettingsSectionLabel(
  section: ActivityLogSettingsSection | undefined,
  language: Language
): string {
  const labels: Record<ActivityLogSettingsSection, string> = {
    store: language === 'fa' ? 'اطلاعات فروشگاه' : 'Store Info',
    language: language === 'fa' ? 'زبان' : 'Language',
    currency: language === 'fa' ? 'واحد پول' : 'Currency',
    homepage: language === 'fa' ? 'صفحه اصلی' : 'Homepage',
    payment: language === 'fa' ? 'پرداخت (شماره کارت)' : 'Payment (Card Number)',
    reset: language === 'fa' ? 'بازنشانی تنظیمات' : 'Settings Reset',
  };
  return labels[section ?? 'store'];
}

/** Human-readable, localized description of a log entry. */
export function getActivityLogDescription(entry: ActivityLogEntry, language: Language): string {
  const isFa = language === 'fa';
  const detail = entry.detail ?? {};

  switch (entry.type) {
    case 'order-created': {
      const total =
        detail.total !== undefined
          ? formatProductPrice({ priceUsd: detail.total, locale: language })
          : null;
      return [detail.name, total].filter(Boolean).join(isFa ? ' — مبلغ ' : ' — total ');
    }
    case 'order-status': {
      const from = detail.from ? getOrderStatusLabel(detail.from, language) : '—';
      const to = detail.to ? getOrderStatusLabel(detail.to, language) : '—';
      return isFa ? `از «${from}» به «${to}»` : `from "${from}" to "${to}"`;
    }
    case 'settings-updated':
      return getSettingsSectionLabel(detail.section, language);
    case 'admin-login':
    case 'admin-logout':
      return detail.actor ?? '';
    default:
      return detail.name ?? '';
  }
}

/** Localized date+time (Persian calendar in fa) for a log entry timestamp. */
export function formatLogTime(iso: string, language: Language): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(language === 'fa' ? 'fa-IR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
