"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";
import Link from "next/link";
import {
    HiOutlineBriefcase,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineCalendar,
    HiOutlineArrowRight,
    HiOutlineSearch,
    HiOutlineExclamationCircle,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";

interface Desbloqueado {
    id_candidato: number;
    data_desbloqueio: string;
    nome: string;
    email: string;
    foto_url: string | null;
    whatsapp: string;
    telefone: string;
    area_principal: string;
    cidade: string;
    uf: string;
    ultima_experiencia: string;
    perfil_ativo: boolean;
}

export default function MeusDesbloqueadosPage() {
    const [candidatos, setCandidatos] = useState<Desbloqueado[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const buscarDesbloqueados = async () => {
            try {
                const res = await api.get("/empresas/meus-desbloqueados");
                setCandidatos(res.data.data || []);
            } catch (error) {
                console.error("Erro ao carregar gaveta:", error);
                toast.error("Não foi possível carregar seu histórico de currículos.");
            } finally {
                setIsLoading(false);
            }
        };
        buscarDesbloqueados();
    }, []);

    // Filtro rápido para o recrutador achar alguém pelo nome ou área
    const filteredCandidatos = candidatos.filter(
        (c) =>
            c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.area_principal.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto py-10 px-4 space-y-4 animate-pulse">
                <div className="h-20 bg-gray-200 rounded-[24px] w-full max-w-md mb-8"></div>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-white rounded-[24px] border border-gray-100"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 animate-in fade-in duration-700 space-y-8">

            {/* HEADER E BUSCA */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-sm">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-xs font-black uppercase tracking-widest mb-2">
                        <HiOutlineBriefcase size={16} />
                        Sua Gaveta
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Meus Desbloqueados
                    </h1>
                    <p className="text-gray-500">
                        Você tem <strong className="text-gray-800">{candidatos.length}</strong> currículos liberados.
                    </p>
                </div>

                <div className="relative w-full max-w-sm group">
                    <HiOutlineSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou área..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-[24px] outline-none text-sm font-medium transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm"
                    />
                </div>
            </div>

            {/* LISTAGEM DOS CANDIDATOS */}
            {filteredCandidatos.length === 0 ? (
                <div className="bg-white rounded-[40px] border border-dashed border-gray-200 p-16 text-center">
                    <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiOutlineBriefcase size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                        {searchTerm ? "Nenhum candidato encontrado na busca." : "Sua gaveta está vazia."}
                    </h3>
                    <p className="text-gray-500 mt-2">
                        {searchTerm ? "Tente buscar por outro nome." : "Os perfis que você desbloquear no Banco de Talentos aparecerão aqui para acesso rápido."}
                    </p>
                    {!searchTerm && (
                        <Link
                            href="/empresa/banco-talentos"
                            className="inline-block mt-6 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-colors shadow-lg shadow-blue-200"
                        >
                            Explorar Banco de Talentos
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredCandidatos.map((cand) => (
                        <div
                            key={cand.id_candidato}
                            className={`flex flex-col xl:flex-row gap-6 p-6 bg-white rounded-[32px] border shadow-sm transition-all duration-300 hover:shadow-md ${!cand.perfil_ativo ? "border-amber-200 bg-amber-50/10" : "border-gray-100 hover:border-blue-100"
                                }`}
                        >
                            {/* BLOCO 1: FOTO E INFO PRINCIPAL */}
                            <div className="flex items-center gap-5 xl:w-1/3">
                                {cand.foto_url ? (
                                    <img
                                        src={cand.foto_url}
                                        alt={cand.nome}
                                        className={`w-16 h-16 rounded-full object-cover border-2 shadow-sm shrink-0 ${!cand.perfil_ativo ? "grayscale border-gray-200" : "border-white"}`}
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl border-2 border-white shadow-sm shrink-0">
                                        {cand.nome.charAt(0)}
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-gray-900 leading-tight">
                                        {cand.nome}
                                    </h3>
                                    <p className="text-sm font-bold text-blue-600">
                                        {cand.area_principal}
                                    </p>

                                    {/* ALERTA SE O PERFIL FOI PAUSADO PELO CANDIDATO */}
                                    {!cand.perfil_ativo && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md mt-1">
                                            <HiOutlineExclamationCircle size={12} />
                                            Perfil Oculto pelo Candidato
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* BLOCO 2: CONTATOS RÁPIDOS */}
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center border-y xl:border-y-0 xl:border-l border-gray-100 py-4 xl:py-0 xl:pl-6">
                                {cand.email && (
                                    <a href={`mailto:${cand.email}`} className="flex items-center gap-2.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                                        <div className="p-2 bg-gray-50 rounded-xl"><HiOutlineMail size={16} /></div>
                                        <span className="truncate">{cand.email}</span>
                                    </a>
                                )}
                                {cand.whatsapp && (
                                    <a href={`https://wa.me/55${cand.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
                                        <div className="p-2 bg-emerald-50 rounded-xl"><FaWhatsapp className="text-emerald-500" size={16} /></div>
                                        {cand.whatsapp}
                                    </a>
                                )}
                                {cand.telefone && !cand.whatsapp && (
                                    <div className="flex items-center gap-2.5 text-sm font-medium text-gray-600">
                                        <div className="p-2 bg-gray-50 rounded-xl"><HiOutlinePhone size={16} /></div>
                                        {cand.telefone}
                                    </div>
                                )}
                            </div>

                            {/* BLOCO 3: DATA E AÇÃO */}
                            <div className="flex flex-row xl:flex-col items-center xl:items-end justify-between gap-4 xl:w-48 shrink-0">
                                <div className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                    <HiOutlineCalendar size={14} />
                                    {new Date(cand.data_desbloqueio).toLocaleDateString("pt-BR")}
                                </div>

                                <Link
                                    href={`/empresa/banco-talentos/${cand.id_candidato}`}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-full transition-colors shadow-md w-full sm:w-auto"
                                >
                                    Ver Currículo
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}