"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  HiOutlineArrowLeft,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
} from "react-icons/hi";
import { HiOutlineDocumentText } from "react-icons/hi2";

// Importação estática das imagens (Formato WebP conforme solicitado)
import imgPasso1 from "@/src/assets/faq/registro-1.webp";
import imgPasso1Android from "@/src/assets/faq/registro-1-android.webp";
import imgCurriculo1 from "@/src/assets/faq/curriculo-1.webp";
import imgCurriculo2 from "@/src/assets/faq/curriculo-2.webp";
import imgCurriculo3 from "@/src/assets/faq/curriculo-3.webp";
import imgCurriculo4 from "@/src/assets/faq/curriculo-4.webp";
import imgCurriculo5 from "@/src/assets/faq/curriculo-5.webp";
import imgCurriculo6 from "@/src/assets/faq/curriculo-6.webp";

export default function GuiaCurriculoPage() {
  const router = useRouter();

  // A descrição agora aceita ReactNode para podermos usar formatação rica (listas, negritos)
  const passos: {
    id: string;
    titulo: string;
    descricao: React.ReactNode;
    imagem: any;
  }[] = [
    {
      id: "1",
      titulo: "1. Acesse a Área do Candidato",
      descricao: (
        <>
          Acesse a plataforma ACI Empregos e clique no botão{" "}
          <strong>Área do Candidato</strong>. Insira o seu e-mail e a sua senha
          cadastrada para entrar na sua conta.
        </>
      ),
      imagem: imgPasso1,
    },
    {
      id: "1-1",
      titulo: "1.1. Acesso pelo Smartphone",
      descricao: (
        <>
          Pelo telemóvel, toque no botão de menu (os três traços no canto
          superior). Busque pela opção <strong>Área do Candidato</strong> e faça
          o login normalmente com o seu e-mail e senha.
        </>
      ),
      imagem: imgPasso1Android,
    },
    {
      id: "2",
      titulo: "2. Conhecendo a Página Inicial",
      descricao: (
        <>
          Após o login, você verá o seu painel. Ele exibe informações sobre
          vagas na sua área, visualizações do seu perfil e candidaturas ativas.
          Também há um botão rápido para controlar a sua visibilidade no Banco
          de Talentos. <br />
          <br />
          Para iniciar a nossa jornada rumo aos 100%, clique no botão{" "}
          <strong>"Preencher Currículo"</strong> ou utilize o menu lateral
          navegando até <strong>"Meu Currículo"</strong>.
        </>
      ),
      imagem: imgCurriculo1,
    },
    {
      id: "3",
      titulo: "3. O Painel do Seu Currículo",
      descricao: (
        <>
          Esta é a sua central de comando! No topo, você encontra atalhos para
          visualizar o currículo completo (excelente para revisar, imprimir ou
          salvar em PDF) e a chave que controla a sua visibilidade para as
          empresas da ACI Panambi (ativada automaticamente quando concluir o
          cadastro). <br />
          <br />
          Observe a <strong>barra de status</strong> e as abas de navegação:
          "Dados Básicos", "Experiências", "Formações" e "Habilidades". O nosso
          objetivo é deixar essa barra em 100%. Vamos preencher a primeira aba!
        </>
      ),
      imagem: imgCurriculo2,
    },
    {
      id: "4",
      titulo: "4. Preenchendo os Dados Pessoais",
      descricao: (
        <>
          Na aba <strong>Dados Básicos</strong>, começamos pelas informações de
          contato fundamentais. Adicione uma <strong>Foto de Perfil</strong>{" "}
          profissional (é opcional, mas aumenta a confiança dos recrutadores).{" "}
          <br />
          <br />
          Em seguida, preencha os campos obrigatórios: CPF, Data de Nascimento,
          Gênero e o número do seu WhatsApp. Se possuir, adicione um telefone
          secundário para recados.
        </>
      ),
      imagem: imgCurriculo3,
    },
    {
      id: "5",
      titulo: "5. Endereço e Localização",
      descricao: (
        <>
          Role a página para baixo e preencha os dados do seu endereço atual
          (CEP, Rua/Avenida, Número da residência, Bairro, Cidade e a UF). O
          complemento é opcional. Manter isso atualizado é vital, pois as
          empresas avaliam a viabilidade logística da sua contratação.
        </>
      ),
      imagem: imgCurriculo4,
    },
    {
      id: "6",
      titulo: "6. Perfil Profissional (O Coração do Currículo)",
      descricao: (
        <div className="space-y-4">
          <p>
            Esta é a parte mais lida pelas empresas. Dedique atenção especial a
            estes campos:
          </p>
          <ul className="list-disc pl-5 space-y-3 text-sm">
            <li>
              <strong>Áreas de Atuação:</strong> Escolha até 10 áreas. O sistema
              utiliza essas marcações como filtro principal no Banco de
              Talentos. Escolha as áreas em que já possui experiência ou aquelas
              em que deseja iniciar.
            </li>
            <li>
              <strong>Resumo Profissional:</strong> Um parágrafo curto (3 a 5
              linhas) sobre a sua jornada. Destaque seus anos de experiência,
              principais habilidades e o que você entrega de valor.{" "}
              <em>
                Ex: Profissional ágil com 3 anos de experiência em atendimento
                ao cliente, focado na resolução de problemas e alcance de metas.
              </em>
            </li>
            <li>
              <strong>Objetivos Profissionais:</strong> Qual é o seu foco atual?
              Deixe claro o tipo de cargo que você almeja. Isso alinha as suas
              expectativas com as oportunidades certas.
            </li>
            <li>
              <strong>Pretensão Salarial:</strong> (Opcional) Informar um valor
              ajuda a filtrar vagas que correspondam à sua realidade financeira,
              poupando o seu tempo e o da empresa.
            </li>
          </ul>
        </div>
      ),
      imagem: imgCurriculo5,
    },
    {
      id: "7",
      titulo: "7. Preferências e Perfil Inclusivo",
      descricao: (
        <>
          Na última etapa desta aba, informe as suas preferências de contato,
          turno desejado, flexibilidade de horários e qual a sua categoria de
          CNH (Carteira de Motorista), caso possua.
          <br />
          <br />
          No <strong>Perfil Inclusivo</strong>, se você se identifica como uma
          Pessoa com Deficiência (PcD) ou neurodivergente, marque a caixa de
          seleção e detalhe as informações. A ACI e as empresas valorizam a
          diversidade e precisam destas informações para garantir acessibilidade
          e adaptações necessárias na hora de o receber.
        </>
      ),
      imagem: imgCurriculo6,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-24">
      {/* CABEÇALHO */}
      <div className="flex items-center gap-4 border-b border-gray-200/60 pb-6">
        <button
          onClick={() => router.back()}
          className="p-3 bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50 rounded-2xl transition-all text-gray-500 hover:text-blue-600 shadow-sm group shrink-0"
        >
          <HiOutlineArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-1 flex items-center gap-2">
            <HiOutlineSparkles className="text-blue-600" size={28} /> Currículo
            100%
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            O guia definitivo para preencher o seu currículo e multiplicar as
            suas chances de contratação.
          </p>
        </div>
      </div>

      {/* FLUXO PASSO A PASSO (TIMELINE RESPONSIVA) */}
      <div className="relative border-l-2 border-gray-100 ml-4 md:ml-6 space-y-16 md:space-y-24">
        {passos.map((passo) => (
          <div key={passo.id} className="relative pl-6 md:pl-12 group">
            {/* Indicador visual da Timeline */}
            <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-4 border-gray-200 group-hover:border-blue-500 transition-colors flex items-center justify-center z-10">
              <div className="w-1.5 h-1.5 bg-transparent rounded-full group-hover:bg-blue-500 transition-colors" />
            </div>

            {/* Conteúdo do Passo */}
            <div className="space-y-5">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                  {passo.titulo}
                </h3>
                {/* Modificado para suportar o ReactNode da descrição */}
                <div className="text-base text-gray-600 font-medium leading-relaxed max-w-3xl">
                  {passo.descricao}
                </div>
              </div>

              {/* CONTAINER DA IMAGEM */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl md:rounded-3xl p-2 sm:p-5 max-w-4xl overflow-hidden shadow-inner">
                <Image
                  src={passo.imagem}
                  alt={passo.titulo}
                  placeholder="blur"
                  className="w-full h-auto rounded-xl md:rounded-2xl border border-gray-200/60 shadow-sm object-contain bg-white"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CARD DE SUCESSO NO FINAL */}
      <div className="bg-blue-600 rounded-[32px] p-8 md:p-12 text-white shadow-xl shadow-blue-500/20 text-center space-y-5 relative overflow-hidden max-w-3xl ml-6 mt-12">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-xl"></div>
        <HiOutlineShieldCheck size={56} className="mx-auto text-blue-200" />
        <h2 className="text-2xl font-black">
          Dados Básicos Salvos! O que vem agora?
        </h2>
        <p className="text-base text-blue-100 max-w-xl mx-auto font-medium">
          Ao clicar no botão "Salvar Dados Básicos", a primeira etapa do seu
          currículo está finalizada. O sistema liberará o botão "Próximo Passo"
          no final da tela para que você cadastre as suas{" "}
          <strong>Experiências Profissionais</strong>.
        </p>
        <button
          onClick={() => router.push("/candidato/curriculo")}
          className="inline-flex items-center gap-2 px-8 py-4 mt-2 bg-white text-blue-700 font-black rounded-xl text-base hover:bg-blue-50 transition-all shadow-md active:scale-95"
        >
          <HiOutlineDocumentText size={20} /> Preencher Meu Currículo
        </button>
      </div>
    </div>
  );
}
