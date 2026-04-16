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
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

// Assets e Configurações
import bgAuth from "@/src/assets/backgrounds/bg-login.jpg";
import logo from "@/src/assets/logos/logo-transparente.png";
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

export default function LoginPage() {
  const router = useRouter();

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

      if (data.remember) {
        localStorage.setItem("@aci:remembered_email", data.email);
      } else {
        localStorage.removeItem("@aci:remembered_email");
      }

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
        router.push("/dashboard"); // CANDIDATO
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
            <h2 className="text-3xl font-bold text-gray-900">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-500 mt-2">
              Acesse sua conta para continuar
            </p>
          </div>

          {/* Mensagem de Erro do Backend */}
          {errorMessage && (
            <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl text-center font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="E-mail"
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
        <div className="absolute inset-0 bg-blue-900 z-10 mix-blend-multiply opacity-60"></div>
        <Image
          src={bgAuth}
          alt="Imagem de Fundo ACI Empregos"
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
