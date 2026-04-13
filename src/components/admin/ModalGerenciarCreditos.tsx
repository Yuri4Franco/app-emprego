"use client";

import { useState } from "react";
import { HiOutlineBadgeCheck, HiOutlinePlusCircle, HiOutlineX } from "react-icons/hi";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    idEmpresa: number;
    onSuccess: () => void;
}

export function ModalGerenciarCreditos({ isOpen, onClose, idEmpresa, onSuccess }: ModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [vagas, setVagas] = useState<number>(0);
    const [curriculos, setCurriculos] = useState<number>(0);

    if (!isOpen) return null;

    const handleConfirmar = async () => {
        if (vagas === 0 && curriculos === 0) {
            return toast.error("Informe ao menos um valor para adicionar.");
        }

        setIsLoading(true);

        const payload = {
            creditos_vagas: vagas,
            creditos_curriculos: curriculos,
            modo: "SOMAR" // Travamos no modo SOMAR como você sugeriu
        };

        await toast.promise(
            api.patch(`/admin/empresas/${idEmpresa}/creditos`, payload),
            {
                loading: "Atualizando saldo...",
                success: () => {
                    setVagas(0);
                    setCurriculos(0);
                    onSuccess();
                    onClose();
                    return "Créditos adicionados com sucesso!";
                },
                error: (err) => err.response?.data?.error || "Erro ao atualizar créditos.",
            }
        );
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <HiOutlineBadgeCheck className="text-blue-600" /> Adicionar Créditos
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                        <HiOutlineX size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <p className="text-sm text-gray-500 italic">
                        Os valores informados abaixo serão **somados** ao saldo atual da empresa.
                    </p>

                    <div className="space-y-4">
                        <div className="relative">
                            <Input
                                label="Novos Créditos de Vagas"
                                type="number"
                                min="0"
                                value={vagas}
                                onChange={(e) => setVagas(Number(e.target.value))}
                            />
                            <HiOutlinePlusCircle className="absolute right-4 top-[38px] text-blue-200" size={20} />
                        </div>

                        <div className="relative">
                            <Input
                                label="Novos Créditos de Currículos"
                                type="number"
                                min="0"
                                value={curriculos}
                                onChange={(e) => setCurriculos(Number(e.target.value))}
                            />
                            <HiOutlinePlusCircle className="absolute right-4 top-[38px] text-emerald-200" size={20} />
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <ButtonType
                            onClick={handleConfirmar}
                            variant="primary"
                            disabled={isLoading}
                            className="w-full py-4 shadow-lg shadow-blue-100"
                        >
                            {isLoading ? "Processando..." : "Confirmar Adição"}
                        </ButtonType>
                        <button
                            onClick={onClose}
                            className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-all py-2"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}