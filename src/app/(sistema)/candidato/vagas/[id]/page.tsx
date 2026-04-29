import { notFound } from "next/navigation"; // Resolve o erro 'notFound'
import { BotaoCandidaturaDinamico } from "@/src/components/candidato/BotaoCandidaturaDinamico";
import VagaDetalhesContent from "@/src/components/paginas-compartilhadas/VagaDetalhesContent";

interface Props {
  params: Promise<{ id: string }>;
}

async function getVaga(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vagas/${id}`, {
    next: { revalidate: 60 }
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.data : null;
}

export default async function VagaCandidatoPage({ params }: Props) {
  const { id } = await params;
  const vaga = await getVaga(id);

  if (!vaga) notFound();

  return (
    <VagaDetalhesContent
      vaga={vaga}
      botaoAcao={
        <BotaoCandidaturaDinamico
          idVaga={vaga.id_vaga}
          tituloVaga={vaga.titulo}
        />
      }
    />
  );
}