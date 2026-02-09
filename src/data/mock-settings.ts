import { BusinessSettings } from '@/types/settings';

export const mockSettings: BusinessSettings = {
  businessName: 'El Taco Chingon',
  phone: '(559) 417-7907',
  email: 'contact@eltacochingon.com',
  address: {
    street: '3349 N Blackstone Ave',
    city: 'Fresno',
    state: 'CA',
    zip: '93726',
    coordinates: {
      lat: 36.7806,
      lng: -119.7906,
    },
  },
  hours: {
    monday: null, // Closed
    tuesday: { open: '17:30', close: '23:30' },
    wednesday: { open: '17:30', close: '23:30' },
    thursday: { open: '17:30', close: '23:30' },
    friday: { open: '17:30', close: '23:30' },
    saturday: { open: '17:30', close: '23:30' },
    sunday: { open: '17:30', close: '23:30' },
  },
  prepTime: 30,
  taxRate: 0.0775, // 7.75% Fresno tax
  isAcceptingOrders: true,
  pauseMessage: null,
};
