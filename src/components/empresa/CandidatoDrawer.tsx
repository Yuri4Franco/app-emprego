"use client";

import { useState, useEffect } from "react";
import api from "@/src/services/api";
import toast from "react-hot-toast";

// Componentes da Folha A4 do Currículo
import { CurriculoIdentidade } from "./banco-talentos/curriculo/IdentidadeContato";
import { PerfilProfissional } from "./banco-talentos/curriculo/PerfilProfissional";
import { Experiencias } from "./banco-talentos/curriculo/Experiencias";
import { CurriculoLogistica } from "./banco-talentos/curriculo/LogisticaPreferencias";
import { FormacaoAcad } from "./banco-talentos/curriculo/FormacaoAcad";
import { Habilidades } from "./banco-talentos/curriculo/Habilidades";
import { DrawerAbas, DrawerFooter, DrawerHeader } from "./candidato-drawer/DrawerSubcomponents";

interface CandidatoDrawerProps {
  idCandidatura: number | null;
  onClose: () => void;
  onAtualizar: () => void;
  onAnterior?: () => void;
  onProximo?: () => void;
  hasAnterior?: boolean;
  hasProximo?: boolean;
  isModoLeitura?: boolean; // ✨ Flag adicionada para o modo Histórico
}

export function CandidatoDrawer({
  idCandidatura,
  onClose,
  onAtualizar,
  onAnterior,
  onProximo,
  hasAnterior = false,
  hasProximo = false,
  isModoLeitura = false, // ✨ Valor default
}: CandidatoDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dados, setDados] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"CURRICULO" | "AVALIACAO" | "AGENDAMENTO" | "HISTORICO">("CURRICULO");

  // Estados de Avaliação e Agendamento
  const [nota, setNota] = useState(0);
  const [obs, setObs] = useState("");
  const [isSalvandoAvaliacao, setIsSalvandoAvaliacao] = useState(false);

  const [dataEntrevista, setDataEntrevista] = useState("");
  const [horaEntrevista, setHoraEntrevista] = useState("");
  const [localEntrevista, setLocalEntrevista] = useState("");
  const [observacoesEntrevista, setObservacoesEntrevista] = useState("");
  const [isAgendando, setIsAgendando] = useState(false);

  useEffect(() => {
    if (!idCandidatura) {
      setIsExpanded(false);
      return;
    }

    const carregarPerfil = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/empresa/candidaturas/${idCandidatura}/perfil`);
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
      await api.post(`/empresa/candidaturas/${idCandidatura}/avaliar`, { pontuacao: nota, observacoes_internas: obs });
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
      const dataHoraIso = new Date(`${dataEntrevista}T${horaEntrevista}:00`).toISOString();
      await api.post(`/empresa/candidaturas/${idCandidatura}/agendar`, {
        data_hora: dataHoraIso,
        local_link: localEntrevista,
        observacoes: observacoesEntrevista,
      });
      toast.success("Entrevista agendada com sucesso!");
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
      {/* ✨ ISOLAMENTO TOTAL DE IMPRESSÃO (Só roda quando está expandido) */}
      {isExpanded && (
        <style dangerouslySetInnerHTML={{
          __html: `
          @media print {
            /* Esconde todo o DOM da página de fundo (Kanban, Header, Filtros) */
            body * {
              visibility: hidden !important;
            }
            /* Torna visível APENAS o container do Laboratório/Dossiê e seus filhos */
            #dossie-lab-container,
            #dossie-lab-container * {
              visibility: visible !important;
            }
            /* Posiciona a folha no topo absoluto do papel na impressão */
            #dossie-lab-container {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              overflow: visible !important;
            }
          }
        `}} />
      )}

      {/* Backdrop para fechar clicando fora (apenas no modo gaveta) */}
      {!isExpanded && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-40 transition-opacity animate-in fade-in print:hidden"
          onClick={onClose}
        />
      )}

      {/* CONTAINER PRINCIPAL (ID #dossie-lab-container usado no CSS de impressão acima) */}
      <div
        id="dossie-lab-container"
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl flex flex-col transition-all duration-300 ease-in-out print:static print:h-auto print:w-full print:max-w-none print:shadow-none print:border-none print:z-0 ${isExpanded
            ? "inset-0 w-screen h-screen max-w-none z-[100] bg-slate-100"
            : "w-full max-w-[640px] z-50"
          }`}
      >
        {isLoading || !dados ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="font-bold text-sm uppercase tracking-widest">Carregando Dossiê...</p>
          </div>
        ) : (
          <>
            {/* 1. TOPO DA GAVETA / LABORATÓRIO (Oculto na Impressão) */}
            <div className="print:hidden shrink-0">
              <DrawerHeader
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                onClose={onClose}
                onAnterior={onAnterior}
                onProximo={onProximo}
                hasAnterior={hasAnterior}
                hasProximo={hasProximo}
                dados={dados}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isModoLeitura={isModoLeitura} // ✨ Repassa para o Header (caso ele tenha botões de ação)
              />
            </div>

            {/* 2. CORPO ROLÁVEL (Mesa de Trabalho) */}
            <div className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 print:overflow-visible print:h-auto print:p-0 print:bg-white print:static print:max-w-none ${isExpanded ? "p-6 md:p-10 bg-slate-100" : "p-6 md:p-8 bg-white"
              }`}>
              {isExpanded ? (
                /* 🔬 MODO LABORATÓRIO: Folha A4 Centralizada como um Documento Real */
                <div className="max-w-[850px] mx-auto bg-white p-8 sm:p-12 md:p-14 rounded-[32px] shadow-xl border border-gray-200/60 space-y-8 animate-in zoom-in-[0.98] duration-300 pb-20 print:pb-0 print:max-w-none print:space-y-6 print:shadow-none print:border-none print:rounded-none print:p-0">
                  <div className="print:break-inside-avoid">
                    <CurriculoIdentidade
                      perfil={dados.candidato}
                      acessoLiberado={true}
                      saldoCreditos={999}
                      isUnlocking={false}
                      onDesbloquear={() => { }}
                      idade={idade}
                    />
                  </div>

                  <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-gray-100 shadow-xs print:shadow-none print:border-gray-300 print:p-4 print:rounded-xl print:break-inside-avoid">
                    <PerfilProfissional perfil={dados.candidato} />
                  </div>

                  <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-gray-100 shadow-xs print:shadow-none print:border-gray-300 print:p-4 print:rounded-xl print:break-inside-avoid">
                    <CurriculoLogistica perfil={dados.candidato} />
                  </div>

                  <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-gray-100 shadow-xs space-y-8 print:shadow-none print:border-gray-300 print:p-4 print:rounded-xl print:space-y-6">
                    <div className="print:break-inside-avoid">
                      <Experiencias experiencias={dados.candidato.experiencias || []} primeiroEmprego={dados.candidato.primeiro_emprego || false} />
                    </div>

                    <hr className="border-gray-100 print:border-gray-200" />

                    <div className="print:break-inside-avoid">
                      <FormacaoAcad formacoes={dados.candidato.formacoes || []} />
                    </div>

                    {dados.candidato.competencias?.length > 0 && (
                      <>
                        <hr className="border-gray-100 print:border-gray-200" />
                        <div className="print:break-inside-avoid">
                          <Habilidades competencias={dados.candidato.competencias} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                /* MODO GAVETA: Conteúdo das Abas */
                <DrawerAbas
                  activeTab={activeTab}
                  dados={dados}
                  idCandidatura={idCandidatura}
                  setIsExpanded={setIsExpanded}
                  nota={nota}
                  setNota={setNota}
                  obs={obs}
                  setObs={setObs}
                  salvarAvaliacao={salvarAvaliacao}
                  isSalvandoAvaliacao={isSalvandoAvaliacao}
                  dataEntrevista={dataEntrevista}
                  setDataEntrevista={setDataEntrevista}
                  horaEntrevista={horaEntrevista}
                  setHoraEntrevista={setHoraEntrevista}
                  localEntrevista={localEntrevista}
                  setLocalEntrevista={setLocalEntrevista}
                  observacoesEntrevista={observacoesEntrevista}
                  setObservacoesEntrevista={setObservacoesEntrevista}
                  agendarEntrevista={agendarEntrevista}
                  isAgendando={isAgendando}
                  isModoLeitura={isModoLeitura} // ✨ Repassa para ocultar botão de agendar ou textareas
                />
              )}
            </div>

            {/* 3. RODAPÉ DE TRIAGEM RÁPIDA (Oculto na Impressão e no Modo Leitura) */}
            {isExpanded && !isModoLeitura && ( // ✨ Bloqueia renderização do Footer em Modo Leitura
              <div className="print:hidden shrink-0">
                <DrawerFooter
                  idCandidatura={idCandidatura}
                  nota={nota}
                  setNota={setNota}
                  obs={obs}
                  onAtualizar={onAtualizar}
                  setIsExpanded={setIsExpanded}
                  setActiveTab={setActiveTab}
                  onClose={onClose}
                  hasProximo={hasProximo}
                  onProximo={onProximo}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}