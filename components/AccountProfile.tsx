
import React, { useRef, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { ViewState, GenerationHistory } from '../types';
import { ImageSlider } from './ImageSlider';

export const AccountProfile: React.FC<{ onNavigate: (view: ViewState) => void }> = ({ onNavigate }) => {
  const { user, history, logout, updateProfileImage, clearHistory } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<GenerationHistory | null>(null);

  if (!user) {
    onNavigate(ViewState.HOME);
    return null;
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'PRO': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'POWER': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MANAGED': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleUpgradeClick = () => {
    onNavigate(ViewState.HOME);
    setTimeout(() => {
      const element = document.getElementById('pricing');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 200;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          updateProfileImage(dataUrl);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Profile Card */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden mb-12">
        <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700"></div>
        
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-10">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div 
                  className="group relative w-32 h-32 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center border-4 border-white overflow-hidden cursor-pointer shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-5xl">👤</div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>

                <div className="text-center md:text-left mt-4 md:mt-24">
                  <h1 className="text-4xl font-black text-gray-900 mb-1 tracking-tight">{user.name}</h1>
                  <p className="text-gray-500 text-lg font-medium">{user.email}</p>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  logout();
                  onNavigate(ViewState.HOME);
                }}
                className="text-red-600 font-bold hover:bg-red-50 px-6 py-3 rounded-2xl transition-all md:mt-24 border border-transparent hover:border-red-100 active:scale-95"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Current Subscription</h3>
              <div className="flex items-center justify-between mb-6">
                <span className={`px-5 py-2 rounded-2xl text-xs font-black border tracking-widest ${getPlanColor(user.plan)}`}>
                  {user.plan} PLAN
                </span>
                {user.plan === 'FREE' && (
                  <button 
                    onClick={handleUpgradeClick}
                    className="text-blue-600 text-sm font-black hover:underline"
                  >
                    Upgrade Now →
                  </button>
                )}
              </div>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Member Since</span>
                  <span className="font-black text-gray-900">{user.joinedDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Status</span>
                  <span className="flex items-center gap-2 font-black text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Usage & Credits</h3>
              <div className="mb-6">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-5xl font-black text-gray-900 tracking-tighter">
                    {user.credits === -1 ? '∞' : user.credits}
                  </span>
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">credits left</span>
                </div>
                {user.credits !== -1 && (
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (user.credits / 50) * 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                Credits are consumed per generation. Pro plans include bonus priority processing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Generation History Section */}
      <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
        <div className="flex items-center justify-between mb-8 px-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Image History</h2>
            <p className="text-gray-500 font-medium">Your portfolio of persistent AI transformations.</p>
          </div>
          {history.length > 0 && (
            <button 
              onClick={() => {
                if (confirm("Delete all history? This cannot be undone.")) clearHistory();
              }}
              className="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors"
            >
              Clear Gallery
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {history.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedHistoryItem(item)}
              >
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  <img src={item.transformed} alt={item.style} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <span className="bg-white/90 backdrop-blur text-blue-600 px-4 py-2 rounded-full text-xs font-black opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all">VIEW COMPARISON</span>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-gray-900/60 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full border border-white/10 uppercase tracking-widest">
                      {item.style}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex justify-between items-center">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">
                    {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={item.transformed} 
                      download={`ps-staging-${item.id}.jpg`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 py-32 text-center">
            <div className="text-6xl mb-6">🏜️</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Your gallery is empty</h3>
            <p className="text-gray-500 font-medium mb-8 max-w-xs mx-auto">Upload property photos in the dashboard to start building your AI portfolio.</p>
            <button 
              onClick={() => onNavigate(ViewState.DASHBOARD)}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all active:scale-95"
            >
              Start Staging Now
            </button>
          </div>
        )}
      </section>

      {/* History Detail Modal */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-md" onClick={() => setSelectedHistoryItem(null)} />
          <div className="relative bg-white rounded-[3rem] shadow-2xl max-w-5xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Transformation Detail</h3>
                  <p className="text-sm font-medium text-gray-500">Staged using {selectedHistoryItem.style} style.</p>
                </div>
                <button 
                  onClick={() => setSelectedHistoryItem(null)}
                  className="w-12 h-12 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl flex items-center justify-center transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="rounded-[2rem] overflow-hidden border border-gray-100 bg-gray-50 shadow-inner">
                <ImageSlider 
                  beforeImage={selectedHistoryItem.original} 
                  afterImage={selectedHistoryItem.transformed} 
                  aspectRatio="16/9"
                />
              </div>

              <div className="mt-8 flex justify-between items-center">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Processed on {new Date(selectedHistoryItem.timestamp).toLocaleString()}
                </div>
                <a 
                  href={selectedHistoryItem.transformed} 
                  download="ps-staged-result.jpg"
                  className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download HD Result
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
