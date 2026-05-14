"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Importado para redirecionamento
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";
import { HiOutlineEye, HiOutlineEyeOff, HiArrowRight, HiOutlineInformationCircle } from "react-icons/hi";
import Image from "next/image";
import toast from "react-hot-toast"; // Importado para feedbacks

import Logo from "@/src/assets/logos/logo-transparente.webp";
import bgAuth from "@/src/assets/backgrounds/bg-cadastrar.webp";
import api from "@/src/services/api";

// 1. Schema de Validação (Alinhado com as regras do Backend)
const registerSchema = z
  .object({
    name: z.string().min(3, "Por favor, digite seu nome completo"),
    email: z.string().email("Digite um e-mail válido"),
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      .regex(/[a-zA-Z]/, "A senha deve conter letras")
      .regex(/[0-9]/, "A senha deve conter números")
      .regex(
        /[@#$!%*?&]/,
        "A senha deve conter um caractere especial (@, #, $, etc)",
      ),
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
  const router = useRouter(); // Instanciando o router

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        nome: data.name,
        email: data.email,
        senha: data.password,
      };

      // Chamada real para a sua rota do backend
      await api.post("/register", payload);

      // ✨ O PULO DO GATO: Salva o e-mail na sessão temporária da aba
      sessionStorage.setItem("@ACI:pendingEmail", data.email);

      toast.success("Conta criada com sucesso!");

      // Redireciona
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
                  error={errors.password?.message}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-gray-400 hover:text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <HiOutlineEyeOff size={20} />
                  ) : (
                    <HiOutlineEye size={20} />
                  )}
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

            <p className="text-xs text-gray-500 leading-relaxed">
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
              className="w-full justify-center py-3 text-base shadow-lg shadow-blue-900/10 group"
              disabled={isLoading}
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

          <p className="text-center text-sm text-gray-600">
            Já tem cadastro?{" "}
            <Link
              href="/entrar"
              className="text-primary font-bold hover:underline"
            >
              Fazer Login
            </Link>
          </p>
        </div>
      </div>

      {/* --- LADO DIREITO: BRANDING (MANTIDO EXATAMENTE IGUAL) --- */}
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
