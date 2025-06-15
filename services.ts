
// Fix: Import PRODUCT_CATEGORIES and PRODUCT_UNITS from './constants' instead of './types'
import { User, UserRole, Product, Order, CartItem, OrderStatus, PaymentMethod, FarmerRequest } from './types';
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from './constants';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

const MOCK_DB_USERS = 'kissanBazzarUsers';
const MOCK_DB_PRODUCTS = 'kissanBazzarProducts';
const MOCK_DB_ORDERS = 'kissanBazzarOrders';
const MOCK_DB_FARMER_REQUESTS = 'kissanBazzarFarmerRequests';
const CURRENT_USER_KEY = 'kissanBazzarCurrentUser';

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize mock data if not present
const initializeMockData = () => {
  if (!localStorage.getItem(MOCK_DB_USERS)) {
    const adminUser: User = { id: uuidv4(), email: 'admin@kissan.com', name: 'Admin User', role: UserRole.ADMIN, password: 'adminpassword' };
    const farmerUser: User = { id: uuidv4(), email: 'farmer@kissan.com', name: 'Raju Farmer', role: UserRole.FARMER, password: 'farmerpassword', address: '123 Farm Lane, Villagetown', phone: '9876543210' };
    const customerUser: User = { id: uuidv4(), email: 'customer@kissan.com', name: 'Priya Customer', role: UserRole.CUSTOMER, password: 'customerpassword', address: 'Apt 4B, City Towers, Urbansville', phone: '1234567890' };
    localStorage.setItem(MOCK_DB_USERS, JSON.stringify([adminUser, farmerUser, customerUser]));
  }

  if (!localStorage.getItem(MOCK_DB_PRODUCTS)) {
    const users: User[] = JSON.parse(localStorage.getItem(MOCK_DB_USERS) || '[]');
    const farmer = users.find(u => u.role === UserRole.FARMER);
    const initialProducts: Product[] = farmer ? [
      { id: uuidv4(), name: 'Fresh Tomatoes', description: 'Vine-ripened, juicy tomatoes.', price: 50, quantity: 100, unit: 'kg', imageUrl: 'https://picsum.photos/seed/tomatoes/400/300', farmerId: farmer.id, farmerName: farmer.name, category: 'Vegetable', dateAdded: new Date().toISOString(), isAvailable: true },
      { id: uuidv4(), name: 'Organic Spinach', description: 'Tender and nutritious spinach leaves.', price: 30, quantity: 50, unit: 'bunch', imageUrl: 'https://picsum.photos/seed/spinach/400/300', farmerId: farmer.id, farmerName: farmer.name, category: 'Vegetable', dateAdded: new Date().toISOString(), isAvailable: true },
      { id: uuidv4(), name: 'Sweet Mangoes', description: 'Alphonso mangoes, sweet and delicious.', price: 200, quantity: 20, unit: 'dozen', imageUrl: 'https://picsum.photos/seed/mangoes/400/300', farmerId: farmer.id, farmerName: farmer.name, category: 'Fruit', dateAdded: new Date().toISOString(), isAvailable: false }, // Example of unavailable
       { id: uuidv4(), name: 'Crisp Apples', description: 'Freshly picked Shimla apples.', price: 120, quantity: 80, unit: 'kg', imageUrl: 'https://picsum.photos/seed/apples/400/300', farmerId: farmer.id, farmerName: farmer.name, category: 'Fruit', dateAdded: new Date().toISOString(), isAvailable: true },
      { id: uuidv4(), name: 'Basmati Rice', description: 'Premium quality long-grain Basmati rice.', price: 150, quantity: 200, unit: 'kg', imageUrl: 'https://picsum.photos/seed/rice/400/300', farmerId: farmer.id, farmerName: farmer.name, category: 'Grain', dateAdded: new Date().toISOString(), isAvailable: true },
    ] : [];
    localStorage.setItem(MOCK_DB_PRODUCTS, JSON.stringify(initialProducts));
  }
  if (!localStorage.getItem(MOCK_DB_ORDERS)) {
    localStorage.setItem(MOCK_DB_ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(MOCK_DB_FARMER_REQUESTS)) {
    localStorage.setItem(MOCK_DB_FARMER_REQUESTS, JSON.stringify([]));
  }
};

initializeMockData();

// Auth Services
export const mockLogin = async (email: string, password_input: string): Promise<User | null> => {
  await delay(500);
  const users: User[] = JSON.parse(localStorage.getItem(MOCK_DB_USERS) || '[]');
  const user = users.find(u => u.email === email && u.password === password_input);
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }
  throw new Error('Invalid email or password');
};

