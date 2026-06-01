"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/src/AuthContext";

// Componentes e Ícones
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

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

      const { token, tipo } = response.data.data;

      // Se por acaso uma empresa tentar logar pelo portal do candidato, nós barramos aqui para manter a separação
      if (tipo === "EMPRESA") {
        setErrorMessage(
          "Por favor, acesse o portal de empresas para fazer login.",
        );
        setIsLoading(false);
        return;
      }

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
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* LADO ESQUERDO: FORMULÁRIO */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white relative">

        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <Link href="/" className="inline-block mb-6">
              <Image
                src={logo}
                alt="Logo ACI Empregos"
                className="w-48 mx-auto"
              />
            </Link>

            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-500 mt-2 font-medium">
              Acesse a sua conta para encontrar as melhores oportunidades da
              região.
            </p>
          </div>

          {/* Mensagem de Erro do Backend */}
          {errorMessage && (
            <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl text-center font-bold animate-in zoom-in-95">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                className="absolute right-3 top-[38px] text-gray-400 hover:text-blue-600 transition-colors"
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
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-gray-500 font-medium group-hover:text-gray-900 transition-colors">
                  Lembrar de mim
                </span>
              </label>
              <Link
                href="/recuperar-senha"
                className="text-blue-600 font-bold hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <ButtonType
              variant="primary"
              className="w-full py-4 text-lg font-black shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Validando acesso..." : "Entrar"}
            </ButtonType>
          </form>

          <div className="text-center pt-4">
            <p className="text-gray-500 font-medium">
              Ainda não tem o seu currículo?{" "}
              <Link
                href="/cadastrar"
                className="text-blue-600 font-black hover:underline"
              >
                Cadastre-se grátis
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: BRANDING */}
      <div className="hidden lg:block w-1/2 relative bg-gray-900">
        <div className="absolute inset-0 bg-primary z-10 mix-blend-multiply opacity-90"></div>
        <Image
          src={bgAuth}
          alt="Imagem de Fundo ACI Empregos"
          fill
          className="object-cover w-full h-full opacity-60"
          priority
        />

        <div className="relative z-20 h-full flex flex-col justify-end p-16 text-white pb-24">
          <blockquote className="space-y-6">
            <p className="text-3xl font-black leading-tight max-w-lg">
              "Sua próxima grande conquista profissional começa aqui."
            </p>
            <footer className="text-blue-200 font-bold tracking-widest uppercase text-sm">
              — ACI Panambi
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
