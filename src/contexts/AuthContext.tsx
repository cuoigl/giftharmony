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

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

interface AuthContextType {
  user: (User & { name: string }) | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  requireAuth: (action: () => void) => void;
  updateProfile?: (updates: any) => Promise<void>;
  loadCurrentUser?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
  onRequireLogin: () => void;
}

const transformUser = (data: any): User => ({
  id: data.id,
  email: data.email,
  first_name: data.first_name,
  last_name: data.last_name,
  role: data.role,
  avatar: data.avatar,
  points: data.points,
  level: data.level,
  phone: data.phone,
  address: data.address,
  city: data.city,
  district: data.district,
  ward: data.ward,
  birthDate: data.birthdate || data.birthDate,
  gender: data.gender,
  created_at: data.created_at,
});

export const AuthProvider = ({
  children,
  onRequireLogin,
}: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const userData = localStorage.getItem("user");

        if (token) {
          apiService.setToken(token);
          if (userData) setUser(JSON.parse(userData));
          await loadCurrentUser();
        }
      } catch (err) {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const res = await apiService.getCurrentUser();
      const transformed = transformUser(res.user);
      setUser(transformed);
      localStorage.setItem("user", JSON.stringify(transformed));
    } catch (error) {
      logout();
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    const res = await apiService.login({ email, password });
    apiService.setToken(res.token);
    localStorage.setItem("auth_token", res.token);
    const transformed = transformUser(res.user);
    setUser(transformed);
    localStorage.setItem("user", JSON.stringify(transformed));
  };

  const register = async (userData: RegisterData) => {
    const res = await apiService.register(userData);
    apiService.setToken(res.token);
    localStorage.setItem("auth_token", res.token);
    const transformed = transformUser(res.user);
    setUser(transformed);
    localStorage.setItem("user", JSON.stringify(transformed));
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    apiService.setToken(null);
    setUser(null);

    // ✅ Giải pháp triệt để: replace để tránh redirect ngược
    window.location.replace("/");
  };

  const updateProfile = async (updates: any) => {
    await apiService.updateUserProfile(updates);
    await loadCurrentUser();
  };

  const requireAuth = (action: () => void) => {
    if (user) action();
    else onRequireLogin();
  };

  const userWithName = user
    ? { ...user, name: `${user.first_name} ${user.last_name}` }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user: userWithName,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        requireAuth,
        updateProfile,
        loadCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
