
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, PlanTier } from '../types';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signup: (email: string, name: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  upgradePlan: (plan: PlanTier, credits: number) => Promise<void>;
  deductCredit: () => boolean;
  updateProfileImage: (image: string) => void;
  completeLogin: (user: User) => void;
  getAllUsers: () => User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const SESSION_KEY = 'property_stage_user_session';
const DB_KEY = 'property_stage_users_db';

interface DbUser extends User {
  password?: string;
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getDb = (): Record<string, DbUser> => {
    try {
      const dbStr = localStorage.getItem(DB_KEY);
      const db = dbStr ? JSON.parse(dbStr) : {};
      
      // Seed admin if DB is empty or missing admin
      if (!db['admin@propertystage.hk']) {
        db['admin@propertystage.hk'] = {
          id: 'admin_1',
          name: 'System Admin',
          email: 'admin@propertystage.hk',
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
    db[u.email] = u;
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  };

  useEffect(() => {
    const storedSession = localStorage.getItem(SESSION_KEY);
    if (storedSession) {
      try {
        const sessionUser = JSON.parse(storedSession);
        const db = getDb();
        const freshUser = db[sessionUser.email];
        if (freshUser) {
          const { password, ...safeUser } = freshUser;
          setUser(safeUser);
        }
      } catch (e) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, passwordInput: string) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const db = getDb();
    const existingUser = db[email];

    if (!existingUser) {
      return { success: false, error: "Account not found. Please sign up." };
    }

    if (existingUser.password !== passwordInput) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    const { password, ...safeUser } = existingUser;
    return { success: true, user: safeUser };
  };

  const completeLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(authenticatedUser));
  };

  const signup = async (email: string, name: string, passwordInput: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const db = getDb();
    if (db[email]) {
      return { success: false, error: "Email already registered. Try logging in." };
    }

    const newUser: DbUser = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      name: name || email.split('@')[0],
      email,
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
    localStorage.removeItem(SESSION_KEY);
  };

  const upgradePlan = async (plan: PlanTier, credits: number) => {
    if (!user) return;
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    const db = getDb();
    const dbUser = db[user.email];
    if (!dbUser) return;

    const updatedUser: DbUser = { ...dbUser, plan, credits };
    saveToDb(updatedUser);
    
    const { password, ...safeUser } = updatedUser;
    setUser(safeUser);
  };

  const deductCredit = () => {
    if (!user) return false;
    if (user.credits === -1) return true;

    const db = getDb();
    const dbUser = db[user.email];
    if (dbUser && dbUser.credits > 0) {
      const updatedUser: DbUser = { ...dbUser, credits: dbUser.credits - 1 };
      saveToDb(updatedUser);
      const { password, ...safeUser } = updatedUser;
      setUser(safeUser);
      return true;
    }
    return false;
  };

  const updateProfileImage = (image: string) => {
    if (!user) return;
    const db = getDb();
    const dbUser = db[user.email];
    if (!dbUser) return;

    const updatedUser: DbUser = { ...dbUser, profileImage: image };
    saveToDb(updatedUser);
    const { password, ...safeUser } = updatedUser;
    setUser(safeUser);
  };

  const getAllUsers = () => {
    const db = getDb();
    return Object.values(db).map(({ password, ...user }) => user);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      signup, 
      logout, 
      upgradePlan, 
      deductCredit, 
      updateProfileImage,
      completeLogin,
      getAllUsers
    }}>
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
