"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/AuthContext";
import toast from "react-hot-toast";
import api from "@/src/services/api";
import { ButtonType } from "@/src/components/ButtonType";
import { HiOutlinePaperAirplane, HiOutlineH1 } from "react-icons/hi2";

interface BotaoCandidatarProps {
  idVaga: number;
  tituloVaga: string;
}

export function BotaoCandidatar({ idVaga, tituloVaga }: BotaoCandidatarProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleAction = () => {
    if (!isAuthenticated) {
      // Se não tá logado, manda pro login avisando que tem que voltar
      toast("Faça login ou cadastre-se para se candidatar!", { icon: "👋" });
      router.push(`/entrar`);
      return;
    }

    if (user?.role !== "CANDIDATO") {
      toast.error("Apenas candidatos podem se aplicar em vagas.");
      return;
    }

    // Se passou por tudo, abre o modal de confirmação
    setIsModalOpen(true);
  };

  const confirmarCandidatura = async () => {
    setIsApplying(true);
    try {
      // POST hipotético para a sua rota de candidatura
      await api.post(`/vagas/${idVaga}/candidatar`);
      toast.success("Currículo enviado com sucesso! Boa sorte!");
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao se candidatar.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <>
      <ButtonType
        onClick={handleAction}
        className="w-full md:w-auto px-10 py-4 rounded-[20px] shadow-lg flex items-center justify-center gap-2 text-lg"
      >
        <HiOutlinePaperAirplane className="-rotate-45" size={24} />
        Candidatar-se agora
      </ButtonType>

      {/* MODAL DE CONFIRMAÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-black text-gray-800">
                Confirmar Candidatura
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-full transition-colors"
              >
                <HiOutlineH1 size={20} />
              </button>
            </div>

            <p className="text-gray-600 mb-2">
              Você está se candidatando para a vaga:
            </p>
            <p className="font-bold text-lg text-primary mb-6">{tituloVaga}</p>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8">
              <p className="text-sm text-blue-800">
                Seu currículo atual será enviado para a empresa. Certifique-se
                de que suas experiências e habilidades estão atualizadas na
                plataforma!
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isApplying}
                className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-colors"
              >
                Cancelar
              </button>
              <ButtonType
                onClick={confirmarCandidatura}
                disabled={isApplying}
                className="flex-1 rounded-2xl"
              >
                {isApplying ? "Enviando..." : "Confirmar Envio"}
              </ButtonType>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
