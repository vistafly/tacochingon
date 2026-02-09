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
  type: 'remove' | 'add' | 'select';
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

// Order as stored in Firestore (snake_case to match existing data shape)
export interface Order {
  id: string;
  order_number: number;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  pickup_time: string;
  special_instructions: string | null;
  stripe_payment_intent_id: string;
  staff_notes: string | null;
  created_at: string;
  updated_at: string;
}
