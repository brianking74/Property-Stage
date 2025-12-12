import React from 'react';
import { useUser } from '../contexts/UserContext';
import { ViewState } from '../types';

export const AccountProfile: React.FC<{ onNavigate: (view: ViewState) => void }> = ({ onNavigate }) => {
  const { user, logout } = useUser();

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-8">
            <div className="flex items-end gap-6">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center text-4xl border-4 border-white">
                👤
              </div>
              <div className="mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                logout();
                onNavigate(ViewState.HOME);
              }}
              className="text-red-600 font-medium hover:bg-red-50 px-4 py-2 rounded-lg transition-colors mb-2"
            >
              Sign Out
            </button>
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
