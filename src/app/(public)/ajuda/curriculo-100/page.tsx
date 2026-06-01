"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  HiDocumentText,
  HiOutlineArrowLeft,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
} from "react-icons/hi";
import { HiDocument, HiOutlineDocumentText } from "react-icons/hi2";

// Importação estática das imagens (Formato WebP)
import imgPasso1 from "@/src/assets/faq/registro-1.webp";
import imgPasso1Android from "@/src/assets/faq/registro-1-android.webp";
import imgCurriculo1 from "@/src/assets/faq/curriculo-1.webp";
import imgCurriculo2 from "@/src/assets/faq/curriculo-2.webp";
import imgCurriculo3 from "@/src/assets/faq/curriculo-3.webp";
import imgCurriculo4 from "@/src/assets/faq/curriculo-4.webp";
import imgCurriculo5 from "@/src/assets/faq/curriculo-5.webp";
import imgCurriculo6 from "@/src/assets/faq/curriculo-6.webp";
import imgCurriculo7 from "@/src/assets/faq/curriculo-7.webp";
import imgCurriculo8 from "@/src/assets/faq/curriculo-8.webp";
import imgCurriculo9 from "@/src/assets/faq/curriculo-9.webp";
import imgCurriculo10 from "@/src/assets/faq/curriculo-10.webp";
import imgCurriculo11 from "@/src/assets/faq/curriculo-11.webp";
import imgCurriculo12 from "@/src/assets/faq/curriculo-12.webp";
import imgCurriculo13 from "@/src/assets/faq/curriculo-13.webp";
import imgCurriculo14 from "@/src/assets/faq/curriculo-14.webp";
import imgCurriculo15 from "@/src/assets/faq/curriculo-15.webp";
import imgCurriculo16 from "@/src/assets/faq/curriculo-16.webp";

