"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/src/AuthContext";

// Componentes e Ícones
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";
import {
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineOfficeBuilding,
  HiOutlineUser,
} from "react-icons/hi";

// Assets e Configurações
import bgAuth from "@/src/assets/backgrounds/bg-login.webp";
import logo from "@/src/assets/logos/logo-transparente.webp";
import api from "@/src/services/api";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Digite um e-mail válido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================================
// COMPONENTE DO FORMULÁRIO (Separado para poder usar useSearchParams com Suspense)
// ============================================================================
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  // Lê a URL (?tab=empresa) para definir a aba inicial
  const tabInicial =
    searchParams.get("tab") === "empresa" ? "empresa" : "candidato";
  const [activeTab, setActiveTab] = useState<"candidato" | "empresa">(
    tabInicial,
  );

  // Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      remember: false,
    },
  });

  useEffect(() => {
    // Se o parâmetro da URL mudar, atualiza a aba
    const tabUrl = searchParams.get("tab");
    if (tabUrl === "empresa") setActiveTab("empresa");
    else setActiveTab("candidato");
  }, [searchParams]);

  useEffect(() => {
    const savedEmail = localStorage.getItem("@aci:remembered_email");
    if (savedEmail) {
      setValue("email", savedEmail);
      setValue("remember", true);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // A API é a mesma para os dois, o backend que decide pelo e-mail
      const response = await api.post("/login", {
        email: data.email,
        senha: data.password,
      });

      const { token, tipo } = response.data.data;

      if (data.remember) {
        localStorage.setItem("@aci:remembered_email", data.email);
      } else {
        localStorage.removeItem("@aci:remembered_email");
      }

      await login(token);

      Cookies.set("aci_token", token, { expires: 7, secure: true });
      Cookies.set("user_role", tipo, { expires: 7 });
      Cookies.set("exigir_troca_senha", response.data.data.exigir_troca_senha, {
        expires: 7,
      });

      if (tipo === "ADM") {
        router.push("/admin/dashboard");
      } else if (tipo === "EMPRESA") {
        router.push("/empresa/dashboard");
      } else {
        router.push("/candidato/inicio");
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || "E-mail ou senha incorretos.";

      if (msg.includes("Verifique seu email")) {
        sessionStorage.setItem("@ACI:pendingEmail", data.email);
        router.push("/verificar-email");
        return;
      }

      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <Link href="/" className="inline-block mb-6">
          <Image src={logo} alt="Logo ACI Vagas" className="w-48 mx-auto" />
        </Link>

        {/* TÍTULOS DINÂMICOS DEPENDENDO DA ABA */}
        <h2 className="text-3xl font-bold text-gray-900">
          {activeTab === "empresa" ? "Acesso Empresa" : "Bem-vindo de volta"}
        </h2>
        <p className="text-gray-500 mt-2">
          {activeTab === "empresa"
            ? "Gerencie suas vagas e encontre os melhores talentos"
            : "Acesse sua conta para continuar sua jornada"}
        </p>
      </div>

      {/* TABS DE SELEÇÃO (O Stakeholder vai adorar isso aqui) */}
      <div className="flex p-1.5 bg-gray-100 rounded-2xl">
        <button
          onClick={() => setActiveTab("candidato")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
            activeTab === "candidato"
              ? "bg-white text-blue-700 shadow-sm border border-gray-200/50"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          }`}
        >
          <HiOutlineUser size={18} /> Sou Candidato
        </button>
        <button
          onClick={() => setActiveTab("empresa")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
            activeTab === "empresa"
              ? "bg-white text-blue-700 shadow-sm border border-gray-200/50"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          }`}
        >
          <HiOutlineOfficeBuilding size={18} /> Sou Empresa
        </button>
      </div>

      {/* Mensagem de Erro do Backend */}
      {errorMessage && (
        <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl text-center font-medium animate-in zoom-in-95">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label={activeTab === "empresa" ? "E-mail" : "E-mail"}
          type="email"
          placeholder="exemplo@email.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="relative">
          <Input
            label="Sua Senha"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-primary transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <HiOutlineEyeOff size={22} />
            ) : (
              <HiOutlineEye size={22} />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              {...register("remember")}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
              Lembrar de mim
            </span>
          </label>
          <Link
            href="/recuperar-senha"
            className="text-primary font-bold hover:underline"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <ButtonType
          variant="primary"
          className="w-full py-4 text-lg font-bold shadow-xl shadow-blue-600/10"
          disabled={isLoading}
        >
          {isLoading ? "Validando acesso..." : "Entrar"}
        </ButtonType>
      </form>

      {activeTab === "candidato" ? (
        <p className="text-center text-gray-600 pt-2">
          Ainda não tem conta?{" "}
          <Link
            href="/cadastrar"
            className="text-primary font-bold hover:underline"
          >
            Cadastre-se grátis
          </Link>
        </p>
      ) : (
        <p className="text-center text-gray-500 pt-2 text-sm">
          Sua empresa ainda não possui acesso?{" "}
          <a
            href="mailto:comercial@acipanambi.com.br"
            className="text-primary font-bold hover:underline"
          >
            Fale com a ACI-Panambi
          </a>
        </p>
      )}
    </div>
  );
}

// ============================================================================
// PÁGINA PRINCIPAL
// ============================================================================
export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* LADO ESQUERDO: FORMULÁRIO */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <Suspense
          fallback={
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>

      {/* LADO DIREITO: BRANDING */}
      <div className="hidden lg:block w-1/2 relative bg-gray-900">
        <div className="absolute inset-0 bg-primary z-10 mix-blend-multiply"></div>
        <Image
          src={bgAuth}
          alt="Imagem de Fundo ACI Vagas"
          fill
          className="object-cover w-full h-full opacity-70"
          priority
        />

        <div className="relative z-20 h-full flex flex-col justify-end p-16 text-white">
          <blockquote className="space-y-4">
            <p className="text-2xl font-medium leading-relaxed">
              "Conectar talentos às melhores empresas de Panambi é o nosso
              compromisso diário."
            </p>
            <footer className="opacity-80">— Equipe ACI Panambi</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
