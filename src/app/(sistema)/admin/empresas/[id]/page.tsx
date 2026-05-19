"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
  HiOutlineArrowLeft,
  HiOutlineOfficeBuilding,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineShieldCheck,
  HiOutlineBadgeCheck,
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlinePlus,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineCog
} from "react-icons/hi";
import { ButtonType } from "@/src/components/ButtonType";
import { ModalAdicionarUsuario } from "@/src/components/admin/ModalAdicionarUsuario";
import { ModalEditarUsuario } from "@/src/components/admin/ModalEditarUsuario";
import { ModalConfirmarStatusEmpresa } from "@/src/components/admin/ModalConfirmarStatusEmpresa";
import { ModalGerenciarCreditos } from "@/src/components/admin/ModalGerenciarCreditos";
import { ModalEditarEmpresa } from "@/src/components/admin/ModalEditarEmpresa";

// Função utilitária para aplicar a máscara do CNPJ
const formatarCNPJ = (cnpj: string) => {
  if (!cnpj) return "";
  const nums = cnpj.replace(/\D/g, "");
  if (nums.length === 14) {
    return nums.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return cnpj;
};

export default function DetalhesEmpresaPage() {
  const { id } = useParams();
  const router = useRouter();

  const [empresa, setEmpresa] = useState<any>(null);
  const [vagasEmpresa, setVagasEmpresa] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVagas, setIsLoadingVagas] = useState(true);

  // Estados dos Modais
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [isCreditosModalOpen, setIsCreditosModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchDetalhes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/empresas/${id}`);
      setEmpresa(response.data);
    } catch (error: any) {
      toast.error("Erro ao carregar detalhes da empresa.");
      router.push("/admin/empresas");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  const fetchVagas = useCallback(async () => {
    setIsLoadingVagas(true);
    try {
      const response = await api.get(`/admin/empresas/${id}/vagas`);
      setVagasEmpresa(response.data.dados || response.data.data || response.data);
    } catch (error) {
      console.error("Erro ao buscar vagas da empresa", error);
    } finally {
      setIsLoadingVagas(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchDetalhes();
      fetchVagas();
    }
  }, [id, fetchDetalhes, fetchVagas]);

  if (isLoading || !empresa) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium animate-pulse">Carregando perfil corporativo...</p>
      </div>
    );
  }

  const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
    const novoStatus = currentStatus === "ATIVO" ? "BLOQUEADO" : "ATIVO";
    const acaoLabel = novoStatus === "ATIVO" ? "ativar" : "bloquear";

    if (!confirm(`Tem certeza que deseja ${acaoLabel} este usuário?`)) return;

    await toast.promise(
      api.patch(`/admin/usuarios/${userId}/status`, { status: novoStatus }),
      {
        loading: `${novoStatus === "ATIVO" ? "Ativando" : "Bloqueando"} usuário...`,
        success: (res) => {
          setEmpresa((prev: any) => ({
            ...prev,
            usuarios: prev.usuarios.map((u: any) => u.id_usuario === userId ? { ...u, status: novoStatus } : u),
          }));
          return res.data.message || "Status alterado com sucesso!";
        },
        error: (err) => err.response?.data?.error || "Erro ao alterar status do usuário.",
      }
    );
  };

  const handleAlterarStatusEmpresa = async () => {
    const acao = "DESATIVAR";
    setStatusLoading(true);
    await toast.promise(api.patch(`/admin/empresas/${id}/status`, { acao }), {
      loading: "Processando alteração...",
      success: (res) => {
        setIsStatusModalOpen(false);
        fetchDetalhes();
        return res.data.message || "Empresa desativada.";
      },
      error: (err) => err.response?.data?.error || "Erro ao alterar status.",
    });
    setStatusLoading(false);
  };

  return (
    // Adicionado padding e max-width para a página respirar
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">

      {/* HEADER DE NAVEGAÇÃO PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200/60 pb-8">
        <div className="flex items-center gap-5 sm:gap-6">
          <button
            onClick={() => router.back()}
            className="p-3 bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50 rounded-2xl transition-all text-gray-500 hover:text-blue-600 shadow-sm group shrink-0"
          >
            <HiOutlineArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center gap-4 sm:gap-5">
            {/* Ícone / Logo Placeholder */}
            <div className="hidden sm:flex w-16 h-16 bg-gradient-to-br from-blue-50 to-gray-50 border border-gray-100 rounded-2xl items-center justify-center text-blue-600 shadow-inner shrink-0">
              <HiOutlineOfficeBuilding size={32} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {empresa.nome_fantasia}
                </h1>
                {empresa.tipo_vinculo_aci === "ASSOCIADA" ? (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-widest flex items-center gap-1">
                    <HiOutlineBadgeCheck size={14} /> Selo ACI
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-3 py-1 rounded-full border border-gray-200 uppercase tracking-widest">
                    Não Associada
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm font-medium flex items-center gap-2">
                <span className="font-mono bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-md text-gray-600">
                  {formatarCNPJ(empresa.cnpj)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* GRID DE KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <HiOutlineBriefcase size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Vagas Postadas</p>
            <p className="text-3xl font-black text-gray-900">{vagasEmpresa?.length || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
            <HiOutlineUserGroup size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Usuários com Acesso</p>
            <p className="text-3xl font-black text-gray-900">{empresa.usuarios?.length || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <HiOutlineBadgeCheck size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Créditos P/ Currículos</p>
            <p className="text-3xl font-black text-emerald-600">{empresa.creditos_curriculos || 0}</p>
          </div>
        </div>
      </div>

      {/* LAYOUT PRINCIPAL (2 COLUNAS) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* COLUNA ESQUERDA (DADOS E TABELAS) */}
        <div className="xl:col-span-2 space-y-8">

          {/* Informações da Empresa */}
          <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <HiOutlineOfficeBuilding className="text-blue-600" size={24} /> Dados Corporativos
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
              <div>
                <p className="text-gray-400 font-bold mb-1.5 uppercase text-[10px] tracking-widest">Razão Social</p>
                <p className="text-gray-900 font-semibold text-sm">{empresa.razao_social}</p>
              </div>
              <div>
                <p className="text-gray-400 font-bold mb-1.5 uppercase text-[10px] tracking-widest">E-mail Institucional</p>
                <p className="text-gray-900 font-semibold text-sm">{empresa.email || "Não informado"}</p>
              </div>
              <div>
                <p className="text-gray-400 font-bold mb-1.5 uppercase text-[10px] tracking-widest">Data de Cadastro</p>
                <p className="text-gray-900 font-semibold text-sm">
                  {empresa.criado_em ? new Date(empresa.criado_em).toLocaleDateString("pt-BR") : "N/A"}
                </p>
              </div>
            </div>
          </section>

          {/* NOVA SEÇÃO: Vagas da Empresa */}
          <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 md:px-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <HiOutlineBriefcase className="text-blue-600" size={24} /> Oportunidades (Vagas)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white text-[10px] uppercase text-gray-400 font-black tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-4">Título da Vaga</th>
                    <th className="px-8 py-4">Data</th>
                    <th className="px-8 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoadingVagas ? (
                    <tr><td colSpan={3} className="px-8 py-8 text-center text-gray-400 animate-pulse font-medium">Buscando vagas...</td></tr>
                  ) : vagasEmpresa.length === 0 ? (
                    <tr><td colSpan={3} className="px-8 py-8 text-center text-gray-400 font-medium">Esta empresa ainda não publicou nenhuma vaga.</td></tr>
                  ) : (
                    vagasEmpresa.map((vaga: any) => (
                      <tr key={vaga.id_vaga} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-8 py-4 font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                          {vaga.titulo}
                        </td>
                        <td className="px-8 py-4 text-xs text-gray-500 font-medium">
                          {new Date(vaga.criado_em).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-8 py-4">
                          <span className="bg-gray-100 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                            {vaga.status.replace(/_/g, " ")}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Listagem de Usuários */}
          <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 md:px-8 border-b border-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gray-50/50">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <HiOutlineUserGroup className="text-purple-600" size={24} /> Colaboradores
              </h3>
              <button
                onClick={() => setIsUserModalOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-100 text-purple-700 rounded-xl text-xs font-bold hover:bg-purple-600 hover:text-white transition-all border border-purple-200 hover:border-purple-600"
              >
                <HiOutlinePlus size={16} /> Novo Acesso
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white text-[10px] uppercase text-gray-400 font-black tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-4">Nome e Contato</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {empresa.usuarios?.length === 0 ? (
                    <tr><td colSpan={3} className="px-8 py-8 text-center text-gray-400 font-medium">Nenhum usuário cadastrado.</td></tr>
                  ) : (
                    empresa.usuarios?.map((user: any) => (
                      <tr key={user.id_usuario} className="hover:bg-purple-50/30 transition-colors group">
                        <td className="px-8 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-sm group-hover:text-purple-700">{user.nome}</span>
                            <span className="text-xs text-gray-500 mt-0.5">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${user.status === "ATIVO" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                            }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setIsEditUserModalOpen(true);
                              }}
                              title="Editar Usuário"
                              className="p-2.5 text-gray-500 hover:text-purple-600 hover:bg-purple-100 rounded-xl transition-all"
                            >
                              <HiOutlinePencilAlt size={18} />
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user.id_usuario, user.status)}
                              title={user.status === "ATIVO" ? "Bloquear Acesso" : "Liberar Acesso"}
                              className={`p-2.5 rounded-xl transition-all ${user.status === "ATIVO" ? "text-gray-500 hover:text-red-600 hover:bg-red-100" : "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100"
                                }`}
                            >
                              {user.status === "ATIVO" ? <HiOutlineLockClosed size={18} /> : <HiOutlineLockOpen size={18} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* COLUNA DIREITA (AÇÕES E CRÉDITOS) */}
        <div className="space-y-6">

          {/* Painel de Controle (Ações Administrativas) */}
          <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 mb-5 flex items-center gap-2 uppercase tracking-widest">
              <HiOutlineCog className="text-gray-400" size={18} /> Painel de Controle
            </h3>
            <div className="space-y-3">
              <ButtonType
                variant="primary"
                className="w-full justify-center bg-gray-50 hover:bg-blue-50 text-blue-600 border border-gray-200 hover:border-blue-200 shadow-none py-3"
                onClick={() => setIsEditModalOpen(true)}
              >
                Editar Dados Corporativos
              </ButtonType>
              <button
                onClick={() => setIsStatusModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-red-200 text-red-600 font-bold rounded-xl text-sm hover:bg-red-50 hover:border-red-300 transition-all"
              >
                <HiOutlineShieldCheck size={18} /> Suspender Empresa
              </button>
            </div>
          </section>

          {/* Gestão de Créditos de Banco de Talentos */}
          <section className="bg-gradient-to-br from-blue-700 to-blue-900 p-8 rounded-[32px] text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
            {/* Decoração de fundo */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>

            <h3 className="text-lg font-black mb-6 flex items-center gap-2 relative z-10">
              <HiOutlineDocumentText size={24} className="text-blue-300" /> Banco de Talentos
            </h3>

            <div className="space-y-6 relative z-10">
              <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">
                  Créditos p/ Desbloqueio
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-white">
                    {empresa.creditos_curriculos || 0}
                  </p>
                  <span className="text-sm text-blue-300 font-medium">currículos</span>
                </div>
              </div>

              <button
                onClick={() => setIsCreditosModalOpen(true)}
                className="w-full bg-white text-blue-800 hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98] font-black py-4 rounded-xl transition-all shadow-lg"
              >
                Gerenciar Créditos
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* MODAIS (Inalterados) */}
      <ModalAdicionarUsuario
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        idEmpresa={Number(id)}
        onSuccess={() => fetchDetalhes()}
      />
      <ModalEditarUsuario
        isOpen={isEditUserModalOpen}
        onClose={() => {
          setIsEditUserModalOpen(false);
          setSelectedUser(null);
        }}
        usuario={selectedUser}
        onSuccess={() => fetchDetalhes()}
      />
      <ModalConfirmarStatusEmpresa
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleAlterarStatusEmpresa}
        isLoading={statusLoading}
        tipo="DESATIVAR"
      />
      <ModalGerenciarCreditos
        isOpen={isCreditosModalOpen}
        onClose={() => setIsCreditosModalOpen(false)}
        idEmpresa={Number(id)}
        onSuccess={() => fetchDetalhes()}
      />
      <ModalEditarEmpresa
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        empresa={empresa}
        onSuccess={() => fetchDetalhes()}
      />
    </div>
  );
}