
import React, { useState, useEffect } from 'react';
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
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const { user, upgradePlan } = useUser();
  const { formatPrice } = useCurrency();
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  // Auto-format card number
  useEffect(() => {
    if (cardNumber.length > 0) {
      const cleaned = cardNumber.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const parts = cleaned.match(/.{1,4}/g);
      if (parts) setCardNumber(parts.join(' ').substring(0, 19));
    }
  }, [cardNumber]);

  if (!isOpen || !plan) return null;

  const handleGPayClick = () => {
    setShowGPaySheet(true);
  };

  const handleFinalSuccess = async () => {
    setPaymentSuccess(true);
    setProcessingStep('Subscription Activated! 🎉');
    
    // Play success sound if needed or just delay for visual
    await new Promise(r => setTimeout(r, 2000));
    
    // Credit allocation based on new pricing tiers
    let credits = 0;
    switch(plan.id) {
      case 'PAY_AS_YOU_GO': credits = 10; break; // Assumed starting pack
      case 'PRO': credits = 50; break;
      case 'POWER': credits = 100; break;
      case 'MANAGED': credits = 500; break;
      case 'ENTERPRISE': credits = 3000; break;
      default: credits = 3;
    }
    
    await upgradePlan(plan.id, credits);
    onSuccess();
    onClose();
    setPaymentSuccess(false);
  };

  const handleGPayConfirm = async () => {
    setLoading(true);
    setShowGPaySheet(false);
    setProcessingStep('Authorizing through Google...');
    
    try {
      await new Promise(r => setTimeout(r, 1500));
      setProcessingStep('Securing payment token...');
      await new Promise(r => setTimeout(r, 1000));
      await handleFinalSuccess();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProcessingStep('Verifying card details...');
    
    try {
      await new Promise(r => setTimeout(r, 1200));
      setProcessingStep('Communicating with bank...');
      await new Promise(r => setTimeout(r, 1200));
      setProcessingStep('Confirming subscription...');
      await new Promise(r => setTimeout(r, 800));
      await handleFinalSuccess();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Main Checkout Modal */}
      <div className="relative bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-gray-50 border-b border-gray-100 p-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Checkout</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-blue-600 font-black uppercase tracking-widest">{plan.name}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-xs text-gray-500 font-bold">{formatPrice(plan.priceValue)} {plan.id === 'PAY_AS_YOU_GO' ? 'per image' : 'billed monthly'}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100 transition-all hover:rotate-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8">
          {/* Method Tabs */}
          <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => setMethod('GPAY')}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${method === 'GPAY' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <img src="https://www.gstatic.com/instantbuy/svg/dark_gpay.svg" alt="GPay" className="h-4" />
            </button>
            <button 
              onClick={() => setMethod('CARD')}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${method === 'CARD' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              Card
            </button>
          </div>

          {method === 'GPAY' ? (
            <div className="py-2 space-y-8">
              <div className="text-center">
                <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">Fast, secure checkout with your Google Account.</p>
                <button 
                  onClick={handleGPayClick}
                  disabled={loading}
                  className="w-full bg-black hover:bg-gray-900 py-5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-black/10 group"
                >
                  <span className="text-white font-bold text-lg group-hover:translate-x-1 transition-transform">Buy with</span>
                  <img src="https://www.gstatic.com/instantbuy/svg/dark_gpay.svg" alt="Google Pay" className="h-7" />
                </button>
              </div>
              <div className="pt-4 flex flex-col items-center gap-4">
                 <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">
                   <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                   PCI-DSS COMPLIANT
                 </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCardPayment} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
               <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Card Number</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 font-bold tracking-widest placeholder:text-gray-300 transition-all"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                    <div className="w-8 h-5 bg-blue-600 rounded-sm"></div>
                    <div className="w-8 h-5 bg-orange-500 rounded-sm"></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Expiry</label>
                  <input 
                    type="text" 
                    value={expiry}
                    onChange={e => setExpiry(e.target.value)}
                    placeholder="MM / YY"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">CVC</label>
                  <input 
                    type="text" 
                    value={cvc}
                    onChange={e => setCvc(e.target.value)}
                    placeholder="123"
                    maxLength={3}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                    required
                  />
                </div>
              </div>
              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       {processingStep || 'Processing...'}
                    </div>
                  ) : `Pay ${formatPrice(plan.priceValue)}`}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center font-medium px-4">
                By subscribing, you agree to our Terms of Service. You can cancel anytime from your account settings.
              </p>
            </form>
          )}
        </div>

        {/* Global Loading / Success Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center z-[110] animate-in fade-in duration-300">
            {paymentSuccess ? (
              <div className="text-center animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mb-6 mx-auto shadow-xl shadow-green-100">
                  ✓
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Payment Successful</h3>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Redirecting to Dashboard...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 border-4 border-gray-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="font-black text-xl text-gray-900 mb-1">{processingStep || 'Processing Payment...'}</p>
                <p className="text-sm text-gray-400 font-medium">Please do not refresh the page</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Simulated Google Pay Sheet */}
      {showGPaySheet && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowGPaySheet(false)} />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-20 duration-500">
             <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <img src="https://www.gstatic.com/instantbuy/svg/dark_gpay.svg" alt="GPay" className="h-6" />
                <div className="text-right">
                  <span className="text-[10px] font-black text-gray-400 uppercase block leading-none mb-1">GOOGLE ACCOUNT</span>
                  <span className="text-xs font-bold text-gray-900">{user?.email}</span>
                </div>
             </div>
             <div className="p-8 space-y-6">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 font-medium">PropertyStage {plan.name}</span>
                   <span className="font-black text-gray-900 text-lg">{formatPrice(plan.priceValue)}</span>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-3xl flex items-center gap-5 border border-gray-100 hover:bg-gray-100/80 transition-colors cursor-pointer group">
                   <div className="w-12 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-[10px] text-white font-black shadow-lg">VISA</div>
                   <div className="flex-1">
                      <p className="text-sm font-black text-gray-900">Visa •••• 4242</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Default Payment Method</p>
                   </div>
                   <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </div>

                <div className="flex items-center gap-3 bg-blue-50/50 p-4 rounded-2xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">🛡️</div>
                  <p className="text-[10px] text-blue-700 leading-relaxed font-bold">
                    This transaction is protected by Google Pay Security. Your card details are never shared with PropertyStage.
                  </p>
                </div>

                <button 
                  onClick={handleGPayConfirm}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-blue-600/30 transition-all active:scale-95 mt-2"
                >
                  Confirm & Subscribe
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};