
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ImageSlider } from './components/ImageSlider';
import { Features } from './components/Features';
import { Pricing } from './components/Pricing';
import { WhatsAppBot } from './components/WhatsAppBot';
import { Gallery } from './components/Gallery';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AccountProfile } from './components/AccountProfile';
import { ContactForm } from './components/ContactForm';
import { AdminDashboard } from './components/AdminDashboard';
import { UserProvider, useUser } from './contexts/UserContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ViewState, PricingTier } from './types';

// Updated Hero Images using the provided Google Drive IDs
const HERO_BEFORE = "https://drive.google.com/thumbnail?id=1Q4G1Y-kYaqy76VI3YaRbuWBgj6-7FCQ-&sz=w1920"; // Original Empty Room
const HERO_AFTER = "https://drive.google.com/thumbnail?id=12wKkaQdnwKxOWLakggCqnMXvMIlHbaLP&sz=w1920";  // Staged Room

const MainContent = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PricingTier | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Shared view images
  const [sharedImages, setSharedImages] = useState<{ before: string; after: string } | null>(null);
  
  const { user } = useUser();

  useEffect(() => {
    // Check for shared URL params or Stripe success
    const params = new URLSearchParams(window.location.search);
    const sb = params.get('sb');
    const sa = params.get('sa');
    const success = params.get('success');
    
    if (sb && sa) {
      setSharedImages({ before: sb, after: sa });
      setCurrentView(ViewState.SHARED);
    }

    if (success === 'true') {
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 8000);
      // Clean up URL
      window.history.replaceState({}, '', window.location.origin);
    }

    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        try {
          const selected = await aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } catch (e) {
          console.warn("Bridge detection failed, defaulting to app access", e);
          setHasKey(true);
        }
      } else {
        // Fallback for non-bridge environments (e.g., local dev)
        setHasKey(true);
      }
    };
    
    checkKey();
    
    // Check again after a short delay for slow-loading mobile bridges
    const timer = setTimeout(checkKey, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      try {
        await aistudio.openSelectKey();
        // Assume success to proceed immediately per guidelines
        setHasKey(true);
      } catch (e) {
        console.error("Failed to open key selector", e);
      }
    }
  };

  const handleCheckoutRequest = (plan: PricingTier) => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setSelectedPlanForCheckout(plan);
      setIsCheckoutModalOpen(true);
    }
  };

  // We only show the setup screen if explicitly detected as false.
  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-gray-100 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-blue-600 rounded-[1.8rem] flex items-center justify-center text-3xl mx-auto mb-8 shadow-2xl shadow-blue-200">✨</div>
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">AI Activation</h1>
          <p className="text-gray-500 mb-10 font-medium leading-relaxed">
            PropertyStage uses the high-end Gemini 3 Pro engine. To begin staging, please link your Google AI API key.
          </p>
          <div className="space-y-5">
            <button 
              onClick={handleSelectKey}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-95"
            >
              Select API Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="block text-sm text-blue-600 font-bold hover:underline"
            >
              Learn about billing & keys
            </a>
          </div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch(currentView) {
      case ViewState.ADMIN:
        return user?.isAdmin ? <AdminDashboard /> : <Dashboard />;
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.ACCOUNT:
        return <AccountProfile onNavigate={setCurrentView} />;
      case ViewState.SHARED:
        return (
          <div className="max-w-5xl mx-auto px-4 py-20 text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Shared Transformation</h2>
            <p className="text-gray-500 mb-10 font-medium">Behold the power of AI Virtual Staging.</p>
            {sharedImages && (
              <div className="rounded-3xl overflow-hidden border-8 border-white shadow-2xl bg-gray-100">
                <ImageSlider 
                  beforeImage={sharedImages.before} 
                  afterImage={sharedImages.after} 
                  aspectRatio="16/9"
                />
              </div>
            )}
            <div className="mt-12">
               <button 
                onClick={() => {
                  window.history.replaceState({}, '', window.location.origin);
                  setCurrentView(ViewState.HOME);
                }}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all"
               >
                 Create Your Own Staging &rarr;
               </button>
            </div>
          </div>
        );
      case ViewState.HOME:
      default:
        return (
          <main>
            {paymentSuccess && (
              <div className="fixed top-20 right-4 z-[200] bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10">
                <div className="bg-white/20 p-2 rounded-full">✓</div>
                <div>
                  <p className="font-black text-sm">Payment Successful!</p>
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Your plan has been upgraded.</p>
                </div>
              </div>
            )}

            <div className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
                  <div className="lg:col-span-5 text-center lg:text-left mb-12 lg:mb-0">
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6">
                      AI Staging Powered by Gemini 3 Pro
                    </div>
                    <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-6">
                      Turn Empty Rooms into <span className="text-blue-600">Sold Homes</span>
                    </h1>
                    <p className="mt-4 text-lg text-gray-500 mb-8">
                      Instantly stage empty properties with professional designs. Add furniture, improve lighting, and fix colors instantly.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                      <button 
                        onClick={() => {
                          if (user) {
                            setCurrentView(ViewState.DASHBOARD);
                          } else {
                            setIsAuthModalOpen(true);
                          }
                        }}
                        className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30"
                      >
                        {user ? 'Get Started' : 'Start Free Trial'} &rarr;
                      </button>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-7">
                    <div className="relative rounded-2xl shadow-2xl overflow-hidden border-4 border-white bg-gray-100 animate-fade-in-up">
                      <ImageSlider 
                        beforeImage={HERO_BEFORE} 
                        afterImage={HERO_AFTER} 
                        beforeLabel="Original"
                        afterLabel="Staged"
                        aspectRatio="3/2" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Features />
            <WhatsAppBot />
            <Gallery />
            <Pricing onNavigate={setCurrentView} onCheckout={handleCheckoutRequest} />
            <ContactForm />
            
            <footer className="bg-gray-900 text-white py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                 <div className="col-span-1 md:col-span-2">
                   <h3 className="text-xl font-bold mb-4">PropertyStage</h3>
                   <p className="text-gray-400 max-w-sm">Helping real estate agents sell faster with AI-powered visual enhancement.</p>
                 </div>
                 <div>
                   <h4 className="font-semibold mb-4">Product</h4>
                   <ul className="space-y-2 text-gray-400">
                     <li><a href="#features" className="hover:text-white">Features</a></li>
                     <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                   </ul>
                 </div>
                 <div>
                   <h4 className="font-semibold mb-4">Contact</h4>
                   <ul className="space-y-2 text-gray-400">
                     <li>support@propertystage.hk</li>
                     <li>+852 6799 2012</li>
                   </ul>
                 </div>
              </div>
            </footer>
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        onNavigate={setCurrentView} 
        currentView={currentView} 
        onLoginClick={() => setIsAuthModalOpen(true)}
      />
      
      {renderView()}

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
           if (selectedPlanForCheckout) {
             setIsCheckoutModalOpen(true);
           }
        }}
      />
      
      <CheckoutModal 
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        plan={selectedPlanForCheckout}
        onSuccess={() => {
          // Success is now handled by URL redirection in production,
          // but for this sandbox, we navigate to Account
          setCurrentView(ViewState.ACCOUNT);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};

function App() {
  return (
    <UserProvider>
      <CurrencyProvider>
        <MainContent />
      </CurrencyProvider>
    </UserProvider>
  );
}

export default App;
