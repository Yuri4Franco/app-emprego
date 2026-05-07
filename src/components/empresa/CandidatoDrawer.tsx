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
} from "react-icons/hi";

import { FaWhatsapp } from "react-icons/fa";
import { TimelineCandidatura } from "./TimelineCandidatura";

interface CandidatoDrawerProps {
  idCandidatura: number | null;
  onClose: () => void;
  onAtualizar: () => void;
}

export function CandidatoDrawer({
  idCandidatura,
  onClose,
  onAtualizar,
}: CandidatoDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dados, setDados] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "CURRICULO" | "AVALIACAO" | "AGENDAMENTO" | "HISTORICO"
  >("CURRICULO");

  const [nota, setNota] = useState(0);
  const [obs, setObs] = useState("");
  const [isSalvandoAvaliacao, setIsSalvandoAvaliacao] = useState(false);

  const [dataEntrevista, setDataEntrevista] = useState("");
  const [horaEntrevista, setHoraEntrevista] = useState("");
  const [localEntrevista, setLocalEntrevista] = useState("");
  const [instrucoesEntrevista, setInstrucoesEntrevista] = useState("");
  const [isAgendando, setIsAgendando] = useState(false);

  useEffect(() => {
    if (!idCandidatura) return;

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

  const salvarAvaliacao = async () => {
    setIsSalvandoAvaliacao(true);
    try {
      await api.post(`/empresa/candidaturas/${idCandidatura}/avaliar`, {
        pontuacao: nota,
        observacoes_internas: obs,
      });
      onAtualizar();
      toast.success("Avaliação salva com sucesso!");
    }
    catch (error) {
      toast.error("Erro ao salvar avaliação.");
    } finally {
      setIsSalvandoAvaliacao(false);
    }
  };

  if (!idCandidatura) return null;

  const agendarEntrevista = async () => {
    if (!dataEntrevista || !horaEntrevista || !localEntrevista) {
      toast.error("Por favor, preencha Data, Hora e Local.");
      return;
    }

    setIsAgendando(true);
    try {
      // Formata a data e hora para ISO (ajuste conforme o backend espera)
      const dataHoraIso = new Date(`${dataEntrevista}T${horaEntrevista}:00`).toISOString();

      await api.post(`/empresa/candidaturas/${idCandidatura}/agendar`, {
        data_hora: dataHoraIso,
        local_link: localEntrevista,
        instrucoes: instrucoesEntrevista,
      });

      toast.success("Entrevista agendada com sucesso! O candidato será notificado.");
      onAtualizar(); // Atualiza o Kanban atrás do Drawer
      onClose(); // Fecha o Drawer
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao agendar entrevista.");
    } finally {
      setIsAgendando(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {isLoading || !dados ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold">Carregando Dossiê...</p>
          </div>
        ) : (
          <>
            <div className="p-8 border-b border-gray-100 bg-gray-50 flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 text-primary rounded-full flex items-center justify-center text-2xl font-black shrink-0">
                    {dados.candidato.usuario.nome.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 leading-tight">
                      {dados.candidato.usuario.nome}
                    </h2>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1 mt-1">
                      <HiOutlineMail /> {dados.candidato.usuario.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 rounded-full transition-colors"
                >
                  <HiOutlineX size={20} />
                </button>
              </div>

              {dados.resumo_estrategico && (
                <div className="flex flex-wrap gap-2">
                  {dados.resumo_estrategico.cidade_bairro && (
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-black uppercase text-gray-600">
                      <HiOutlineLocationMarker size={14} className="text-primary" />
                      {dados.resumo_estrategico.cidade_bairro}
                    </span>
                  )}
                  {dados.resumo_estrategico.idade && (
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-black uppercase text-gray-600">
                      <HiOutlineUser size={14} className="text-primary" />
                      {dados.resumo_estrategico.idade} anos
                    </span>
                  )}
                </div>
              )}

              <div className="flex gap-4 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("CURRICULO")}
                  className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${activeTab === "CURRICULO" ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-700"}`}
                >
                  <HiOutlineBriefcase size={18} /> Visão Estratégica
                </button>
                <button
                  onClick={() => setActiveTab("AVALIACAO")}
                  className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${activeTab === "AVALIACAO" ? "border-amber-500 text-amber-600" : "border-transparent text-gray-400 hover:text-gray-700"}`}
                >
                  <HiOutlineStar size={18} /> Avaliação Interna
                </button>
                <button
                  onClick={() => setActiveTab("AGENDAMENTO")}
                  className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${activeTab === "AGENDAMENTO" ? "border-purple-500 text-purple-600" : "border-transparent text-gray-400 hover:text-gray-700"}`}
                >
                  <HiOutlineCalendar size={18} /> Agendamento
                </button>
                <button onClick={() => setActiveTab("HISTORICO")}
                  className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${activeTab === "HISTORICO" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-700"}`}>
                    <HiOutlineClock size={18} /> Histórico</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">

              {/* === ABA: VISÃO ESTRATÉGICA === */}
              {activeTab === "CURRICULO" && (
                <div className="space-y-6 animate-in fade-in">

                  {(() => {
                    const campos = dados.vaga?.configuracao?.campos_destaque || [
                      "nome",
                      "experiencia_recente",
                      "localizacao"
                    ];

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {campos.includes("localizacao") && dados.resumo_estrategico?.cidade_bairro && (
                          <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                              <HiOutlineLocationMarker /> Localização
                            </span>
                            <p className="font-bold text-gray-800">{dados.resumo_estrategico.cidade_bairro}</p>
                          </div>
                        )}

                        {campos.includes("idade") && dados.resumo_estrategico?.idade && (
                          <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                              <HiOutlineUser /> Idade
                            </span>
                            <p className="font-bold text-gray-800">{dados.resumo_estrategico.idade} anos</p>
                          </div>
                        )}

                        {/* ATUALIZADO: ATÉ 3 EXPERIÊNCIAS */}
                        {campos.includes("experiencia_recente") && (
                          <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm md:col-span-2 border-l-4 border-l-primary">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-3">
                              <HiOutlineBriefcase /> Experiências Recentes
                            </span>
                            {dados.candidato.experiencias?.length > 0 ? (
                              <div className="space-y-4">
                                {dados.candidato.experiencias.slice(0, 3).map((exp: any, index: number) => (
                                  <div key={exp.id_experiencia || index} className={index !== 0 ? "pt-4 border-t border-gray-100" : ""}>
                                    <p className="font-bold text-gray-800">{exp.cargo}</p>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-1">
                                      <p className="text-sm text-primary font-medium">{exp.empresa}</p>
                                      <p className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded w-fit">
                                        {new Date(exp.data_inicio).getFullYear()} - {exp.data_fim ? new Date(exp.data_fim).getFullYear() : "Atual"}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">Nenhuma experiência registrada.</p>
                            )}
                          </div>
                        )}

                        {/* ATUALIZADO: ATÉ 3 FORMAÇÕES */}
                        {campos.includes("formacao_recente") && (
                          <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm md:col-span-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-3">
                              <HiOutlineAcademicCap /> Formações Recentes
                            </span>
                            {dados.candidato.formacoes?.length > 0 ? (
                              <div className="space-y-4">
                                {dados.candidato.formacoes.slice(0, 3).map((form: any, index: number) => (
                                  <div key={form.id_formacao || index} className={index !== 0 ? "pt-4 border-t border-gray-100" : ""}>
                                    <p className="font-bold text-gray-800">{form.curso}</p>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-1">
                                      <p className="text-sm text-gray-500 font-medium">{form.instituicao}</p>
                                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded w-fit">
                                        {form.situacao}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">Nenhuma formação registrada.</p>
                            )}
                          </div>
                        )}

                        {/* COMPETÊNCIAS */}
                        {campos.includes("competencias") && (
                          <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm md:col-span-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-3">
                              <HiOutlineStar /> Principais Habilidades
                            </span>
                            {dados.candidato.competencias?.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {dados.candidato.competencias.slice(0, 5).map((comp: any) => (
                                  <span key={comp.id_competencia} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200">
                                    {comp.competencia.nome}
                                  </span>
                                ))}
                                {dados.candidato.competencias.length > 5 && (
                                  <span className="px-3 py-1 text-gray-400 text-xs font-bold">+{dados.candidato.competencias.length - 5}</span>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">Nenhuma habilidade informada.</p>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })()}

                  <div className="pt-6 mt-6 border-t border-gray-100">
                    <button
                      onClick={() => window.open(`/empresa/candidaturas/${idCandidatura}/curriculo`, "_blank")}
                      className="w-full py-4 border-2 border-primary text-primary hover:bg-blue-50 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <HiOutlineDocumentText size={20} /> Ver Currículo Completo
                    </button>
                  </div>

                </div>
              )}

              {/* === ABA: AVALIAÇÃO INTERNA === */}
              {activeTab === "AVALIACAO" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-amber-50 p-6 rounded-[24px] border border-amber-100">
                    <h3 className="text-amber-800 font-bold mb-1">
                      Notas do Recrutador
                    </h3>
                    <p className="text-xs text-amber-700/80 mb-6">
                      Estas informações são confidenciais e não serão vistas pelo candidato.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-amber-900 block mb-2">
                          Classificação (1 a 5 estrelas)
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setNota(star)}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              {nota >= star ? (
                                <HiStar size={32} className="text-amber-400" />
                              ) : (
                                <HiOutlineStar size={32} className="text-amber-200 hover:text-amber-300" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-bold text-amber-900 block mb-2">
                          Observações da Entrevista/Triagem
                        </label>
                        <textarea
                          value={obs}
                          onChange={(e) => setObs(e.target.value)}
                          placeholder="Ex: Candidato muito comunicativo, porém com pouca experiência na ferramenta X..."
                          className="w-full p-4 bg-white border border-amber-200/50 rounded-2xl h-40 outline-none text-sm focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 resize-none"
                        />
                      </div>

                      <button
                        onClick={salvarAvaliacao}
                        disabled={isSalvandoAvaliacao}
                        className="w-full py-3.5 font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50"
                      >
                        {isSalvandoAvaliacao ? "Salvando..." : "Salvar Avaliação Interna"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* === ABA: AGENDAMENTO === */}
              {activeTab === "AGENDAMENTO" && (
                <div className="space-y-8 animate-in fade-in">

                  {/* Bloco de Contato Rápido */}
                  <div className="bg-purple-50/50 p-6 rounded-[24px] border border-purple-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-purple-900 font-bold mb-1 flex items-center gap-2">
                        <HiOutlineCalendar size={20} className="text-purple-600" />
                        Contato do Candidato
                      </h4>
                      <p className="text-xs text-purple-700/80">
                        Se preferir, combine a agenda diretamente antes de confirmar abaixo.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      {dados.candidato.whatsapp && (
                        <a
                          href={`https://wa.me/55${dados.candidato.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-full transition-colors"
                        >
                          <FaWhatsapp size={16} /> {dados.candidato.whatsapp}
                        </a>
                      )}
                      {dados.candidato.usuario.email && (
                        <a
                          href={`mailto:${dados.candidato.usuario.email}`}
                          className="flex items-center gap-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-full transition-colors"
                        >
                          <HiOutlineMail size={16} /> Enviar E-mail
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Formulário de Agendamento */}
                  <div className="space-y-5">
                    <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
                      Marcar Entrevista
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                          Data
                        </label>
                        <input
                          type="date"
                          value={dataEntrevista}
                          onChange={(e) => setDataEntrevista(e.target.value)}
                          className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                          Horário
                        </label>
                        <input
                          type="time"
                          value={horaEntrevista}
                          onChange={(e) => setHoraEntrevista(e.target.value)}
                          className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                        Local ou Link da Reunião
                      </label>
                      <input
                        type="text"
                        value={localEntrevista}
                        onChange={(e) => setLocalEntrevista(e.target.value)}
                        placeholder="Ex: Sala 2 - Sede ACI ou https://meet.google.com/..."
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                        Instruções (Opcional)
                      </label>
                      <textarea
                        value={instrucoesEntrevista}
                        onChange={(e) => setInstrucoesEntrevista(e.target.value)}
                        placeholder="Ex: Procure pela recepcionista Maria. Traga um documento com foto."
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl h-24 outline-none text-sm resize-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                      />
                    </div>

                    <button
                      onClick={agendarEntrevista}
                      disabled={isAgendando}
                      className="w-full py-4 font-black text-white bg-purple-600 hover:bg-purple-700 rounded-2xl shadow-lg shadow-purple-600/30 transition-all mt-4 disabled:opacity-50"
                    >
                      {isAgendando ? "Agendando..." : "Confirmar Agendamento"}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "HISTORICO" && (
                <div className="p-6">
                  <h3 className="text-lg font-black text-gray-800 mb-6">Linha do Tempo</h3>
                  {/* É só passar o ID e o componente faz a mágica! */}
                  <TimelineCandidatura idCandidatura={idCandidatura} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}