'use client';

import { useState, useRef, useEffect } from "react";
import { BiChevronDown, BiCheck } from "react-icons/bi"; // Adicionei BiCheck

interface FilterSelectProps {
  label: string;
  options: string[];
  activeFilters: string[]; // Recebe a lista de filtros ativos do pai
  onToggle: (value: string) => void; // Função para ligar/desligar
}

export function FilterSelect({ label, options, activeFilters, onToggle }: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Verifica se ALGUMA opção desse filtro está ativa para pintar o botão principal
  const isAnyActive = options.some(opt => activeFilters.includes(opt));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all text-sm font-medium ${
          isAnyActive || isOpen
            ? 'bg-blue-50 border-primary text-primary ring-1 ring-blue-100' 
            : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
        }`}
      >
        {label}
        {/* Contadorzinho (Opcional, mas chique: Mostra quantos selecionados) */}
        {isAnyActive && (
             <span className="flex items-center justify-center bg-primary text-white text-[10px] h-4 w-4 rounded-full ml-1">
                {options.filter(opt => activeFilters.includes(opt)).length}
             </span>
        )}
        <BiChevronDown className={`text-lg transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in p-1">
          <ul className="max-h-60 overflow-y-auto">
            {options.map((option) => {
              const isActive = activeFilters.includes(option);
              return (
                <li
                  key={option}
                  onClick={() => onToggle(option)}
                  className={`
                    px-4 py-2.5 text-sm cursor-pointer transition-colors rounded-lg flex items-center justify-between
                    ${isActive ? 'bg-blue-50 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}
                  `}
                >
                  {option}
                  {isActive && <BiCheck className="text-lg" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}