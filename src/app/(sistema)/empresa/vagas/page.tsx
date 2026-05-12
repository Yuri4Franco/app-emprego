"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import api from "@/src/services/api";
import { useRouter } from "next/navigation";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlinePause,
  HiOutlineExclamation,
  HiOutlineTrash,
  HiOutlineOfficeBuilding,
  HiOutlineX,
  HiOutlineLocationMarker,
  HiOutlinePencilAlt,
  HiOutlineDuplicate,
  HiOutlineChevronRight,
  HiOutlineDotsVertical,
  HiOutlineBriefcase,
} from "react-icons/hi";
import { ButtonType } from "@/src/components/ButtonType";
import Link from "next/link";
import toast from "react-hot-toast";

// Mapeamento visual de Status (Cores e Ícones)
const STATUS_MAP: any = {
  RASCUNHO: {
    label: "Rascunho",
    color: "bg-gray-100 text-gray-600 border-gray-200",
    icon: <HiOutlinePencilAlt />,
  },
  EM_ANALISE: {
    label: "Em Análise",
    color: "bg-amber-50 text-amber-600 border-amber-200",
    icon: <HiOutlineClock />,
  },
  REPROVADA: {
    label: "Reprovada",
    color: "bg-red-50 text-red-600 border-red-200",
    icon: <HiOutlineX />,
  },
  ATIVA: {
    label: "Ativa",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    icon: <HiOutlineCheckCircle />,
  },
  PAUSADA: {
    label: "Pausada",
    color: "bg-blue-50 text-primary border-blue-200",
    icon: <HiOutlinePause />,
  },
  ENCERRADA: {
    label: "Encerrada",
    color: "bg-gray-200 text-gray-500 border-gray-300",
    icon: <HiOutlineTrash />,
  },
  AGUARDANDO_PAGAMENTO: {
    label: "Aguardando Pagamento",
    color: "bg-purple-50 text-purple-600 border-purple-200",
    icon: <HiOutlineExclamation />,
  },
};

