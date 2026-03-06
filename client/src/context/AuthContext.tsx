import { createContext, useContext, useState, ReactNode } from 'react'; 
import { AuthContextType } from '../types/AuthContext.js';

// Create the context with a default value of null
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }){
  const [userStatus, setUserStatus] = useState<'allowed' | 'admin' | 'blacklisted' | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const login = (email: string, status: 'allowed' | 'admin' | 'blacklisted') => {
    setUserEmail(email);
    setUserStatus(status);
  };

  const logout = () => {
    setUserEmail(null);
    setUserStatus(null);
  };

  return (
    <AuthContext.Provider value={{
      userStatus,
      userEmail,
      login,
      logout,
      isAdmin: userStatus === 'admin'
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