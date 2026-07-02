"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HiOutlineX, HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";

const colaboradorSchema = z.object({
    nome: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("E-mail inválido"),
    senha: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
});

type ColaboradorFormData = z.infer<typeof colaboradorSchema>;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    idEmpresa: number;
    onSuccess: () => void;
}

export function ModalAdicionarUsuario({ isOpen, onClose, idEmpresa, onSuccess }: ModalProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ColaboradorFormData>({
        resolver: zodResolver(colaboradorSchema),
        defaultValues: {
            senha: "@Acivagas555"
        }
    });

    if (!isOpen) return null;

    const onSubmit = async (data: ColaboradorFormData) => {
        setIsLoading(true);
        await toast.promise(
            api.post(`/admin/empresas/${idEmpresa}/usuarios`, data),
            {
                loading: "Criando usuário...",
                success: () => {
                    reset();
                    onSuccess();
                    onClose();
                    return "Usuário adicionado com sucesso!";
                },
                error: (err) => err.response?.data?.error || "Erro ao adicionar usuário.",
            }
        );
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <HiOutlineUser className="text-purple-600" /> Novo Usuário
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                        <HiOutlineX size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
                    <Input
                        label="Nome Completo"
                        placeholder="Ex: João Silva"
                        {...register("nome")}
                        error={errors.nome?.message}
                    />

                    <Input
                        label="E-mail de Acesso"
                        type="email"
                        placeholder="joao@empresa.com"
                        {...register("email")}
                        error={errors.email?.message}
                    />

                    <div className="relative">
                        <Input
                            label="Senha Provisória"
                            type={showPassword ? "text" : "password"}
                            placeholder="Mínimo 6 caracteres"
                            {...register("senha")}
                            error={errors.senha?.message}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[38px] text-gray-400 hover:text-purple-600 transition-colors"
                        >
                            {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                        </button>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <ButtonType
                            type="submit"
                            variant="primary"
                            disabled={isLoading}
                            className="w-full py-3 shadow-lg shadow-purple-200"
                        >
                            {isLoading ? "Criando..." : "Confirmar e Enviar Acesso"}
                        </ButtonType>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-all py-2"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}