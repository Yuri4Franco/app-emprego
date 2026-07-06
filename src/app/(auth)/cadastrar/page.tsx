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
  HiXCircle
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
    watch, // ✨ IMPORTADO PARA O CHECKLIST
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange", // Para validar enquanto a pessoa digita
  });

  // ✨ OBSERVADOR DA SENHA PARA O CHECKLIST
  const currentPassword = watch("password", "");

  // Regras de negócio da senha para o UI
  const passwordRules = [
    { label: "Mínimo de 8 caracteres", isValid: currentPassword.length >= 8 },
    { label: "Pelo menos uma letra MAIÚSCULA", isValid: /[A-Z]/.test(currentPassword) },
    { label: "Pelo menos um número", isValid: /[0-9]/.test(currentPassword) },
    { label: "Um caractere especial (@, #, $...)", isValid: /[^a-zA-Z0-9]/.test(currentPassword) },
  ];

  // Verifica se todas as regras da senha estão OK para habilitar o botão
  const isPasswordValid = passwordRules.every(rule => rule.isValid);

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
    <div className="flex min-h-screen w-full">
      {/* --- LADO ESQUERDO: FORMULÁRIO --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Cabeçalho */}
          <div className="text-center">
            <Link href="/" className="inline-block mb-8">
              <Image
                src={Logo}
                alt="Logo ACI Vagas"
                className="w-50 mx-auto mb-4"
              />
            </Link>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
              Crie sua conta gratuita
            </h1>
            <p className="text-gray-500">
              Junte-se a milhares de profissionais e encontre sua próxima
              oportunidade em Panambi.
            </p>
          </div>

          {/* O Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              <div className="flex items-start gap-1.5 mt-2 ml-1">
                <HiOutlineInformationCircle
                  className="text-gray-400 mt-[2px] shrink-0"
                  size={14}
                />
                <span className="text-xs font-medium text-gray-500">
                  Não tem e-mail?{" "}
                  <a
                    href="https://wa.me/555533759350"
                    target="_blank"
                    className="text-primary/80 hover:underline font-bold transition-all"
                  >
                    Fale com a ACI-Panambi
                  </a>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  // Desligamos o texto vermelho nativo da senha para priorizar o checklist visual
                  error={currentPassword.length > 0 && !isPasswordValid ? " " : undefined}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-gray-400 hover:text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
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

            {/* ✨ CHECKLIST DE REQUISITOS DA SENHA */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-xs font-bold text-gray-700 mb-3">Sua senha deve conter:</p>
              <ul className="space-y-2">
                {passwordRules.map((rule, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {rule.isValid ? (
                      <HiCheckCircle className="text-emerald-500 shrink-0" size={16} />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
                        {currentPassword.length > 0 && <HiXCircle className="text-red-400 opacity-50" size={16} />}
                      </div>
                    )}
                    <span className={`text-xs ${rule.isValid ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {rule.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed text-center md:text-left">
              Ao clicar em "Criar minha conta", você concorda com nossos{" "}
              <Link href="/termos" className="text-primary hover:underline">
                Termos de Uso
              </Link>{" "}
              e{" "}
              <Link
                href="/privacidade"
                className="text-primary hover:underline"
              >
                Política de Privacidade
              </Link>
              .
            </p>

            <ButtonType
              variant="primary"
              className="w-full justify-center py-3.5 text-base shadow-lg shadow-blue-900/10 group"
              // ✨ Só habilita o botão se não estiver carregando, se a senha for válida e se as senhas forem iguais
              disabled={isLoading || !isPasswordValid || currentPassword !== watch("confirmPassword")}
            >
              {isLoading ? (
                "Criando conta..."
              ) : (
                <>
                  Criar minha conta
                  <HiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </ButtonType>
          </form>

          <div className="text-center pt-4 space-y-2">
            <p className="text-center text-sm text-gray-600">
              Já tem cadastro?{" "}
              <Link
                href="/entrar"
                className="text-primary font-black hover:underline"
              >
                Acessar minha conta
              </Link>
            </p>
            <p className="text-center text-sm text-gray-600">
              Precisa de ajuda?{" "}
              <a
                href="https://acivagas.com.br/ajuda"
                target="_blank"
                className="text-primary font-black hover:underline"
              >
                Acessar os guias
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* --- LADO DIREITO: BRANDING --- */}
      <div className="hidden lg:block w-1/2 relative bg-primary">
        <div className="absolute inset-0 bg-primary z-10 mix-blend-multiply"></div>
        <Image
          src={bgAuth}
          alt="Imagem de Fundo ACI Vagas"
          fill
          className="object-cover w-full h-full opacity-70"
        />
        <div className="absolute inset-0 bg-cover bg-center"></div>

        <div className="relative z-20 h-full flex flex-col justify-between p-16 text-white">
          <div className="pt-10">
            <h2 className="text-lg font-bold uppercase tracking-widest opacity-80">
              Banco de Talentos
            </h2>
          </div>
          <div className="space-y-6 max-w-lg">
            <h2 className="text-4xl font-bold leading-tight">
              "A melhor forma de prever o futuro é criá-lo."
            </h2>
            <p className="text-blue-100 text-lg">
              Dê o primeiro passo na sua carreira hoje. Empresas de toda a
              região estão procurando por perfis como o seu na ACI Vagas.
            </p>
            <ul className="space-y-3 pt-4">
              <li className="flex items-center gap-3">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span className="font-medium">Cadastro 100% Gratuito</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span className="font-medium">
                  Conexão direta com recrutadores
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span className="font-medium">
                  Alertas de vagas no seu perfil
                </span>
              </li>
            </ul>
          </div>
          <div className="text-sm opacity-60">
            © {new Date().getFullYear()} ACI Panambi. Todos os direitos
            reservados.
          </div>
        </div>
      </div>
    </div>
  );
}