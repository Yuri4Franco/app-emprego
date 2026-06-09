"use client";

import { useFormContext, Controller } from "react-hook-form";
import { HiOutlineEyeOff } from "react-icons/hi";
import { Input } from "@/src/components/Input";
import Editor from "@/src/components/Editor";
import { VagaFormData, ESTADOS_BRASIL } from "@/src/schemas/vagaSchemas";

export default function TabDescricao() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<VagaFormData>();

  // Função para dar feedback visual de sucesso/erro
  const getFieldStatus = (fieldName: keyof VagaFormData) => {
    if (errors[fieldName])
      return "border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20";
    const value = watch(fieldName);
    if (value && value !== "" && value !== 0)
      return "border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-emerald-500/20";
    return "border-gray-200 bg-gray-50 focus:border-blue-500";
  };

  return (
    <section className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
      <h2 className="text-xl md:text-2xl font-black text-gray-800">
        Localização e Descrição
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Cidade"
          className={getFieldStatus("cidade")}
          {...register("cidade")}
          error={errors.cidade?.message}
        />
        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-bold text-gray-700 ml-2">UF</label>
          <select
            {...register("uf")}
            className={`w-full h-[52px] px-4 rounded-[20px] outline-none text-sm transition-all border ${getFieldStatus("uf")}`}
          >
            {ESTADOS_BRASIL.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SALÁRIO */}
      <div className="p-5 md:p-6 bg-gray-50 rounded-[24px] border border-gray-100 space-y-4">
        <label className="text-sm font-bold text-gray-800 ml-1">
          Visibilidade do Salário
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { id: "FAIXA", label: "Faixa Salarial" },
            { id: "COMBINAR", label: "A Combinar" },
            { id: "OCULTO", label: "Ocultar" },
          ].map((opt) => (
            <label
              key={opt.id}
              className={`cursor-pointer p-4 border-2 rounded-[20px] flex items-center gap-3 transition-all ${
                watch("tipo_salario") === opt.id
                  ? "bg-white border-blue-500 shadow-sm"
                  : "bg-white border-transparent hover:border-blue-200"
              }`}
            >
              <input
                type="radio"
                value={opt.id}
                {...register("tipo_salario")}
                className="hidden"
              />
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  watch("tipo_salario") === opt.id
                    ? "border-blue-600"
                    : "border-gray-300"
                }`}
              >
                {watch("tipo_salario") === opt.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-in zoom-in" />
                )}
              </div>
              <span
                className={`text-sm font-bold ${
                  watch("tipo_salario") === opt.id
                    ? "text-blue-900"
                    : "text-gray-600"
                }`}
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>

        {watch("tipo_salario") === "FAIXA" && (
          <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in">
            <Input
              label="Salário De (R$)"
              type="number"
              {...register("salario_de")}
              error={errors.salario_de?.message}
            />
            <Input
              label="Salário Até (R$)"
              type="number"
              {...register("salario_ate")}
              error={errors.salario_ate?.message}
            />
          </div>
        )}
      </div>

      {/* EDITORES DE TEXTO (Ricos) */}
      <div className="space-y-8">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700 ml-2">
            Descrição Geral da Vaga
          </label>
          <Controller
            name="descricao"
            control={control}
            render={({ field }) => (
              <div
                className={
                  errors.descricao ? "ring-2 ring-red-400 rounded-[32px]" : ""
                }
              >
                <Editor content={field.value || ""} onChange={field.onChange} />
              </div>
            )}
          />
          {errors.descricao && (
            <p className="text-[10px] text-red-500 font-bold uppercase ml-4">
              {errors.descricao.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700 ml-2">
            Responsabilidades do Dia a Dia
          </label>
          <Controller
            name="responsabilidades"
            control={control}
            render={({ field }) => (
              <div
                className={
                  errors.responsabilidades
                    ? "ring-2 ring-red-400 rounded-[32px]"
                    : ""
                }
              >
                <Editor content={field.value || ""} onChange={field.onChange} />
              </div>
            )}
          />
          {errors.responsabilidades && (
            <p className="text-[10px] text-red-500 font-bold uppercase ml-4">
              {errors.responsabilidades.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700 ml-2">
            Requisitos Obrigatórios (Opcional)
          </label>
          <Controller
            name="requisitos_obrigatorios"
            control={control}
            render={({ field }) => (
              <div
                className={
                  errors.requisitos_obrigatorios
                    ? "ring-2 ring-red-400 rounded-[32px]"
                    : ""
                }
              >
                <Editor content={field.value || ""} onChange={field.onChange} />
              </div>
            )}
          />
          {errors.requisitos_obrigatorios && (
            <p className="text-[10px] text-red-500 font-bold uppercase ml-4">
              {errors.requisitos_obrigatorios.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700 ml-2">
            Diferenciais (Opcional)
          </label>
          <textarea
            {...register("diferenciais")}
            className="w-full p-6 bg-gray-50 border border-gray-100 focus:border-blue-400 rounded-[32px] h-32 outline-none text-sm transition-all resize-none"
            placeholder="Ex: Conhecimento no sistema ERP da empresa, inglês básico, etc..."
          />
        </div>
      </div>

      {/* EMPRESA CONFIDENCIAL */}
      <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-5 rounded-[24px]">
        <HiOutlineEyeOff className="text-gray-500 shrink-0" size={24} />
        <div>
          <p className="text-sm font-bold text-gray-800">
            Empresa Confidencial?
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            A vaga ocultará o nome da sua empresa no portal público.
          </p>
        </div>
        <input
          type="checkbox"
          {...register("empresa_confidencial")}
          className="ml-auto w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </div>
    </section>
  );
}
