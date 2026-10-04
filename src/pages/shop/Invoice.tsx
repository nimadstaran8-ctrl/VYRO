import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowRight } from 'lucide-react';
import { SEO } from '../../components/ui/SEO';
import { Button } from '../../components/ui/Button';
import { useLanguageStore } from '../../stores/languageStore';
import type { Language } from '../../lib/i18n';
import type { Order } from '../../types/order';
import { getOrderById } from '../../services/orders';
import { formatProductPrice } from '../../services/currency';
import { getPaymentSettings } from '../../services/settings';
import { getOrderStatusLabel, getOrderStatusColor } from '../../lib/orderStatus';

function formatOrderDate(date: string, language: Language): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat(language === 'fa' ? 'fa-IR' : 'en-US', {
    dateStyle: 'long',
  }).format(parsed);
}

export function Invoice() {
  const { id } = useParams<{ id: string }>();
  const lang = useLanguageStore((state) => state.language);
  const language = lang as Language;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentSettings] = useState(() => getPaymentSettings());

  useEffect(() => {
    setOrder(getOrderById(id || '') || null);
    setIsLoading(false);
  }, [id]);

  const content = {
    title: language === 'fa' ? 'فاکتور فروش' : 'Sales Invoice',
    orderNumber: language === 'fa' ? 'شماره سفارش' : 'Order Number',
    date: language === 'fa' ? 'تاریخ' : 'Date',
    status: language === 'fa' ? 'وضعیت' : 'Status',
    soldBy: language === 'fa' ? 'فروشنده' : 'Sold By',
    customer: language === 'fa' ? 'خریدار' : 'Customer',
    items: language === 'fa' ? 'اقلام سفارش' : 'Order Items',
    item: language === 'fa' ? 'محصول' : 'Item',
    quantity: language === 'fa' ? 'تعداد' : 'Qty',
    unitPrice: language === 'fa' ? 'قیمت واحد' : 'Unit Price',
    lineTotal: language === 'fa' ? 'جمع' : 'Total',
    subtotal: language === 'fa' ? 'جمع کل' : 'Subtotal',
    shipping: language === 'fa' ? 'هزینه ارسال' : 'Shipping',
    free: language === 'fa' ? 'رایگان' : 'Free',
    discount: language === 'fa' ? 'تخفیف' : 'Discount',
    grandTotal: language === 'fa' ? 'مبلغ نهایی' : 'Grand Total',
    paymentMethod: language === 'fa' ? 'روش پرداخت' : 'Payment Method',
    cardToCard: language === 'fa' ? 'کارت به کارت' : 'Card-to-Card',
    paidTo: language === 'fa' ? 'واریز به شماره کارت' : 'Transferred to card',
    printInvoice: language === 'fa' ? 'چاپ فاکتور' : 'Print Invoice',
    backToStore: language === 'fa' ? 'بازگشت به فروشگاه' : 'Back to Store',
    notFound: language === 'fa' ? 'فاکتوری برای این سفارش یافت نشد' : 'No invoice found for this order',
    notFoundDesc:
      language === 'fa'
        ? 'فاکتورها در همان مرورگری که سفارش ثبت شده ذخیره می‌شوند.'
        : 'Invoices are stored in the browser where the order was placed.',
    note:
      language === 'fa'
        ? 'این فاکتور به‌صورت الکترونیکی تولید شده است و مهر و امضای فیزیکی ندارد.'
        : 'This invoice is generated electronically and carries no physical stamp or signature.',
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <SEO title={content.title} description={content.title} />
        <h1 className="text-2xl font-semibold text-primary">{content.notFound}</h1>
        <p className="mt-2 text-sm text-text-secondary">{content.notFoundDesc}</p>
        <Button className="mt-6" asChild>
          <Link to="/">{content.backToStore}</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Print rules: hide the storefront chrome and buttons, keep the invoice. */}
      <style>{`@media print { header, footer, .no-print { display: none !important; } .invoice-sheet { box-shadow: none !important; border: none !important; } body { background: white !important; } }`}</style>
      <SEO title={`${content.title} ${order.id}`} description={content.title} />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="no-print mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-primary"
          >
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            {content.backToStore}
          </Link>
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {content.printInvoice}
          </Button>
        </div>

        <div className="invoice-sheet rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-10">
          {/* Header */}
          <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">VYRO</p>
              <p className="mt-1 text-sm text-text-secondary">
                {content.soldBy}: {paymentSettings.cardHolder || 'VYRO'}
              </p>
            </div>
            <div className="sm:text-end">
              <h1 className="text-xl font-semibold text-primary">{content.title}</h1>
              <p className="mt-1 text-sm text-text-secondary" dir="ltr">
                {content.orderNumber}: <span className="font-medium text-primary">{order.id}</span>
              </p>
              <p className="mt-0.5 text-sm text-text-secondary">
                {content.date}: {formatOrderDate(order.date, language)}
              </p>
            </div>
          </div>

          {/* Meta */}
          <div className="grid gap-4 border-b border-border py-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                {content.customer}
              </p>
              {order.customer ? (
                <div className="mt-1 space-y-0.5 text-sm">
                  <p className="font-medium text-primary">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  {order.customer.phone && (
                    <p className="text-text-secondary" dir="ltr">{order.customer.phone}</p>
                  )}
                  {(order.customer.city || order.customer.address) && (
                    <p className="text-text-secondary">
                      {[order.customer.address, order.customer.city].filter(Boolean).join('، ')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-sm text-text-secondary">—</p>
              )}
            </div>
            <div className="sm:text-end">
              <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                {content.status}
              </p>
              <span
                className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getOrderStatusColor(order.status)}`}
              >
                {getOrderStatusLabel(order.status, language)}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="py-6">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-text-secondary">
              {content.items}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-start text-xs text-text-secondary">
                    <th className="py-2 pe-2 text-start font-medium">{content.item}</th>
                    <th className="px-2 py-2 text-center font-medium">{content.quantity}</th>
                    <th className="px-2 py-2 text-end font-medium">{content.unitPrice}</th>
                    <th className="py-2 ps-2 text-end font-medium">{content.lineTotal}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="py-3 pe-2">
                        <p className="font-medium text-primary">{item.name}</p>
                        <p className="text-xs text-text-secondary">
                          {[item.color, item.size].filter(Boolean).join(' / ')}
                        </p>
                      </td>
                      <td className="px-2 py-3 text-center text-primary">{item.quantity}</td>
                      <td className="px-2 py-3 text-end text-text-secondary">
                        {formatProductPrice({ priceUsd: item.price, locale: language })}
                      </td>
                      <td className="py-3 ps-2 text-end font-medium text-primary">
                        {formatProductPrice({ priceUsd: item.price * item.quantity, locale: language })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-border pt-4">
            <div className="ms-auto max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>{content.subtotal}</span>
                <span>{formatProductPrice({ priceUsd: order.subtotal, locale: language })}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>{content.shipping}</span>
                <span>
                  {order.shipping === 0
                    ? content.free
                    : formatProductPrice({ priceUsd: order.shipping, locale: language })}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{content.discount}</span>
                  <span>-{formatProductPrice({ priceUsd: order.discount, locale: language })}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-primary">
                <span>{content.grandTotal}</span>
                <span>{formatProductPrice({ priceUsd: order.total, locale: language })}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="mt-6 rounded-xl bg-background p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-text-secondary">
                {content.paymentMethod}: <span className="font-medium text-primary">{content.cardToCard}</span>
              </span>
              {paymentSettings.cardNumber && (
                <span className="text-text-secondary" dir="ltr">
                  {content.paidTo}:{' '}
                  <span className="font-mono font-medium text-primary">
                    {paymentSettings.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}
                  </span>
                </span>
              )}
            </div>
          </div>

          <p className="mt-6 border-t border-border pt-4 text-center text-xs text-text-secondary">
            {content.note}
          </p>
        </div>
      </div>
    </>
  );
}
