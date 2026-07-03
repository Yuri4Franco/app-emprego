"use client";

import Link from "next/link";
import { HiOutlineLockClosed, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from "react-icons/hi";
import { FaWhatsapp, FaLinkedin, FaGithub } from "react-icons/fa";

interface IdentidadeContatoProps {
    perfil: any;
    acessoLiberado: boolean;
    saldoCreditos: number;
    isUnlocking: boolean;
    onDesbloquear: () => void;
    idade: number | null;
}

export function CurriculoIdentidade({
    perfil,
    acessoLiberado,
    saldoCreditos,
    isUnlocking,
    onDesbloquear,
    idade,
}: IdentidadeContatoProps) {
    const nome = perfil?.nome || "Candidato";
    const objetivo = perfil?.objetivo_profissional || "";

    // ✨ LÓGICA DO ENDEREÇO: Filtra os vazios e une com vírgula automaticamente
    const partesEndereco = [
        perfil?.endereco_completo?.logradouro
            ? `${perfil.endereco_completo.logradouro}${perfil.endereco_completo.numero ? `, ${perfil.endereco_completo.numero}` : ''}`
            : null,
        perfil?.endereco_completo?.bairro,
        perfil?.endereco_completo?.cidade
            ? `${perfil.endereco_completo.cidade}${perfil.endereco_completo.uf ? `/${perfil.endereco_completo.uf}` : ''}`
            : null
    ].filter(Boolean); // O Boolean remove null, undefined e strings vazias

    const enderecoFormatado = partesEndereco.join(", ");

    return (
        <header className="flex flex-col md:flex-row print:flex-row gap-6 md:gap-8 lg:gap-10 items-center md:items-start border-b border-gray-100 print:border-gray-200 pb-8 mb-8 print:pb-6 print:mb-6">

            {/* FOTO (Com lógica de Blur) */}
            <div className="relative shrink-0">
                {perfil.foto_url && acessoLiberado ? (
                    <img
                        src={perfil.foto_url}
                        alt={nome}
                        className="w-28 h-28 md:w-32 md:h-32 print:w-28 print:h-28 rounded-full object-cover border border-gray-200 shadow-sm print:shadow-none print:border-gray-300"
                    />
                ) : (
                    <div className="w-28 h-28 md:w-32 md:h-32 print:w-28 print:h-28 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center relative overflow-hidden shrink-0 print:border-gray-300">
                        {!acessoLiberado && (
                            <div className="absolute inset-0 backdrop-blur-md bg-white/40 flex items-center justify-center z-20 print:hidden">
                                <HiOutlineLockClosed size={36} className="text-gray-400" />
                            </div>
                        )}
                        <span className="text-4xl font-black text-gray-300">
                            {nome.charAt(0)}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex-1 w-full text-center md:text-left pt-2">
                {/* TÍTULOS E CHIPS */}
                <div>
                    <h1 className="text-3xl md:text-4xl print:text-3xl font-black text-gray-900 tracking-tight">
                        {nome}
                    </h1>
                    {objetivo && (
                        <h2 className="text-base md:text-lg print:text-base font-medium text-gray-500 mt-1.5 leading-snug">
                            {objetivo}
                        </h2>
                    )}

                    {/* Informações Básicas (Idade, Gênero) */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3 print:mt-2">
                        {idade && <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100 print:border-gray-300">{idade} anos</span>}
                        {perfil.genero && <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100 print:border-gray-300">{perfil.genero}</span>}
                        {perfil.primeiro_emprego && <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 print:border-gray-300">1º Emprego</span>}
                    </div>

                    {/* ✨ ENDEREÇO (Público e Sempre Visível) */}
                    {enderecoFormatado && (
                        <div className="flex items-start justify-center md:justify-start gap-1.5 mt-4 text-sm print:text-[13px] text-gray-600 font-medium">
                            <HiOutlineLocationMarker className="text-gray-400 print:text-gray-500 shrink-0 mt-0.5" size={18} />
                            <span className="leading-relaxed text-left">{enderecoFormatado}</span>
                        </div>
                    )}
                </div>

                {/* CONTATOS PRIVADOS OU PAYWALL */}
                <div className="mt-5 pt-5 border-t border-gray-50 print:border-gray-100">
                    {acessoLiberado ? (
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-3 text-sm print:text-[13px] text-gray-600 font-medium">
                            {perfil.email && (
                                <div className="flex items-center gap-1.5">
                                    <HiOutlineMail className="text-gray-400 print:text-gray-500 shrink-0" size={18} />
                                    <a href={`mailto:${perfil.email}`} className="hover:text-blue-600 underline-offset-2 hover:underline">{perfil.email}</a>
                                </div>
                            )}
                            {perfil.whatsapp && (
                                <div className="flex items-center gap-1.5">
                                    <FaWhatsapp className="text-emerald-500 print:text-gray-500 shrink-0" size={18} />
                                    <a href={`https://wa.me/55${perfil.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="hover:text-emerald-600">{perfil.whatsapp}</a>
                                </div>
                            )}
                            {perfil.telefone && !perfil.whatsapp && (
                                <div className="flex items-center gap-1.5">
                                    <HiOutlinePhone className="text-gray-400 print:text-gray-500 shrink-0" size={18} />
                                    <span>{perfil.telefone}</span>
                                </div>
                            )}
                            {perfil.link_linkedin && (
                                <a href={perfil.link_linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                                    <FaLinkedin className="text-blue-600 print:text-gray-500 shrink-0" size={18} />
                                    <span>LinkedIn</span>
                                </a>
                            )}
                            {perfil.link_portfolio && (
                                <a href={perfil.link_portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                                    <FaGithub className="text-gray-800 print:text-gray-500 shrink-0" size={18} />
                                    <span>Portfólio</span>
                                </a>
                            )}
                        </div>
                    ) : (
                        /* PAYWALL DE DESBLOQUEIO DE CONTATO */
                        <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                            <div className="text-left">
                                <h3 className="text-sm font-black text-indigo-900 flex items-center gap-1.5">
                                    <HiOutlineLockClosed size={16} className="text-indigo-500" />
                                    Dados de Contato Ocultos
                                </h3>
                                <p className="text-xs text-indigo-700/80 font-medium mt-0.5">
                                    Desbloqueie para ver telefone, e-mail e redes sociais.
                                </p>
                            </div>

                            {saldoCreditos > 0 ? (
                                <button
                                    onClick={onDesbloquear}
                                    disabled={isUnlocking}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black text-xs transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-70 flex items-center justify-center whitespace-nowrap"
                                >
                                    {isUnlocking ? "Processando..." : "Desbloquear (1 Crédito)"}
                                </button>
                            ) : (
                                <Link
                                    href="/empresa/comprar-creditos"
                                    className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-black text-xs transition-colors text-center whitespace-nowrap"
                                >
                                    Comprar Créditos
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}