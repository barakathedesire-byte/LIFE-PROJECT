import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, DeliveryAddress, SavedPaymentMethod, UserRole, UserAccount } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  currentAccount: UserAccount | null;
  activeRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (account: UserAccount, token: string) => void;
  login: (email: string, password?: string, role?: UserRole) => Promise<UserAccount>;
  register: (name: string, email: string, phone: string, region: string, city: string, role?: UserRole, businessName?: string, extraData?: Record<string, any>) => Promise<void>;
  socialLogin: (provider: 'google' | 'apple', email: string, name?: string, avatar?: string, action?: 'login' | 'register') => Promise<UserAccount>;
  logout: () => void;
  isRole: (roles: UserRole | UserRole[]) => boolean;
  updateProfile: (updated: Partial<UserProfile>) => void;
  addAddress: (address: DeliveryAddress) => void;
  deleteAddress: (index: number) => void;
  setDefaultAddress: (index: number) => void;
  addPaymentMethod: (method: SavedPaymentMethod) => void;
  deletePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
}

const STORAGE_KEY = 'lumo_auth_user';
const TOKEN_KEY = 'lumo_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('CUSTOMER');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Authenticated session check on startup
  useEffect(() => {
    async function initAuth() {
      setIsLoading(true);
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const res = await api.getCurrentUser();
          if (res && res.user) {
            setCurrentAccount(res.user);
            setActiveRole(res.user.role);
            const mappedUser: UserProfile = {
              id: res.user.id,
              name: res.user.name,
              email: res.user.email,
              phone: res.user.phone || '',
              region: 'Dar es Salaam',
              city: 'Kinondoni',
              role: res.user.role,
              sellerId: res.user.sellerId,
              salespersonId: res.user.salespersonId,
              warehouseId: res.user.warehouseId,
              pickupStationId: res.user.pickupStationId,
              addresses: [],
              paymentMethods: []
            };
            setUser(mappedUser);
          } else {
            // Invalid session
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem('lumo_user');
            setUser(null);
            setCurrentAccount(null);
          }
        } catch (err) {
          console.warn('Session verification failed on startup:', err);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('lumo_user');
          setUser(null);
          setCurrentAccount(null);
        }
      } else {
        setUser(null);
        setCurrentAccount(null);
      }
      setIsLoading(false);
    }
    initAuth();
  }, []);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to sync auth state', e);
    }
  }, [user]);

  const setSession = (account: UserAccount, token: string) => {
    setCurrentAccount(account);
    setActiveRole(account.role);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('lumo_user', JSON.stringify(account));

    const loggedInUser: UserProfile = {
      id: account.id,
      name: account.name,
      email: account.email,
      phone: account.phone || '',
      region: 'Dar es Salaam',
      city: 'Kinondoni',
      role: account.role,
      sellerId: account.sellerId,
      salespersonId: account.salespersonId,
      warehouseId: account.warehouseId,
      pickupStationId: account.pickupStationId,
      addresses: [],
      paymentMethods: []
    };
    setUser(loggedInUser);
  };

  const login = async (email: string, password?: string, role?: UserRole): Promise<UserAccount> => {
    try {
      setIsLoading(true);
      const res = await api.login(email, password, role);
      if (res && res.user) {
        setSession(res.user, res.token);
        return res.user;
      } else {
        throw new Error('Invalid authentication response');
      }
    } catch (err: any) {
      // Error thrown to UI
      setUser(null);
      setCurrentAccount(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('lumo_user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    region: string,
    city: string,
    role: UserRole = 'CUSTOMER',
    businessName?: string,
    extraData?: Record<string, any>
  ) => {
    try {
      setIsLoading(true);
      const res = await api.register({
        name,
        email,
        phone,
        role,
        businessName,
        region,
        city,
        ...(extraData || {})
      } as any);
      if (res && res.user) {
        setCurrentAccount(res.user);
        setActiveRole(res.user.role);
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem('lumo_user', JSON.stringify(res.user));

        const newUser: UserProfile = {
          id: res.user.id,
          name: res.user.name,
          firstName: res.user.firstName,
          lastName: res.user.lastName,
          birthDate: res.user.birthDate,
          termsAccepted: res.user.termsAccepted,
          termsAcceptedAt: res.user.termsAcceptedAt,
          email: res.user.email,
          phone: res.user.phone,
          region,
          city,
          role: res.user.role,
          sellerId: res.user.sellerId,
          addresses: [
            {
              fullName: res.user.name,
              phone: res.user.phone,
              region,
              city,
              area: `${city} Central`,
              streetAddress: 'Main Street, House No. 12',
              isDefault: true,
            },
          ],
          paymentMethods: [],
          walletBalance: 100000,
          loyaltyPoints: 500
        };
        setUser(newUser);
      }
    } catch (err) {
      // Error thrown to UI
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (
    provider: 'google' | 'apple',
    email: string,
    name?: string,
    avatar?: string,
    action?: 'login' | 'register'
  ): Promise<UserAccount> => {
    try {
      setIsLoading(true);
      const res = await api.socialLogin({ provider, email, name, avatar, action });
      if (res && res.user && res.token) {
        setSession(res.user, res.token);
        return res.user;
      }
      throw new Error(`Invalid response from ${provider} sign-in`);
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(() => {});
    }
    setUser(null);
    setCurrentAccount(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('lumo_user');
  };

  const isRole = (roles: UserRole | UserRole[]): boolean => {
    if (activeRole === 'SUPER_ADMIN') return true;
    if (Array.isArray(roles)) {
      return roles.includes(activeRole);
    }
    return activeRole === roles;
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    setUser({ ...user, ...updated });
  };

  const addAddress = (address: DeliveryAddress) => {
    if (!user) return;
    let addresses = [...user.addresses];
    if (address.isDefault) {
      addresses = addresses.map((a) => ({ ...a, isDefault: false }));
    }
    if (addresses.length === 0) {
      address.isDefault = true;
    }
    setUser({ ...user, addresses: [...addresses, address] });
  };

  const deleteAddress = (index: number) => {
    if (!user) return;
    const updated = user.addresses.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    setUser({ ...user, addresses: updated });
  };

  const setDefaultAddress = (index: number) => {
    if (!user) return;
    const updated = user.addresses.map((a, i) => ({
      ...a,
      isDefault: i === index,
    }));
    setUser({ ...user, addresses: updated });
  };

  const addPaymentMethod = (method: SavedPaymentMethod) => {
    if (!user) return;
    let currentMethods = [...(user.paymentMethods || [])];
    if (method.isDefault || currentMethods.length === 0) {
      currentMethods = currentMethods.map((m) => ({ ...m, isDefault: false }));
      method.isDefault = true;
    }
    setUser({ ...user, paymentMethods: [...currentMethods, method] });
  };

  const deletePaymentMethod = (id: string) => {
    if (!user) return;
    let currentMethods = (user.paymentMethods || []).filter((m) => m.id !== id);
    if (currentMethods.length > 0 && !currentMethods.some((m) => m.isDefault)) {
      currentMethods[0].isDefault = true;
    }
    setUser({ ...user, paymentMethods: currentMethods });
  };

  const setDefaultPaymentMethod = (id: string) => {
    if (!user) return;
    const updated = (user.paymentMethods || []).map((m) => ({
      ...m,
      isDefault: m.id === id,
    }));
    setUser({ ...user, paymentMethods: updated });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentAccount,
        activeRole,
        isAuthenticated: !!user,
        isLoading,
        setSession,
        login,
        register,
        socialLogin,
        logout,
        isRole,
        updateProfile,
        addAddress,
        deleteAddress,
        setDefaultAddress,
        addPaymentMethod,
        deletePaymentMethod,
        setDefaultPaymentMethod,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
