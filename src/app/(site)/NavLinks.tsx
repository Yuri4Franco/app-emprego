'use client';

import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utilitário para juntar classes (se você já tiver isso num arquivo 'utils.ts', pode importar de lá)
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavLinksProps {
  // A propriedade 'direction' é opcional (?) e o padrão será 'row'
  direction?: 'row' | 'col';
  className?: string;
}

export default function NavLinks({ direction = 'row', className }: NavLinksProps) {
  return (
    <nav
      className={cn(
        "flex",
        // Lógica de Direção:
        direction === 'col'
          ? "flex-col items-start gap-4 items-center"  // Vertical: Alinha à esquerda, gap menor
          : "flex-row items-center gap-8", // Horizontal: Alinha ao centro, gap maior
        className
      )}
    >
      <Link
        href="/"
        className="text-gray-600 hover:text-[#1459ad] text-base font-medium transition-colors"
      >
        Início
      </Link>

      <Link
        href="/vagas"
        className="text-gray-600 hover:text-[#1459ad] text-base font-medium transition-colors"
      >
        Vagas Disponíveis
      </Link>

      <Link
        href="/contato"
        className="text-gray-600 hover:text-[#1459ad] text-base font-medium transition-colors"
      >
        Para Empresas
      </Link>
    </nav>
  );
}