import type { Language } from '../lib/i18n';
import type { OrderStatus } from '../types/order';

export function getOrderStatusLabel(status: OrderStatus, language: Language): string {
  const labels: Record<OrderStatus, string> = {
    pending: language === 'fa' ? 'در انتظار پرداخت' : 'Pending',
    paid: language === 'fa' ? 'پرداخت شده' : 'Paid',
    processing: language === 'fa' ? 'در حال پردازش' : 'Processing',
    shipped: language === 'fa' ? 'ارسال شده' : 'Shipped',
    completed: language === 'fa' ? 'تکمیل شده' : 'Completed',
    cancelled: language === 'fa' ? 'لغو شده' : 'Cancelled',
  };
  return labels[status];
}

export function getOrderStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    pending: 'bg-gray-100 text-gray-700',
    paid: 'bg-emerald-100 text-emerald-800',
    processing: 'bg-yellow-100 text-yellow-800',
    shipped: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status];
}

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'processing',
  'shipped',
  'completed',
  'cancelled',
];
