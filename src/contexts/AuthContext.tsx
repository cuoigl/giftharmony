import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiService } from "../services/api";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar?: string;
  points?: number;
  level?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
  birthDate?: string;
  gender?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  requireAuth: (action: () => void) => void;
  updateProfile?: (updates: any) => Promise<void>;
  loadCurrentUser?: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
  onRequireLogin: () => void;
}

export const AuthProvider = ({
  children,
  onRequireLogin,
}: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      apiService.setToken(token);
      loadCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = (await apiService.getCurrentUser()) as { user: User };
      const userData = response.user;
      const transformedUser: User = {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        avatar: userData.avatar,
        points: userData.points,
        level: userData.level,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        district: userData.district,
        ward: userData.ward,
        birthDate: (userData as any).birthdate || userData.birthDate,
        gender: userData.gender,
        created_at: (userData as any).created_at || undefined,
      };
      setUser(transformedUser);
      setIsLoading(false);
    } catch (error) {
      setUser(null);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = (await apiService.login({ email, password })) as {
        user: User;
        token: string;
      };
      // Set token
      apiService.setToken(response.token);
      // Transform user data
      const userData = response.user;
      const transformedUser: User = {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        avatar: userData.avatar,
        points: userData.points,
        level: userData.level,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        district: userData.district,
        ward: userData.ward,
        birthDate: (userData as any).birthdate || userData.birthDate,
        gender: userData.gender,
        created_at: (userData as any).created_at || undefined,
      };
      setUser(transformedUser);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = (await apiService.register(userData)) as {
        user: User;
        token: string;
      };
      // Set token
      apiService.setToken(response.token);
      // Transform user data
      const user = response.user;
      const transformedUser: User = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        avatar: user.avatar,
        points: user.points,
        level: user.level,
        phone: user.phone,
        address: user.address,
        city: user.city,
        district: user.district,
        ward: user.ward,
        birthDate: (user as any).birthdate || user.birthDate,
        gender: user.gender,
        created_at: (user as any).created_at || undefined,
      };
      setUser(transformedUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    apiService.setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates: any) => {
    try {
      await apiService.updateUserProfile(updates);
      await loadCurrentUser(); // luôn reload lại user từ backend sau khi cập nhật
    } catch (error) {
      throw error;
    }
  };

  const requireAuth = (action: () => void) => {
    if (user) {
      action();
    } else {
      onRequireLogin();
    }
  };

  // Create a user object with name property for backward compatibility
  const userWithName = user
    ? {
        ...user,
        name: `${user.first_name} ${user.last_name}`,
      }
    : null;

  const value: AuthContextType = {
    user: userWithName,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    requireAuth,
    updateProfile,
    loadCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
