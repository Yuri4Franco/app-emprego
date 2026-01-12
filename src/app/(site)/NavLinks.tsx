'use client';

import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavLinksProps {
  direction?: 'row' | 'col';
  className?: string;
  // NOVA PROP: Função opcional para quando clicar no link
  onLinkClick?: () => void;
}

export default function NavLinks({ direction = 'row', className, onLinkClick }: NavLinksProps) {
  return (
    <nav
      className={cn(
        "flex",
        direction === 'col'
          ? "flex-col items-center gap-4 "
          : "flex-row items-center gap-8",
        className
      )}
    >
      <Link
        href="/"
        onClick={onLinkClick} // <--- ADICIONE ISSO EM TODOS OS LINKS
        className="text-gray-600 hover:text-[#1459ad] text-base font-medium transition-colors"
      >
        Início
      </Link>

      <Link
        href="/vagas"
        onClick={onLinkClick} // <--- AQUI
        className="text-gray-600 hover:text-[#1459ad] text-base font-medium transition-colors"
      >
        Vagas
      </Link>

      <Link
        href="/contato"
        onClick={onLinkClick} // <--- E AQUI
        className="text-gray-600 hover:text-[#1459ad] text-base font-medium transition-colors"
      >
        Sou uma Empresa
      </Link>
    </nav>
  );
}