export const mockRegister = async (userData: Omit<User, 'id'>): Promise<User | null> => {
  await delay(500);
  const users: User[] = JSON.parse(localStorage.getItem(MOCK_DB_USERS) || '[]');
  if (users.some(u => u.email === userData.email)) {
    throw new Error('User with this email already exists');
  }
  const newUser: User = { ...userData, id: uuidv4() };
  users.push(newUser);
  localStorage.setItem(MOCK_DB_USERS, JSON.stringify(users));
  
  // If registering as a farmer, create a farmer request for admin approval
  if (newUser.role === UserRole.FARMER) {
    const requests: FarmerRequest[] = JSON.parse(localStorage.getItem(MOCK_DB_FARMER_REQUESTS) || '[]');
    const newRequest: FarmerRequest = {
      id: uuidv4(),
      farmerId: newUser.id,
      farmerName: newUser.name,
      farmerEmail: newUser.email,
      status: 'Pending',
      requestDate: new Date().toISOString()
    };
    requests.push(newRequest);
    localStorage.setItem(MOCK_DB_FARMER_REQUESTS, JSON.stringify(requests));
  }

  // For simplicity, log in the user immediately after registration
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return newUser;
};

export const mockLogout = async (): Promise<void> => {
  await delay(200);
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const mockFetchCurrentUser = async (): Promise<User | null> => {
  await delay(100);
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};


// Product Services
export const mockFetchProducts = async (filters?: { category?: string; searchTerm?: string; farmerId?: string, page?: number, limit?: number }): Promise<{products: Product[], total: number}> => {
  await delay(300);
  let products: Product[] = JSON.parse(localStorage.getItem(MOCK_DB_PRODUCTS) || '[]');
  
  if (filters?.category) {
    products = products.filter(p => p.category === filters.category);
  }
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
  }
  if (filters?.farmerId) {
    products = products.filter(p => p.farmerId === filters.farmerId);
  }

  const total = products.length;

  if (filters?.page && filters?.limit) {
    const start = (filters.page - 1) * filters.limit;
    const end = start + filters.limit;
    products = products.slice(start, end);
  }

  return {products, total};
};

export const mockFetchProductById = async (id: string): Promise<Product | null> => {
  await delay(200);
  const products: Product[] = JSON.parse(localStorage.getItem(MOCK_DB_PRODUCTS) || '[]');
  return products.find(p => p.id === id) || null;
};

export const mockAddProduct = async (productData: Omit<Product, 'id' | 'dateAdded' | 'farmerName'>, farmer: User): Promise<Product> => {
  await delay(400);
  if (farmer.role !== UserRole.FARMER) throw new Error("Only farmers can add products.");
  
  // Farmer approval check (simplified - in real app, check DB status)
  const farmerRequests: FarmerRequest[] = JSON.parse(localStorage.getItem(MOCK_DB_FARMER_REQUESTS) || '[]');
  const farmerReq = farmerRequests.find(req => req.farmerId === farmer.id);
  if (!farmerReq || farmerReq.status !== 'Approved') {
     // Check if it's the initial seeded farmer (who doesn't need approval)
     const initialFarmer = (JSON.parse(localStorage.getItem(MOCK_DB_USERS) || '[]') as User[]).find(u => u.email === 'farmer@kissan.com');
     if (!initialFarmer || initialFarmer.id !== farmer.id) {
        throw new Error("Farmer account not approved yet. Please wait for admin approval.");
     }
  }

  const products: Product[] = JSON.parse(localStorage.getItem(MOCK_DB_PRODUCTS) || '[]');
  const newProduct: Product = { 
    ...productData, 
    id: uuidv4(), 
    dateAdded: new Date().toISOString(),
    farmerName: farmer.name, // Add farmer name
  };
  products.push(newProduct);
  localStorage.setItem(MOCK_DB_PRODUCTS, JSON.stringify(products));
  return newProduct;
};

