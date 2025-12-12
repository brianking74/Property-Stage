import React from 'react';
import { PricingTier, PlanTier, ViewState } from '../types';
import { useUser } from '../contexts/UserContext';
import { useCurrency } from '../contexts/CurrencyContext';

interface PricingProps {
  onNavigate: (view: ViewState) => void;
  onCheckout: (plan: PricingTier) => void;
}

const TIERS: PricingTier[] = [
  {
    id: 'FREE',
    name: 'Free Tier',
    price: '$0', // Kept for type compatibility but unused in display logic below
    priceValue: 0,
    description: 'Perfect for trying out the magic.',
    features: ['3 Images / day', 'Watermarked results', 'Standard resolution', 'Community support'],
    cta: 'Start Free'
  },
  {
    id: 'PRO',
    name: 'Pro Agent',
    price: '$9.99',
    priceValue: 9.99,
    description: 'For independent agents.',
    features: ['50 High Quality generations', 'Unlimited Basic Edits (Sky/Light)', 'No Watermark', 'Priority Processing'],
    cta: 'Go Pro',
    highlight: true
  },
  {
    id: 'POWER',
    name: 'Power User',
    price: '$14.99',
    priceValue: 14.99,
    description: 'For high volume listings.',
    features: ['Unlimited Generations*', '4K Upscaling', 'All Styles Unlocked', 'Fair Use Policy applies'],
    cta: 'Get Power'
  },
  {
    id: 'MANAGED',
    name: 'Managed',
    price: '$49.99',
    priceValue: 49.99,
    description: 'We do the work for you.',
    features: ['Unlimited Generations', 'Managed by our team', 'Send us raw files', '24h Turnaround', '1-on-1 Support'],
    cta: 'Contact Sales'
  }
];

export const Pricing: React.FC<PricingProps> = ({ onNavigate, onCheckout }) => {
  const { user } = useUser();
  const { formatPrice } = useCurrency();

  const handleCtaClick = (tier: PricingTier) => {
    if (tier.cta === 'Contact Sales') {
      window.location.href = 'mailto:support@propertystage.hk?subject=Managed%20Plan%20Inquiry';
      return;
    } 
    
    // For Paid plans, start checkout flow
    if (tier.priceValue > 0) {
      onCheckout(tier);
      return;
    }

    // For Free plan
    onNavigate(ViewState.DASHBOARD);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="py-20 bg-white" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            Choose the plan that fits your listing volume.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {TIERS.map((tier) => (
            <div 
              key={tier.name} 
              className={`relative flex flex-col p-8 bg-white border rounded-2xl shadow-sm transition-transform hover:-translate-y-1 ${
                tier.highlight ? 'border-blue-600 ring-2 ring-blue-600 ring-opacity-50' : 'border-gray-200'
              }`}
            >
              {tier.highlight && (
                <div className="absolute top-0 right-0 -mt-3 -mr-3 px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase rounded-full shadow-md">
                  Most Popular
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{tier.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-gray-900">
                  {formatPrice(tier.priceValue)}
                </span>
                {tier.priceValue !== 0 && <span className="text-gray-500">/mo</span>}
              </div>
              <ul className="mb-8 space-y-4 flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              
              {/* Button State Logic */}
              <button 
                onClick={() => handleCtaClick(tier)}
                disabled={user?.plan === tier.id}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors ${
                  user?.plan === tier.id
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : tier.highlight 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' 
                      : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {user?.plan === tier.id ? 'Current Plan' : tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};