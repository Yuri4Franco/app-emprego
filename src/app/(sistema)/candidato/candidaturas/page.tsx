"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    HiOutlineBriefcase,
    HiOutlineOfficeBuilding,
    HiOutlineCalendar,
    HiOutlineXCircle,
    HiOutlineLocationMarker,
    HiOutlineChatAlt2,
    HiOutlineClipboardList,
} from "react-icons/hi";

// Tipagens baseadas no seu Backend
interface Agendamento {
    id_agendamento: number;
    id_candidatura: number;
    data_hora: string;
    local_link: string;
    observacoes: string | null;
    vaga_titulo: string;
    empresa_nome: string;
    empresa_logo: string | null;
    status_candidatura: string;
}

interface Candidatura {
    id_candidatura: number;
    data_inscricao: string;
    status: string;
    vaga: {
        titulo: string;
        modelo_trabalho: string;
        tipo_contrato: string;
        localizacao: string;
        empresa_nome: string;
        empresa_logo: string | null;
    };
    agendamento: {
        data_hora: string;
        local_link: string;
        observacoes: string | null;
    } | null;
    feedback_reprovacao: string | null;
}

// Configuração visual dos Status
const statusConfig: Record<string, { label: string; cor: string; bg: string }> = {
    INSCRITO: { label: "Inscrito", cor: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
    EM_TRIAGEM: { label: "Em Análise", cor: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    ENTREVISTA: { label: "Entrevista", cor: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
    APROVADO: { label: "Aprovado!", cor: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
    REPROVADO: { label: "Processo Encerrado", cor: "text-gray-600", bg: "bg-gray-100 border-gray-200" },
    DESISTENCIA: { label: "Cancelada", cor: "text-red-700", bg: "bg-red-50 border-red-200" },
};

export default function MinhasCandidaturasPage() {
    const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelingId, setIsCancelingId] = useState<number | null>(null);

    // Filtro de Abas
    const [filtroAba, setFiltroAba] = useState<"TODAS" | "ATIVAS" | "ENCERRADAS">("TODAS");

    const carregarDados = async () => {
        try {
            setIsLoading(true);
            const [resCands, resAgend] = await Promise.all([
                api.get("/candidato/minhas-candidaturas"),
                api.get("/candidato/agendamentos"),
            ]);
            setCandidaturas(resCands.data.data);
            setAgendamentos(resAgend.data.data);
        } catch (error) {
            toast.error("Erro ao carregar o seu histórico de vagas.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, []);

    const handleDesistir = async (idCandidatura: number) => {
        if (!confirm("Tem certeza que deseja cancelar sua participação neste processo seletivo? Esta ação não pode ser desfeita.")) return;

        setIsCancelingId(idCandidatura);
        try {
            await api.patch(`/candidato/candidaturas/${idCandidatura}/desistir`);
            toast.success("Candidatura cancelada com sucesso.");
            carregarDados(); // Recarrega a lista para atualizar a aba/status
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Erro ao cancelar candidatura.");
        } finally {
            setIsCancelingId(null);
        }
    };

    // Lógica de Filtragem das Abas
    const candidaturasFiltradas = candidaturas.filter((c) => {
        if (filtroAba === "TODAS") return true;
        const encerradas = ["REPROVADO", "DESISTENCIA", "APROVADO"];
        if (filtroAba === "ENCERRADAS") return encerradas.includes(c.status);
        if (filtroAba === "ATIVAS") return !encerradas.includes(c.status);
        return true;
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 font-bold animate-pulse">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-primary rounded-full animate-spin mb-4"></div>
                Buscando seu histórico...
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-700">

            {/* HEADER DA PÁGINA */}
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-6 items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <HiOutlineBriefcase className="text-primary" /> Minhas candidaturas
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Acompanhe o status dos seus processos seletivos.</p>
                </div>

                {/* Sistema de Abas (Pills) */}
                <div className="flex bg-gray-50 p-1.5 rounded-[24px] border border-gray-100 w-full md:w-auto">
                    {[
                        { id: "TODAS", label: "Todas" },
                        { id: "ATIVAS", label: "Em Andamento" },
                        { id: "ENCERRADAS", label: "Histórico" }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFiltroAba(tab.id as any)}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-[20px] text-sm font-bold transition-all ${filtroAba === tab.id ? "bg-white text-primary shadow-sm border border-gray-100" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* BLOCO DE ALERTAS: AGENDAMENTOS FUTUROS */}
            {agendamentos.length > 0 && (
                <div className="space-y-4 animate-in slide-in-from-top-4">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                        <HiOutlineCalendar size={18} className="text-purple-500" /> Lembretes de Entrevista
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {agendamentos.map((ag) => (
                            <div key={ag.id_agendamento} className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-[32px] border border-purple-200 shadow-sm flex items-start gap-5">
                                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 border border-purple-200">
                                    <HiOutlineCalendar size={28} />
                                </div>
                                <div className="flex-1 w-full space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-black text-purple-600 uppercase tracking-widest">
                                            {new Date(ag.data_hora).toLocaleString("pt-BR", { weekday: 'short', day: '2-digit', month: 'short' })} • {new Date(ag.data_hora).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 leading-tight">{ag.vaga_titulo}</h3>
                                        <p className="text-sm font-medium text-gray-500">{ag.empresa_nome}</p>
                                    </div>
                                    <div className="pt-3 border-t border-purple-100/50">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Local ou Link</p>
                                        {ag.local_link.startsWith("http") ? (
                                            <a href={ag.local_link} target="_blank" rel="noreferrer" className="text-sm font-bold text-primary hover:underline">Acessar Sala Virtual</a>
                                        ) : (
                                            <p className="text-sm font-bold text-gray-700">{ag.local_link}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* LISTAGEM DE CANDIDATURAS */}
            <div className="space-y-4">
                {candidaturasFiltradas.length === 0 ? (
                    <div className="bg-white rounded-[40px] border border-dashed border-gray-200 p-16 text-center">
                        <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HiOutlineClipboardList size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">
                            {filtroAba === "TODAS" ? "Você ainda não se candidatou a nenhuma vaga." : `Nenhuma candidatura na aba ${filtroAba.toLowerCase()}.`}
                        </h3>
                        <p className="text-gray-500 mt-2">Acesse o Banco de Vagas e encontre sua próxima oportunidade.</p>
                        <Link href="/vagas" className="inline-block mt-6 px-8 py-4 bg-primary hover:bg-blue-700 text-white font-bold rounded-full transition-colors shadow-lg shadow-blue-200">
                            Explorar Vagas
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5">
                        {candidaturasFiltradas.map((cand) => {
                            const conf = statusConfig[cand.status] || { label: cand.status, cor: "text-gray-700", bg: "bg-gray-100 border-gray-200" };
                            const isEncerrado = ["REPROVADO", "DESISTENCIA"].includes(cand.status);

                            return (
                                <div key={cand.id_candidatura} className={`bg-white p-6 md:p-8 rounded-[32px] border ${isEncerrado ? "border-gray-100 opacity-80 hover:opacity-100" : "border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200"} transition-all`}>

                                    {/* Topo do Card: Vaga, Empresa e Status */}
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="flex items-start gap-5">
                                            {cand.vaga.empresa_logo ? (
                                                <img src={cand.vaga.empresa_logo} alt={cand.vaga.empresa_nome} className={`w-16 h-16 rounded-2xl object-cover border border-gray-100 shrink-0 ${isEncerrado ? "grayscale" : ""}`} />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center border border-gray-100 shrink-0">
                                                    <HiOutlineOfficeBuilding size={28} />
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black text-gray-900 leading-tight">
                                                    {cand.vaga.titulo}
                                                </h3>
                                                <p className="text-sm font-bold text-gray-500">{cand.vaga.empresa_nome}</p>

                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 px-2 py-1 rounded-md flex items-center gap-1">
                                                        <HiOutlineLocationMarker size={12} /> {cand.vaga.localizacao}
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                                        {cand.vaga.modelo_trabalho}
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                                        {cand.vaga.tipo_contrato}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-start md:items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                                            <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${conf.bg} ${conf.cor}`}>
                                                {conf.label}
                                            </span>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex flex-col items-start md:items-end">
                                                <span>Inscrito em: {new Date(cand.data_inscricao).toLocaleDateString("pt-BR")}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detalhes Adicionais (Feedback ou Cancelamento) */}
                                    <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">

                                        <div className="flex-1">
                                            {/* Se teve feedback da empresa */}
                                            {cand.feedback_reprovacao && (
                                                <div className="flex items-start gap-3 bg-red-50/50 p-4 rounded-2xl border border-red-100">
                                                    <HiOutlineChatAlt2 size={20} className="text-red-400 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-black text-red-800 uppercase tracking-widest mb-1">Feedback do Recrutador</p>
                                                        <p className="text-sm font-medium text-red-900/80 leading-relaxed italic">"{cand.feedback_reprovacao}"</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Texto padrão para status ativos sem feedback */}
                                            {!cand.feedback_reprovacao && !isEncerrado && (
                                                <p className="text-sm text-gray-500 font-medium">
                                                    Fique de olho no seu e-mail e nas notificações da plataforma para novidades sobre este processo.
                                                </p>
                                            )}
                                        </div>

                                        {/* Botão de Ação: Desistir */}
                                        {!isEncerrado && (
                                            <div className="shrink-0 text-right">
                                                <button
                                                    onClick={() => handleDesistir(cand.id_candidatura)}
                                                    disabled={isCancelingId === cand.id_candidatura}
                                                    className="text-xs font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-full transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                                >
                                                    <HiOutlineXCircle size={16} />
                                                    {isCancelingId === cand.id_candidatura ? "Cancelando..." : "Desistir da Vaga"}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
}