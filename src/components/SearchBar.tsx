'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BiSearchAlt } from "react-icons/bi";
import { ButtonType } from "./ButtonType";

export default function SearchBar() {
  const router = useRouter();
  const [termo, setTermo] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Se tiver algo digitado, manda pra URL com o parâmetro 'busca'
    if (termo.trim()) {
      router.push(`/vagas?busca=${encodeURIComponent(termo.trim())}`);
    } else {
      // Se clicou vazio, só vai para a página de vagas geral
      router.push("/vagas");
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col md:flex-row items-center w-full max-w-3xl bg-white rounded-2xl md:rounded-full shadow-lg p-2 gap-2 md:gap-0 border border-gray-100 focus-within:border-blue-600 transition-all duration-300"
    >
      <div className="flex items-center w-full md:flex-1 px-2">
        <BiSearchAlt className="text-gray-400 text-3xl shrink-0" />

        <input
          type="text"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Vendedor, Administrativo, TI, RH..."
          className="flex-1 ml-3 bg-transparent outline-none text-gray-700 placeholder-gray-400 h-12 w-full"
        />
      </div>

      <ButtonType
        type="submit"
        variant="primary"
        className="w-full md:w-auto rounded-xl md:rounded-full px-10 py-3.5 md:py-3 font-bold shadow-md shadow-blue-500/20"
      >
        Buscar Vagas
      </ButtonType>
    </form>
  );
}