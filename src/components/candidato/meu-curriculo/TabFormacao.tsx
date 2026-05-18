"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
  HiOutlineAcademicCap,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineSave,
} from "react-icons/hi";

import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";
import { formacaoSchema, FormacaoData } from "@/src/schemas/curriculoSchemas";

interface TabFormacaoProps {
  dadosIniciais: any;
  onAtualizarProgresso: () => void;
}

export default function TabFormacao({
  dadosIniciais,
  onAtualizarProgresso,
}: TabFormacaoProps) {
  // Estados Locais
  const [formacoes, setFormacoes] = useState<any[]>(
    dadosIniciais?.formacoes || [],
  );
  const [showFormFormacao, setShowFormFormacao] = useState(false);
  const [editingFormId, setEditingFormId] = useState<number | null>(null);
  const [isSavingForm, setIsSavingForm] = useState(false);

  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    reset: resetForm,
    watch: watchForm,
    formState: { errors: errorsForm },
  } = useForm<FormacaoData>({
    resolver: zodResolver(formacaoSchema) as any, // "as any" para evitar conflito de tipos do superRefine
    defaultValues: {
      instituicao: "",
      nivel: "",
      curso: "",
      status: "",
      data_conclusao: "",
    },
  });

  // =========================================================================
  // LÓGICA DO FORMULÁRIO DE FORMAÇÃO
  // =========================================================================
  const abrirFormFormacao = (form?: any) => {
    if (form) {
      setEditingFormId(form.id_formacao);
      resetForm({
        instituicao: form.instituicao,
        nivel: form.nivel,
        curso: form.curso,
        status: form.status,
        data_conclusao: form.data_conclusao
          ? String(form.data_conclusao).substring(0, 4)
          : "",
      });
    } else {
      setEditingFormId(null);
      resetForm({
        instituicao: "",
        nivel: "",
        curso: "",
        status: "",
        data_conclusao: "",
      });
    }
    setShowFormFormacao(true);
  };

  const salvarFormacao = async (data: FormacaoData) => {
    setIsSavingForm(true);
    try {
      const isBasico =
        data.nivel === "Ensino Fundamental" || data.nivel === "Ensino Médio";
      const isConcluido = data.status === "CONCLUÍDO";

      const payload = {
        ...data,
        // Se for básico, o curso é igual ao nível (ex: "Ensino Médio"). Senão, é o curso que a pessoa digitou.
        curso: isBasico ? data.nivel : data.curso,
        // Instituição e Série vão nulos se for básico
        instituicao: isBasico ? null : data.instituicao,
        serie: null,
        // A data só é enviada se não for básico E estiver concluído
        data_conclusao:
          !isBasico && isConcluido && data.data_conclusao
            ? new Date(
                `${data.data_conclusao}-01-01T12:00:00.000Z`,
              ).toISOString()
            : null,
      };

      if (editingFormId) {
        const res = await api.put(
          `/candidato/formacoes/${editingFormId}`,
          payload,
        );
        setFormacoes((prev) =>
          prev.map((f) =>
            f.id_formacao === editingFormId ? res.data.data : f,
          ),
        );
        toast.success("Escolaridade atualizada!");
      } else {
        const res = await api.post("/candidato/formacoes", payload);
        setFormacoes((prev) => [...prev, res.data.data]);
        toast.success("Escolaridade adicionada!");
      }

      setShowFormFormacao(false);
      onAtualizarProgresso();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Erro ao salvar escolaridade.",
      );
    } finally {
      setIsSavingForm(false);
    }
  };

  const excluirFormacao = async (id: number) => {
    if (!confirm("Excluir esta formação?")) return;
    try {
      await api.delete(`/candidato/formacoes/${id}`);
      setFormacoes((prev) => prev.filter((f) => f.id_formacao !== id));
      toast.success("Formação removida.");
      onAtualizarProgresso();
    } catch (error) {
      toast.error("Erro ao excluir.");
    }
  };

  // Variável para facilitar a leitura no JSX
  const nivelAtual = watchForm("nivel");
  const isEnsinoBasico =
    nivelAtual === "Ensino Fundamental" || nivelAtual === "Ensino Médio";

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 pt-4">
      {/* ========================================================================= */}
      {/* LISTAGEM DAS ESCOLARIDADES */}
      {/* ========================================================================= */}
      {!showFormFormacao && (
        <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm border border-gray-100 space-y-6 md:space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                Escolaridade e Cursos
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Adicione seu nível de ensino, graduações ou cursos técnicos.
              </p>
            </div>
            {formacoes.length > 0 && (
              <button
                onClick={() => abrirFormFormacao()}
                className="w-full sm:w-auto flex justify-center items-center gap-2 bg-blue-50 text-primary px-5 py-3 md:py-2.5 rounded-full text-sm font-bold hover:bg-blue-100 transition-colors"
              >
                <HiOutlinePlus size={18} /> Adicionar
              </button>
            )}
          </div>

          {/* Estado Vazio */}
          {formacoes.length === 0 ? (
            <div
              onClick={() => abrirFormFormacao()}
              className="p-10 md:p-16 rounded-[24px] md:rounded-[32px] border-2 border-dashed border-gray-200 bg-gray-50/50 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white text-gray-400 shadow-sm border border-gray-100 group-hover:text-blue-500 group-hover:border-blue-200 transition-colors rounded-full flex items-center justify-center mx-auto mb-4 md:mb-5">
                <HiOutlineAcademicCap size={32} className="md:w-10 md:h-10" />
              </div>
              <h3 className="text-lg md:text-xl font-black text-gray-800">
                Nenhuma escolaridade cadastrada
              </h3>
              <p className="text-sm text-gray-500 mt-1.5 font-medium max-w-sm mx-auto">
                Adicione seu nível de ensino atual, cursos técnicos ou
                graduações para destacar seu perfil.
              </p>
            </div>
          ) : (
            /* Lista Preenchida */
            <div className="grid grid-cols-1 gap-4">
              {formacoes.map((f: any) => {
                const isBasico =
                  f.nivel === "Ensino Fundamental" ||
                  f.nivel === "Ensino Médio";

                return (
                  <div
                    key={f.id_formacao}
                    className="group relative flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 rounded-[24px] transition-all gap-5"
                  >
                    <div className="flex items-start gap-4 md:gap-5">
                      <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-gray-50 group-hover:bg-blue-50 border border-gray-100 group-hover:border-blue-100 text-gray-400 group-hover:text-blue-500 rounded-full flex items-center justify-center transition-colors">
                        <HiOutlineAcademicCap size={24} />
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="font-black text-gray-900 text-base md:text-lg leading-tight">
                          {isBasico ? f.nivel : f.curso}
                        </h4>

                        {!isBasico && (
                          <p className="text-xs md:text-sm font-bold text-gray-500 line-clamp-1">
                            {f.instituicao}{" "}
                            <span className="text-gray-300 mx-1.5">•</span>{" "}
                            {f.nivel}
                          </p>
                        )}

                        <div>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              f.status === "CONCLUÍDO"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50"
                                : "bg-amber-50 text-amber-600 border border-amber-100/50"
                            }`}
                          >
                            {f.status}
                            {!isBasico &&
                              f.status === "CONCLUÍDO" &&
                              f.data_conclusao && (
                                <>
                                  <span className="opacity-50 mx-1">•</span>
                                  {new Date(f.data_conclusao).getFullYear()}
                                </>
                              )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1 md:mt-0 w-full md:w-auto">
                      <button
                        onClick={() => abrirFormFormacao(f)}
                        className="flex-1 md:flex-none flex justify-center items-center px-6 py-2.5 md:py-2 text-xs font-black uppercase tracking-widest text-gray-600 bg-white border border-gray-200 hover:border-blue-300 hover:text-primary hover:bg-blue-50 rounded-xl md:rounded-full transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluirFormacao(f.id_formacao)}
                        className="flex items-center justify-center p-2.5 md:p-2 bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl md:rounded-full transition-colors shrink-0"
                        title="Excluir escolaridade"
                      >
                        <HiOutlineTrash size={18} className="md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORMULÁRIO DINÂMICO (INSERIR / EDITAR) */}
      {/* ========================================================================= */}
      {showFormFormacao && (
        <form
          onSubmit={handleSubmitForm(salvarFormacao)}
          className="bg-gray-50/50 p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-inner border border-gray-100 space-y-6 md:space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

          <div className="relative z-10 border-b border-gray-200/60 pb-4 md:pb-5">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
              {editingFormId ? "Editar Escolaridade" : "Nova Escolaridade"}
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Preencha as informações abaixo para atualizar seu perfil.
            </p>
          </div>

          <div className="relative z-10 space-y-1.5 mb-6 flex flex-col">
            <label className="text-xs md:text-sm font-black text-gray-700 ml-1 uppercase tracking-widest">
              1. Qual o seu nível de ensino?
            </label>
            <select
              {...registerForm("nivel")}
              className="w-full md:w-2/3 p-4 bg-white border border-gray-200 rounded-[20px] outline-none text-sm font-medium focus:border-primary focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm cursor-pointer"
            >
              <option value="">Selecione para começar...</option>
              <option value="Ensino Fundamental">Ensino Fundamental</option>
              <option value="Ensino Médio">Ensino Médio</option>
              <option value="Curso Técnico">Curso Técnico</option>
              <option value="Superior (Tecnólogo)">Superior (Tecnólogo)</option>
              <option value="Graduação">
                Graduação (Bacharel/Licenciatura)
              </option>
              <option value="Pós-Graduação / Especialização">
                Pós / Especialização
              </option>
              <option value="Mestrado / Doutorado">Mestrado / Doutorado</option>
              <option value="Curso Complementar">
                Curso Complementar / Idiomas
              </option>
            </select>
            {errorsForm.nivel && (
              <p className="text-[11px] font-bold text-red-500 ml-2 mt-1">
                {errorsForm.nivel.message}
              </p>
            )}
          </div>

          {/* CAMPOS CONDICIONAIS */}
          {nivelAtual && (
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-top-4 duration-500">
              {!isEnsinoBasico && (
                <>
                  <Input
                    label="Instituição de Ensino"
                    placeholder="Ex: UNIJUÍ, IFFar, Fisk..."
                    {...registerForm("instituicao")}
                    error={errorsForm.instituicao?.message}
                  />
                  <Input
                    label="Nome do Curso"
                    placeholder="Ex: Administração, Marketing..."
                    {...registerForm("curso")}
                    error={errorsForm.curso?.message}
                  />
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-black text-gray-700 ml-1 uppercase tracking-widest">
                  Situação Atual
                </label>
                <select
                  {...registerForm("status")}
                  className="w-full p-4 bg-white border border-gray-200 rounded-[20px] outline-none text-sm font-medium focus:border-primary focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm cursor-pointer"
                >
                  <option value="">Selecione o status...</option>
                  <option value="CURSANDO">Cursando</option>
                  <option value="CONCLUÍDO">Concluído</option>
                  <option value="INTERROMPIDO">Incompleto / Trancado</option>
                </select>
                {errorsForm.status && (
                  <p className="text-[11px] font-bold text-red-500 ml-2 mt-1">
                    {errorsForm.status.message}
                  </p>
                )}
              </div>

              {!isEnsinoBasico && watchForm("status") === "CONCLUÍDO" && (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  <Input
                    label="Ano de Conclusão"
                    type="number"
                    placeholder="Exemplo: 2024"
                    min="1950"
                    max="2050"
                    {...registerForm("data_conclusao")}
                    error={errorsForm.data_conclusao?.message}
                  />
                </div>
              )}
            </div>
          )}

          <div className="relative z-10 flex flex-col-reverse md:flex-row justify-center md:justify-end gap-3 pt-8 mt-4 border-t border-gray-200/60">
            <button
              type="button"
              onClick={() => setShowFormFormacao(false)}
              className="w-full md:w-auto px-8 py-4 font-black text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-100 rounded-full md:rounded-2xl border border-gray-200 transition-all uppercase tracking-widest text-xs"
            >
              Cancelar
            </button>
            <ButtonType
              type="submit"
              disabled={isSavingForm}
              className="w-full md:w-auto px-10 py-4 rounded-full md:rounded-2xl shadow-lg shadow-blue-500/20 flex justify-center uppercase tracking-widest text-xs font-black transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              {isSavingForm ? "Salvando..." : "Salvar Escolaridade"}
            </ButtonType>
          </div>
        </form>
      )}
    </div>
  );
}
