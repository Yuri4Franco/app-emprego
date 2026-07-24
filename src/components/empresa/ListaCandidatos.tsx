"use client";

import { useState, useEffect } from "react";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineExclamationCircle,
  HiOutlineXCircle,
  HiOutlineClipboardList,
  HiStar,
  HiOutlineArrowRight,
  HiOutlineArchive,
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
  HiOutlineDownload,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { pdf } from "@react-pdf/renderer";
import JSZip from "jszip";
import { CurriculoCandidaturaPDF } from "./pdf/CurriculoCandidaturaPDF";

interface Candidato {
  id_candidatura: number;
  nome: string;
  id_usuario: number;
  fora_do_perfil: boolean;
  data_inscricao: string;
  possui_agendamento: boolean;
  data_entrevista: string | null;
  avaliacao_nota?: number | null;
  whatsapp?: string | null;
  visualizada: boolean;
  status?: string;
}

interface Coluna {
  id_etapa: number;
  nome_etapa: string;
  candidatos: Candidato[];
}

interface ListaCandidatosProps {
  colunas: Coluna[];
  onAtualizar: () => void;
  onAbrirCandidato: (id: number) => void;
}

export function ListaCandidatos({
  colunas,
  onAtualizar,
  onAbrirCandidato,
}: ListaCandidatosProps) {
  // ==================== ESTADOS DE VISÃO ====================
  const [viewAtiva, setViewAtiva] = useState<"ATIVOS" | "ENCERRADOS">("ATIVOS");
  const [etapaAtivaId, setEtapaAtivaId] = useState<number | null>(null);

  // ==================== ESTADOS DE AÇÃO ====================
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [isProcessandoLote, setIsProcessandoLote] = useState(false);

  // Modais
  const [isReprovando, setIsReprovando] = useState(false);
  const [motivoLote, setMotivoLote] = useState("");
  const [modalLoteAberto, setModalLoteAberto] = useState(false);

  const [modalAprovacaoAberto, setModalAprovacaoAberto] = useState(false);
  const [candidatoParaAprovar, setCandidatoParaAprovar] = useState<
    number | null
  >(null);

  // ==================== PROCESSAMENTO DE DADOS ====================
  const statusEncerrados = ["REPROVADO", "DESISTENCIA"];

  const colunasAtivas = colunas.map((col) => ({
    ...col,
    candidatos: col.candidatos.filter(
      (c) => !statusEncerrados.includes(c.status || ""),
    ),
  }));

  const candidatosEncerrados = colunas.flatMap((col) =>
    col.candidatos.filter((c) => statusEncerrados.includes(c.status || "")),
  );

  const [isExportandoPDF, setIsExportandoPDF] = useState(false);
  const [progressoPDF, setProgressoPDF] = useState("");

  const exportarLoteParaPDF = async () => {
    if (selecionados.length === 0) return;

    try {
      setIsExportandoPDF(true);
      setProgressoPDF("Buscando dados...");
      toast.loading("Buscando dados completos dos candidatos...", {
        id: "pdf-export",
      });

      // 1. Chama o seu endpoint para buscar os dados dos currículos selecionados
      const response = await api.post("/empresa/candidaturas/perfil-lote", {
        idsCandidaturas: selecionados,
      });

      const candidaturas = response.data?.data || response.data;
      if (
        !candidaturas ||
        !Array.isArray(candidaturas) ||
        candidaturas.length === 0
      ) {
        throw new Error(
          "Nenhum dado retornado para os candidatos selecionados.",
        );
      }

      const zip = new JSZip();
      const pasta = zip.folder("Curriculos_Selecionados");

      // 2. Loop gerando os PDFs vetoriais via Web Workers
      for (let i = 0; i < candidaturas.length; i++) {
        const item = candidaturas[i];
        setProgressoPDF(`Gerando (${i + 1}/${candidaturas.length})...`);
        toast.loading(`Gerando PDF ${i + 1} de ${candidaturas.length}...`, {
          id: "pdf-export",
        });

        // Compila o componente React nativamente para um Blob vetorial de PDF
        const pdfBlob = await pdf(
          <CurriculoCandidaturaPDF item={item} />,
        ).toBlob();

        // Nome limpo: joao_silva_102.pdf
        const nomeLimpo = (
          item.curriculo?.nome ||
          item.curriculo?.usuario?.nome ||
          "Candidato"
        )
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Remove acentos
          .replace(/\s+/g, "_");

        pasta?.file(`${nomeLimpo}_${item.id_candidatura}.pdf`, pdfBlob);
      }

      setProgressoPDF("Compactando ZIP...");
      toast.loading("Compactando arquivo ZIP...", { id: "pdf-export" });

      // 3. Compila o ZIP e dispara o download nativo
      const zipBlob = await zip.generateAsync({ type: "blob" });

      const downloadUrl = window.URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `curriculos_exportados_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();

      // Limpeza
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(
        `${candidaturas.length} currículo(s) exportado(s) com sucesso!`,
        { id: "pdf-export" },
      );
    } catch (error: any) {
      console.error("Erro na exportação de PDFs:", error);
      toast.error(error.message || "Erro ao exportar currículos em lote.", {
        id: "pdf-export",
      });
    } finally {
      setIsExportandoPDF(false);
      setProgressoPDF("");
    }
  };

  // ==================== LÓGICA DE ETAPAS ====================
  useEffect(() => {
    if (colunasAtivas.length > 0 && !etapaAtivaId) {
      setEtapaAtivaId(colunasAtivas[0].id_etapa);
    }
  }, [colunasAtivas, etapaAtivaId]);

  useEffect(() => {
    if (colunasAtivas.length > 0 && etapaAtivaId) {
      const abaAindaExiste = colunasAtivas.some(
        (col) => col.id_etapa === etapaAtivaId,
      );
      if (!abaAindaExiste) {
        setEtapaAtivaId(colunasAtivas[0].id_etapa);
        setSelecionados([]);
      }
    }
  }, [colunasAtivas, etapaAtivaId]);

  const colunaAtual =
    colunasAtivas.find((col) => col.id_etapa === etapaAtivaId) ||
    colunasAtivas[0];
  const listaExibida =
    viewAtiva === "ATIVOS"
      ? colunaAtual?.candidatos || []
      : candidatosEncerrados;

  // Verifica se a coluna atual é a última do processo
  const indexColunaAtual = colunasAtivas.findIndex(
    (c) => c.id_etapa === etapaAtivaId,
  );
  const isUltimaEtapa = indexColunaAtual === colunasAtivas.length - 1;
  const isPenultimaEtapa = indexColunaAtual === colunasAtivas.length - 2;

  // ==================== CONTROLE DE SELEÇÃO ====================
  const toggleSelectAll = () => {
    if (
      selecionados.length === listaExibida.length &&
      listaExibida.length > 0
    ) {
      setSelecionados([]);
    } else {
      setSelecionados(listaExibida.map((c) => c.id_candidatura));
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selecionados.includes(id)) {
      setSelecionados(selecionados.filter((item) => item !== id));
    } else {
      setSelecionados([...selecionados, id]);
    }
  };

  // ==================== FUNÇÕES DE API ====================
  const confirmarReprovacaoEmLote = async () => {
    if (selecionados.length === 0) return;
    setIsReprovando(true);
    try {
      await api.post(`/empresa/candidaturas/reprovar-lote`, {
        id_candidaturas: selecionados,
        motivo:
          motivoLote.trim() || "Candidato não atende aos requisitos da etapa.",
      });
      toast.success(`${selecionados.length} candidato(s) reprovado(s).`);
      setModalLoteAberto(false);
      setSelecionados([]);
      onAtualizar();
    } catch (error) {
      toast.error("Erro ao processar reprovação.");
    } finally {
      setIsReprovando(false);
    }
  };

  // Centraliza a lógica real de avanço (usada tanto no individual direto quanto no confirm do modal)
  const executarAvancoAPI = async (ids: number[], emLote: boolean) => {
    setIsProcessandoLote(true);
    try {
      if (emLote) {
        await api.patch(`/empresa/candidaturas/avancar-massa`, {
          id_candidaturas: ids,
        });
        toast.success(`${ids.length} candidato(s) avançado(s) com sucesso!`);
      } else {
        await api.patch(`/empresa/candidaturas/${ids[0]}/avancar`);
        toast.success("Candidato avançado para a próxima etapa!");
      }
      setSelecionados([]);
      onAtualizar();
    } catch (error) {
      toast.error("Erro ao avançar candidato(s).");
    } finally {
      setIsProcessandoLote(false);
    }
  };

  const handleAvancarEmLoteClick = () => {
    if (selecionados.length === 0) return;
    if (isPenultimaEtapa) {
      // Se for a penúltima, avisa que vai aprovar
      setCandidatoParaAprovar(null); // null indica que é em lote
      setModalAprovacaoAberto(true);
    } else {
      // Se não, só avança normal
      executarAvancoAPI(selecionados, true);
    }
  };

  const handleAvancarIndividualClick = (
    id_candidatura: number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (isPenultimaEtapa) {
      setCandidatoParaAprovar(id_candidatura);
      setModalAprovacaoAberto(true);
    } else {
      executarAvancoAPI([id_candidatura], false);
    }
  };

  const confirmarAprovacao = async () => {
    if (candidatoParaAprovar) {
      await executarAvancoAPI([candidatoParaAprovar], false);
    } else {
      await executarAvancoAPI(selecionados, true);
    }
    setModalAprovacaoAberto(false);
    setCandidatoParaAprovar(null);
  };

  return (
    <div className="flex flex-col h-full gap-4 pb-4">
      {/* ==================== TOGGLE DE VISÃO ==================== */}
      <div className="flex bg-gray-50 p-1 md:p-1.5 rounded-[20px] md:rounded-[24px] border border-gray-100 w-full sm:w-fit mx-2 sm:mx-0">
        <button
          onClick={() => {
            setViewAtiva("ATIVOS");
            setSelecionados([]);
          }}
          className={`flex-1 sm:flex-none px-4 py-2 md:py-2.5 rounded-[16px] md:rounded-[20px] text-[11px] sm:text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            viewAtiva === "ATIVOS"
              ? "bg-white text-primary shadow-sm border border-gray-100"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
          }`}
        >
          <HiOutlineBriefcase size={16} /> Em Andamento
        </button>
        <button
          onClick={() => {
            setViewAtiva("ENCERRADOS");
            setSelecionados([]);
          }}
          className={`flex-1 sm:flex-none px-4 py-2 md:py-2.5 rounded-[16px] md:rounded-[20px] text-[11px] sm:text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            viewAtiva === "ENCERRADOS"
              ? "bg-white text-red-600 shadow-sm border border-gray-100"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
          }`}
        >
          <HiOutlineArchive size={16} /> Histórico (Encerrados)
        </button>
      </div>

      {/* ==================== NAVEGAÇÃO DE ETAPAS (SÓ MOSTRA SE ATIVO) ==================== */}
      {viewAtiva === "ATIVOS" && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar px-2">
          {colunasAtivas.map((coluna) => (
            <button
              key={coluna.id_etapa}
              onClick={() => {
                setEtapaAtivaId(coluna.id_etapa);
                setSelecionados([]);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 shrink-0
                ${
                  etapaAtivaId === coluna.id_etapa
                    ? "bg-white border-primary text-primary shadow-sm"
                    : "bg-gray-100/80 border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                }
              `}
            >
              {coluna.nome_etapa}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${etapaAtivaId === coluna.id_etapa ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}
              >
                {coluna.candidatos.length}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ==================== ÁREA DA TABELA ==================== */}
      <div className="w-full bg-white rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden relative mx-0 sm:mx-2">
        {/* BARRA DE AÇÕES EM MASSA */}
        {selecionados.length > 0 && viewAtiva === "ATIVOS" && (
          <div className="absolute top-0 left-0 right-0 bg-gray-900 text-white p-4 flex flex-col sm:flex-row items-center justify-between z-10 animate-in slide-in-from-top-4 gap-3">
            <span className="text-xs md:text-sm font-bold text-center sm:text-left">
              {selecionados.length} selecionado(s) na etapa{" "}
              {colunaAtual?.nome_etapa}
            </span>

            <div className="flex gap-2 w-full sm:w-auto">
              {/* ✨ NOVO BOTÃO DE EXPORTAR PDF EM LOTE */}
              <button
                onClick={exportarLoteParaPDF}
                disabled={isExportandoPDF || isProcessandoLote}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-gray-600 px-3 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-tighter transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                title="Baixar currículos selecionados em arquivo ZIP"
              >
                <HiOutlineDownload
                  size={16}
                  className="text-blue-400 shrink-0"
                />
                <span>{isExportandoPDF ? progressoPDF : "Exportar PDF"}</span>
              </button>

              {/* Oculta o botão Reprovar se for a etapa de Aprovados */}
              {!isUltimaEtapa && (
                <button
                  onClick={() => setModalLoteAberto(true)}
                  disabled={isProcessandoLote || isExportandoPDF}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-red-500 hover:text-white px-3 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-tighter transition-colors text-gray-300 disabled:opacity-50"
                >
                  <HiOutlineXCircle size={16} /> Reprovar
                </button>
              )}

              {/* Oculta Avançar se for a última etapa */}
              {!isUltimaEtapa && (
                <button
                  onClick={handleAvancarEmLoteClick}
                  disabled={isProcessandoLote || isExportandoPDF}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-tighter transition-colors text-white disabled:opacity-50 shadow-lg ${isPenultimaEtapa ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20"}`}
                >
                  {isPenultimaEtapa ? (
                    <HiOutlineCheckCircle size={16} />
                  ) : (
                    <HiOutlineArrowRight size={16} />
                  )}
                  {isPenultimaEtapa ? "Aprovar Lote" : "Avançar Lote"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* CONTAINER DA TABELA (COM SCROLL HORIZONTAL) */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black sticky top-0 z-0">
                {viewAtiva === "ATIVOS" && (
                  <th className="p-4 md:p-5 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={
                        listaExibida.length > 0 &&
                        selecionados.length === listaExibida.length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </th>
                )}
                <th
                  className={`p-4 md:p-5 ${viewAtiva === "ENCERRADOS" ? "pl-8" : "pl-0"}`}
                >
                  Candidato
                </th>
                <th className="p-4 md:p-5">Avaliação</th>
                <th className="p-4 md:p-5 text-center">Detalhes</th>
                <th className="p-4 md:p-5 text-right pr-8">Status / Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {listaExibida.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 md:p-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-300">
                      <HiOutlineClipboardList size={48} />
                      <p className="font-bold text-sm md:text-base">
                        {viewAtiva === "ATIVOS"
                          ? "Nenhum candidato encontrado nesta etapa."
                          : "Nenhum candidato reprovado ou desistente no histórico."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                listaExibida.map((candidato) => {
                  let rowColorClass = "bg-white hover:bg-blue-50/20";

                  if (viewAtiva === "ENCERRADOS") {
                    rowColorClass =
                      "bg-gray-50/30 opacity-80 hover:opacity-100 grayscale hover:grayscale-0";
                  } else if (selecionados.includes(candidato.id_candidatura)) {
                    rowColorClass = "bg-blue-50/50";
                  } else if (candidato.avaliacao_nota) {
                    if (candidato.avaliacao_nota >= 4)
                      rowColorClass = "bg-amber-50/20 hover:bg-amber-50/50";
                    else if (candidato.avaliacao_nota <= 2)
                      rowColorClass =
                        "bg-gray-50/50 opacity-80 hover:opacity-100";
                  }

                  const diasInscrito = Math.floor(
                    (new Date().getTime() -
                      new Date(candidato.data_inscricao).getTime()) /
                      (1000 * 3600 * 24),
                  );
                  const isNovo = diasInscrito <= 2;
                  const isNaoLido = !candidato.visualizada;

                  return (
                    <tr
                      key={candidato.id_candidatura}
                      className={`transition-all group ${rowColorClass}`}
                    >
                      {viewAtiva === "ATIVOS" && (
                        <td className="p-4 md:p-5 text-center">
                          <input
                            type="checkbox"
                            checked={selecionados.includes(
                              candidato.id_candidatura,
                            )}
                            onChange={() =>
                              toggleSelectOne(candidato.id_candidatura)
                            }
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>
                      )}

                      <td
                        className={`p-4 md:p-5 cursor-pointer ${viewAtiva === "ENCERRADOS" ? "pl-8" : "pl-0"}`}
                        onClick={() =>
                          onAbrirCandidato(candidato.id_candidatura)
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 shrink-0 flex items-center justify-center">
                            {isNaoLido && viewAtiva === "ATIVOS" && (
                              <div
                                className="w-2 h-2 rounded-full bg-blue-500 shadow-sm"
                                title="Não visualizado"
                              ></div>
                            )}
                          </div>

                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0
                              ${candidato.avaliacao_nota && candidato.avaliacao_nota >= 4 ? "bg-amber-100 text-amber-600" : "bg-blue-50 text-primary"}
                            `}
                          >
                            {candidato.nome.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span
                              className={`text-sm group-hover:text-primary transition-colors whitespace-nowrap truncate max-w-[200px] md:max-w-xs ${isNaoLido && viewAtiva === "ATIVOS" ? "font-black text-gray-900" : "font-bold text-gray-800"}`}
                            >
                              {candidato.nome}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-gray-400 font-medium">
                                #{candidato.id_candidatura}
                              </span>
                              {candidato.whatsapp && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const zapLimpo =
                                      candidato.whatsapp!.replace(/\D/g, "");
                                    window.open(
                                      `https://wa.me/55${zapLimpo}`,
                                      "_blank",
                                    );
                                  }}
                                  className="text-emerald-500 hover:text-emerald-600 transition-colors"
                                  title="Chamar no WhatsApp"
                                >
                                  <FaWhatsapp size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td
                        className="p-4 md:p-5 cursor-pointer"
                        onClick={() =>
                          onAbrirCandidato(candidato.id_candidatura)
                        }
                      >
                        {candidato.avaliacao_nota ? (
                          <div className="flex items-center text-amber-400 gap-1">
                            <HiStar size={16} />
                            <span className="text-xs font-black text-amber-600">
                              {candidato.avaliacao_nota}/5
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300 font-medium italic">
                            Pendente
                          </span>
                        )}
                      </td>

                      <td
                        className="p-4 md:p-5 cursor-pointer"
                        onClick={() =>
                          onAbrirCandidato(candidato.id_candidatura)
                        }
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="text-[11px] md:text-xs text-gray-500 font-medium">
                            {new Date(
                              candidato.data_inscricao,
                            ).toLocaleDateString("pt-BR")}
                          </span>
                          <div className="flex gap-1">
                            {isNovo && (
                              <span
                                className="w-2 h-2 rounded-full bg-emerald-400"
                                title="Inscrição Recente"
                              ></span>
                            )}
                            {candidato.fora_do_perfil && (
                              <span
                                className="w-2 h-2 rounded-full bg-red-400"
                                title="Fora do Perfil"
                              ></span>
                            )}
                            {candidato.possui_agendamento && (
                              <span
                                className="w-2 h-2 rounded-full bg-purple-400"
                                title="Entrevista Agendada"
                              ></span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 md:p-5 text-right pr-6 md:pr-8">
                        {viewAtiva === "ATIVOS" ? (
                          // Lógica visual do botão: Avançar ou Aprovar, some na última etapa
                          !isUltimaEtapa && (
                            <button
                              onClick={(e) =>
                                handleAvancarIndividualClick(
                                  candidato.id_candidatura,
                                  e,
                                )
                              }
                              className={`opacity-100 md:opacity-0 group-hover:opacity-100 flex items-center gap-1.5 ml-auto px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-sm ${isPenultimaEtapa ? "bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50" : "bg-white border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"}`}
                              title={
                                isPenultimaEtapa
                                  ? "Aprovar Candidato"
                                  : "Avançar 1 Etapa"
                              }
                            >
                              {isPenultimaEtapa ? "Aprovar" : "Avançar"}{" "}
                              {isPenultimaEtapa ? (
                                <HiOutlineCheckCircle size={14} />
                              ) : (
                                <HiOutlineArrowRight size={14} />
                              )}
                            </button>
                          )
                        ) : (
                          <span className="inline-block px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[10px] font-black uppercase tracking-wider">
                            {candidato.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE REPROVAÇÃO */}
      {modalLoteAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-black text-gray-800 mb-2">
              Reprovar em Lote
            </h3>
            <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
              Você está reprovando <b>{selecionados.length}</b> candidatos da
              etapa <b>{colunaAtual?.nome_etapa}</b>. Eles serão movidos para o
              Histórico.
            </p>

            <textarea
              value={motivoLote}
              onChange={(e) => setMotivoLote(e.target.value)}
              placeholder="Digite o feedback para os candidatos..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl h-32 outline-none text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none transition-all mb-8"
            />

            <div className="flex gap-4">
              <button
                onClick={() => setModalLoteAberto(false)}
                className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarReprovacaoEmLote}
                disabled={isReprovando}
                className="flex-1 py-3 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg shadow-red-500/30 disabled:opacity-50"
              >
                {isReprovando ? "Processando..." : "Confirmar Reprovação"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE APROVAÇÃO */}
      {modalAprovacaoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineCheckCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">
              Aprovar Candidato(s)?
            </h3>
            <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
              Ao avançar,{" "}
              <b>
                {candidatoParaAprovar
                  ? "este candidato será aprovado"
                  : `estes ${selecionados.length} candidatos serão aprovados`}
              </b>{" "}
              no processo seletivo. Confirma esta ação?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setModalAprovacaoAberto(false);
                  setCandidatoParaAprovar(null);
                }}
                className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAprovacao}
                disabled={isProcessandoLote}
                className="flex-1 py-3 font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30 disabled:opacity-50 transition-colors"
              >
                {isProcessandoLote ? "Aprovando..." : "Sim, Aprovar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
