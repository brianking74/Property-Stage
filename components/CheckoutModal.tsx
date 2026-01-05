
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { PricingTier } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PricingTier | null;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, plan, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  
  const { user } = useUser();
  const { formatPrice } = useCurrency();

  if (!isOpen || !plan) return null;

  const handleStripeCheckout = async () => {
    setLoading(true);
    setProcessingStep('Initializing Stripe Secure Session...');
    
    try {
      /**
       * REAL STRIPE IMPLEMENTATION STEPS:
       * 1. Your server creates a Checkout Session using stripe.checkout.sessions.create({
       *      line_items: [{ price: 'PRICE_ID_MAPPED_TO_PRODUCT', quantity: 1 }],
       *      mode: 'subscription', // or 'payment' for PAYG
       *      success_url: window.location.origin + '?success=true',
       *      cancel_url: window.location.origin + '?cancel=true',
       *    });
       * 2. The server returns the session ID.
       * 3. The frontend uses stripe.redirectToCheckout({ sessionId }).
       */

      // Placeholder for backend API call
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     productId: plan.stripePriceId, // e.g. prod_TjXIyXeIUdjXhU
      //     email: user?.email 
      //   }),
      // });
      
      // if (!response.ok) throw new Error("Payment gateway currently unavailable.");
      // const { sessionId } = await response.json();
      
      // const stripe = (window as any).Stripe('pk_live_your_actual_publishable_key');
      // await stripe.redirectToCheckout({ sessionId });

      // SIMULATED REDIRECT FOR PREVIEW:
      await new Promise(r => setTimeout(r, 1200));
      setProcessingStep('Handshaking with payment gateway...');
      await new Promise(r => setTimeout(r, 800));
      setProcessingStep(`Syncing ID: ${plan.stripePriceId}`);
      await new Promise(r => setTimeout(r, 1000));
      
      // In this simulated environment, we navigate to a success state
      onSuccess();
      onClose();
    } catch (e: any) {
      console.error("Stripe Checkout Error:", e);
      setProcessingStep(e.message || 'Error connecting to Stripe');
      setTimeout(() => setLoading(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-gray-50 border-b border-gray-100 p-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Activate Plan</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em]">Secure Checkout</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">{plan.stripePriceId}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100 transition-all hover:rotate-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-black text-blue-600 uppercase tracking-widest">{plan.name}</span>
              <span className="text-xl font-black text-gray-900">{formatPrice(plan.priceValue)}</span>
            </div>
            <p className="text-xs text-blue-800/70 font-medium leading-relaxed">
              {plan.description} {plan.id === 'PAY_AS_YOU_GO' ? 'Credit pack.' : 'Billed recurringly monthly.'} Cancel anytime.
            </p>
          </div>

          <ul className="space-y-3 mb-8">
             {plan.features.slice(0, 3).map((f, i) => (
               <li key={i} className="flex items-center gap-3 text-xs font-bold text-gray-600">
                 <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                 {f}
               </li>
             ))}
          </ul>

          <button 
            onClick={handleStripeCheckout}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {processingStep}
              </>
            ) : (
              <>
                Proceed to Secure Payment
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </>
            )}
          </button>
          
          <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col items-center gap-4">
            <div className="flex items-center gap-6 grayscale opacity-40">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-5" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
            </div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              Fully Encrypted SSL Checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
