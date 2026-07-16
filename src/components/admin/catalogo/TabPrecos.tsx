"use client";

import { useState, useEffect } from "react";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
    HiOutlineCurrencyDollar,
    HiOutlineSave,
    HiOutlineRefresh,
    HiOutlineInformationCircle,
    HiOutlineDocumentText
} from "react-icons/hi";
import { ButtonType } from "@/src/components/ButtonType";

// ✨ DICIONÁRIO DE CAMPOS: Mapeia o banco de dados para uma interface humanizada
const CONFIG_CAMPOS: Record<string, { label: string; descricao: string; tipo: "moeda" | "inteiro" }> = {
    preco_vaga_nao_associada: {
        label: "Vaga Avulsa (Não Associada)",
        descricao: "Valor cobrado por publicação para empresas que não associadas da ACI-Panambi.",
        tipo: "moeda",
    },
    preco_vaga_associada: {
        label: "Vaga para Associada",
        descricao: "Valor por vaga para associados da ACI-Panambi (geralmente gratuito / R$ 0,00).",
        tipo: "moeda",
    },
    preco_pacote_curriculo: {
        label: "Pacote de Currículos",
        descricao: "Preço cobrado pelo pacote avulso de liberação de contatos.",
        tipo: "moeda",
    },
    qtd_curriculos_pacote: {
        label: "Qtd. de Currículos no Pacote",
        descricao: "Número de desbloqueios inclusos ao comprar o pacote acima.",
        tipo: "inteiro",
    },
};

export function TabPrecos() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [precos, setPrecos] = useState<Record<string, any>>({});

    const carregarPrecos = async () => {
        setLoading(true);
        try {
            const res = await api.get("/precos");
            setPrecos(res.data?.data || res.data || {});
        } catch (error) {
            toast.error("Erro ao carregar a tabela de preços.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarPrecos();
    }, []);

    const handleChange = (chave: string, valor: string) => {
        setPrecos((prev) => ({
            ...prev,
            [chave]: valor,
        }));
    };

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const toastId = toast.loading("Atualizando tabela de preços...");

        try {
            const payload: Record<string, any> = {};
            Object.keys(precos).forEach((key) => {
                const val = precos[key];
                // Converte corretamente para número antes de mandar pro Prisma
                payload[key] = !isNaN(Number(val)) && val !== "" ? Number(val) : val;
            });

            await api.put("/admin/precos", payload);
            toast.success("Preços atualizados com sucesso!", { id: toastId });
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Erro ao atualizar os preços.", {
                id: toastId,
            });
        } finally {
            setSaving(false);
        }
    };

    // Fallback caso adicione um campo novo no banco que não esteja no dicionário
    const formatarLabelFallback = (texto: string) => {
        return texto.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-gray-400">Carregando configurações financeiras...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSalvar} className="space-y-8 animate-in fade-in duration-300">

            {/* CABEÇALHO */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <HiOutlineCurrencyDollar className="text-emerald-500" size={28} />
                        Tabela de Preços e Taxas
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Defina os valores cobrados pelo portal. As alterações refletem imediatamente nos próximos checkouts.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={carregarPrecos}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-all w-fit"
                >
                    <HiOutlineRefresh size={16} /> Recarregar
                </button>
            </div>

            {/* ALERTA MASTER */}
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3">
                <HiOutlineInformationCircle className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                    <strong>Painel Exclusivo Master:</strong> A edição destes valores altera a regra de cobrança de todo o sistema. Certifique-se de conferir as casas decimais (use ponto ou vírgula conforme o padrão do navegador) antes de salvar.
                </p>
            </div>

            {/* GRID DE CAMPOS */}
            {Object.keys(precos).length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-medium text-sm">
                    Nenhuma configuração encontrada no banco de dados.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(precos).map(([chave, valor]) => {
                        // Ignora campos de controle do Prisma
                        if (["id", "created_at", "updated_at", "atualizado_em"].includes(chave)) return null;

                        const config = CONFIG_CAMPOS[chave];
                        const isMoeda = config ? config.tipo === "moeda" : true;

                        return (
                            <div
                                key={chave}
                                className="p-6 bg-gray-50/80 rounded-[28px] border border-gray-100/80 space-y-3 focus-within:border-emerald-400 focus-within:bg-white focus-within:shadow-md transition-all duration-200"
                            >
                                <div>
                                    <label className="block text-sm font-black text-gray-800">
                                        {config ? config.label : formatarLabelFallback(chave)}
                                    </label>
                                    {config && (
                                        <p className="text-xs text-gray-400 mt-0.5 font-medium leading-snug">
                                            {config.descricao}
                                        </p>
                                    )}
                                </div>

                                <div className="relative mt-2">
                                    {/* Ícone ou Prefixo dependendo do tipo do campo */}
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm flex items-center gap-1">
                                        {isMoeda ? "R$" : <HiOutlineDocumentText size={18} className="text-gray-400" />}
                                    </span>

                                    <input
                                        type="number"
                                        step={isMoeda ? "0.01" : "1"}
                                        min="0"
                                        value={valor ?? ""}
                                        onChange={(e) => handleChange(chave, e.target.value)}
                                        className="w-full pl-12 pr-14 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none text-lg font-black text-gray-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                                        placeholder={isMoeda ? "0.00" : "0"}
                                    />

                                    {/* Sufixo visual para quantidade */}
                                    {!isMoeda && (
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            unid.
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* AÇÕES */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
                <ButtonType
                    type="submit"
                    disabled={saving}
                    className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-[20px] shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                    {saving ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <HiOutlineSave size={20} /> Salvar Alterações
                        </>
                    )}
                </ButtonType>
            </div>
        </form>
    );
}