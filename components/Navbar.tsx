
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

  const getCreditBadgeColor = (credits: number) => {
    if (credits === -1) return 'bg-blue-50 text-blue-600 border-blue-100';
    if (credits === 0) return 'bg-red-50 text-red-600 border-red-100 animate-pulse';
    if (credits < 5) return 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse';
    return 'bg-green-50 text-green-600 border-green-100';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="appearance-none bg-gray-50 border border-gray-200 hover:border-blue-300 text-gray-700 text-xs font-black rounded-lg py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all uppercase tracking-wider"
              >
                <option value="USD">USD $</option>
                <option value="HKD">HKD $</option>
                <option value="GBP">GBP £</option>
                <option value="EUR">EUR €</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 group-hover:text-blue-500 transition-colors">
                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <div className="h-6 w-px bg-gray-200"></div>

            <div 
              className="flex items-center cursor-pointer group" 
              onClick={() => onNavigate(ViewState.HOME)}
            >
              <div className="bg-blue-600 p-1.5 rounded-xl mr-2 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-blue-600/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="font-black text-xl tracking-tight text-gray-900 hidden sm:block">PropertyStage</span>
              <span className="font-black text-xl tracking-tight text-gray-900 sm:hidden">PS</span>
            </div>
          </div>
          
          <div className="hidden md:flex space-x-8">
            {user?.isAdmin ? (
               <button 
                onClick={() => onNavigate(ViewState.ADMIN)} 
                className={`text-sm font-black transition-colors flex items-center gap-1.5 uppercase tracking-widest ${currentView === ViewState.ADMIN ? 'text-blue-600' : 'text-purple-600 hover:text-purple-700'}`}
              >
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                Admin Console
              </button>
            ) : (
              <>
                <button onClick={() => scrollToSection('features')} className="text-gray-500 hover:text-blue-600 text-sm font-bold transition-colors">Features</button>
                <button onClick={() => scrollToSection('pricing')} className="text-gray-500 hover:text-blue-600 text-sm font-bold transition-colors">Pricing</button>
                <button onClick={() => scrollToSection('examples')} className="text-gray-500 hover:text-blue-600 text-sm font-bold transition-colors">Gallery</button>
                <button onClick={() => scrollToSection('contact')} className="text-gray-500 hover:text-blue-600 text-sm font-bold transition-colors">Support</button>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
               <div className="flex items-center gap-4">
                 <div className="hidden sm:flex flex-col items-end mr-2">
                   <span className="text-sm font-black text-gray-900">{user.name}</span>
                   <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shadow-sm transition-colors ${getCreditBadgeColor(user.credits)}`}>
                     {user.credits === -1 ? 'UNLIMITED ACCESS' : `${user.credits} CREDITS LEFT`}
                   </span>
                 </div>
                 <div 
                   onClick={() => onNavigate(ViewState.ACCOUNT)}
                   className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center cursor-pointer hover:ring-4 hover:ring-blue-100 transition-all border border-gray-200 shadow-sm overflow-hidden"
                 >
                   {user.profileImage ? (
                     <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-xl">👤</span>
                   )}
                 </div>
               </div>
            ) : (
              <>
                <button 
                  onClick={onLoginClick}
                  className="text-gray-500 hover:text-gray-900 text-sm font-black transition-colors hidden sm:block"
                >
                  Log in
                </button>
                <button 
                  onClick={onLoginClick}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
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
