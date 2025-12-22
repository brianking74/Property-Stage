
import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import { User, PlanTier } from '../types';

export const AdminDashboard: React.FC = () => {
  const { getAllUsers } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<PlanTier | 'ALL'>('ALL');
  
  // Refresh users whenever the dashboard mounts or filter changes
  useEffect(() => {
    setUsers(getAllUsers());
  }, [getAllUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlan = filterPlan === 'ALL' || u.plan === filterPlan;
      return matchesSearch && matchesPlan;
    });
  }, [users, searchTerm, filterPlan]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      paid: users.filter(u => ['PRO', 'POWER', 'MANAGED'].includes(u.plan)).length,
      trial: users.filter(u => u.plan === 'FREE').length,
      credits: users.reduce((acc, u) => acc + (u.credits === -1 ? 0 : u.credits), 0)
    };
  }, [users]);

  const getPlanBadge = (plan: PlanTier) => {
    switch (plan) {
      case 'MANAGED': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'POWER': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'PRO': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Console</h1>
          <p className="text-gray-500 mt-1 font-medium">Monitoring {stats.total} total signups across the platform</p>
        </div>
        <button 
          onClick={() => setUsers(getAllUsers())}
          className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh Data
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Agents</p>
          <p className="text-4xl font-black text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Paid Subs</p>
          <p className="text-4xl font-black text-blue-600">{stats.paid}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Free Trials</p>
          <p className="text-4xl font-black text-gray-600">{stats.trial}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-3xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em] mb-2">Credits Out</p>
          <p className="text-4xl font-black text-green-600">{stats.credits}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input 
            type="text" 
            placeholder="Search agents by name or email..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Filter Plan:</span>
          <select 
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value as any)}
            className="flex-1 md:w-48 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="FREE">Free Trial</option>
            <option value="PRO">Pro Agent</option>
            <option value="POWER">Power User</option>
            <option value="MANAGED">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Agent Information</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Joined Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Subscription</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Credits Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length > 0 ? filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 font-black border border-gray-100 shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                        {u.profileImage ? (
                          <img src={u.profileImage} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg">{u.name[0]}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 leading-none mb-1">{u.name}</p>
                        <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-500 font-medium">{u.joinedDate}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-wider ${getPlanBadge(u.plan)}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <span className={`text-sm font-black ${u.credits === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                        {u.credits === -1 ? 'Unlimited Access' : `${u.credits} Remaining`}
                      </span>
                      {u.credits !== -1 && (
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${u.credits < 5 ? 'bg-red-400' : 'bg-green-400'}`}
                            style={{ width: `${Math.min(100, (u.credits / 10) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Online</span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="text-4xl mb-4">🔦</div>
                    <p className="text-gray-400 font-bold">No agents match your current filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
