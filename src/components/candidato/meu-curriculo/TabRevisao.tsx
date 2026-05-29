"use client";

import {
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineEyeOff,
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineLightningBolt,
  HiOutlineArrowRight,
  HiOutlineEye,
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
}

export default function TabRevisao({
  progresso,
  statusAbas,
  isVisivel,
  onToggleVisibilidade,
  setActiveTab,
}: TabRevisaoProps) {
  // =========================================================================
  // CENÁRIO 1: 100% PREENCHIDO E VISÍVEL (O SUCESSO)
  // =========================================================================
  if (progresso === 100 && isVisivel) {
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
  if (progresso === 100 && !isVisivel) {
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
  // CENÁRIO 3: CURRÍCULO INCOMPLETO
  // =========================================================================
  const modulos = [
    {
      id: "dados",
      titulo: "Dados Básicos",
      icone: <HiOutlineUser size={24} />,
      isOk: statusAbas.dados,
      descricao: "Informações de contato, endereço e áreas de atuação.",
    },
    {
      id: "experiencia",
      titulo: "Experiência",
      icone: <HiOutlineBriefcase size={24} />,
      isOk: statusAbas.experiencia,
      descricao: "Seu histórico profissional ou indicação de 1º emprego.",
    },
    {
      id: "formacao",
      titulo: "Formação",
      icone: <HiOutlineAcademicCap size={24} />,
      isOk: statusAbas.formacao,
      descricao: "Nível de escolaridade e cursos extracurriculares.",
    },
    {
      id: "competencias",
      titulo: "Habilidades",
      icone: <HiOutlineLightningBolt size={24} />,
      isOk: statusAbas.competencias,
      descricao: "Ferramentas, idiomas e competências técnicas.",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 pt-4">
      <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 border-b border-gray-50 pb-6">
          <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center shrink-0 border border-blue-100">
            <HiOutlineExclamation size={32} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
              Quase lá! Faltam alguns detalhes.
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium leading-relaxed">
              O seu perfil está {progresso}% concluído. Currículos incompletos
              perdem posições no ranqueamento das buscas feitas pelas empresas.
              Preencha as seções abaixo para chegar aos 100%:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modulos.map((modulo) => (
            <div
              key={modulo.id}
              onClick={() => !modulo.isOk && setActiveTab(modulo.id)}
              className={`p-5 rounded-[24px] border-2 transition-all flex items-start gap-4 ${
                modulo.isOk
                  ? "bg-gray-50 border-gray-100 opacity-60 cursor-default"
                  : "bg-white border-blue-100 shadow-sm hover:border-blue-300 hover:shadow-md cursor-pointer group"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  modulo.isOk
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-blue-50 text-primary group-hover:bg-blue-100"
                }`}
              >
                {modulo.isOk ? (
                  <HiOutlineCheckCircle size={24} />
                ) : (
                  modulo.icone
                )}
              </div>
              <div className="flex-1">
                <h3
                  className={`font-black text-base ${modulo.isOk ? "text-gray-500 line-through" : "text-gray-800"}`}
                >
                  {modulo.titulo}
                </h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5 line-clamp-2">
                  {modulo.descricao}
                </p>
                {!modulo.isOk && (
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary mt-3 group-hover:translate-x-1 transition-transform">
                    Preencher agora <HiOutlineArrowRight />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