export default function GestaoVagasPage() {
  const router = useRouter();
  const [vagas, setVagas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Controle de estados de ação
  const [isDuplicating, setIsDuplicating] = useState<number | null>(null);
  const [menuAberto, setMenuAberto] = useState<number | null>(null); // Controla qual "..." está aberto

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  const [busca, setBusca] = useState("");
  const [meta, setMeta] = useState<any>({ total: 0, page: 1 });

  const fetchVagas = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await api.get("/vagas/minhas-vagas", {
          params: {
            page,
            limit: 10,
            status: filtroStatus || undefined,
            search: busca || undefined,
          },
        });
        setVagas(response.data.data);
        setMeta(response.data.meta);
      } catch (error) {
        toast.error("Erro ao carregar suas vagas.");
      } finally {
        setLoading(false);
      }
    },
    [filtroStatus, busca],
  );

  useEffect(() => {
    fetchVagas();
  }, [fetchVagas]);

  // Fecha o menu de "..." ao clicar em qualquer outro lugar da tela
  useEffect(() => {
    const fecharMenu = () => setMenuAberto(null);
    window.addEventListener("click", fecharMenu);
    return () => window.removeEventListener("click", fecharMenu);
  }, []);

  // Roteamento inteligente baseado no status (Ao clicar no Card ou Botão Principal)
  const handleCardClick = (vaga: any) => {
    if (vaga.status === "RASCUNHO" || vaga.status === "REPROVADA") {
      router.push(`/empresa/vagas/${vaga.id_vaga}/editar`);
    } else if (vaga.status !== "ENCERRADA") {
      router.push(`/empresa/vagas/${vaga.id_vaga}/gestao`);
    }
  };

  // Ação de Duplicar a Vaga
  const handleDuplicarVaga = async (
    e: React.MouseEvent,
    idVagaOriginal: number,
  ) => {
    e.stopPropagation();
    setMenuAberto(null); // Fecha o menu
    setIsDuplicating(idVagaOriginal);
    const toastId = toast.loading("Criando cópia da vaga...");

    try {
      const response = await api.post(
        `/empresa/vagas/${idVagaOriginal}/duplicar`,
      );
      const idNovaVaga = response.data.data.id_vaga;

      toast.success("Vaga duplicada! Redirecionando...", { id: toastId });
      router.push(`/empresa/vagas/${idNovaVaga}/editar`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao duplicar a vaga.", {
        id: toastId,
      });
    } finally {
      setIsDuplicating(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 pt-4 md:pt-10 px-4 md:px-8 space-y-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">
            Gestão de Vagas
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Acompanhe o desempenho e gerencie todas as suas oportunidades.
          </p>
        </div>

        <Link href="/empresa/vagas/nova" className="w-full md:w-auto">
          <ButtonType className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full shadow-lg shadow-blue-100 hover:shadow-blue-200 transition-all text-sm">
            <HiOutlinePlus size={20} />
            Publicar Nova Vaga
          </ButtonType>
        </Link>
      </header>

      {/* FILTROS E BUSCA */}
      <section className="bg-white p-4 md:p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 md:pb-0">
          {[
            { id: "", label: "Todas" },
            { id: "ATIVA", label: "Ativas" },
            { id: "RASCUNHO", label: "Rascunhos" },
            { id: "EM_ANALISE", label: "Em Análise" },
            { id: "AGUARDANDO_PAGAMENTO", label: "Pagamento" }, // <-- ADICIONADO AQUI
            { id: "ENCERRADA", label: "Encerradas" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltroStatus(tab.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
                filtroStatus === tab.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative group">
          <HiOutlineSearch
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
            size={22}
          />
          <input
            type="text"
            placeholder="Buscar vaga por título..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-[24px] focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-sm font-medium text-gray-700"
          />
        </div>
      </section>

      {/* LISTAGEM DE VAGAS */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-20 text-center animate-pulse text-gray-400 font-bold uppercase tracking-widest">
            Buscando suas vagas...
          </div>
        ) : vagas.length > 0 ? (
          vagas.map((vaga) => (
            <div
              key={vaga.id_vaga}
              onClick={() => handleCardClick(vaga)}
              className={`bg-white p-5 md:p-6 rounded-[32px] border shadow-sm hover:shadow-xl transition-all group cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 relative ${
                menuAberto === vaga.id_vaga
                  ? "border-blue-200 z-50"
                  : "border-gray-100 z-10 hover:border-blue-200"
              }`}
            >
              {/* === A MÁGICA ACONTECE AQUI: A MÁSCARA FANTASMA === */}
              {/* O overflow-hidden fica só nesta div invisível. Ele corta a borda azul no formato arredondado sem afetar o resto do card! */}
              <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-6 w-full">
                {/* INFORMAÇÕES DA VAGA */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 mb-1">
                    <div
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit ${STATUS_MAP[vaga.status]?.color}`}
                    >
                      {STATUS_MAP[vaga.status]?.icon}
                      {STATUS_MAP[vaga.status]?.label}
                    </div>
                    {new Date(
                      vaga.data_publicacao || vaga.data_criacao,
                    ).getTime() >
                      Date.now() - 86400000 && (
                      <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                        Nova
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg md:text-xl font-black text-gray-800 group-hover:text-primary transition-colors pr-8">
                    {vaga.titulo}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    {vaga.area_profissional && (
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <HiOutlineOfficeBuilding size={14} />{" "}
                        {vaga.area_profissional}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <HiOutlineLocationMarker size={14} />{" "}
                      {vaga.endereco?.cidade || "Panambi"} -{" "}
                      {vaga.endereco?.uf || "RS"}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <HiOutlineClock size={14} />
                      {vaga.status === "RASCUNHO"
                        ? "Criada em"
                        : "Publicada em"}{" "}
                      {new Date(vaga.data_criacao).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>

                {/* MÉTRICAS E AÇÕES (LADO DIREITO) */}
                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                  {/* Contagem de Candidatos */}
                  {vaga.status !== "RASCUNHO" &&
                    vaga.status !== "REPROVADA" && (
                      <div className="text-center px-4 md:px-6 md:border-r border-gray-100">
                        <p className="text-2xl font-black text-primary leading-none">
                          {vaga._count?.candidaturas || 0}
                        </p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">
                          Candidatos
                        </p>
                      </div>
                    )}

                  {/* Grupo de Botões de Ação */}
                  <div className="flex items-center gap-2 relative z-10">
                    {/* Botão Principal Dinâmico (Edição vs Kanban) */}
                    {vaga.status === "ENCERRADA" ? (
                      <div
                        className="p-3 bg-gray-100 text-gray-400 rounded-[16px] cursor-not-allowed"
                        title="Vaga Encerrada"
                      >
                        <HiOutlineTrash size={20} />
                      </div>
                    ) : vaga.status === "RASCUNHO" ||
                      vaga.status === "REPROVADA" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/empresa/vagas/${vaga.id_vaga}/editar`);
                        }}
                        className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-[16px] hover:bg-primary hover:text-white transition-all shadow-sm font-bold text-sm"
                      >
                        <HiOutlinePencilAlt size={18} />{" "}
                        <span className="hidden sm:block">Continuar</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/empresa/vagas/${vaga.id_vaga}/gestao`);
                        }}
                        className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-[16px] hover:bg-emerald-500 hover:text-white transition-all shadow-sm font-bold text-sm"
                      >
                        <HiOutlineUsers size={18} />{" "}
                        <span className="hidden sm:block">Gestão</span>
                      </button>
                    )}

                    {/* MENU DE OPÇÕES (TRÊS PONTINHOS) */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuAberto(
                            menuAberto === vaga.id_vaga ? null : vaga.id_vaga,
                          );
                        }}
                        className="p-3 text-gray-400 hover:text-primary bg-gray-50 hover:bg-blue-50 rounded-[16px] transition-all"
                      >
                        {isDuplicating === vaga.id_vaga ? (
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <HiOutlineDotsVertical size={20} />
                        )}
                      </button>

                      {/* Dropdown do Menu */}
                      {menuAberto === vaga.id_vaga && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
                          {vaga.status !== "ENCERRADA" &&
                            vaga.status !== "RASCUNHO" &&
                            vaga.status !== "REPROVADA" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(
                                    `/empresa/vagas/${vaga.id_vaga}/editar`,
                                  );
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left border-b border-gray-50"
                              >
                                <HiOutlinePencilAlt size={18} /> Editar Vaga
                              </button>
                            )}

                          <button
                            onClick={(e) => handleDuplicarVaga(e, vaga.id_vaga)}
                            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
                          >
                            <HiOutlineDuplicate size={18} /> Duplicar Vaga
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="hidden md:flex ml-2 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                      <HiOutlineChevronRight size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 md:p-20 rounded-[48px] text-center border-2 border-dashed border-gray-200 space-y-5 shadow-sm">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <HiOutlineBriefcase size={36} />
            </div>
            <div>
              <p className="text-gray-800 font-black text-xl mb-1">
                Nenhuma vaga encontrada
              </p>
              <p className="text-gray-500 text-sm font-medium max-w-sm mx-auto">
                Não localizamos vagas com o filtro ou busca informados.
              </p>
            </div>
            <ButtonType
              onClick={() => {
                setBusca("");
                setFiltroStatus("");
              }}
              className="text-sm px-8 py-3 rounded-full mt-4"
            >
              Limpar Filtros e Busca
            </ButtonType>
          </div>
        )}
      </div>

      {/* PAGINAÇÃO */}
      {meta.total_paginas > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          {Array.from({ length: meta.total_paginas }).map((_, i) => (
            <button
              key={i}
              onClick={() => fetchVagas(i + 1)}
              className={`w-12 h-12 rounded-[16px] font-black transition-all ${
                meta.page === i + 1
                  ? "bg-gray-800 text-white shadow-lg"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
