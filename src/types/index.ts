export type ItemStatus = 'available' | 'reserved' | 'gifted';
export type ItemPriority = 'must_have' | 'standard' | 'nice_to_have';
export type StoreName = 'Amazon' | 'Pepperfry' | 'Croma' | 'Myntra' | 'Nykaa' | 'IKEA' | 'Tanishq' | 'Other';
export type ItemCategory = 'All' | 'Kitchen & Dining' | 'Home & Living' | 'Electronics & Appliances' | 'Experiential & Honeymoon' | 'Bed & Bath';

export interface GroupContribution {
  id: string;
  guestName: string;
  guestPhone: string;
  amount: number;
  date: string;
  utr?: string;
  confirmedByCouple: boolean;
}

export interface RegistryItem {
  id: string;
  weddingId: string;
  title: string;
  url: string;
  affiliateUrl?: string;
  store: StoreName;
  category: Exclude<ItemCategory, 'All'>;
  image: string;
  price: number;
  isGroupGift: boolean;
  groupGoalAmount?: number;
  groupRaisedAmount: number;
  contributions: GroupContribution[];
  status: ItemStatus;
  reservedBy?: {
    name: string;
    phone: string;
    reservedAt: string; // ISO string
    reservedUntil: string; // ISO string (e.g. +48 hours)
  };
  giftedBy?: {
    name: string;
    phone?: string;
    orderId?: string;
    store?: string;
    note?: string;
    date: string;
  };
  priority: ItemPriority;
  notes?: string;
}

export interface DeliveryAddress {
  recipientName: string;
  line1: string;
  line2: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  deliveryInstructions?: string;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branch: string;
}

export interface ShagunGift {
  id: string;
  weddingId: string;
  guestName: string;
  guestPhone: string;
  amount: number;
  message: string;
  visibility: 'public' | 'anonymous_to_guests' | 'private';
  utr?: string;
  createdAt: string;
  confirmedByCouple: boolean;
  thankYouSent: boolean;
}

export interface Wedding {
  id: string;
  slug: string;
  brideName: string;
  groomName: string;
  weddingDate: string; // YYYY-MM-DD
  venue: string;
  city: string;
  coverImage: string;
  story: string;
  upiId: string;
  upiPayeeName: string;
  bankDetails: BankDetails;
  deliveryAddress: DeliveryAddress;
  inviteCode: string;
  enableAffiliateTags: boolean;
  affiliateTagId?: string;
}

export interface GuestProfile {
  name: string;
  phone: string;
  isLoggedIn: boolean;
}
