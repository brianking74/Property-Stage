import React from 'react';
import { ViewState } from '../types';
import { useUser } from '../contexts/UserContext';
import { useCurrency } from '../contexts/CurrencyContext';

interface NavbarProps {
  onNavigate: (view: ViewState) => void;
  currentView: ViewState;
  onLoginClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView, onLoginClick }) => {
  const { user } = useUser();
  const { currency, setCurrency } = useCurrency();
  
  const scrollToSection = (sectionId: string) => {
    if (currentView !== ViewState.HOME) {
      onNavigate(ViewState.HOME);
      // Allow React a brief moment to render the Home view content before scrolling
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            {/* Currency Switcher */}
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="appearance-none bg-gray-50 border border-gray-200 hover:border-blue-300 text-gray-700 text-xs font-bold rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
              >
                <option value="USD">USD $</option>
                <option value="HKD">HKD $</option>
                <option value="GBP">GBP £</option>
                <option value="EUR">EUR €</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-200"></div>

            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => onNavigate(ViewState.HOME)}
            >
              <div className="bg-blue-600 p-1.5 rounded-lg mr-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:block">PropertyStage</span>
              <span className="font-bold text-xl tracking-tight text-gray-900 sm:hidden">PS</span>
            </div>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-blue-600 font-medium">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-blue-600 font-medium">Pricing</button>
            <button onClick={() => scrollToSection('examples')} className="text-gray-600 hover:text-blue-600 font-medium">Examples</button>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
               <div className="flex items-center gap-4">
                 <div className="hidden sm:flex flex-col items-end mr-2">
                   <span className="text-sm font-bold text-gray-900">{user.name}</span>
                   <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                     {user.credits === -1 ? '∞' : user.credits} credits
                   </span>
                 </div>
                 <div 
                   onClick={() => onNavigate(ViewState.ACCOUNT)}
                   className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all border border-gray-300"
                 >
                   👤
                 </div>
               </div>
            ) : (
              <>
                <button 
                  onClick={onLoginClick}
                  className="text-gray-600 hover:text-gray-900 font-medium hidden sm:block"
                >
                  Log in
                </button>
                <button 
                  onClick={onLoginClick}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};