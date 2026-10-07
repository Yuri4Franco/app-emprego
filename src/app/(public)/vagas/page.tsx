import { Suspense } from "react";
import VagasListagemContent from "@/src/components/vagas/VagasListagemContent";
import { mapearVagaBackendParaFrontend } from "@/src/utils/vaga-adapter";

async function getVagasIniciais() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vagas?pagina=1&limite=9`, {
        next: { revalidate: 1800 }
    });

    if (!res.ok) return { dados: [], paginacao: { total: 0, total_paginas: 0, pagina_atual: 1 } };
    return res.json();
}

export const metadata = {
    title: "Vagas de Emprego em Panambi | ACI Vagas",
    description: "Encontre as melhores oportunidades em Panambi e região. Filtre por cargo, empresa e modelo de trabalho.",
};

export default async function VagasPublicasPage() {
    const response = await getVagasIniciais();
    const mappedJobs = response.dados.map(mapearVagaBackendParaFrontend);

    return (
        <Suspense
            fallback={
                <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-bold">Preparando as melhores vagas...</p>
                </div>
            }
        >
            <VagasListagemContent
                initialJobs={mappedJobs}
                initialTotal={response.paginacao.total}
                initialTotalPages={response.paginacao.total_paginas}
            />
        </Suspense>
    );
}