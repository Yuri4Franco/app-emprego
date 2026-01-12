'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi"; 

// Imagem ilustrativa (pode ser alguém trabalhando feliz)
import bgAuth from "@/src/assets/backgrounds/bg-login.jpg";
import logo from "@/src/assets/logos/logo-transparente.png";

// 1. Schema de Validação (A Regra do Jogo)
const loginSchema = z.object({
    email: z.string().min(1, "E-mail é obrigatório").email("Digite um e-mail válido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

// Inferir o tipo automaticamente do schema
type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 2. Hook do Formulário
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    // 3. Função de Envio
    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        console.log("Enviando dados:", data);

        // Simulação de API
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Aqui entraria a lógica de Auth (NextAuth, etc)
        alert("Login realizado com sucesso!"); // Temporário
        setIsLoading(false);
    };

    return (
        <div className="flex min-h-screen w-full">

            {/* --- LADO ESQUERDO: FORMULÁRIO --- */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-2 bg-white">
                <div className="w-full max-w-md space-y-8">



                    {/* Cabeçalho do Form */}
                    <div className="text-center">
                        <Link href="/" className="inline-block mb-8">
                            <Image src={logo} alt="Logo ACI Empregos" className="w-50 mx-auto mb-4" />
                        </Link>
                        <h2 className="text-2xl font-bold text-gray-900">Bem-vindo!</h2>
                        <p className="text-gray-500 mt-2">
                            Acesse sua conta para visualizar vagas e candidaturas.
                        </p>
                    </div>

                    {/* O Formulário */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <Input
                            label="E-mail"
                            type="email"
                            placeholder="seu@email.com"
                            error={errors.email?.message}
                            {...register("email")} // Conecta com o hook form
                        />

                        <div className="relative">
                            <Input
                                label="Senha"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                error={errors.password?.message}
                                {...register("password")}
                            />
                            {/* Botão de Olhinho */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[34px] text-gray-400 hover:text-primary transition-colors"
                            >
                                {showPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                                <span className="text-gray-600">Lembrar de mim</span>
                            </label>
                            <Link href="/recuperar-senha" className="text-primary font-semibold hover:underline">
                                Esqueceu a senha?
                            </Link>
                        </div>

                        <ButtonType
                            variant="primary"
                            className="w-full justify-center py-3 text-base shadow-lg shadow-blue-900/10"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Entrando...
                                </span>
                            ) : (
                                "Entrar na Plataforma"
                            )}
                        </ButtonType>
                    </form>

                    {/* Rodapé do Form */}
                    <p className="text-center text-sm text-gray-600">
                        Não tem uma conta?{" "}
                        <Link href="/cadastrar" className="text-primary font-bold hover:underline">
                            Crie gratuitamente
                        </Link>
                    </p>

                </div>
            </div>

            {/* --- LADO DIREITO: IMAGEM/BRANDING (Some no Mobile) --- */}
            <div className="hidden lg:block w-1/2 relative bg-gray-900">
                {/* Imagem de Fundo */}
                <div className="absolute inset-0 bg-primary z-10 mix-blend-multiply"></div>
                <Image
                    src={bgAuth}
                    alt="Imagem de Fundo ACI Empregos"
                    fill
                    className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-cover bg-center opacity-50"></div>

                <div className="relative z-20 h-full flex flex-col justify-end p-16 text-white">
                    <blockquote className="space-y-4">
                        <p className="text-2xl font-medium leading-relaxed">
                            "Graças à ACI Empregos, consegui minha recolocação no mercado em menos de uma semana. A plataforma é incrível!"
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