export const mockUpdateProduct = async (productId: string, productData: Partial<Product>, farmerId: string): Promise<Product> => {
  await delay(400);
  const products: Product[] = JSON.parse(localStorage.getItem(MOCK_DB_PRODUCTS) || '[]');
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex === -1) throw new Error("Product not found");
  if (products[productIndex].farmerId !== farmerId) throw new Error("Unauthorized: You can only edit your own products.");

  products[productIndex] = { ...products[productIndex], ...productData };
  localStorage.setItem(MOCK_DB_PRODUCTS, JSON.stringify(products));
  return products[productIndex];
};

export const mockDeleteProduct = async (productId: string, farmerId: string): Promise<void> => {
  await delay(300);
  let products: Product[] = JSON.parse(localStorage.getItem(MOCK_DB_PRODUCTS) || '[]');
  const product = products.find(p => p.id === productId);
  if (!product) throw new Error("Product not found");
  if (product.farmerId !== farmerId) throw new Error("Unauthorized: You can only delete your own products.");
  
  products = products.filter(p => p.id !== productId);
  localStorage.setItem(MOCK_DB_PRODUCTS, JSON.stringify(products));
};

// Order Services
export const mockPlaceOrder = async (orderData: Omit<Order, 'id' | 'orderDate' | 'userName'>, user: User): Promise<Order> => {
  await delay(600);
  const orders: Order[] = JSON.parse(localStorage.getItem(MOCK_DB_ORDERS) || '[]');
  const newOrder: Order = { 
    ...orderData, 
    id: uuidv4(), 
    orderDate: new Date().toISOString(),
    userName: user.name
  };
  orders.push(newOrder);
  localStorage.setItem(MOCK_DB_ORDERS, JSON.stringify(orders));

  // Simulate stock update
  const products: Product[] = JSON.parse(localStorage.getItem(MOCK_DB_PRODUCTS) || '[]');
  newOrder.items.forEach(item => {
    const productIndex = products.findIndex(p => p.id === item.product.id);
    if (productIndex !== -1) {
      products[productIndex].quantity -= item.quantity;
      if (products[productIndex].quantity <= 0) {
        products[productIndex].isAvailable = false;
      }
    }
  });
  localStorage.setItem(MOCK_DB_PRODUCTS, JSON.stringify(products));

  return newOrder;
};

export const mockFetchOrders = async (filters: {userId?: string, farmerId?: string, status?: OrderStatus, page?: number, limit?: number}): Promise<{orders: Order[], total: number}> => {
  await delay(300);
  let orders: Order[] = JSON.parse(localStorage.getItem(MOCK_DB_ORDERS) || '[]');

  if (filters.userId) {
    orders = orders.filter(o => o.userId === filters.userId);
  }
  if (filters.farmerId) {
    orders = orders.filter(o => o.items.some(item => item.product.farmerId === filters.farmerId));
  }
  if (filters.status) {
    orders = orders.filter(o => o.status === filters.status);
  }
  orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()); // Sort by most recent

  const total = orders.length;
  if (filters.page && filters.limit) {
    const start = (filters.page - 1) * filters.limit;
    const end = start + filters.limit;
    orders = orders.slice(start, end);
  }
  return {orders, total};
};

