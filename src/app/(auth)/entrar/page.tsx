"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

// Componentes e Ícones
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";
import {
  HiOutlineEye,
  HiOutlineEyeOff,
  HiUser,
  HiOfficeBuilding,
} from "react-icons/hi";

// Assets e Configurações
import bgAuth from "@/src/assets/backgrounds/bg-login.jpg";
import logo from "@/src/assets/logos/logo-transparente.png";
import api from "@/src/services/api";

// 1. Schema de Validação Flexível
const loginSchema = z
  .object({
    loginType: z.enum(["CANDIDATO", "EMPRESA"]),
    email: z.string().optional(),
    cnpj: z.string().optional(),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    remember: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.loginType === "CANDIDATO") {
        return !!data.email && /^\S+@\S+\.\S+$/.test(data.email);
      }
      // Validação simples de CNPJ (mínimo 14 números)
      return !!data.cnpj && data.cnpj.replace(/\D/g, "").length >= 14;
    },
    {
      message: "Informe um e-mail válido ou CNPJ completo",
      path: ["email"], // Mostra o erro no campo principal
    },
  );

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();

  // Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loginType, setLoginType] = useState<"CANDIDATO" | "EMPRESA">(
    "CANDIDATO",
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginType: "CANDIDATO",
      remember: false,
    },
  });

  // 2. Implementação do "Lembrar de Mim" (Carregamento)
  useEffect(() => {
    const saved = localStorage.getItem("@aci:remembered_user");
    if (saved) {
      const { identifier, type } = JSON.parse(saved);
      setLoginType(type);
      setValue("loginType", type);
      setValue("remember", true);

      if (type === "CANDIDATO") {
        setValue("email", identifier);
      } else {
        setValue("cnpj", identifier);
      }
    }
  }, [setValue]);

  // 3. Função de Login
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Prepara o payload conforme o seu Backend espera (email ou cnpj + senha)
      const payload =
        data.loginType === "CANDIDATO"
          ? { email: data.email, senha: data.password }
          : { cnpj: data.cnpj, senha: data.password };

      const response = await api.post("/login", payload);

      // O seu backend retorna: { success: true, data: { token, tipo } }
      const { token, tipo } = response.data.data;

      // Persistência do "Lembrar de Mim"
      if (data.remember) {
        const info = {
          identifier: data.loginType === "CANDIDATO" ? data.email : data.cnpj,
          type: data.loginType,
        };
        localStorage.setItem("@aci:remembered_user", JSON.stringify(info));
      } else {
        localStorage.removeItem("@aci:remembered_user");
      }

      // Salva os Cookies de sessão (expira em 7 dias)
      Cookies.set("aci_token", token, { expires: 7, secure: true });
      Cookies.set("user_role", tipo, { expires: 7 });

      // Redirecionamento lógico
      if (tipo === "ADM") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      // Captura a mensagem de erro do seu Controller
      const msg =
        error.response?.data?.error || "E-mail/CNPJ ou senha incorretos.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* LADO ESQUERDO: FORMULÁRIO */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-block mb-6">
              <Image
                src={logo}
                alt="Logo ACI Empregos"
                className="w-48 mx-auto"
              />
            </Link>
          </div>

          {/* Switch de Tipo de Login */}
          <div className="flex p-1 bg-gray-100 rounded-2xl border border-gray-200">
            <button
              type="button"
              onClick={() => {
                setLoginType("CANDIDATO");
                setValue("loginType", "CANDIDATO");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all ${
                loginType === "CANDIDATO"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <HiUser size={18} /> Sou Candidato
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType("EMPRESA");
                setValue("loginType", "EMPRESA");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all ${
                loginType === "EMPRESA"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <HiOfficeBuilding size={18} /> Sou Empresa
            </button>
          </div>

          {/* Mensagem de Erro do Backend */}
          {errorMessage && (
            <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl text-center font-medium animate-pulse">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {loginType === "CANDIDATO" ? (
              <Input
                label="E-mail"
                type="email"
                placeholder="exemplo@email.com"
                error={errors.email?.message}
                {...register("email")}
              />
            ) : (
              <Input
                label="CNPJ da Empresa"
                type="text"
                placeholder="00.000.000/0000-00"
                error={errors.cnpj?.message}
                {...register("cnpj")}
              />
            )}

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
              {isLoading ? "Validando acesso..." : "Entrar na Plataforma"}
            </ButtonType>
          </form>

          <p className="text-center text-gray-600">
            Ainda não tem conta?{" "}
            <Link
              href="/cadastrar"
              className="text-primary font-bold hover:underline"
            >
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>

      {/* LADO DIREITO: BRANDING */}
      <div className="hidden lg:block w-1/2 relative bg-gray-900">
        {/* Imagem de Fundo */}
        <div className="absolute inset-0 bg-primary z-10 mix-blend-multiply"></div>
        <Image
          src={bgAuth}
          alt="Imagem de Fundo ACI Empregos"
          fill
          className="object-cover w-full h-full opacity-70"
        />
        <div className="absolute inset-0 bg-cover bg-center"></div>

        <div className="relative z-20 h-full flex flex-col justify-end p-16 text-white">
          <blockquote className="space-y-4">
            <p className="text-2xl font-medium leading-relaxed">
              "Graças à ACI Empregos, consegui minha recolocação no mercado em
              menos de uma semana. A plataforma é incrível!"
            </p>
            <footer className="opacity-80">
              — Julia M., contratada via Banco de Talentos
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
