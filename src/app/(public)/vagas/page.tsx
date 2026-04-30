import VagasListagemContent from "@/src/components/vagas/VagasListagemContent";
import { mapearVagaBackendParaFrontend } from "@/src/utils/vaga-adapter";

async function getVagasIniciais() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vagas?pagina=1&limite=9`, {
        next: { revalidate: 0 }
    });

    if (!res.ok) return { dados: [], paginacao: { total: 0, total_paginas: 0, pagina_atual: 1 } };
    return res.json();
}

export const metadata = {
    title: "Vagas de Emprego em Panambi | ACI Empregos",
    description: "Encontre as melhores oportunidades em Panambi e região. Filtre por cargo, empresa e modelo de trabalho.",
};

export default async function VagasPublicasPage() {
    const response = await getVagasIniciais();
    const mappedJobs = response.dados.map(mapearVagaBackendParaFrontend);

    return (
        <VagasListagemContent
            initialJobs={mappedJobs}
            initialTotal={response.paginacao.total}
            initialTotalPages={response.paginacao.total_paginas}
        />
    );
}