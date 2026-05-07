"use client";

import { useState, useEffect, useCallback, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
  HiOutlineViewBoards,
  HiOutlineViewList,
  HiOutlineBell,
  HiOutlineXCircle,
  HiOutlineArrowLeft,
  HiOutlineCog,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheck,
} from "react-icons/hi";
import { KanbanBoard } from "@/src/components/empresa/KanbanBoard";
import { ListaCandidatos } from "@/src/components/empresa/ListaCandidatos";
import { CandidatoDrawer } from "@/src/components/empresa/CandidatoDrawer";

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
  const [viewMode, setViewMode] = useState<"KANBAN" | "LISTA">("LISTA");
  const [candidatoSelecionadoId, setCandidatoSelecionadoId] = useState<
    number | null
  >(null);
  const [notificacoesPendentes, setNotificacoesPendentes] = useState(0);

  // Estados de Ações Globais
  const [isNotificando, setIsNotificando] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [camposDestaque, setCamposDestaque] = useState<string[]>([
    "nome",
    "experiencia_recente",
    "localizacao",
  ]);
  const [isSalvandoConfig, setIsSalvandoConfig] = useState(false);

  // 2. ESTADOS DE FILTRO (Agora comandam tudo daqui!)
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroNaoVistos, setFiltroNaoVistos] = useState(false);
  const [filtroSemAvaliacao, setFiltroSemAvaliacao] = useState(false);
  const [filtroNovos, setFiltroNovos] = useState(false);
  const [colunasOcultas, setColunasOcultas] = useState<number[]>([]);

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

  const carregarKanban = useCallback(
    async (isFirstLoad = false) => {
      if (isFirstLoad) setIsLoading(true);
      try {
        const res = await api.get(`/empresa/vagas/${idVaga}/kanban`, {
          params: { _t: new Date().getTime() },
        });
        const payload = res.data.data || res.data.dados || res.data;
        setVaga(payload.vaga || null);
        setColunasMestre(payload.colunas || []);
        const colunasRecebidas = payload.colunas || [];
        setColunasMestre(colunasRecebidas);
        const pendentes =
          colunasRecebidas.length > 0
            ? Number(colunasRecebidas[0].notificacoes_pendentes) || 0
            : 0;

        setNotificacoesPendentes(pendentes);
      } catch (error: any) {
        toast.error("Erro ao carregar a gestão.");
      } finally {
        setIsLoading(false);
      }
    },
    [idVaga],
  );

  useEffect(() => {
    carregarKanban(true);
  }, [carregarKanban]);

  // Ações da Vaga
  const dispararNotificacoes = async () => {
    setIsNotificando(true);
    try {
      await api.post(`/empresa/vagas/${idVaga}/notificar-candidatos`);
      toast.success("Notificações enviadas com sucesso aos candidatos!");
      carregarKanban();
    } catch (error) {
      toast.error("Erro ao enviar notificações.");
    } finally {
      setIsNotificando(false);
    }
  };

  const salvarConfiguracoes = async () => {
    setIsSalvandoConfig(true);
    try {
      await api.patch(`/empresa/vagas/${idVaga}/configurar-destaques`, {
        campos: camposDestaque,
      });
      toast.success("Visão estratégica atualizada com sucesso!");
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

  // 3. ATUALIZAÇÃO OTIMISTA
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

  // 4. FILTRAGEM
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold">
            Carregando painel da vaga...
          </p>
        </div>
      </div>
    );
  }

  // Calcula total original para o Header (sem filtros)
  const totalCandidatos = colunasMestre.reduce(
    (acc, col) => acc + col.candidatos.length,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ================= HEADER DA GESTÃO ================= */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/empresa/vagas")}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
            >
              <HiOutlineArrowLeft size={16} /> Voltar para Minhas Vagas
            </button>

            {vaga?.status !== "ENCERRADA" && (
              <button className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                <HiOutlineXCircle size={16} /> Encerrar Vaga
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                  {vaga?.titulo}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    vaga?.status === "ATIVA"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {vaga?.status}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500">
                {totalCandidatos} candidato(s) no processo
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsConfigOpen(true)}
                className="p-2.5 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-xl transition-colors border border-gray-200"
                title="Configurar Visão Estratégica"
              >
                <HiOutlineCog size={20} />
              </button>

              {notificacoesPendentes === 0 ? (
                <button
                  disabled
                  className="flex items-center gap-2 bg-gray-50 text-gray-400 border border-gray-100 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-default"
                >
                  <HiOutlineCheck size={18} className="text-emerald-500" />
                  Tudo atualizado
                </button>
              ) : (
                <button
                  onClick={dispararNotificacoes}
                  disabled={isNotificando}
                  className="relative flex items-center gap-2 bg-blue-50 text-primary border border-blue-100 hover:bg-blue-100 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                  <div className="relative flex items-center justify-center">
                    <HiOutlineBell
                      size={18}
                      // Se estiver processando, roda. Se não, dá um pulinho chamando a atenção
                      className={
                        isNotificando ? "animate-spin" : "animate-bounce"
                      }
                    />

                    {/* A bolinha vermelha piscando estilo notificação de app */}
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  </div>

                  {isNotificando
                    ? "Enviando..."
                    : `Disparar Alertas (${notificacoesPendentes})`}
                </button>
              )}

              <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

              <div className="bg-gray-100 p-1 rounded-xl flex items-center shadow-inner">
                <button
                  onClick={() => setViewMode("KANBAN")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    viewMode === "KANBAN"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <HiOutlineViewBoards size={18} />{" "}
                  <span className="hidden md:inline">Kanban</span>
                </button>
                <button
                  onClick={() => setViewMode("LISTA")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    viewMode === "LISTA"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <HiOutlineViewList size={18} />{" "}
                  <span className="hidden md:inline">Lista</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= BARRA DE FERRAMENTAS CENTRAL (BUSCA E FILTROS) ================= */}
      <div className="max-w-[1600px] w-full mx-auto px-6 py-4 flex flex-col gap-4">
        {/* Busca e Badges de Filtro */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <input
            type="text"
            placeholder="Buscar candidato por nome..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full sm:max-w-md px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-50 transition-all shadow-sm"
          />

          <div className="flex flex-wrap gap-3">
            <label
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer transition-colors font-bold select-none ${filtroNaoVistos ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={filtroNaoVistos}
                onChange={() => setFiltroNaoVistos(!filtroNaoVistos)}
              />
              <span
                className={`w-2 h-2 rounded-full ${filtroNaoVistos ? "bg-blue-600" : "bg-blue-300"}`}
              ></span>{" "}
              Não Lidos
            </label>

            <label
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer transition-colors font-bold select-none ${filtroSemAvaliacao ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
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
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer transition-colors font-bold select-none ${filtroNovos ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={filtroNovos}
                onChange={() => setFiltroNovos(!filtroNovos)}
              />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
              Novos (48h)
            </label>
          </div>
        </div>

        {/* Visibilidade das Colunas */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">
            Exibir Etapas:
          </span>
          {colunasMestre.map((col) => {
            const isOculta = colunasOcultas.includes(col.id_etapa);
            return (
              <button
                key={col.id_etapa}
                onClick={() => toggleColuna(col.id_etapa)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 border
                  ${isOculta ? "bg-transparent border-dashed border-gray-300 text-gray-400 hover:bg-gray-50" : "bg-blue-50 border-blue-100 text-primary hover:bg-blue-100"}
                `}
              >
                {isOculta ? (
                  <HiOutlineEyeOff size={14} />
                ) : (
                  <HiOutlineEye size={14} />
                )}
                {col.nome_etapa}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= ÁREA DE CONTEÚDO DINÂMICO ================= */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 overflow-hidden flex flex-col">
        {viewMode === "KANBAN" ? (
          <KanbanBoard
            colunas={colunasFiltradas}
            onAtualizar={carregarKanban}
            onAbrirCandidato={handleAbrirCandidato}
          />
        ) : (
          <ListaCandidatos
            colunas={colunasFiltradas}
            onAtualizar={carregarKanban}
            onAbrirCandidato={handleAbrirCandidato}
          />
        )}
      </main>

      {/* ================= MODAIS E DRAWERS ================= */}
      <CandidatoDrawer
        idCandidatura={candidatoSelecionadoId}
        onClose={() => setCandidatoSelecionadoId(null)}
        onAtualizar={carregarKanban}
      />

      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-800">
                  Visão Estratégica
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Escolha o que deve aparecer no resumo do candidato.
                </p>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="text-gray-400 hover:bg-gray-100 p-2 rounded-full"
              >
                <HiOutlineXCircle size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-8 max-h-[60vh] overflow-y-auto pr-2">
              {OPCOES_DESTAQUE.map((opcao) => (
                <div
                  key={opcao.id}
                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-blue-100 transition-colors"
                >
                  <div className="pr-4">
                    <p className="font-bold text-gray-800 text-sm">
                      {opcao.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{opcao.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleCampo(opcao.id)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out shrink-0 focus:outline-none ${
                      camposDestaque.includes(opcao.id)
                        ? "bg-emerald-500"
                        : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ease-in-out ${
                        camposDestaque.includes(opcao.id)
                          ? "translate-x-6"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={salvarConfiguracoes}
              disabled={isSalvandoConfig}
              className="w-full py-4 font-bold text-white bg-primary hover:bg-blue-700 rounded-2xl shadow-lg transition-all disabled:opacity-50"
            >
              {isSalvandoConfig ? "Salvando..." : "Salvar Configurações"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
