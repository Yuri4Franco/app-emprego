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
  HiOutlineFilter,
  HiOutlineArrowRight,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";

// 1. TIPAGENS ATUALIZADAS
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
}

interface Coluna {
  id_etapa: number;
  nome_etapa: string;
  candidatos: Candidato[];
}

interface ListaCandidatosProps {
  colunasIniciais: Coluna[];
  onAtualizar: () => void;
  onAbrirCandidato: (id: number) => void;
}

export function ListaCandidatos({
  colunasIniciais,
  onAtualizar,
  onAbrirCandidato,
}: ListaCandidatosProps) {
  
  // ESTADOS DE ABA
  const [etapaAtivaId, setEtapaAtivaId] = useState<number | null>(null);

  // ESTADOS DE FILTRO
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroSemAvaliacao, setFiltroSemAvaliacao] = useState(false);
  const [filtroNovos, setFiltroNovos] = useState(false);

  useEffect(() => {
    if (colunasIniciais.length > 0 && !etapaAtivaId) {
      setEtapaAtivaId(colunasIniciais[0].id_etapa);
    }
  }, [colunasIniciais, etapaAtivaId]);

  // DADOS DA ETAPA ATIVA COM FILTROS APLICADOS
  const colunaAtual = colunasIniciais.find((col) => col.id_etapa === etapaAtivaId);
  const candidatosBrutos = colunaAtual?.candidatos || [];
  
  const candidatosDaEtapa = candidatosBrutos.filter((c) => {
    const matchNome = c.nome.toLowerCase().includes(termoBusca.toLowerCase());
    const matchAvaliacao = filtroSemAvaliacao ? (c.avaliacao_nota === null || c.avaliacao_nota === undefined) : true;
    
    const diasInscrito = Math.floor((new Date().getTime() - new Date(c.data_inscricao).getTime()) / (1000 * 3600 * 24));
    const matchNovo = filtroNovos ? diasInscrito <= 2 : true;

    return matchNome && matchAvaliacao && matchNovo;
  });

  // ESTADOS PARA AÇÕES EM MASSA E INDIVIDUAIS
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [isProcessandoLote, setIsProcessandoLote] = useState(false);
  const [isReprovando, setIsReprovando] = useState(false);
  const [motivoLote, setMotivoLote] = useState("");
  const [modalLoteAberto, setModalLoteAberto] = useState(false);

  // CONTROLE DE SELEÇÃO
  const toggleSelectAll = () => {
    if (selecionados.length === candidatosDaEtapa.length) {
      setSelecionados([]);
    } else {
      setSelecionados(candidatosDaEtapa.map((c) => c.id_candidatura));
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selecionados.includes(id)) {
      setSelecionados(selecionados.filter((item) => item !== id));
    } else {
      setSelecionados([...selecionados, id]);
    }
  };

  // ==================== FUNÇÕES DE AÇÃO (API) ====================

  // REPROVAR LOTE
  const confirmarReprovacaoEmLote = async () => {
    if (selecionados.length === 0) return;
    setIsReprovando(true);
    try {
      await api.post(`/empresa/candidaturas/reprovar-lote`, {
        id_candidaturas: selecionados,
        motivo: motivoLote.trim() || "Candidato não atende aos requisitos da etapa.",
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

  // AVANÇAR LOTE
  const avancarEmLote = async () => {
    if (selecionados.length === 0) return;
    setIsProcessandoLote(true);
    try {
      await api.patch(`/empresa/candidaturas/avancar-massa`, {
        id_candidaturas: selecionados,
      });
      toast.success(`${selecionados.length} candidato(s) avançado(s) com sucesso!`);
      setSelecionados([]);
      onAtualizar();
    } catch (error) {
      toast.error("Erro ao avançar candidatos.");
    } finally {
      setIsProcessandoLote(false);
    }
  };

  // AVANÇAR INDIVIDUAL
  const avancarIndividual = async (id_candidatura: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita abrir o drawer
    try {
      await api.patch(`/empresa/candidaturas/${id_candidatura}/avancar`);
      toast.success("Candidato avançado para a próxima etapa!");
      onAtualizar();
    } catch (error) {
      toast.error("Erro ao avançar candidato.");
    }
  };

  // ===============================================================

  return (
    <div className="flex flex-col h-full gap-4 pb-4">
      
      {/* BARRA DE FILTROS SUPERIOR */}
      <div className="flex flex-col sm:flex-row gap-4 mb-2 px-2 items-start sm:items-center">
        <input
          type="text"
          placeholder="Buscar candidato por nome..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          className="w-full sm:max-w-md px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-50 transition-all shadow-sm"
        />
        
        <div className="flex flex-wrap gap-3">
          <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer transition-colors font-bold select-none
            ${filtroSemAvaliacao ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}
          `}>
            <input type="checkbox" className="hidden" checked={filtroSemAvaliacao} onChange={() => setFiltroSemAvaliacao(!filtroSemAvaliacao)} />
            <HiOutlineFilter size={16} /> Sem Avaliação
          </label>

          <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer transition-colors font-bold select-none
            ${filtroNovos ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}
          `}>
            <input type="checkbox" className="hidden" checked={filtroNovos} onChange={() => setFiltroNovos(!filtroNovos)} />
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Apenas Novos
          </label>
        </div>
      </div>

      {/* NAVEGAÇÃO DE SUB-ABAS (ETAPAS) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-2">
        {colunasIniciais.map((coluna) => (
          <button
            key={coluna.id_etapa}
            onClick={() => {
              setEtapaAtivaId(coluna.id_etapa);
              setSelecionados([]);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 shrink-0
              ${etapaAtivaId === coluna.id_etapa ? "bg-white border-primary text-primary shadow-sm" : "bg-gray-100/80 border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-200"}
            `}
          >
            {coluna.nome_etapa}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${etapaAtivaId === coluna.id_etapa ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}>
              {coluna.candidatos.length}
            </span>
          </button>
        ))}
      </div>

      {/* ÁREA DA TABELA */}
      <div className="w-full bg-white rounded-[32px] shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden relative mx-2">
        
        {/* BARRA DE AÇÕES EM MASSA (Contextualizada para a etapa) */}
        {selecionados.length > 0 && (
          <div className="absolute top-0 left-0 right-0 bg-gray-900 text-white p-4 flex items-center justify-between z-10 animate-in slide-in-from-top-4">
            <span className="text-sm font-bold">
              {selecionados.length} selecionado(s) na etapa {colunaAtual?.nome_etapa}
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => setModalLoteAberto(true)}
                disabled={isProcessandoLote}
                className="flex items-center gap-2 bg-gray-700 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-colors text-gray-300 disabled:opacity-50"
              >
                <HiOutlineXCircle size={18} /> Reprovar
              </button>
              
              <button
                onClick={avancarEmLote}
                disabled={isProcessandoLote}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-colors text-white disabled:opacity-50 shadow-lg shadow-emerald-500/20"
              >
                <HiOutlineArrowRight size={18} /> Avançar Etapa
              </button>
            </div>
          </div>
        )}

        {/* LISTAGEM */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black sticky top-0 z-0">
                <th className="p-5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={candidatosDaEtapa.length > 0 && selecionados.length === candidatosDaEtapa.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </th>
                <th className="p-5">Candidato</th>
                <th className="p-5">Avaliação</th>
                <th className="p-5 text-center">Inscrição & Perfil</th>
                <th className="p-5 text-right pr-8">Ação Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {candidatosDaEtapa.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-300">
                      <HiOutlineClipboardList size={48} />
                      <p className="font-bold">Nenhum candidato encontrado nesta etapa.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                candidatosDaEtapa.map((candidato) => {
                  
                  // LÓGICA DE CORES DA LINHA (Igual ao Kanban)
                  let rowColorClass = "bg-white hover:bg-blue-50/20";
                  if (selecionados.includes(candidato.id_candidatura)) {
                    rowColorClass = "bg-blue-50/50"; // Selecionado sobrepõe a cor da nota
                  } else if (candidato.avaliacao_nota) {
                    if (candidato.avaliacao_nota >= 4) rowColorClass = "bg-amber-50/20 hover:bg-amber-50/50";
                    else if (candidato.avaliacao_nota <= 2) rowColorClass = "bg-gray-50/50 opacity-80 hover:opacity-100";
                  }

                  const diasInscrito = Math.floor((new Date().getTime() - new Date(candidato.data_inscricao).getTime()) / (1000 * 3600 * 24));
                  const isNovo = diasInscrito <= 2;

                  return (
                  <tr
                    key={candidato.id_candidatura}
                    className={`transition-colors group ${rowColorClass}`}
                  >
                    <td className="p-5 text-center">
                      <input
                        type="checkbox"
                        checked={selecionados.includes(candidato.id_candidatura)}
                        onChange={() => toggleSelectOne(candidato.id_candidatura)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>
                    
                    {/* DADOS DO CANDIDATO */}
                    <td
                      className="p-5 cursor-pointer"
                      onClick={() => onAbrirCandidato(candidato.id_candidatura)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0
                          ${candidato.avaliacao_nota && candidato.avaliacao_nota >= 4 ? "bg-amber-100 text-amber-600" : "bg-blue-50 text-primary"}
                        `}>
                          {candidato.nome.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-sm group-hover:text-primary transition-colors">
                            {candidato.nome}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 font-medium">
                              #{candidato.id_candidatura}
                            </span>
                            {candidato.whatsapp && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const zapLimpo = candidato.whatsapp!.replace(/\D/g, '');
                                  window.open(`https://wa.me/55${zapLimpo}`, '_blank');
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

                    {/* AVALIAÇÃO */}
                    <td className="p-5 cursor-pointer" onClick={() => onAbrirCandidato(candidato.id_candidatura)}>
                      {candidato.avaliacao_nota ? (
                        <div className="flex items-center text-amber-400 gap-1">
                          <HiStar size={16} />
                          <span className="text-xs font-black text-amber-600">{candidato.avaliacao_nota}/5</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 font-medium italic">Pendente</span>
                      )}
                    </td>

                    {/* INSCRIÇÃO E TAGS */}
                    <td className="p-5 cursor-pointer" onClick={() => onAbrirCandidato(candidato.id_candidatura)}>
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">
                          {new Date(candidato.data_inscricao).toLocaleDateString("pt-BR")}
                        </span>
                        <div className="flex gap-1">
                          {isNovo && <span className="w-2 h-2 rounded-full bg-emerald-400" title="Inscrição Recente"></span>}
                          {candidato.fora_do_perfil && <span className="w-2 h-2 rounded-full bg-red-400" title="Fora do Perfil"></span>}
                          {candidato.possui_agendamento && <span className="w-2 h-2 rounded-full bg-purple-400" title="Entrevista Agendada"></span>}
                        </div>
                      </div>
                    </td>

                    {/* AÇÕES INDIVIDUAIS */}
                    <td className="p-5 text-right pr-8">
                      <button
                        onClick={(e) => avancarIndividual(candidato.id_candidatura, e)}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 ml-auto px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-sm"
                        title="Avançar 1 Etapa"
                      >
                        Avançar <HiOutlineArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE REPROVAÇÃO (Mesma lógica) */}
      {modalLoteAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-black text-gray-800 mb-2">
              Reprovar em Lote
            </h3>
            <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
              Você está reprovando <b>{selecionados.length}</b> candidatos da
              etapa <b>{colunaAtual?.nome_etapa}</b>. Eles serão movidos para o
              status de reprovados.
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
    </div>
  );
}