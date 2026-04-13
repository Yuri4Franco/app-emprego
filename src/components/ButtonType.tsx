import { ButtonHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import Link from 'next/link';

// Função auxiliar para combinar classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'; // Adicionei 'danger' caso precise do vermelho
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  href?: string; 
}

export function ButtonType({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  href,
  disabled,
  ...props
}: ButtonProps) {

  const baseStyles = "cursor-pointer inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-hover-button)] shadow-sm hover:shadow-md",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
    danger: "bg-[#ff4d4d] text-white hover:bg-[#c91b21] shadow-sm",
  };

  const sizes = {
    sm: "h-8 px-4 text-xs",
    md: "h-12 px-6 text-sm",
    lg: "h-14 px-8 text-base",
  };

  // Combina as classes
  const finalClass = cn(baseStyles, variants[variant], sizes[size], className);

  // 1. Se for Link
  if (href) {
    return (
      <Link href={href} className={finalClass}>
         {children}
      </Link>
    );
  }

  // 2. Se for Botão normal
  return (
    <button
      disabled={isLoading || disabled}
      className={finalClass}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
}