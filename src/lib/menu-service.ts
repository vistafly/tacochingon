import { MenuItem, Category } from '@/types/menu';
import { mockMenuItems, getFeaturedItems, getItemsByCategory } from '@/data/mock-menu';
import { mockCategories } from '@/data/mock-categories';

// This service abstracts the data layer, making it easy to switch from mock to Firebase

export const menuService = {
  async getMenuItems(): Promise<MenuItem[]> {
    // In production, this would fetch from Firebase
    return mockMenuItems.filter(item => item.isAvailable);
  },

  async getAllMenuItems(): Promise<MenuItem[]> {
    return mockMenuItems;
  },

  async getMenuItemById(id: string): Promise<MenuItem | null> {
    return mockMenuItems.find(item => item.id === id) || null;
  },

  async getFeaturedItems(): Promise<MenuItem[]> {
    return getFeaturedItems().filter(item => item.isAvailable);
  },

  async getItemsByCategory(categoryId: string): Promise<MenuItem[]> {
    return getItemsByCategory(categoryId).filter(item => item.isAvailable);
  },

  async getCategories(): Promise<Category[]> {
    return mockCategories.filter(cat => cat.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async updateItemAvailability(id: string, isAvailable: boolean): Promise<void> {
    // In production, this would update Firebase
    const item = mockMenuItems.find(item => item.id === id);
    if (item) {
      item.isAvailable = isAvailable;
      item.updatedAt = new Date();
    }
  },
};
