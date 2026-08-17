"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
  HiOutlineSearch,
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineOfficeBuilding,
  HiOutlineBriefcase,
  HiOutlineCurrencyDollar,
  HiOutlineShieldCheck,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
} from "react-icons/hi";

type ActiveTab = "EM_ANALISE" | "AGUARDANDO_PAGAMENTO" | "TODAS";
type ModeracaoAcao = "APROVAR" | "REPROVAR" | "CONFIRMAR_PAGAMENTO" | null;

interface ModeracaoState {
  isOpen: boolean;
  tipo: ModeracaoAcao;
  vaga: any | null;
}

function AdminVagasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlTab = searchParams.get("tab") as ActiveTab | null;
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    urlTab === "EM_ANALISE" ||
      urlTab === "AGUARDANDO_PAGAMENTO" ||
      urlTab === "TODAS"
      ? urlTab
      : "EM_ANALISE",
  );

  const [todasPendencias, setTodasPendencias] = useState<any[]>([]);
  const [vagasTodas, setVagasTodas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [busca, setBusca] = useState("");
  const [termoBuscado, setTermoBuscado] = useState("");

  const [moderacao, setModeracao] = useState<ModeracaoState>({
    isOpen: false,
    tipo: null,
    vaga: null,
  });
  const [motivo, setMotivo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTabChange = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (
      urlTab === "EM_ANALISE" ||
      urlTab === "AGUARDANDO_PAGAMENTO" ||
      urlTab === "TODAS"
    ) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const carregarVagas = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resPendentes, resTodas] = await Promise.all([
        api.get("/admin/vagas/pendentes"),
        api.get("/admin/vagas", {
          params: { busca: termoBuscado || undefined },
        }),
      ]);
      setTodasPendencias(resPendentes.data.data || []);
      setVagasTodas(resTodas.data.dados || resTodas.data.data || []);
    } catch (error) {
      toast.error("Erro ao carregar as vagas.");
    } finally {
      setIsLoading(false);
    }
  }, [termoBuscado]);

  useEffect(() => {
    carregarVagas();
  }, [carregarVagas]);

  const vagasExibidas =
    activeTab === "TODAS"
      ? vagasTodas
      : todasPendencias.filter((v: any) => v.status === activeTab);

  const handleBusca = () => setTermoBuscado(busca);

  const formatarData = (isoDate: string) => {
    if (!isoDate) return "-";
    return new Date(isoDate).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✨ Função auxiliar para renderizar o Status com cores bonitas
  const renderStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      ATIVA: "bg-emerald-50 text-emerald-700 border-emerald-200",
      PAUSADA: "bg-amber-50 text-amber-700 border-amber-200",
      ENCERRADA: "bg-gray-100 text-gray-600 border-gray-200",
      EM_ANALISE: "bg-orange-50 text-orange-700 border-orange-200",
      AGUARDANDO_PAGAMENTO: "bg-purple-50 text-purple-700 border-purple-200",
      REPROVADA: "bg-red-50 text-red-700 border-red-200",
    };

    const cssClass = statusConfig[status] || "bg-gray-50 text-gray-700 border-gray-200";
    const statusFormatado = status.replace(/_/g, " ");

    return (
      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${cssClass}`}>
        {statusFormatado}
      </span>
    );
  };

  const abrirModalAcao = (vaga: any, tipo: ModeracaoAcao) => {
    setModeracao({ isOpen: true, tipo, vaga });
    setMotivo("");
  };

  const fecharModal = () => {
    setModeracao({ isOpen: false, tipo: null, vaga: null });
    setMotivo("");
  };

  const executarAcao = async () => {
    if (!moderacao.vaga || !moderacao.tipo) return;
    if (moderacao.tipo === "REPROVAR" && motivo.trim().length < 5) {
      toast.error("Por favor, informe um motivo válido.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (moderacao.tipo === "CONFIRMAR_PAGAMENTO") {
        await api.patch(
          `/admin/vagas/${moderacao.vaga.id_vaga}/confirmar-pagamento`,
        );
        toast.success("Pagamento confirmado!");
      } else {
        await api.patch(`/admin/vagas/${moderacao.vaga.id_vaga}/moderacao`, {
          acao: moderacao.tipo,
          motivo: motivo.trim() || "não informado",
        });
        toast.success("Ação concluída!");
      }
      fecharModal();
      carregarVagas();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao processar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-20 text-gray-400">
        Carregando interface...
      </div>
    }>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Gestão de Vagas
          </h1>
          <p className="text-gray-500 font-medium">
            Administre a entrada e publicação de novas oportunidades.
          </p>
        </div>

        {/* ABAS ESTILIZADAS */}
        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl mb-8 w-fit overflow-x-auto">
          {[
            {
              id: "EM_ANALISE",
              label: "Moderação",
              icon: HiOutlineClock,
              color: "text-amber-600",
            },
            {
              id: "AGUARDANDO_PAGAMENTO",
              label: "Pagamentos",
              icon: HiOutlineCurrencyDollar,
              color: "text-purple-600",
            },
            {
              id: "TODAS",
              label: "Todas",
              icon: HiOutlineBriefcase,
              color: "text-blue-600",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as ActiveTab)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* LISTAGEM DE VAGAS */}
        <div className="grid gap-4">
          {isLoading ? (
            <div className="p-20 text-center text-gray-400 font-medium animate-pulse">
              Carregando vagas...
            </div>
          ) : vagasExibidas.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-200">
              <HiOutlineShieldCheck
                size={48}
                className="text-gray-300 mx-auto mb-4"
              />
              <p className="font-bold text-gray-500">
                Nenhuma vaga nesta fila no momento.
              </p>
            </div>
          ) : (
            vagasExibidas.map((vaga: any) => (
              <div
                key={vaga.id_vaga}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6"
              >
                {/* LADO ESQUERDO: Ícone + Título + Status + Empresa */}
                <div className="flex items-center gap-4 w-full xl:w-auto flex-1 min-w-0">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                    <HiOutlineDocumentText size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-black text-gray-900 truncate text-base">
                        {vaga.titulo}
                      </h3>
                      {renderStatusBadge(vaga.status)}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 truncate">
                      <HiOutlineOfficeBuilding size={14} className="shrink-0" />{" "}
                      <span className="truncate">
                        {vaga.empresa?.nome_fantasia || "Confidencial"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* LADO DIREITO: Candidaturas + Data + Botões */}
                <div className="flex items-center flex-wrap xl:flex-nowrap gap-4 xl:gap-6 w-full xl:w-auto">

                  {/* ✨ CARD DE CANDIDATURAS (Fica sutil, mas em destaque) */}
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl min-w-[130px]">
                    <div className="w-8 h-8 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center text-blue-600">
                      <HiOutlineUserGroup size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider leading-none mb-1">
                        Candidatos
                      </span>
                      <span className="text-sm font-black text-gray-900 leading-none">
                        {vaga._count?.candidaturas || 0}
                      </span>
                    </div>
                  </div>

                  {/* DATA */}
                  <div className="text-right hidden sm:block min-w-[100px]">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                      Criada em
                    </p>
                    <p className="text-xs font-bold text-gray-700">
                      {formatarData(vaga.criada_em || vaga.createdAt)}
                    </p>
                  </div>

                  {/* BOTÕES DE AÇÃO */}
                  <div className="flex gap-2 ml-auto xl:ml-0">
                    <button
                      onClick={() => router.push(`/admin/vagas/${vaga.id_vaga}`)}
                      className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors shadow-sm border border-transparent hover:border-blue-100"
                      title="Analisar Detalhes da Vaga"
                    >
                      <HiOutlineEye size={20} />
                    </button>

                    {activeTab === "EM_ANALISE" && (
                      <>
                        <button
                          onClick={() => abrirModalAcao(vaga, "APROVAR")}
                          className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-100"
                          title="Aprovar Vaga"
                        >
                          <HiOutlineCheckCircle size={20} />
                        </button>
                        <button
                          onClick={() => abrirModalAcao(vaga, "REPROVAR")}
                          className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                          title="Reprovar Vaga"
                        >
                          <HiOutlineXCircle size={20} />
                        </button>
                      </>
                    )}
                    {activeTab === "AGUARDANDO_PAGAMENTO" && (
                      <button
                        onClick={() =>
                          abrirModalAcao(vaga, "CONFIRMAR_PAGAMENTO")
                        }
                        className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors font-bold text-xs border border-purple-100 flex items-center gap-1.5"
                      >
                        <HiOutlineCurrencyDollar size={16} />
                        Confirmar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* MODAL MANTIDO INTACTO */}
        {moderacao.isOpen && moderacao.vaga && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl">
              <h3 className="text-xl font-black mb-6">
                {moderacao.tipo === "APROVAR"
                  ? "Aprovar Vaga"
                  : moderacao.tipo === "REPROVAR"
                    ? "Reprovar Vaga"
                    : "Confirmar Pagamento"}
              </h3>

              {moderacao.tipo === "REPROVAR" && (
                <textarea
                  className="w-full p-4 bg-gray-50 rounded-2xl h-32 mb-6 outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 border border-transparent transition-all text-sm"
                  placeholder="Motivo da reprovação..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                />
              )}

              <div className="flex gap-4">
                <button
                  onClick={fecharModal}
                  className="flex-1 py-4 font-bold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={executarAcao}
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Processando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
}

export default function AdminVagasPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-20 text-gray-400">
        Carregando interface...
      </div>
    }>
      <AdminVagasContent />
    </Suspense>
  );
}