"use client";

import { useState, useEffect, useCallback, use, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
  HiOutlineBell,
  HiOutlineXCircle,
  HiOutlineArrowLeft,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheck,
  HiOutlineAdjustments,
  HiOutlinePause,
  HiOutlineStop,
  HiOutlinePlay,
} from "react-icons/hi";
import { ListaCandidatos } from "@/src/components/empresa/ListaCandidatos";
import { CandidatoDrawer } from "@/src/components/empresa/CandidatoDrawer";
import { ModalConfirmacaoAcao } from "@/src/components/empresa/vagas/ModalConfirmacaoAcao";

// ✨ IMPORTAMOS O MESMO MODAL USADO NA LISTAGEM

// --- DECLARAÇÃO DAS TIPAGENS ---
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
}

interface ColunaKanban {
  id_etapa: number;
  nome_etapa: string;
  tipo?: string;
  ordem?: number;
  candidatos: Candidato[];
}

type ActionType = "PAUSAR" | "ENCERRAR" | "REABRIR" | null;
// ------------------------------

export default function GestaoVagaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const idVaga = resolvedParams.id;
  const router = useRouter();

  // 1. ESTADOS BASE
  const [vaga, setVaga] = useState<any>(null);
  const [colunasMestre, setColunasMestre] = useState<ColunaKanban[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [candidatoSelecionadoId, setCandidatoSelecionadoId] = useState<
    number | null
  >(null);
  const [notificacoesPendentes, setNotificacoesPendentes] = useState(0);

  // Estados de Ações Globais
  const [isNotificando, setIsNotificando] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Controle do Menu Dropdown de Etapas
  const [menuEtapasAberto, setMenuEtapasAberto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✨ ESTADOS DO MODAL DE CONFIRMAÇÃO DA VAGA
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    tipo: ActionType;
    isProcessing: boolean;
  }>({
    isOpen: false,
    tipo: null,
    isProcessing: false,
  });

  const [camposDestaque, setCamposDestaque] = useState<string[]>([
    "nome",
    "experiencia_recente",
    "localizacao",
  ]);
  const [isSalvandoConfig, setIsSalvandoConfig] = useState(false);

  // 2. ESTADOS DE FILTRO
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroNaoVistos, setFiltroNaoVistos] = useState(false);
  const [filtroSemAvaliacao, setFiltroSemAvaliacao] = useState(false);
  const [filtroNovos, setFiltroNovos] = useState(false);
  const [colunasOcultas, setColunasOcultas] = useState<number[]>([]);

  const [etapaAtivaId, setEtapaAtivaId] = useState<number | null>(null);



  const OPCOES_DESTAQUE = [
    {
      id: "localizacao",
      label: "Localização (Cidade/Bairro)",
      desc: "Mostra de onde o candidato é.",
    },
    {
      id: "idade",
      label: "Idade",
      desc: "Calculada a partir da data de nascimento.",
    },
    {
      id: "experiencia_recente",
      label: "Últimas Experiências",
      desc: "Três últimos cargos.",
    },
    {
      id: "formacao_recente",
      label: "Últimas Formações",
      desc: "Grau acadêmico mais recentes.",
    },
    {
      id: "competencias",
      label: "Principais Habilidades",
      desc: "Lista das ferramentas e conhecimentos.",
    },
  ];

  // Fecha Menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuEtapasAberto(false);
      }
    };
    if (menuEtapasAberto)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuEtapasAberto]);

  const carregarDados = useCallback(
    async (isFirstLoad = false) => {
      if (isFirstLoad) setIsLoading(true);
      try {
        const res = await api.get(`/empresa/vagas/${idVaga}/painel-gestao`, {
          params: { _t: new Date().getTime() },
        });
        const payload = res.data.data || res.data.dados || res.data;
        setVaga(payload.vaga || null);
        setColunasMestre(payload.colunas || []);
        const pendentes =
          payload.colunas?.length > 0
            ? Number(payload.colunas[0].notificacoes_pendentes) || 0
            : 0;
        setNotificacoesPendentes(pendentes);
      } catch (error: any) {
        toast.error("Erro ao carregar a gestão de candidatos.");
      } finally {
        setIsLoading(false);
      }
    },
    [idVaga],
  );

  useEffect(() => {
    carregarDados(true);
  }, [carregarDados]);

  const salvarConfiguracoes = async () => {
    setIsSalvandoConfig(true);
    try {
      await api.patch(`/empresa/vagas/${idVaga}/configurar-destaques`, {
        campos: camposDestaque,
      });
      toast.success("Configuração salva com sucesso!");
      setIsConfigOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar configurações.");
    } finally {
      setIsSalvandoConfig(false);
    }
  };

  const toggleCampo = (id: string) => {
    if (camposDestaque.includes(id))
      setCamposDestaque(camposDestaque.filter((c) => c !== id));
    else setCamposDestaque([...camposDestaque, id]);
  };

  const toggleColuna = (id_etapa: number) => {
    if (colunasOcultas.includes(id_etapa))
      setColunasOcultas(colunasOcultas.filter((id) => id !== id_etapa));
    else setColunasOcultas([...colunasOcultas, id_etapa]);
  };

  const handleAbrirCandidato = (idCandidatura: number) => {
    setColunasMestre((colunasAntigas) =>
      colunasAntigas.map((col) => ({
        ...col,
        candidatos: col.candidatos.map((cand: Candidato) =>
          cand.id_candidatura === idCandidatura
            ? { ...cand, visualizada: true }
            : cand,
        ),
      })),
    );
    setCandidatoSelecionadoId(idCandidatura);
  };

  // ✨ FUNÇÕES DO MODAL DE STATUS
  const openConfirmModal = (tipo: ActionType) => {
    setModalConfig({ isOpen: true, tipo, isProcessing: false });
  };

  const closeConfirmModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false, isProcessing: false });
  };

  const executeConfirmAction = async () => {
    if (!modalConfig.tipo) return;
    setModalConfig({ ...modalConfig, isProcessing: true });

    try {
      if (modalConfig.tipo === "PAUSAR") {
        await api.patch(`/empresa/vagas/${idVaga}/pausar`);
        toast.success("Vaga pausada com sucesso!");
      } else if (modalConfig.tipo === "ENCERRAR") {
        await api.patch(`/empresa/vagas/${idVaga}/encerrar`);
        toast.success("Vaga encerrada definitivamente!");
        router.push("/empresa/vagas"); // Redireciona pois não se gere vaga encerrada
        return;
      } else if (modalConfig.tipo === "REABRIR") {
        await api.patch(`/empresa/vagas/${idVaga}/ativar`);
        toast.success("Vaga reativada com sucesso!");
      }

      closeConfirmModal();
      carregarDados(); // Recarrega os dados para atualizar o badge de status
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Ocorreu um erro ao processar a ação.",
      );
      setModalConfig({ ...modalConfig, isProcessing: false });
    }
  };

  // 4. FILTRAGEM KANBAN
  const colunasFiltradas = useMemo(() => {
    return colunasMestre
      .filter((col) => !colunasOcultas.includes(col.id_etapa))
      .map((coluna) => {
        const candidatosFiltrados = coluna.candidatos.filter((c: Candidato) => {
          const matchNome = c.nome
            .toLowerCase()
            .includes(termoBusca.toLowerCase());
          const matchAvaliacao = filtroSemAvaliacao
            ? c.avaliacao_nota === null || c.avaliacao_nota === undefined
            : true;
          const matchNaoVisto = filtroNaoVistos
            ? c.visualizada === false
            : true;
          const diasInscrito = Math.floor(
            (new Date().getTime() - new Date(c.data_inscricao).getTime()) /
            (1000 * 3600 * 24),
          );
          const matchNovo = filtroNovos ? diasInscrito <= 2 : true;
          return matchNome && matchAvaliacao && matchNaoVisto && matchNovo;
        });
        return { ...coluna, candidatos: candidatosFiltrados };
      });
  }, [
    colunasMestre,
    colunasOcultas,
    termoBusca,
    filtroSemAvaliacao,
    filtroNaoVistos,
    filtroNovos,
  ]);

  const candidatosDaEtapaAtual = useMemo(() => {
    const colunaAtual = colunasFiltradas.find((c) => c.id_etapa === etapaAtivaId) || colunasFiltradas[0];
    return colunaAtual?.candidatos || [];
  }, [colunasFiltradas, etapaAtivaId]);

  // Descobre o índice (posição) do candidato aberto no momento
  const indexAtual = useMemo(() => {
    if (!candidatoSelecionadoId) return -1;
    return candidatosDaEtapaAtual.findIndex((c) => c.id_candidatura === candidatoSelecionadoId);
  }, [candidatosDaEtapaAtual, candidatoSelecionadoId]);

  const hasAnterior = indexAtual > 0;
  const hasProximo = indexAtual !== -1 && indexAtual < candidatosDaEtapaAtual.length - 1;

  const handleAnterior = () => {
    if (hasAnterior) {
      const idAnterior = candidatosDaEtapaAtual[indexAtual - 1].id_candidatura;
      handleAbrirCandidato(idAnterior);
    }
  };

  const handleProximo = () => {
    if (hasProximo) {
      const idProximo = candidatosDaEtapaAtual[indexAtual + 1].id_candidatura;
      handleAbrirCandidato(idProximo);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold">
            Preparando painel de gestão...
          </p>
        </div>
      </div>
    );
  }

  const totalCandidatos = colunasMestre.reduce(
    (acc, col) => acc + col.candidatos.length,
    0,
  );
  const isAtiva = vaga?.status === "ATIVA";
  const isPausada = vaga?.status === "PAUSADA";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col animate-in fade-in duration-500">
      {/* ================= HEADER DA GESTÃO ================= */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm px-4 md:px-8 py-5 md:py-6">
        <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-4">
          {/* Linha Superior (Ações Menores: Voltar / Ações de Status) */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 sm:gap-0">
            <button
              onClick={() => router.push("/empresa/vagas")}
              className="flex items-center self-start gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
            >
              <HiOutlineArrowLeft size={16} /> Minhas Vagas
            </button>

            {/* ✨ NOVOS BOTÕES DE STATUS AQUI */}
            <div className="flex items-center self-end sm:self-auto gap-2">
              {isAtiva && (
                <button
                  onClick={() => openConfirmModal("PAUSAR")}
                  className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors border border-amber-100"
                >
                  <HiOutlinePause size={14} /> Pausar Vaga
                </button>
              )}
              {isPausada && (
                <button
                  onClick={() => openConfirmModal("REABRIR")}
                  className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors border border-emerald-100"
                >
                  <HiOutlinePlay size={14} /> Reativar Vaga
                </button>
              )}
              {vaga?.status !== "ENCERRADA" && (
                <button
                  onClick={() => openConfirmModal("ENCERRAR")}
                  className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                  <HiOutlineStop size={14} /> Encerrar Vaga
                </button>
              )}
            </div>
          </div>

          {/* Linha Principal (Títulos e Ações Primárias) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1.5">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-none line-clamp-1">
                  {vaga?.titulo}
                </h1>
                <span
                  className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shrink-0 ${isAtiva
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                    : isPausada
                      ? "bg-amber-50 border border-amber-200 text-amber-700"
                      : "bg-gray-100 border border-gray-200 text-gray-600"
                    }`}
                >
                  {vaga?.status}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-500">
                <span className="text-primary">{totalCandidatos}</span>{" "}
                candidato(s) no processo
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
              <button
                onClick={() => setIsConfigOpen(true)}
                className="flex justify-center items-center gap-2 px-5 py-3 text-sm font-bold text-gray-600 hover:text-primary bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50 rounded-xl transition-all shadow-sm"
              >
                <HiOutlineAdjustments size={18} />
                Visão Estratégica
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= BARRA DE FERRAMENTAS CENTRAL (BUSCA E FILTROS) ================= */}
      <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 py-6 flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row gap-4 xl:items-center justify-between">
          <input
            type="text"
            placeholder="Buscar candidato por nome..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full xl:w-96 px-5 py-3 bg-white border border-gray-200 rounded-[16px] text-sm outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
          />

          <div className="flex flex-wrap items-center gap-2.5">
            <label
              className={`flex items-center gap-2 px-4 py-2 rounded-[14px] border text-xs font-black uppercase tracking-widest cursor-pointer transition-colors select-none ${filtroNaoVistos ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={filtroNaoVistos}
                onChange={() => setFiltroNaoVistos(!filtroNaoVistos)}
              />
              <span
                className={`w-2 h-2 rounded-full ${filtroNaoVistos ? "bg-blue-600" : "bg-blue-300"}`}
              ></span>
              Não Lidos
            </label>

            <label
              className={`flex items-center gap-2 px-4 py-2 rounded-[14px] border text-xs font-black uppercase tracking-widest cursor-pointer transition-colors select-none ${filtroSemAvaliacao ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={filtroSemAvaliacao}
                onChange={() => setFiltroSemAvaliacao(!filtroSemAvaliacao)}
              />
              Sem Avaliação
            </label>

            <label
              className={`flex items-center gap-2 px-4 py-2 rounded-[14px] border text-xs font-black uppercase tracking-widest cursor-pointer transition-colors select-none ${filtroNovos ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={filtroNovos}
                onChange={() => setFiltroNovos(!filtroNovos)}
              />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Novos (48h)
            </label>

            <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1"></div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMenuEtapasAberto(!menuEtapasAberto)}
                className={`flex items-center gap-2 px-4 py-2 rounded-[14px] border text-xs font-black uppercase tracking-widest transition-colors select-none ${menuEtapasAberto
                  ? "bg-gray-100 border-gray-300 text-gray-700"
                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
              >
                <HiOutlineEye size={16} />
                Etapas
                {colunasOcultas.length > 0 && (
                  <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md text-[10px]">
                    {colunasOcultas.length} Ocultas
                  </span>
                )}
              </button>

              {menuEtapasAberto && (
                <div className="absolute right-0 xl:right-auto xl:left-0 top-full mt-2 w-64 md:w-72 bg-white border border-gray-100 shadow-2xl rounded-[24px] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Ocultar ou Mostrar Etapas
                    </p>
                  </div>
                  <div className="max-h-[40vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200">
                    {colunasMestre.map((col) => {
                      const isOculta = colunasOcultas.includes(col.id_etapa);
                      return (
                        <button
                          key={col.id_etapa}
                          onClick={() => toggleColuna(col.id_etapa)}
                          className={`w-full flex items-center justify-between px-3 py-3 rounded-[16px] transition-colors text-sm font-bold
                            ${isOculta ? "text-gray-400 hover:bg-gray-50" : "text-gray-700 hover:bg-blue-50"}
                          `}
                        >
                          <div className="flex items-center gap-2.5 truncate pr-2">
                            {isOculta ? (
                              <HiOutlineEyeOff
                                size={18}
                                className="text-gray-300 shrink-0"
                              />
                            ) : (
                              <HiOutlineEye
                                size={18}
                                className="text-blue-500 shrink-0"
                              />
                            )}
                            <span className="truncate">{col.nome_etapa}</span>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-1 rounded-full shrink-0 ${isOculta ? "bg-gray-100 text-gray-400" : "bg-white shadow-sm border border-gray-100 text-gray-500"}`}
                          >
                            {col.candidatos.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= ÁREA DA TABELA (Lista de Candidatos) ================= */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-8 pb-10 overflow-hidden flex flex-col">
        <ListaCandidatos
          colunas={colunasFiltradas}
          onAtualizar={carregarDados}
          onAbrirCandidato={handleAbrirCandidato}
          etapaAtivaId={etapaAtivaId}
          onMudancaEtapa={setEtapaAtivaId}
        />
      </main>

      {/* ================= MODAIS E DRAWERS ================= */}
      <CandidatoDrawer
        idCandidatura={candidatoSelecionadoId}
        onClose={() => setCandidatoSelecionadoId(null)}
        onAtualizar={carregarDados}
        onAnterior={handleAnterior}
        onProximo={handleProximo}
        hasAnterior={hasAnterior}
        hasProximo={hasProximo}
      />

      {/* ✨ RENDERIZAÇÃO DO MODAL DE CONFIRMAÇÃO */}
      <ModalConfirmacaoAcao
        isOpen={modalConfig.isOpen}
        tipo={modalConfig.tipo}
        tituloVaga={vaga?.titulo || "Vaga"}
        isProcessing={modalConfig.isProcessing}
        onClose={closeConfirmModal}
        onConfirm={executeConfirmAction}
      />

      {/* Modal de Configuração da Visão (Destaques) */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-gray-800">
                  Configurar Tabela
                </h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Escolha os dados que devem aparecer no resumo da tabela.
                </p>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <HiOutlineXCircle size={24} />
              </button>
            </div>

            <div className="space-y-3 mb-8 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
              {OPCOES_DESTAQUE.map((opcao) => (
                <div
                  key={opcao.id}
                  className={`flex items-center justify-between p-4 rounded-[20px] transition-all cursor-pointer border ${camposDestaque.includes(opcao.id) ? "bg-blue-50/50 border-blue-200" : "bg-white border-gray-200 hover:border-blue-100"}`}
                  onClick={() => toggleCampo(opcao.id)}
                >
                  <div className="pr-4">
                    <p
                      className={`text-sm font-black ${camposDestaque.includes(opcao.id) ? "text-blue-900" : "text-gray-700"}`}
                    >
                      {opcao.label}
                    </p>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      {opcao.desc}
                    </p>
                  </div>
                  <div
                    className={`relative w-11 h-6 rounded-full transition-colors duration-300 ease-in-out shrink-0 ${camposDestaque.includes(opcao.id) ? "bg-blue-500" : "bg-gray-300"}`}
                  >
                    <div
                      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ease-in-out ${camposDestaque.includes(opcao.id) ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsConfigOpen(false)}
                className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-[20px] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvarConfiguracoes}
                disabled={isSalvandoConfig}
                className="flex-1 py-4 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-[20px] shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
              >
                {isSalvandoConfig ? "Salvando..." : "Salvar Configuração"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
