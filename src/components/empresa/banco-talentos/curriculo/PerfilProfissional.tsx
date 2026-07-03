"use client";

interface PerfilProfissionalProps {
    perfil: any;
}

export function PerfilProfissional({ perfil }: PerfilProfissionalProps) {
    if (!perfil.resumo_profissional && !perfil.pcd) return null;

    return (
        <>
            {/* RESUMO PROFISSIONAL */}
            {perfil.resumo_profissional && (
                <section className="mb-8 print:mb-6 print:break-inside-avoid">
                    <h3 className="text-lg print:text-base font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-blue-600 print:bg-gray-800 rounded-full"></span>{" "}
                        Resumo Profissional
                    </h3>
                    <p className="text-gray-600 print:text-gray-800 leading-relaxed text-justify whitespace-pre-wrap font-medium text-sm md:text-base print:text-[13px]">
                        {perfil.resumo_profissional}
                    </p>
                </section>
            )}

            {/* PERFIL INCLUSIVO */}
            {perfil.pcd && (
                <section className="mb-8 print:mb-6 print:break-inside-avoid">
                    <h3 className="text-lg print:text-base font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-emerald-500 print:bg-gray-800 rounded-full"></span>{" "}
                        Perfil Inclusivo
                    </h3>

                    <div className="bg-emerald-50/50 print:bg-transparent p-5 rounded-2xl border border-emerald-100 print:border-none print:p-0 space-y-2">
                        <p className="text-sm md:text-base print:text-[13px] text-gray-700 font-medium">
                            <span className="font-black text-gray-900">Identificação:</span> Pessoa com Deficiência (PcD)
                            {perfil.tipo_pcd && <span className="text-gray-600"> — {perfil.tipo_pcd}</span>}
                        </p>

                        {perfil.necessidade && (
                            <div className="pt-2 mt-2 border-t border-emerald-200/60 print:border-gray-200">
                                <p className="text-[11px] md:text-xs text-gray-500 print:text-gray-600 font-bold uppercase tracking-wider mb-1">
                                    Acessibilidade para Entrevista / Trabalho
                                </p>
                                <p className="text-sm md:text-base print:text-[13px] text-gray-800 font-medium leading-relaxed">
                                    {perfil.necessidade}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </>
    );
}