import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, UserRole, LoginDTO, RegisterStudentDTO } from '../types/auth';
import { authApi } from '../services/authApi';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDTO) => Promise<User>;
  registerStudent: (data: RegisterStudentDTO) => Promise<User>;
  logout: () => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; resetToken?: string }>;
  resetPassword: (data: { token: string; newPassword: string; confirmPassword: string }) => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
  hasPermission: (permissionCode: string) => boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('sportex_access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = useCallback(async () => {
    const token = localStorage.getItem('sportex_access_token');
    const refreshToken = localStorage.getItem('sportex_refresh_token');

    if (!token && !refreshToken) {
      setIsLoading(false);
      return;
    }

    try {
      if (token) {
        const userData = await authApi.getMe();
        setUser(userData);
      } else if (refreshToken) {
        const refreshed = await authApi.refreshToken(refreshToken);
        localStorage.setItem('sportex_access_token', refreshed.accessToken);
        localStorage.setItem('sportex_refresh_token', refreshed.refreshToken);
        setAccessToken(refreshed.accessToken);
        const userData = await authApi.getMe();
        setUser(userData);
      }
    } catch {
      // If token expired, try refresh token
      if (refreshToken) {
        try {
          const refreshed = await authApi.refreshToken(refreshToken);
          localStorage.setItem('sportex_access_token', refreshed.accessToken);
          localStorage.setItem('sportex_refresh_token', refreshed.refreshToken);
          setAccessToken(refreshed.accessToken);
          const userData = await authApi.getMe();
          setUser(userData);
        } catch {
          // Both failed, clear session
          localStorage.removeItem('sportex_access_token');
          localStorage.removeItem('sportex_refresh_token');
          setUser(null);
          setAccessToken(null);
        }
      } else {
        localStorage.removeItem('sportex_access_token');
        setUser(null);
        setAccessToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (credentials: LoginDTO): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await authApi.login(credentials);
      localStorage.setItem('sportex_access_token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('sportex_refresh_token', data.refreshToken);
      }
      setAccessToken(data.accessToken);

      // Fetch full user profile with permissions
      const fullUser = await authApi.getMe();
      setUser(fullUser);
      return fullUser;
    } finally {
      setIsLoading(false);
    }
  };

  const registerStudent = async (data: RegisterStudentDTO): Promise<User> => {
    setIsLoading(true);
    try {
      const result = await authApi.registerStudent(data);
      localStorage.setItem('sportex_access_token', result.accessToken);
      if (result.refreshToken) {
        localStorage.setItem('sportex_refresh_token', result.refreshToken);
      }
      setAccessToken(result.accessToken);

      const fullUser = await authApi.getMe();
      setUser(fullUser);
      return fullUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('sportex_access_token');
      localStorage.removeItem('sportex_refresh_token');
      setUser(null);
      setAccessToken(null);
    }
  };

  const changePassword = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    await authApi.changePassword(data);
    await logout();
  };

  const forgotPassword = async (email: string) => {
    return authApi.forgotPassword(email);
  };

  const resetPassword = async (data: { token: string; newPassword: string; confirmPassword: string }) => {
    await authApi.resetPassword(data);
  };

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true; // Super Admin has universal access
    return roles.includes(user.role);
  };

  const hasPermission = (permissionCode: string): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return user.permissions?.includes(permissionCode) || false;
  };

  const refreshUserData = async () => {
    if (accessToken) {
      const userData = await authApi.getMe();
      setUser(userData);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        registerStudent,
        logout,
        changePassword,
        forgotPassword,
        resetPassword,
        hasRole,
        hasPermission,
        refreshUserData,
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
