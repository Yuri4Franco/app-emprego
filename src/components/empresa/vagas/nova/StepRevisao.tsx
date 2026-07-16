"use client";

import { useState, useEffect } from "react";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
    HiOutlineExclamationCircle,
    HiOutlineClipboardCopy,
    HiOutlineCheck,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineCurrencyDollar,
    HiOutlineClock,
    HiOutlineShieldCheck,
    HiOutlineSparkles
} from "react-icons/hi";
import { useAuth } from "@/src/AuthContext";

export function AlertaPagamentoNaoAssociada() {
    const { isAssociada } = useAuth();

    const [precoVaga, setPrecoVaga] = useState<number | null>(null);
    const [loadingPreco, setLoadingPreco] = useState(true);
    const [copiadoTipo, setCopiadoTipo] = useState<string | null>(null);

    // 1. Busca o preço oficial no backend
    useEffect(() => {
        const buscarPreco = async () => {
            // Se for associada, nem gastamos requisição, pois para ela é gratuito/isento
            if (isAssociada) {
                setLoadingPreco(false);
                return;
            }

            try {
                const res = await api.get("/precos");
                const dadosPreco = res.data?.data || res.data || {};

                // Converte para Number com fallback seguro para R$ 70,00 caso venha vazio
                const valorReal = Number(dadosPreco.preco_vaga_nao_associada ?? 70);
                setPrecoVaga(isNaN(valorReal) ? 70 : valorReal);
            } catch (error) {
                console.error("Erro ao buscar preço da vaga:", error);
                setPrecoVaga(70); // Fallback de segurança para não quebrar a tela
            } finally {
                setLoadingPreco(false);
            }
        };

        buscarPreco();
    }, [isAssociada]);

    // Função para copiar dados (WhatsApp ou E-mail)
    const copiarParaAreaDeTransferencia = (texto: string, tipo: string) => {
        navigator.clipboard.writeText(texto);
        setCopiadoTipo(tipo);
        toast.success(`${tipo} copiado para a área de transferência!`);

        setTimeout(() => {
            setCopiadoTipo(null);
        }, 3000);
    };

    // ✨ VERSÃO PREMIUM PARA EMPRESA ASSOCIADA
    if (isAssociada) {
        return (
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-50 border border-emerald-200/80 p-6 md:p-8 rounded-[32px] space-y-6 text-gray-800 animate-in fade-in duration-300 shadow-sm relative overflow-hidden">

                {/* Efeito visual de brilho no fundo */}
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>

                {/* CABEÇALHO DO ALERTA ASSOCIADO */}
                <div className="flex items-start gap-4 relative z-10">
                    <div className="w-12 h-12 bg-emerald-500/15 text-emerald-600 rounded-[20px] flex items-center justify-center shrink-0 mt-0.5">
                        <HiOutlineSparkles size={28} />
                    </div>
                    <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-200/60 text-emerald-900 rounded-full text-[11px] font-black uppercase tracking-widest">
                            <HiOutlineShieldCheck size={16} className="text-emerald-700" /> Benefício de Associada Ativo
                        </span>
                        <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">
                            Publicação 100% Gratuita!
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-medium">
                            Como reconhecimento pela sua parceria e vínculo ativo com a <strong>ACI-Panambi</strong>, sua empresa possui isenção total na divulgação de oportunidades na plataforma ACI Vagas.
                        </p>
                    </div>
                </div>

                <hr className="border-emerald-200/60 relative z-10" />

                {/* BLOCO DE DESTAQUE DO VALOR ISENTO */}
                <div className="bg-white/90 border border-emerald-100 p-5 rounded-[24px] flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 shadow-2xs">
                    <div className="space-y-0.5">
                        <span className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                            <HiOutlineCurrencyDollar size={18} className="text-emerald-600" /> Custo de Publicação
                        </span>
                        <p className="text-xs text-gray-500">
                            Beneficício exclusivo para empresas associadas da ACI-Panambi.
                        </p>
                    </div>

                    <div className="flex items-baseline gap-1.5 text-right">
                        <span className="text-xs font-bold text-gray-400 line-through">{precoVaga?.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-3xl font-black text-emerald-600 tracking-tight">
                            R$ 0,00
                        </span>
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md uppercase ml-1">
                            Isento
                        </span>
                    </div>
                </div>

                {/* RODAPÉ INFORMATIVO DO FLUXO */}
                <div className="text-xs text-emerald-900 font-medium text-center bg-emerald-100/60 py-3 px-4 rounded-2xl border border-emerald-200/40 relative z-10 flex items-center justify-center gap-2">
                    <HiOutlineClock className="text-emerald-700 shrink-0" size={18} />
                    <span>
                        Ao submeter esta oportunidade, ela entrará diretamente com o status <strong>Em Análise</strong> para verificação rápida da nossa equipe, sendo liberada em breve sem nenhuma burocracia financeira!
                    </span>
                </div>

            </div>
        );
    }

    // ✨ VERSÃO PARA EMPRESA NÃO ASSOCIADA
    return (
        <div className="bg-amber-50/90 border border-amber-200/80 p-6 md:p-8 rounded-[32px] space-y-6 text-gray-800 animate-in fade-in duration-300 shadow-sm">

            {/* CABEÇALHO DO ALERTA */}
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500/15 text-amber-600 rounded-[20px] flex items-center justify-center shrink-0 mt-0.5">
                    <HiOutlineExclamationCircle size={28} />
                </div>
                <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-200/60 text-amber-900 rounded-full text-[11px] font-black uppercase tracking-widest">
                        <HiOutlineClock size={14} /> Liberação via Comprovante
                    </span>
                    <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">
                        Informações sobre o Pagamento da Vaga
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-medium">
                        Como sua empresa não está associada à ACI-Panambi no momento, a publicação desta vaga passará por uma etapa de auditoria financeira. Ao clicar em <strong>"Publicar Vaga"</strong>, o anúncio ficará com o status <span className="text-amber-700 font-bold underline">Aguardando Pagamento</span>.
                    </p>
                </div>
            </div>

            <hr className="border-amber-200/60" />

            {/* BLOCO DE VALOR PUXADO DO BANCO */}
            <div className="bg-white/80 border border-amber-100 p-5 rounded-[24px] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-0.5">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                        Taxa Única de Publicação
                    </span>
                    <p className="text-xs text-gray-500">
                        Valor para divulgar sua oportunidade na ACI Vagas.
                    </p>
                </div>

                <div className="flex items-baseline gap-1 text-right">
                    {loadingPreco ? (
                        <div className="w-24 h-8 bg-gray-200 animate-pulse rounded-xl"></div>
                    ) : (
                        <>
                            <span className="text-sm font-bold text-gray-400">R$</span>
                            <span className="text-3xl font-black text-amber-600 tracking-tight">
                                {precoVaga?.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* INSTRUÇÕES E CONTATOS */}
            <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-700 uppercase tracking-widest">
                    Como efetuar o pagamento e liberar sua vaga:
                </h4>
                <p className="text-xs text-gray-600 font-medium">
                    Envie o pagamento e encaminhe o comprovante juntamente com o nome da sua empresa (ou título da vaga) para um dos nossos canais de atendimento financeiro abaixo:
                </p>

                {/* CANAIS DE ATENDIMENTO COM BOTÃO DE COPIAR */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">

                    {/* CARD WHATSAPP */}
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200/80 hover:border-emerald-300 transition-all group shadow-2xs">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                                <HiOutlinePhone size={20} />
                            </div>
                            <div className="overflow-hidden">
                                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">WhatsApp Financeiro</span>
                                <span className="text-xs font-bold text-gray-800 truncate">(55) 99169-6761</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => copiarParaAreaDeTransferencia("55991696761", "WhatsApp")}
                            className="p-2.5 bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 rounded-xl transition-all"
                            title="Copiar número"
                        >
                            {copiadoTipo === "WhatsApp" ? <HiOutlineCheck className="text-emerald-600" size={18} /> : <HiOutlineClipboardCopy size={18} />}
                        </button>
                    </div>

                    {/* CARD E-MAIL */}
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200/80 hover:border-blue-300 transition-all group shadow-2xs">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                <HiOutlineMail size={20} />
                            </div>
                            <div className="overflow-hidden">
                                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">E-mail Financeiro</span>
                                <span className="text-xs font-bold text-gray-800 truncate">financeiro@acipanambi.com.br</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => copiarParaAreaDeTransferencia("financeiro@acipanambi.com.br", "E-mail")}
                            className="p-2.5 bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-xl transition-all"
                            title="Copiar e-mail"
                        >
                            {copiadoTipo === "E-mail" ? <HiOutlineCheck className="text-blue-600" size={18} /> : <HiOutlineClipboardCopy size={18} />}
                        </button>
                    </div>

                </div>
            </div>

            <div className="text-[11px] text-gray-500 font-medium text-center bg-amber-100/50 py-2.5 px-4 rounded-xl">
                Assim que o financeiro confirmar o recebimento do seu comprovante, sua vaga mudará automaticamente para o status <strong>Em Análise</strong> e será analisada pela nossa equipe.
            </div>

        </div>
    );
}