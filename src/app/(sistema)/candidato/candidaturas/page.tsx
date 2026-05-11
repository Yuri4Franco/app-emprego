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
  HiOutlineCheckCircle,
  HiOutlineClock,
} from "react-icons/hi";

// Tipagens
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

interface Movimentacao {
  id_movimento: number;
  status_destino: string;
  criado_em: string;
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
  movimentacoes: Movimentacao[];
  feedback_reprovacao: string | null;
}

// 📌 Mapeamento Macro das Etapas do Processo
// Adicione novas etapas aqui no futuro e o layout vai se expandir magicamente!
const ETAPAS_PROCESSO = [
  { id: "INSCRITO", label: "Inscrição" },
  { id: "TRIAGEM", label: "Em Análise" },
  { id: "ENTREVISTA", label: "Entrevistas" },
  { id: "FINAL", label: "Resultado" },
];

export default function MinhasCandidaturasPage() {
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelingId, setIsCancelingId] = useState<number | null>(null);

  const [filtroAba, setFiltroAba] = useState< "ATIVAS" | "ENCERRADAS">(
    "ATIVAS",
  );

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
    if (
      !confirm(
        "Tem certeza que deseja cancelar sua participação neste processo seletivo? Esta ação não pode ser desfeita.",
      )
    )
      return;

    setIsCancelingId(idCandidatura);
    try {
      await api.patch(`/candidato/candidaturas/${idCandidatura}/desistir`);
      toast.success("Candidatura cancelada com sucesso.");
      carregarDados();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Erro ao cancelar candidatura.",
      );
    } finally {
      setIsCancelingId(null);
    }
  };

  const candidaturasFiltradas = candidaturas.filter((c) => {
    const encerradas = ["REPROVADO", "DESISTENCIA", "APROVADO"];
    if (filtroAba === "ENCERRADAS") return encerradas.includes(c.status);
    if (filtroAba === "ATIVAS") return !encerradas.includes(c.status);
    return true;
  });

  const getStepIndex = (statusAtual: string) => {
    if (["APROVADO", "REPROVADO", "DESISTENCIA"].includes(statusAtual))
      return 3;
    if (statusAtual === "ENTREVISTA") return 2;
    if (statusAtual === "TRIAGEM") return 1;
    return 0;
  };

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
      <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-6 items-center">
        <div className="text-center md:text-left w-full md:w-auto">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
            <HiOutlineBriefcase className="text-primary hidden sm:block" />{" "}
            Minhas candidaturas
          </h1>
          <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">
            Acompanhe o status e a evolução dos seus processos seletivos.
          </p>
        </div>

        <div className="flex w-full bg-gray-50 p-1 md:p-1.5 rounded-[20px] md:rounded-[24px] border border-gray-100">
          {[
            { id: "ATIVAS", label: "Em Andamento" },
            { id: "ENCERRADAS", label: "Histórico" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltroAba(tab.id as any)}
              className={`flex-1 px-2 md:px-6 py-2.5 rounded-[16px] md:rounded-[20px] text-[11px] sm:text-xs md:text-sm font-bold transition-all whitespace-nowrap truncate ${
                filtroAba === tab.id
                  ? "bg-white text-primary shadow-sm border border-gray-100"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* BLOCO DE ALERTAS: AGENDAMENTOS FUTUROS */}
      {agendamentos.length > 0 && (
        <div className="space-y-4 animate-in slide-in-from-top-4">
          <h2 className="text-xs md:text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-2">
            <HiOutlineCalendar size={18} className="text-purple-500" /> Próximos
            Compromissos
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {agendamentos.map((ag) => (
              <div
                key={ag.id_agendamento}
                className="bg-gradient-to-r from-purple-50 to-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-purple-200 shadow-sm flex items-start gap-4 md:gap-5 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-100 text-purple-600 rounded-[16px] md:rounded-2xl flex items-center justify-center shrink-0 border border-purple-200">
                  <HiOutlineCalendar size={24} className="md:w-7 md:h-7" />
                </div>
                <div className="flex-1 w-full space-y-1.5 md:space-y-2">
                  <p className="text-[10px] md:text-xs font-black text-purple-600 uppercase tracking-widest leading-none">
                    {new Date(ag.data_hora).toLocaleString("pt-BR", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                    })}{" "}
                    •{" "}
                    {new Date(ag.data_hora).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-gray-900 leading-tight line-clamp-1">
                      {ag.vaga_titulo}
                    </h3>
                    <p className="text-xs md:text-sm font-medium text-gray-500 line-clamp-1">
                      {ag.empresa_nome}
                    </p>
                  </div>
                  <div className="pt-3 md:pt-4 mt-2 border-t border-purple-100/50 flex items-center justify-between">
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
                      Local / Link
                    </p>
                    {ag.local_link.startsWith("http") ? (
                      <a
                        href={ag.local_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] md:text-xs font-black bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors shadow-sm w-full sm:w-auto text-center"
                      >
                        Acessar Sala Virtual
                      </a>
                    ) : (
                      <p className="text-xs md:text-sm font-bold text-gray-700 w-full sm:w-auto text-right">
                        {ag.local_link}
                      </p>
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
          <div className="bg-white rounded-[40px] border border-dashed border-gray-200 p-12 md:p-16 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineClipboardList size={32} className="md:w-10 md:h-10" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800 px-4">
              {filtroAba === "ATIVAS"
                ? "Nenhuma candidatura ativa."
                : `Nenhuma candidatura na aba ${filtroAba.toLowerCase()}.`}
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mt-2">
              Acesse o Banco de Vagas e encontre sua próxima oportunidade.
            </p>
            <Link
              href="/vagas"
              className="inline-block mt-6 px-8 py-3.5 bg-primary hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-colors shadow-lg shadow-blue-200"
            >
              Explorar Vagas
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {candidaturasFiltradas.map((cand) => {
              const isEncerrado = ["REPROVADO", "DESISTENCIA"].includes(
                cand.status,
              );
              const isAprovado = cand.status === "APROVADO";
              const stepAtual = getStepIndex(cand.status);

              const ultimaMovimentacao =
                cand.movimentacoes && cand.movimentacoes.length > 0
                  ? cand.movimentacoes[cand.movimentacoes.length - 1]
                  : null;
              const dataUltimaAtt = ultimaMovimentacao
                ? ultimaMovimentacao.criado_em
                : cand.data_inscricao;

              return (
                <div
                  key={cand.id_candidatura}
                  className={`bg-white p-5 md:p-8 rounded-[24px] md:rounded-[32px] border ${isEncerrado ? "border-gray-100 opacity-80 hover:opacity-100" : isAprovado ? "border-emerald-200 shadow-md bg-emerald-50/10" : "border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200"} transition-all flex flex-col gap-6`}
                >
                  {/* TOPO: Vaga e Empresa */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 md:gap-5">
                      {cand.vaga.empresa_logo ? (
                        <img
                          src={cand.vaga.empresa_logo}
                          alt={cand.vaga.empresa_nome}
                          className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl object-cover border border-gray-100 shrink-0 ${isEncerrado ? "grayscale" : ""}`}
                        />
                      ) : (
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center border border-gray-100 shrink-0">
                          <HiOutlineOfficeBuilding className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <h3 className="text-base md:text-xl font-black text-gray-900 leading-tight">
                          {cand.vaga.titulo}
                        </h3>
                        <p className="text-xs md:text-sm font-bold text-gray-500">
                          {cand.vaga.empresa_nome}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 px-2 py-1 rounded-md flex items-center gap-1">
                            <HiOutlineLocationMarker size={12} />{" "}
                            {cand.vaga.localizacao}
                          </span>
                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                            {cand.vaga.modelo_trabalho}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end mt-2 md:mt-0 pl-16 md:pl-0">
                      <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <HiOutlineClock size={12} /> Atualizado em{" "}
                        {new Date(dataUltimaAtt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  {/* MEIO: TIMELINE ELASTICA 100% RESPONSIVA */}
                  <div className="py-4 md:px-4">
                    <div className="flex flex-col md:flex-row w-full justify-between">
                      {ETAPAS_PROCESSO.map((etapa, index) => {
                        const isPast = index < stepAtual;
                        const isCurrent = index === stepAtual;
                        const isFirst = index === 0;
                        const isLast = index === ETAPAS_PROCESSO.length - 1;

                        // Lógica da cor da Linha Horizontal (Desktop) - Pinta se a etapa atual ou anterior for ativada
                        let desktopLineBg = "bg-gray-100";
                        if (isPast || isCurrent) {
                          desktopLineBg = isEncerrado
                            ? "bg-gray-200"
                            : "bg-blue-500";
                        }

                        // Lógica da cor da Linha Vertical (Mobile) - Pinta se a PRÓXIMA etapa já foi ativada
                        let mobileLineBg = "bg-gray-100";
                        if (stepAtual > index) {
                          mobileLineBg = isEncerrado
                            ? "bg-gray-200"
                            : "bg-blue-500";
                        }

                        // Lógica da cor da Bolinha
                        let bgColor =
                          "bg-white border-2 border-gray-200 text-gray-300";
                        if (isPast) {
                          bgColor = isEncerrado
                            ? "bg-gray-300 text-white border-gray-300"
                            : "bg-blue-500 text-white border-blue-500";
                        }
                        if (isCurrent) {
                          if (isAprovado)
                            bgColor =
                              "bg-emerald-500 text-white border-4 border-emerald-100 shadow-md";
                          else if (isEncerrado)
                            bgColor =
                              "bg-red-500 text-white border-4 border-red-100 shadow-md";
                          else
                            bgColor =
                              "bg-white text-blue-600 border-4 border-blue-500 shadow-md scale-110";
                        }

                        // Cor do Texto Explicativo
                        let textColor = "text-gray-300";
                        if (isPast) textColor = "text-gray-600";
                        if (isCurrent) {
                          if (isAprovado) textColor = "text-emerald-600";
                          else if (isEncerrado) textColor = "text-red-500";
                          else textColor = "text-blue-600";
                        }

                        return (
                          <div
                            key={etapa.id}
                            className="relative flex flex-row md:flex-col items-stretch md:items-center md:flex-1"
                          >
                            {/* Conector Horizontal (Desktop) - Da atual para a anterior */}
                            {!isFirst && (
                              <div
                                className={`hidden md:block absolute top-[11px] right-1/2 w-full h-[3px] -z-10 transition-colors duration-500 ${desktopLineBg}`}
                              />
                            )}

                            {/* Círculo + Conector Vertical (Mobile) */}
                            <div className="flex flex-col items-center shrink-0">
                              {/* Círculo Principal */}
                              <div
                                className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${bgColor}`}
                              >
                                {(isPast || (isCurrent && isAprovado)) && (
                                  <HiOutlineCheckCircle size={14} />
                                )}
                                {isCurrent && isEncerrado && (
                                  <HiOutlineXCircle size={14} />
                                )}
                                {isCurrent && !isEncerrado && !isAprovado && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                )}
                              </div>

                              {/* Conector Vertical (Desce como elástico até a próxima etapa) */}
                              {!isLast && (
                                <div
                                  className={`w-[2px] flex-1 my-1 md:hidden transition-colors duration-500 ${mobileLineBg}`}
                                />
                              )}
                            </div>

                            {/* Label Explicativo */}
                            <div className="ml-4 md:ml-0 md:mt-3 pb-8 md:pb-0 flex-1 md:w-full flex items-start md:justify-center">
                              <span
                                className={`text-[10px] font-black uppercase tracking-widest text-left md:text-center leading-tight mt-0.5 md:mt-0 ${textColor}`}
                              >
                                {etapa.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RODAPÉ: Feedbacks e Ações */}
                  <div className="mt-2 md:mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      {cand.feedback_reprovacao ? (
                        <div className="flex items-start gap-3 bg-red-50/50 p-4 rounded-[20px] border border-red-100">
                          <HiOutlineChatAlt2
                            size={20}
                            className="text-red-400 shrink-0 mt-0.5"
                          />
                          <div>
                            <p className="text-[10px] md:text-xs font-black text-red-800 uppercase tracking-widest mb-1">
                              Feedback da Empresa
                            </p>
                            <p className="text-xs md:text-sm font-medium text-red-900/80 leading-relaxed italic">
                              "{cand.feedback_reprovacao}"
                            </p>
                          </div>
                        </div>
                      ) : isAprovado ? (
                        <div className="flex items-start gap-3 bg-emerald-50/50 p-4 rounded-[20px] border border-emerald-100">
                          <span className="text-emerald-500 shrink-0 mt-0.5 text-lg md:text-xl">
                            🎉
                          </span>
                          <div>
                            <p className="text-[10px] md:text-xs font-black text-emerald-800 uppercase tracking-widest mb-1">
                              Parabéns!
                            </p>
                            <p className="text-xs md:text-sm font-medium text-emerald-900/80 leading-relaxed">
                              Você foi aprovado neste processo seletivo. A
                              empresa entrará em contato em breve.
                            </p>
                          </div>
                        </div>
                      ) : !isEncerrado ? (
                        <p className="text-xs text-gray-500 font-medium bg-gray-50 px-4 py-3 rounded-[16px] border border-gray-100 flex items-start gap-2">
                          <span className="shrink-0">💡</span> O RH está
                          analisando seu perfil. Fique atento às suas
                          notificações!
                        </p>
                      ) : (
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                          Processo encerrado.
                        </p>
                      )}
                    </div>

                    {!isEncerrado && !isAprovado && (
                      <div className="shrink-0 w-full sm:w-auto">
                        <button
                          onClick={() => handleDesistir(cand.id_candidatura)}
                          disabled={isCancelingId === cand.id_candidatura}
                          className="w-full sm:w-auto justify-center text-[11px] md:text-xs font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 px-5 py-3 rounded-full transition-colors flex items-center gap-1.5 disabled:opacity-50 border border-gray-100 sm:border-transparent hover:border-red-100"
                        >
                          <HiOutlineXCircle size={16} />
                          {isCancelingId === cand.id_candidatura
                            ? "Cancelando..."
                            : "Desistir da Vaga"}
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
