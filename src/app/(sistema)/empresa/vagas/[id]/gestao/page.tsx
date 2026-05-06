"use client";

import { useState, useEffect, useCallback, use } from "react";
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
} from "react-icons/hi";
import { KanbanBoard } from "@/src/components/empresa/KanbanBoard";
import { ListaCandidatos } from "@/src/components/empresa/ListaCandidatos";
import { CandidatoDrawer } from "@/src/components/empresa/CandidatoDrawer";

// Tipagens baseadas no seu Service
interface CandidatoResumo {
  id_candidatura: number;
  id_usuario: number;
  nome: string;
  fora_do_perfil: boolean;
  data_inscricao: string;
  possui_agendamento: boolean;
  data_entrevista: string | null;
}

interface ColunaKanban {
  id_etapa: number;
  nome_etapa: string;
  tipo: string;
  ordem: number;
  candidatos: CandidatoResumo[];
}

export default function GestaoVagaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const idVaga = resolvedParams.id;

  // Estados principais
  const [vaga, setVaga] = useState<{ titulo: string; status: string } | null>(
    null,
  );
  const [colunas, setColunas] = useState<ColunaKanban[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Controle de Visão (Kanban vs Lista)
  const [viewMode, setViewMode] = useState<"KANBAN" | "LISTA">("KANBAN");

  // Estado para ações globais
  const [isNotificando, setIsNotificando] = useState(false);

  const [candidatoSelecionadoId, setCandidatoSelecionadoId] = useState<
    number | null
  >(null);

  const carregarKanban = useCallback(async (isFirstLoad = false) => {
    if (isFirstLoad) {
      setIsLoading(true);
    }

    try {
      // O cache buster continua aqui para garantir!
      const res = await api.get(`/empresa/vagas/${idVaga}/kanban`, {
        params: { _t: new Date().getTime() }
      });

      const payload = res.data.data || res.data.dados || res.data;

      setVaga(payload.vaga || null);

      setColunas(payload.colunas || []);

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Erro ao carregar a gestão.");
    } finally {
      setIsLoading(false);
    }
  }, [idVaga]);
  
  useEffect(() => {
    carregarKanban(true);
  }, [carregarKanban]);

  useEffect(() => {
    carregarKanban();
  }, [carregarKanban]);

  // Função do seu endpoint "notificar-candidatos"
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

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [camposDestaque, setCamposDestaque] = useState<string[]>([
    "nome",
    "experiencia_recente",
    "localizacao",
  ]);
  const [isSalvandoConfig, setIsSalvandoConfig] = useState(false);

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
    if (camposDestaque.includes(id)) {
      setCamposDestaque(camposDestaque.filter((c) => c !== id));
    } else {
      setCamposDestaque([...camposDestaque, id]);
    }
  };

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

  // Calcula total de candidatos somando todas as colunas
  const totalCandidatos = colunas.reduce(
    (acc, col) => acc + col.candidatos.length,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER DA GESTÃO */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-4">
          {/* Linha 1: Voltar e Ações Destrutivas */}
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

          {/* Linha 2: Título da Vaga e Controles Principais */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                  {vaga?.titulo}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${vaga?.status === "ATIVA"
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
              {/* Botão de Disparo de Notificações Seguro */}

              <button
                onClick={() => setIsConfigOpen(true)}
                className="p-2.5 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-xl transition-colors border border-gray-200"
                title="Configurar Visão Estratégica"
              >
                <HiOutlineCog size={20} />
              </button>

              <button
                onClick={dispararNotificacoes}
                disabled={isNotificando}
                className="flex items-center gap-2 bg-blue-50 text-primary border border-blue-100 hover:bg-blue-100 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              >
                <HiOutlineBell
                  size={18}
                  className={isNotificando ? "animate-bounce" : ""}
                />
                {isNotificando ? "Enviando..." : "Disparar Notificações"}
              </button>

              <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

              {/* TOGGLE DE VISÃO */}
              <div className="bg-gray-100 p-1 rounded-xl flex items-center shadow-inner">
                <button
                  onClick={() => setViewMode("KANBAN")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "KANBAN"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  <HiOutlineViewBoards size={18} />{" "}
                  <span className="hidden md:inline">Kanban</span>
                </button>
                <button
                  onClick={() => setViewMode("LISTA")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "LISTA"
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

      {/* ÁREA DE CONTEÚDO DINÂMICO */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 overflow-hidden flex flex-col">
        {viewMode === "KANBAN" ? (
          <div className="flex-1 bg-transparent overflow-hidden pt-4">
            <KanbanBoard
              colunasIniciais={colunas}
              onAtualizar={carregarKanban}
              onAbrirCandidato={(id: number) => setCandidatoSelecionadoId(id)}
            />
          </div>
        ) : (
          <div className="flex-1 bg-transparent overflow-hidden pt-4">
            <ListaCandidatos
              colunasIniciais={colunas}
              onAtualizar={carregarKanban}
              onAbrirCandidato={(id: number) => setCandidatoSelecionadoId(id)}
            />
          </div>
        )}
      </main>
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

                  {/* TOGGLE SWITCH ESTILO iOS */}
                  <button
                    onClick={() => toggleCampo(opcao.id)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out shrink-0 focus:outline-none ${camposDestaque.includes(opcao.id)
                      ? "bg-emerald-500"
                      : "bg-gray-300"
                      }`}
                  >
                    <div
                      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ease-in-out ${camposDestaque.includes(opcao.id)
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
