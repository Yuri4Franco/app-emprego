"use client";

import { useState, useEffect } from "react";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
  HiOutlineX,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineStar,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiStar,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineLightningBolt,
  HiOutlineArrowsExpand,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePrinter,
  HiOutlinePhone,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";

// Subcomponentes da Linha do Tempo e do Currículo Completo
import { TimelineCandidatura } from "./TimelineCandidatura";
import { CurriculoIdentidade } from "./banco-talentos/curriculo/IdentidadeContato";
import { PerfilProfissional } from "./banco-talentos/curriculo/PerfilProfissional";
import { Experiencias } from "./banco-talentos/curriculo/Experiencias";
import { CurriculoLogistica } from "./banco-talentos/curriculo/LogisticaPreferencias";
import { FormacaoAcad } from "./banco-talentos/curriculo/FormacaoAcad";
import { Habilidades } from "./banco-talentos/curriculo/Habilidades";

interface CandidatoDrawerProps {
  idCandidatura: number | null;
  onClose: () => void;
  onAtualizar: () => void;
  // ✨ PROPS OPICIONAIS PARA NAVEGAÇÃO "TINDER" (Próximo / Anterior)
  onAnterior?: () => void;
  onProximo?: () => void;
  hasAnterior?: boolean;
  hasProximo?: boolean;
}

