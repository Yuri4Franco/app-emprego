'use client';

import Link from "next/link";
import { usePathname } from "next/navigation"; // 1. Importar o hook
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavLinksProps {
  direction?: 'row' | 'col';
  className?: string;
  onLinkClick?: () => void;
}

// 2. Definir os links em um array para facilitar a manutenção
const links = [
  { name: 'Início', href: '/' },
  { name: 'Vagas Disponíveis', href: '/vagas' },
  { name: 'Para Empresas', href: '/para-empresas' },
];

export default function NavLinks({ direction = 'row', className, onLinkClick }: NavLinksProps) {
  const pathname = usePathname(); // 3. Pegar a rota atual

  return (
    <nav
      className={cn(
        "flex",
        direction === 'col'
          ? "flex-col items-center gap-4"
          : "flex-row items-center gap-8",
        className
      )}
    >
      {links.map((link) => {
        // 4. Lógica para saber se é o link ativo
        // Se for a Home ('/'), a comparação deve ser exata
        // Se forem outras rotas, usamos startsWith para manter ativo em subpáginas (ex: /vagas/123)
        const isActive = link.href === '/'
          ? pathname === '/'
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
            className={cn(
              "text-base font-medium transition-colors", // Classes base
              isActive
                ? "text-[#1459ad] font-bold" // Estilo quando ATIVO (Azul + Negrito)
                : "text-gray-600 hover:text-[#1459ad]" // Estilo quando INATIVO (Cinza + Hover Azul)
            )}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}