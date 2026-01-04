import { BusinessSettings } from '@/types/settings';
import { mockSettings } from '@/data/mock-settings';

// This service abstracts the data layer, making it easy to switch from mock to Firebase

let settings = { ...mockSettings };

export const settingsService = {
  async getSettings(): Promise<BusinessSettings> {
    // In production, this would fetch from Firebase
    return settings;
  },

  async updateSettings(data: Partial<BusinessSettings>): Promise<void> {
    // In production, this would update Firebase
    settings = { ...settings, ...data };
  },

  async toggleAcceptingOrders(isAccepting: boolean, message?: string): Promise<void> {
    settings.isAcceptingOrders = isAccepting;
    settings.pauseMessage = message || null;
  },
};
