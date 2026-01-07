'use client';

import { BiSearchAlt } from "react-icons/bi";
import { ButtonType } from "./ButtonType";

export default function SearchBar() {
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Buscando...");
  };

  return (
    <form 
      onSubmit={handleSearch}
      // MUDANÇAS AQUI:
      // 1. 'flex-col md:flex-row': Coluna no celular, Linha no PC
      // 2. 'rounded-2xl md:rounded-full': No celular fica um quadrado arredondado, no PC vira pílula
      // 3. 'h-auto': Remove altura fixa para o conteúdo crescer
      className="flex flex-col md:flex-row items-center w-full max-w-3xl bg-white rounded-2xl md:rounded-full shadow-lg p-2 gap-2 md:gap-0 border border-gray-100 focus-within:border-[#1459ad] transition-all duration-300"
    >
        
        {/* WRAPPER DO INPUT (Para manter Lupa + Input juntos mesmo no celular) */}
        <div className="flex items-center w-full md:flex-1 px-2">
            <BiSearchAlt className="text-gray-400 text-3xl shrink-0" />
            
            <input
                type="text"
                placeholder="Vendedor, Administrativo, TI, RH..."
                // w-full garante que use todo espaço disponível nesse wrapper
                className="flex-1 ml-3 bg-transparent outline-none text-gray-700 placeholder-gray-400 h-12 w-full"
            />
        </div>
        
        {/* BOTÃO */}
        {/* w-full md:w-auto: No celular ocupa a largura toda. No PC só o tamanho dele. */}
        <ButtonType 
            type="submit" 
            variant="primary" 
            size="md"
            className="w-full md:w-auto rounded-xl md:rounded-full px-8 py-3 md:py-0" 
        >
            Buscar
        </ButtonType>
    </form>
  );
}