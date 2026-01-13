import { LocalizedString } from './menu';

export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export interface OrderItemCustomization {
  id: string;
  name: LocalizedString;
  type: 'remove' | 'add';
  price: number;
}

export interface OrderItem {
  itemId: string;
  name: LocalizedString;
  quantity: number;
  basePrice: number;
  customizations: OrderItemCustomization[];
  itemNotes?: string;
  itemTotal: number;
}

export interface Customer {
  name: string;
  phone: string;
  email: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  customer: Customer;
  stripePaymentIntentId: string;
  pickupTime: string;
  specialInstructions: string | null;
  staffNotes: string | null;
  createdAt: string;
  updatedAt: string;
}
