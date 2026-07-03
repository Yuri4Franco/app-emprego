"use client";

interface HabilidadesProps {
    competencias: any[];
}

export function Habilidades({ competencias }: HabilidadesProps) {
    if (!competencias?.length) return null;

    return (
        <section className="mb-10 print:mb-6 print:break-inside-avoid">
            <h3 className="text-lg print:text-base font-black text-gray-900 uppercase tracking-widest mb-5 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-blue-600 print:bg-gray-800 rounded-full"></span>{" "}
                Habilidades Técnicas
            </h3>
            <div className="flex flex-wrap gap-2 md:gap-3">
                {competencias.map((c: any, index: number) => (
                    <div
                        key={index}
                        className="flex flex-col justify-center px-3 md:px-4 py-2 bg-blue-50/50 border border-blue-100 text-blue-800 rounded-2xl print:border-gray-300 print:bg-transparent print:text-gray-800 print:rounded-lg print:py-1 print:px-2.5"
                    >
                        <span className="text-xs md:text-sm print:text-[11px] font-bold">
                            {c.competencia?.nome || c.nome}
                        </span>
                        <span className="text-[9px] md:text-[10px] text-blue-500/70 print:text-gray-500 uppercase font-black tracking-widest mt-0.5">
                            {c.nivel || "Básico"}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}