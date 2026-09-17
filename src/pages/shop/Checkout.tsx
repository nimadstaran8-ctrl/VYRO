import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SEO } from '../../components/ui/SEO';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CartItem } from '../../features/cart/components/CartItem';
import { useCartStore } from '../../stores/cartStore';
import { useLanguageStore } from '../../stores/languageStore';
import { formatPrice } from '../../lib/format';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  state: string;
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  nameOnCard: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvc?: string;
  nameOnCard?: string;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');
  return /^\d{13,19}$/.test(cleaned);
}

function validateExpiryDate(expiry: string): boolean {
  const match = expiry.match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const expDate = new Date(year, month - 1);
  return expDate > now;
}

function validateCVC(cvc: string): boolean {
  return /^\d{3,4}$/.test(cvc);
}

function validatePostalCode(postalCode: string): boolean {
  return postalCode.trim().length >= 3;
}

export function Checkout() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const language = useLanguageStore((state) => state.language);
  const currency = language === 'fa' ? 'rial' : 'usd';
  const [isPlacing, setIsPlacing] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    state: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    nameOnCard: '',
  });

  const subtotal = getSubtotal();
  const shipping = subtotal > 75 ? 0 : 6;
  const total = subtotal + shipping;

  const validate = (data: FormData): FormErrors => {
    const errors: FormErrors = {};

    if (!data.firstName.trim()) {
      errors.firstName = language === 'fa' ? 'لطفاً نام خود را وارد کنید' : 'First name is required';
    }

    if (!data.lastName.trim()) {
      errors.lastName = language === 'fa' ? 'لطفاً نام خانوادگی خود را وارد کنید' : 'Last name is required';
    }

    if (!data.email.trim()) {
      errors.email = language === 'fa' ? 'لطفاً ایمیل خود را وارد کنید' : 'Email is required';
    } else if (!validateEmail(data.email)) {
      errors.email = language === 'fa' ? 'لطفاً یک آدرس ایمیل معتبر وارد کنید' : 'Please enter a valid email address';
    }

    if (!data.address.trim()) {
      errors.address = language === 'fa' ? 'لطفاً آدرس خود را وارد کنید' : 'Address is required';
    }

    if (!data.city.trim()) {
      errors.city = language === 'fa' ? 'لطفاً شهر خود را وارد کنید' : 'City is required';
    }

    if (!data.postalCode.trim()) {
      errors.postalCode = language === 'fa' ? 'لطفاً کد پستی خود را وارد کنید' : 'Postal code is required';
    } else if (!validatePostalCode(data.postalCode)) {
      errors.postalCode = language === 'fa' ? 'لطفاً یک کد پستی معتبر وارد کنید' : 'Please enter a valid postal code';
    }

    if (!data.country.trim()) {
      errors.country = language === 'fa' ? 'لطفاً کشور خود را وارد کنید' : 'Country is required';
    }

    if (!data.cardNumber.trim()) {
      errors.cardNumber = language === 'fa' ? 'شماره کارت الزامی است' : 'Card number is required';
    } else if (!validateCardNumber(data.cardNumber)) {
      errors.cardNumber = language === 'fa' ? 'لطفاً شماره کارت معتبر وارد کنید' : 'Please enter a valid card number';
    }

    if (!data.expiryDate.trim()) {
      errors.expiryDate = language === 'fa' ? 'تاریخ انقضا الزامی است' : 'Expiry date is required';
    } else if (!validateExpiryDate(data.expiryDate)) {
      errors.expiryDate = language === 'fa' ? 'تاریخ انقضای معتبر وارد کنید (MM/YY)' : 'Please enter a valid expiry date (MM/YY)';
    }

    if (!data.cvc.trim()) {
      errors.cvc = language === 'fa' ? 'CVC الزامی است' : 'CVC is required';
    } else if (!validateCVC(data.cvc)) {
      errors.cvc = language === 'fa' ? 'CVC معتبر وارد کنید' : 'Please enter a valid CVC';
    }

    if (!data.nameOnCard.trim()) {
      errors.nameOnCard = language === 'fa' ? 'نام روی کارت الزامی است' : 'Name on card is required';
    }

    return errors;
  };

  const errors = validate(formData);
  const hasErrors = Object.keys(errors).length > 0;

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleBlur = (field: string) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (hasErrors) {
      return;
    }

    setIsPlacing(true);
    setTimeout(() => {
      clearCart();
      navigate('/');
    }, 1500);
  };

  const getFieldError = (field: keyof FormErrors): string | undefined => {
    if (touched[field] && errors[field]) {
      return errors[field];
    }
    return undefined;
  };

  const content = {
    title: language === 'fa' ? 'پرداخت' : 'Checkout',
    customerInfo: language === 'fa' ? 'اطلاعات مشتری' : 'Customer Information',
    shippingAddress: language === 'fa' ? 'آدرس ارسال' : 'Shipping Address',
    payment: language === 'fa' ? 'پرداخت' : 'Payment',
    orderSummary: language === 'fa' ? 'خلاصه سفارش' : 'Order Summary',
    demoNotice: language === 'fa' ? 'این یک صفحه آزمایشی است. اطلاعات واقعی وارد نکنید.' : 'This is a demo checkout. Do not enter real card information.',
    placeOrder: language === 'fa' ? 'ثبت سفارش' : 'Place Order',
    firstName: language === 'fa' ? 'نام' : 'First Name',
    lastName: language === 'fa' ? 'نام خانوادگی' : 'Last Name',
    email: language === 'fa' ? 'ایمیل' : 'Email',
    phone: language === 'fa' ? 'تلفن' : 'Phone',
    address: language === 'fa' ? 'آدرس' : 'Address',
    city: language === 'fa' ? 'شهر' : 'City',
    postalCode: language === 'fa' ? 'کد پستی' : 'Postal Code',
    country: language === 'fa' ? 'کشور' : 'Country',
    state: language === 'fa' ? 'استان' : 'State / Province',
    cardNumber: language === 'fa' ? 'شماره کارت' : 'Card Number',
    expiryDate: language === 'fa' ? 'تاریخ انقضا' : 'Expiry Date',
    cvc: language === 'fa' ? 'CVC' : 'CVC',
    nameOnCard: language === 'fa' ? 'نام روی کارت' : 'Name on Card',
    subtotal: language === 'fa' ? 'جمع کل' : 'Subtotal',
    shipping: language === 'fa' ? 'هزینه ارسال' : 'Shipping',
    total: language === 'fa' ? 'مبلغ قابل پرداخت' : 'Total',
    free: language === 'fa' ? 'رایگان' : 'Free',
    cartEmpty: language === 'fa' ? 'سبد خرید شما خالی است' : 'Your cart is empty',
    addItemsBeforeCheckout: language === 'fa' ? 'قبل از پرداخت محصولاتی اضافه کنید.' : 'Add some items before checking out.',
    shopNow: language === 'fa' ? 'خرید کنید' : 'Shop Now',
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-primary">{content.cartEmpty}</h1>
        <p className="mt-2 text-text-secondary">{content.addItemsBeforeCheckout}</p>
        <Button className="mt-6" asChild>
          <Link to="/shop">{content.shopNow}</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={content.title}
        description={language === 'fa' ? 'تکمیل خرید وایرو به صورت امن و سریع.' : 'Complete your VYRO purchase securely and quickly.'}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold uppercase tracking-wider text-primary md:text-4xl">{content.title}</h1>

        <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl bg-white p-6">
              <h2 className="text-lg font-semibold text-primary">{content.customerInfo}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input
                  label={content.firstName}
                  required
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  error={getFieldError('firstName')}
                  autoComplete="given-name"
                />
                <Input
                  label={content.lastName}
                  required
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  error={getFieldError('lastName')}
                  autoComplete="family-name"
                />
                <Input
                  label={content.email}
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={getFieldError('email')}
                  autoComplete="email"
                  className="sm:col-span-2"
                />
                <Input
                  label={content.phone}
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  error={getFieldError('phone')}
                  autoComplete="tel"
                  className="sm:col-span-2"
                />
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6">
              <h2 className="text-lg font-semibold text-primary">{content.shippingAddress}</h2>
              <div className="mt-4 grid gap-4">
                <Input
                  label={content.address}
                  required
                  value={formData.address}
                  onChange={handleChange('address')}
                  onBlur={handleBlur('address')}
                  error={getFieldError('address')}
                  autoComplete="street-address"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={content.city}
                    required
                    value={formData.city}
                    onChange={handleChange('city')}
                    onBlur={handleBlur('city')}
                    error={getFieldError('city')}
                    autoComplete="address-level2"
                  />
                  <Input
                    label={content.postalCode}
                    required
                    value={formData.postalCode}
                    onChange={handleChange('postalCode')}
                    onBlur={handleBlur('postalCode')}
                    error={getFieldError('postalCode')}
                    autoComplete="postal-code"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={content.country}
                    required
                    value={formData.country}
                    onChange={handleChange('country')}
                    onBlur={handleBlur('country')}
                    error={getFieldError('country')}
                    autoComplete="country-name"
                  />
                  <Input
                    label={content.state}
                    value={formData.state}
                    onChange={handleChange('state')}
                    onBlur={handleBlur('state')}
                    autoComplete="address-level1"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6">
              <h2 className="text-lg font-semibold text-primary">{content.payment}</h2>
              <div className="mt-4 space-y-4">
                <Input
                  label={content.cardNumber}
                  placeholder="0000 0000 0000 0000"
                  required
                  value={formData.cardNumber}
                  onChange={handleChange('cardNumber')}
                  onBlur={handleBlur('cardNumber')}
                  error={getFieldError('cardNumber')}
                  autoComplete="cc-number"
                  inputMode="numeric"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={content.expiryDate}
                    placeholder="MM / YY"
                    required
                    value={formData.expiryDate}
                    onChange={handleChange('expiryDate')}
                    onBlur={handleBlur('expiryDate')}
                    error={getFieldError('expiryDate')}
                    autoComplete="cc-exp"
                  />
                  <Input
                    label={content.cvc}
                    placeholder="123"
                    required
                    value={formData.cvc}
                    onChange={handleChange('cvc')}
                    onBlur={handleBlur('cvc')}
                    error={getFieldError('cvc')}
                    autoComplete="cc-csc"
                    inputMode="numeric"
                  />
                </div>
                <Input
                  label={content.nameOnCard}
                  required
                  value={formData.nameOnCard}
                  onChange={handleChange('nameOnCard')}
                  onBlur={handleBlur('nameOnCard')}
                  error={getFieldError('nameOnCard')}
                  autoComplete="cc-name"
                />
              </div>
              <p className="mt-4 text-xs text-text-secondary">
                {content.demoNotice}
              </p>
            </section>
          </div>

          <div className="h-fit space-y-6">
            <section className="rounded-2xl bg-white p-6">
              <h2 className="text-lg font-semibold text-primary">{content.orderSummary}</h2>
              <div className="mt-4 max-h-[300px] overflow-y-auto">
                {items.map((item, index) => (
                  <div
                    key={`${item.productId}-${item.color}-${item.size}`}
                    className={index !== items.length - 1 ? 'border-b border-border' : ''}
                  >
                    <CartItem item={item} />
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>{content.subtotal}</span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>{content.shipping}</span>
                  <span>{shipping === 0 ? content.free : formatPrice(shipping, currency)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-primary">
                  <span>{content.total}</span>
                  <span>{formatPrice(total, currency)}</span>
                </div>
              </div>
              <Button
                type="submit"
                variant="accent"
                className="mt-6 w-full"
                isLoading={isPlacing}
                disabled={hasErrors && Object.keys(touched).length > 0}
              >
                {content.placeOrder}
              </Button>
            </section>
          </div>
        </form>
      </div>
    </>
  );
}
