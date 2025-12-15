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

// Key for storing the active session user
const SESSION_KEY = 'property_stage_user_session';
// Key for storing the "database" of all users
const DB_KEY = 'property_stage_users_db';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to access the mock database
  const getDb = (): Record<string, User> => {
    try {
      const dbStr = localStorage.getItem(DB_KEY);
      return dbStr ? JSON.parse(dbStr) : {};
    } catch {
      return {};
    }
  };

  // Helper to save to the mock database
  const saveToDb = (u: User) => {
    const db = getDb();
    db[u.email] = u;
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  };

  // Initialize from session storage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem(SESSION_KEY);
    if (storedSession) {
      try {
        const sessionUser = JSON.parse(storedSession);
        // Refresh data from DB to ensure credits/plan are up to date
        const db = getDb();
        const freshUser = db[sessionUser.email] || sessionUser;
        setUser(freshUser);
      } catch (e) {
        console.error("Failed to parse session", e);
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Sync user state to session storage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  const login = async (email: string, name: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const db = getDb();
    let currentUser = db[email];

    if (!currentUser) {
      // If user doesn't exist in DB, create them (Auto-provisioning for this demo)
      currentUser = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        name: name || email.split('@')[0],
        email,
        plan: 'FREE',
        credits: 3,
        joinedDate: new Date().toLocaleDateString()
      };
      saveToDb(currentUser);
    }

    setUser(currentUser);
  };

  const signup = async (email: string, name: string) => {
    await login(email, name);
  };

  const logout = () => {
    setUser(null);
  };

  const upgradePlan = async (plan: PlanTier, credits: number) => {
    if (!user) return;
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    const updatedUser: User = {
      ...user,
      plan,
      credits
    };

    setUser(updatedUser);
    saveToDb(updatedUser);
  };

  const deductCredit = () => {
    if (!user) return false;
    
    // Check for unlimited credits
    if (user.credits === -1) return true;

    if (user.credits > 0) {
      const updatedUser: User = {
        ...user,
        credits: user.credits - 1
      };
      setUser(updatedUser);
      saveToDb(updatedUser);
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