'use client';

import { useEffect, useState } from "react";
import Image from "next/image";

// Importando todas as imagens estaticamente para o Next.js otimizar elas
import Img1 from "@/src/assets/designs/1.png";
import Img2 from "@/src/assets/designs/2.png";
import Img3 from "@/src/assets/designs/3.png";
import Img4 from "@/src/assets/designs/4.png";
import Img5 from "@/src/assets/designs/5.png";
import Img6 from "@/src/assets/designs/6.png";

// Array com todas as opções
const designs = [Img1, Img2, Img3, Img4, Img5, Img6];

export const RandomDesignImage = () => {
  const [imageSrc, setImageSrc] = useState(designs[0]); // Começa com a 1 como padrão
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Essa lógica só roda no navegador, evitando erro de hidratação
    setMounted(true);
    const randomIndex = Math.floor(Math.random() * designs.length);
    setImageSrc(designs[randomIndex]);
  }, []);

  // Enquanto não "montou" no cliente, mostramos um esqueleto ou a primeira imagem para evitar pulos
  if (!mounted) {
    return (
        <Image
        src={designs[0]} // Mostra a primeira ou um placeholder enquanto carrega
        alt="Banco de Talentos ACI"
        width={500}
        height={500} // É bom definir height para evitar layout shift
        className="object-contain opacity-0" // Escondido até sortear
      />
    );
  }

  return (
    <div>
      <Image
        src={imageSrc}
        alt="Ilustração representando a diversidade do Banco de Talentos"
        width={600}
        className="w-full h-auto object-contain drop-shadow-xl"
      />
    </div>
  );
};