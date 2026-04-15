"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import api from "./services/api";

interface User {
  id: number;
  role: "CANDIDATO" | "EMPRESA" | "ADM";
  is_master: boolean;
  exigir_troca_senha: boolean;
}

interface AuthContextData {
  user: User | null;
  perfil: any; 
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 1. Defina a constante aqui para poder usar nos hooks abaixo
  const isAuthenticated = !!user;

  const logout = useCallback(() => {
    Cookies.remove("aci_token");
    Cookies.remove("user_role");
    Cookies.remove("exigir_troca_senha");
    setUser(null);
    setPerfil(null);
    router.push("/entrar");
  }, [router]);

  const carregarPerfil = useCallback(async () => {
    try {
      const { data } = await api.get("/me");
      setPerfil(data);
    } catch (error) {
      console.error("Erro ao carregar perfil detalhado", error);
      if (isAuthenticated) logout();
    }
  }, [isAuthenticated, logout]);

  useEffect(() => {
    if (isAuthenticated && !perfil) {
      carregarPerfil();
    }
  }, [isAuthenticated, perfil, carregarPerfil]);

  const login = (token: string) => {
    const decoded: any = jwtDecode(token);

    const userData: User = {
      id: decoded.sub,
      role: decoded.role,
      is_master: decoded.master,
      exigir_troca_senha: decoded.exigir_troca_senha,
    };

    Cookies.set("aci_token", token, { expires: 1, path: '/' });
    Cookies.set("user_role", userData.role, { expires: 1, path: '/' });
    Cookies.set("exigir_troca_senha", String(userData.exigir_troca_senha), { expires: 1, path: '/' });

    setUser(userData);

    if (userData.exigir_troca_senha) {
      router.push("/trocar-senha");
    } else {
      router.push(userData.role === "ADM" ? "/admin" : "/dashboard");
    }
  };

  useEffect(() => {
    const token = Cookies.get("aci_token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({
          id: decoded.sub,
          role: decoded.role,
          is_master: decoded.master,
          exigir_troca_senha: decoded.exigir_troca_senha,
        });
      } catch {
        logout();
      }
    }
    setIsLoading(false);
  }, [logout]);

  return (
    <AuthContext.Provider value={{
      user,
      perfil,
      isAuthenticated,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);