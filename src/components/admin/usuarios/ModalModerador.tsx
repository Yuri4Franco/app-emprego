"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HiOutlineShieldCheck, HiOutlineX, HiOutlineSave, HiOutlineLockClosed } from "react-icons/hi";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";
import api from "@/src/services/api";
import toast from "react-hot-toast";

const moderadorSchema = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("E-mail inválido"),
    senha: z.string().optional().or(z.literal("")),
    is_master: z.boolean(),
});

type ModeradorFormData = z.infer<typeof moderadorSchema>;

interface ModalModeradorProps {
    isOpen: boolean;
    onClose: () => void;
    usuario: any | null;
    onSuccess: () => void;
}

export function ModalModerador({ isOpen, onClose, usuario, onSuccess }: ModalModeradorProps) {
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<ModeradorFormData>({
        resolver: zodResolver(moderadorSchema),
        defaultValues: {
            nome: "",
            email: "",
            senha: "",
            is_master: false,
        }
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                nome: usuario?.nome || "",
                email: usuario?.email || "",
                senha: "",
                is_master: usuario?.is_master || false,
            });
        }
    }, [usuario, isOpen, reset]);

    if (!isOpen) return null;

    const onSubmit = async (data: ModeradorFormData) => {
        setIsLoading(true);
        const payload = { ...data, role: "ADM" };
        if (!payload.senha) delete payload.senha;

        try {
            if (usuario) {
                await api.put(`/admin/usuarios/${usuario.id_usuario}`, payload);
                toast.success("Moderador atualizado com sucesso!");
            } else {
                if (!data.senha || data.senha.length < 6) {
                    toast.error("Senha obrigatória de no mínimo 6 dígitos para novos cadastros.");
                    setIsLoading(false);
                    return;
                }
                await api.post("/admin/equipe", payload);
                toast.success("Novo moderador cadastrado!");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Erro ao salvar moderador.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <HiOutlineShieldCheck className="text-blue-600" /> {usuario ? "Editar Moderador" : "Novo Moderador"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
                        <HiOutlineX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    <Input label="Nome Completo" placeholder="Ex: Yuri Antunes" {...register("nome")} error={errors.nome?.message} />
                    <Input label="E-mail de Acesso" type="email" placeholder="nome@aci.com" {...register("email")} error={errors.email?.message} />

                    <div>
                        <Input
                            label={usuario ? "Forçar Nova Senha (Opcional)" : "Senha de Acesso"}
                            type="password"
                            placeholder="Mínimo 6 caracteres..."
                            {...register("senha")}
                            error={errors.senha?.message}
                        />
                        {usuario && (
                            <p className="text-[10px] text-gray-400 font-medium mt-1">Deixe em branco para manter a senha atual.</p>
                        )}
                    </div>

                    <label className="flex items-center justify-between cursor-pointer group bg-gray-50 p-4 rounded-xl border border-gray-200 transition-all hover:border-blue-300">
                        <div>
                            <span className="block text-sm font-bold text-gray-800">Nível de Acesso Master</span>
                            <span className="block text-[10px] text-gray-400 font-medium">Permite gerenciar outros moderadores do painel.</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={watch("is_master")}
                            onChange={(e) => setValue("is_master", e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-blue-500 cursor-pointer"
                        />
                    </label>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3.5 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
                            Cancelar
                        </button>
                        <ButtonType type="submit" disabled={isLoading} className="flex-1 py-3.5 flex items-center justify-center gap-2">
                            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full anonymity animate-spin" /> : <><HiOutlineSave size={18} /> Salvar</>}
                        </ButtonType>
                    </div>
                </form>
            </div>
        </div>
    );
}