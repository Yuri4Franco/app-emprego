import VagasListagemContent from "@/src/components/vagas/VagasListagemContent";
import { mapearVagaBackendParaFrontend } from "@/src/utils/vaga-adapter";


async function getVagasIniciais() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vagas?pagina=1&limite=9`, {
    cache: 'no-store' // No dashboard, queremos dados sempre frescos
  });

  if (!res.ok) return { dados: [], paginacao: { total: 0, total_paginas: 0, pagina_atual: 1 } };
  return res.json();
}

export default async function VagasCandidatoPage() {
  const response = await getVagasIniciais();
  const mappedJobs = response.dados.map(mapearVagaBackendParaFrontend);

  return (
    <div className="p-4 md:p-0">
      <VagasListagemContent
        initialJobs={mappedJobs}
        initialTotal={response.paginacao.total}
        initialTotalPages={response.paginacao.total_paginas}
        urlPrefix="/candidato"
        gridCols="grid-cols-1 xl:grid-cols-2"
      />
    </div>
  );
}