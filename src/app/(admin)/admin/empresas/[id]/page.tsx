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
  HiOutlineMail,
  HiOutlineBadgeCheck,
  HiOutlineEye,
  HiOutlineRefresh,
  HiOutlinePencilAlt,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlinePlus,
  HiOutlineCalendar,
} from "react-icons/hi";
import { ButtonType } from "@/src/components/ButtonType";
import { ModalAdicionarUsuario } from "@/src/components/admin/ModalAdicionarUsuario";
import { ModalEditarUsuario } from "@/src/components/admin/ModalEditarUsuario";
import { ModalConfirmarStatusEmpresa } from "@/src/components/admin/ModalConfirmarStatusEmpresa";

export default function DetalhesEmpresaPage() {
  const { id } = useParams();
  const router = useRouter();

  const [empresa, setEmpresa] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchDetalhes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/empresas/${id}`);
      setEmpresa(response.data);
    } catch (error: any) {
      toast.error("Erro ao carregar detalhes da empresa.");
      router.push("/empresas");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) fetchDetalhes();
  }, [id, fetchDetalhes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleToggleUserStatus = async (
    userId: number,
    currentStatus: string,
  ) => {
    // Define o novo status baseado no atual
    const novoStatus = currentStatus === "ATIVO" ? "BLOQUEADO" : "ATIVO";
    const acaoLabel = novoStatus === "ATIVO" ? "ativar" : "bloquear";

    // Confirmação simples do navegador para evitar cliques acidentais em ações críticas
    if (!confirm(`Tem certeza que deseja ${acaoLabel} este usuário?`)) return;

    await toast.promise(
      api.patch(`/admin/usuarios/${userId}/status`, { status: novoStatus }),
      {
        loading: `${novoStatus === "ATIVO" ? "Ativando" : "Bloqueando"} usuário...`,
        success: (res) => {
          // Atualizamos o estado local da empresa para refletir a mudança na tabela sem refresh
          setEmpresa((prev: any) => ({
            ...prev,
            usuarios: prev.usuarios.map((u: any) =>
              u.id_usuario === userId ? { ...u, status: novoStatus } : u,
            ),
          }));
          return res.data.message;
        },
        error: (err) =>
          err.response?.data?.error || "Erro ao alterar status do usuário.",
      },
    );
  };

  const handleAlterarStatusEmpresa = async () => {
    // Se você tiver um campo status na empresa, use ele, senão vamos basear na ação
    // Aqui vou assumir que você quer DESATIVAR (já que o botão é vermelho)
    const acao = "DESATIVAR";

    setStatusLoading(true);
    await toast.promise(
      api.patch(`/admin/empresas/${id}/status`, { acao }),
      {
        loading: "Processando alteração...",
        success: (res) => {
          setIsStatusModalOpen(false);
          fetchDetalhes(); // Recarrega a página para atualizar usuários/vagas na tela
          return res.data.message;
        },
        error: (err) => err.response?.data?.error || "Erro ao alterar status.",
      }
    );
    setStatusLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header com Navegação */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-500"
          >
            <HiOutlineArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {empresa.nome_fantasia}
              </h1>
              {empresa.tipo_vinculo_aci === "ASSOCIADA" && (
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">
                  Associada
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm">CNPJ: {empresa.cnpj}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <ButtonType
            variant="danger"
            className="px-6 shadow-lg shadow-red-100"
            onClick={() => setIsStatusModalOpen(true)}
          >
            Desativar Empresa
          </ButtonType>
          <ButtonType variant="primary" className="px-6">
            Editar Dados
          </ButtonType>
        </div>
      </div>

      {/* Grid de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <HiOutlineBriefcase size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Vagas Postadas
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {empresa.vagas?.length || 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <HiOutlineUserGroup size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Usuários
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {empresa.usuarios?.length || 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <HiOutlineShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Status ACI
            </p>
            <p className="text-lg font-bold text-amber-600 uppercase">
              {empresa.tipo_vinculo_aci}
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda: Informações Gerais */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <HiOutlineOfficeBuilding className="text-blue-600" /> Informações
              da Empresa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm">
              <div>
                <p className="text-gray-400 font-medium mb-1 uppercase text-[10px] tracking-wider">
                  Razão Social
                </p>
                <p className="text-gray-900 font-semibold">
                  {empresa.razao_social}
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-medium mb-1 uppercase text-[10px] tracking-wider">
                  E-mail Institucional
                </p>
                <p className="text-gray-900 font-semibold">
                  {empresa.email || "Não informado"}
                </p>
              </div>
              {/* Adicionaremos mais conforme evoluirmos */}
            </div>
          </section>

          {/* Listagem de Usuários */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <HiOutlineUserGroup className="text-purple-600" /> Usuários com
                Acesso
              </h3>
              <button
                onClick={() => setIsUserModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-bold hover:bg-purple-100 transition-all"
              >
                <HiOutlinePlus size={18} /> Adicionar Usuário
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black tracking-widest">
                  <tr>
                    <th className="px-8 py-4">Nome</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Último Acesso</th>
                    <th className="px-8 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {empresa.usuarios?.map((user: any) => (
                    <tr
                      key={user.id_usuario}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-8 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm">
                            {user.nome}
                          </span>
                          <span className="text-xs text-gray-400">
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold ${user.status === "ATIVO"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                            }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2 text-xs">
                          <HiOutlineCalendar className="text-gray-300" size={14} />
                          {user.ultimo_login ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-700">
                                {new Date(user.ultimo_login).toLocaleDateString('pt-BR')}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                às {new Date(user.ultimo_login).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Nunca acessou</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          {/* Alterar Status */}
                          <button
                            onClick={() =>
                              handleToggleUserStatus(
                                user.id_usuario,
                                user.status,
                              )
                            }
                            title={
                              user.status === "ATIVO"
                                ? "Bloquear Usuário"
                                : "Ativar Usuário"
                            }
                            className={`p-2 rounded-xl transition-all ${user.status === "ATIVO"
                              ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                              : "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                              }`}
                          >
                            {user.status === "ATIVO" ? (
                              <HiOutlineLockClosed size={18} />
                            ) : (
                              <HiOutlineLockOpen size={18} />
                            )}
                          </button>

                          {/* Editar */}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditUserModalOpen(true);
                            }}
                            title="Editar Usuário"
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                          >
                            <HiOutlinePencilAlt size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Coluna Direita: Gestão de Créditos (Sua sugestão!) */}
        <div className="space-y-8">
          <section className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl text-white shadow-xl shadow-blue-200">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <HiOutlineBadgeCheck /> Gestão de Créditos
            </h3>
            <div className="space-y-6">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">
                  Créditos de Vagas
                </p>
                <p className="text-3xl font-bold">
                  {empresa.creditos_vagas || 0}
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">
                  Créditos de Currículos
                </p>
                <p className="text-3xl font-bold">
                  {empresa.creditos_curriculos || 0}
                </p>
              </div>
              <ButtonType className="w-full bg-white text-blue-700 hover:bg-blue-50">
                Adicionar Créditos
              </ButtonType>
            </div>
          </section>
        </div>
      </div>
      <ModalAdicionarUsuario
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        idEmpresa={Number(id)} // O id que vem do useParams()
        onSuccess={() => fetchDetalhes()} // Recarrega os dados da empresa (e a lista de usuários)
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
    </div>
  );
}
