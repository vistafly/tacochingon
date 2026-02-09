export interface DayHours {
  open: string;  // "17:30" (24-hour format)
  close: string; // "23:30"
}

export interface BusinessHours {
  monday: DayHours | null;
  tuesday: DayHours | null;
  wednesday: DayHours | null;
  thursday: DayHours | null;
  friday: DayHours | null;
  saturday: DayHours | null;
  sunday: DayHours | null;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface BusinessSettings {
  businessName: string;
  phone: string;
  email: string;
  address: Address;
  hours: BusinessHours;
  prepTime: number;
  taxRate: number;
  isAcceptingOrders: boolean;
  pauseMessage: string | null;
  isOpen: boolean;
  statusMessage: string | null;
  updatedAt: string | null;
}
