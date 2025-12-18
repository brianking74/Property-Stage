
export enum ViewState {
  HOME = 'HOME',
  DASHBOARD = 'DASHBOARD',
  ACCOUNT = 'ACCOUNT',
  ADMIN = 'ADMIN'
}

export type PlanTier = 'FREE' | 'PRO' | 'POWER' | 'MANAGED';
export type Currency = 'USD' | 'HKD' | 'EUR' | 'GBP';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: PlanTier;
  credits: number; // -1 for unlimited
  joinedDate: string;
  profileImage?: string;
  isAdmin?: boolean;
}

export interface PricingTier {
  id: PlanTier;
  name: string;
  price: string;
  priceValue: number;
  description: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

export type RoomType = 'Living Room' | 'Bedroom' | 'Dining Room' | 'Kitchen' | 'Office' | 'Bathroom' | 'Exterior';

export interface TransformationType {
  id: string;
  label: string;
  promptPrefix: string;
  icon: string;
  description: string;
}

export interface GenerationHistory {
  id: string;
  original: string;
  transformed: string;
  style: string;
  timestamp: number;
}
