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
  etapaAtivaId: number | null;
  onMudancaEtapa: (id: number) => void;
  isModoLeitura?: boolean; // ✨ Flag adicionada para o modo Histórico
}

export function ListaCandidatos({
  colunas,
  onAtualizar,
  onAbrirCandidato,
  etapaAtivaId,
  onMudancaEtapa,
  isModoLeitura = false, // ✨ Valor default
}: ListaCandidatosProps) {
  // ==================== ESTADOS DE VISÃO ====================
  const [viewAtiva, setViewAtiva] = useState<"ATIVOS" | "ENCERRADOS">("ATIVOS");

  // ==================== ESTADOS DE AÇÃO EM LOTE ====================
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [isProcessandoLote, setIsProcessandoLote] = useState(false);

  // ==================== BARREIRA DE PROTEÇÃO: MODAIS ====================
  // Modal de Reprovação (Serve para 1 ou N candidatos)
  const [modalReprovacaoAberto, setModalReprovacaoAberto] = useState(false);
  const [candidatoParaReprovar, setCandidatoParaReprovar] = useState<number | null>(null);
  const [isReprovando, setIsReprovando] = useState(false);

  // Modal de Avanço/Aprovação (Serve para 1 ou N candidatos)
  const [modalAvancoAberto, setModalAvancoAberto] = useState(false);
  const [candidatoParaAvancar, setCandidatoParaAvancar] = useState<number | null>(null);

  // ==================== PROCESSAMENTO DE DADOS ====================
  const statusEncerrados = ["REPROVADO", "DESISTENCIA"];

  // ✨ Se for modo leitura, não separamos os encerrados, exibimos todos conforme recebemos
  const colunasAtivas = isModoLeitura ? colunas : colunas.map((col) => ({
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
      toast.loading("Buscando dados completos dos candidatos...", { id: "pdf-export" });

      const response = await api.post("/empresa/candidaturas/perfil-lote", {
        ids: selecionados,
      });

      const candidaturas = response.data?.data || response.data;
      if (!candidaturas || !Array.isArray(candidaturas) || candidaturas.length === 0) {
        throw new Error("Nenhum dado retornado para os candidatos selecionados.");
      }

      const zip = new JSZip();
      const pasta = zip.folder("Curriculos_Selecionados");

      for (let i = 0; i < candidaturas.length; i++) {
        const item = candidaturas[i];
        setProgressoPDF(`Gerando (${i + 1}/${candidaturas.length})...`);
        toast.loading(`Gerando PDF ${i + 1} de ${candidaturas.length}...`, { id: "pdf-export" });

        const pdfBlob = await pdf(<CurriculoCandidaturaPDF item={item} />).toBlob();

        const nomeLimpo = (
          item.curriculo?.nome ||
          item.curriculo?.usuario?.nome ||
          "Candidato"
        )
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "_");

        pasta?.file(`${nomeLimpo}_${item.id_candidatura}.pdf`, pdfBlob);
      }

      setProgressoPDF("Compactando ZIP...");
      toast.loading("Compactando arquivo ZIP...", { id: "pdf-export" });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadUrl = window.URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `curriculos_exportados_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`${candidaturas.length} currículo(s) exportado(s) com sucesso!`, { id: "pdf-export" });
    } catch (error: any) {
      console.error("Erro na exportação de PDFs:", error);
      toast.error(error.message || "Erro ao exportar currículos em lote.", { id: "pdf-export" });
    } finally {
      setIsExportandoPDF(false);
      setProgressoPDF("");
    }
  };

  // ==================== LÓGICA DE ETAPAS ====================
  useEffect(() => {
    if (colunasAtivas.length > 0 && !etapaAtivaId) {
      onMudancaEtapa(colunasAtivas[0].id_etapa);
    }
  }, [colunasAtivas, etapaAtivaId, onMudancaEtapa]);

  useEffect(() => {
    if (colunasAtivas.length > 0 && etapaAtivaId) {
      const abaAindaExiste = colunasAtivas.some((col) => col.id_etapa === etapaAtivaId);
      if (!abaAindaExiste) {
        onMudancaEtapa(colunasAtivas[0].id_etapa);
        setSelecionados([]);
      }
    }
  }, [colunasAtivas, etapaAtivaId, onMudancaEtapa]);

  const colunaAtual = colunasAtivas.find((col) => col.id_etapa === etapaAtivaId) || colunasAtivas[0];
  
  // ✨ Lógica ajustada para exibir os candidatos corretamente no modo leitura
  const listaExibida = isModoLeitura 
    ? (colunaAtual?.candidatos || []) 
    : (viewAtiva === "ATIVOS" ? colunaAtual?.candidatos || [] : candidatosEncerrados);

  const indexColunaAtual = colunasAtivas.findIndex((c) => c.id_etapa === etapaAtivaId);
  const isUltimaEtapa = indexColunaAtual === colunasAtivas.length - 1;
  const isPenultimaEtapa = indexColunaAtual === colunasAtivas.length - 2;
  const proximaColuna = colunasAtivas[indexColunaAtual + 1];

  // ==================== CONTROLE DE SELEÇÃO ====================
  const toggleSelectAll = () => {
    if (selecionados.length === listaExibida.length && listaExibida.length > 0) {
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

  // ==================== HANDLERS DE INTERCEPTAÇÃO (BARREIRA) ====================
  const handleReprovarClick = (id: number | null, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCandidatoParaReprovar(id);
    setModalReprovacaoAberto(true);
  };

  const handleAvancarClick = (id: number | null, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCandidatoParaAvancar(id);
    setModalAvancoAberto(true);
  };

  // ==================== FUNÇÕES DE EXECUÇÃO REAL VIA API ====================
  const confirmarReprovacao = async () => {
    const idsAlvo = candidatoParaReprovar ? [candidatoParaReprovar] : selecionados;
    if (idsAlvo.length === 0) return;

    setIsReprovando(true);
    try {
      await api.post(`/empresa/candidaturas/reprovar-lote`, {
        id_candidaturas: idsAlvo
      });
      toast.success(`${idsAlvo.length} candidato(s) reprovado(s) com sucesso.`);
      setModalReprovacaoAberto(false);
      setCandidatoParaReprovar(null);
      setSelecionados([]);
      onAtualizar();
    } catch (error) {
      toast.error("Erro ao processar reprovação.");
    } finally {
      setIsReprovando(false);
    }
  };

  const confirmarAvanco = async () => {
    const idsAlvo = candidatoParaAvancar ? [candidatoParaAvancar] : selecionados;
    if (idsAlvo.length === 0) return;

    setIsProcessandoLote(true);
    try {
      if (idsAlvo.length > 1 || !candidatoParaAvancar) {
        await api.patch(`/empresa/candidaturas/avancar-massa`, {
          id_candidaturas: idsAlvo,
        });
        toast.success(`${idsAlvo.length} candidato(s) avançado(s) com sucesso!`);
      } else {
        await api.patch(`/empresa/candidaturas/${idsAlvo[0]}/avancar`);
        toast.success("Candidato avançado para a próxima etapa!");
      }
      setModalAvancoAberto(false);
      setCandidatoParaAvancar(null);
      setSelecionados([]);
      onAtualizar();
    } catch (error) {
      toast.error("Erro ao avançar candidato(s).");
    } finally {
      setIsProcessandoLote(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 pb-4">
      {/* ==================== TOGGLE DE VISÃO ==================== */}
      {/* ✨ Ocultamos a troca de abas Ativos/Encerrados no modo leitura */}
      {!isModoLeitura && (
        <div className="flex bg-gray-50 p-1 md:p-1.5 rounded-[20px] md:rounded-[24px] border border-gray-100 w-full sm:w-fit mx-2 sm:mx-0">
          <button
            onClick={() => {
              setViewAtiva("ATIVOS");
              setSelecionados([]);
            }}
            className={`flex-1 sm:flex-none px-4 py-2 md:py-2.5 rounded-[16px] md:rounded-[20px] text-[11px] sm:text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${viewAtiva === "ATIVOS"
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
            className={`flex-1 sm:flex-none px-4 py-2 md:py-2.5 rounded-[16px] md:rounded-[20px] text-[11px] sm:text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${viewAtiva === "ENCERRADOS"
                ? "bg-white text-red-600 shadow-sm border border-gray-100"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
              }`}
          >
            <HiOutlineArchive size={16} /> Histórico (Encerrados)
          </button>
        </div>
      )}

      {/* ==================== NAVEGAÇÃO DE ETAPAS ==================== */}
      {/* ✨ Ocultamos a navegação entre etapas no modo leitura */}
      {viewAtiva === "ATIVOS" && !isModoLeitura && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar px-2">
          {colunasAtivas.map((coluna) => (
            <button
              key={coluna.id_etapa}
              onClick={() => {
                onMudancaEtapa(coluna.id_etapa);
                setSelecionados([]);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 shrink-0
                ${etapaAtivaId === coluna.id_etapa
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
        {/* ✨ Permitimos exibir a barra de ação em massa mesmo no modo leitura, útil para exportar o PDF */}
        {selecionados.length > 0 && (viewAtiva === "ATIVOS" || isModoLeitura) && (
          <div className="absolute top-0 left-0 right-0 bg-gray-900 text-white p-4 flex flex-col sm:flex-row items-center justify-between z-10 animate-in slide-in-from-top-4 gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs md:text-sm font-bold text-center sm:text-left">
                {selecionados.length} selecionado(s) {isModoLeitura ? "" : `na etapa ${colunaAtual?.nome_etapa}`}
              </span>
              
              {/* ✨ NOVO: Botão de Desmarcar Todos */}
              <button 
                onClick={() => setSelecionados([])}
                className="text-[10px] md:text-xs text-gray-400 hover:text-white underline transition-colors"
              >
                Limpar seleção
              </button>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={exportarLoteParaPDF}
                disabled={isExportandoPDF || isProcessandoLote}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-gray-600 px-3 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-tighter transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                title="Baixar currículos selecionados em arquivo ZIP"
              >
                <HiOutlineDownload size={16} className="text-blue-400 shrink-0" />
                <span>{isExportandoPDF ? progressoPDF : "Exportar PDF"}</span>
              </button>

              {/* ✨ Ocultamos ações de alteração de estado no modo leitura */}
              {!isModoLeitura && !isUltimaEtapa && (
                <button
                  onClick={() => handleReprovarClick(null)}
                  disabled={isProcessandoLote || isExportandoPDF}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-red-500 hover:text-white px-3 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-tighter transition-colors text-gray-300 disabled:opacity-50"
                >
                  <HiOutlineXCircle size={16} /> Reprovar Lote
                </button>
              )}

              {!isModoLeitura && !isUltimaEtapa && (
                <button
                  onClick={() => handleAvancarClick(null)}
                  disabled={isProcessandoLote || isExportandoPDF}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-tighter transition-colors text-white disabled:opacity-50 shadow-lg ${isPenultimaEtapa ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20"
                    }`}
                >
                  {isPenultimaEtapa ? <HiOutlineCheckCircle size={16} /> : <HiOutlineArrowRight size={16} />}
                  {isPenultimaEtapa ? "Aprovar Lote" : "Avançar Lote"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* CONTAINER DA TABELA */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black sticky top-0 z-0">
                {/* ✨ Mostra checkbox no modo ATIVOS ou Leitura */}
                {(viewAtiva === "ATIVOS" || isModoLeitura) && (
                  <th className="p-4 md:p-5 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={listaExibida.length > 0 && selecionados.length === listaExibida.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </th>
                )}
                
                {/* ✨ Ajusta espaçamento inicial dependendo da visão/modo */}
                <th className={`p-4 md:p-5 ${viewAtiva === "ENCERRADOS" && !isModoLeitura ? "pl-8" : "pl-0"}`}>Candidato</th>
                <th className="p-4 md:p-5">Avaliação</th>
                <th className="p-4 md:p-5 text-center">Detalhes</th>
                <th className="p-4 md:p-5 text-right pr-8">{isModoLeitura ? "Status Final" : "Ações"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {listaExibida.length === 0 ? (
                <tr>
                  <td colSpan={isModoLeitura ? 5 : 5} className="p-16 md:p-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-300">
                      <HiOutlineClipboardList size={48} />
                      <p className="font-bold text-sm md:text-base">
                        {isModoLeitura 
                          ? "Nenhum candidato encontrado no histórico."
                          : viewAtiva === "ATIVOS"
                            ? "Nenhum candidato encontrado nesta etapa."
                            : "Nenhum candidato reprovado ou desistente no histórico."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                listaExibida.map((candidato) => {
                  let rowColorClass = "bg-white hover:bg-blue-50/20";

                  if (viewAtiva === "ENCERRADOS" && !isModoLeitura) {
                    rowColorClass = "bg-gray-50/30 opacity-80 hover:opacity-100 grayscale hover:grayscale-0";
                  } else if (selecionados.includes(candidato.id_candidatura)) {
                    rowColorClass = "bg-blue-50/50";
                  } else if (candidato.avaliacao_nota) {
                    if (candidato.avaliacao_nota >= 4) rowColorClass = "bg-amber-50/20 hover:bg-amber-50/50";
                    else if (candidato.avaliacao_nota <= 2) rowColorClass = "bg-gray-50/50 opacity-80 hover:opacity-100";
                  }

                  const diasInscrito = Math.floor(
                    (new Date().getTime() - new Date(candidato.data_inscricao).getTime()) / (1000 * 3600 * 24)
                  );
                  const isNovo = diasInscrito <= 2;
                  const isNaoLido = !candidato.visualizada;

                  return (
                    <tr key={candidato.id_candidatura} className={`transition-all group ${rowColorClass}`}>
                      
                      {/* ✨ Checkbox em ATIVOS ou Leitura */}
                      {(viewAtiva === "ATIVOS" || isModoLeitura) && (
                        <td className="p-4 md:p-5 text-center">
                          <input
                            type="checkbox"
                            checked={selecionados.includes(candidato.id_candidatura)}
                            onChange={() => toggleSelectOne(candidato.id_candidatura)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>
                      )}

                      <td
                        className={`p-4 md:p-5 cursor-pointer ${viewAtiva === "ENCERRADOS" && !isModoLeitura ? "pl-8" : "pl-0"}`}
                        onClick={() => onAbrirCandidato(candidato.id_candidatura)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 shrink-0 flex items-center justify-center">
                            {isNaoLido && viewAtiva === "ATIVOS" && !isModoLeitura && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" title="Não visualizado"></div>
                            )}
                          </div>

                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${candidato.avaliacao_nota && candidato.avaliacao_nota >= 4
                                ? "bg-amber-100 text-amber-600"
                                : "bg-blue-50 text-primary"
                              }`}
                          >
                            {candidato.nome.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span
                              className={`text-sm group-hover:text-primary transition-colors whitespace-nowrap truncate max-w-[200px] md:max-w-xs ${isNaoLido && viewAtiva === "ATIVOS" && !isModoLeitura ? "font-black text-gray-900" : "font-bold text-gray-800"
                                }`}
                            >
                              {candidato.nome}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-gray-400 font-medium">#{candidato.id_candidatura}</span>
                              {candidato.whatsapp && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const zapLimpo = candidato.whatsapp!.replace(/\D/g, "");
                                    window.open(`https://wa.me/55${zapLimpo}`, "_blank");
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

                      <td className="p-4 md:p-5 cursor-pointer" onClick={() => onAbrirCandidato(candidato.id_candidatura)}>
                        {candidato.avaliacao_nota ? (
                          <div className="flex items-center text-amber-400 gap-1">
                            <HiStar size={16} />
                            <span className="text-xs font-black text-amber-600">{candidato.avaliacao_nota}/5</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300 font-medium italic">Pendente</span>
                        )}
                      </td>

                      <td className="p-4 md:p-5 cursor-pointer" onClick={() => onAbrirCandidato(candidato.id_candidatura)}>
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="text-[11px] md:text-xs text-gray-500 font-medium">
                            {new Date(candidato.data_inscricao).toLocaleDateString("pt-BR")}
                          </span>
                          <div className="flex gap-1">
                            {isNovo && <span className="w-2 h-2 rounded-full bg-emerald-400" title="Inscrição Recente"></span>}
                            {candidato.fora_do_perfil && <span className="w-2 h-2 rounded-full bg-red-400" title="Fora do Perfil"></span>}
                            {candidato.possui_agendamento && <span className="w-2 h-2 rounded-full bg-purple-400" title="Entrevista Agendada"></span>}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 md:p-5 text-right pr-6 md:pr-8">
                        {isModoLeitura ? (
                          /* ✨ Etiqueta de Status para o modo Leitura */
                          <span className="inline-block px-3 py-1.5 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                            {candidato.status || "Histórico"}
                          </span>
                        ) : viewAtiva === "ATIVOS" ? (
                          /* Ações normais para o modo de Gestão */
                          !isUltimaEtapa && (
                            <div className="flex items-center justify-end gap-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                              <button
                                onClick={(e) => handleReprovarClick(candidato.id_candidatura, e)}
                                className="px-2.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-xs flex items-center gap-1"
                                title="Reprovar Candidato"
                              >
                                <HiOutlineXCircle size={14} />
                                <span className="hidden xl:inline">Reprovar</span>
                              </button>

                              <button
                                onClick={(e) => handleAvancarClick(candidato.id_candidatura, e)}
                                className={`px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-xs flex items-center gap-1 ${isPenultimaEtapa
                                    ? "bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                    : "bg-white border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                                  }`}
                                title={isPenultimaEtapa ? "Aprovar Candidato" : "Avançar 1 Etapa"}
                              >
                                <span>{isPenultimaEtapa ? "Aprovar" : "Avançar"}</span>
                                {isPenultimaEtapa ? <HiOutlineCheckCircle size={14} /> : <HiOutlineArrowRight size={14} />}
                              </button>
                            </div>
                          )
                        ) : (
                          /* Status normal de Encerrados */
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

      {/* ==================== MODAL DE REPROVAÇÃO (BLINDAGEM) ==================== */}
      {modalReprovacaoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
              <HiOutlineExclamationCircle size={28} />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">
              Confirmar Reprovação
            </h3>
            <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
              Você está prestes a reprovar{" "}
              <b>
                {candidatoParaReprovar
                  ? "este candidato"
                  : `${selecionados.length} candidato(s)`}
              </b>{" "}
              da etapa <b>{colunaAtual?.nome_etapa}</b>. Ele(s) será(ão) movido(s) para o Histórico.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalReprovacaoAberto(false);
                  setCandidatoParaReprovar(null);
                }}
                className="flex-1 py-3.5 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarReprovacao}
                disabled={isReprovando}
                className="flex-1 py-3.5 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg shadow-red-500/30 disabled:opacity-50 transition-all"
              >
                {isReprovando ? "Reprovando..." : "Sim, Reprovar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL DE AVANÇO/APROVAÇÃO (BLINDAGEM) ==================== */}
      {modalAvancoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isPenultimaEtapa ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                }`}
            >
              {isPenultimaEtapa ? <HiOutlineCheckCircle size={36} /> : <HiOutlineArrowRight size={36} />}
            </div>

            <h3 className="text-xl font-black text-gray-800 mb-2">
              {isPenultimaEtapa ? "Aprovar Candidato(s)?" : "Avançar de Etapa?"}
            </h3>

            <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
              Ao confirmar,{" "}
              <b>
                {candidatoParaAvancar
                  ? "este candidato será"
                  : `estes ${selecionados.length} candidatos serão`}
              </b>{" "}
              {isPenultimaEtapa ? (
                <span className="text-emerald-600 font-bold">aprovado(s) definitivamente no processo seletivo!</span>
              ) : (
                <>
                  movido(s) para a próxima etapa:{" "}
                  <span className="text-blue-600 font-bold block mt-1 text-base">{proximaColuna?.nome_etapa || "Próxima Etapa"}</span>
                </>
              )}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalAvancoAberto(false);
                  setCandidatoParaAvancar(null);
                }}
                className="flex-1 py-3.5 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAvanco}
                disabled={isProcessandoLote}
                className={`flex-1 py-3.5 font-bold text-white rounded-xl shadow-lg disabled:opacity-50 transition-all ${isPenultimaEtapa
                    ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"
                  }`}
              >
                {isProcessandoLote ? "Processando..." : isPenultimaEtapa ? "Sim, Aprovar" : "Sim, Avançar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}