"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/src/services/api";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { BarraAcoes } from "@/src/components/empresa/banco-talentos/curriculo/BarraAcoes";

import { PerfilProfissional } from "@/src/components/empresa/banco-talentos/curriculo/PerfilProfissional";
import { Experiencias } from "@/src/components/empresa/banco-talentos/curriculo/Experiencias";
import { FormacaoAcad } from "@/src/components/empresa/banco-talentos/curriculo/FormacaoAcad";
import { Habilidades } from "@/src/components/empresa/banco-talentos/curriculo/Habilidades";

import { CurriculoIdentidade } from "@/src/components/empresa/banco-talentos/curriculo/IdentidadeContato";
import { CurriculoLogistica } from "@/src/components/empresa/banco-talentos/curriculo/LogisticaPreferencias";

// Importando os componentes modularizados

export default function DetalhesCurriculoEmpresaPage() {
  const params = useParams();
  const router = useRouter();
  const id_candidato = params.id;

  const [dadosBase, setDadosBase] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isFavorito, setIsFavorito] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);

  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const buscarDetalhes = async () => {
      try {
        const res = await api.get(`/empresas/banco-talentos/${id_candidato}`);
        const dados = res.data.data;
        setDadosBase(dados);
        setIsFavorito(dados.perfil.is_salvo || false);
      } catch (error: any) {
        toast.error("Currículo não encontrado ou oculto.");
        router.push("/empresa/banco-talentos");
      } finally {
        setIsLoading(false);
      }
    };
    if (id_candidato) buscarDetalhes();
  }, [id_candidato, router]);

  const nome = dadosBase?.perfil?.nome || "Candidato";

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Curriculo_${nome.replace(/\s+/g, "_")}`,
  });

  const handleDesbloquear = async () => {
    setIsUnlocking(true);
    try {
      const res = await api.post(`/empresas/banco-talentos/${id_candidato}/desbloquear`);
      toast.success(res.data.message || "Currículo desbloqueado com sucesso!");
      setDadosBase(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao desbloquear currículo.");
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleToggleFavorito = async () => {
    if (isFavoriting) return;
    setIsFavoriting(true);

    const previousState = isFavorito;
    setIsFavorito(!previousState);

    try {
      await api.post(`/empresas/banco-talentos/${id_candidato}/favorito`);
      toast.success(!previousState ? "Currículo salvo nos favoritos!" : "Currículo removido dos salvos.");
    } catch (error: any) {
      setIsFavorito(previousState);
      toast.error("Não foi possível salvar o currículo no momento.");
    } finally {
      setIsFavoriting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 font-bold animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        Preparando currículo...
      </div>
    );
  }

  if (!dadosBase || !dadosBase.perfil) return null;

  const { acesso_liberado, saldo_creditos_empresa } = dadosBase;
  const perfil = dadosBase.perfil;
  const idade = perfil.data_nascimento ? new Date().getFullYear() - new Date(perfil.data_nascimento).getFullYear() : null;

  return (
    <div className="max-w-5xl pt-6 md:pt-10 mx-auto pb-20 animate-in fade-in duration-700 px-4 sm:px-6">

      {/* Barra flutuante do Topo */}
      <BarraAcoes
        acessoLiberado={acesso_liberado}
        isFavorito={isFavorito}
        isFavoriting={isFavoriting}
        onToggleFavorito={handleToggleFavorito}
        onPrint={handlePrint}
      />

      {/* A FOLHA DO CURRÍCULO (A4) */}
      <div
        ref={componentRef}
        className="bg-white rounded-[40px] md:p-14 p-6 sm:p-10 shadow-sm border border-gray-100 print:shadow-none print:border-none print:m-0 print:w-full relative"
      >
        {/* Regra de impressão para forçar margens físicas */}
        <style type="text/css" media="print">
          {`
            @page { 
              size: auto; 
              margin: 15mm 15mm 15mm 15mm !important; 
            }
          `}
        </style>

        {/* 1. Identidade, Contatos ou Paywall */}
        <CurriculoIdentidade
          perfil={perfil}
          acessoLiberado={acesso_liberado}
          saldoCreditos={saldo_creditos_empresa}
          isUnlocking={isUnlocking}
          onDesbloquear={handleDesbloquear}
          idade={idade}
        />

        {/* 2. Resumo Profissional + PcD */}
        <PerfilProfissional perfil={perfil} />

        {/* 3. Experiência Profissional */}
        <Experiencias
          experiencias={perfil.experiencias}
          primeiroEmprego={perfil.primeiro_emprego}
        />

        {/* 4. Formação Acadêmica */}
        <FormacaoAcad formacoes={perfil.formacoes} />

        {/* 5. Habilidades Técnicas */}
        <Habilidades competencias={perfil.competencias} />

        {/* 6. Preferências & Logística */}
        <CurriculoLogistica perfil={perfil} />

      </div>
    </div>
  );
}