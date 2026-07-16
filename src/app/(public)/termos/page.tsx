"use client";

import { useState, useEffect } from "react";
import {
  HiOutlineClipboardList,
  HiOutlineCheckCircle,
  HiOutlineUser,
  HiOutlineEye,
  HiOutlineBriefcase,
  HiOutlineExclamationCircle,
  HiOutlineScale,
  HiOutlineOfficeBuilding,
  HiOutlineShieldCheck
} from "react-icons/hi";

export default function TermosDeUsoPage() {
  const [activeTab, setActiveTab] = useState<"candidato" | "empresa">("candidato");
  const [activeSection, setActiveSection] = useState("introducao");

  // Função para rolar suavemente até à secção e atualizar o menu ativo
  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Atualiza o menu ativo com base no scroll da página
  useEffect(() => {
    const handleScroll = () => {
      const sectionsCandidato = [
        "introducao",
        "cadastro",
        "visibilidade",
        "responsabilidades",
        "limitacoes",
        "disposicoes",
      ];
      const sectionsEmpresa = [
        "emp-introducao",
        "emp-acesso",
        "emp-vagas",
        "emp-lgpd",
        "emp-limitacoes",
        "emp-penalidades",
      ];

      const currentSections = activeTab === "candidato" ? sectionsCandidato : sectionsEmpresa;
      let current = currentSections[0];

      for (const section of currentSections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab]);

  // Menu Lateral - Candidato
  const menuCandidato = [
    { id: "introducao", label: "1. Introdução e Aceitação" },
    { id: "cadastro", label: "2. Registo e Conta" },
    { id: "visibilidade", label: "3. Perfil e Visibilidade" },
    { id: "responsabilidades", label: "4. Suas Responsabilidades" },
    { id: "limitacoes", label: "5. Isenção de Garantias" },
    { id: "disposicoes", label: "6. Disposições Finais" },
  ];

  // Menu Lateral - Empresa
  const menuEmpresa = [
    { id: "emp-introducao", label: "1. Natureza do Serviço" },
    { id: "emp-acesso", label: "2. Acesso e Credenciais" },
    { id: "emp-vagas", label: "3. Publicação de Vagas" },
    { id: "emp-lgpd", label: "4. Uso de Dados (LGPD)" },
    { id: "emp-limitacoes", label: "5. Limitação de Responsabilidade" },
    { id: "emp-penalidades", label: "6. Penalidades e Suspensão" },
  ];

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 md:px-10 animate-in fade-in duration-700">

      {/* ================= HEADER ================= */}
      <header className="mb-12 md:mb-16 text-center max-w-3xl mx-auto space-y-6">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-sm border border-primary/20">
          <HiOutlineScale size={40} />
        </div>

        {/* TOGGLE CANDIDATO / EMPRESA */}
        <div className="inline-flex bg-gray-100 p-1.5 rounded-full border border-gray-200">
          <button
            onClick={() => {
              setActiveTab("candidato");
              setActiveSection("introducao");
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === "candidato"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-900"
              }`}
          >
            <HiOutlineUser size={16} /> Para Candidatos
          </button>
          <button
            onClick={() => {
              setActiveTab("empresa");
              setActiveSection("emp-introducao");
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === "empresa"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
              }`}
          >
            <HiOutlineOfficeBuilding size={16} /> Para Empresas
          </button>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
          Termos e Condições de Uso
        </h1>
        <p className="text-gray-500 text-base md:text-lg font-medium leading-relaxed">
          {activeTab === "candidato"
            ? "Regras e diretrizes para a utilização da plataforma ACI Vagas por candidatos em busca de oportunidades."
            : "Diretrizes legais e de conduta para empresas cadastradas na plataforma ACI Vagas."}
        </p>
      </header>

      {/* ================= CONTEÚDO COM SIDEBAR ================= */}
      <div className="flex flex-col lg:flex-row gap-12 items-start relative">

        {/* SIDEBAR DE NAVEGAÇÃO (Sticky) */}
        <aside className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-8 hidden md:block bg-surface p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-2">
            Índice - {activeTab === "candidato" ? "Candidato" : "Empresa"}
          </h3>
          <nav className="flex flex-col space-y-1">
            {(activeTab === "candidato" ? menuCandidato : menuEmpresa).map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeSection === item.id
                    ? activeTab === "candidato"
                      ? "bg-primary/10 text-primary"
                      : "bg-emerald-50 text-emerald-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ÁREA DE TEXTO LEGAL */}
        <main className="flex-1 w-full bg-surface p-8 md:p-12 rounded-[40px] border border-gray-100 shadow-sm text-gray-600 space-y-16 animate-in slide-in-from-bottom-4 duration-500">

          {activeTab === "candidato" ? (
            /* ================= CONTEÚDO CANDIDATO ================= */
            <>
              <section id="introducao" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="w-2 h-8 bg-primary rounded-full"></span>
                  Introdução e Aceitação
                </h2>
                <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
                  <p>
                    Bem-vindo a plataforma de empregos da <strong>Associação Comercial e Industrial de Panambi (ACI)</strong>. Este documento ("Termos de Uso") estabelece as regras para o acesso e utilização da plataforma por pessoas singulares ("Candidatos") que procuram oportunidades no mercado de trabalho.
                  </p>
                  <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 mt-4 flex gap-4 items-start">
                    <HiOutlineCheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={24} />
                    <p className="text-emerald-800 text-sm">
                      Ao criar uma conta e submeter o seu currículo, o Candidato declara ter lido, compreendido e <strong>aceite expressamente</strong> todas as condições aqui estabelecidas, bem como a nossa Política de Privacidade.
                    </p>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="cadastro" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="w-2 h-8 bg-primary rounded-full"></span>
                  Registo e Segurança da Conta
                </h2>
                <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
                  <p>Para aceder às funcionalidades da plataforma, o Candidato deve criar uma conta fornecendo informações precisas e atuais.</p>
                  <ul className="space-y-3 pl-2">
                    <li className="flex items-start gap-3">
                      <HiOutlineUser className="text-primary shrink-0 mt-1" size={20} />
                      <span><strong>Uso Pessoal:</strong> A conta é pessoal e intransmissível. O Candidato é o único responsável pela guarda e sigilo das suas credenciais de acesso.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <HiOutlineExclamationCircle className="text-amber-500 shrink-0 mt-1" size={20} />
                      <span><strong>Veracidade dos Dados:</strong> A ACI-Panambi reserva-se o direito de suspender ou eliminar perfis que contenham informações comprovadamente falsas, ofensivas ou que violem a legislação em vigor.</span>
                    </li>
                  </ul>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="visibilidade" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="w-2 h-8 bg-primary rounded-full"></span>
                  Perfil do Candidato e Visibilidade
                </h2>
                <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
                  <p>
                    O nosso sistema oferece um modelo de <strong>Vitrine de Talentos</strong>. O Candidato detém controlo total sobre a visibilidade do seu perfil.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
                      <HiOutlineEye className="text-blue-500 mb-3" size={28} />
                      <h4 className="font-black text-gray-900 mb-2">Perfil Visível (Ativo)</h4>
                      <p className="text-sm text-gray-600">
                        O seu currículo será apresentado nas pesquisas das empresas. O seu nome e dados de contato permanecerão ocultos até que uma empresa parceira decida desbloquear o seu perfil para o contactar.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
                      <HiOutlineEye className="text-gray-400 mb-3" size={28} />
                      <h4 className="font-black text-gray-900 mb-2">Perfil Oculto (Pausado)</h4>
                      <p className="text-sm text-gray-600">
                        O currículo não aparecerá em novas pesquisas. As empresas que já o tinham desbloqueado anteriormente mantêm acesso aos seus contatos.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="responsabilidades" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="w-2 h-8 bg-primary rounded-full"></span>
                  Responsabilidades do Utilizador
                </h2>
                <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
                  <p>Ao utilizar a plataforma da ACI Vagas, o Candidato compromete-se a:</p>
                  <ul className="space-y-2 pl-2">
                    <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Não utilizar a plataforma para fins ilícitos, fraudulentos ou discriminatórios.</li>
                    <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Não inserir no currículo dados sensíveis desnecessários, salvo os campos opcionais fornecidos estritamente para ações de inclusão.</li>
                    <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Não partilhar, copiar ou distribuir informações de vagas ou dados de terceiros sem autorização prévia.</li>
                  </ul>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="limitacoes" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="w-2 h-8 bg-primary rounded-full"></span>
                  Isenção e Limitação de Garantias
                </h2>
                <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
                  <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 mb-4">
                    <p className="text-amber-800 text-sm">
                      <strong>Importante:</strong> A ACI-Panambi atua exclusivamente como uma ponte tecnológica entre as empresas (empregadores) e os profissionais (candidatos).
                    </p>
                  </div>
                  <ul className="space-y-3 pl-2">
                    <li className="flex items-start gap-3">
                      <HiOutlineBriefcase className="text-gray-400 shrink-0 mt-1" size={20} />
                      <span>A ACI-Panambi <strong>não garante</strong> a contratação, entrevista ou resposta por parte das empresas cadastradas na plataforma.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <HiOutlineBriefcase className="text-gray-400 shrink-0 mt-1" size={20} />
                      <span>A ACI-Panambi não tem interferência nos critérios de seleção conduzidos pelas empresas.</span>
                    </li>
                  </ul>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="disposicoes" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="w-2 h-8 bg-primary rounded-full"></span>
                  Disposições Finais
                </h2>
                <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
                  <p><strong>Atualizações:</strong> A ACI-Panambi poderá alterar estes Termos de Uso a qualquer momento. Modificações substanciais serão notificadas na plataforma.</p>
                  <p><strong>Cancelamento:</strong> O Candidato pode solicitar a exclusão definitiva da sua conta e currículo a qualquer momento, através das configurações do seu perfil.</p>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 mt-6 text-sm">
                    <p>
                      <strong>Foro:</strong> Fica eleito o foro da Comarca de Panambi, Estado do Rio Grande do Sul, para dirimir quaisquer dúvidas oriundas deste documento.
                    </p>
                  </div>
                </div>
              </section>
            </>
          ) : (
            /* ================= CONTEÚDO EMPRESA ================= */
            <>
              <section id="emp-introducao" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                  Natureza do Serviço
                </h2>
                <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
                  <p>
                    A ACI Vagas atua exclusivamente como uma ponte tecnológica e facilitadora entre empresas da região e profissionais em busca de oportunidades.
                  </p>
                  <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 mt-4">
                    <p className="text-amber-800 text-sm">
                      Não participamos das etapas de seleção, entrevistas ou negociações salariais. O processo seletivo e a decisão final de contratação são de inteira responsabilidade da <strong>empresa anunciante</strong>.
                    </p>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="emp-acesso" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                  Acesso e Credenciais
                </h2>
                <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
                  <p>O acesso a plataforma das Empresas é restrito a organizações cadastradas e, quando aplicável, associadas à ACI-Panambi.</p>
                  <p>
                    As credenciais de acesso (e-mail e senha) são de uso corporativo, pessoal e intransferível. A empresa é integralmente responsável por qualquer atividade realizada em sua conta, devendo notificar a ACI-Panambi imediatamente caso suspeite de uso indevido por terceiros ou ex-funcionários.
                  </p>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="emp-vagas" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                  Regras para Publicação de Vagas
                </h2>
                <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
                  <p>O nosso compromisso é com um mercado de trabalho ético e transparente. Ao publicar uma vaga, a empresa se compromete a:</p>
                  <ul className="space-y-3 pl-2">
                    <li className="flex items-start gap-3">
                      <HiOutlineCheckCircle className="text-emerald-600 shrink-0 mt-1" size={20} />
                      <span><strong>Fornecer informações reais:</strong> O escopo, os requisitos e os benefícios da vaga devem ser verdadeiros. É proibida a publicação de vagas falsas ou esquemas de pirâmide.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <HiOutlineScale className="text-emerald-600 shrink-0 mt-1" size={20} />
                      <span><strong>Respeitar a CLT:</strong> Em conformidade com o Art. 373-A da CLT e a CF, é expressamente proibido publicar anúncios com exigências discriminatórias baseadas em sexo, idade, cor, raça, religião, situação familiar ou deficiência.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <HiOutlineClipboardList className="text-emerald-600 shrink-0 mt-1" size={20} />
                      <span><strong>Manter a atualização:</strong> As vagas devem ser encerradas ou pausadas na plataforma assim que o processo seletivo for concluído.</span>
                    </li>
                  </ul>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="emp-lgpd" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                  Uso de Dados dos Candidatos (LGPD)
                </h2>
                <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
                  <p>
                    Ao acessar currículos e informações de candidatos através da ACI Vagas, a sua empresa assume o papel de <strong>Controladora de Dados</strong> sob a óptica da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), comprometendo-se a:
                  </p>
                  <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                    <ul className="space-y-4 text-emerald-900">
                      <li className="flex items-start gap-3">
                        <HiOutlineShieldCheck className="shrink-0 mt-1" size={20} />
                        Utilizar os dados exclusivamente para fins de recrutamento e seleção da vaga em questão.
                      </li>
                      <li className="flex items-start gap-3">
                        <HiOutlineShieldCheck className="shrink-0 mt-1" size={20} />
                        Não comercializar, compartilhar ou ceder o banco de dados de candidatos a terceiros.
                      </li>
                      <li className="flex items-start gap-3">
                        <HiOutlineShieldCheck className="shrink-0 mt-1" size={20} />
                        Garantir o descarte seguro dos currículos extraídos da plataforma após a finalização do processo seletivo, salvo consentimento do candidato para retenção futura.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="emp-limitacoes" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                  Limitação de Responsabilidade
                </h2>
                <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
                  <p>A ACI-Panambi empenha os melhores esforços para manter a plataforma segura, mas não garante disponibilidade ininterrupta do sistema, estando sujeita a manutenções técnicas.</p>
                  <p>Não nos responsabilizamos pela veracidade das informações inseridas pelos candidatos em seus perfis. Cabe à empresa validar diplomas, experiências e referências durante as etapas de entrevista e contratação.</p>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="emp-penalidades" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                  Penalidades e Atualizações
                </h2>
                <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
                  <p><strong>Suspensão:</strong> Para manter a qualidade e segurança do ecossistema, reservamo-nos o direito de suspender ou cancelar o acesso de empresas que violarem qualquer cláusula destes Termos, utilizarem linguagem ofensiva, ou receberem denúncias recorrentes de candidatos sobre práticas abusivas.</p>
                  <p><strong>Atualizações:</strong> A ACI-Panambi poderá atualizar estes Termos de Uso periodicamente. As empresas serão notificadas, e o uso contínuo implicará na aceitação das novas regras.</p>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 mt-6 text-sm">
                    <p>
                      <strong>Foro:</strong> Fica eleito o foro da Comarca de Panambi, Estado do Rio Grande do Sul, para dirimir quaisquer dúvidas oriundas deste documento.
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}

        </main>
      </div>
    </div>
  );
}