import type { OrderStatus } from './order';

/**
 * Event types recorded in the site activity log. The log is a frontend-only
 * feature: entries live in the browser's localStorage, so they only cover
 * actions performed in the current browser (no server-side logging).
 */
export type ActivityLogType =
  | 'order-created'
  | 'order-status'
  | 'order-deleted'
  | 'product-created'
  | 'product-updated'
  | 'product-deleted'
  | 'customer-created'
  | 'customer-deleted'
  | 'media-uploaded'
  | 'media-updated'
  | 'media-deleted'
  | 'settings-updated'
  | 'admin-login'
  | 'admin-logout';

export type ActivityLogSettingsSection =
  | 'store'
  | 'language'
  | 'currency'
  | 'homepage'
  | 'payment'
  | 'reset';

export interface ActivityLogDetail {
  /** Display name of the affected record (product, customer, media name, ...). */
  name?: string;
  /** Previous order status for status-change events. */
  from?: OrderStatus;
  /** New order status for status-change events. */
  to?: OrderStatus;
  /** Order total in USD. */
  total?: number;
  /** Admin username for auth events. */
  actor?: string;
  /** Which settings section was written. */
  section?: ActivityLogSettingsSection;
}

export interface ActivityLogEntry {
  id: string;
  type: ActivityLogType;
  /** Id of the affected record (order/product/customer/media id), when applicable. */
  entityId?: string;
  detail?: ActivityLogDetail;
  /** ISO timestamp of when the event happened. */
  createdAt: string;
}
