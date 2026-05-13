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
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineDuplicate,
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
  is_salvo?: boolean;
}

// Helper para formatar celular/telefone no padrão (XX) 9XXXX-XXXX
const formatarTelefone = (tel: string) => {
  if (!tel) return "";
  let num = tel.replace(/\D/g, "");

  // Se o número veio com 55 (Brasil) e tem tamanho de celular normal, retira o 55 para formatar
  if (num.startsWith("55") && num.length > 11) {
    num = num.substring(2);
  }

  if (num.length === 11) {
    return `(${num.substring(0, 2)}) ${num.substring(2, 7)}-${num.substring(7)}`;
  } else if (num.length === 10) {
    return `(${num.substring(0, 2)}) ${num.substring(2, 6)}-${num.substring(6)}`;
  }
  return tel; // fallback se for muito diferente
};

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

  const handleToggleFavorito = async (
    id_candidato: number,
    estadoAtual: boolean,
  ) => {
    setCandidatos((prev) =>
      prev.map((c) =>
        c.id_candidato === id_candidato ? { ...c, is_salvo: !estadoAtual } : c,
      ),
    );

    try {
      await api.post(`/empresas/banco-talentos/${id_candidato}/favorito`);
      toast.success(
        !estadoAtual ? "Salvo nos favoritos!" : "Removido dos favoritos.",
      );
    } catch (error) {
      setCandidatos((prev) =>
        prev.map((c) =>
          c.id_candidato === id_candidato ? { ...c, is_salvo: estadoAtual } : c,
        ),
      );
      toast.error("Erro ao salvar o currículo.");
    }
  };

  const handleCopiarTexto = (texto: string, label: string) => {
    navigator.clipboard.writeText(texto);
    toast.success(`${label} copiado!`, {
      icon: "📋",
      style: {
        borderRadius: "12px",
        background: "#333",
        color: "#fff",
        fontSize: "14px",
        fontWeight: "bold",
      },
    });
  };

  const filteredCandidatos = candidatos.filter(
    (c) =>
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.area_principal.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4 space-y-4 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-[24px] w-full max-w-md mb-8"></div>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 bg-white rounded-[24px] border border-gray-100"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 md:px-8 animate-in fade-in duration-700 space-y-8">
      {/* ================= HEADER E BUSCA ================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-surface p-8 md:p-10 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
            <HiOutlineBriefcase size={16} />
            Sua Gaveta
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight">
            Meus Desbloqueados
          </h1>
          <p className="text-muted text-sm md:text-base">
            Você tem{" "}
            <strong className="text-foreground">{candidatos.length}</strong>{" "}
            currículos liberados para contato.
          </p>
        </div>

        <div className="relative w-full max-w-sm group z-10">
          <HiOutlineSearch
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors z-10"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por nome ou área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-3.5 bg-gray-50 border border-gray-200 rounded-full outline-none text-sm font-medium transition-all focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-sm"
          />
        </div>
      </div>

      {/* ================= LISTAGEM DOS CANDIDATOS ================= */}
      {filteredCandidatos.length === 0 ? (
        <div className="bg-surface rounded-[40px] border border-dashed border-gray-200 p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineBriefcase size={32} />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-foreground">
            {searchTerm
              ? "Nenhum candidato encontrado na busca."
              : "Sua gaveta está vazia."}
          </h3>
          <p className="text-muted mt-2 text-sm">
            {searchTerm
              ? "Tente buscar por outro nome ou área de atuação."
              : "Os perfis que você desbloquear no Banco de Talentos aparecerão aqui para acesso rápido aos contatos."}
          </p>
          {!searchTerm && (
            <Link
              href="/empresa/banco-talentos"
              className="inline-flex items-center gap-2 mt-6 px-8 py-3.5 bg-primary hover:bg-hover-button text-surface text-sm font-black uppercase tracking-widest rounded-full transition-colors shadow-lg shadow-primary/20"
            >
              Explorar Vitrine <HiOutlineArrowRight size={18} />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCandidatos.map((cand) => {
            const numeroFormatado = formatarTelefone(
              cand.whatsapp || cand.telefone,
            );

            return (
              <div
                key={cand.id_candidato}
                className={`flex flex-col xl:flex-row gap-6 p-6 md:p-8 bg-surface rounded-[32px] border shadow-sm transition-all duration-300 hover:shadow-lg ${
                  !cand.perfil_ativo
                    ? "border-amber-200 bg-amber-50/20"
                    : "border-gray-100 hover:border-primary/30"
                }`}
              >
                {/* BLOCO 1: FOTO E INFO PRINCIPAL */}
                <div className="flex items-center gap-5 xl:w-1/3 relative">
                  {cand.foto_url ? (
                    <img
                      src={cand.foto_url}
                      alt={cand.nome}
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-[20px] object-cover border-4 shadow-sm shrink-0 ${
                        !cand.perfil_ativo
                          ? "grayscale border-gray-200"
                          : "border-white"
                      }`}
                    />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-[20px] bg-primary/10 text-primary flex items-center justify-center font-black text-2xl border-4 border-white shadow-sm shrink-0">
                      {cand.nome.charAt(0)}
                    </div>
                  )}

                  <div className="space-y-1">
                    <h3 className="text-lg md:text-xl font-black text-foreground leading-tight">
                      {cand.nome}
                    </h3>
                    <p className="text-xs md:text-sm font-black text-primary uppercase tracking-widest">
                      {cand.area_principal}
                    </p>

                    {!cand.perfil_ativo && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-md mt-2">
                        <HiOutlineExclamationCircle size={14} />
                        Perfil Oculto
                      </span>
                    )}
                  </div>
                </div>

                {/* BLOCO 2: CONTATOS EMPILHADOS E COM COPY */}
                <div className="flex-1 flex flex-col justify-center gap-3 border-y xl:border-y-0 xl:border-l border-gray-100 py-5 xl:py-0 xl:pl-8">
                  {cand.email && (
                    <div className="flex items-center gap-2 group">
                      <a
                        href={`mailto:${cand.email}`}
                        className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-primary transition-colors max-w-[220px] sm:max-w-xs"
                      >
                        <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl group-hover:bg-primary/10 group-hover:border-primary/20 transition-all shrink-0">
                          <HiOutlineMail
                            size={18}
                            className="group-hover:text-primary"
                          />
                        </div>
                        <span className="truncate">{cand.email}</span>
                      </a>
                      <button
                        onClick={() => handleCopiarTexto(cand.email, "E-mail")}
                        className="p-2 text-gray-300 hover:text-primary hover:bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 shrink-0"
                        title="Copiar e-mail"
                      >
                        <HiOutlineDuplicate size={16} />
                      </button>
                    </div>
                  )}

                  {cand.whatsapp && (
                    <div className="flex items-center gap-2 group">
                      <a
                        href={`https://wa.me/55${cand.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
                      >
                        <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl group-hover:bg-emerald-100 transition-all shrink-0">
                          <FaWhatsapp className="text-emerald-600" size={18} />
                        </div>
                        <span>{numeroFormatado}</span>
                      </a>
                      <button
                        onClick={() =>
                          handleCopiarTexto(numeroFormatado, "WhatsApp")
                        }
                        className="p-2 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 shrink-0"
                        title="Copiar número"
                      >
                        <HiOutlineDuplicate size={16} />
                      </button>
                    </div>
                  )}

                  {cand.telefone && !cand.whatsapp && (
                    <div className="flex items-center gap-2 group">
                      <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                        <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl shrink-0">
                          <HiOutlinePhone size={18} />
                        </div>
                        <span>{numeroFormatado}</span>
                      </div>
                      <button
                        onClick={() =>
                          handleCopiarTexto(numeroFormatado, "Telefone")
                        }
                        className="p-2 text-gray-300 hover:text-gray-700 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 shrink-0"
                        title="Copiar número"
                      >
                        <HiOutlineDuplicate size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* BLOCO 3: DATA, FAVORITAR E AÇÃO */}
                <div className="flex flex-row xl:flex-col items-center xl:items-end justify-between gap-4 xl:w-56 shrink-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
                    <HiOutlineCalendar size={14} />
                    Liberado em{" "}
                    {new Date(cand.data_desbloqueio).toLocaleDateString(
                      "pt-BR",
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Botão de Salvar Inteligente (Optimistic UI) */}
                    <button
                      onClick={() =>
                        handleToggleFavorito(cand.id_candidato, !!cand.is_salvo)
                      }
                      className={`p-3 rounded-full transition-all border shadow-sm shrink-0 ${
                        cand.is_salvo
                          ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                          : "bg-surface text-gray-400 border-gray-200 hover:text-primary hover:border-primary/50 hover:bg-gray-50"
                      }`}
                      title={
                        cand.is_salvo
                          ? "Remover dos salvos"
                          : "Salvar currículo"
                      }
                    >
                      {cand.is_salvo ? (
                        <HiBookmark size={20} />
                      ) : (
                        <HiOutlineBookmark size={20} />
                      )}
                    </button>

                    <Link
                      href={`/empresa/banco-talentos/${cand.id_candidato}`}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
                    >
                      Ver Perfil
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
