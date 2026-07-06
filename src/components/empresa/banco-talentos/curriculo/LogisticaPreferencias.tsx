"use client";

import {
  HiOutlineCurrencyDollar,
  HiOutlineIdentification,
  HiOutlineCalendar,
  HiOutlineMap,
  HiOutlineTruck,
  HiOutlineClock,
  HiOutlineChatAlt2,
} from "react-icons/hi";

const turnoLabels: Record<string, string> = {
  QUALQUER_TURNO: "Qualquer Turno",
  COMERCIAL: "Comercial",
  MANHÃ: "Manhã",
  TARDE: "Tarde",
  NOITE: "Noite",
};

const contatoLabels: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  EMAIL: "E-mail",
  LIGACAO: "Ligação",
  QUALQUER_UM: "Qualquer canal",
};

interface LogisticaPreferenciasProps {
  perfil: any;
}

export function CurriculoLogistica({ perfil }: LogisticaPreferenciasProps) {
  const renderInfoBlock = (
    icon: any,
    label: string,
    value: string,
    highlightValue: boolean = false,
  ) => (
    <div className="flex flex-col gap-1.5 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm print:shadow-none print:border-none print:bg-transparent print:p-0 print:flex-row print:justify-between print:items-center print:border-b print:border-gray-200/60 print:pb-2 print:rounded-none">
      <div className="flex items-center gap-2 text-gray-500 print:text-gray-600">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider print:normal-case print:tracking-normal print:font-medium">
          {label}
        </span>
      </div>
      <span
        className={`text-sm md:text-base font-black print:text-[11px] print:text-right ${highlightValue ? "text-emerald-600 print:text-gray-900" : "text-gray-900"}`}
      >
        {value}
      </span>
    </div>
  );

  const cnhFormatada =
    perfil.cnh && perfil.cnh.length > 0 && !perfil.cnh.includes("NAO_POSSUO")
      ? perfil.cnh.join(", ")
      : "Não possui";

  const turnosFormatados =
    Array.isArray(perfil.turno_preferido) && perfil.turno_preferido.length > 0
      ? perfil.turno_preferido
          .map((t: string) => turnoLabels[t] || t.replace(/_/g, " "))
          .join(", ")
      : "Qualquer Turno";

  const contatoFormatado =
    Array.isArray(perfil.tipo_contato) && perfil.tipo_contato.length > 0
      ? perfil.tipo_contato.map((t: string) => contatoLabels[t] || t).join(", ")
      : "Qualquer canal";

  return (
    <section className="pt-6 md:pt-10 mt-6 border-t-2 border-gray-50 print:border-gray-200 print:break-inside-avoid">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 print:grid-cols-2 print:gap-8">
        {/* Bloco de Logística (Ocupa 2/3 no desktop) */}
        <div className="lg:col-span-2 print:col-span-1">
          <h4 className="text-xs md:text-sm font-black text-gray-400 print:text-gray-800 uppercase tracking-widest mb-5 print:mb-4">
            Disponibilidade & Logística
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 print:grid-cols-1 print:gap-2">
            {renderInfoBlock(
              <HiOutlineCurrencyDollar size={18} />,
              "Sálario",
              perfil.pretensao_salarial
                ? `R$ ${perfil.pretensao_salarial}`
                : "A Combinar",
              true,
            )}
            {renderInfoBlock(
              <HiOutlineIdentification size={18} />,
              "CNH",
              cnhFormatada,
            )}
            {renderInfoBlock(
              <HiOutlineCalendar size={18} />,
              "Sábados",
              perfil.disponibilidade_sabados ? "Disponível" : "Não",
            )}
            {renderInfoBlock(
              <HiOutlineMap size={18} />,
              "Viagens",
              perfil.disponibilidade_viagem ? "Sim" : "Não",
            )}
            {renderInfoBlock(
              <HiOutlineTruck size={18} />,
              "Mudança",
              perfil.disponibilidade_mudanca ? "Sim" : "Não",
            )}

            {/* Turno ocupa duas colunas em telas pequenas para não espremer o texto */}
            <div className="col-span-2 sm:col-span-1 print:col-span-1">
              {renderInfoBlock(
                <HiOutlineClock size={18} />,
                "Turnos",
                turnosFormatados,
              )}
            </div>
          </div>
        </div>

        {/* Bloco de Contato (Ocupa 1/3 no desktop) */}
        <div className="lg:col-span-1 print:col-span-1">
          <h4 className="text-xs md:text-sm font-black text-gray-400 print:text-gray-800 uppercase tracking-widest mb-5 print:mb-4">
            Preferências de Contato
          </h4>
          <div className="flex flex-col gap-3 print:gap-2">
            {/* Card de contato um pouco diferente para se destacar das logísticas na tela */}
            <div className="flex flex-col gap-2 p-5 bg-blue-50/50 border border-blue-100 rounded-3xl print:shadow-none print:border-none print:bg-transparent print:p-0 print:flex-row print:justify-between print:items-center print:border-b print:border-gray-200/60 print:pb-2 print:rounded-none">
              <div className="flex items-center gap-2 text-blue-600/70 print:text-gray-600">
                <HiOutlineChatAlt2 size={20} className="print:hidden" />
                <span className="text-xs font-bold uppercase tracking-wider print:normal-case print:tracking-normal print:font-medium">
                  Canais Preferidos
                </span>
              </div>
              <span className="text-base font-black text-blue-900 print:text-[11px] print:text-right print:text-gray-900">
                {contatoFormatado}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
