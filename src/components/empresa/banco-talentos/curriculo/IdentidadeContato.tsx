"use client";

import Link from "next/link";
import {
  HiOutlineLockClosed,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineUser,
  HiGlobeAlt,
} from "react-icons/hi";
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

  const partesEndereco = [
    perfil?.endereco_completo?.logradouro
      ? `${perfil.endereco_completo.logradouro}${perfil.endereco_completo.numero ? `, ${perfil.endereco_completo.numero}` : ""}`
      : null,
    perfil?.endereco_completo?.bairro,
    perfil?.endereco_completo?.cidade
      ? `${perfil.endereco_completo.cidade}${perfil.endereco_completo.uf ? `/${perfil.endereco_completo.uf}` : ""}`
      : null,
  ].filter(Boolean);

  const enderecoFormatado = partesEndereco.join(", ");

  return (
    <header className="relative bg-white border border-gray-100 rounded-[2.5rem] p-6 sm:p-8 lg:p-10 mb-8 shadow-sm overflow-hidden print:p-0 print:mb-6 print:border-none print:rounded-none print:shadow-none print:bg-transparent">

      {/* Background Decorativo (Oculto no Print) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-50/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none print:hidden"></div>

      <div className="relative z-10 space-y-6 print:space-y-4">

        {/* PARTE 1: FOTO + NOME (Layout 100% de largura para o nome voar livre) */}
        <div className="flex flex-col sm:flex-row print:flex-row gap-6 md:gap-8 items-center sm:items-start print:items-center text-center sm:text-left print:text-left w-full">

          {/* FOTO */}
          <div className="shrink-0 relative">
            {perfil.foto_url && acessoLiberado ? (
              <img
                src={perfil.foto_url}
                alt={nome}
                className="w-24 h-24 md:w-28 md:h-28 print:w-20 print:h-20 object-cover rounded-3xl border-4 border-white shadow-md bg-gray-50 print:rounded-xl print:border-2 print:border-gray-200 print:shadow-none"
              />
            ) : (
              <div className="w-24 h-24 md:w-28 md:h-28 print:w-20 print:h-20 rounded-3xl print:rounded-xl bg-gray-50 border-4 border-white shadow-md flex items-center justify-center relative overflow-hidden shrink-0 print:border-2 print:border-gray-200 print:shadow-none">
                {!acessoLiberado && (
                  <div className="absolute inset-0 backdrop-blur-md bg-white/60 flex items-center justify-center z-20 print:hidden">
                    <HiOutlineLockClosed size={28} className="text-gray-400" />
                  </div>
                )}
                <span className="text-3xl print:text-2xl font-black text-gray-300">
                  {nome.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* DADOS DE IDENTIFICAÇÃO */}
          <div className="flex-1 space-y-3 print:space-y-1.5 w-full">
            <div>
              {/* O nome agora ocupa toda a largura disponível da página */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-none print:text-2xl">
                {nome}
              </h1>
            </div>

            {/* Badges Demográficas e Endereço */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 print:gap-1.5">
              {(idade || perfil.genero) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100 print:bg-transparent print:border-none print:p-0 print:text-[11px] print:text-gray-500">
                  <HiOutlineUser className="text-gray-400 print:hidden" size={14} />
                  {idade && `${idade} anos`}{idade && perfil.genero && " • "}{perfil.genero}
                </span>
              )}

              {perfil.primeiro_emprego && (
                <span className="inline-flex px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 print:bg-transparent print:border-none print:p-0 print:text-[11px] print:text-gray-500 print:normal-case print:tracking-normal print:font-bold">
                  {idade || perfil.genero ? "• 1º Emprego" : "1º Emprego"}
                </span>
              )}

              {enderecoFormatado && (
                <span className="flex items-center justify-center gap-1 px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-100 sm:w-auto text-left print:bg-transparent print:border-none print:p-0 print:text-[11px] print:text-gray-500">
                  <span className="print:inline hidden text-gray-400">•</span>
                  <HiOutlineLocationMarker className="text-gray-400 print:hidden" size={14} />
                  {enderecoFormatado}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* PARTE 2: CONTATOS (Estilo Horizontal Premium na tela, sem caixas feias no print) */}
        <div className="pt-4 border-t border-gray-100 print:border-t-2 print:border-gray-200 print:pt-3">
          {acessoLiberado ? (
            <div className="w-full">
              {/* Título exigido para a versão impressa */}
              <h3 className="hidden print:block text-xs font-black uppercase tracking-wider text-gray-900 mb-2">
                Informações para Contato
              </h3>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-3 text-sm print:text-xs text-gray-600 font-medium">
                {perfil.email && (
                  <div className="flex items-center gap-2 group cursor-pointer">
                    <HiOutlineMail className="text-gray-400 group-hover:text-blue-600 print:text-gray-600 shrink-0" size={16} />
                    <a href={`mailto:${perfil.email}`} className="group-hover:text-blue-600 font-bold print:font-medium transition-colors">{perfil.email}</a>
                  </div>
                )}

                {perfil.whatsapp && (
                  <div className="flex items-center gap-2 group cursor-pointer">
                    <FaWhatsapp className="text-emerald-500 print:text-gray-600 shrink-0" size={16} />
                    <a href={`https://wa.me/55${perfil.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="group-hover:text-emerald-700 font-bold print:font-medium transition-colors">{perfil.whatsapp}</a>
                  </div>
                )}

                {perfil.telefone && !perfil.whatsapp && (
                  <div className="flex items-center gap-2">
                    <HiOutlinePhone className="text-gray-400 print:text-gray-600 shrink-0" size={16} />
                    <span className="font-bold print:font-medium text-gray-800">{perfil.telefone}</span>
                  </div>
                )}

                {perfil.link_linkedin && (
                  <div className="flex items-center gap-2 group cursor-pointer">
                    <FaLinkedin className="text-[#0A66C2] print:text-gray-600 shrink-0" size={15} />
                    <a href={perfil.link_linkedin} target="_blank" rel="noreferrer" className="group-hover:text-blue-600 font-bold print:font-medium transition-colors print:truncate print:max-w-[180px]">
                      <span className="print:hidden">LinkedIn</span>
                      <span className="hidden print:inline">{perfil.link_linkedin.replace(/^https?:\/\/(www\.)?/, "")}</span>
                    </a>
                  </div>
                )}

                {perfil.link_portfolio && (
                  <div className="flex items-center gap-2 group cursor-pointer">
                    <FaGithub className="text-gray-900 print:text-gray-600 shrink-0" size={15} />
                    <a href={perfil.link_portfolio} target="_blank" rel="noreferrer" className="group-hover:text-gray-700 font-bold print:font-medium transition-colors print:truncate print:max-w-[180px]">
                      <span className="print:hidden">Portfólio</span>
                      <span className="hidden print:inline">{perfil.link_portfolio.replace(/^https?:\/\/(www\.)?/, "")}</span>
                    </a>
                  </div>
                )}

                {perfil.link_outro && (
                  <div className="flex items-center gap-2 group cursor-pointer">
                    <HiGlobeAlt  className="text-gray-900 print:text-gray-600 shrink-0" size={15} />
                    <a href={perfil.link_outro} target="_blank" rel="noreferrer" className="group-hover:text-gray-700 font-bold print:font-medium transition-colors print:truncate print:max-w-[180px]">
                      <span className="print:hidden">Outro</span>
                      <span className="hidden print:inline">{perfil.link_outro.replace(/^https?:\/\/(www\.)?/, "")}</span>
                    </a>  
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* PAYWALL COMPACTO (Desaparece na impressão) */
            <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100/60 shadow-sm print:hidden flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
              <div className="text-left flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100/60 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                  <HiOutlineLockClosed size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-indigo-900">Informações para Contato Protegidas</h3>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">Libere o currículo para visualizar os canais de comunicação direta.</p>
                </div>
              </div>

              {saldoCreditos > 0 ? (
                <button
                  onClick={onDesbloquear}
                  disabled={isUnlocking}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-xs transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center whitespace-nowrap"
                >
                  {isUnlocking ? "Processando..." : "Desbloquear (1 Crédito)"}
                </button>
              ) : (
                <Link
                  href="/empresa/comprar-creditos"
                  className="w-full sm:w-auto px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-xs transition-colors text-center block shadow-sm whitespace-nowrap"
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