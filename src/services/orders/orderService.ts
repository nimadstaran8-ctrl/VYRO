import type { Order, OrderStatus, OrderCustomer, OrderItem } from '../../types/order';
import { FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_COST } from '../../constants/product';
import { getProductById, decrementStock } from '../catalog/productService';
import { logActivity } from '../logs/logService';

const ORDERS_STORAGE_KEY = 'vyro_orders_repository';

export interface OrderStorageData {
  orders: Order[];
  version: number;
}

/**
 * Statuses used by the first version of the storefront/admin. Orders persisted
 * before the status model was expanded to six values still carry 'delivered'
 * and are migrated to 'completed' when loaded.
 */
const LEGACY_STATUS_MAP: Record<string, OrderStatus> = {
  delivered: 'completed',
};

function normalizeStatus(status: string): OrderStatus {
  return LEGACY_STATUS_MAP[status] ?? (status as OrderStatus);
}

const VALID_STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'processing',
  'shipped',
  'completed',
  'cancelled',
];

function getStorageData(): OrderStorageData {
  try {
    const data = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as OrderStorageData;
      return {
        version: parsed.version ?? 1,
        orders: (parsed.orders || []).map((order) => ({
          ...order,
          status: VALID_STATUSES.includes(order.status) ? order.status : normalizeStatus(order.status),
        })),
      };
    }
  } catch {
  }
  return { orders: [], version: 1 };
}

function setStorageData(data: OrderStorageData): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(data));
  } catch {
  }
}

function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

let initialized = false;
let orders: Order[] = [];

function persistAll(): void {
  setStorageData({ orders, version: 1 });
}

function initializeOrders(): void {
  if (initialized) return;

  const stored = getStorageData();
  if (stored.orders.length > 0) {
    orders = stored.orders;
    initialized = true;
    return;
  }

  // Seed demo orders so the admin panel has something to display on first run.
  // These are clearly-marked sample transactions, not real sales.
  const seedOrders: Order[] = [
    {
      id: 'ORD-001',
      date: '2026-09-15',
      status: 'processing',
      customer: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+98 912 345 6789',
        city: 'Tehran',
        country: 'Iran',
      },
      items: [
        { productId: 'hat-001', name: 'Urban Black Cap', price: 34, quantity: 1, color: 'Black', size: 'One Size', image: '/images/products/hat-black.svg' },
      ],
      subtotal: 34,
      shipping: 0,
      discount: 0,
      total: 34,
    },
    {
      id: 'ORD-002',
      date: '2026-09-14',
      status: 'shipped',
      customer: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+98 912 345 6790',
        city: 'Tehran',
        country: 'Iran',
      },
      items: [
        { productId: 'glass-001', name: 'Noir Aviator Sunglasses', price: 68, quantity: 1, color: 'Black', size: 'One Size', image: '/images/products/glasses-aviator.svg' },
      ],
      subtotal: 68,
      shipping: 5,
      discount: 10,
      total: 63,
    },
    {
      id: 'ORD-003',
      date: '2026-09-13',
      status: 'completed',
      customer: {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.j@example.com',
        phone: '+98 912 345 6792',
        city: 'Tehran',
        country: 'Iran',
      },
      items: [
        { productId: 'hat-002', name: 'Minimal Beige Bucket Hat', price: 28, quantity: 2, color: 'Beige', size: 'S/M', image: '/images/products/hat-beige.svg' },
      ],
      subtotal: 56,
      shipping: 0,
      discount: 0,
      total: 56,
    },
    {
      id: 'ORD-004',
      date: '2026-09-12',
      status: 'processing',
      customer: {
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@example.com',
        phone: '+98 912 345 6791',
        city: 'Tehran',
        country: 'Iran',
      },
      items: [
        { productId: 'glass-003', name: 'Classic Tortoise Sunglasses', price: 72, quantity: 1, color: 'Brown', size: 'One Size', image: '/images/products/glasses-tortoise.svg' },
        { productId: 'hat-005', name: 'Luxury Leather Cap', price: 120, quantity: 1, color: 'Black', size: 'One Size', image: '/images/products/hat-luxury.svg' },
      ],
      subtotal: 192,
      shipping: 0,
      discount: 0,
      total: 192,
    },
    {
      id: 'ORD-005',
      date: '2026-09-10',
      status: 'cancelled',
      customer: {
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie.b@example.com',
        phone: '+98 912 345 6793',
        city: 'Tehran',
        country: 'Iran',
      },
      items: [
        { productId: 'hat-003', name: 'Classic Wool Fedora', price: 79, quantity: 1, color: 'Brown', size: 'M', image: '/images/products/hat-fedora.svg' },
      ],
      subtotal: 79,
      shipping: 5,
      discount: 0,
      total: 84,
    },
  ];

  orders = seedOrders;
  persistAll();
  initialized = true;
}

