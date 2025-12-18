
import React, { useState, useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import { User, PlanTier } from '../types';

export const AdminDashboard: React.FC = () => {
  const { getAllUsers } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<PlanTier | 'ALL'>('ALL');
  
  const users = useMemo(() => getAllUsers(), []);

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
      pro: users.filter(u => u.plan === 'PRO' || u.plan === 'POWER').length,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Admin Console</h1>
        <p className="text-gray-500 mt-1">Monitor agent activity and credit distribution</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Agents</p>
          <p className="text-3xl font-black text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Paid Subscriptions</p>
          <p className="text-3xl font-black text-blue-600">{stats.pro}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Distributed Credits</p>
          <p className="text-3xl font-black text-green-600">{stats.credits}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase">Plan:</span>
          <select 
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value as any)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ALL">All Plans</option>
            <option value="FREE">Free</option>
            <option value="PRO">Pro</option>
            <option value="POWER">Power</option>
            <option value="MANAGED">Managed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Agent</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Credits Left</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.length > 0 ? filteredUsers.map(u => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-50 shadow-inner">
                      {u.profileImage ? <img src={u.profileImage} className="w-full h-full rounded-full object-cover" /> : u.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.joinedDate}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase ${getPlanBadge(u.plan)}`}>
                    {u.plan}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-bold ${u.credits === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                    {u.credits === -1 ? 'Unlimited (∞)' : u.credits}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-xs font-bold">Edit Plan</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">
                  No agents found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
