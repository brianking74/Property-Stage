
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ImageSlider } from './components/ImageSlider';
import { Features } from './components/Features';
import { Pricing } from './components/Pricing';
import { WhatsAppBot } from './components/WhatsAppBot';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AccountProfile } from './components/AccountProfile';
import { ContactForm } from './components/ContactForm';
import { AdminDashboard } from './components/AdminDashboard';
import { UserProvider, useUser } from './contexts/UserContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ViewState, PricingTier } from './types';

const HERO_BEFORE = "https://drive.google.com/thumbnail?id=1N264byF5QC5cjbf40IKDepFfgPXW4LSf&sz=w1920"; 
const HERO_AFTER = "https://drive.google.com/thumbnail?id=1P1pZBbKsH5bpt1GXhuGexWVT_PNgrU4i&sz=w1920"; 

const MainContent = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PricingTier | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  
  const { user } = useUser();

  useEffect(() => {
    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const selected = await aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      setHasKey(true);
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

  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-xl shadow-blue-200">✨</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">PropertyStage Setup</h1>
          <p className="text-gray-500 mb-8">
            To enable high-quality AI staging using Gemini 3 Pro, you must select your Google AI API key.
          </p>
          <div className="space-y-4">
            <button 
              onClick={handleSelectKey}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all"
            >
              Select API Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="block text-sm text-blue-600 font-medium hover:underline"
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
      case ViewState.HOME:
      default:
        return (
          <main>
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
                        beforeLabel="Empty"
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
