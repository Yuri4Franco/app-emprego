"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
    HiOutlineSearch,
    HiOutlineEye,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineClock,
    HiOutlineOfficeBuilding,
    HiOutlineBriefcase,
    HiOutlineX,
    HiOutlineCurrencyDollar // Ícone pro financeiro
} from "react-icons/hi";

// Tipagens atualizadas com a nova aba e nova ação
type ActiveTab = "EM_ANALISE" | "AGUARDANDO_PAGAMENTO" | "TODAS";
type ModeracaoAcao = "APROVAR" | "REPROVAR" | "CONFIRMAR_PAGAMENTO" | null;

interface ModeracaoState {
    isOpen: boolean;
    tipo: ModeracaoAcao;
    vaga: any | null;
}

export default function AdminVagasPage() {
    // A primeira aba agora é a EM_ANALISE
    const [activeTab, setActiveTab] = useState<ActiveTab>("EM_ANALISE");
    const [vagas, setVagas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [busca, setBusca] = useState("");
    const [termoBuscado, setTermoBuscado] = useState("");

    const [moderacao, setModeracao] = useState<ModeracaoState>({ isOpen: false, tipo: null, vaga: null });
    const [motivo, setMotivo] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const carregarVagas = useCallback(async () => {
        setIsLoading(true);
        try {
            if (activeTab === "EM_ANALISE") {
                const res = await api.get("/admin/vagas/pendentes");
                setVagas(res.data.data || []);
            } else if (activeTab === "AGUARDANDO_PAGAMENTO") {
                // Filtra as vagas aguardando pagamento usando a rota geral
                const res = await api.get("/admin/vagas", {
                    params: { status: "AGUARDANDO_PAGAMENTO" }
                });
                setVagas(res.data.dados || res.data.data || []);
            } else {
                const res = await api.get("/admin/vagas", {
                    params: { busca: termoBuscado || undefined }
                });
                setVagas(res.data.dados || res.data.data || []);
            }
        } catch (error) {
            console.error("Erro ao buscar vagas", error);
            toast.error("Erro ao carregar as vagas.");
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, termoBuscado]);

    useEffect(() => {
        carregarVagas();
    }, [carregarVagas]);

    const handleBusca = () => setTermoBuscado(busca);

    const formatarData = (isoDate: string) => {
        if (!isoDate) return "-";
        return new Date(isoDate).toLocaleDateString("pt-BR", {
            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
        });
    };

    // --- FUNÇÕES DOS MODAIS ---
    const abrirModalAcao = (vaga: any, tipo: ModeracaoAcao) => {
        setModeracao({ isOpen: true, tipo, vaga });
        setMotivo("");
    };

    const fecharModal = () => {
        setModeracao({ isOpen: false, tipo: null, vaga: null });
        setMotivo("");
    };

    const executarAcao = async () => {
        if (!moderacao.vaga || !moderacao.tipo) return;

        // Validação de motivo apenas para REPROVAR
        if (moderacao.tipo === "REPROVAR" && motivo.trim().length < 5) {
            toast.error("Por favor, informe um motivo válido para a reprovação.");
            return;
        }

        setIsSubmitting(true);
        try {
            // FLUXO 1: CONFIRMAR PAGAMENTO (Sem payload de ação)
            if (moderacao.tipo === "CONFIRMAR_PAGAMENTO") {
                await api.patch(`/admin/vagas/${moderacao.vaga.id_vaga}/confirmar-pagamento`);
                toast.success("Pagamento confirmado! A vaga foi enviada para moderação.");
            }
            // FLUXO 2: MODERAR TEXTO (Aprovar / Reprovar)
            else {
                await api.patch(`/admin/vagas/${moderacao.vaga.id_vaga}/moderacao`, {
                    acao: moderacao.tipo,
                    motivo: motivo.trim() || "não informado"
                });
                toast.success(
                    moderacao.tipo === "APROVAR"
                        ? "Vaga aprovada e publicada com sucesso!"
                        : "Vaga reprovada com sucesso."
                );
            }

            fecharModal();
            carregarVagas();

        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Erro ao processar a ação.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in relative">

            {/* HEADER E ABAS */}
            <div>
                <h1 className="text-3xl font-black text-gray-800 tracking-tight mb-6">Gestão de Vagas</h1>

                <div className="flex gap-4 border-b border-gray-200 overflow-x-auto pb-1 scrollbar-hide">
                    {/* 1. ABA DE MODERAÇÃO PRIMEIRO */}
                    <button
                        onClick={() => { setActiveTab("EM_ANALISE"); setBusca(""); setTermoBuscado(""); }}
                        className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap
              ${activeTab === "EM_ANALISE" ? "border-amber-500 text-amber-600" : "border-transparent text-gray-500 hover:text-gray-800"}
            `}
                    >
                        <HiOutlineClock size={18} />
                        Moderação de vagas
                        {activeTab === "EM_ANALISE" && vagas.length > 0 && (
                            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">{vagas.length}</span>
                        )}
                    </button>

                    {/* 2. ABA FINANCEIRA DEPOIS */}
                    <button
                        onClick={() => { setActiveTab("AGUARDANDO_PAGAMENTO"); setBusca(""); setTermoBuscado(""); }}
                        className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap
              ${activeTab === "AGUARDANDO_PAGAMENTO" ? "border-purple-500 text-purple-600" : "border-transparent text-gray-500 hover:text-gray-800"}
            `}
                    >
                        <HiOutlineCurrencyDollar size={18} />
                        Aguardando pagamento
                        {activeTab === "AGUARDANDO_PAGAMENTO" && vagas.length > 0 && (
                            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">{vagas.length}</span>
                        )}
                    </button>

                    {/* 3. TODAS AS VAGAS */}
                    <button
                        onClick={() => setActiveTab("TODAS")}
                        className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap
              ${activeTab === "TODAS" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-800"}
            `}
                    >
                        <HiOutlineBriefcase size={18} />
                        Todas as vagas
                    </button>
                </div>
            </div>

            {/* BARRA DE FERRAMENTAS (Aparece só na aba "TODAS") */}
            {activeTab === "TODAS" && (
                <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 animate-in slide-in-from-top-2">
                    <div className="flex-1 relative">
                        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleBusca()}
                            placeholder="Buscar por título ou empresa..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-blue-50 text-sm"
                        />
                    </div>
                    <button onClick={handleBusca} className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30">
                        Buscar
                    </button>
                </div>
            )}

            {/* TABELA DE VAGAS */}
            <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-black">
                                <th className="p-6">Vaga</th>
                                <th className="p-6">Empresa</th>
                                <th className="p-6">Criada em</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-gray-400 font-bold animate-pulse">
                                        Buscando vagas no sistema...
                                    </td>
                                </tr>
                            ) : vagas.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400 space-y-2">
                                            <HiOutlineCheckCircle size={48} className={
                                                activeTab === "EM_ANALISE" ? "text-amber-400" :
                                                    activeTab === "AGUARDANDO_PAGAMENTO" ? "text-purple-400" : "text-gray-300"
                                            } />
                                            <p className="font-bold text-lg">
                                                {activeTab === "TODAS" ? "Nenhuma vaga encontrada." : "Tudo limpo por aqui!"}
                                            </p>
                                            <p className="text-sm">
                                                {activeTab === "TODAS" ? "Tente buscar com outro termo." : "Não há pendências nesta fila no momento."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                vagas.map((vaga) => (
                                    <tr key={vaga.id_vaga} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800 line-clamp-1">{vaga.titulo}</span>
                                                <span className="text-xs text-gray-400 font-medium mt-1">ID: #{vaga.id_vaga} • {vaga.modelo_trabalho}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                                <HiOutlineOfficeBuilding className="text-gray-400" />
                                                {vaga.empresa?.nome_fantasia || "Não informada"}
                                            </div>
                                        </td>
                                        <td className="p-6 text-xs text-gray-500 font-medium">
                                            {formatarData(vaga.criado_em || vaga.data_publicacao)}
                                        </td>
                                        <td className="p-6">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                        ${vaga.status === 'ATIVA' ? 'bg-emerald-100 text-emerald-700' :
                                                    vaga.status === 'EM_ANALISE' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                        vaga.status === 'AGUARDANDO_PAGAMENTO' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                                            vaga.status === 'FECHADA' ? 'bg-gray-100 text-gray-600' :
                                                                'bg-red-100 text-red-700'}`}
                                            >
                                                {vaga.status.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors" title="Visualizar Detalhes">
                                                    <HiOutlineEye size={20} />
                                                </button>

                                                {/* BOTÕES: AGUARDANDO PAGAMENTO */}
                                                {activeTab === "AGUARDANDO_PAGAMENTO" && (
                                                    <button
                                                        onClick={() => abrirModalAcao(vaga, "CONFIRMAR_PAGAMENTO")}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 hover:text-purple-700 rounded-lg transition-colors border border-purple-100"
                                                        title="Confirmar Recebimento"
                                                    >
                                                        <HiOutlineCheckCircle size={16} /> Confirmar
                                                    </button>
                                                )}

                                                {/* BOTÕES: EM ANÁLISE */}
                                                {activeTab === "EM_ANALISE" && (
                                                    <>
                                                        <button
                                                            onClick={() => abrirModalAcao(vaga, "APROVAR")}
                                                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Aprovar Vaga"
                                                        >
                                                            <HiOutlineCheckCircle size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => abrirModalAcao(vaga, "REPROVAR")}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Rejeitar Vaga"
                                                        >
                                                            <HiOutlineXCircle size={20} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL UNIVERSAL DE AÇÕES */}
            {moderacao.isOpen && moderacao.vaga && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-black text-gray-800">
                                {moderacao.tipo === "APROVAR" ? "Aprovar Vaga" :
                                    moderacao.tipo === "REPROVAR" ? "Reprovar Vaga" :
                                        "Confirmar Pagamento"}
                            </h3>
                            <button onClick={fecharModal} className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-full transition-colors">
                                <HiOutlineX size={20} />
                            </button>
                        </div>

                        <div className="mb-6 space-y-2">
                            <p className="text-sm text-gray-500 font-medium">Vaga selecionada:</p>
                            <p className="font-bold text-lg text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                {moderacao.vaga.titulo} <br />
                                <span className="text-sm font-medium text-gray-500">{moderacao.vaga.empresa?.nome_fantasia}</span>
                            </p>
                        </div>

                        {/* MENSAGEM: CONFIRMAÇÃO DE PAGAMENTO */}
                        {moderacao.tipo === "CONFIRMAR_PAGAMENTO" && (
                            <div className="mb-8 bg-purple-50 border border-purple-100 p-4 rounded-2xl">
                                <p className="text-sm text-purple-800 font-medium">
                                    Tem certeza que o pagamento no valor avulso foi identificado na conta da ACI?
                                    Ao confirmar, esta vaga será movida para a fila de "Moderação de Textos".
                                </p>
                            </div>
                        )}

                        {/* INPUT: MOTIVO DE REPROVAÇÃO */}
                        {moderacao.tipo === "REPROVAR" && (
                            <div className="mb-8 space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">
                                    Motivo da Reprovação <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                    placeholder="Explique para a empresa o que precisa ser corrigido nesta vaga..."
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl h-32 outline-none text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none transition-all"
                                />
                                <p className="text-xs text-gray-400 ml-1">A empresa será notificada e, se for não-associada, o crédito será estornado.</p>
                            </div>
                        )}

                        {/* MENSAGEM: APROVAÇÃO */}
                        {moderacao.tipo === "APROVAR" && (
                            <div className="mb-8 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                                <p className="text-sm text-emerald-800 font-medium">
                                    Ao aprovar, esta vaga ficará visível publicamente na plataforma para todos os candidatos imediatamente.
                                </p>
                            </div>
                        )}

                        {/* BOTÕES DO MODAL */}
                        <div className="flex gap-4">
                            <button
                                onClick={fecharModal}
                                disabled={isSubmitting}
                                className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={executarAcao}
                                disabled={isSubmitting}
                                className={`flex-1 py-4 font-bold text-white rounded-2xl transition-all shadow-lg
                                    ${moderacao.tipo === "APROVAR" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30" :
                                        moderacao.tipo === "CONFIRMAR_PAGAMENTO" ? "bg-purple-600 hover:bg-purple-700 shadow-purple-500/30" :
                                            "bg-red-500 hover:bg-red-600 shadow-red-500/30"}
                                    ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                                `}
                            >
                                {isSubmitting
                                    ? "Processando..."
                                    : moderacao.tipo === "APROVAR" ? "Confirmar Aprovação" :
                                        moderacao.tipo === "CONFIRMAR_PAGAMENTO" ? "Confirmar Recebimento" :
                                            "Confirmar Reprovação"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}