export function CandidatoDrawer({
  idCandidatura,
  onClose,
  onAtualizar,
  onAnterior,
  onProximo,
  hasAnterior = false,
  hasProximo = false,
}: CandidatoDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dados, setDados] = useState<any>(null);

  // ✨ O SEGREDO DO MODO EXPANSÍVEL:
  const [isExpanded, setIsExpanded] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "CURRICULO" | "AVALIACAO" | "AGENDAMENTO" | "HISTORICO"
  >("CURRICULO");

  // Estados de Avaliação e Agendamento
  const [nota, setNota] = useState(0);
  const [obs, setObs] = useState("");
  const [isSalvandoAvaliacao, setIsSalvandoAvaliacao] = useState(false);

  const [dataEntrevista, setDataEntrevista] = useState("");
  const [horaEntrevista, setHoraEntrevista] = useState("");
  const [localEntrevista, setLocalEntrevista] = useState("");
  const [observacoesEntrevista, setObservacoesEntrevista] = useState("");
  const [isAgendando, setIsAgendando] = useState(false);

  // Reseta o estado ao trocar de candidato ou fechar
  useEffect(() => {
    if (!idCandidatura) {
      setIsExpanded(false);
      return;
    }

    const carregarPerfil = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(
          `/empresa/candidaturas/${idCandidatura}/perfil`,
        );
        const payload = res.data.data || res.data.dados || res.data;
        setDados(payload);

        if (payload.avaliacao) {
          setNota(payload.avaliacao.pontuacao || 0);
          setObs(payload.avaliacao.observacoes_internas || "");
        } else {
          setNota(0);
          setObs("");
        }
      } catch (error) {
        toast.error("Erro ao carregar perfil do candidato.");
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    carregarPerfil();
  }, [idCandidatura, onClose]);

  if (!idCandidatura) return null;

  const salvarAvaliacao = async () => {
    setIsSalvandoAvaliacao(true);
    try {
      await api.post(`/empresa/candidaturas/${idCandidatura}/avaliar`, {
        pontuacao: nota,
        observacoes_internas: obs,
      });
      onAtualizar();
      toast.success("Avaliação salva com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar avaliação.");
    } finally {
      setIsSalvandoAvaliacao(false);
    }
  };

  const agendarEntrevista = async () => {
    if (!dataEntrevista || !horaEntrevista || !localEntrevista) {
      toast.error("Por favor, preencha Data, Hora e Local.");
      return;
    }

    setIsAgendando(true);
    try {
      const dataHoraIso = new Date(
        `${dataEntrevista}T${horaEntrevista}:00`,
      ).toISOString();

      await api.post(`/empresa/candidaturas/${idCandidatura}/agendar`, {
        data_hora: dataHoraIso,
        local_link: localEntrevista,
        observacoes: observacoesEntrevista,
      });

      toast.success(
        "Entrevista agendada com sucesso! O candidato será notificado.",
      );
      onAtualizar();
      setIsExpanded(false);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao agendar entrevista.");
    } finally {
      setIsAgendando(false);
    }
  };

  const idade = dados?.candidato?.data_nascimento
    ? new Date().getFullYear() - new Date(dados.candidato.data_nascimento).getFullYear()
    : null;

  return (
    <>
      {/* BACKGROUND BLUR */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* DRAWER CONTAINER COM LARGURA DINÂMICA */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out ${isExpanded
          ? "w-[95vw] max-w-6xl border-l border-gray-200"
          : "w-full max-w-[640px]"
          }`}
      >
        {isLoading || !dados ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="font-bold text-sm uppercase tracking-widest">
              Carregando Dossiê...
            </p>
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* CABEÇALHO DO DRAWER (Muda conforme o modo Expandido ou Compacto)          */}
            {/* ========================================================================= */}
            {isExpanded ? (
              /* --- HEADER MODO EXPANDIDO (TELA CHEIA) --- */
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition-all"
                >
                  <HiOutlineChevronLeft size={16} /> Voltar ao Resumo
                </button>

                {/* Navegação Tinder (Próximo / Anterior) */}
                <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/50">
                  <button
                    onClick={onAnterior}
                    disabled={!hasAnterior}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  >
                    <HiOutlineChevronLeft size={16} /> Anterior
                  </button>
                  <span className="w-px h-4 bg-slate-700"></span>
                  <button
                    onClick={onProximo}
                    disabled={!hasProximo}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  >
                    Próximo <HiOutlineChevronRight size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 px-3.5 py-2 rounded-xl transition-colors"
                  >
                    <HiOutlinePrinter size={16} /> Imprimir
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                  >
                    <HiOutlineX size={20} />
                  </button>
                </div>
              </div>
            ) : (
              /* --- HEADER MODO COMPACTO (640PX) --- */
              <div className="bg-slate-50 border-b border-gray-100 shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

                <div className="p-6 md:p-8 relative z-10 flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      {dados.candidato.foto_url ? (
                        <img
                          src={dados.candidato.foto_url}
                          alt="Foto"
                          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-white text-blue-600 border border-blue-100 rounded-full flex items-center justify-center text-2xl font-black shadow-sm shrink-0">
                          {dados.candidato.usuario.nome.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                          {dados.candidato.usuario.nome}
                        </h2>
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mt-1">
                          <HiOutlineMail className="text-gray-400" />{" "}
                          {dados.candidato.usuario.email}
                        </p>
                      </div>
                    </div>

                    {/* Botões de Ação do Header Compacto */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setIsExpanded(true)}
                        title="Expandir em Tela Cheia"
                        className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors shadow-sm"
                      >
                        <HiOutlineArrowsExpand size={18} />
                      </button>
                      <button
                        onClick={onClose}
                        className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 rounded-full transition-colors shadow-sm"
                      >
                        <HiOutlineX size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Tags Rápidas */}
                  {dados.resumo_estrategico && (
                    <div className="flex flex-wrap items-center gap-2">
                      {dados.resumo_estrategico.cidade_bairro && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-[10px] font-black uppercase text-gray-600">
                          <HiOutlineLocationMarker size={14} className="text-blue-500" />
                          {dados.resumo_estrategico.cidade_bairro}
                        </span>
                      )}
                      {dados.resumo_estrategico.idade && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-[10px] font-black uppercase text-gray-600">
                          <HiOutlineUser size={14} className="text-blue-500" />
                          {dados.resumo_estrategico.idade} anos
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Seletor de Abas no Modo Compacto */}
                <div className="px-6 pb-6 relative z-10">
                  <div className="flex bg-gray-200/50 p-1.5 rounded-2xl border border-gray-100">
                    <button
                      onClick={() => setActiveTab("CURRICULO")}
                      className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeTab === "CURRICULO" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"}`}
                    >
                      <HiOutlineDocumentText size={16} /> <span className="hidden sm:inline">Resumo</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("AVALIACAO")}
                      className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeTab === "AVALIACAO" ? "bg-white text-amber-600 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"}`}
                    >
                      <HiOutlineStar size={16} /> Avaliar
                    </button>
                    <button
                      onClick={() => setActiveTab("AGENDAMENTO")}
                      className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeTab === "AGENDAMENTO" ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"}`}
                    >
                      <HiOutlineCalendar size={16} /> Agendar
                    </button>
                    <button
                      onClick={() => setActiveTab("HISTORICO")}
                      className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeTab === "HISTORICO" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"}`}
                    >
                      <HiOutlineClock size={16} /> Histórico
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CORPO SCROLLÁVEL DO DRAWER                                                */}
            {/* ========================================================================= */}
            <div className="flex-1 overflow-y-auto bg-white p-6 md:p-8 scrollbar-thin scrollbar-thumb-gray-200">

              {/* ✨ SE ESTIVER EXPANDIDO: MOSTRA O DOSSIÊ COMPLETO */}
              {isExpanded ? (
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-20">
                  <CurriculoIdentidade
                    perfil={dados.candidato}
                    acessoLiberado={true}
                    saldoCreditos={999}
                    isUnlocking={false}
                    onDesbloquear={() => { }}
                    idade={idade}
                  />

                  <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <PerfilProfissional perfil={dados.candidato} />
                  </div>

                  <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <CurriculoLogistica perfil={dados.candidato} />
                  </div>

                  <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-8">
                    <Experiencias
                      experiencias={dados.candidato.experiencias || []}
                      primeiroEmprego={dados.candidato.primeiro_emprego || false}
                    />
                    <hr className="border-gray-100" />
                    <FormacaoAcad formacoes={dados.candidato.formacoes || []} />
                    {dados.candidato.competencias?.length > 0 && (
                      <>
                        <hr className="border-gray-100" />
                        <Habilidades competencias={dados.candidato.competencias} />
                      </>
                    )}
                  </div>
                </div>
              ) : (
                /* ✨ SE NÃO ESTIVER EXPANDIDO: MOSTRA O MODO COMPACTO (ABAS) */
                <>
                  {/* ABA: RESUMO ESTRATÉGICO */}
                  {activeTab === "CURRICULO" && (
                    <div className="space-y-8 animate-in fade-in">
                      {/* Experiências Mini */}
                      <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <HiOutlineBriefcase size={16} className="text-blue-500" /> Experiências Recentes
                        </h3>
                        {dados.candidato.experiencias?.length > 0 ? (
                          <div className="space-y-4 pl-2">
                            {dados.candidato.experiencias.slice(0, 3).map((exp: any, idx: number) => (
                              <div key={idx} className="relative pl-5 border-l-2 border-gray-100">
                                <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full -left-[6px] top-1.5 border-2 border-white box-content"></div>
                                <h4 className="font-bold text-gray-900 text-sm">{exp.cargo}</h4>
                                <p className="text-xs font-bold text-gray-500">{exp.empresa}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl">Nenhuma experiência registrada.</p>
                        )}
                      </div>

                      {/* Formações Mini */}
                      <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <HiOutlineAcademicCap size={16} className="text-emerald-500" /> Principais Formações
                        </h3>
                        {dados.candidato.formacoes?.length > 0 ? (
                          <div className="space-y-4 pl-2">
                            {dados.candidato.formacoes.slice(0, 3).map((form: any, idx: number) => (
                              <div key={idx} className="relative pl-5 border-l-2 border-gray-100">
                                <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full -left-[6px] top-1.5 border-2 border-white box-content"></div>
                                <h4 className="font-bold text-gray-900 text-sm">{form.curso || form.nivel}</h4>
                                <p className="text-xs font-bold text-gray-500">{form.instituicao}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl">Nenhuma formação registrada.</p>
                        )}
                      </div>

                      {/* ✨ BOTÃO DE EXPANDIR (Substituiu o window.open!) */}
                      <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                        <button
                          onClick={() => setIsExpanded(true)}
                          className="w-full py-4 border-2 border-blue-600 bg-blue-600 text-white hover:bg-blue-700 font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                          <HiOutlineDocumentText size={18} /> Ver Perfil Completo na Gaveta
                        </button>

                        <button
                          onClick={() => window.open(`/empresa/candidaturas/${idCandidatura}/curriculo`, "_blank")}
                          className="w-full py-2.5 text-gray-400 hover:text-blue-600 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5"
                        >
                          Abrir em nova aba do navegador ↗
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ABA: AVALIAÇÃO INTERNA */}
                  {activeTab === "AVALIACAO" && (
                    <div className="space-y-6 animate-in fade-in">
                      <div className="bg-amber-50 p-6 md:p-8 rounded-[32px] border border-amber-100">
                        <div className="text-center mb-6">
                          <label className="text-[10px] font-black text-amber-900 uppercase tracking-widest block mb-3">Classificação do Perfil</label>
                          <div className="flex justify-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button key={star} onClick={() => setNota(star)} className="focus:outline-none hover:scale-110 transition-transform">
                                {nota >= star ? <HiStar size={40} className="text-amber-400 drop-shadow-sm" /> : <HiOutlineStar size={40} className="text-amber-200" />}
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea
                          value={obs}
                          onChange={(e) => setObs(e.target.value)}
                          placeholder="Notas confidenciais sobre o candidato..."
                          className="w-full p-4 bg-white border border-amber-200/50 rounded-2xl h-40 outline-none text-sm focus:border-amber-400 resize-none font-medium text-gray-700 mb-6 shadow-sm"
                        />
                        <button
                          onClick={salvarAvaliacao}
                          disabled={isSalvandoAvaliacao}
                          className="w-full py-4 font-black text-white bg-amber-500 hover:bg-amber-600 rounded-2xl shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50"
                        >
                          {isSalvandoAvaliacao ? "Salvando..." : "Salvar Avaliação"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ABA: AGENDAMENTO */}
                  {activeTab === "AGENDAMENTO" && (
                    <div className="space-y-6 animate-in fade-in">
                      <div className="bg-purple-50 p-6 md:p-8 rounded-[32px] border border-purple-100 space-y-5">
                        <h3 className="text-lg font-black text-purple-900 border-b border-purple-100/50 pb-3">Marcar Entrevista</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black text-purple-900/60 uppercase mb-1 block">Data</label>
                            <input type="date" value={dataEntrevista} onChange={(e) => setDataEntrevista(e.target.value)} className="w-full p-4 bg-white border border-purple-100 rounded-2xl text-sm font-bold text-gray-700" />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-purple-900/60 uppercase mb-1 block">Horário</label>
                            <input type="time" value={horaEntrevista} onChange={(e) => setHoraEntrevista(e.target.value)} className="w-full p-4 bg-white border border-purple-100 rounded-2xl text-sm font-bold text-gray-700" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-purple-900/60 uppercase mb-1 block">Local / Link da Reunião</label>
                          <input type="text" value={localEntrevista} onChange={(e) => setLocalEntrevista(e.target.value)} placeholder="Ex: Sala 1 ou Meet" className="w-full p-4 bg-white border border-purple-100 rounded-2xl text-sm font-medium text-gray-700" />
                        </div>
                        <button onClick={agendarEntrevista} disabled={isAgendando} className="w-full py-4 font-black text-white bg-purple-600 hover:bg-purple-700 rounded-2xl shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50">
                          {isAgendando ? "Agendando..." : "Confirmar Agendamento"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ABA: HISTÓRICO */}
                  {activeTab === "HISTORICO" && (
                    <div className="animate-in fade-in">
                      <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-6">Linha do Tempo</h3>
                      <TimelineCandidatura idCandidatura={idCandidatura} />
                    </div>
                  )}
                </>
              )}

            </div>

            {/* ========================================================================= */}
            {/* RODAPÉ FIXO (STICKY FOOTER) - APARECE APENAS NO MODO EXPANDIDO            */}
            {/* ========================================================================= */}
            {isExpanded && (
              <div className="bg-slate-900 text-white px-6 md:px-8 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-2xl">

                {/* Classificação Rápida */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avaliação Rápida:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => {
                          setNota(star);
                          // Se já tem observação ou não, salva a nota no clique para agilizar
                          api.post(`/empresa/candidaturas/${idCandidatura}/avaliar`, { pontuacao: star, observacoes_internas: obs }).then(() => {
                            toast.success(`Classificado com ${star} estrela(s)!`);
                            onAtualizar();
                          });
                        }}
                        className="focus:outline-none hover:scale-125 transition-transform"
                      >
                        {nota >= star ? <HiStar size={24} className="text-amber-400 drop-shadow-md" /> : <HiOutlineStar size={24} className="text-slate-600 hover:text-slate-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botões de Ação de Triagem no Rodapé */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => {
                      setIsExpanded(false);
                      setActiveTab("AGENDAMENTO");
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/30"
                  >
                    <HiOutlineCalendar size={16} /> Agendar
                  </button>

                  <button
                    onClick={() => {
                      // Exemplo de ação rápida para reprovar
                      if (confirm("Deseja desqualificar este candidato?")) {
                        api.patch(`/empresa/candidaturas/${idCandidatura}/status`, { status: "REPROVADO" }).then(() => {
                          toast.success("Candidato movido para Reprovados.");
                          onAtualizar();
                          if (hasProximo && onProximo) onProximo();
                          else onClose();
                        });
                      }
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-all"
                    title="Reprovar Candidato"
                  >
                    <HiOutlineXCircle size={20} />
                  </button>

                  <button
                    onClick={() => {
                      // Exemplo de ação para avançar etapa
                      toast.success("Candidato aprovado na triagem inicial!");
                      onAtualizar();
                      if (hasProximo && onProximo) onProximo();
                    }}
                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/30"
                  >
                    <HiOutlineCheckCircle size={18} /> Aprovar
                  </button>
                </div>

              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}