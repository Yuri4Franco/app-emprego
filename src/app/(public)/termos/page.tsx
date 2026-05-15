"use client";

import { useState, useEffect } from "react";
import { 
  HiOutlineClipboardList, 
  HiOutlineCheckCircle, 
  HiOutlineUser, 
  HiOutlineEye, 
  HiOutlineBriefcase,
  HiOutlineExclamationCircle,
  HiOutlineScale
} from "react-icons/hi";

export default function TermosDeUsoPage() {
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
      const sections = [
        "introducao", 
        "cadastro", 
        "visibilidade", 
        "responsabilidades", 
        "limitacoes", 
        "disposicoes"
      ];
      let current = "introducao";

      for (const section of sections) {
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
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 md:px-10 animate-in fade-in duration-700">
      
      {/* ================= HEADER ================= */}
      <header className="mb-12 md:mb-16 text-center max-w-3xl mx-auto space-y-6">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-sm border border-primary/20">
          <HiOutlineScale size={40} />
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200">
          <HiOutlineClipboardList size={16} />
          Termos de Uso - Candidatos
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
          Termos e Condições de Uso
        </h1>
        <p className="text-gray-500 text-base md:text-lg font-medium leading-relaxed">
          Regras e diretrizes para a utilização do portal ACI Vagas por candidatos em busca de oportunidades.
        </p>
      </header>

      {/* ================= CONTEÚDO COM SIDEBAR ================= */}
      <div className="flex flex-col lg:flex-row gap-12 items-start relative">
        
        {/* SIDEBAR DE NAVEGAÇÃO (Sticky) */}
        <aside className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-8 hidden md:block bg-surface p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-2">
            Índice
          </h3>
          <nav className="flex flex-col space-y-1">
            {[
              { id: "introducao", label: "1. Introdução e Aceitação" },
              { id: "cadastro", label: "2. Registo e Conta" },
              { id: "visibilidade", label: "3. Perfil e Visibilidade" },
              { id: "responsabilidades", label: "4. Suas Responsabilidades" },
              { id: "limitacoes", label: "5. Isenção de Garantias" },
              { id: "disposicoes", label: "6. Disposições Finais" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeSection === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ÁREA DE TEXTO LEGAL */}
        <main className="flex-1 w-full bg-surface p-8 md:p-12 rounded-[40px] border border-gray-100 shadow-sm text-gray-600 space-y-16">
          
          {/* SEÇÃO 1 */}
          <section id="introducao" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <span className="w-2 h-8 bg-primary rounded-full"></span>
              Introdução e Aceitação
            </h2>
            <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
              <p>
                Bem-vindo ao portal de empregos da <strong>Associação Comercial e Industrial de Panambi (ACI)</strong>. Este documento ("Termos de Uso") estabelece as regras para o acesso e utilização da plataforma por pessoas singulares ("Candidatos") que procuram oportunidades no mercado de trabalho.
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

          {/* SEÇÃO 2 */}
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
                  <span><strong>Veracidade dos Dados:</strong> A ACI reserva-se o direito de suspender ou eliminar perfis que contenham informações comprovadamente falsas, ofensivas ou que violem a legislação em vigor.</span>
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* SEÇÃO 3 */}
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
                    O seu currículo será apresentado nas pesquisas das empresas. O seu nome e dados de contato permanecerão ocultos até que uma empresa parceira ou pagante decida "desbloquear" o seu perfil para o contactar.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
                  <HiOutlineEye className="text-gray-400 mb-3" size={28} />
                  <h4 className="font-black text-gray-900 mb-2">Perfil Oculto (Pausado)</h4>
                  <p className="text-sm text-gray-600">
                    O currículo não aparecerá em novas pesquisas. As empresas que já o tinham desbloqueado anteriormente mantêm acesso aos seus contatos na respetiva área de "Salvos".
                  </p>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* SEÇÃO 4 */}
          <section id="responsabilidades" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <span className="w-2 h-8 bg-primary rounded-full"></span>
              Responsabilidades do Utilizador
            </h2>
            <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
              <p>Ao utilizar o portal da ACI Vagas, o Candidato compromete-se a:</p>
              <ul className="space-y-2 pl-2">
                <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Não utilizar a plataforma para fins ilícitos, fraudulentos ou discriminatórios.</li>
                <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Não inserir no currículo dados sensíveis desnecessários, salvo os campos opcionais (ex: PcD) fornecidos estritamente para ações de inclusão.</li>
                <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Não partilhar, copiar ou distribuir informações de vagas ou dados de terceiros sem autorização prévia.</li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* SEÇÃO 5 */}
          <section id="limitacoes" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <span className="w-2 h-8 bg-primary rounded-full"></span>
              Isenção e Limitação de Garantias
            </h2>
            <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 mb-4">
                <p className="text-amber-800 text-sm">
                  <strong>Importante:</strong> A ACI atua exclusivamente como uma ponte tecnológica entre as empresas (empregadores) e os profissionais (candidatos).
                </p>
              </div>
              <ul className="space-y-3 pl-2">
                <li className="flex items-start gap-3">
                  <HiOutlineBriefcase className="text-gray-400 shrink-0 mt-1" size={20} />
                  <span>A ACI <strong>não garante</strong> a contratação, entrevista ou resposta por parte das empresas cadastradas no portal.</span>
                </li>
                <li className="flex items-start gap-3">
                  <HiOutlineBriefcase className="text-gray-400 shrink-0 mt-1" size={20} />
                  <span>A ACI não tem interferência nos critérios de seleção, testes ou etapas de recrutamento conduzidas pelas empresas.</span>
                </li>
                <li className="flex items-start gap-3">
                  <HiOutlineBriefcase className="text-gray-400 shrink-0 mt-1" size={20} />
                  <span>O portal não se responsabiliza por eventuais falhas de comunicação ou promessas de vagas feitas fora do ambiente oficial da plataforma.</span>
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* SEÇÃO 6 */}
          <section id="disposicoes" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <span className="w-2 h-8 bg-primary rounded-full"></span>
              Disposições Finais
            </h2>
            <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
              <p><strong>Atualizações:</strong> A ACI poderá alterar estes Termos de Uso a qualquer momento. Modificações substanciais serão notificadas no portal. O uso contínuo da plataforma implica a aceitação das novas regras.</p>
              <p><strong>Cancelamento:</strong> O Candidato pode solicitar a exclusão definitiva da sua conta e currículo a qualquer momento, através das configurações do seu perfil, sendo os dados eliminados conforme estipulado na Política de Privacidade.</p>
              
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 mt-6 text-sm">
                <p>
                  <strong>Foro:</strong> Fica eleito o foro da Comarca de Panambi, Estado do Rio Grande do Sul, para dirimir quaisquer dúvidas oriundas deste documento, com renúncia a qualquer outro, por mais privilegiado que seja.
                </p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}