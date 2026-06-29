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
} from "react-icons/hi";

import { ModalEditarUsuario } from "@/src/components/admin/ModalEditarUsuario";
import { useAuth } from "@/src/AuthContext";
import { Pagination } from "@/src/components/admin/usuarios/Pagination";
import { ModalModerador } from "@/src/components/admin/usuarios/ModalModerador";

type UserTab = "CANDIDATO" | "EMPRESA" | "ADM";

function AdminUsuariosContent() {
  const { user: currentUser } = useAuth(); // Identifica se quem está logado é MASTER

  useEffect(() => {
    console.log("Usuário logado:", currentUser);
  }, [currentUser]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Define a aba inicial lendo a URL (fallback para "CANDIDATO")
  const urlTab = searchParams.get("tab") as UserTab | null;
  const [activeTab, setActiveTab] = useState<UserTab>(
    urlTab === "CANDIDATO" || urlTab === "EMPRESA" || (urlTab === "ADM" && currentUser?.is_master)
      ? urlTab
      : "CANDIDATO"
  );

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [termoBuscado, setTermoBuscado] = useState("");

  // Estados de Paginação
  const [paginaAtual, setPaginaAtual] = useState(Number(searchParams.get("page")) || 1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Modais
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isModModalOpen, setIsEditModModalOpen] = useState(false);

  const syncParamsURL = (tabId: UserTab, pageNum: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    params.set("page", String(pageNum));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const fetchUsuarios = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/usuarios", {
        params: {
          tipo: activeTab,
          busca: termoBuscado || undefined,
          page: paginaAtual,
          limit: 10, // Força paginação de 10 por página no backend
        },
      });
      setUsuarios(response.data.dados || response.data.data || response.data);
      setTotalPaginas(response.data.meta?.totalPages || response.data.meta?.total_paginas || 1);
    } catch (error) {
      toast.error("Erro ao carregar lista de usuários.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, termoBuscado, paginaAtual]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleTabChange = (tabId: UserTab) => {
    setActiveTab(tabId);
    setBusca("");
    setTermoBuscado("");
    setPaginaAtual(1);
    syncParamsURL(tabId, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPaginaAtual(newPage);
    syncParamsURL(activeTab, newPage);
  };

  const handleBusca = () => {
    setTermoBuscado(busca);
    setPaginaAtual(1);
    syncParamsURL(activeTab, 1);
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

        {/* Botão visível apenas na aba de moderadores para Master Admins */}
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

        {/* Aba Exclusiva para Master Admin gerenciar a equipe de moderadores */}
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

      {/* BARRA DE BUSCA */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm font-medium text-gray-700"
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
        <button onClick={handleBusca} className="px-8 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-colors text-sm">
          Buscar
        </button>
      </div>

      {/* TABELA DE USUÁRIOS */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black tracking-widest">
              <tr>
                <th className="px-8 py-4">Nome e Contato</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Último Acesso</th>
                <th className="px-8 py-4 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
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
                    <td className="px-8 py-4">
                      <div className="flex flex-col">
                        <span className={`font-bold text-sm ${user.status === "BLOQUEADO" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                          {user.nome} {user.is_master && <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded ml-1 font-black">MASTER</span>}
                        </span>
                        <span className="text-xs font-medium text-gray-500">{user.email}</span>
                      </div>
                    </td>

                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.status === "ATIVO" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                        }`}>
                        {user.status}
                      </span>
                    </td>

                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                        <HiOutlineCalendar className="text-gray-300" size={16} />
                        {user.ultimo_login ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-700">{new Date(user.ultimo_login).toLocaleDateString("pt-BR")}</span>
                            <span className="text-[10px] text-gray-400">às {new Date(user.ultimo_login).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Nunca acessou</span>
                        )}
                      </div>
                    </td>

                    <td className="px-8 py-4">
                      <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        {activeTab !== "ADM" && (
                          <Link href={`/admin/usuarios/${user.id_usuario}/ver`} title="Ver Perfil Completo" className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                            <HiOutlineEye size={18} />
                          </Link>
                        )}

                        <button onClick={() => handleResetSenhaRapido(user.id_usuario, user.email)} title="Enviar link de redefinição de senha" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <HiOutlineKey size={18} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            if (activeTab === "ADM") setIsEditModModalOpen(true);
                            else setIsEditUserModalOpen(true);
                          }}
                          title="Editar Dados"
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                        >
                          <HiOutlinePencilAlt size={18} />
                        </button>

                        <button
                          onClick={() => handleToggleUserStatus(user.id_usuario, user.status)}
                          title={user.status === "ATIVO" ? "Bloquear" : "Ativar"}
                          className={`p-2 rounded-xl transition-all ${user.status === "ATIVO" ? "text-gray-400 hover:text-red-600 hover:bg-red-50" : "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"}`}
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

        {/* COMPONENTE DE PAGINAÇÃO CONECTADO */}
        <Pagination currentPage={paginaAtual} totalPages={totalPaginas} onPageChange={handlePageChange} />
      </section>

      {/* Modal de Edição de Usuários Tradicionais */}
      <ModalEditarUsuario
        isOpen={isEditUserModalOpen}
        onClose={() => {
          setIsEditUserModalOpen(false);
          setSelectedUser(null);
        }}
        usuario={selectedUser}
        onSuccess={() => fetchUsuarios()}
      />

      {/* Modal Especial para Gestão de Equipe (Masters) */}
      <ModalModerador
        isOpen={isModModalOpen}
        onClose={() => {
          setIsEditModModalOpen(false);
          setSelectedUser(null);
        }}
        usuario={selectedUser}
        onSuccess={() => fetchUsuarios()}
      />
    </div>
  );
}

// Wrapper padrão com Suspense exigido para build segura do Next.js
export default function AdminUsuariosPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-400 font-medium">Renderizando painel de segurança...</div>}>
      <AdminUsuariosContent />
    </Suspense>
  );
}