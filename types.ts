
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  FARMER = 'FARMER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  // In a real app, password would be hashed and not stored/transmitted in plain text
  password?: string; // Only for registration/login, not stored long term client-side
  address?: string;
  phone?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number; // Available quantity
  unit: string; // e.g., 'kg', 'dozen', 'piece'
  imageUrl: string;
  farmerId: string;
  farmerName: string; // Denormalized for easier display
  category: string; // e.g., 'Vegetable', 'Fruit', 'Grain'
  dateAdded: string; // ISO string
  isAvailable: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number; // Quantity in cart
}

export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
}

export enum PaymentMethod {
  UPI = 'UPI',
  CARD = 'Credit/Debit Card',
  COD = 'Cash on Delivery',
}

export interface Order {
  id: string;
  userId: string;
  userName: string; // Denormalized
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  orderDate: string; // ISO string
  deliveryDate?: string; // ISO string
}

export interface FarmerRequest {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerEmail: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string; // ISO string
}