export interface CreateOrderItemData {
  productId: string;
  quantity: number;
  color: string;
  size: string;
}

export interface CreateOrderData {
  items: CreateOrderItemData[];
  customer: OrderCustomer;
}

export function getOrders(): Order[] {
  initializeOrders();
  return [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getOrderById(id: string): Order | undefined {
  initializeOrders();
  return orders.find((o) => o.id === id);
}

export function getOrdersByStatus(status: OrderStatus): Order[] {
  initializeOrders();
  return orders.filter((o) => o.status === status);
}

export function getOrdersByCustomerEmail(email: string): Order[] {
  initializeOrders();
  const normalized = email.toLowerCase();
  return orders
    .filter((o) => o.customer?.email.toLowerCase() === normalized)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getRecentOrders(limit = 5): Order[] {
  return getOrders().slice(0, limit);
}

export function searchOrders(query: string): Order[] {
  initializeOrders();
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];
  return orders.filter((o) =>
    o.id.toLowerCase().includes(lowerQuery) ||
    o.items.some((item) => item.name.toLowerCase().includes(lowerQuery)) ||
    `${o.customer?.firstName ?? ''} ${o.customer?.lastName ?? ''}`.toLowerCase().includes(lowerQuery) ||
    (o.customer?.email ?? '').toLowerCase().includes(lowerQuery)
  );
}

export function createOrder(data: CreateOrderData): { success: boolean; order?: Order; error?: string } {
  initializeOrders();

  if (!data.items.length) {
    return { success: false, error: 'Order must contain at least one item.' };
  }
  if (!data.customer?.email || !data.customer.firstName || !data.customer.lastName) {
    return { success: false, error: 'Customer information is required.' };
  }

  const items: OrderItem[] = [];
  for (const item of data.items) {
    const product = getProductById(item.productId);
    if (!product) {
      return { success: false, error: `Product not found: ${item.productId}` };
    }
    items.push({
      productId: product.id,
      name: product.name,
      price: product.priceUSD,
      quantity: item.quantity,
      color: item.color,
      size: item.size,
      image: product.primaryImage || product.images[0] || '/images/site/fallback.svg',
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_COST;

  const order: Order = {
    id: generateOrderId(),
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    customer: { ...data.customer },
    items,
    subtotal,
    shipping,
    discount: 0,
    total: subtotal + shipping,
  };

  orders.unshift(order);
  persistAll();

  decrementStock(data.items.map((item) => ({ productId: item.productId, quantity: item.quantity })));

  logActivity({
    type: 'order-created',
    entityId: order.id,
    detail: {
      name: `${data.customer.firstName} ${data.customer.lastName}`.trim(),
      total: order.total,
    },
  });

  return { success: true, order };
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus
): { success: boolean; error?: string } {
  initializeOrders();

  if (!VALID_STATUSES.includes(status)) {
    return { success: false, error: 'Invalid order status.' };
  }

  const order = orders.find((o) => o.id === id);
  if (!order) {
    return { success: false, error: 'Order not found.' };
  }

  const previousStatus = order.status;
  order.status = status;
  persistAll();

  if (previousStatus !== status) {
    logActivity({
      type: 'order-status',
      entityId: order.id,
      detail: { from: previousStatus, to: status },
    });
  }

  return { success: true };
}

export function deleteOrder(id: string): { success: boolean; error?: string } {
  initializeOrders();

  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) {
    return { success: false, error: 'Order not found.' };
  }

  const [removed] = orders.splice(index, 1);
  persistAll();

  logActivity({
    type: 'order-deleted',
    entityId: removed.id,
    detail: {
      name: removed.customer
        ? `${removed.customer.firstName} ${removed.customer.lastName}`.trim()
        : removed.id,
    },
  });

  return { success: true };
}

const REVENUE_STATUSES: OrderStatus[] = ['paid', 'processing', 'shipped', 'completed'];

export function getOrderStats(): {
  total: number;
  pending: number;
  paid: number;
  processing: number;
  shipped: number;
  completed: number;
  cancelled: number;
  revenue: number;
} {
  initializeOrders();

  const countBy = (status: OrderStatus) => orders.filter((o) => o.status === status).length;

  return {
    total: orders.length,
    pending: countBy('pending'),
    paid: countBy('paid'),
    processing: countBy('processing'),
    shipped: countBy('shipped'),
    completed: countBy('completed'),
    cancelled: countBy('cancelled'),
    revenue: orders
      .filter((o) => REVENUE_STATUSES.includes(o.status))
      .reduce((sum, o) => sum + o.total, 0),
  };
}
