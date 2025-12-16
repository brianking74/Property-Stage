export enum ViewState {
  HOME = 'HOME',
  DASHBOARD = 'DASHBOARD',
  ACCOUNT = 'ACCOUNT'
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

export interface TransformationType {
  id: string;
  label: string;
  promptPrefix: string;
  icon: string;
}

export interface ComparisonImage {
  before: string;
  after: string;
  label: string;
}