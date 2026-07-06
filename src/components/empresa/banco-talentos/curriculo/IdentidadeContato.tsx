"use client";

import Link from "next/link";
import {
  HiOutlineLockClosed,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineUser,
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
    <header className="relative bg-white border border-gray-100 rounded-3xl p-6 md:p-8 mb-8 shadow-sm print:bg-transparent print:shadow-none print:border-none print:border-b print:border-gray-300 print:rounded-none print:p-0 print:pb-8 print:mb-8 overflow-hidden">
      {/* Decoração sutil de fundo (Oculta na impressão) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-50/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none print:hidden"></div>

      <div className="relative z-10 flex flex-col lg:flex-row print:flex-row gap-8 lg:gap-12 print:gap-8 items-start justify-between">
        {/* LADO ESQUERDO: FOTO + TÍTULOS + BADGES */}
        <div className="flex flex-col sm:flex-row print:flex-row gap-6 md:gap-8 print:gap-6 items-center sm:items-start print:items-center text-center sm:text-left print:text-left w-full lg:w-[65%] print:w-auto print:flex-1">
          {/* FOTO */}
          <div className="shrink-0 relative">
            {perfil.foto_url && acessoLiberado ? (
              <img
                src={perfil.foto_url}
                alt={nome}
                className="w-32 h-32 md:w-36 md:h-36 print:w-24 print:h-24 rounded-[2rem] print:rounded-2xl object-cover border-4 border-white shadow-lg bg-gray-50 print:border-gray-200 print:border-[3px] print:shadow-none"
              />
            ) : (
              <div className="w-32 h-32 md:w-36 md:h-36 print:w-24 print:h-24 rounded-[2rem] print:rounded-2xl bg-gray-50 border-4 border-white shadow-lg flex items-center justify-center relative overflow-hidden shrink-0 print:border-gray-200 print:border-[3px] print:shadow-none">
                {!acessoLiberado && (
                  <div className="absolute inset-0 backdrop-blur-md bg-white/60 flex items-center justify-center z-20 print:hidden">
                    <HiOutlineLockClosed size={36} className="text-gray-400" />
                  </div>
                )}
                <span className="text-4xl print:text-3xl font-black text-gray-300">
                  {nome.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* DADOS PRINCIPAIS */}
          <div className="flex-1 space-y-4 print:space-y-2 pt-1">
            <div>
              <h1 className="text-xl md:text-2xl print:text-2xl font-black text-gray-900 tracking-tight leading-none">
                {nome}
              </h1>
            </div>

            {/* Badges Demográficas e Endereço */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start print:justify-start gap-2 print:gap-1.5">
              {(idade || perfil.genero) && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 print:px-2 print:py-1 bg-gray-50 print:bg-transparent text-gray-600 text-xs print:text-[11px] font-bold rounded-xl print:rounded border border-gray-100 print:border-gray-300">
                  <HiOutlineUser
                    className="text-gray-400 print:text-gray-500"
                    size={14}
                  />
                  {idade && `${idade} anos`}
                  {idade && perfil.genero && " • "}
                  {perfil.genero}
                </span>
              )}

              {perfil.primeiro_emprego && (
                <span className="px-3 py-1.5 print:px-2 print:py-1 bg-emerald-50 print:bg-transparent text-emerald-700 print:text-gray-700 text-[10px] print:text-[11px] font-black print:font-bold uppercase tracking-widest print:tracking-normal rounded-xl print:rounded border border-emerald-100 print:border-gray-300">
                  1º Emprego
                </span>
              )}

              {enderecoFormatado && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 print:px-2 print:py-1 bg-gray-50 print:bg-transparent text-gray-600 text-xs print:text-[11px] font-medium rounded-xl print:rounded border border-gray-100 print:border-gray-300 w-full sm:w-auto text-left">
                  <HiOutlineLocationMarker
                    className="text-gray-400 print:text-gray-500 shrink-0"
                    size={14}
                  />
                  {enderecoFormatado}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* LADO DIREITO: CONTATOS / PAYWALL */}
        <div className="w-full lg:w-[35%] print:w-auto print:shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8 print:border-none print:pt-0 print:pl-0 flex flex-col justify-center print:justify-start">
          {acessoLiberado ? (
            <div className="flex flex-col gap-3 print:gap-1.5 text-sm print:text-xs text-gray-600 font-medium w-full">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 print:hidden">
                Informações de Contato
              </h3>

              {perfil.email && (
                <div className="flex items-center gap-3 print:gap-2 p-2.5 print:p-0 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50 print:hidden">
                    <HiOutlineMail
                      className="text-gray-400 group-hover:text-blue-600"
                      size={16}
                    />
                  </div>
                  <HiOutlineMail
                    className="hidden print:block text-gray-500"
                    size={14}
                  />
                  <a
                    href={`mailto:${perfil.email}`}
                    className="group-hover:text-blue-600 font-bold truncate print:font-medium"
                  >
                    {perfil.email}
                  </a>
                </div>
              )}

              {perfil.whatsapp && (
                <div className="flex items-center gap-3 print:gap-2 p-2.5 print:p-0 rounded-xl hover:bg-emerald-50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50/50 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:bg-emerald-100 print:hidden">
                    <FaWhatsapp className="text-emerald-500" size={16} />
                  </div>
                  <FaWhatsapp
                    className="hidden print:block text-gray-500"
                    size={14}
                  />
                  <a
                    href={`https://wa.me/55${perfil.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group-hover:text-emerald-700 font-bold print:font-medium"
                  >
                    {perfil.whatsapp}
                  </a>
                </div>
              )}

              {perfil.telefone && !perfil.whatsapp && (
                <div className="flex items-center gap-3 print:gap-2 p-2.5 print:p-0 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 print:hidden">
                    <HiOutlinePhone className="text-gray-400" size={16} />
                  </div>
                  <HiOutlinePhone
                    className="hidden print:block text-gray-500"
                    size={14}
                  />
                  <span className="font-bold print:font-medium">
                    {perfil.telefone}
                  </span>
                </div>
              )}

              {/* Ocultando botões de redes sociais grossos na impressão. (Você pode deixá-los visíveis como texto se desejar, mas ícones redondos gastam tinta e espaço). */}
              <div className="flex gap-2 pt-2 px-2 print:hidden">
                {perfil.link_linkedin && (
                  <a
                    href={perfil.link_linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-xl transition-colors shadow-sm"
                    title="LinkedIn"
                  >
                    <FaLinkedin size={16} />
                  </a>
                )}
                {perfil.link_portfolio && (
                  <a
                    href={perfil.link_portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-gray-900 hover:bg-black text-white rounded-xl transition-colors shadow-sm"
                    title="Portfólio"
                  >
                    <FaGithub size={16} />
                  </a>
                )}
              </div>

              {/* Fallback de Redes Sociais apenas para impressão */}
              <div className="hidden print:flex flex-col gap-1.5 mt-1">
                {perfil.link_linkedin && (
                  <div className="flex items-center gap-2">
                    <FaLinkedin className="text-gray-500" size={14} />
                    <span className="text-[11px] truncate max-w-[200px]">
                      {perfil.link_linkedin.replace(/^https?:\/\//, "")}
                    </span>
                  </div>
                )}
                {perfil.link_portfolio && (
                  <div className="flex items-center gap-2">
                    <FaGithub className="text-gray-500" size={14} />
                    <span className="text-[11px] truncate max-w-[200px]">
                      {perfil.link_portfolio.replace(/^https?:\/\//, "")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* PAYWALL MODERNO E COMPACTO (Fica invisível na impressão por padrão) */
            <div className="bg-gradient-to-b from-indigo-50/50 to-white p-5 rounded-2xl border border-indigo-100/60 shadow-sm print:hidden flex flex-col h-full justify-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-indigo-100/50 rounded-lg flex items-center justify-center text-indigo-600">
                  <HiOutlineLockClosed size={16} />
                </div>
                <h3 className="text-sm font-black text-indigo-900">
                  Contatos Ocultos
                </h3>
              </div>
              <p className="text-xs text-gray-500 font-medium mb-4 leading-relaxed pl-1">
                Libere o currículo para visualizar.
              </p>

              {saldoCreditos > 0 ? (
                <button
                  onClick={onDesbloquear}
                  disabled={isUnlocking}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-xs transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center"
                >
                  {isUnlocking ? "Processando..." : "Desbloquear (1 Crédito)"}
                </button>
              ) : (
                <Link
                  href="/empresa/comprar-creditos"
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-xs transition-colors text-center block shadow-sm"
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
