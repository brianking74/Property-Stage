
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, PlanTier, GenerationHistory } from '../types';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  history: GenerationHistory[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signup: (email: string, name: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  upgradePlan: (plan: PlanTier, credits: number) => Promise<void>;
  deductCredit: () => boolean;
  updateProfileImage: (image: string) => void;
  completeLogin: (user: User) => void;
  getAllUsers: () => User[];
  addToHistory: (entry: GenerationHistory) => void;
  clearHistory: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const SESSION_KEY = 'property_stage_user_session';
const DB_KEY = 'property_stage_users_db';
const HISTORY_KEY = 'property_stage_history_v1';

interface DbUser extends User {
  password?: string;
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getDb = (): Record<string, DbUser> => {
    try {
      const dbStr = localStorage.getItem(DB_KEY);
      const db = dbStr ? JSON.parse(dbStr) : {};
      
      const adminEmail = 'admin@propertystage.hk';
      if (!db[adminEmail]) {
        db[adminEmail] = {
          id: 'admin_1',
          name: 'System Admin',
          email: adminEmail,
          password: 'admin',
          plan: 'MANAGED',
          credits: -1,
          joinedDate: '1/1/2024',
          isAdmin: true
        };
        localStorage.setItem(DB_KEY, JSON.stringify(db));
      }
      return db;
    } catch {
      return {};
    }
  };

  const saveToDb = (u: DbUser) => {
    const db = getDb();
    db[u.email.toLowerCase()] = u;
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  };

  useEffect(() => {
    const storedSession = localStorage.getItem(SESSION_KEY);
    if (storedSession) {
      try {
        const sessionUser = JSON.parse(storedSession);
        const db = getDb();
        const freshUser = db[sessionUser.email.toLowerCase()];
        if (freshUser) {
          const { password, ...safeUser } = freshUser;
          setUser(safeUser);
          
          // Load history for this specific user
          const storedHistory = localStorage.getItem(`${HISTORY_KEY}_${safeUser.id}`);
          if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
          }
        }
      } catch (e) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (emailInput: string, passwordInput: string) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const db = getDb();
    const normalizedEmail = emailInput.toLowerCase();
    const existingUser = db[normalizedEmail];
    if (!existingUser) return { success: false, error: "Account not found. Please sign up." };
    if (existingUser.password !== passwordInput) return { success: false, error: "Incorrect password. Please try again." };
    const { password, ...safeUser } = existingUser;
    return { success: true, user: safeUser };
  };

  const completeLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(authenticatedUser));
    const storedHistory = localStorage.getItem(`${HISTORY_KEY}_${authenticatedUser.id}`);
    if (storedHistory) setHistory(JSON.parse(storedHistory));
    else setHistory([]);
  };

  const signup = async (emailInput: string, name: string, passwordInput: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const db = getDb();
    const normalizedEmail = emailInput.toLowerCase();
    if (db[normalizedEmail]) return { success: false, error: "Email already registered. Try logging in." };
    const newUser: DbUser = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      name: name || emailInput.split('@')[0],
      email: normalizedEmail,
      password: passwordInput,
      plan: 'FREE',
      credits: 3,
      joinedDate: new Date().toLocaleDateString(),
      isAdmin: false
    };
    saveToDb(newUser);
    const { password, ...safeUser } = newUser;
    return { success: true, user: safeUser };
  };

  const logout = () => {
    setUser(null);
    setHistory([]);
    localStorage.removeItem(SESSION_KEY);
  };

  const upgradePlan = async (plan: PlanTier, credits: number) => {
    if (!user) return;
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    const db = getDb();
    const dbUser = db[user.email.toLowerCase()];
    if (!dbUser) return;
    const updatedUser: DbUser = { ...dbUser, plan, credits };
    saveToDb(updatedUser);
    const { password, ...safeUser } = updatedUser;
    setUser(safeUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  };

  const deductCredit = () => {
    if (!user) return false;
    if (user.credits === -1) return true;
    const db = getDb();
    const dbUser = db[user.email.toLowerCase()];
    if (dbUser && dbUser.credits > 0) {
      const updatedUser: DbUser = { ...dbUser, credits: dbUser.credits - 1 };
      saveToDb(updatedUser);
      const { password, ...safeUser } = updatedUser;
      setUser(safeUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
      return true;
    }
    return false;
  };

  const updateProfileImage = (image: string) => {
    if (!user) return;
    const db = getDb();
    const dbUser = db[user.email.toLowerCase()];
    if (!dbUser) return;
    const updatedUser: DbUser = { ...dbUser, profileImage: image };
    saveToDb(updatedUser);
    const { password, ...safeUser } = updatedUser;
    setUser(safeUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  };

  const getAllUsers = () => {
    const db = getDb();
    return Object.values(db).map(({ password, ...user }) => user);
  };

  const addToHistory = (entry: GenerationHistory) => {
    if (!user) return;
    setHistory(prev => {
      const newHistory = [entry, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem(`${HISTORY_KEY}_${user.id}`, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    if (!user) return;
    setHistory([]);
    localStorage.removeItem(`${HISTORY_KEY}_${user.id}`);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isLoading, 
      history,
      login, 
      signup, 
      logout, 
      upgradePlan, 
      deductCredit, 
      updateProfileImage,
      completeLogin,
      getAllUsers,
      addToHistory,
      clearHistory
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUser must be used within a UserProvider');
  return context;
};
