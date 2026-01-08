import Image from "next/image"; // Importe o componente Image
import SearchBar from "@/src/components/SearchBar";
import heroBgImage from "@/src/assets/backgrounds/bg-1.png";
import { ButtonType } from "@/src/components/ButtonType";
import { RandomDesignImage } from "./RandomDesignImagem";
import FAQ from "@/src/components/FAQ";

export default function Home() {
  return (
    <div className="w-full">
      <main className="flex min-h-screen flex-col md:pt-24 pt-12">
        {/* SEÇÃO HERO */}
        <div className="relative w-full min-h-[600px] flex flex-col items-center justify-center text-center px-4 md:px-14 py-32 bg-[#1459ad]">
          <Image
            src={heroBgImage}
            alt="Fundo do escritório ACI Empregos"
            fill
            priority
            className="object-cover object-center opacity-40 mix-blend-overlay"
            quality={50}
          />
          <div className="absolute inset-0 bg-[#1459ad]/90 mix-blend-multiply"></div>
          <div className="relative z-10 flex flex-col items-center space-y-8 max-w-5xl">
            <h1 className="text-3xl md:text-6xl font-bold text-white leading-tight tracking-tight drop-shadow-lg overflow-hidden">
              Sua próxima conquista profissional começa aqui.
            </h1>
            <p className="text-lg md:text-2xl text-blue-100 max-w-3xl font-medium drop-shadow-md">
              Encontre as melhores oportunidades e conecte-se com empresas da região na ACI Empregos.
            </p>
            <div className="w-full flex justify-center pt-8">
              <SearchBar />
            </div>
            <a className="text-white hover:text-blue-200 transition-colors cursor-pointer">Ver Todas as Vagas →</a>
          </div>
        </div>

        <div className="w-full bg-gray-100 py-16 min-h-[750px] flex items-center justify-center">
          {/* 1. flex-col-reverse: No celular, inverte a ordem dos BLOCOS PRINCIPAIS.
         O bloco de texto vai para cima, o bloco da imagem vai para baixo.
  */}
          <div className="flex flex-col-reverse md:flex-row max-w-7xl mx-auto px-6 md:px-8 items-center justify-center gap-8 md:gap-16">

            {/* --- BLOCO 1: IMAGEM (+ Botão Mobile) --- */}
            <div className="w-full md:w-1/2 flex flex-col items-center">

              {/* A Imagem */}
              <RandomDesignImage />

              {/* --- BOTÃO MOBILE --- */}
              {/* md:hidden -> Some quando a tela for média ou maior (PC) */}
              {/* mt-8 -> Dá um espaço entre a imagem e o botão */}
              <div className="w-full md:hidden mt-8 flex justify-center">
                <ButtonType href="/candidato/login" variant="primary" size="lg" className="w-full">
                  Cadastre-se no Banco de Talentos
                </ButtonType>
              </div>

            </div>

            {/* --- BLOCO 2: TEXTO (+ Botão Desktop) --- */}
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left justify-center space-y-6">

              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                Faça parte do Banco de Talentos da ACI - Panambi
              </h2>

              <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                Conectamos o seu perfil diretamente aos recrutadores das maiores empresas de Panambi e região.
                Cadastre-se agora e aumente suas chances de conquistar a vaga dos seus sonhos!
              </p>

              {/* --- BOTÃO DESKTOP --- */}
              {/* hidden md:inline-flex -> Escondido no celular, aparece flex no PC */}
              <div className="hidden md:block pt-2">
                <ButtonType href="/candidato/login" variant="primary" size="lg">
                  Cadastre-se no Banco de Talentos
                </ButtonType>
              </div>

            </div>

          </div>
        </div>
        <FAQ />
      </main>
    </div>
  );
}