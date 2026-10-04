export type OrderStatus =
  | 'pending'
  | 'awaiting-approval'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled';

/**
 * How the customer paid (or intends to pay). Card-to-card orders carry a
 * receipt image id (stored in IndexedDB) and start as 'awaiting-approval'
 * until the shop owner confirms the transfer in the admin panel.
 */
export type PaymentMethod = 'card-to-card';

export interface OrderPayment {
  method: PaymentMethod;
  /** Id of the uploaded receipt image in IndexedDB (`vyro_image_db`). */
  receiptId?: string;
}

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  customer?: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  payment?: OrderPayment;
}
