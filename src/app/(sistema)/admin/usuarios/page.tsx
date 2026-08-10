"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import Link from "next/link";

import {
  HiOutlineUserGroup,
  HiOutlineSearch,
  HiOutlineCalendar,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlinePencilAlt,
  HiOutlineKey,
  HiOutlineOfficeBuilding,
  HiOutlineUser,
  HiOutlineEye,
  HiOutlineShieldCheck,
  HiOutlinePlus,
  HiCheckCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

import { ModalEditarUsuario } from "@/src/components/admin/ModalEditarUsuario";
import { useAuth } from "@/src/AuthContext";
import { Pagination } from "@/src/components/admin/usuarios/Pagination";
import { ModalModerador } from "@/src/components/admin/usuarios/ModalModerador";

type UserTab = "CANDIDATO" | "EMPRESA" | "ADM";
type FiltroVisivel = "TODOS" | "SIM" | "NAO";

function AdminUsuariosContent() {
  const { user: currentUser } = useAuth();

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlTab = searchParams.get("tab") as UserTab | null;
  const [activeTab, setActiveTab] = useState<UserTab>(
    urlTab === "CANDIDATO" || urlTab === "EMPRESA" || (urlTab === "ADM" && currentUser?.is_master)
      ? urlTab
      : "CANDIDATO"
  );

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [busca, setBusca] = useState("");
  const [termoBuscado, setTermoBuscado] = useState("");

  // ✨ Novo estado para o filtro de Banco de Currículos
  const urlVisivel = searchParams.get("visivel") as FiltroVisivel | null;
  const [filtroVisivel, setFiltroVisivel] = useState<FiltroVisivel>(urlVisivel || "TODOS");

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(Number(searchParams.get("page")) || 1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Modais
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isModModalOpen, setIsEditModModalOpen] = useState(false);

  const syncParamsURL = (tabId: UserTab, pageNum: number, visivelParam: FiltroVisivel) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    params.set("page", String(pageNum));

    if (tabId === "CANDIDATO" && visivelParam !== "TODOS") {
      params.set("visivel", visivelParam);
    } else {
      params.delete("visivel");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const fetchUsuarios = useCallback(async () => {
    setIsLoading(true);
    try {
      // ✨ Montando os parâmetros dinamicamente
      const paramsToBackend: any = {
        tipo: activeTab,
        busca: termoBuscado || undefined,
        page: paginaAtual,
        limit: 10,
      };

      // Só envia o filtro de currículo se estiver na aba candidato e não for "TODOS"
      if (activeTab === "CANDIDATO" && filtroVisivel !== "TODOS") {
        paramsToBackend.visivel = filtroVisivel === "SIM";
      }

      const response = await api.get("/admin/usuarios", { params: paramsToBackend });
      setUsuarios(response.data.dados || response.data.data || response.data);
      setTotalPaginas(response.data.meta?.totalPages || response.data.meta?.total_paginas || 1);
    } catch (error) {
      toast.error("Erro ao carregar lista de usuários.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, termoBuscado, paginaAtual, filtroVisivel]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleTabChange = (tabId: UserTab) => {
    setActiveTab(tabId);
    setBusca("");
    setTermoBuscado("");
    setFiltroVisivel("TODOS");
    setPaginaAtual(1);
    syncParamsURL(tabId, 1, "TODOS");
  };

  const handlePageChange = (newPage: number) => {
    setPaginaAtual(newPage);
    syncParamsURL(activeTab, newPage, filtroVisivel);
  };

  const handleBusca = () => {
    setTermoBuscado(busca);
    setPaginaAtual(1);
    syncParamsURL(activeTab, 1, filtroVisivel);
  };

  const handleFiltroVisivelChange = (novoFiltro: FiltroVisivel) => {
    setFiltroVisivel(novoFiltro);
    setPaginaAtual(1);
    syncParamsURL(activeTab, 1, novoFiltro);
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
    const novoStatus = currentStatus === "ATIVO" ? "BLOQUEADO" : "ATIVO";
    const acaoLabel = novoStatus === "ATIVO" ? "ativar" : "bloquear";

    if (!confirm(`Tem certeza que deseja ${acaoLabel} este usuário?`)) return;

    await toast.promise(
      api.patch(`/admin/usuarios/${userId}/status`, { status: novoStatus }),
      {
        loading: `${novoStatus === "ATIVO" ? "Ativando" : "Bloqueando"} usuário...`,
        success: () => {
          setUsuarios((prev) =>
            prev.map((u) => (u.id_usuario === userId ? { ...u, status: novoStatus } : u))
          );
          return `Usuário alterado com sucesso!`;
        },
        error: (err) => err.response?.data?.error || "Erro ao alterar status.",
      }
    );
  };

  const handleResetSenhaRapido = async (userId: number, email: string) => {
    if (!confirm(`Enviar link de redefinição de senha para ${email}?`)) return;

    await toast.promise(
      api.post("/auth/esqueci-senha", { email }),
      {
        loading: "Disparando e-mail de redefinição...",
        success: "E-mail de redefinição enviado!",
        error: (err) => err.response?.data?.error || "Erro ao solicitar redefinição.",
      }
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Gestão de Acessos
          </h1>
          <p className="text-gray-500 font-medium">
            Controle os usuários, permissões e seguranças da plataforma.
          </p>
        </div>

        {!isLoading && activeTab === "ADM" && currentUser?.is_master && (
          <button
            onClick={() => {
              setSelectedUser(null);
              setIsEditModModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-3 rounded-2xl shadow-md transition-all"
          >
            <HiOutlinePlus size={18} /> Cadastrar Moderador
          </button>
        )}
      </div>

      {/* ABAS */}
      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl mb-8 w-fit overflow-x-auto">
        <button
          onClick={() => handleTabChange("CANDIDATO")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "CANDIDATO" ? "bg-white shadow-sm text-blue-700" : "text-gray-500 hover:text-gray-700"
            }`}
        >
          <HiOutlineUser size={18} /> Candidatos
        </button>
        <button
          onClick={() => handleTabChange("EMPRESA")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "EMPRESA" ? "bg-white shadow-sm text-purple-700" : "text-gray-500 hover:text-gray-700"
            }`}
        >
          <HiOutlineOfficeBuilding size={18} /> Empresas
        </button>
        {currentUser?.is_master && (
          <button
            onClick={() => handleTabChange("ADM")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "ADM" ? "bg-white shadow-sm text-amber-700" : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <HiOutlineShieldCheck size={18} /> Equipe / Moderadores
          </button>
        )}
      </div>

      {/* BARRA DE BUSCA E FILTROS */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">

        {/* Input de Busca */}
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm font-medium text-gray-700"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBusca()}
            placeholder={
              activeTab === "CANDIDATO"
                ? "Buscar por nome ou e-mail de candidato..."
                : activeTab === "EMPRESA"
                  ? "Buscar por nome ou e-mail corporativo..."
                  : "Buscar moderador por nome ou e-mail..."
            }
          />
        </div>

        {/* ✨ Filtro de Visibilidade (Só aparece em Candidatos) */}
        {activeTab === "CANDIDATO" && (
          <select
            value={filtroVisivel}
            onChange={(e) => handleFiltroVisivelChange(e.target.value as FiltroVisivel)}
            className="w-auto px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm font-medium text-gray-700 cursor-pointer"
          >
            <option value="TODOS">Todos</option>
            <option value="SIM">Banco de Talentos</option>
            <option value="NAO">Ocultos</option>
          </select>
        )}

        <button onClick={handleBusca} className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-colors text-sm shrink-0">
          Buscar
        </button>
      </div>

      {/* TABELA DE USUÁRIOS */}
      {/* TABELA DE USUÁRIOS */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Nome e Contato</th>

                {/* ✨ Alterna entre Currículo (Candidato) ou Status (Empresa/Adm) */}
                {activeTab === "CANDIDATO" ? (
                  <th className="px-6 py-4">Perfil & Currículo</th>
                ) : (
                  <th className="px-6 py-4">Status</th>
                )}

                <th className="px-6 py-4">Última Atividade</th>
                <th className="px-6 py-4 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  {/* ✨ colSpan agora é sempre 4 */}
                  <td colSpan={4} className="p-16 text-center text-gray-400 font-bold animate-pulse text-sm uppercase tracking-wider">
                    Buscando registros da base de talentos...
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-16 text-center text-gray-400 font-medium text-sm italic">
                    Nenhum usuário encontrado com este filtro.
                  </td>
                </tr>
              ) : (
                usuarios.map((user: any) => (
                  <tr key={user.id_usuario} className="hover:bg-gray-50/40 transition-colors group">
                    {/* COLUNA 1: Nome e Email */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={`font-bold text-sm flex items-center gap-2 ${user.status === "BLOQUEADO" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                          {user.nome}
                          {user.is_master && <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black">MASTER</span>}
                        </span>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          {user.email_confirmado ? (
                            <HiCheckCircle className="text-emerald-500 shrink-0" size={14} title="E-mail Confirmado" />
                          ) : (
                            <HiOutlineExclamationCircle className="text-amber-500 shrink-0" size={14} title="E-mail Pendente" />
                          )}
                          <span className={`text-xs font-medium ${user.email_confirmado ? 'text-gray-500' : 'text-amber-600'}`}>
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ✨ COLUNA 2: Alterna o conteúdo dependendo da Aba */}
                    {activeTab === "CANDIDATO" ? (
                      <td className="px-6 py-4 min-w-[200px]">
                        {user.candidato ? (
                          <div className="flex flex-col gap-2.5 w-full max-w-[180px]">
                            {/* Barra de Progresso */}
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                                <span>Preenchimento</span>
                                <span className={user.candidato.porcentagem_curriculo >= 80 ? "text-emerald-600" : ""}>
                                  {user.candidato.porcentagem_curriculo}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${user.candidato.porcentagem_curriculo >= 80 ? 'bg-emerald-500' :
                                      user.candidato.porcentagem_curriculo >= 40 ? 'bg-blue-500' : 'bg-gray-400'
                                    }`}
                                  style={{ width: `${user.candidato.porcentagem_curriculo}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Tag do Banco */}
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md w-fit inline-flex items-center gap-1 ${user.candidato.perfil_visivel_empresas
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                              }`}>
                              {user.candidato.perfil_visivel_empresas ? (
                                <>🟢 No Banco</>
                              ) : (
                                <>⚪ Oculto</>
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Dados indisponíveis</span>
                        )}
                      </td>
                    ) : (
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.status === "ATIVO" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                          }`}>
                          {user.status}
                        </span>
                      </td>
                    )}

                    {/* COLUNA 3: Atividade */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                        <HiOutlineCalendar className="text-gray-300" size={16} />
                        {user.ultima_atividade ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-700">{new Date(user.ultima_atividade).toLocaleDateString("pt-BR")}</span>
                            <span className="text-[10px] text-gray-400">às {new Date(user.ultima_atividade).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Sem atividade</span>
                        )}
                      </div>
                    </td>

                    {/* COLUNA 4: Ações (O botão de bloquear continua disponível aqui, só a tag principal de status que sumiu) */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        {activeTab !== "ADM" && (
                          <Link href={`/admin/usuarios/${user.id_usuario}/ver`} title="Ver Perfil Completo" className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                            <HiOutlineEye size={18} />
                          </Link>
                        )}

                        <button onClick={() => handleResetSenhaRapido(user.id_usuario, user.email)} title="Redefinir senha" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <HiOutlineKey size={18} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            if (activeTab === "ADM") setIsEditModModalOpen(true);
                            else setIsEditUserModalOpen(true);
                          }}
                          title="Editar"
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                        >
                          <HiOutlinePencilAlt size={18} />
                        </button>

                        {/* O botão de travar/destravar o usuário ainda fica disponível por segurança */}
                        <button
                          onClick={() => handleToggleUserStatus(user.id_usuario, user.status)}
                          title={user.status === "ATIVO" ? "Bloquear" : "Ativar"}
                          className={`p-2 rounded-lg transition-all ${user.status === "ATIVO" ? "text-gray-400 hover:text-red-600 hover:bg-red-50" : "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"}`}
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

        <Pagination currentPage={paginaAtual} totalPages={totalPaginas} onPageChange={handlePageChange} />
      </section>

      {/* Modais omitidos para poupar espaço, mantidos exatamente como você configurou */}
      <ModalEditarUsuario isOpen={isEditUserModalOpen} onClose={() => { setIsEditUserModalOpen(false); setSelectedUser(null); }} usuario={selectedUser} onSuccess={() => fetchUsuarios()} />
      <ModalModerador isOpen={isModModalOpen} onClose={() => { setIsEditModModalOpen(false); setSelectedUser(null); }} usuario={selectedUser} onSuccess={() => fetchUsuarios()} />
    </div>
  );
}

export default function AdminUsuariosPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-400 font-medium">Carregando painel...</div>}>
      <AdminUsuariosContent />
    </Suspense>
  );
}