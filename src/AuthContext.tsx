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
  slug: string;
}

interface PerfilCompleto {
  id_usuario: number;
  nome: string;
  email: string;
  tipo_usuario: string;
  empresa?: EmpresaPerfil;
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
  const pathname = usePathname();

  const isAuthenticated = !!user;

  // Logout com remoção de cookies padronizada (path: "/")
  const logout = useCallback(() => {
    const isEmpresa = user?.role === "EMPRESA" || pathname.startsWith("/empresa") || pathname === "/entrar-empresa";

    Cookies.remove("aci_token", { path: "/" });
    Cookies.remove("user_role", { path: "/" });
    Cookies.remove("exigir_troca_senha", { path: "/" });
    setUser(null);
    setPerfil(null);

    if (isEmpresa) {
      router.push("/entrar-empresa");
    } else {
      router.push("/entrar");
    }
  }, [router, user, pathname]);

  const fetchPerfil = async () => {
    try {
      const { data } = await api.get("/me");
      setPerfil(data);
      return data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        setUser(null);
        setPerfil(null);
      }
      return null;
    }
  };

  // ✨ O SEGREDO ESTÁ AQUI: Uma função única para decodificar o usuário e evitar erros de tipagem
  const extrairUsuarioDoToken = (token: string): User => {
    const decoded: any = jwtDecode(token);
    return {
      id: decoded.sub,
      role: decoded.role || decoded.tipo,
      // Fallback para as duas chaves que o backend pode enviar
      is_master: Boolean(decoded.is_master || decoded.master),
      exigir_troca_senha: Boolean(decoded.exigir_troca_senha),
    };
  };

  // 1. CARREGAMENTO INICIAL
  useEffect(() => {
    const carregarSessao = async () => {
      const token = Cookies.get("aci_token");

      if (token) {
        try {
          const userData = extrairUsuarioDoToken(token);
          setUser(userData);
          await fetchPerfil();
        } catch (error) {
          console.error("Token inválido ou sessão expirada", error);
          Cookies.remove("aci_token", { path: "/" });
          setUser(null);
          setPerfil(null);
        }
      }
      setIsLoading(false);
    };

    carregarSessao();
  }, []);

  // 2. O OUVINTE DE SEGURANÇA
  useEffect(() => {
    if (isAuthenticated && !perfil && !isLoading) {
      fetchPerfil();
    }
  }, [pathname, isAuthenticated, perfil, isLoading]);

  useEffect(() => {
    const rotasLiberadas = ["/trocar-senha", "/termos", "/privacidade", "/vagas", "/para-empresas"];
    const precisaTrocarSenha = user?.exigir_troca_senha;
    const estaEmRotaBloqueada = !rotasLiberadas.includes(pathname);

    if (!isLoading && isAuthenticated && precisaTrocarSenha && estaEmRotaBloqueada) {
      router.push("/trocar-senha");
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  // 3. FLUXO DE LOGIN ASSÍNCRONO
  const login = async (token: string) => {
    setIsLoading(true);

    try {
      const userData = extrairUsuarioDoToken(token);

      Cookies.set("aci_token", token, { expires: 1, path: "/" });
      Cookies.set("user_role", userData.role, { expires: 1, path: "/" });
      Cookies.set("exigir_troca_senha", String(userData.exigir_troca_senha), {
        expires: 1,
        path: "/",
      });

      setUser(userData);
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