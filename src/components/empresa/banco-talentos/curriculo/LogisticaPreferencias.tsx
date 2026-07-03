"use client";

const turnoLabels: Record<string, string> = {
    QUALQUER_TURNO: "Qualquer Turno",
    COMERCIAL: "Horário Comercial",
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

export function LogisticaPreferencias({ perfil }: LogisticaPreferenciasProps) {
    return (
        <section className="pt-6 md:pt-8 border-t-2 border-gray-50 print:border-gray-200 print:break-inside-avoid">
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 md:gap-6 print:gap-8">

                {/* Bloco de Logística */}
                <div className="bg-gray-50 p-5 md:p-6 rounded-3xl print:bg-transparent print:p-0">
                    <h4 className="text-[11px] md:text-xs font-black text-gray-400 print:text-gray-800 uppercase tracking-widest mb-4">
                        Disponibilidade & Logística
                    </h4>
                    <ul className="space-y-3 print:space-y-1.5 text-xs md:text-sm print:text-[11px] text-gray-700 font-medium">
                        <li className="flex justify-between items-center border-b border-gray-200/60 print:border-none pb-2 print:pb-0">
                            <span className="text-gray-500 print:text-gray-600">Pretensão Salarial:</span>
                            <span className="font-bold text-emerald-600 print:text-gray-900 text-right">
                                {perfil.pretensao_salarial ? `R$ ${perfil.pretensao_salarial}` : "A Combinar"}
                            </span>
                        </li>

                        <li className="flex justify-between items-center border-b border-gray-200/60 print:border-none pb-2 print:pb-0">
                            <span className="text-gray-500 print:text-gray-600">Habilitação (CNH):</span>
                            <span className="font-bold text-gray-900 text-right">
                                {perfil.cnh && perfil.cnh.length > 0 && !perfil.cnh.includes("NAO_POSSUO")
                                    ? perfil.cnh.join(", ")
                                    : "Não possui"}
                            </span>
                        </li>

                        <li className="flex justify-between items-center border-b border-gray-200/60 print:border-none pb-2 print:pb-0">
                            <span className="text-gray-500 print:text-gray-600">Sábados:</span>
                            <span className="font-bold text-gray-900">{perfil.disponibilidade_sabados ? "Disponível" : "Não"}</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-gray-200/60 print:border-none pb-2 print:pb-0">
                            <span className="text-gray-500 print:text-gray-600">Viagens:</span>
                            <span className="font-bold text-gray-900">{perfil.disponibilidade_viagem ? "Sim" : "Não"}</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-gray-200/60 print:border-none pb-2 print:pb-0">
                            <span className="text-gray-500 print:text-gray-600">Mudança:</span>
                            <span className="font-bold text-gray-900">{perfil.disponibilidade_mudanca ? "Sim" : "Não"}</span>
                        </li>
                        <li className="flex justify-between items-start print:items-center print:border-none pt-1 print:pt-0 gap-3">
                            <span className="text-gray-500 print:text-gray-600 shrink-0">Turnos:</span>
                            <span className="font-bold text-gray-900 text-right leading-snug break-words">
                                {Array.isArray(perfil.turno_preferido) && perfil.turno_preferido.length > 0
                                    ? perfil.turno_preferido.map((t: string) => turnoLabels[t] || t.replace(/_/g, ' ')).join(", ")
                                    : "Qualquer Turno"}
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Bloco de Contato */}
                <div className="bg-gray-50 p-5 md:p-6 rounded-3xl print:bg-transparent print:p-0 mt-2 md:mt-0">
                    <h4 className="text-[11px] md:text-xs font-black text-gray-400 print:text-gray-800 uppercase tracking-widest mb-4">
                        Preferências de Contato
                    </h4>
                    <ul className="space-y-3 print:space-y-1.5 text-xs md:text-sm print:text-[11px] text-gray-700 font-medium">
                        <li className="flex justify-between items-center border-b border-gray-200/60 print:border-none pb-2 print:pb-0">
                            <span className="text-gray-500 print:text-gray-600">Canais preferidos:</span>
                            <span className="font-bold text-blue-600 print:text-gray-900 text-right max-w-[140px] md:max-w-[200px] truncate">
                                {Array.isArray(perfil.tipo_contato) && perfil.tipo_contato.length > 0
                                    ? perfil.tipo_contato.map((t: string) => contatoLabels[t] || t).join(", ")
                                    : "Qualquer canal"}
                            </span>
                        </li>
                    </ul>
                </div>

            </div>
        </section>
    );
}