import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loggedInAt: string;
}

interface AuthContextType {
  user: CustomerUser | null;
  isLoggedIn: boolean;
  isLoginModalOpen: boolean;
  loginReason: string;
  login: (user: CustomerUser) => void;
  logout: () => void;
  openLoginModal: (reason?: string, onSuccess?: () => void) => void;
  closeLoginModal: () => void;
  onLoginSuccessCallback?: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginReason, setLoginReason] = useState<string>('Please sign in to proceed.');
  const [onLoginSuccessCallback, setOnLoginSuccessCallback] = useState<(() => void) | undefined>(undefined);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ekaatra_customer_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name && parsed?.phone) {
          setUser(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const login = (userData: CustomerUser) => {
    setUser(userData);
    localStorage.setItem('ekaatra_customer_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ekaatra_customer_user');
  };

  const openLoginModal = (reason?: string, onSuccess?: () => void) => {
    setLoginReason(reason || 'To book a room and access guest services, please log in with your mobile number.');
    setOnLoginSuccessCallback(() => onSuccess);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setOnLoginSuccessCallback(undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: Boolean(user),
        isLoginModalOpen,
        loginReason,
        login,
        logout,
        openLoginModal,
        closeLoginModal,
        onLoginSuccessCallback
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
