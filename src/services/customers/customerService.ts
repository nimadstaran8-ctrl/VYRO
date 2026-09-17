const CUSTOMERS_STORAGE_KEY = 'vyro_customers_repository';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  registrationDate: string;
  address?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
}

export interface CustomerOrder {
  id: string;
  date: string;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export interface CustomerStorageData {
  customers: Customer[];
  version: number;
}

function getStorageData(): CustomerStorageData {
  try {
    const data = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as CustomerStorageData;
    }
  } catch {
  }
  return { customers: [], version: 1 };
}

function setStorageData(data: CustomerStorageData): void {
  try {
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(data));
  } catch {
  }
}

function generateCustomerId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `CUST-${timestamp}-${random}`.toUpperCase();
}

let initialized = false;
let mockCustomers: Customer[] = [];

function initializeMockCustomers(): void {
  if (initialized) return;
  
  const stored = getStorageData();
  if (stored.customers.length > 0) {
    mockCustomers = stored.customers;
  } else {
    mockCustomers = [
      {
        id: 'CUST-001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+98 912 345 6789',
        orderCount: 3,
        totalSpent: 156,
        registrationDate: '2026-01-15',
      },
      {
        id: 'CUST-002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+98 912 345 6790',
        orderCount: 5,
        totalSpent: 289,
        registrationDate: '2026-02-20',
      },
      {
        id: 'CUST-003',
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@example.com',
        phone: '+98 912 345 6791',
        orderCount: 1,
        totalSpent: 68,
        registrationDate: '2026-06-10',
      },
      {
        id: 'CUST-004',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.j@example.com',
        phone: '+98 912 345 6792',
        orderCount: 7,
        totalSpent: 412,
        registrationDate: '2026-03-05',
      },
      {
        id: 'CUST-005',
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie.b@example.com',
        phone: '+98 912 345 6793',
        orderCount: 2,
        totalSpent: 95,
        registrationDate: '2026-07-22',
      },
    ];
    mockCustomers.forEach(customer => {
      const existing = getStorageData().customers.find(c => c.id === customer.id);
      if (!existing) {
        addCustomerToStorage(customer);
      }
    });
  }
  initialized = true;
}

function addCustomerToStorage(customer: Customer): void {
  const data = getStorageData();
  data.customers.push(customer);
  setStorageData(data);
}

export function getCustomers(): Customer[] {
  initializeMockCustomers();
  return [...mockCustomers].sort((a, b) => 
    new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
  );
}

export function getCustomerById(id: string): Customer | undefined {
  initializeMockCustomers();
  return mockCustomers.find(c => c.id === id);
}

export function getCustomerByEmail(email: string): Customer | undefined {
  initializeMockCustomers();
  return mockCustomers.find(c => c.email.toLowerCase() === email.toLowerCase());
}

export function searchCustomers(query: string): Customer[] {
  initializeMockCustomers();
  const lowerQuery = query.toLowerCase();
  return mockCustomers.filter(c => 
    c.firstName.toLowerCase().includes(lowerQuery) ||
    c.lastName.toLowerCase().includes(lowerQuery) ||
    c.email.toLowerCase().includes(lowerQuery) ||
    c.id.toLowerCase().includes(lowerQuery)
  );
}

export function createCustomer(data: Omit<Customer, 'id' | 'orderCount' | 'totalSpent' | 'registrationDate'>): 
  { success: boolean; customer?: Customer; error?: string } {
  initializeMockCustomers();
  
  if (mockCustomers.some(c => c.email.toLowerCase() === data.email.toLowerCase())) {
    return { success: false, error: 'Customer with this email already exists' };
  }
  
  const customer: Customer = {
    ...data,
    id: generateCustomerId(),
    orderCount: 0,
    totalSpent: 0,
    registrationDate: new Date().toISOString().split('T')[0],
  };
  
  mockCustomers.push(customer);
  addCustomerToStorage(customer);
  
  return { success: true, customer };
}

export function updateCustomer(
  id: string, 
  updates: Partial<Omit<Customer, 'id'>>
): { success: boolean; error?: string } {
  initializeMockCustomers();
  
  const customer = mockCustomers.find(c => c.id === id);
  if (!customer) {
    return { success: false, error: 'Customer not found' };
  }
  
  if (updates.email && updates.email.toLowerCase() !== customer.email.toLowerCase()) {
    const existing = mockCustomers.find(c => c.email.toLowerCase() === updates.email!.toLowerCase() && c.id !== id);
    if (existing) {
      return { success: false, error: 'Email already in use' };
    }
  }
  
  Object.assign(customer, updates);
  
  const data = getStorageData();
  const index = data.customers.findIndex(c => c.id === id);
  if (index !== -1) {
    data.customers[index] = customer;
    setStorageData(data);
  }
  
  return { success: true };
}

export function deleteCustomer(id: string): { success: boolean; error?: string } {
  initializeMockCustomers();
  
  const index = mockCustomers.findIndex(c => c.id === id);
  if (index === -1) {
    return { success: false, error: 'Customer not found' };
  }
  
  mockCustomers.splice(index, 1);
  
  const data = getStorageData();
  data.customers = data.customers.filter(c => c.id !== id);
  setStorageData(data);
  
  return { success: true };
}

export function getCustomerStats(): {
  total: number;
  totalSpent: number;
  averageOrderValue: number;
} {
  initializeMockCustomers();
  
  const totalSpent = mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrders = mockCustomers.reduce((sum, c) => sum + c.orderCount, 0);
  
  return {
    total: mockCustomers.length,
    totalSpent,
    averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
  };
}

export function getRecentCustomers(limit = 5): Customer[] {
  initializeMockCustomers();
  return [...mockCustomers]
    .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
    .slice(0, limit);
}

export function incrementCustomerOrderStats(
  customerId: string, 
  orderTotal: number
): { success: boolean; error?: string } {
  initializeMockCustomers();
  
  const customer = mockCustomers.find(c => c.id === customerId);
  if (!customer) {
    return { success: false, error: 'Customer not found' };
  }
  
  customer.orderCount += 1;
  customer.totalSpent += orderTotal;
  
  const data = getStorageData();
  const index = data.customers.findIndex(c => c.id === customerId);
  if (index !== -1) {
    data.customers[index] = customer;
    setStorageData(data);
  }
  
  return { success: true };
}
