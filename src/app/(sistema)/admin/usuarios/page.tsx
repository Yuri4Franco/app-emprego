"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
    HiOutlineUserGroup,
    HiOutlineSearch,
    HiOutlineCalendar,
    HiOutlineLockClosed,
    HiOutlineLockOpen,
    HiOutlinePencilAlt,
    HiOutlineKey,
    HiOutlineOfficeBuilding,
    HiOutlineUser
} from "react-icons/hi";
import { ModalEditarUsuario } from "@/src/components/admin/ModalEditarUsuario";

type UserTab = "CANDIDATO" | "EMPRESA";

export default function AdminUsuariosPage() {
    const [activeTab, setActiveTab] = useState<UserTab>("CANDIDATO");
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [busca, setBusca] = useState("");
    const [termoBuscado, setTermoBuscado] = useState("");

    // Modais
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);

    const fetchUsuarios = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/admin/usuarios", {
                params: {
                    tipo: activeTab,
                    busca: termoBuscado || undefined,
                },
            });
            // Adapte conforme a resposta real da sua API
            setUsuarios(response.data.dados || response.data.data || response.data);
        } catch (error) {
            toast.error("Erro ao carregar lista de usuários.");
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, termoBuscado]);

    useEffect(() => {
        fetchUsuarios();
    }, [fetchUsuarios]);

    const handleBusca = () => {
        setTermoBuscado(busca);
    };

    const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
        const novoStatus = currentStatus === "ATIVO" ? "BLOQUEADO" : "ATIVO";
        const acaoLabel = novoStatus === "ATIVO" ? "ativar" : "bloquear";

        if (!confirm(`Tem certeza que deseja ${acaoLabel} este usuário?`)) return;

        await toast.promise(
            api.patch(`/admin/usuarios/${userId}/status`, { status: novoStatus }),
            {
                loading: `${novoStatus === "ATIVO" ? "Ativando" : "Bloqueando"} usuário...`,
                success: (res) => {
                    setUsuarios((prev) =>
                        prev.map((u) => (u.id_usuario === userId ? { ...u, status: novoStatus } : u))
                    );
                    return res.data.message || `Usuário ${novoStatus === "ATIVO" ? "ativado" : "bloqueado"} com sucesso!`;
                },
                error: (err) => err.response?.data?.error || "Erro ao alterar status do usuário.",
            }
        );
    };

    const handleResetSenhaRapido = async (userId: number, email: string) => {
        if (!confirm(`Enviar link de redefinição de senha para ${email}?`)) return;

        await toast.promise(
            api.post("/auth/esqueci-senha", { email }), // Alterado para a rota pública com o payload correto
            {
                loading: "Disparando e-mail de redefinição...",
                success: "E-mail de redefinição enviado com sucesso!",
                error: (err) => err.response?.data?.error || "Erro ao solicitar redefinição.",
            }
        );
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestão de Acessos</h1>
                    <p className="text-gray-500 font-medium">Controle os usuários, permissões e seguranças da plataforma.</p>
                </div>
            </div>

            {/* ABAS */}
            <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl mb-8 w-fit overflow-x-auto">
                <button
                    onClick={() => {
                        setActiveTab("CANDIDATO");
                        setBusca("");
                        setTermoBuscado("");
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "CANDIDATO" ? "bg-white shadow-sm text-blue-700" : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <HiOutlineUser size={18} /> Candidatos
                </button>
                <button
                    onClick={() => {
                        setActiveTab("EMPRESA");
                        setBusca("");
                        setTermoBuscado("");
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "EMPRESA" ? "bg-white shadow-sm text-purple-700" : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <HiOutlineOfficeBuilding size={18} /> Empresas
                </button>
            </div>

            {/* BARRA DE BUSCA */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                <div className="relative flex-1">
                    <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleBusca()}
                        placeholder={activeTab === "CANDIDATO" ? "Buscar por nome ou e-mail de candidato..." : "Buscar por nome ou e-mail de usuário corporativo..."}
                    />
                </div>
                <button
                    onClick={handleBusca}
                    className="px-8 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                    Buscar
                </button>
            </div>

            {/* TABELA DE USUÁRIOS */}
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <HiOutlineUserGroup className={activeTab === "CANDIDATO" ? "text-blue-600" : "text-purple-600"} />
                        Usuários da Categoria: {activeTab === "CANDIDATO" ? "Candidatos" : "Empresas"}
                    </h3>
                </div>

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
                                    <td colSpan={4} className="p-10 text-center text-gray-400 font-bold animate-pulse">
                                        Buscando usuários...
                                    </td>
                                </tr>
                            ) : usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-gray-500 font-medium">
                                        Nenhum usuário encontrado com este filtro.
                                    </td>
                                </tr>
                            ) : (
                                usuarios.map((user: any) => (
                                    <tr key={user.id_usuario} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-4">
                                            <div className="flex flex-col">
                                                <span className={`font-bold text-sm ${user.status === "BLOQUEADO" ? "text-gray-400 line-through decoration-gray-300" : "text-gray-900"}`}>
                                                    {user.nome}
                                                </span>
                                                <span className="text-xs text-gray-500">{user.email}</span>
                                            </div>
                                        </td>

                                        <td className="px-8 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.status === "ATIVO" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>

                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-2 text-xs">
                                                <HiOutlineCalendar className="text-gray-300" size={14} />
                                                {user.ultimo_login ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-700">
                                                            {new Date(user.ultimo_login).toLocaleDateString("pt-BR")}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">
                                                            às {new Date(user.ultimo_login).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">Nunca acessou</span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-8 py-4">
                                            <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">

                                                {/* Ação 1: Reset de Senha Rápido */}
                                                <button
                                                    onClick={() => handleResetSenhaRapido(user.id_usuario, user.email)}
                                                    title="Enviar link de reset de senha"
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                >
                                                    <HiOutlineKey size={18} />
                                                </button>

                                                {/* Ação 2: Editar (Abre o modal que você já tem) */}
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsEditUserModalOpen(true);
                                                    }}
                                                    title="Editar Dados do Usuário"
                                                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                                                >
                                                    <HiOutlinePencilAlt size={18} />
                                                </button>

                                                {/* Ação 3: Alternar Status */}
                                                <button
                                                    onClick={() => handleToggleUserStatus(user.id_usuario, user.status)}
                                                    title={user.status === "ATIVO" ? "Bloquear Usuário" : "Ativar Usuário"}
                                                    className={`p-2 rounded-xl transition-all ${user.status === "ATIVO"
                                                        ? "text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                        : "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
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

            {/* Modal de Edição */}
            <ModalEditarUsuario
                isOpen={isEditUserModalOpen}
                onClose={() => {
                    setIsEditUserModalOpen(false);
                    setSelectedUser(null);
                }}
                usuario={selectedUser}
                onSuccess={() => fetchUsuarios()}
            />
        </div>
    );
}