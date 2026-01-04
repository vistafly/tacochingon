import { MenuItem } from './menu';

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}
