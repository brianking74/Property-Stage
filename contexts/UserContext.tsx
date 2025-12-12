import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, PlanTier } from '../types';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, name: string) => Promise<void>;
  signup: (email: string, name: string) => Promise<void>;
  logout: () => void;
  upgradePlan: (plan: PlanTier, credits: number) => Promise<void>;
  deductCredit: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate checking session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('property_stage_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('property_stage_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('property_stage_user');
    }
  }, [user]);

  const login = async (email: string, name: string) => {
    // Mock login
    await new Promise(resolve => setTimeout(resolve, 800));
    // Simulate finding a user or creating a mock one
    setUser({
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      name: name || email.split('@')[0],
      email,
      plan: 'FREE',
      credits: 3,
      joinedDate: new Date().toLocaleDateString()
    });
  };

  const signup = async (email: string, name: string) => {
    await login(email, name);
  };

  const logout = () => {
    setUser(null);
  };

  const upgradePlan = async (plan: PlanTier, credits: number) => {
    if (!user) return;
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate payment processing
    setUser({
      ...user,
      plan,
      credits
    });
  };

  const deductCredit = () => {
    if (!user) return false;
    
    // Unlimited plans
    if (user.credits === -1) return true;

    if (user.credits > 0) {
      setUser({
        ...user,
        credits: user.credits - 1
      });
      return true;
    }
    return false;
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, signup, logout, upgradePlan, deductCredit }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
