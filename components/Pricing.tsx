
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
    name: 'Free',
    price: '$0',
    priceValue: 0,
    description: 'Test the app; watermarks on outputs.',
    features: ['3 Images / day (watermarked)', 'Basic staging & declutter', 'Basic image enhancement'],
    cta: 'Get Started'
  },
  {
    id: 'PAY_AS_YOU_GO',
    name: 'Pay As You Go',
    price: '$0.75',
    priceValue: 0.75,
    description: 'No commitment; ideal for occasional needs.',
    features: ['Unlimited (pay per use)', 'No watermarks', 'No recurring commitment'],
    cta: 'Top Up'
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '$14.99',
    priceValue: 14.99,
    description: 'Removes watermarks; priority processing.',
    features: ['50 High-quality images', 'No watermarks', 'Priority processing', 'Standard styles & resolution'],
    cta: 'Go Pro',
    highlight: true
  },
  {
    id: 'POWER',
    name: 'Power User',
    price: '$19.99',
    priceValue: 19.99,
    description: 'All Pro + more styles & resolution.',
    features: ['100 Generations / mo', 'More styles unlocked', 'Higher resolution output', 'Team sharing (2 seats)'],
    cta: 'Get Power'
  },
  {
    id: 'MANAGED',
    name: 'Managed',
    price: '$49.99',
    priceValue: 49.99,
    description: 'Done-for-you: we handle everything.',
    features: ['Unlimited (Fair use, 300-500)', 'Team handles uploads', 'Priority support', 'Up to 5 seats'],
    cta: 'Go Managed'
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 'Custom',
    priceValue: 0,
    description: 'Bespoke volume; full integration.',
    features: ['3,000+ Generations', 'White-labeling option', 'Full API integration', 'Managed add-ons'],
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

  const getPriceSuffix = (tierId: PlanTier) => {
    if (tierId === 'PAY_AS_YOU_GO') return '/ image';
    if (tierId === 'FREE' || tierId === 'ENTERPRISE') return '';
    return '/ mo';
  };

  return (
    <div className="py-24 bg-white" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-base font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Pricing Plans</h2>
          <p className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl">
            Scale Your Staging
          </p>
          <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
            Transparent pricing for agents of all sizes. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {TIERS.map((tier) => (
            <div 
              key={tier.id} 
              className={`relative flex flex-col p-8 bg-white border rounded-[2rem] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group ${
                tier.highlight 
                  ? 'border-blue-600 ring-2 ring-blue-600 ring-opacity-20 shadow-xl' 
                  : 'border-gray-100 shadow-sm'
              }`}
            >
              {tier.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl">
                  Recommended
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{tier.name}</h3>
                <p className="text-gray-500 text-sm font-medium mt-2">{tier.description}</p>
              </div>
              
              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-4xl font-black text-gray-900 tracking-tighter">
                  {tier.id === 'ENTERPRISE' ? 'Quote' : formatPrice(tier.priceValue)}
                </span>
                <span className="text-gray-400 font-bold text-sm">{getPriceSuffix(tier.id)}</span>
              </div>

              <div className="h-px bg-gray-50 w-full mb-8"></div>

              <ul className="mb-10 space-y-4 flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-600 font-medium leading-tight">
                    <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center shrink-0 mr-3 mt-0.5">
                      <svg className="h-3 w-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => handleCtaClick(tier)}
                disabled={user?.plan === tier.id}
                className={`w-full py-4 px-6 rounded-2xl font-black text-sm tracking-widest uppercase transition-all active:scale-95 ${
                  user?.plan === tier.id
                    ? 'bg-green-50 text-green-600 cursor-default border border-green-100'
                    : tier.highlight 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20' 
                      : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200'
                }`}
              >
                {user?.plan === tier.id ? 'Active Plan' : tier.cta}
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
            Trusted by 5,000+ Real Estate Agents Globally
          </p>
        </div>
      </div>
    </div>
  );
};