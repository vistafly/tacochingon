export interface LocalizedString {
  en: string;
  es: string;
}

// Customization option for a menu item
export interface ItemCustomization {
  id: string;
  name: LocalizedString;
  type: 'remove' | 'add' | 'select'; // Remove ingredient, add extra, or select choice
  price?: number; // Additional price for 'add' type options
  default?: boolean; // Whether this is included by default (for 'remove' type)
  group?: string; // Group name for 'select' type (e.g., 'meat', 'flavor')
  groupLabel?: LocalizedString; // Display label for the group (only on first item in group)
}

export interface MenuItem {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  price: number;
  categoryId: string;
  category?: string;
  image: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  isVegetarian?: boolean;
  spiceLevel?: number;
  sortOrder: number;
  customizations?: ItemCustomization[]; // Available customization options
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: LocalizedString;
  description?: LocalizedString;
  sortOrder: number;
  isActive: boolean;
}
