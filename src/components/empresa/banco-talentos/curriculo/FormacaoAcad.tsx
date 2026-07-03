"use client";

const formatarStatusFormacao = (form: any) => {
    const isBasic = form.nivel === "Ensino Fundamental" || form.nivel === "Ensino Médio";
    const statusUpper = form.status?.toUpperCase() || "";

    const isConcluido = statusUpper === "CONCLUÍDO" || statusUpper === "CONCLUIDO";
    const isCursando = statusUpper === "CURSANDO";
    const isInterrompido = statusUpper === "INTERROMPIDO";

    let statusLabel = form.status;
    if (isConcluido) statusLabel = "Concluído";
    if (isCursando) statusLabel = "Cursando";
    if (isInterrompido) statusLabel = "Trancado";

    let anoLabel = "";
    if (isConcluido && !isBasic && form.data_conclusao) {
        const year = new Date(form.data_conclusao).getFullYear();
        if (year > 1970) anoLabel = ` em ${year}`;
    }
    return `${statusLabel}${anoLabel}`;
};

interface FormacaoAcadProps {
    formacoes: any[];
}

export function FormacaoAcad({ formacoes }: FormacaoAcadProps) {
    if (!formacoes?.length) return null;

    return (
        <section className="mb-8 print:mb-6">
            <h3 className="text-lg print:text-base font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-blue-600 print:bg-gray-800 rounded-full"></span>{" "}
                Formação Acadêmica
            </h3>

            <div className="space-y-6 print:space-y-4 pl-2">
                {formacoes.map((form: any) => (
                    <div key={form.id_formacao} className="relative pl-6 md:pl-8 border-l-2 border-gray-100 print:border-gray-300 print:break-inside-avoid">
                        <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[7px] top-1.5 print:bg-gray-500"></div>

                        <div className="flex flex-col">
                            <h4 className="text-base md:text-lg print:text-[15px] font-black text-gray-900 leading-snug">
                                {form.curso || form.nivel}
                            </h4>
                            {form.instituicao && (
                                <p className="text-sm print:text-[13px] font-bold text-gray-600 print:text-gray-800 mt-0.5">
                                    {form.instituicao}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                                <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 print:bg-transparent print:border print:border-gray-300 text-gray-500 print:text-gray-800 px-2 py-1 rounded-md">
                                    {form.nivel}
                                </span>
                                <span className="text-[10px] md:text-[11px] font-bold text-blue-600 print:text-gray-800 uppercase tracking-wider flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-blue-600 print:bg-gray-800 hidden sm:inline-block"></span>
                                    {formatarStatusFormacao(form)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}