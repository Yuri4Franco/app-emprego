"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/src/services/api";
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineOfficeBuilding,
  HiOutlineCheckCircle,
  HiOutlineExternalLink,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineBan
} from "react-icons/hi";
import Link from "next/link";
import { ButtonType } from "@/src/components/ButtonType";
import { EmpresaListagem } from "@/src/types/empresa";
import { ModalCadastrarEmpresa } from "@/src/components/admin/ModalCadastrarEmpresa";

export default function EmpresasAdminPage() {
  const [empresas, setEmpresas] = useState<EmpresaListagem[]>([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<"ATIVO" | "BLOQUEADO">("ATIVO");

  const [pagina, setPagina] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meta, setMeta] = useState({
    total: 0,
    total_associadas: 0,
    total_nao_associadas: 0,
  });

  const fetchEmpresas = useCallback(
    async (resetList = false) => {
      if (isLoading) return;

      setIsLoading(true);
      const targetPage = resetList ? 1 : pagina;

      try {
        const response = await api.get(`/admin/empresas`, {
          params: {
            search: busca,
            page: targetPage,
            status: statusFiltro,
            limit: 15,
          },
        });

        const { data, meta: backendMeta } = response.data;

        setEmpresas((prev) => (resetList ? data : [...prev, ...data]));

        setMeta({
          total: backendMeta.total,
          total_associadas: backendMeta.total_associadas,
          total_nao_associadas: backendMeta.total_nao_associadas,
        });

        setHasMore(targetPage < backendMeta.total_paginas);

        if (!resetList) {
          setPagina((prev) => prev + 1);
        } else {
          setPagina(2);
        }
      } catch (error) {
        console.error("Erro ao carregar empresas:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [busca, pagina, isLoading, statusFiltro]
  );

  useEffect(() => {
    fetchEmpresas(true);
  }, [statusFiltro]);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !isLoading) {
        fetchEmpresas();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchEmpresas, hasMore, isLoading]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">

      {/* HEADER EXECUTIVO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
            Gestão de Empresas
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Gerencie o ecossistema de empresas parceiras da ACI Panambi.
          </p>
        </div>
        <ButtonType
          variant="primary"
          className="flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 px-6 py-3"
          onClick={() => setIsModalOpen(true)}
        >
          <HiOutlinePlus size={20} /> Nova Empresa
        </ButtonType>
      </div>

      {/* CARDS DE MÉTRICAS (Refinados) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 ${statusFiltro === "ATIVO" ? "bg-blue-500" : "bg-red-500"}`}></div>
          <div className={`p-4 rounded-2xl shrink-0 relative z-10 ${statusFiltro === "ATIVO" ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"}`}>
            <HiOutlineOfficeBuilding size={28} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              {statusFiltro === "ATIVO" ? "Total Ativas" : "Total Bloqueadas"}
            </p>
            <p className={`text-3xl font-black leading-none ${statusFiltro === "ATIVO" ? "text-gray-900" : "text-red-600"}`}>
              {meta.total}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
            <HiOutlineCheckCircle size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Associadas ACI
            </p>
            <p className="text-3xl font-black text-emerald-600 leading-none">
              {meta.total_associadas}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
            <HiOutlineOfficeBuilding size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Não Associadas
            </p>
            <p className="text-3xl font-black text-amber-600 leading-none">
              {meta.total_nao_associadas}
            </p>
          </div>
        </div>
      </div>

      {/* CONTROLES: ABAS DE STATUS E BUSCA */}
      <div className="flex flex-col lg:flex-row justify-between gap-6">

        {/* Toggle de Status (Pill Design) */}
        <div className="flex gap-2 p-1.5 bg-gray-100/80 rounded-2xl w-fit overflow-x-auto border border-gray-200/50">
          <button
            onClick={() => setStatusFiltro("ATIVO")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${statusFiltro === "ATIVO"
              ? "bg-white shadow-sm text-blue-600 border border-gray-200/50"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 border border-transparent"
              }`}
          >
            <HiOutlineCheckCircle size={18} /> Empresas Ativas
          </button>
          <button
            onClick={() => setStatusFiltro("BLOQUEADO")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${statusFiltro === "BLOQUEADO"
              ? "bg-white shadow-sm text-red-600 border border-gray-200/50"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 border border-transparent"
              }`}
          >
            <HiOutlineBan size={18} /> Bloqueadas
          </button>
        </div>

        {/* Search Bar Spotlight */}
        <div className="flex-1 max-w-md">
          <div className="relative flex shadow-sm rounded-2xl bg-white border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all">
            <div className="pl-4 flex items-center pointer-events-none">
              <HiOutlineSearch className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              className="w-full pl-3 pr-4 py-3 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              placeholder="Buscar por nome, CNPJ ou email..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchEmpresas(true)}
            />
            <button
              onClick={() => fetchEmpresas(true)}
              className="px-6 bg-gray-50 text-blue-600 font-bold text-sm border-l border-gray-200 hover:bg-blue-50 transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* FEED DE CARDS DE EMPRESAS */}
      <div className="space-y-4">
        {isLoading && pagina === 1 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium">Buscando empresas...</p>
          </div>
        ) : empresas.length === 0 ? (
          <div className="bg-white rounded-[32px] p-16 text-center border border-dashed border-gray-300 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <HiOutlineShieldCheck size={40} className="text-gray-300" />
            </div>
            <p className="text-lg font-bold text-gray-900 mb-1">Nenhuma empresa encontrada</p>
            <p className="text-sm text-gray-500">
              Não encontramos nenhuma empresa com os filtros atuais.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-5">Empresa / CNPJ</th>
                    <th className="px-8 py-5">Responsável</th>
                    <th className="px-8 py-5">Status ACI</th>
                    <th className="px-8 py-5 text-center">Vagas Ativas</th>
                    <th className="px-8 py-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {empresas.map((empresa) => (
                    <tr
                      key={empresa.id_empresa}
                      className={`hover:bg-gray-50/50 transition-colors group ${statusFiltro === "BLOQUEADO" ? "opacity-75 hover:opacity-100 bg-red-50/10" : ""
                        }`}
                    >
                      {/* Empresa */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${statusFiltro === "BLOQUEADO" ? "bg-red-50 text-red-400" : "bg-blue-50 text-blue-600"
                            }`}>
                            <HiOutlineOfficeBuilding size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                              {empresa.nome_fantasia}
                            </span>
                            <span className="text-xs text-gray-500 font-mono mt-0.5">
                              {empresa.cnpj}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Responsável */}
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-700 text-sm">
                            {empresa.responsavel?.nome || "Não informado"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {empresa.responsavel?.email || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Vínculo ACI */}
                      <td className="px-8 py-5">
                        {empresa.tipo_vinculo_aci === "ASSOCIADA" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-widest">
                            <HiOutlineCheckCircle size={14} /> Associada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-gray-50 text-gray-500 border border-gray-200 uppercase tracking-widest">
                            Não Associada
                          </span>
                        )}
                      </td>

                      {/* Vagas */}
                      <td className="px-8 py-5 text-center">
                        <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-3 rounded-lg bg-gray-50 text-gray-700 font-black text-sm border border-gray-200 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-100 transition-colors">
                          {empresa.vagas_count || 0}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="px-8 py-5 text-right">
                        <Link
                          href={`/admin/empresas/${empresa.id_empresa}`}
                          className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Ver detalhes da empresa"
                        >
                          <HiOutlineExternalLink size={20} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loading de Paginação (Infinite Scroll) */}
        {isLoading && pagina > 1 && (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <ModalCadastrarEmpresa
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchEmpresas(true)}
      />
    </div>
  );
}