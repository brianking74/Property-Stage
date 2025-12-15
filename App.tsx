import React, { useState } from 'react';
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
import { UserProvider, useUser } from './contexts/UserContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ViewState, PricingTier } from './types';

// ==========================================
// CUSTOMIZE HERO IMAGES HERE
// ==========================================
// To use your own images:
// 1. Upload your "Before" (Empty) image to a hosting site.
// 2. Paste the URL below in HERO_BEFORE.
// 3. Do the same for your "After" (Staged) image in HERO_AFTER.
// ==========================================

// FIX: Using Google Drive 'thumbnail' endpoint instead of 'view' to avoid 403 Forbidden errors
// BEFORE: Empty Room (User Provided)
const HERO_BEFORE = "https://drive.google.com/thumbnail?id=1N264byF5QC5cjbf40IKDepFfgPXW4LSf&sz=w1920"; 
// AFTER: Staged Room (User Provided)
const HERO_AFTER = "https://drive.google.com/thumbnail?id=1P1pZBbKsH5bpt1GXhuGexWVT_PNgrU4i&sz=w1920"; 

// Example 1: Virtual Decluttering & Staging (Messy -> Staged)
const EXAMPLE_1_BEFORE = "https://drive.google.com/thumbnail?id=1PPYAU8SgixQXpy3ty3BGVean6waJNeNB&sz=w1920"; // Messy
const EXAMPLE_1_AFTER = "https://drive.google.com/thumbnail?id=1liCQuvnKUaKP2ytVCNuYofjMsdO6wc1-&sz=w1920";  // Staged

// Example 2: Kitchen HDR Effect
const KITCHEN_BASE = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop";
const EXAMPLE_2_BEFORE = `${KITCHEN_BASE}&bri=-10&con=-10&exp=-10`; // Underexposed
const EXAMPLE_2_AFTER = `${KITCHEN_BASE}&bri=5&con=10&exp=5`; // Perfect exposure

const MainContent = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PricingTier | null>(null);
  
  const { user } = useUser();

  const scrollToExamples = () => {
    const element = document.getElementById('examples');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCheckoutRequest = (plan: PricingTier) => {
    if (!user) {
      setIsAuthModalOpen(true);
      // We'll resume checkout after login (simplified for now, user has to click again)
    } else {
      setSelectedPlanForCheckout(plan);
      setIsCheckoutModalOpen(true);
    }
  };

  const renderView = () => {
    switch(currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.ACCOUNT:
        return <AccountProfile onNavigate={setCurrentView} />;
      case ViewState.HOME:
      default:
        return (
          <main>
            {/* Hero Section */}
            <div className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
                  <div className="lg:col-span-5 text-center lg:text-left mb-12 lg:mb-0">
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6">
                      Trusted by Real Estate Agents Around The World
                    </div>
                    <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-6">
                      Turn Empty Rooms into <span className="text-blue-600">Sold Homes</span>
                    </h1>
                    <p className="mt-4 text-lg text-gray-500 mb-8">
                      Instantly stage empty properties with AI. Add furniture, improve lighting, and fix colors while keeping the exact room dimensions.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                      <button 
                        onClick={() => setCurrentView(ViewState.DASHBOARD)}
                        className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30"
                      >
                        Start Free Trial &rarr;
                      </button>
                      <button 
                        onClick={scrollToExamples}
                        className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        See Examples
                      </button>
                    </div>
                    <div className="mt-8 flex items-center justify-center lg:justify-start gap-8 text-gray-400">
                      <div>
                        <span className="block text-2xl font-bold text-gray-900">15s</span>
                        <span className="text-sm">Transformation</span>
                      </div>
                      <div>
                        <span className="block text-2xl font-bold text-gray-900">10k+</span>
                        <span className="text-sm">Images Staged</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-7">
                    <div className="relative rounded-2xl shadow-2xl overflow-hidden border-4 border-white bg-gray-100">
                      <ImageSlider 
                        beforeImage={HERO_BEFORE} 
                        afterImage={HERO_AFTER} 
                        beforeLabel="Empty"
                        afterLabel="Staged"
                        aspectRatio="3/2" 
                      />
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-4">Drag the slider to see the enhancement ✨</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Examples Section */}
            <div className="bg-gray-50 py-16" id="examples">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-12">
                   <h2 className="text-3xl font-bold text-gray-900">See the Difference</h2>
                   <p className="text-gray-500 mt-2">Our AI respects the original room structure while maximizing appeal.</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="flex flex-col gap-4">
                      <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
                        <ImageSlider 
                            beforeImage={EXAMPLE_1_BEFORE}
                            afterImage={EXAMPLE_1_AFTER}
                            beforeLabel="Messy"
                            afterLabel="Staged"
                            aspectRatio="3/2"
                        />
                      </div>
                      <p className="text-center text-lg font-medium text-gray-700">Virtual Decluttering & Staging</p>
                   </div>
                   
                   <div className="flex flex-col gap-4">
                      <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
                        <ImageSlider 
                            beforeImage={EXAMPLE_2_BEFORE}
                            afterImage={EXAMPLE_2_AFTER}
                            beforeLabel="Standard"
                            afterLabel="HDR Effect"
                            aspectRatio="3/2"
                        />
                      </div>
                      <p className="text-center text-lg font-medium text-gray-700">Detail & Color Enhancement</p>
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
                     <li><a href="#" className="hover:text-white">Features</a></li>
                     <li><a href="#" className="hover:text-white">Pricing</a></li>
                     <li><a href="#" className="hover:text-white">Login</a></li>
                   </ul>
                 </div>
                 <div>
                   <h4 className="font-semibold mb-4">Contact</h4>
                   <ul className="space-y-2 text-gray-400">
                     <li>support@propertystage.hk</li>
                     <li>+852 6799 2012</li>
                     <li>Central, Hong Kong</li>
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
           // If user was trying to checkout, reopen checkout modal
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