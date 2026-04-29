import { Metadata } from 'next';
import { notFound } from "next/navigation";
import { BotaoCandidatar } from "@/src/components/vagas/[id]/BotaoCandidatar";
import VagaDetalhesContent from '@/src/components/paginas-compartilhadas/VagaDetalhesContent';
import { BotaoCandidaturaDinamico } from '@/src/components/candidato/BotaoCandidaturaDinamico';

interface Props {
    params: Promise<{ id: string }>;
}

async function getVaga(id: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vagas/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const vaga = await getVaga(id);
    if (!vaga) return { title: 'Vaga não encontrada' };

    const empresaNome = vaga.empresa_confidencial ? "Empresa Confidencial" : vaga.empresa.nome_fantasia;

    return {
        title: `${vaga.titulo} em Panambi | ${empresaNome}`,
        description: `Candidate-se para a vaga de ${vaga.titulo}. ${vaga.modelo_trabalho} em Panambi - RS. Veja os requisitos e benefícios.`,
        openGraph: {
            images: [vaga.empresa?.logotipo_url || '/og-image.png'],
        },
    };
}

export default async function VagaPublicaPage({ params }: Props) {
    const { id } = await params;
    const vaga = await getVaga(id);
    if (!vaga) notFound();

    return (
        <VagaDetalhesContent
            vaga={vaga}
            botaoAcao={<BotaoCandidaturaDinamico
                idVaga={vaga.id_vaga}
                tituloVaga={vaga.titulo}
            />}
        />
    );
}