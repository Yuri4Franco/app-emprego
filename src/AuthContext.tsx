"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
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

interface EmpresaPerfil {
  id_empresa: number;
  nome_fantasia: string;
  status: string;
  creditos_vagas: number;
  creditos_curriculos: number;
}

interface PerfilCompleto {
  id_usuario: number;
  nome: string;
  email: string;
  tipo_usuario: string;
  empresa?: EmpresaPerfil; // Opcional pois candidatos não têm empresa
}

interface AuthContextData {
  user: User | null;
  perfil: PerfilCompleto | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // Usamos o pathname para detectar mudanças de rota

  const isAuthenticated = !!user;

  const logout = useCallback(() => {
    Cookies.remove("aci_token");
    Cookies.remove("user_role");
    Cookies.remove("exigir_troca_senha");
    setUser(null);
    setPerfil(null);
    router.push("/entrar");
  }, [router]);

  // Função isolada para buscar o perfil, assim podemos chamá-la de vários lugares
  const fetchPerfil = async () => {
    try {
      const { data } = await api.get("/me");
      setPerfil(data);
      return data;
    } catch (error: any) {
      // Se der erro 401, o nosso interceptor já vai chutar o cara pro /entrar.
      // O que precisamos fazer aqui é só zerar os estados da memória.
      if (error.response?.status === 401) {
        setUser(null);
        setPerfil(null);
      }
      return null;
    }
  };

  // 1. CARREGAMENTO INICIAL
  useEffect(() => {
    const carregarSessao = async () => {
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

          await fetchPerfil();
        } catch (error) {
          console.error("Token inválido ou sessão expirada", error);
          Cookies.remove("aci_token");
          setUser(null);
          setPerfil(null);
        }
      }
      setIsLoading(false);
    };

    carregarSessao();
  }, []);

  // 2. O "OUVINTE" DE SEGURANÇA (A Mágica)
  // Sempre que a rota mudar, se o usuário estiver logado mas o perfil estiver vazio, ele busca!
  useEffect(() => {
    if (isAuthenticated && !perfil && !isLoading) {
      fetchPerfil();
    }
  }, [pathname, isAuthenticated, perfil, isLoading]);

  // 3. FLUXO DE LOGIN ASSÍNCRONO
  const login = async (token: string) => {
    setIsLoading(true);

    try {
      const decoded: any = jwtDecode(token);

      const userData: User = {
        id: decoded.sub,
        role: decoded.role,
        is_master: decoded.master,
        exigir_troca_senha: decoded.exigir_troca_senha,
      };

      Cookies.set("aci_token", token, { expires: 1, path: "/" });
      Cookies.set("user_role", userData.role, { expires: 1, path: "/" });
      Cookies.set("exigir_troca_senha", String(userData.exigir_troca_senha), {
        expires: 1,
        path: "/",
      });

      setUser(userData);

      // Busca o perfil antes de navegar
      await fetchPerfil();

      setIsLoading(false);

      if (userData.exigir_troca_senha) {
        router.push("/trocar-senha");
      } else {
        if (userData.role === "ADM") {
          router.push("/admin/dashboard");
        } else if (userData.role === "EMPRESA") {
          router.push("/empresa/dashboard");
        } else {
          router.push("/candidato/inicio");
        }
      }
    } catch (error) {
      console.error("Erro no fluxo de login:", error);
      setIsLoading(false);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        perfil,
        isAuthenticated,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
