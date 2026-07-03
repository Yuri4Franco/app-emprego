"use client";

import { HiOutlineLightningBolt, HiOutlineCalendar } from "react-icons/hi";

interface ExperienciasProps {
    experiencias: any[];
    primeiroEmprego: boolean;
}

export function Experiencias({ experiencias, primeiroEmprego }: ExperienciasProps) {
    if (!experiencias?.length && !primeiroEmprego) return null;

    return (
        <section className="mb-8 print:mb-6">
            <h3 className="text-lg print:text-base font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-blue-600 print:bg-gray-800 rounded-full"></span>{" "}
                Experiência Profissional
            </h3>

            {primeiroEmprego && (
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 print:bg-transparent print:border-none print:p-0 mb-8 print:mb-6">
                    <p className="text-blue-800 print:text-gray-800 font-bold flex items-center gap-2">
                        <HiOutlineLightningBolt size={20} className="text-blue-500 print:text-gray-800" />
                        Em busca da primeira oportunidade profissional.
                    </p>
                </div>
            )}

            {experiencias?.length > 0 && (
                <div className="space-y-8 print:space-y-6 pl-2">
                    {experiencias.map((exp: any) => (
                        <div key={exp.id_experiencia} className="relative pl-6 md:pl-8 border-l-2 border-gray-100 print:border-gray-300 print:break-inside-avoid">
                            <div className="absolute w-4 h-4 bg-white border-4 border-blue-600 rounded-full -left-[9px] top-1 print:border-gray-800"></div>

                            <div className="flex flex-col mb-2">
                                <h4 className="text-lg md:text-xl print:text-base font-black text-gray-900 leading-snug">
                                    {exp.cargo}
                                </h4>
                                <div className="flex flex-col md:flex-row md:items-center print:flex-row print:items-center gap-1 md:gap-3 print:gap-3 mt-1 mb-2">
                                    <p className="text-sm md:text-base print:text-[13px] font-bold text-blue-600 print:text-gray-800">
                                        {exp.empresa}
                                    </p>
                                    <span className="hidden md:block print:block text-gray-300">•</span>
                                    <span className="flex items-center gap-1.5 text-[11px] md:text-xs font-bold text-gray-400 print:text-gray-600 uppercase tracking-wider">
                                        <HiOutlineCalendar size={14} />
                                        {new Date(exp.data_inicio).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                                        {" — "}
                                        {exp.atual ? "O Momento" : new Date(exp.data_fim).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                                    </span>
                                </div>
                            </div>

                            {exp.atividades && (
                                <p className="text-sm print:text-[13px] text-gray-600 print:text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                                    {exp.atividades}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}