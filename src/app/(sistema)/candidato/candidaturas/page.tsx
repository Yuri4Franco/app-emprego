"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";
import Link from "next/link";
import toast from "react-hot-toast";
import { HiOutlineBriefcase, HiOutlineClipboardList } from "react-icons/hi";
import { CandidaturaCard } from "@/src/components/candidato/candidaturas/CandidaturaCard";
import { CompromissosList } from "@/src/components/candidato/candidaturas/CompromissosList";


export default function MinhasCandidaturasPage() {
  const [candidaturas, setCandidaturas] = useState<any[]>([]);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelingId, setIsCancelingId] = useState<number | null>(null);
  const [filtroAba, setFiltroAba] = useState<"ATIVAS" | "ENCERRADAS">("ATIVAS");

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      const [resCands, resAgend] = await Promise.all([
        api.get("/candidato/minhas-candidaturas"),
        api.get("/candidato/agendamentos"),
      ]);
      setCandidaturas(resCands.data.data || []);
      setAgendamentos(resAgend.data.data || []);
    } catch (error) {
      toast.error("Erro ao carregar seu histórico de candidaturas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleDesistir = async (idCandidatura: number) => {
    if (!confirm("Tem certeza que deseja cancelar sua inscrição? Esta ação é permanente.")) return;

    setIsCancelingId(idCandidatura);
    try {
      await api.patch(`/candidato/candidaturas/${idCandidatura}/desistir`);
      toast.success("Participação cancelada com sucesso.");
      carregarDados();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao processar solicitação.");
    } finally {
      setIsCancelingId(null);
    }
  };

  const candidaturasFiltradas = candidaturas.filter((c) => {
    const encerradas = ["REPROVADO", "DESISTENCIA", "APROVADO"];
    return filtroAba === "ENCERRADAS" ? encerradas.includes(c.status) : !encerradas.includes(c.status);
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 font-bold animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-primary rounded-full animate-spin mb-4"></div>
        Sincronizando com a base de dados...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between gap-6 items-center">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center justify-center sm:justify-start gap-3">
            <HiOutlineBriefcase className="text-primary" /> Minhas Candidaturas
          </h1>
          <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">
            Acompanhe em tempo real as etapas de seleção e retornos de vagas.
          </p>
        </div>

        <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100 shrink-0">
          {[
            { id: "ATIVAS", label: "Em Andamento" },
            { id: "ENCERRADAS", label: "Histórico" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltroAba(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                filtroAba === tab.id ? "bg-white text-primary shadow-sm border border-gray-100" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* COMPROMISSOS (Observações resolvidas internamente) */}
      <CompromissosList agendamentos={agendamentos} />

      {/* LISTAGEM PRINCIPAL */}
      <div className="space-y-4">
        {candidaturasFiltradas.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-dashed border-gray-200 p-12 md:p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineClipboardList size={28} />
            </div>
            <h3 className="text-base md:text-lg font-bold text-gray-800">Nenhum registro encontrado</h3>
            <p className="text-xs text-gray-500 mt-1">Aproveite para olhar o feed principal de vagas da plataforma.</p>
            <Link href="/vagas" className="inline-block mt-6 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all shadow-md">
              Explorar Oportunidades
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {candidaturasFiltradas.map((cand) => (
              <CandidaturaCard
                key={cand.id_candidatura}
                cand={cand}
                isCanceling={isCancelingId === cand.id_candidatura}
                onDesistir={handleDesistir}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}