export default function GuiaCurriculoPage() {
  const router = useRouter();

  const passos: { id: string; titulo: string; descricao: React.ReactNode; imagem: any }[] = [
    // --- ACESSO E PAINEL INICIAL ---
    {
      id: "1",
      titulo: "1. Acesse a Área do Candidato",
      descricao: (
        <>
          Para começar, acesse a plataforma e clique no botão <strong>Área do Candidato</strong>. Faça o login utilizando o seu e-mail e a senha que você cadastrou.
        </>
      ),
      imagem: imgPasso1,
    },
    {
      id: "1-1",
      titulo: "1.1. Acesso pelo Smartphone (Celular)",
      descricao: (
        <>
          Se você estiver usando o celular, toque no ícone de menu (os três traços no canto superior). Encontre o botão <strong>Área do Candidato</strong> e faça o login com seus dados.
        </>
      ),
      imagem: imgPasso1Android,
    },
    {
      id: "2",
      titulo: "2. A sua Página Inicial",
      descricao: (
        <>
          Após o login, você verá o seu painel. Ele mostra informações sobre vagas na sua área e quantas vezes o seu perfil foi visualizado. No topo, há um botão para ligar/desligar a sua visibilidade para as empresas.<br /><br />
          Para o primeiro acesso, o nosso foco é transformar a sua barra de status em 100%. Clique no botão <strong>"Preencher Currículo"</strong> (na tela principal) ou no menu lateral em <strong>"Meu Currículo"</strong>.
        </>
      ),
      imagem: imgCurriculo1,
    },
    {
      id: "3",
      titulo: "3. O Painel do Seu Currículo",
      descricao: (
        <>
          Bem-vindo à sua central de informações! No topo, você tem atalhos úteis: um botão para ver o currículo completo (ótimo para revisar ou salvar em PDF) e a chave de visibilidade (que é ativada automaticamente quando você salva seus dados básicos e informa o CPF).<br /><br />
          Você navegará por quatro abas: <strong>Dados Básicos, Experiências, Formações e Habilidades</strong>. Lembre-se sempre de clicar no botão "Salvar" no final de cada etapa antes de avançar!
        </>
      ),
      imagem: imgCurriculo2,
    },

    // --- DADOS BÁSICOS ---
    {
      id: "4",
      titulo: "4. Preenchendo os Dados Pessoais",
      descricao: (
        <>
          Na aba <strong>Dados Básicos</strong>, comece inserindo uma Foto de Perfil (se desejar). Em seguida, preencha os campos obrigatórios: CPF, Data de Nascimento, Gênero e o número do seu WhatsApp. Se possuir, adicione um celular secundário.
        </>
      ),
      imagem: imgCurriculo3,
    },
    {
      id: "5",
      titulo: "5. Endereço",
      descricao: (
        <>
          Logo abaixo, informe os dados do seu endereço: CEP, Rua/Avenida, Número da residência, Bairro, Cidade e UF (Estado). O complemento é opcional. Manter isso atualizado ajuda as empresas a entenderem a logística da sua contratação.
        </>
      ),
      imagem: imgCurriculo4,
    },
    {
      id: "6",
      titulo: "6. Perfil Profissional (O Mais Importante!)",
      descricao: (
        <div className="space-y-4">
          <p>Esta seção é o seu cartão de visitas. Explique com clareza quem é você profissionalmente:</p>
          <ul className="list-disc pl-5 space-y-3 text-sm">
            <li>
              <strong>Áreas de Atuação:</strong> Escolha até 10 áreas. É por elas que as empresas encontram você nas buscas. Selecione as áreas nas quais você já tem experiência ou aquelas em que tem muito interesse em começar.
            </li>
            <li>
              <strong>Resumo Profissional:</strong> É a sua "apresentação rápida". Escreva 3 ou 4 linhas dizendo quem você é, o que sabe fazer de melhor e suas principais qualidades. <em>Ex: Profissional dedicado, com facilidade para aprender rápido e ótima comunicação. Busca sempre entregar resultados com qualidade.</em>
            </li>
            <li>
              <strong>Objetivos Profissionais:</strong> Diga exatamente o que você procura. Que tipo de vaga ou cargo faria você feliz hoje? Isso ajuda a alinhar expectativas.
            </li>
            <li>
              <strong>Pretensão Salarial:</strong> (Opcional) Ajuda as empresas a saberem se o salário que elas oferecem está dentro do que você espera ganhar, evitando perda de tempo para ambos.
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
          Informe o seu <strong>Canal de contato</strong> favorito, o <strong>Turno de trabalho</strong> desejado, sua disponibilidade e qual a sua CNH (caso a vaga exija dirigir).<br /><br />
          No <strong>Perfil Inclusivo</strong>, marque a caixinha caso você se identifique como uma Pessoa com Deficiência (PcD) ou neurodivergente. É vital preencher isso para que a empresa possa planejar a melhor e mais confortável forma de recebê-lo.<br /><br />
          Por fim, clique em <strong>Salvar Dados Básicos</strong> para prosseguir.
        </>
      ),
      imagem: imgCurriculo6,
    },

    // --- EXPERIÊNCIAS ---
    {
      id: "8",
      titulo: "8. Experiências Profissionais",
      descricao: (
        <>
          Mude para a aba <strong>Experiências</strong>. Se você está buscando sua primeira oportunidade e nunca trabalhou antes, marque a caixa <strong>"Em busca do Primeiro Emprego"</strong>. Isso avisará as empresas que você tem vontade de aprender!<br /><br />
          Se você já trabalhou, clique no botão <strong>"Adicionar nova experiência"</strong>.
        </>
      ),
      imagem: imgCurriculo7,
    },
    {
      id: "9",
      titulo: "9. Detalhando sua Experiência",
      descricao: (
        <>
          Preencha o Nome da Empresa, o Cargo que ocupava, e as Datas de Início e Fim. Se você ainda trabalha lá, basta marcar a caixa "Trabalho atualmente neste cargo".<br /><br />
          O campo de <strong>Atividades e Conquistas</strong> é opcional, mas nós recomendamos fortemente que você preencha. Diga quais eram as suas tarefas diárias e o que você aprendeu por lá. Quando terminar, clique em "Salvar".
        </>
      ),
      imagem: imgCurriculo8,
    },
    {
      id: "10",
      titulo: "10. Gerenciando Experiências",
      descricao: (
        <>
          Você pode adicionar o seu histórico completo clicando em "Adicionar mais experiências". Além disso, você tem total controle: pode editar (ícone de lápis) ou excluir (ícone de lixeira) qualquer experiência a qualquer momento.
        </>
      ),
      imagem: imgCurriculo9,
    },

    // --- FORMAÇÕES ---
    {
      id: "11",
      titulo: "11. Formação e Escolaridade",
      descricao: (
        <>
          Na aba <strong>Formações</strong>, você deve registrar o seu nível de estudo. Mesmo que você não tenha concluído o Ensino Fundamental ou Médio, é extremamente importante adicionar essa informação.<br /><br />
          Esta aba também serve para cursos extras: inglês, informática, especializações, etc. Tudo conta a seu favor!
        </>
      ),
      imagem: imgCurriculo10,
    },
    {
      id: "12",
      titulo: "12. Adicionando Cursos e Estudos",
      descricao: (
        <>
          Clique no espaço indicado para adicionar a sua escolaridade. Selecione o nível (Ex: Ensino Médio Completo, Curso Técnico, Graduação) e preencha o nome da instituição e as datas.
        </>
      ),
      imagem: imgCurriculo11,
    },
    {
      id: "13",
      titulo: "13. Gerenciando Formações",
      descricao: (
        <>
          Assim como nas experiências, você pode incluir múltiplos cursos para enriquecer o seu perfil, usando os botões para editar ou excluir caso digite algo errado.
        </>
      ),
      imagem: imgCurriculo12,
    },

    // --- HABILIDADES ---
    {
      id: "14",
      titulo: "14. Aba de Habilidades (Competências)",
      descricao: (
        <>
          As habilidades são as ferramentas técnicas, softwares ou conhecimentos práticos que você possui (Ex: Excel, Empilhadeira, Vendas, Atendimento ao Cliente).<br /><br />
          Use o campo de busca. Se você sabe fazer algo importante que não apareceu na lista, digite e clique em <strong>Sugerir</strong>. A moderação da ACI irá revisar e aprovar!
        </>
      ),
      imagem: imgCurriculo13,
    },
    {
      id: "15",
      titulo: "15. Nível de Domínio",
      descricao: (
        <>
          Ao selecionar uma habilidade, o sistema perguntará o seu nível de domínio sobre ela (Básico, Intermediário ou Avançado). Seja sincero e escolha a opção que melhor reflete o seu conhecimento atual.
        </>
      ),
      imagem: imgCurriculo14,
    },
    {
      id: "16",
      titulo: "16. Gerenciando as Habilidades",
      descricao: (
        <>
          As habilidades selecionadas aparecerão listadas. Para remover uma habilidade que você adicionou por engano, basta clicar no ícone da lixeira ao lado dela (se estiver no computador, passe o mouse por cima do item para a lixeira aparecer).
        </>
      ),
      imagem: imgCurriculo15,
    },

    // --- REVISÃO ---
    {
      id: "17",
      titulo: "17. Aba de Revisão Final",
      descricao: (
        <>
          Chegamos ao fim! A aba de <strong>Revisão</strong> é o seu guia inteligente. Se a sua barra não estiver em 100%, esta tela mostrará qual aba ficou faltando!.<br /><br />
        </>
      ),
      imagem: imgCurriculo16,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-24">

      {/* CABEÇALHO */}
      <div className="flex items-center gap-4 border-b border-gray-200/60 pb-6">
        <button
          onClick={() => router.back()}
          className="p-3 bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50 rounded-2xl transition-all text-gray-500 hover:text-primary shadow-sm group shrink-0"
        >
          <HiOutlineArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-1 flex items-center gap-2">
            <HiDocumentText className="text-primary" size={28} /> Currículo 100%
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            O guia definitivo para destacar seu perfil e conquistar as melhores oportunidades da região.
          </p>
        </div>
      </div>

      {/* FLUXO PASSO A PASSO (TIMELINE RESPONSIVA) */}
      <div className="relative border-l-2 border-gray-100 ml-4 md:ml-6 space-y-16 md:space-y-24">
        {passos.map((passo) => (
          <div key={passo.id} className="relative pl-6 md:pl-12 group">

            {/* Indicador visual da Timeline */}
            <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-4 border-gray-200 group-hover:border-primary transition-colors flex items-center justify-center z-10">
              <div className="w-1.5 h-1.5 bg-transparent rounded-full group-hover:bg-primary transition-colors" />
            </div>

            {/* Conteúdo do Passo */}
            <div className="space-y-5">
              <div className="space-y-3">
                <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors">
                  {passo.titulo}
                </h3>
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
    </div>
  );
}