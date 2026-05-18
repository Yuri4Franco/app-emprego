"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import {
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { VagaFormData } from "@/src/schemas/vagaSchemas";

export default function TabEtapas() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<VagaFormData>();

  // ✨ O useFieldArray gerencia listas dinâmicas de forma otimizada
  const { fields, append, remove } = useFieldArray({
    control,
    name: "etapas",
  });

  return (
    <section className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-gray-100 shadow-sm space-y-6 animate-in slide-in-from-bottom-4">
      <h2 className="text-xl md:text-2xl font-black text-gray-800">
        Funil de Contratação
      </h2>

      {/* A linha conectora vertical de fundo */}
      <div className="space-y-4 pt-4 relative before:absolute before:inset-y-0 before:left-[35px] before:w-0.5 before:bg-gray-100">
        {/* ETAPA FIXA 1: INSCRITOS */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-[24px] relative z-10 border border-gray-200 opacity-70">
          <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 font-black flex items-center justify-center shrink-0">
            1
          </div>
          <div>
            <p className="text-sm font-black text-gray-700">
              Inscritos (Padrão)
            </p>
            <p className="text-xs text-gray-500">
              Todos os candidatos entram aqui.
            </p>
          </div>
        </div>

        {/* ETAPAS DINÂMICAS DO USUÁRIO */}
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white rounded-[24px] border border-blue-100 shadow-sm relative z-10 group hover:border-blue-300 transition-colors"
          >
            {/* Numeração (Soma 2 porque o 1 é o Inscritos fixo) */}
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center shrink-0">
              {index + 2}
            </div>

            <div className="flex-1 w-full">
              <input
                {...register(`etapas.${index}.nome`)}
                className="w-full bg-transparent border-b border-gray-200 focus:border-blue-500 py-2 outline-none text-sm font-bold text-gray-800 placeholder-gray-300"
                placeholder="Nome da etapa (Ex: Entrevista Técnica)"
              />
              {errors?.etapas?.[index]?.nome && (
                <p className="text-[10px] text-red-500 mt-1 font-bold">
                  {errors.etapas[index]?.nome?.message}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-xl border border-transparent hover:border-gray-200 transition-colors">
              <input
                type="checkbox"
                {...register(`etapas.${index}.requer_agendamento`)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[10px] font-bold text-gray-600 uppercase">
                Agendamento
              </span>
            </label>

            <button
              type="button"
              onClick={() => remove(index)}
              className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-full hover:bg-red-50 transition-colors"
              title="Remover etapa"
            >
              <HiOutlineTrash size={18} />
            </button>
          </div>
        ))}

        {/* BOTÃO PARA ADICIONAR NOVA ETAPA */}
        <div className="pl-16 relative z-10 pt-2">
          <button
            type="button"
            onClick={() => append({ nome: "", requer_agendamento: false })}
            className="py-3 px-6 bg-white border-2 border-dashed border-gray-200 rounded-full text-gray-500 font-bold text-xs flex items-center gap-2 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
          >
            <HiOutlinePlus size={16} /> Adicionar Etapa
          </button>
        </div>

        {/* ETAPA FIXA FINAL: APROVADOS */}
        <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-[24px] relative z-10 border border-emerald-100">
          <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
            <HiOutlineCheckCircle size={20} />
          </div>
          <div>
            <p className="text-sm font-black text-emerald-900">
              Aprovados (Final)
            </p>
            <p className="text-xs text-emerald-700 font-medium">
              Mover para cá aprova o candidato.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
