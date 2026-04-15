"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/src/services/api";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineDotsVertical,
  HiOutlineCheckCircle,
  HiOutlinePause,
  HiOutlineExclamation,
  HiOutlineTrash,
  HiOutlineOfficeBuilding,
  HiOutlineX,
} from "react-icons/hi";
import { ButtonType } from "@/src/components/ButtonType";
import Link from "next/link";
import toast from "react-hot-toast";

// Mapeamento visual de Status
const STATUS_MAP: any = {
  RASCUNHO: {
    label: "Rascunho",
    color: "bg-gray-100 text-gray-600",
    icon: <HiOutlinePlus />,
  },
  EM_ANALISE: {
    label: "Em Análise",
    color: "bg-amber-50 text-amber-600",
    icon: <HiOutlineClock />,
  },
  REPROVADA: {
    label: "Reprovada",
    color: "bg-red-50 text-red-600",
    icon: <HiOutlineX />,
  },
  ATIVA: {
    label: "Ativa",
    color: "bg-emerald-50 text-emerald-600",
    icon: <HiOutlineCheckCircle />,
  },
  PAUSADA: {
    label: "Pausada",
    color: "bg-blue-50 text-blue-600",
    icon: <HiOutlinePause />,
  },
  ENCERRADA: {
    label: "Encerrada",
    color: "bg-gray-200 text-gray-500",
    icon: <HiOutlineTrash />,
  },
  AGUARDANDO_PAGAMENTO: {
    label: "Pagamento",
    color: "bg-purple-50 text-purple-600",
    icon: <HiOutlineExclamation />,
  },
};

export default function GestaoVagasPage() {
  const [vagas, setVagas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>(""); // Vazio = Todas
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

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8 animate-in fade-in duration-700">
      {/* Header: Título e Botão de Criar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">
            Gestão de Vagas
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Acompanhe o desempenho e status das suas oportunidades.
          </p>
        </div>

        <Link href="/empresa/vagas/nova">
          <ButtonType className="flex items-center gap-2 px-8 py-4 rounded-[24px] shadow-xl shadow-blue-100">
            <HiOutlinePlus size={20} />
            Nova Vaga
          </ButtonType>
        </Link>
      </header>

      {/* Filtros e Abas */}
      <section className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center gap-2 p-1 bg-gray-50 rounded-[24px] w-fit">
          {[
            { id: "", label: "Todas" },
            { id: "ATIVA", label: "Ativas" },
            { id: "RASCUNHO", label: "Rascunhos" },
            { id: "EM_ANALISE", label: "Em Análise" },
            { id: "ENCERRADA", label: "Encerradas" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltroStatus(tab.id)}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                filtroStatus === tab.id
                  ? "bg-white text-blue-600 shadow-md scale-105"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Busca */}
        <div className="relative group">
          <HiOutlineSearch
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por título ou área profissional..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-[20px] focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
          />
        </div>
      </section>

      {/* Listagem de Vagas */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-20 text-center animate-pulse text-gray-400 font-bold uppercase tracking-widest">
            Sincronizando vagas...
          </div>
        ) : vagas.length > 0 ? (
          vagas.map((vaga) => (
            <div
              key={vaga.id_vaga}
              className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-6">
                {/* Ícone de Status Circular */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${STATUS_MAP[vaga.status]?.color || "bg-gray-100"}`}
                >
                  {STATUS_MAP[vaga.status]?.icon || <HiOutlineDotsVertical />}
                </div>

                <div className="space-y-1">
                  <h3 className="font-black text-gray-800 group-hover:text-blue-600 transition-colors">
                    {vaga.titulo}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <HiOutlineOfficeBuilding /> {vaga.area_profissional}
                    </span>
                    <span className="flex items-center gap-1">
                      <HiOutlineClock /> Publicada em{" "}
                      {new Date(vaga.data_publicacao).toLocaleDateString(
                        "pt-BR",
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                {/* Contador de Candidatos */}
                <div className="text-center px-6 border-r border-gray-100">
                  <p className="text-2xl font-black text-blue-600 leading-none">
                    {vaga._count?.candidaturas || 0}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                    Candidatos
                  </p>
                </div>

                {/* Status Badge */}
                <div
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${STATUS_MAP[vaga.status]?.color}`}
                >
                  {STATUS_MAP[vaga.status]?.label}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  <Link href={`/empresa/vagas/${vaga.id_vaga}/candidatos`}>
                    <button className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                      <HiOutlineUsers size={20} />
                    </button>
                  </Link>
                  <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-white hover:shadow-md transition-all">
                    <HiOutlineDotsVertical size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-20 rounded-[48px] text-center border-2 border-dashed border-gray-100 space-y-4">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-gray-300">
              <HiOutlineExclamation size={40} />
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
              Nenhuma vaga encontrada
            </p>
            <ButtonType
              onClick={() => {
                setBusca("");
                setFiltroStatus("");
              }}
              className="text-xs px-6 py-2"
            >
              Limpar filtros
            </ButtonType>
          </div>
        )}
      </div>

      {/* Paginação */}
      {meta.total_paginas > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: meta.total_paginas }).map((_, i) => (
            <button
              key={i}
              onClick={() => fetchVagas(i + 1)}
              className={`w-10 h-10 rounded-xl font-bold transition-all ${
                meta.page === i + 1
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-white text-gray-400 hover:bg-gray-50"
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
