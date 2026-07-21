"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";
import {
  HiOutlineEye,
  HiOutlineEyeOff,
  HiArrowRight,
  HiOutlineInformationCircle,
  HiCheckCircle,
  HiXCircle,
} from "react-icons/hi";
import Image from "next/image";
import toast from "react-hot-toast";

import Logo from "@/src/assets/logos/logo-transparente.webp";
import bgAuth from "@/src/assets/backgrounds/bg-cadastrar.webp";
import api from "@/src/services/api";

// 1. Schema de Validação
const registerSchema = z
  .object({
    name: z.string().min(3, "Por favor, digite seu nome completo"),
    email: z.string().email("Digite um e-mail válido"),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .regex(/[a-z]/, "Deve conter ao menos uma letra minúscula")
      .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
      .regex(/[0-9]/, "Deve conter ao menos um número")
      .regex(/[^a-zA-Z0-9]/, "Deve conter ao menos um caractere especial"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const currentPassword = watch("password", "");

  const passwordRules = [
    { label: "Mínimo de 8 caracteres", isValid: currentPassword.length >= 8 },
    { label: "Pelo menos uma letra minúscula", isValid: /[a-z]/.test(currentPassword) },
    { label: "Pelo menos uma LETRA MAIÚSCULA", isValid: /[A-Z]/.test(currentPassword) },
    { label: "Pelo menos um número", isValid: /[0-9]/.test(currentPassword) },
    { label: "Um caractere especial (@, #, $...)", isValid: /[^a-zA-Z0-9]/.test(currentPassword) },
  ];

  const isPasswordValid = passwordRules.every((rule) => rule.isValid);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        nome: data.name,
        email: data.email,
        senha: data.password,
      };

      await api.post("/register", payload);

      sessionStorage.setItem("@ACI:pendingEmail", data.email);
      toast.success("Conta criada com sucesso!");
      router.push("/verificar-email");
    } catch (error: any) {
      const mensagemErro =
        error.response?.data?.error ||
        "Ocorreu um erro ao criar a conta. Tente novamente.";
      toast.error(mensagemErro);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ✨ h-screen e overflow-hidden para travar o layout global
    <div className="flex min-h-screen lg:h-screen w-full bg-gray-50 overflow-y-auto lg:overflow-hidden">

      {/* LADO ESQUERDO: FORMULÁRIO */}
      {/* Adicionado painel levemente mais largo (45/50%) e escondido a scrollbar interna */}
      <div className="w-full lg:w-[50%] xl:w-[45%] h-full flex flex-col items-center p-6 sm:p-10 bg-white relative z-10 shadow-[20px_0_40px_rgba(0,0,0,0.04)] lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        {/* Link para Entrar (Fixo no topo no celular, Flutuante no desktop) */}
        <div className="w-full flex justify-end sm:absolute sm:top-6 sm:right-6 mb-6 sm:mb-0 z-20">
          <Link
            href="/entrar"
            className="group flex items-center gap-1.5 px-4 py-2 sm:px-3.5 sm:py-1.5 bg-gray-50 border border-gray-100 sm:border-transparent text-xs sm:text-[11px] font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all tracking-wide shadow-sm sm:shadow-none"
          >
            Já tem conta? Entrar
            <HiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Container interno flexível */}
        <div className="w-full max-w-[400px] sm:max-w-[420px] space-y-5 my-auto py-8 lg:py-4 animate-in fade-in slide-in-from-bottom-3 duration-500">

          <div className="text-center">
            <Link href="/" className="inline-block mb-4">
              <Image
                src={Logo}
                alt="Logo ACI Vagas"
                className="w-40 mx-auto"
                priority
              />
            </Link>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none">
              Crie sua conta grátis
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-2 font-medium max-w-[320px] mx-auto leading-relaxed">
              Junte-se a milhares de profissionais e encontre sua próxima oportunidade.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome Completo"
              placeholder="Ex: Maria da Silva"
              error={errors.name?.message}
              {...register("name")}
            />

            <div>
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                error={errors.email?.message}
                {...register("email")}
              />
              <div className="flex items-start gap-1.5 mt-1.5 ml-1">
                <HiOutlineInformationCircle
                  className="text-gray-400 mt-[1px] shrink-0"
                  size={14}
                />
                <span className="text-[11px] font-medium text-gray-500">
                  Não tem e-mail?{" "}
                  <a
                    href="https://wa.me/555533759350"
                    target="_blank"
                    className="text-blue-500 hover:text-blue-700 font-bold transition-all"
                  >
                    Fale com a ACI
                  </a>
                </span>
              </div>
            </div>

            {/* Grid compacto para senhas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caract."
                  error={currentPassword.length > 0 && !isPasswordValid ? " " : undefined}
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

              <Input
                label="Confirmar Senha"
                type={showPassword ? "text" : "password"}
                placeholder="Repita a senha"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
            </div>

            {/* ✨ CHECKLIST COMPACTO */}
            <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
              <p className="text-[11px] font-bold text-gray-600 mb-2.5 uppercase tracking-wider">Requisitos da senha:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-2">
                {passwordRules.map((rule, index) => (
                  <li key={index} className="flex items-center gap-1.5">
                    {rule.isValid ? (
                      <HiCheckCircle className="text-emerald-500 shrink-0" size={14} />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
                        {currentPassword.length > 0 && <HiXCircle className="text-red-400 opacity-50" size={14} />}
                      </div>
                    )}
                    <span className={`text-[10px] sm:text-[11px] leading-tight ${rule.isValid ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'}`}>
                      {rule.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed text-center px-2">
              Ao clicar em "Criar minha conta", você concorda com nossos{" "}
              <Link href="/termos" className="text-blue-500 font-bold hover:underline">Termos de Uso</Link> e{" "}
              <Link href="/privacidade" className="text-blue-500 font-bold hover:underline">Política de Privacidade</Link>.
            </p>

            <ButtonType
              variant="primary"
              className="w-full justify-center py-3.5 text-sm font-black shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 active:scale-[0.99] transition-all rounded-xl flex items-center gap-1.5 group mt-2"
              disabled={isLoading || !isPasswordValid || currentPassword !== watch("confirmPassword")}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Criando conta...
                </div>
              ) : (
                <>
                  Criar minha conta
                  <HiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </ButtonType>
          </form>

        </div>
      </div>

      {/* --- LADO DIREITO: BRANDING --- */}
      <div className="hidden lg:block lg:w-[50%] xl:w-[55%] h-full relative bg-gray-900 overflow-hidden">
        {/* Overlays elegantes */}
        <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 via-transparent to-transparent z-10"></div>

        <Image
          src={bgAuth}
          alt="Imagem de Fundo ACI Vagas"
          fill
          className="object-cover object-[center_30%] w-full h-full opacity-80"
          priority
          quality={100}
        />

        <div className="relative z-20 h-full flex flex-col justify-end p-16 xl:p-20 text-white pb-20">
          <div className="max-w-xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 fill-mode-both">
            <div className="flex items-center gap-2 mb-6 opacity-75">
              <div className="w-6 h-[1px] bg-emerald-400"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                Acesso Gratuito
              </span>
            </div>

            <blockquote className="space-y-6 mb-8">
              <p className="text-3xl xl:text-4xl font-black leading-tight tracking-tight">
                "A melhor forma de prever o <span className="text-emerald-400">futuro</span> é criá-lo."
              </p>
            </blockquote>

            <ul className="space-y-4 border-l-2 border-emerald-500/50 pl-5">
              <li className="flex items-center gap-3 text-sm">
                <HiCheckCircle className="text-emerald-400" size={20} />
                <span className="font-medium text-gray-100">Cadastro 100% Gratuito</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <HiCheckCircle className="text-emerald-400" size={20} />
                <span className="font-medium text-gray-100">Conexão direta com recrutadores</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <HiCheckCircle className="text-emerald-400" size={20} />
                <span className="font-medium text-gray-100">Alertas de vagas no seu perfil</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}