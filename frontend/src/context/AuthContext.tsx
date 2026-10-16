import React, { createContext, useContext, useEffect, useState } from "react";

export interface UserData {
  user_id: string;
  username: string;
  nama_lengkap: string;
  role: string;
  tenant_slug: string;
  tenant_nama: string;
}

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  login: (token: string, userData: UserData) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("tirtadesa_token"));
  const [user, setUser] = useState<UserData | null>(() => {
    const saved = localStorage.getItem("tirtadesa_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (token && user) {
      localStorage.setItem("tirtadesa_token", token);
      localStorage.setItem("tirtadesa_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("tirtadesa_token");
      localStorage.removeItem("tirtadesa_user");
    }
  }, [token, user]);

  const login = (newToken: string, newUser: UserData) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
