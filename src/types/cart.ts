import { MenuItem } from './menu';

// Selected customization for an item in cart
export interface SelectedCustomization {
  id: string;
  type: 'remove' | 'add' | 'select';
  price?: number; // For add-ons with extra cost
  group?: string; // Group name for 'select' type
}

export interface CartItem {
  cartItemId: string; // Unique identifier for this cart entry
  item: MenuItem;
  quantity: number;
  notes?: string; // Special instructions for this item (max 100 chars)
  customizations?: SelectedCustomization[]; // Selected customizations (removals/additions)
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  orderNotes?: string; // General notes for the entire order
}
