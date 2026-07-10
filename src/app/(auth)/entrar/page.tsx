"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/AuthContext";

// Componentes e Ícones
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";
import { HiOutlineEye, HiOutlineEyeOff, HiArrowRight } from "react-icons/hi";

// Assets e Configurações
import bgAuth from "@/src/assets/backgrounds/bg-login.webp";
import logo from "@/src/assets/logos/logo-transparente.webp";
import api from "@/src/services/api";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Digite um e-mail válido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginCandidatoPage() {
  const router = useRouter();
  const { login } = useAuth();

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
      const response = await api.post("/login", {
        email: data.email,
        senha: data.password,
      });

      const { token } = response.data.data;

      if (data.remember) {
        localStorage.setItem("@aci:remembered_email", data.email);
      } else {
        localStorage.removeItem("@aci:remembered_email");
      }

      await login(token);
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
    // ✨ h-screen e overflow-hidden no desktop para matar o scroll global
    <div className="flex min-h-screen lg:h-screen w-full bg-gray-50 overflow-y-auto lg:overflow-hidden">

      {/* LADO ESQUERDO: FORMULÁRIO */}
      <div className="w-full lg:w-[45%] xl:w-[40%] h-full flex flex-col justify-center items-center p-6 sm:p-10 bg-white relative z-10 shadow-[20px_0_40px_rgba(0,0,0,0.04)]">
        {/* Link para Empresas flutuante */}
        <div className="w-full flex justify-end sm:absolute sm:top-6 sm:right-6 mb-8 sm:mb-0 z-20">
          <Link
            href="/entrar-empresa"
            className="group flex items-center gap-1.5 px-4 py-2 sm:px-3.5 sm:py-1.5 bg-gray-50 border border-gray-100 sm:border-transparent text-xs sm:text-[11px] font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all tracking-wide shadow-sm sm:shadow-none"
          >
            Acesso para Empresas
            <HiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Container interno mais compacto verticamente */}
        <div className="w-full max-w-[360px] sm:max-w-[380px] space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="text-center">
            <Link href="/" className="inline-block mb-4">
              <Image
                src={logo}
                alt="Logo ACI Vagas"
                className="w-40 mx-auto"
                priority
              />
            </Link>

            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none">
              Bem-vindo(a) de volta
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-2 font-medium max-w-[280px] mx-auto leading-relaxed">
              Acesse sua conta e veja as vagas disponíveis em Panambi.
            </p>
          </div>

          {/* Mensagem de Erro do Backend */}
          {errorMessage && (
            <div className="p-3 text-xs text-red-700 bg-red-50/80 border border-red-100 rounded-xl flex items-center gap-2 animate-in zoom-in-95">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
              <p className="font-bold">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Seu E-mail"
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
                className="absolute right-3 top-[38px] p-1 text-gray-400 hover:text-blue-600 transition-colors bg-white rounded-md"
                tabIndex={-1}
              >
                {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs px-0.5 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("remember")}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-gray-500 font-medium group-hover:text-gray-900 transition-colors">
                  Lembrar meu acesso
                </span>
              </label>

              <Link
                href="/recuperar-senha"
                className="text-blue-600 font-bold hover:text-blue-800 transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <ButtonType
              variant="primary"
              className="w-full py-3.5 text-sm font-black shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 active:scale-[0.99] transition-all rounded-xl flex items-center justify-center gap-1.5 group"
              disabled={isLoading}
            >
              {isLoading ? (
                "Validando..."
              ) : (
                <>
                  Entrar
                  <HiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </ButtonType>
          </form>

          {/* Divisor Visual Compactado */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-3 bg-white text-gray-400 font-bold uppercase tracking-widest">
                Não tem cadastro?
              </span>
            </div>
          </div>

          {/* Call to Action Secundário */}
          <div className="space-y-3">
            <Link
              href="/cadastrar"
              className="flex items-center justify-center w-full py-3 rounded-xl bg-gray-50 text-gray-700 font-bold text-sm border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all shadow-sm"
            >
              Criar minha conta gratuita
            </Link>

            <p className="text-center text-[11px] text-gray-400 pt-2">
              Precisa de ajuda?{" "}
              <a href="https://acivagas.com.br/ajuda" target="_blank" className="text-blue-500 font-bold hover:underline">
                Acesse nossa central.
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: BRANDING */}
      <div className="hidden lg:block lg:w-[55%] xl:w-[60%] h-full relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 via-transparent to-transparent z-10"></div>

        <Image
          src={bgAuth}
          alt="Profissional sorrindo no ambiente de trabalho"
          fill
          className="object-cover object-[center_20%] w-full h-full opacity-80"
          priority
          quality={100}
        />

        <div className="relative z-20 h-full flex flex-col justify-end p-16 xl:p-20 text-white pb-20">
          <div className="max-w-xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 fill-mode-both">
            <div className="flex items-center gap-2 mb-4 opacity-75">
              <div className="w-6 h-[1px] bg-blue-400"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
                Banco de Talentos
              </span>
            </div>

            <blockquote className="space-y-6">
              <p className="text-3xl xl:text-4xl font-black leading-tight tracking-tight">
                "Sua próxima grande conquista profissional <span className="text-blue-400">começa aqui.</span>"
              </p>
              <footer className="border-l-2 border-blue-500 pl-3">
                <p className="font-bold text-sm text-white">ACI-Panambi</p>
                <p className="text-[11px] text-blue-200/80 font-medium">Promovendo o desenvolvimento.</p>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}