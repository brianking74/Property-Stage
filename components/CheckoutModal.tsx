
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

type PaymentMethod = 'CARD' | 'GPAY';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, plan, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('GPAY');
  const [processingStep, setProcessingStep] = useState('');
  const [showGPaySheet, setShowGPaySheet] = useState(false);
  
  // Added user to destructuring to fix line 190 error
  const { user, upgradePlan } = useUser();
  const { formatPrice } = useCurrency();
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  if (!isOpen || !plan) return null;

  const handleGPayClick = () => {
    setShowGPaySheet(true);
    // Mock the Google Pay Sheet process
    setProcessingStep('Initializing Google Pay...');
    setTimeout(() => setProcessingStep('Requesting payment authorization...'), 1000);
  };

  const handleGPayConfirm = async () => {
    setLoading(true);
    setShowGPaySheet(false);
    setProcessingStep('Authorizing through Google...');
    
    try {
      await new Promise(r => setTimeout(r, 2000));
      let credits = plan.id === 'PRO' ? 50 : -1;
      await upgradePlan(plan.id, credits);
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setProcessingStep('');
    }
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProcessingStep('Validating with Card Issuer...');
    
    try {
      await new Promise(r => setTimeout(r, 2500));
      let credits = plan.id === 'PRO' ? 50 : -1;
      await upgradePlan(plan.id, credits);
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Main Checkout Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{plan.name} • {formatPrice(plan.priceValue)}/mo</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6">
          {/* Method Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setMethod('GPAY')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${method === 'GPAY' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Google Pay
            </button>
            <button 
              onClick={() => setMethod('CARD')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${method === 'CARD' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Debit/Credit Card
            </button>
          </div>

          {method === 'GPAY' ? (
            <div className="py-4 space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-6">The safest and fastest way to pay.</p>
                <button 
                  onClick={handleGPayClick}
                  disabled={loading}
                  className="w-full bg-black hover:bg-gray-900 py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <img src="https://www.gstatic.com/instantbuy/svg/dark_gpay.svg" alt="Google Pay" className="h-6" />
                </button>
              </div>
              <div className="border-t border-gray-100 pt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                 Encrypted & Secure
              </div>
            </div>
          ) : (
            <form onSubmit={handleCardPayment} className="space-y-4">
               <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Card Number</label>
                <input 
                  type="text" 
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  placeholder="XXXX XXXX XXXX XXXX"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Expiry</label>
                  <input 
                    type="text" 
                    value={expiry}
                    onChange={e => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">CVC</label>
                  <input 
                    type="text" 
                    value={cvc}
                    onChange={e => setCvc(e.target.value)}
                    placeholder="123"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Pay ${formatPrice(plan.priceValue)}`}
              </button>
            </form>
          )}
        </div>

        {/* Global Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-[110]">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-gray-900">{processingStep || 'Processing Payment...'}</p>
          </div>
        )}
      </div>

      {/* Simulated Google Pay Sheet */}
      {showGPaySheet && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowGPaySheet(false)} />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
             <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <img src="https://www.gstatic.com/instantbuy/svg/dark_gpay.svg" alt="GPay" className="h-5" />
                <span className="text-sm font-medium text-gray-900">{user?.email}</span>
             </div>
             <div className="p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500">PropertyStage {plan.name}</span>
                   <span className="font-bold text-gray-900">{formatPrice(plan.priceValue)}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4 border border-gray-100">
                   <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-[8px] text-white font-bold">VISA</div>
                   <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">Visa •••• 4242</p>
                      <p className="text-xs text-gray-500">Google Pay Balance: $0.00</p>
                   </div>
                   <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">
                  By clicking Pay, you agree to the Google Payments Terms of Service and Privacy Policy. Your payment info is secured and handled by Google.
                </p>
                <button 
                  onClick={handleGPayConfirm}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all active:scale-95"
                >
                  Pay Now
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
