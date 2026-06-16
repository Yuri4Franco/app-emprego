"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/src/services/api";
import { useRouter } from "next/navigation";
import { HiOutlinePlus, HiOutlineBriefcase } from "react-icons/hi";
import { ButtonType } from "@/src/components/ButtonType";
import Link from "next/link";
import toast from "react-hot-toast";
import { VagasFiltros } from "@/src/components/empresa/vagas/VagasFiltros";
import { VagaCard } from "@/src/components/empresa/vagas/VagaCard";
import { ModalConfirmacaoAcao } from "@/src/components/empresa/vagas/ModalConfirmacaoAcao";


type ActionType = "PAUSAR" | "ENCERRAR" | "EXCLUIR_RASCUNHO" | null;

export default function GestaoVagasPage() {
  const router = useRouter();
  const [vagas, setVagas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Controles
  const [isDuplicating, setIsDuplicating] = useState<number | null>(null);
  const [menuAberto, setMenuAberto] = useState<number | null>(null);
  
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  const [busca, setBusca] = useState("");
  const [meta, setMeta] = useState<any>({ total: 0, page: 1 });

  // Controle do Modal de Confirmação
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    tipo: ActionType;
    idVaga: number | null;
    tituloVaga: string;
    isProcessing: boolean;
  }>({
    isOpen: false,
    tipo: null,
    idVaga: null,
    tituloVaga: "",
    isProcessing: false,
  });

  const fetchVagas = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get("/vagas/minhas-vagas", {
        params: { page, limit: 10, status: filtroStatus || undefined, search: busca || undefined },
      });
      setVagas(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      toast.error("Erro ao carregar suas vagas.");
    } finally {
      setLoading(false);
    }
  }, [filtroStatus, busca]);

  useEffect(() => {
    fetchVagas();
  }, [fetchVagas]);

  useEffect(() => {
    const fecharMenu = () => setMenuAberto(null);
    window.addEventListener("click", fecharMenu);
    return () => window.removeEventListener("click", fecharMenu);
  }, []);

  // ================= AÇÕES DA API =================
  const handleDuplicarVaga = async (idVagaOriginal: number) => {
    setMenuAberto(null);
    setIsDuplicating(idVagaOriginal);
    const toastId = toast.loading("Criando cópia da vaga...");
    try {
      const response = await api.post(`/empresa/vagas/${idVagaOriginal}/duplicar`);
      toast.success("Vaga duplicada! Redirecionando...", { id: toastId });
      router.push(`/empresa/vagas/${response.data.data.id_vaga}/editar`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao duplicar.", { id: toastId });
      setIsDuplicating(null);
    }
  };

  const openConfirmModal = (id: number, titulo: string, tipo: ActionType) => {
    setMenuAberto(null);
    setModalConfig({ isOpen: true, tipo, idVaga: id, tituloVaga: titulo, isProcessing: false });
  };

  const closeConfirmModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false, isProcessing: false });
  };

  const executeConfirmAction = async () => {
    if (!modalConfig.idVaga || !modalConfig.tipo) return;
    setModalConfig({ ...modalConfig, isProcessing: true });
    
    try {
      if (modalConfig.tipo === "PAUSAR") {
        await api.patch(`/empresa/vagas/${modalConfig.idVaga}/pausar`);
        toast.success("Vaga pausada com sucesso!");
      } else if (modalConfig.tipo === "ENCERRAR") {
        await api.patch(`/empresa/vagas/${modalConfig.idVaga}/encerrar`); // Adapte para sua rota exata
        toast.success("Vaga encerrada definitivamente!");
      } else if (modalConfig.tipo === "EXCLUIR_RASCUNHO") {
        await api.delete(`/empresa/vagas/${modalConfig.idVaga}`); // Adapte para sua rota exata
        toast.success("Rascunho excluído!");
      }
      
      closeConfirmModal();
      fetchVagas(meta.page); // Recarrega a listagem
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Ocorreu um erro ao processar a ação.");
      setModalConfig({ ...modalConfig, isProcessing: false });
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 pt-4 md:pt-10 px-4 md:px-8 space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Gestão de Vagas</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Acompanhe o desempenho e gerencie todas as suas oportunidades.</p>
        </div>
        <Link href="/empresa/vagas/nova" className="w-full md:w-auto">
          <ButtonType className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full shadow-lg shadow-blue-100 hover:shadow-blue-200 transition-all text-sm">
            <HiOutlinePlus size={20} /> Publicar Nova Vaga
          </ButtonType>
        </Link>
      </header>

      {/* FILTROS (COMPONENTE) */}
      <VagasFiltros filtroStatus={filtroStatus} setFiltroStatus={setFiltroStatus} busca={busca} setBusca={setBusca} />

      {/* LISTAGEM DE VAGAS */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-20 text-center animate-pulse text-gray-400 font-bold uppercase tracking-widest">Buscando suas vagas...</div>
        ) : vagas.length > 0 ? (
          vagas.map((vaga) => (
            <VagaCard
              key={vaga.id_vaga}
              vaga={vaga}
              menuAberto={menuAberto}
              setMenuAberto={setMenuAberto}
              isDuplicating={isDuplicating === vaga.id_vaga}
              onDuplicar={handleDuplicarVaga}
              onAcaoConfirma={openConfirmModal}
            />
          ))
        ) : (
          <div className="bg-white p-12 md:p-20 rounded-[48px] text-center border-2 border-dashed border-gray-200 space-y-5 shadow-sm">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <HiOutlineBriefcase size={36} />
            </div>
            <div>
              <p className="text-gray-800 font-black text-xl mb-1">Nenhuma vaga encontrada</p>
              <p className="text-gray-500 text-sm font-medium max-w-sm mx-auto">Não localizamos vagas com o filtro ou busca informados.</p>
            </div>
          </div>
        )}
      </div>

      {/* PAGINAÇÃO */}
      {meta.total_paginas > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          {Array.from({ length: meta.total_paginas }).map((_, i) => (
            <button
              key={i}
              onClick={() => fetchVagas(i + 1)}
              className={`w-12 h-12 rounded-[16px] font-black transition-all ${meta.page === i + 1 ? "bg-gray-800 text-white shadow-lg" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO COMPARTILHADO */}
      <ModalConfirmacaoAcao
        isOpen={modalConfig.isOpen}
        tipo={modalConfig.tipo}
        tituloVaga={modalConfig.tituloVaga}
        isProcessing={modalConfig.isProcessing}
        onClose={closeConfirmModal}
        onConfirm={executeConfirmAction}
      />
    </div>
  );
}