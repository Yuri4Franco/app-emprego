import { Metadata } from "next"
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/src/components/SearchBar";
import heroBgImage from "@/src/assets/backgrounds/bg-1.webp";
import { ButtonType } from "@/src/components/ButtonType";
import { RandomDesignImage } from "./RandomDesignImagem";
import FAQ from "@/src/components/FAQ";

export const metadata: Metadata = {
  title: "ACI Vagas | Vagas e Banco de Talentos em Panambi",
  description: "Encontre as melhores oportunidades de emprego e conecte-se com as maiores empresas de Panambi e região. Cadastre seu currículo no Banco de Talentos da ACI.",
  keywords: ["vagas de emprego", "Panambi", "ACI-Panambi", "banco de talentos", "trabalho", "oportunidades", "empregos na região"],
  authors: [{ name: "ACI - Panambi" }],
  openGraph: {
    title: "ACI Vagas | Oportunidades Profissionais em Panambi e região",
    description: "Sua próxima conquista profissional começa aqui. Cadastre-se no nosso banco de talentos.",
    url: "https://acivagas.com.br", // Substitua pelo domínio oficial
    siteName: "ACI Vagas",
    locale: "pt_BR",
    type: "website", },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function Home() {
  return (
    <div className="w-full">
      {/* Adicionei overflow-x-hidden para garantir que nada estoure a largura da tela */}
      <main className="flex min-h-screen flex-col overflow-x-hidden">

        {/* --- SEÇÃO HERO --- */}
        <div className="relative w-full min-h-[600px] flex flex-col items-center justify-center text-center px-4 md:px-14 py-32 bg-[#1459ad]">
          <Image
            src={heroBgImage}
            alt="Fundo do escritório ACI Vagas"
            fill
            priority
            className="object-cover object-center opacity-40 mix-blend-overlay"
            quality={60}
          />

          {/* MUDANÇA: Overlay usando bg-primary */}
          <div className="absolute inset-0 bg-primary/90 mix-blend-multiply"></div>

          <div className="relative z-10 flex flex-col items-center space-y-8 max-w-5xl">
            <h1 className="text-3xl md:text-6xl font-bold text-white leading-tight tracking-tight drop-shadow-lg">
              Sua próxima conquista profissional começa aqui.
            </h1>
            <p className="text-lg md:text-2xl text-blue-100 max-w-3xl font-medium drop-shadow-md">
              Encontre as melhores oportunidades e conecte-se com empresas da região na ACI Vagas.
            </p>

            <div className="w-full flex justify-center pt-8">
              <SearchBar />
            </div>

            {/* MUDANÇA: Tag <a> virou <Link> com href correto */}
            <Link
              href="/vagas"
              className="text-white font-medium hover:text-blue-200 hover:underline transition-all cursor-pointer mt-4"
            >
              Ver Todas as Vagas →
            </Link>
          </div>
        </div>

        {/* --- SEÇÃO BANCO DE TALENTOS --- */}
        <div className="w-full min-h-[750px bg-gray-50 py-24 flex items-center justify-center">

          <div className="flex flex-col-reverse md:flex-row max-w-7xl mx-auto px-6 md:px-8 items-center justify-center gap-12 md:gap-20">

            <div className="w-full md:w-1/2 flex flex-col items-center">
              <RandomDesignImage />
              {/* Botão Mobile (Só aparece em telas pequenas) */}
              <div className="w-full md:hidden mt-8 flex justify-center">
                <ButtonType href="/entrar" variant="primary" size="lg" className="w-full shadow-lg">
                  Cadastre-se no Banco de Talentos
                </ButtonType>
              </div>
            </div>

            {/* Coluna Texto */}
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left justify-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                Faça parte do Banco de Talentos da ACI - Panambi
              </h2>

              <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                Conectamos o seu perfil diretamente aos recrutadores das maiores empresas de Panambi e região.
                Cadastre-se agora e aumente suas chances de conquistar a vaga dos seus sonhos!
              </p>

              {/* Botão Desktop (Só aparece em telas médias+) */}
              <div className="hidden md:block pt-4">
                <ButtonType href="/entrar" variant="primary" size="lg" className="shadow-lg">
                  Cadastre-se no Banco de Talentos
                </ButtonType>
              </div>
            </div>

          </div>
        </div>
        {/* --- SEÇÃO FAQ --- */}
        <FAQ />
      </main>
    </div>
  );
}