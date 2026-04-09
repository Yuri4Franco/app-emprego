"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineOfficeBuilding,
  HiOutlineCheckCircle,
  HiOutlineExternalLink,
} from "react-icons/hi";
import { ButtonType } from "@/src/components/ButtonType";
import { EmpresaListagem } from "@/src/types/empresa";

export default function EmpresasAdminPage() {
  const [empresas, setEmpresas] = useState<EmpresaListagem[]>([]);
  const [busca, setBusca] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, pagina: 1 });

  // Busca dados do Backend
  const fetchEmpresas = async (query = "") => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/empresas?busca=${query}`);
      setEmpresas(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error("Erro ao carregar empresas", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas(busca);
  }, [busca]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-500 text-sm">
            Gerencie as empresas associadas e parceiras da ACI.
          </p>
        </div>
        <ButtonType variant="primary" className="flex items-center gap-2">
          <HiOutlinePlus size={20} /> Nova Empresa
        </ButtonType>
      </div>

      {/* Cards de Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <HiOutlineOfficeBuilding size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Total de Empresas
            </p>
            <p className="text-2xl font-bold text-gray-900">{meta.total}</p>
          </div>
        </div>
        {/* Aqui você poderia filtrar do array para mostrar associadas vs não associadas */}
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <HiOutlineSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por nome, CNPJ ou razão social..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de Empresas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Empresa / CNPJ</th>
                <th className="px-6 py-4 font-semibold">Vínculo ACI</th>
                <th className="px-6 py-4 font-semibold">Responsável</th>
                <th className="px-6 py-4 font-semibold text-center">Vagas</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Carregando empresas...
                  </td>
                </tr>
              ) : empresas.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Nenhuma empresa encontrada.
                  </td>
                </tr>
              ) : (
                empresas.map((empresa) => (
                  <tr
                    key={empresa.id_empresa}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {empresa.nome_fantasia}
                        </span>
                        <span className="text-xs text-gray-400">
                          {empresa.cnpj}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {empresa.tipo_vinculo_aci === "ASSOCIADO" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                          <HiOutlineCheckCircle /> Associada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-500 border border-gray-100">
                          Não Associada
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700">
                          {empresa.responsavel?.nome || "Sem responsável"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {empresa.responsavel?.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm">
                        {empresa.vagas_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <HiOutlineExternalLink size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