export const mockFetchOrderById = async (orderId: string): Promise<Order | null> => {
  await delay(200);
  const orders: Order[] = JSON.parse(localStorage.getItem(MOCK_DB_ORDERS) || '[]');
  return orders.find(o => o.id === orderId) || null;
};

export const mockUpdateOrderStatus = async (orderId: string, status: OrderStatus, actorRole: UserRole): Promise<Order> => {
  await delay(300);
  if (actorRole !== UserRole.ADMIN && actorRole !== UserRole.FARMER) {
    throw new Error("Unauthorized to update order status.");
  }
  const orders: Order[] = JSON.parse(localStorage.getItem(MOCK_DB_ORDERS) || '[]');
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) throw new Error("Order not found.");
  
  orders[orderIndex].status = status;
  if (status === OrderStatus.DELIVERED) {
    orders[orderIndex].deliveryDate = new Date().toISOString();
  }
  localStorage.setItem(MOCK_DB_ORDERS, JSON.stringify(orders));
  return orders[orderIndex];
};

// Admin Services
export const mockFetchAllUsers = async (filters?: {role?: UserRole, page?: number, limit?: number}): Promise<{users: User[], total: number}> => {
  await delay(300);
  let users: User[] = JSON.parse(localStorage.getItem(MOCK_DB_USERS) || '[]');
  if (filters?.role) {
    users = users.filter(u => u.role === filters.role);
  }
  // Remove passwords for safety, even in mock
  users = users.map(u => { const { password, ...userWithoutPassword } = u; return userWithoutPassword; });
  
  const total = users.length;
  if (filters?.page && filters?.limit) {
    const start = (filters.page - 1) * filters.limit;
    const end = start + filters.limit;
    users = users.slice(start, end);
  }
  return {users, total};
};

export const mockFetchFarmerRequests = async (filters?: {status?: 'Pending' | 'Approved' | 'Rejected', page?: number, limit?: number}): Promise<{requests: FarmerRequest[], total: number}> => {
  await delay(300);
  let requests: FarmerRequest[] = JSON.parse(localStorage.getItem(MOCK_DB_FARMER_REQUESTS) || '[]');
  if (filters?.status) {
    requests = requests.filter(r => r.status === filters.status);
  }
  requests.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

  const total = requests.length;
  if (filters?.page && filters?.limit) {
    const start = (filters.page - 1) * filters.limit;
    const end = start + filters.limit;
    requests = requests.slice(start, end);
  }
  return {requests, total};
};

export const mockUpdateFarmerRequestStatus = async (requestId: string, status: 'Approved' | 'Rejected'): Promise<FarmerRequest> => {
  await delay(300);
  const requests: FarmerRequest[] = JSON.parse(localStorage.getItem(MOCK_DB_FARMER_REQUESTS) || '[]');
  const requestIndex = requests.findIndex(r => r.id === requestId);
  if (requestIndex === -1) throw new Error("Farmer request not found.");
  
  requests[requestIndex].status = status;
  localStorage.setItem(MOCK_DB_FARMER_REQUESTS, JSON.stringify(requests));
  return requests[requestIndex];
};

// Admin can update any product (e.g., for moderation)
export const mockAdminUpdateProduct = async (productId: string, productData: Partial<Product>): Promise<Product> => {
  await delay(400);
  const products: Product[] = JSON.parse(localStorage.getItem(MOCK_DB_PRODUCTS) || '[]');
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex === -1) throw new Error("Product not found");

  products[productIndex] = { ...products[productIndex], ...productData };
  localStorage.setItem(MOCK_DB_PRODUCTS, JSON.stringify(products));
  return products[productIndex];
};

export const mockAdminDeleteProduct = async (productId: string): Promise<void> => {
  await delay(300);
  let products: Product[] = JSON.parse(localStorage.getItem(MOCK_DB_PRODUCTS) || '[]');
  products = products.filter(p => p.id !== productId);
  localStorage.setItem(MOCK_DB_PRODUCTS, JSON.stringify(products));
};