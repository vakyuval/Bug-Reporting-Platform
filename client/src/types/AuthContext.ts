export interface AuthContextType {
  userStatus: 'allowed' | 'admin' | 'blacklisted' | null;  // null = not logged in yet
  userEmail: string | null;
  login: (email: string, status: 'allowed' | 'admin' | 'blacklisted') => void;
  logout: () => void;
  isAdmin: boolean;  
}