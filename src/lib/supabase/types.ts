import { LocalizedString } from '@/types/menu';

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

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'> & {
          id?: string;
          order_number?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Order, 'id' | 'order_number'>>;
      };
    };
  };
}
