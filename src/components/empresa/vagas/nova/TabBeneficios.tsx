"use client";

import { useFormContext } from "react-hook-form";
import { HiOutlineX } from "react-icons/hi";
import { VagaFormData } from "@/src/schemas/vagaSchemas";

interface TabBeneficiosProps {
  beneficiosTaxonomia: any[];
}

export default function TabBeneficios({
  beneficiosTaxonomia,
}: TabBeneficiosProps) {
  // Puxa as ferramentas do formulário via Context
  const { watch, setValue } = useFormContext<VagaFormData>();

  // Fica observando o que já foi selecionado (se não tiver nada, é array vazia)
  const beneficiosSelecionados = watch("beneficios_ids") || [];

  // Lida com a seleção no dropdown
  const handleAdicionar = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);

    // Se escolheu um válido e ele ainda não tá na lista, adiciona
    if (id && !beneficiosSelecionados.includes(id)) {
      setValue("beneficios_ids", [...beneficiosSelecionados, id], {
        shouldValidate: true, // Força a validação do Zod (se houvesse)
        shouldDirty: true, // Mostra pro form que algo mudou
      });
    }
    // Reseta o select para o placeholder
    e.target.value = "";
  };

  const handleRemover = (id: number) => {
    setValue(
      "beneficios_ids",
      beneficiosSelecionados.filter((i) => i !== id),
      { shouldValidate: true, shouldDirty: true },
    );
  };

  return (
    <section className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-gray-100 shadow-sm space-y-6 animate-in slide-in-from-bottom-4">
      <h2 className="text-xl md:text-2xl font-black text-gray-800">
        Benefícios Oferecidos
      </h2>

      <select
        onChange={handleAdicionar}
        className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] outline-none text-sm font-bold text-gray-600 cursor-pointer hover:border-blue-200 transition-colors"
      >
        <option value="">+ Adicionar um benefício...</option>
        {beneficiosTaxonomia.map((b: any) => (
          <option key={b.id_beneficio} value={b.id_beneficio}>
            {b.descricao}
          </option>
        ))}
      </select>

      <div className="flex flex-wrap gap-2 pt-2">
        {beneficiosSelecionados.map((id) => {
          // Busca o nome do benefício na lista base para poder exibir na tela
          const beneficioEncontrado = beneficiosTaxonomia.find(
            (b: any) => b.id_beneficio === id,
          ) as any;

          if (!beneficioEncontrado) return null;

          return (
            <div
              key={id}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-100 animate-in zoom-in"
            >
              {beneficioEncontrado.descricao}
              <button
                type="button"
                onClick={() => handleRemover(id)}
                className="hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"
              >
                <HiOutlineX size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
