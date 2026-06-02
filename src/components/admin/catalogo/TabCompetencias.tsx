"use client";

import { useState, useEffect } from "react";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import { HiOutlineCheck, HiOutlineX, HiOutlinePencil, HiOutlineCollection, HiOutlineSearch } from "react-icons/hi";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";

interface Competencia {
    id_competencia: number;
    nome: string;
    status?: string;
}

export default function TabCompetencias() {
    const [subTab, setSubTab] = useState<"aprovadas" | "pendentes">("pendentes");

    const [aprovadas, setAprovadas] = useState<Competencia[]>([]);
    const [pendentes, setPendentes] = useState<Competencia[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Estados do Modal de Edição / Atribuição
    const [modalOpen, setModalOpen] = useState(false);
    const [editingComp, setEditingComp] = useState<Competencia | null>(null);
    const [novoNome, setNovoNome] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        setIsLoading(true);
        try {
            const [resAprovadas, resPendentes] = await Promise.all([
                api.get("/taxonomia/competencias"),
                api.get("/admin/competencias/pendentes")
            ]);
            setAprovadas(resAprovadas.data?.data || resAprovadas.data || []);
            setPendentes(resPendentes.data?.data || resPendentes.data || []);
        } catch (error) {
            toast.error("Erro ao carregar as competências.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAprovar = async (id: number) => {
        const loadingToast = toast.loading("Aprovando...");
        try {
            await api.patch(`/admin/competencias/${id}/aprovar`);
            toast.success("Competência aprovada e adicionada ao catálogo!", { id: loadingToast });
            carregarDados();
        } catch (error) {
            toast.error("Erro ao aprovar competência.", { id: loadingToast });
        }
    };

    const handleRejeitar = async (id: number) => {
        if (!confirm("Tem certeza que deseja rejeitar e excluir esta sugestão?")) return;

        const loadingToast = toast.loading("Rejeitando...");
        try {
            await api.patch(`/admin/competencias/${id}/rejeitar`);
            toast.success("Sugestão rejeitada.", { id: loadingToast });
            carregarDados();
        } catch (error) {
            toast.error("Erro ao rejeitar competência.", { id: loadingToast });
        }
    };

    const abrirEdicao = (comp: Competencia) => {
        setEditingComp(comp);
        setNovoNome(comp.nome);
        setModalOpen(true);
        setIsDropdownOpen(false);
    };

    const handleEditarEAprovar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingComp || !novoNome.trim()) return;

        setIsSaving(true);
        const loadingToast = toast.loading(isExactMatch ? "Atribuindo e mesclando..." : "Salvando e aprovando...");

        try {
            await api.put(`/admin/competencias/${editingComp.id_competencia}/editar`, {
                novo_nome: novoNome.trim()
            });
            toast.success(isExactMatch ? "Sugestão mesclada com sucesso!" : "Competência ajustada e aprovada!", { id: loadingToast });
            setModalOpen(false);
            carregarDados();
        } catch (error) {
            toast.error("Erro ao processar competência.", { id: loadingToast });
        } finally {
            setIsSaving(false);
        }
    };

    // LÓGICA DO AUTOCOMPLETE E MATCHING
    const filteredAprovadas = aprovadas.filter(c =>
        c.nome.toLowerCase().includes(novoNome.trim().toLowerCase()) &&
        c.nome.toLowerCase() !== editingComp?.nome.toLowerCase()
    );

    // Verifica se o nome digitado bate EXATAMENTE com algum que já existe (case insensitive)
    const isExactMatch = aprovadas.some(c => c.nome.toLowerCase() === novoNome.trim().toLowerCase());

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                Carregando catálogo...
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">

            {/* HEADER DAS SUB-TABS */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex gap-4">
                    <button
                        onClick={() => setSubTab("pendentes")}
                        className={`pb-4 px-2 text-sm font-black border-b-2 transition-all ${subTab === "pendentes"
                            ? "border-blue-600 text-blue-700"
                            : "border-transparent text-gray-500 hover:text-gray-800"
                            }`}
                    >
                        Sugestões Pendentes
                        {pendentes.length > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] bg-red-100 text-red-700">
                                {pendentes.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setSubTab("aprovadas")}
                        className={`pb-4 px-2 text-sm font-black border-b-2 transition-all ${subTab === "aprovadas"
                            ? "border-blue-600 text-blue-700"
                            : "border-transparent text-gray-500 hover:text-gray-800"
                            }`}
                    >
                        Catálogo Oficial
                    </button>
                </div>
            </div>

            {/* LISTAGEM PENDENTES */}
            {subTab === "pendentes" && (
                <div className="space-y-4">
                    {pendentes.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-[24px] border border-gray-100 dashed">
                            <HiOutlineCheck className="mx-auto text-4xl text-emerald-400 mb-3" />
                            <h3 className="text-lg font-black text-gray-800">Tudo limpo por aqui!</h3>
                            <p className="text-gray-500 text-sm">Não há novas habilidades sugeridas pelos usuários.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendentes.map((comp) => (
                                <div key={comp.id_competencia} className="flex flex-col justify-between p-5 bg-white border border-orange-100 shadow-sm rounded-[20px] hover:border-orange-300 transition-all group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-1 rounded-md mb-2 inline-block">
                                                Sugerida
                                            </span>
                                            <h4 className="font-bold text-gray-900 text-base">{comp.nome}</h4>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-50">
                                        <button
                                            onClick={() => handleAprovar(comp.id_competencia)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 hover:bg-emerald-500 text-emerald-700 hover:text-white rounded-xl text-xs font-bold transition-colors"
                                        >
                                            <HiOutlineCheck size={16} /> Aprovar
                                        </button>
                                        <button
                                            onClick={() => abrirEdicao(comp)}
                                            className="flex items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors"
                                            title="Editar ou Atribuir a uma existente"
                                        >
                                            <HiOutlinePencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleRejeitar(comp.id_competencia)}
                                            className="flex items-center justify-center p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                                            title="Rejeitar sugestão"
                                        >
                                            <HiOutlineX size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* LISTAGEM APROVADAS (CATÁLOGO) */}
            {subTab === "aprovadas" && (
                <div>
                    <div className="bg-gray-50 p-4 rounded-[20px] border border-gray-100 flex items-center gap-3 mb-6">
                        <HiOutlineCollection className="text-gray-400 text-xl" />
                        <p className="text-sm font-medium text-gray-600">
                            Estas são as <b>{aprovadas.length}</b> habilidades disponíveis para escolha automática na plataforma.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {aprovadas.map((comp) => (
                            <span key={comp.id_competencia} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-full shadow-sm hover:border-blue-300 transition-colors cursor-default">
                                {comp.nome}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL DE EDIÇÃO E ATRIBUIÇÃO */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
                    <form
                        onSubmit={handleEditarEAprovar}
                        className="bg-white rounded-[32px] shadow-xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200"
                    >
                        <h2 className="text-xl font-black text-gray-900 mb-2">Ajustar ou Atribuir</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Você pode corrigir o nome digitado pelo usuário ou buscar uma competência que já existe para mesclar os dados.
                        </p>

                        <div className="relative">
                            <label className="text-xs font-bold text-gray-700 ml-1">Nome da Competência</label>
                            <div className="relative mt-1">
                                <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={novoNome}
                                    onChange={(e) => {
                                        setNovoNome(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    placeholder="Digite para corrigir ou busque..."
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                />
                            </div>

                            {/* DROPDOWN DE SUGESTÕES DO CATÁLOGO */}
                            {isDropdownOpen && novoNome.trim() && filteredAprovadas.length > 0 && !isExactMatch && (
                                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-[20px] shadow-2xl max-h-48 overflow-y-auto overflow-hidden">
                                    <div className="px-4 py-2 bg-blue-50/50 border-b border-gray-50 text-[10px] font-black text-blue-800 uppercase tracking-widest">
                                        Atribuir a existente no catálogo:
                                    </div>
                                    {filteredAprovadas.map(c => (
                                        <button
                                            key={c.id_competencia}
                                            type="button"
                                            onClick={() => {
                                                setNovoNome(c.nome);
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-5 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-50 last:border-0"
                                        >
                                            {c.nome}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ALERTA DE MERGE (ATRIBUIÇÃO) */}
                        <div className={`mt-6 p-4 rounded-[20px] border transition-all ${isExactMatch
                                ? "bg-amber-50 border-amber-200"
                                : "bg-gray-50 border-transparent opacity-0 h-0 p-0 overflow-hidden"
                            }`}>
                            <div className="flex gap-3 items-start">
                                <span className="text-xl mt-0.5">💡</span>
                                <div>
                                    <h4 className="text-sm font-black text-amber-900">Mesclar Competência</h4>
                                    <p className="text-xs text-amber-800/80 mt-1 font-medium leading-relaxed">
                                        Esta competência já existe no catálogo oficial. Ao continuar, os candidatos associados à sugestão atual serão transferidos automaticamente.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-8">
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="flex-1 py-4 text-sm font-bold text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-2xl transition-colors"
                            >
                                Cancelar
                            </button>

                            <ButtonType
                                type="submit"
                                disabled={isSaving || !novoNome.trim()}
                                className={`flex-1 py-4 rounded-2xl transition-all ${isExactMatch ? "!bg-amber-500 hover:!bg-amber-600 shadow-amber-500/20" : ""}`}
                            >
                                {isSaving
                                    ? "Processando..."
                                    : isExactMatch
                                        ? "Atribuir e Mesclar"
                                        : "Salvar e Aprovar"
                                }
                            </ButtonType>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
}