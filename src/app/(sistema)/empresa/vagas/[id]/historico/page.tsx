"use client";

import { useState, useEffect, useCallback, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
    HiOutlineArrowLeft,
    HiOutlineArchive,
} from "react-icons/hi";

// Reutilizamos seus componentes!
import { ListaCandidatos } from "@/src/components/empresa/ListaCandidatos";
import { CandidatoDrawer } from "@/src/components/empresa/CandidatoDrawer";

interface Candidato {
    id_candidatura: number;
    nome: string;
    id_usuario: number;
    fora_do_perfil: boolean;
    data_inscricao: string;
    possui_agendamento: boolean;
    data_entrevista: string | null;
    avaliacao_nota?: number | null;
    whatsapp?: string | null;
    visualizada: boolean;
    status?: string; // IMPORTANTE para saber o fim que o candidato levou
}

interface ColunaKanban {
    id_etapa: number;
    nome_etapa: string;
    candidatos: Candidato[];
}

export default function HistoricoVagaPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = use(params);
    const idVaga = resolvedParams.id;
    const router = useRouter();

    const [vaga, setVaga] = useState<any>(null);
    const [colunasMestre, setColunasMestre] = useState<ColunaKanban[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [candidatoSelecionadoId, setCandidatoSelecionadoId] = useState<number | null>(null);
    const [termoBusca, setTermoBusca] = useState("");

    const carregarDados = useCallback(async () => {
        setIsLoading(true);
        try {
            // Reutilizamos a mesma rota, pois ela já traz as colunas e todos os candidatos
            const res = await api.get(`/empresa/vagas/${idVaga}/painel-gestao`, {
                params: { _t: new Date().getTime() },
            });
            const payload = res.data.data || res.data.dados || res.data;
            setVaga(payload.vaga || null);
            setColunasMestre(payload.colunas || []);
        } catch (error: any) {
            toast.error("Erro ao carregar o histórico da vaga.");
        } finally {
            setIsLoading(false);
        }
    }, [idVaga]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const handleAbrirCandidato = (idCandidatura: number) => {
        setCandidatoSelecionadoId(idCandidatura);
    };

    // Como estamos no Histórico, só nos importa agrupar TODOS os candidatos, 
    // independentemente da etapa em que eles pararam.
    const todosCandidatos = useMemo(() => {
        return colunasMestre.flatMap(col => col.candidatos).filter(c =>
            c.nome.toLowerCase().includes(termoBusca.toLowerCase())
        );
    }, [colunasMestre, termoBusca]);

    // Passamos essa "Coluna Única Falsa" para a ListaCandidatos renderizar todos de uma vez
    const colunasParaLista = [{
        id_etapa: 999,
        nome_etapa: "Histórico Geral",
        candidatos: todosCandidatos
    }];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Resgatando arquivos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col animate-in fade-in duration-500">

            {/* HEADER DE MODO LEITURA */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm px-4 md:px-8 py-5 md:py-6">
                <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-4">
                    <div className="flex items-center justify-between w-full">
                        <button
                            onClick={() => router.push("/empresa/vagas")}
                            className="flex items-center self-start gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <HiOutlineArrowLeft size={16} /> Voltar para Vagas
                        </button>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-200">
                            <HiOutlineArchive size={14} /> Modo Histórico (Somente Leitura)
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-1.5">
                                <h1 className="text-2xl md:text-3xl font-black text-gray-400 tracking-tight leading-none line-clamp-1">
                                    {vaga?.titulo}
                                </h1>
                                <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-gray-100 border border-gray-200 text-gray-600">
                                    {vaga?.status}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-gray-400">
                                Esta vaga não recebe mais ações ou candidaturas.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* BARRA DE BUSCA SIMPLIFICADA */}
            <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 py-6 flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Buscar candidato no histórico..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="w-full xl:w-96 px-5 py-3 bg-white border border-gray-200 rounded-[16px] text-sm outline-none focus:border-gray-400 transition-all shadow-sm"
                />
            </div>

            {/* ÁREA DA TABELA COM FLAG DE LEITURA */}
            <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-8 pb-10 overflow-hidden flex flex-col grayscale-[20%]">
                <ListaCandidatos
                    colunas={colunasParaLista}
                    onAtualizar={() => { }} // Não faz nada no modo leitura
                    onAbrirCandidato={handleAbrirCandidato}
                    etapaAtivaId={999}
                    onMudancaEtapa={() => { }}
                    isModoLeitura={true} // ✨ O SEGREDO ESTÁ AQUI
                />
            </main>

            {/* GAVETA DE CANDIDATO COM FLAG DE LEITURA */}
            <CandidatoDrawer
                idCandidatura={candidatoSelecionadoId}
                onClose={() => setCandidatoSelecionadoId(null)}
                onAtualizar={() => { }}
                isModoLeitura={true} // ✨ O SEGREDO ESTÁ AQUI TAMBÉM
            />
        </div>
    );
}