"use client";

import { useState, useEffect } from "react";
import api from "@/src/services/api";
import {
    HiOutlineInformationCircle,
    HiOutlineKey,
    HiOutlineOfficeBuilding,
    HiOutlineLockClosed
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from "@/src/AuthContext";

interface AlertaCreditosCurriculoProps {
    creditosAtual?: number;
    isAssociada?: boolean;
    whatsappAci?: string;
}

export function AlertaCreditosCurriculo({
    whatsappAci = "5555992128613",
}: AlertaCreditosCurriculoProps) {
    const [precos, setPrecos] = useState<{
        preco_pacote_curriculo: number;
        qtd_curriculos_pacote: number;
    } | null>(null);
    const [isLoadingPrecos, setIsLoadingPrecos] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const { perfil, isAssociada, isLoading: authLoading } = useAuth();
    const creditosAtual = perfil?.empresa?.creditos_curriculos || 0;

    useEffect(() => {
        // Se ainda está carregando a sessão OU se já sabemos que é associada, não faz a requisição de preços
        if (authLoading || isAssociada) return;

        const carregarPrecos = async () => {
            try {
                const res = await api.get("/precos");
                const dados = res.data?.data || res.data;
                setPrecos({
                    preco_pacote_curriculo: Number(dados.preco_pacote_curriculo) || 50,
                    qtd_curriculos_pacote: Number(dados.qtd_curriculos_pacote) || 10,
                });
            } catch (error) {
                setPrecos({ preco_pacote_curriculo: 50, qtd_curriculos_pacote: 10 });
            } finally {
                setIsLoadingPrecos(false);
            }
        };

        carregarPrecos();
    }, [isAssociada, authLoading]);

    if (authLoading || isAssociada) return null;

    const handleContatoAci = () => {
        const texto = encodeURIComponent(
            `Olá! Sou da empresa *${perfil?.empresa?.nome_fantasia || "Não Associada"}* e gostaria de adquirir um pacote de créditos para desbloqueio de currículos no Banco de Talentos.`
        );
        window.open(`https://wa.me/${whatsappAci}?text=${texto}`, "_blank");
    };

    const precoFormatado = precos?.preco_pacote_curriculo.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });

    return (
        <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs animate-in fade-in duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

                {/* Lado Esquerdo: Identificação de Status e Regra da ACI */}
                <div className="flex items-start gap-3.5 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200/50">
                        <HiOutlineInformationCircle size={22} />
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        {/* Badges do Cabeçalho */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-200/70 text-slate-700 border border-slate-300/60">
                                <HiOutlineOfficeBuilding size={12} /> Perfil Não Associado
                            </span>
                        </div>

                        {/* Texto Explicativo Tom Institucional */}
                        <p className="text-xs sm:text-[13px] text-slate-600 font-medium leading-relaxed max-w-3xl">
                            A revelação de identidade e dados de contato para empresas não associadas é realizada via créditos de desbloqueio.
                        </p>

                        {/* Chip com o Valor do Lote */}
                        <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold shadow-2xs">
                                <strong className="text-slate-900">
                                    {isLoading ? "10 currículos" : `${precos?.qtd_curriculos_pacote} currículos`}
                                </strong>
                                {" "}por{" "}
                                <strong className="text-emerald-600">
                                    {isLoading ? "R$ 50,00" : precoFormatado}
                                </strong>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Lado Direito: Card de Saldo e Botão de Ação */}
                <div className="flex flex-col sm:flex-col items-center justify-between sm:justify-end gap-3.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200/80 shrink-0">

                    {/* Indicador de Saldo Visual */}
                    <div className="flex items-center gap-3 px-3.5 py-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                        <div className="flex flex-col text-right">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Seu Saldo
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                                Créditos Ativos
                            </span>
                        </div>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm text-white shadow-xs transition-colors ${creditosAtual > 0 ? "bg-blue-600" : "bg-slate-400"
                            }`}>
                            {creditosAtual}
                        </div>
                    </div>

                    {/* Botão CTA WhatsApp */}
                    <button
                        onClick={handleContatoAci}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm hover:shadow-emerald-600/20 cursor-pointer shrink-0"
                    >
                        <FaWhatsapp size={16} className="shrink-0" />
                        <span>Fale Conosco</span>
                    </button>

                </div>

            </div>
        </div>
    );
}