"use client";

import {
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineEyeOff,
  HiOutlineArrowRight,
  HiOutlineEye,
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineLightningBolt,
  HiOutlinePlusCircle,
} from "react-icons/hi";
import Link from "next/link";

interface TabRevisaoProps {
  progresso: number;
  statusAbas: {
    dados: boolean;
    experiencia: boolean;
    formacao: boolean;
    competencias: boolean;
  };
  isVisivel: boolean;
  onToggleVisibilidade: () => void;
  setActiveTab: (tabId: string) => void;
  dadosCandidato: any;
}

export default function TabRevisao({
  progresso,
  statusAbas,
  isVisivel,
  onToggleVisibilidade,
  setActiveTab,
  dadosCandidato,
}: TabRevisaoProps) {
  const getItensPendentes = (candidato: any) => {
    if (!candidato) return [];
    const pendencias = [];

    // --- DADOS BÁSICOS ---
    if (!candidato.cpf) {
      pendencias.push({ titulo: "Cadastrar seu CPF", aba: "dados" });
    }
    if (!candidato.whatsapp && !candidato.telefone) {
      pendencias.push({ titulo: "Informe um WhatsApp/Telefone", aba: "dados" });
    }
    if (!candidato.data_nascimento) {
      pendencias.push({ titulo: "Preencha sua data de nascimento", aba: "dados" });
    }
    if (!candidato.endereco?.bairro || !candidato.endereco?.cidade || !candidato.endereco?.estado || !candidato.endereco?.cep || !candidato.endereco?.logradouro || !candidato.endereco?.numero) {
      pendencias.push({ titulo: "Complete seu endereço", aba: "dados" });
    }

    const areasSalvas = candidato.areas_atuacao || candidato.candidatoAreaAtuacao || [];
    if (areasSalvas.length === 0) {
      pendencias.push({ titulo: "Selecione ao menos uma área de atuação", aba: "dados" });
    }

    if (!candidato.objetivo_profissional) {
      pendencias.push({ titulo: "Escreva seu Objetivo Profissional", aba: "dados" });
    }

    if (!candidato.resumo_profissional) {
      pendencias.push({ titulo: "Escreva seu Resumo Profissional", aba: "dados" });
    }

    // --- EXPERIÊNCIA ---
    if ((!candidato.experiencias || candidato.experiencias.length === 0) && !candidato.primeiro_emprego) {
      pendencias.push({ titulo: "Adicione suas experiências profissionais ou marque 'Busco 1º Emprego'", aba: "experiencia" });
    }

    // --- FORMAÇÃO ---
    if (!candidato.formacoes || candidato.formacoes.length === 0) {
      pendencias.push({ titulo: "Adicione seu nível escolar ou formação acadêmica", aba: "formacao" });
    }

    // --- COMPETÊNCIAS ---
    if (!candidato.competencias || candidato.competencias.length === 0) {
      pendencias.push({ titulo: "Adicione ao menos uma habilidade", aba: "competencias" });
    }

    return pendencias;
  };

  const pendencias = getItensPendentes(dadosCandidato);

  // Função auxiliar para dar um ícone bonitinho dependendo da aba que falta
  const getIconeAba = (aba: string) => {
    switch (aba) {
      case "dados": return <HiOutlineUser size={22} />;
      case "experiencia": return <HiOutlineBriefcase size={22} />;
      case "formacao": return <HiOutlineAcademicCap size={22} />;
      case "competencias": return <HiOutlineLightningBolt size={22} />;
      default: return <HiOutlinePlusCircle size={22} />;
    }
  };

  // =========================================================================
  // CENÁRIO 1: 100% PREENCHIDO E VISÍVEL (O SUCESSO)
  // =========================================================================
  if (progresso >= 100 && isVisivel) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-[32px] md:rounded-[40px] shadow-sm border border-emerald-100 text-center animate-in zoom-in-95 duration-500 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-40 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
            <HiOutlineCheckCircle size={40} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-emerald-900 tracking-tight mb-4">
            Parabéns! Seu currículo está completo!
          </h2>
          <p className="text-sm md:text-base font-medium text-emerald-700/80 max-w-xl mx-auto leading-relaxed mb-8">
            Você completou 100% do seu currículo e ele está ativo no nosso Banco
            de Talentos. Desejamos muito sucesso e boas entrevistas!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/candidato/meu-curriculo/ver"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-200 transition-all hover:scale-105 active:scale-95"
            >
              Visualizar meu Currículo
            </Link>
            <Link
              href="/vagas"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-emerald-700 border border-emerald-200 rounded-full font-black text-sm uppercase tracking-widest transition-all"
            >
              Procurar Vagas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CENÁRIO 2: 100% PREENCHIDO MAS INVISÍVEL (O DRAMA)
  // =========================================================================
  if (progresso >= 100 && !isVisivel) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/30 p-8 md:p-12 rounded-[32px] md:rounded-[40px] shadow-sm border border-amber-200 text-center animate-in zoom-in-95 duration-500 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-200 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 opacity-30 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="w-20 h-20 bg-white text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-amber-100 animate-bounce">
            <HiOutlineEyeOff size={40} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-amber-900 tracking-tight mb-4">
            Um currículo incrível... que ninguém pode ver!
          </h2>
          <p className="text-sm md:text-base font-medium text-amber-800/80 max-w-xl mx-auto leading-relaxed mb-8">
            Seu perfil está 100% completo e com grandes chances de destaque, mas
            no momento ele está <strong>invisível</strong> para as empresas. Não
            deixe as oportunidades passarem!
          </p>
          <button
            onClick={onToggleVisibilidade}
            className="w-full sm:w-auto px-10 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-black text-sm uppercase tracking-widest shadow-lg shadow-amber-200 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 mx-auto"
          >
            <HiOutlineEye size={20} /> Ativar Visibilidade Agora
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CENÁRIO 3: CURRÍCULO INCOMPLETO (A CHECKLIST AMIGÁVEL)
  // =========================================================================
  return (
    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 pt-4">
      <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-sm border border-gray-100">

        {/* Cabeçalho com Barra de Progresso */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
            <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center shrink-0 border border-blue-100">
              <HiOutlineExclamation size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                Quase lá! Faltam {pendencias.length} detalhes.
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-medium leading-relaxed">
                Seu perfil está <strong className="text-primary">{progresso}%</strong> concluído. Currículos incompletos
                perdem posições nas buscas feitas pelas empresas. Complete os itens abaixo para chegar ao topo!
              </p>
            </div>
          </div>

          {/* Barra Visual */}
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progresso}%` }}
            ></div>
          </div>
        </div>

        {/* Lista de Pendências em Cards Bonitos */}
        {pendencias.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendencias.map((item, index) => (
              <div
                key={index}
                onClick={() => setActiveTab(item.aba)}
                className="group flex items-center justify-between p-5 bg-white border-2 border-dashed border-gray-200 rounded-[24px] cursor-pointer hover:border-primary hover:bg-blue-50/30 hover:shadow-sm transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-primary group-hover:shadow-sm flex items-center justify-center transition-all shrink-0">
                    {getIconeAba(item.aba)}
                  </div>
                  <span className="text-sm font-bold text-gray-600 group-hover:text-primary transition-colors pr-2">
                    {item.titulo}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all shrink-0 group-hover:translate-x-1">
                  <HiOutlineArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-[24px] border border-gray-100 animate-pulse">
            <p className="text-gray-500 font-bold">Analisando suas informações...</p>
          </div>
        )}
      </div>
    </div>
  );
}