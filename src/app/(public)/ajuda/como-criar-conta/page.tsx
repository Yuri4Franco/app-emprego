"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  HiOutlineArrowLeft,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
} from "react-icons/hi";
import { HiOutlineUserPlus } from "react-icons/hi2";

// Importação estática das imagens da pasta assets
import imgPasso1 from "@/src/assets/faq/registro-1.webp";
import imgPasso2 from "@/src/assets/faq/registro-1-android.webp";
import imgPasso2_1 from "@/src/assets/faq/registro-2.webp";
import imgPasso3 from "@/src/assets/faq/registro-3.webp";
import imgPasso4 from "@/src/assets/faq/registro-4.webp";
import imgPasso6 from "@/src/assets/faq/registro-5.webp";

export default function TutorialCadastroPage() {
  const router = useRouter();

  // Estrutura de dados dos passos do tutorial com os seus textos
  const passos = [
    {
      id: "1",
      titulo: "1. Acesse a Área do Candidato",
      descricao:
        "Na tela inicial do portal ACI Vagas, localize e clique no botão da 'Área do Candidato' para entrar no sistema ou iniciar a criação da sua conta.",
      imagem: imgPasso1,
    },
    {
      id: "2-1",
      titulo: "1.1. Acesso pelo Smartphone (Celular)",
      descricao:
        "Se estiver acessando pelo celular, clique no botão de menu (os três traços) no canto da tela. Com o menu aberto, procure o botão da Área do Candidato.",
      imagem: imgPasso2,
    },
    {
      id: "2",
      titulo: "2. Acesse sua conta ou Cadastre-se",
      descricao:
        "Na tela de acesso, você pode usar seu e-mail e senha para entrar (caso já tenha cadastro). Se for o seu primeiro acesso, basta clicar no botão 'Cadastre-se grátis' para começar.",
      imagem: imgPasso2_1,
    },
    {
      id: "3",
      titulo: "3. Preencha o Formulário de Registro",
      descricao:
        "Informe o seu Nome Completo, um E-mail válido (que você utilize e tenha acesso) e crie uma senha. Confirme a senha digitada e clique no botão 'Criar minha conta'.",
      imagem: imgPasso3,
    },
    {
      id: "4",
      titulo: "4. Confirme seu E-mail",
      descricao:
        "Você verá uma tela confirmando que um e-mail de ativação foi enviado. Caso tenha digitado o e-mail errado, repita o passo anterior. Se você não possui um e-mail, entre em contato diretamente com a ACI Panambi para receber auxílio.",
      imagem: imgPasso4,
    },
    {
      id: "6",
      titulo: "5. Conta Ativada com Sucesso!",
      descricao:
        "Após clicar no link que chegou no seu e-mail, sua conta estará ativada. Agora, basta voltar à tela inicial, fazer o login usando seu e-mail e senha, e começar a preencher o seu currículo na plataforma.",
      imagem: imgPasso6,
    },
  ];

  return (
    // Aumentamos o max-w para 5xl para dar mais espaço no desktop
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
            <HiOutlineSparkles className="text-primary" size={28} /> Guia de
            Cadastro
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Siga o passo a passo abaixo para criar a sua conta e acessar a
            plataforma.
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
              <div className="space-y-2">
                <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors">
                  {passo.titulo}
                </h3>
                <p className="text-base text-gray-600 font-medium leading-relaxed max-w-3xl">
                  {passo.descricao}
                </p>
              </div>

              {/* CONTAINER DA IMAGEM: Aumentamos o max-w para a imagem ficar grande no PC */}
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

      <button
        onClick={() => router.push("/ajuda/curriculo-100")}
        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-black rounded-xl text-base hover:bg-blue-50 transition-all shadow-md"
      >
        Próximo Guia: Deixar Currículo 100% →
      </button>

    </div>
  );
}
