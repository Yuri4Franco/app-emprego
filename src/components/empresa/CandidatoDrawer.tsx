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
  HiOutlineChatAlt2,
  HiOutlineLocationMarker,
  HiStar,
  HiOutlineDocumentText, // ADICIONADO AQUI
} from "react-icons/hi";

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
    "CURRICULO" | "AVALIACAO" | "AGENDAMENTO"
  >("CURRICULO");

  // Estados para Avaliação
  const [nota, setNota] = useState(0);
  const [obs, setObs] = useState("");
  const [isSalvandoAvaliacao, setIsSalvandoAvaliacao] = useState(false);

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
      toast.success("Avaliação salva com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar avaliação.");
    } finally {
      setIsSalvandoAvaliacao(false);
    }
  };

  if (!idCandidatura) return null;

  return (
    <>
      {/* OVERLAY ESCURO */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* DRAWER */}
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {isLoading || !dados ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold">Carregando Dossiê...</p>
          </div>
        ) : (
          <>
            {/* HEADER DO DRAWER */}
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

              {/* ABAS DO DRAWER (Ajustei o texto para Visão Estratégica) */}
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
              </div>
            </div>

            {/* CONTEÚDO ROLÁVEL */}
            <div className="flex-1 overflow-y-auto p-8">
              {/* ABA: VISÃO ESTRATÉGICA (Ex-Currículo) */}
              {activeTab === "CURRICULO" && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Cards Dinâmicos com base nas Configurações */}
                  {(() => {
                    const campos = dados.vaga?.configuracao
                      ?.campos_destaque || [
                      "nome",
                      "experiencia_recente",
                      "localizacao",
                    ];

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* CARD: LOCALIZAÇÃO */}
                        {campos.includes("localizacao") &&
                          dados.resumo_estrategico?.cidade_bairro && (
                            <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                                <HiOutlineLocationMarker /> Localização
                              </span>
                              <p className="font-bold text-gray-800">
                                {dados.resumo_estrategico.cidade_bairro}
                              </p>
                            </div>
                          )}

                        {/* CARD: IDADE */}
                        {campos.includes("idade") &&
                          dados.resumo_estrategico?.idade && (
                            <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                                <HiOutlineUser /> Idade
                              </span>
                              <p className="font-bold text-gray-800">
                                {dados.resumo_estrategico.idade} anos
                              </p>
                            </div>
                          )}

                        {/* CARD: ÚLTIMA EXPERIÊNCIA */}
                        {campos.includes("experiencia_recente") && (
                          <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm md:col-span-2 border-l-4 border-l-primary">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                              <HiOutlineBriefcase /> Experiência Mais Recente
                            </span>
                            {dados.candidato.experiencias?.length > 0 ? (
                              <>
                                <p className="font-bold text-gray-800">
                                  {dados.candidato.experiencias[0].cargo}
                                </p>
                                <p className="text-sm text-primary font-medium">
                                  {dados.candidato.experiencias[0].empresa}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-gray-400 italic">
                                Nenhuma experiência registrada.
                              </p>
                            )}
                          </div>
                        )}

                        {/* CARD: ÚLTIMA FORMAÇÃO */}
                        {campos.includes("formacao_recente") && (
                          <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm md:col-span-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                              <HiOutlineAcademicCap /> Formação Mais Recente
                            </span>
                            {dados.candidato.formacoes?.length > 0 ? (
                              <>
                                <p className="font-bold text-gray-800">
                                  {dados.candidato.formacoes[0].curso}
                                </p>
                                <p className="text-sm text-gray-500 font-medium">
                                  {dados.candidato.formacoes[0].instituicao}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-gray-400 italic">
                                Nenhuma formação registrada.
                              </p>
                            )}
                          </div>
                        )}

                        {/* CARD: COMPETÊNCIAS */}
                        {campos.includes("competencias") && (
                          <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm md:col-span-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-3">
                              <HiOutlineStar /> Principais Habilidades
                            </span>
                            {dados.candidato.competencias?.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {dados.candidato.competencias
                                  .slice(0, 5)
                                  .map((comp: any) => (
                                    <span
                                      key={comp.id_competencia}
                                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200"
                                    >
                                      {comp.competencia.nome}
                                    </span>
                                  ))}
                                {dados.candidato.competencias.length > 5 && (
                                  <span className="px-3 py-1 text-gray-400 text-xs font-bold">
                                    +{dados.candidato.competencias.length - 5}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">
                                Nenhuma habilidade informada.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* O BOTÃO PARA VER O CURRÍCULO COMPLETO */}
                  <div className="pt-6 mt-6 border-t border-gray-100">
                    <button
                      // Esta rota vai abrir o CV completo em uma nova guia, você precisará criar a página `/empresa/candidatos/[id]/curriculo` depois
                      onClick={() =>
                        window.open(
                          `/empresa/candidatos/${dados.candidato.id_usuario}/curriculo`,
                          "_blank",
                        )
                      }
                      className="w-full py-4 border-2 border-primary text-primary hover:bg-blue-50 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <HiOutlineDocumentText size={20} /> Ver Currículo Completo
                    </button>
                  </div>
                </div>
              )}

              {/* ABA: AVALIAÇÃO INTERNA */}
              {activeTab === "AVALIACAO" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-amber-50 p-6 rounded-[24px] border border-amber-100">
                    <h3 className="text-amber-800 font-bold mb-1">
                      Notas do Recrutador
                    </h3>
                    <p className="text-xs text-amber-700/80 mb-6">
                      Estas informações são confidenciais e não serão vistas
                      pelo candidato.
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
                                <HiOutlineStar
                                  size={32}
                                  className="text-amber-200 hover:text-amber-300"
                                />
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
                        {isSalvandoAvaliacao
                          ? "Salvando..."
                          : "Salvar Avaliação Interna"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA: AGENDAMENTO */}
              {activeTab === "AGENDAMENTO" && (
                <div className="space-y-6 animate-in fade-in flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                    <HiOutlineCalendar size={40} />
                  </div>
                  <h3 className="text-xl font-black text-gray-800">
                    Agendar Entrevista
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    A integração visual de agendamento pode ser construída aqui,
                    conectando com a sua rota de <b>POST /agendar</b>.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
