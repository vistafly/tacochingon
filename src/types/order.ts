export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
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
  stripePaymentId: string;
  pickupTime: Date;
  specialInstructions: string | null;
  staffNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
