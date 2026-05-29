"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineLightningBolt,
  HiOutlineEye,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import TabDadosGerais from "@/src/components/candidato/meu-curriculo/TabDadosGerais";
import TabExperiencia from "@/src/components/candidato/meu-curriculo/TabExperiencia";
import TabFormacao from "@/src/components/candidato/meu-curriculo/TabFormacao";
import TabCompetencias from "@/src/components/candidato/meu-curriculo/TabCompetencias";
import TabRevisao from "@/src/components/candidato/meu-curriculo/TabRevisao";

// import TabRevisao from "@/src/components/candidatos/meu-curriculo/TabRevisao"; // Ativaremos na próxima etapa

export default function MeuCurriculoRefatoradoPage() {
  const [activeTab, setActiveTab] = useState("dados");
  const [isLoading, setIsLoading] = useState(true);

  const [dadosCandidato, setDadosCandidato] = useState<any>(null);
  const [isVisivel, setIsVisivel] = useState(true);

  // O Estado Inteligente do Progresso
  const [progresso, setProgresso] = useState(0);
  const [statusAbas, setStatusAbas] = useState({
    dados: false,
    experiencia: false,
    formacao: false,
    competencias: false,
  });

  const tabsOrdem = ["dados", "experiencia", "formacao", "competencias", "revisao"];
  const currentTabIndex = tabsOrdem.indexOf(activeTab);
  const [isSubFormOpen, setIsSubFormOpen] = useState(false);

  const irParaProxima = () => {
    if (currentTabIndex < tabsOrdem.length - 1) {
      setActiveTab(tabsOrdem[currentTabIndex + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" }); // Rola pro topo suavemente
    }
  };

  const irParaAnterior = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabsOrdem[currentTabIndex - 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    setIsSubFormOpen(false);
  }, [activeTab]);

  // Função que avalia o que falta no currículo
  const avaliarProgresso = (dados: any) => {
    if (!dados) return;

    const temAreas =
      dados.areas_atuacao?.length > 0 || dados.candidatoAreaAtuacao?.length > 0;
    const hasEssenciais = !!(
      dados.cpf &&
      dados.data_nascimento &&
      dados.objetivo_profissional &&
      dados.endereco?.bairro &&
      dados.endereco?.cidade
    );

    const status = {
      dados: hasEssenciais && temAreas,
      experiencia:
        dados.experiencias?.length > 0 || dados.primeiro_emprego === true,
      formacao: dados.formacoes?.length > 0,
      competencias: dados.competencias?.length > 0,
    };

    setStatusAbas(status);

    let concluidos = 0;
    if (status.dados) concluidos++;
    if (status.experiencia) concluidos++;
    if (status.formacao) concluidos++;
    if (status.competencias) concluidos++;

    setProgresso((concluidos / 4) * 100);
  };

  const carregarCurriculo = async () => {
    try {
      const res = await api.get("/candidato/meu-curriculo");
      const dados = res.data.data;

      setDadosCandidato(dados);
      setIsVisivel(dados.perfil_visivel_empresas ?? true);
      avaliarProgresso(dados);
    } catch (error) {
      toast.error("Erro ao carregar seu currículo.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarCurriculo();
  }, []);

  const handleToggleVisibilidade = async () => {
    const novoStatus = !isVisivel;
    setIsVisivel(novoStatus);
    try {
      await api.patch("/candidato/visibilidade", {
        perfil_visivel_empresas: novoStatus,
      });
      toast.success(novoStatus ? "Perfil visível!" : "Perfil oculto.");
    } catch (error: any) {
      setIsVisivel(!novoStatus);

      const mensagemErro =
        error.response?.data?.error ||
        error.message ||
        "Erro ao alterar visibilidade.";

      toast.error(mensagemErro);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    {
      id: "dados",
      label: "Dados Básicos",
      icon: <HiOutlineUser />,
      isOk: statusAbas.dados,
    },
    {
      id: "experiencia",
      label: "Experiência",
      icon: <HiOutlineBriefcase />,
      isOk: statusAbas.experiencia,
    },
    {
      id: "formacao",
      label: "Formação",
      icon: <HiOutlineAcademicCap />,
      isOk: statusAbas.formacao,
    },
    {
      id: "competencias",
      label: "Habilidades",
      icon: <HiOutlineLightningBolt />,
      isOk: statusAbas.competencias,
    },
    {
      id: "revisao",
      label: "Revisão",
      icon: <HiOutlineCheckCircle />,
      isOk: progresso === 100,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20 pt-6 md:pt-10 md:px-8 space-y-6 md:space-y-8 px-8 md:px-0 animate-in fade-in duration-700">
      <header className="mb-6 md:mb-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">
              Meu Currículo
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Mantenha seus dados atualizados para aumentar suas chances.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 md:gap-4 w-full md:w-auto">
            <Link
              href="/candidato/meu-curriculo/ver"
              className="w-full sm:w-auto flex justify-center items-center gap-2.5 px-6 py-3 md:py-4 rounded-[24px] bg-blue-50 text-primary text-sm font-bold hover:bg-blue-100 hover:text-blue-700 transition-colors"
            >
              <HiOutlineEye size={20} /> Visualizar
            </Link>

            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4 bg-white px-5 md:px-6 py-3 md:py-4 rounded-[24px] border border-gray-100 shadow-sm transition-all duration-500">
              <div className="flex flex-col text-left sm:text-right">
                <span className="text-sm font-black text-gray-800">
                  Banco de Talentos
                </span>
                <span
                  className={`text-[11px] font-bold ${isVisivel ? "text-emerald-500" : "text-gray-400"}`}
                >
                  {isVisivel ? "Visível p/ empresas" : "Perfil oculto"}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isVisivel}
                  onChange={handleToggleVisibilidade}
                />
                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-gray-700">Força do Perfil</span>
              <span
                className={
                  progresso === 100 ? "text-emerald-600" : "text-primary"
                }
              >
                {progresso}% Concluído
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${progresso === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                style={{ width: `${progresso}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-x-auto hide-scrollbar w-full md:w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-[20px] text-xs md:text-sm font-bold transition-all overflow-hidden whitespace-nowrap min-w-fit ${activeTab === tab.id
              ? "bg-blue-50 text-primary shadow-sm border-b-2 border-primary"
              : "text-gray-500 hover:bg-gray-50 border-b-2 border-transparent hover:text-gray-700"
              }`}
          >
            <span className="flex items-center gap-1.5 md:gap-2 relative z-10">
              {tab.icon} {tab.label}
            </span>
            {tab.isOk && tab.id !== "revisao" && (
              <span className="flex h-2 w-2 relative z-10 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {activeTab === "dados" && (
          <TabDadosGerais
            dadosIniciais={dadosCandidato}
            onAtualizarProgresso={carregarCurriculo}
            onNextTab={irParaProxima}
          />
        )}
        {activeTab === "experiencia" && (
          <TabExperiencia
            dadosIniciais={dadosCandidato}
            onAtualizarProgresso={carregarCurriculo}
            onFormOpenChange={setIsSubFormOpen}
          />
        )}
        {activeTab === "formacao" && (
          <TabFormacao
            dadosIniciais={dadosCandidato}
            onAtualizarProgresso={carregarCurriculo}
            onFormOpenChange={setIsSubFormOpen}
          />
        )}
        {activeTab === "competencias" && (
          <TabCompetencias
            dadosIniciais={dadosCandidato}
            onAtualizarProgresso={carregarCurriculo}
          />
        )}
        {activeTab === "revisao" && (
          <TabRevisao
            progresso={progresso}
            statusAbas={statusAbas}
            isVisivel={isVisivel}
            onToggleVisibilidade={handleToggleVisibilidade}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab !== "dados" && !isSubFormOpen && (
          <div className="flex items-center justify-between pt-10 mt-8 border-t border-gray-200/60 w-full animate-in slide-in-from-bottom-4 duration-300">
            {currentTabIndex > 0 ? (
              <button
                onClick={irParaAnterior}
                className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 bg-white border border-gray-200 hover:border-gray-300 rounded-full transition-all group shadow-sm"
              >
                <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Etapa Anterior
              </button>
            ) : <div />}

            {currentTabIndex < tabsOrdem.length - 1 ? (
              <button
                onClick={irParaProxima}
                className="flex items-center gap-2 px-8 py-3 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-full transition-all group shadow-md shadow-blue-500/20"
              >
                Próxima Etapa <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
              </button>
            ) : <div />}
          </div>
        )}
      </div>
    </div>
  );
}
