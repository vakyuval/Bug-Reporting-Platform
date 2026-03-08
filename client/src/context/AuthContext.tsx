import { createContext, useContext, useState, ReactNode } from 'react';
import { AuthContextType } from '../types/AuthContext.js';

const AUTH_KEY = 'auth_user';

// Create the context with a default value of null
const AuthContext = createContext<AuthContextType | null>(null);

// Read persisted auth from localStorage on startup
function loadPersistedAuth(): { email: string; status: 'allowed' | 'admin' | 'blacklisted' } | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const persisted = loadPersistedAuth();

  const [userStatus, setUserStatus] = useState<'allowed' | 'admin' | 'blacklisted' | null>(
    persisted?.status ?? null
  );
  const [userEmail, setUserEmail] = useState<string | null>(
    persisted?.email ?? null
  );

  // Saves the user's email and status — both in state and in localStorage for persistence.
  const login = (email: string, status: 'allowed' | 'admin' | 'blacklisted') => {
    setUserEmail(email);
    setUserStatus(status);
    localStorage.setItem(AUTH_KEY, JSON.stringify({ email, status }));
  };

  // Clears auth state and removes it from localStorage.
  const logout = () => {
    setUserEmail(null);
    setUserStatus(null);
    localStorage.removeItem(AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{
      userStatus,
      userEmail,
      login,
      logout,
      isAdmin: userStatus === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}