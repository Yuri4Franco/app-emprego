"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/AuthContext";
import toast from "react-hot-toast";
import api from "@/src/services/api";
import { ButtonType } from "@/src/components/ButtonType";
import { HiOutlinePaperAirplane, HiOutlineCheckCircle, HiOutlineXMark } from "react-icons/hi2";

interface BotaoProps {
    idVaga: number;
    tituloVaga: string;
}

export function BotaoCandidaturaDinamico({ idVaga, tituloVaga }: BotaoProps) {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [jaInscrito, setJaInscrito] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(true);

    // 1. Verificamos se o candidato logado já se inscreveu nesta vaga
    useEffect(() => {
        async function checkStatus() {
            if (isAuthenticated && user?.role === "CANDIDATO") {
                try {
                    const res = await api.get(`/candidato/vaga/${idVaga}/status`);
                    if (res.data.success) {
                        setJaInscrito(res.data.data.inscrito);
                    }
                } catch (error) {
                    console.error("Erro ao checar status da inscrição", error);
                } finally {
                    setLoadingStatus(false);
                }
            } else {
                setLoadingStatus(false);
            }
        }
        checkStatus();
    }, [idVaga, isAuthenticated, user]);

    const handleAction = () => {
        if (!isAuthenticated) {
            toast("Faça login para se candidatar!", { icon: "👋" });
            router.push(`/entrar`);
            return;
        }

        if (user?.role !== "CANDIDATO") {
            toast.error("Apenas candidatos podem se aplicar em vagas.");
            return;
        }

        if (jaInscrito) {
            router.push("/candidato/minhas-vagas"); // Redireciona para onde ele acompanha
            return;
        }

        setIsModalOpen(true);
    };

    const confirmarCandidatura = async () => {
        setIsApplying(true);
        try {
            await api.post(`/vagas/${idVaga}/candidatar`);
            toast.success("Currículo enviado! Boa sorte!", { duration: 5000 });
            setJaInscrito(true);
            setIsModalOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Erro ao se candidatar.");
        } finally {
            setIsApplying(false);
        }
    };

    // Enquanto checa o banco, mostramos um estado neutro
    if (loadingStatus) {
        return <div className="h-14 w-48 bg-gray-100 animate-pulse rounded-[20px]" />;
    }

    // ESTADO: JÁ INSCRITO
    if (jaInscrito) {
        return (
            <ButtonType
                onClick={handleAction}
                className="w-full md:w-auto px-10 py-4 rounded-[20px] bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 flex items-center justify-center gap-2 text-lg border-none"
            >
                <HiOutlineCheckCircle size={24} />
                Inscrição Realizada
            </ButtonType>
        );
    }

    // ESTADO: PADRÃO (PÚBLICO OU LOGADO)
    return (
        <>
            <ButtonType
                onClick={handleAction}
                className="w-full md:w-auto px-10 py-4 rounded-[20px] shadow-lg flex items-center justify-center gap-2 text-lg transition-all hover:scale-[1.02]"
            >
                Quero me candidatar
            </ButtonType>

            {/* MODAL (Refatorado para ser mais clean) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-gray-800">Quase lá!</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <HiOutlineXMark size={24} />
                            </button>
                        </div>

                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Você está enviando seu perfil para a vaga <span className="font-bold text-primary">{tituloVaga}</span>.
                            A empresa terá acesso ao seu currículo atualizado.
                        </p>

                        <div className="bg-primary/5 rounded-[24px] p-6 mb-8 border border-primary/10">
                            <p className="text-sm text-primary font-medium">
                                🚀 Dica: Revise suas experiências no seu perfil antes de confirmar o envio!
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <ButtonType onClick={confirmarCandidatura} disabled={isApplying} className="w-full py-5 rounded-[20px]">
                                {isApplying ? "Processando..." : "Sim, confirmar envio"}
                            </ButtonType>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={isApplying}
                                className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
                            >
                                Voltar e revisar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}