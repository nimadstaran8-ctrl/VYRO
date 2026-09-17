import type { Order, OrderItem } from '../../types/order';

const ORDERS_STORAGE_KEY = 'vyro_orders_repository';

export interface OrderStorageData {
  orders: Order[];
  version: number;
}

function getStorageData(): OrderStorageData {
  try {
    const data = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as OrderStorageData;
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
let mockOrders: Order[] = [];

function initializeMockOrders(): void {
  if (initialized) return;
  
  const stored = getStorageData();
  if (stored.orders.length > 0) {
    mockOrders = stored.orders;
  } else {
    mockOrders = [
      {
        id: 'ORD-001',
        date: '2026-09-15',
        status: 'processing',
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
        status: 'delivered',
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
        items: [
          { productId: 'hat-003', name: 'Classic Wool Fedora', price: 79, quantity: 1, color: 'Brown', size: 'M', image: '/images/products/hat-fedora.svg' },
        ],
        subtotal: 79,
        shipping: 5,
        discount: 0,
        total: 84,
      },
    ];
    mockOrders.forEach(order => {
      const existing = getStorageData().orders.find(o => o.id === order.id);
      if (!existing) {
        addOrderToStorage(order);
      }
    });
  }
  initialized = true;
}

function addOrderToStorage(order: Order): void {
  const data = getStorageData();
  data.orders.push(order);
  setStorageData(data);
}

export interface CreateOrderData {
  items: Omit<OrderItem, 'image'>[];
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
}

export function getOrders(): Order[] {
  initializeMockOrders();
  return [...mockOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getOrderById(id: string): Order | undefined {
  initializeMockOrders();
  return mockOrders.find(o => o.id === id);
}

export function getOrdersByStatus(status: Order['status']): Order[] {
  initializeMockOrders();
  return mockOrders.filter(o => o.status === status);
}

export function getRecentOrders(limit = 5): Order[] {
  initializeMockOrders();
  return [...mockOrders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function searchOrders(query: string): Order[] {
  initializeMockOrders();
  const lowerQuery = query.toLowerCase();
  return mockOrders.filter(o => 
    o.id.toLowerCase().includes(lowerQuery) ||
    o.items.some(item => item.name.toLowerCase().includes(lowerQuery))
  );
}

export function createOrder(data: CreateOrderData): { success: boolean; order?: Order; error?: string } {
  initializeMockOrders();
  
  const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 75 ? 0 : 5;
  
  const order: Order = {
    id: generateOrderId(),
    date: new Date().toISOString().split('T')[0],
    status: 'processing',
    items: data.items.map(item => ({
      ...item,
      image: `/images/products/placeholder.svg`,
    })),
    subtotal,
    shipping,
    discount: 0,
    total: subtotal + shipping,
  };

  mockOrders.unshift(order);
  addOrderToStorage(order);
  
  return { success: true, order };
}

export function updateOrderStatus(
  id: string, 
  status: Order['status']
): { success: boolean; error?: string } {
  initializeMockOrders();
  
  const order = mockOrders.find(o => o.id === id);
  if (!order) {
    return { success: false, error: 'Order not found' };
  }
  
  order.status = status;
  
  const data = getStorageData();
  const index = data.orders.findIndex(o => o.id === id);
  if (index !== -1) {
    data.orders[index] = order;
    setStorageData(data);
  }
  
  return { success: true };
}

export function deleteOrder(id: string): { success: boolean; error?: string } {
  initializeMockOrders();
  
  const index = mockOrders.findIndex(o => o.id === id);
  if (index === -1) {
    return { success: false, error: 'Order not found' };
  }
  
  mockOrders.splice(index, 1);
  
  const data = getStorageData();
  data.orders = data.orders.filter(o => o.id !== id);
  setStorageData(data);
  
  return { success: true };
}

export function getOrderStats(): {
  total: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  revenue: number;
} {
  initializeMockOrders();
  
  const orders = mockOrders;
  return {
    total: orders.length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    revenue: orders
      .filter(o => o.status === 'delivered' || o.status === 'shipped')
      .reduce((sum, o) => sum + o.total, 0),
  };
}
