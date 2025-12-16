import React, { useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { ViewState } from '../types';

export const AccountProfile: React.FC<{ onNavigate: (view: ViewState) => void }> = ({ onNavigate }) => {
  const { user, logout, updateProfileImage } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    onNavigate(ViewState.HOME);
    return null;
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'PRO': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'POWER': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Simple resize logic to prevent huge strings in localStorage
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 200; // Thumbnail size
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
          
          // Save compressed base64
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          updateProfileImage(dataUrl);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Background */}
        <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-10">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                {/* Profile Image with Upload Overlay */}
                <div 
                  className="group relative w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white overflow-hidden cursor-pointer shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-5xl">👤</div>
                  )}
                  
                  {/* Overlay */}
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

                {/* User Info */}
                <div className="text-center md:text-left md:mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.name}</h1>
                  <p className="text-gray-500 text-lg">{user.email}</p>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  logout();
                  onNavigate(ViewState.HOME);
                }}
                className="text-red-600 font-medium hover:bg-red-50 px-5 py-2.5 rounded-lg transition-colors md:mb-2"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Plan Details */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Current Subscription</h3>
              <div className="flex items-center justify-between mb-4">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getPlanColor(user.plan)}`}>
                  {user.plan} PLAN
                </span>
                {user.plan === 'FREE' && (
                  <button 
                    onClick={() => onNavigate(ViewState.HOME)} // Redirect to pricing on home
                    className="text-blue-600 text-sm font-semibold hover:underline"
                  >
                    Upgrade Now
                  </button>
                )}
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Member Since</span>
                  <span className="font-medium text-gray-900">{user.joinedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
              </div>
            </div>

            {/* Credits & Usage */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Usage & Credits</h3>
              
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {user.credits === -1 ? '∞' : user.credits}
                  </span>
                  <span className="text-sm text-gray-500 mb-1">credits remaining</span>
                </div>
                {user.credits !== -1 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (user.credits / 50) * 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm">
                <div className="flex justify-between items-center text-gray-500 mb-2">
                  <span>Recent Activity</span>
                </div>
                {/* Mock Activity */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900">Modern Staging</span>
                    <span className="text-xs text-gray-400">Today</span>
                  </div>
                   <div className="flex justify-between items-center">
                    <span className="text-gray-900">Decluttering</span>
                    <span className="text-xs text-gray-400">Yesterday</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};