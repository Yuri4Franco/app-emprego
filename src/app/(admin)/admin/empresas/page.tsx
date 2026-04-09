"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/src/services/api";
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineOfficeBuilding,
  HiOutlineCheckCircle,
  HiOutlineExternalLink,
} from "react-icons/hi";
import Link from "next/link";
import { ButtonType } from "@/src/components/ButtonType";
import { EmpresaListagem } from "@/src/types/empresa";
import { ModalCadastrarEmpresa } from "@/src/components/admin/ModalCadastrarEmpresa";

export default function EmpresasAdminPage() {
  // Estados de Dados
  const [empresas, setEmpresas] = useState<EmpresaListagem[]>([]);
  const [busca, setBusca] = useState("");

  // Estados de Controle de Scroll
  const [pagina, setPagina] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Estados de UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meta, setMeta] = useState({
    total: 0,
    total_associadas: 0,
    total_nao_associadas: 0
  });


  const fetchEmpresas = useCallback(async (resetList = false) => {
    if (isLoading) return;

    setIsLoading(true);
    const targetPage = resetList ? 1 : pagina;

    try {
      const response = await api.get(`/admin/empresas`, {
        params: {
          search: busca,
          page: targetPage,
          limit: 15
        }
      });

      const { data, meta: backendMeta } = response.data;

      setEmpresas(prev => resetList ? data : [...prev, ...data]);
      setMeta({
        total: backendMeta.total,
        total_associadas: backendMeta.total_associadas,
        total_nao_associadas: backendMeta.total_nao_associadas
      });
      setHasMore(targetPage < backendMeta.total_paginas);

      if (!resetList) setPagina(prev => prev + 1);
      else setPagina(2);

    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    } finally {
      setIsLoading(false);
    }
  }, [busca, pagina, isLoading]);

  // Efeito para busca (Debounce manual ou disparado pelo input)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEmpresas(true);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [busca]);

  // Listener de Scroll
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

      // Dispara quando estiver a 100px do fundo
      if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !isLoading) {
        fetchEmpresas();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchEmpresas, hasMore, isLoading]);

  return (
    <div className="space-y-6 pb-24">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-500 text-sm">Gerencie o ecossistema de empresas da ACI Panambi.</p>
        </div>
        <ButtonType
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <HiOutlinePlus size={20} /> Nova Empresa
        </ButtonType>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Total */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <HiOutlineOfficeBuilding size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Geral</p>
            <p className="text-3xl font-bold text-gray-900 leading-tight">{meta.total}</p>
          </div>
        </div>

        {/* Card Associadas */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <HiOutlineCheckCircle size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Associadas</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-emerald-600 leading-tight">{meta.total_associadas}</p>
            </div>
          </div>
        </div>

        {/* Card Não Associadas */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <HiOutlineOfficeBuilding size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Não Associadas</p>
            <p className="text-3xl font-bold text-amber-600 leading-tight">{meta.total_nao_associadas}</p>
          </div>
        </div>
      </div>
      {/* Barra de Busca */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Nome, CNPJ ou Razão Social..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Empresa / CNPJ</th>
                <th className="px-6 py-4 font-bold">Vínculo ACI</th>
                <th className="px-6 py-4 font-bold">Responsável</th>
                <th className="px-6 py-4 font-bold text-center">Vagas</th>
                <th className="px-6 py-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {empresas.map((empresa) => (
                <tr key={empresa.id_empresa} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{empresa.nome_fantasia}</span>
                      <span className="text-xs text-gray-400 font-mono">{empresa.cnpj}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {empresa.tipo_vinculo_aci === "ASSOCIADA" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-green-50 text-green-700 border border-green-100 uppercase">
                        <HiOutlineCheckCircle /> Associada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-gray-50 text-gray-400 border border-gray-100 uppercase">
                        Não Associada
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700 font-medium">{empresa.responsavel?.nome || "N/A"}</span>
                      <span className="text-xs text-gray-400">{empresa.responsavel?.email || "-"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm">
                      {empresa.vagas_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/empresas/${empresa.id_empresa}`}
                      className="inline-flex p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      title="Ver Detalhes"
                    >
                      <HiOutlineExternalLink size={20} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Loading de Scroll */}
        {isLoading && (
          <div className="p-10 flex justify-center border-t border-gray-50">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && empresas.length === 0 && (
          <div className="p-20 text-center">
            <HiOutlineOfficeBuilding className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="text-gray-500 font-medium">Nenhuma empresa encontrada.</p>
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