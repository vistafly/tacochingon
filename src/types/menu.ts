export interface LocalizedString {
  en: string;
  es: string;
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
