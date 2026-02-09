import { BusinessSettings } from '@/types/settings';
import { mockSettings } from '@/data/mock-settings';
import { adminDb } from '@/lib/firebase/admin';

const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC = 'business';

export const settingsService = {
  async getSettings(): Promise<BusinessSettings> {
    try {
      const doc = await adminDb
        .collection(SETTINGS_COLLECTION)
        .doc(SETTINGS_DOC)
        .get();

      if (doc.exists) {
        return doc.data() as BusinessSettings;
      }

      // If no settings doc exists yet, seed with defaults and return them
      await adminDb
        .collection(SETTINGS_COLLECTION)
        .doc(SETTINGS_DOC)
        .set(mockSettings);
      return mockSettings;
    } catch (error) {
      console.error('Error fetching settings from Firestore:', error);
      return mockSettings;
    }
  },

  async updateSettings(data: Partial<BusinessSettings>): Promise<void> {
    await adminDb
      .collection(SETTINGS_COLLECTION)
      .doc(SETTINGS_DOC)
      .set(
        { ...data, updatedAt: new Date().toISOString() },
        { merge: true }
      );
  },

  async toggleAcceptingOrders(isAccepting: boolean, message?: string): Promise<void> {
    await adminDb
      .collection(SETTINGS_COLLECTION)
      .doc(SETTINGS_DOC)
      .set(
        {
          isAcceptingOrders: isAccepting,
          pauseMessage: message || null,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
  },
};
