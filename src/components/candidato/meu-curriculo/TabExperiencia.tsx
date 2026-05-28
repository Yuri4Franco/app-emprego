"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
  HiOutlineBriefcase,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineLightningBolt,
  HiOutlineSave,
} from "react-icons/hi";

import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";
import { maskMesAno } from "@/src/utils/curriculoUtils";
import {
  experienciaSchema,
  ExperienciaData,
} from "@/src/schemas/curriculoSchemas";

interface TabExperienciaProps {
  dadosIniciais: any;
  onAtualizarProgresso: () => void;
}

export default function TabExperiencia({
  dadosIniciais,
  onAtualizarProgresso,
}: TabExperienciaProps) {
  // Estados Locais
  const [experiencias, setExperiencias] = useState<any[]>(
    dadosIniciais?.experiencias || [],
  );
  const [showExpForm, setShowExpForm] = useState(false);
  const [editingExpId, setEditingExpId] = useState<number | null>(null);
  const [isSavingExp, setIsSavingExp] = useState(false);

  // O estado do 1º emprego agora vive aqui e inicializa com o dado do backend
  const [primeiroEmprego, setPrimeiroEmprego] = useState<boolean>(
    dadosIniciais?.primeiro_emprego || false,
  );

  const {
    register: registerExp,
    handleSubmit: handleSubmitExp,
    reset: resetExp,
    watch: watchExp,
    setValue: setValueExp,
    formState: { errors: errorsExp },
  } = useForm<ExperienciaData>({
    resolver: zodResolver(experienciaSchema) as any,
    defaultValues: {
      empresa: "",
      cargo: "",
      atividades: "",
      data_inicio: "",
      data_fim: "",
      atual: false,
    },
  });

  // =========================================================================
  // LÓGICA DO 1º EMPREGO
  // =========================================================================
  const handleTogglePrimeiroEmprego = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const isChecked = e.target.checked;
    const toastId = toast.loading("Salvando preferência...");

    // UI Otimista: Já vira a chavinha na tela para o usuário não sentir lentidão
    setPrimeiroEmprego(isChecked);

    try {
      // O payload agora tem literalmente apenas 1 linha! ✨
      const res = await api.patch("/candidato/primeiro-emprego", {
        primeiro_emprego: isChecked,
      });

      // Usamos a mensagem que o nosso backend devolveu
      toast.success(res.data.message, { id: toastId });

      // Atualiza a barra de progresso de preenchimento do currículo
      if (onAtualizarProgresso) {
        onAtualizarProgresso();
      }
    } catch (error: any) {
      // Se a API falhar, desfazemos a chavinha otimista
      setPrimeiroEmprego(!isChecked);
      toast.error(
        error.response?.data?.error ||
          "Erro ao atualizar a preferência de primeiro emprego.",
        { id: toastId },
      );
    }
  };

  // =========================================================================
  // LÓGICA DO FORMULÁRIO DE EXPERIÊNCIA
  // =========================================================================
  const abrirFormExperiencia = (exp?: any) => {
    const formatToMask = (isoString?: string | null) => {
      if (!isoString) return "";
      const parts = String(isoString).split("T")[0].split("-");
      if (parts.length >= 2) return `${parts[1]}/${parts[0]}`;
      return "";
    };

    if (exp) {
      setEditingExpId(exp.id_experiencia);
      resetExp({
        empresa: exp.empresa,
        cargo: exp.cargo,
        atividades: exp.atividades || "",
        data_inicio: formatToMask(exp.data_inicio),
        data_fim: formatToMask(exp.data_fim),
        atual: exp.atual || false,
      });
    } else {
      setEditingExpId(null);
      resetExp({
        empresa: "",
        cargo: "",
        atividades: "",
        data_inicio: "",
        data_fim: "",
        atual: false,
      });
    }
    setShowExpForm(true);
  };

  const fecharFormExperiencia = () => {
    setShowExpForm(false);
    setEditingExpId(null);
  };

  const salvarExperiencia = async (data: ExperienciaData) => {
    setIsSavingExp(true);
    try {
      const formatToDb = (mmAAAA: string) => {
        const [mes, ano] = mmAAAA.split("/");
        return new Date(`${ano}-${mes}-01T12:00:00.000Z`).toISOString();
      };

      const payload = {
        ...data,
        data_inicio: formatToDb(data.data_inicio),
        data_fim:
          data.atual || !data.data_fim ? null : formatToDb(data.data_fim),
      };

      if (editingExpId) {
        const res = await api.put(
          `/candidato/experiencias/${editingExpId}`,
          payload,
        );
        setExperiencias((prev) =>
          prev.map((e) =>
            e.id_experiencia === editingExpId ? res.data.data : e,
          ),
        );
        toast.success("Experiência atualizada!");
      } else {
        const res = await api.post("/candidato/experiencias", payload);
        setExperiencias((prev) => [...prev, res.data.data]);
        toast.success("Experiência adicionada!");
      }

      fecharFormExperiencia();
      onAtualizarProgresso();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao salvar experiência.");
    } finally {
      setIsSavingExp(false);
    }
  };

  const excluirExperiencia = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta experiência?")) return;
    try {
      await api.delete(`/candidato/experiencias/${id}`);
      setExperiencias((prev) => prev.filter((e) => e.id_experiencia !== id));
      toast.success("Experiência removida.");
      onAtualizarProgresso();
    } catch (error) {
      toast.error("Erro ao excluir experiência.");
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 pt-4">
      {/* LISTAGEM DE EXPERIÊNCIAS (Se o formulário estiver fechado) */}
      {!showExpForm && (
        <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[40px] shadow-sm border border-gray-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-black text-gray-800">
                Histórico Profissional
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                Adicione suas experiências mais relevantes.
              </p>
            </div>

            {/* TOGGLE 1º EMPREGO */}
            <label className="w-full sm:w-auto flex items-center justify-between gap-3 cursor-pointer group bg-blue-50/50 px-4 md:px-5 py-3 rounded-[16px] md:rounded-[20px] border border-blue-100 hover:bg-blue-50 transition-colors">
              <span className="text-xs md:text-sm font-black text-blue-900">
                Busco meu 1º Emprego
              </span>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={primeiroEmprego}
                  onChange={handleTogglePrimeiroEmprego}
                />
                <div className="w-10 h-5 md:w-11 md:h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 md:after:h-5 md:after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </div>
            </label>
          </div>

          {/* ESTADO: 1º EMPREGO MARCADO */}
          {primeiroEmprego ? (
            <div className="p-6 md:p-10 rounded-[24px] md:rounded-[32px] bg-gradient-to-br from-emerald-50 to-teal-50/30 border border-emerald-100 text-center animate-in zoom-in-95 duration-300">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-sm border border-emerald-50">
                <HiOutlineLightningBolt size={24} className="md:w-7 md:h-7" />
              </div>
              <h3 className="text-lg md:text-xl font-black text-emerald-900 mb-2">
                Todo grande talento tem um começo!
              </h3>
              <p className="text-xs md:text-sm font-medium text-emerald-700/80 max-w-md mx-auto leading-relaxed">
                Empresas estão em busca de pessoas com vontade de aprender.
                Capriche nas abas de <b>Formação</b> e <b>Habilidades</b>!
              </p>
            </div>
          ) : (
            /* ESTADO: LISTA DE EMPREGOS */
            <div className="space-y-4 md:space-y-6">
              {experiencias.length > 0 && (
                <div className="flex justify-center sm:justify-end border-t border-gray-50 pt-4">
                  <button
                    onClick={() => abrirFormExperiencia()}
                    className="w-full sm:w-auto flex justify-center items-center gap-2 bg-blue-50 text-primary px-5 py-3 md:py-2.5 rounded-full text-sm font-bold hover:bg-blue-100 transition-colors"
                  >
                    <HiOutlinePlus size={18} /> Adicionar Experiência
                  </button>
                </div>
              )}

              {experiencias.length === 0 ? (
                <div
                  onClick={() => abrirFormExperiencia()}
                  className="p-10 md:p-16 rounded-[24px] md:rounded-[32px] border-2 border-dashed border-gray-200 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-50 text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-100 transition-colors rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <HiOutlineBriefcase size={24} className="md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-gray-700">
                    Nenhuma experiência cadastrada
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400 mt-1">
                    Clique aqui para adicionar seu emprego anterior ou atual.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {experiencias.map((exp: any) => (
                    <div
                      key={exp.id_experiencia}
                      className="flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 bg-gray-50 border border-gray-100 rounded-[20px] md:rounded-[24px] group hover:border-blue-200 transition-colors"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-gray-800 text-base md:text-lg leading-tight">
                          {exp.cargo}
                        </h4>
                        <p className="text-xs md:text-sm font-medium text-primary">
                          {exp.empresa}
                        </p>
                        <p className="text-[11px] md:text-xs text-gray-400 font-medium">
                          {new Date(exp.data_inicio).toLocaleDateString(
                            "pt-BR",
                            { month: "short", year: "numeric" },
                          )}{" "}
                          -{" "}
                          {exp.atual
                            ? "Atual"
                            : new Date(exp.data_fim).toLocaleDateString(
                                "pt-BR",
                                { month: "short", year: "numeric" },
                              )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() => abrirFormExperiencia(exp)}
                          className="flex-1 sm:flex-none justify-center flex px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 hover:border-blue-300 hover:text-primary rounded-full transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluirExperiencia(exp.id_experiencia)}
                          className="p-2 flex items-center justify-center bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORMULÁRIO DE EXPERIÊNCIA (INSERIR / EDITAR) */}
      {/* ========================================================================= */}
      {showExpForm && (
        <form
          onSubmit={handleSubmitExp(salvarExperiencia)}
          className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[40px] shadow-sm border border-gray-100 space-y-6"
        >
          <h2 className="text-lg md:text-xl font-black text-gray-800 border-b border-gray-100 pb-3 md:pb-4">
            {editingExpId ? "Editar Experiência" : "Nova Experiência"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Empresa"
              placeholder="Ex: ACI Panambi"
              {...registerExp("empresa")}
              error={errorsExp.empresa?.message}
            />
            <Input
              label="Cargo"
              placeholder="Ex: Analista de Sistemas"
              {...registerExp("cargo")}
              error={errorsExp.cargo?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <Input
              label="Data de Início (mês/ano)"
              type="text"
              placeholder="MM/AAAA"
              maxLength={7}
              {...registerExp("data_inicio", {
                onChange: (e) => (e.target.value = maskMesAno(e.target.value)),
              })}
              error={errorsExp.data_inicio?.message}
            />

            <div className="space-y-2">
              <Input
                label="Data de Fim (mês/ano)"
                type="text"
                placeholder={watchExp("atual") ? "Trabalho atual" : "MM/AAAA"}
                maxLength={7}
                disabled={watchExp("atual")}
                className={watchExp("atual") ? "opacity-50 bg-gray-100" : ""}
                {...registerExp("data_fim", {
                  onChange: (e) =>
                    (e.target.value = maskMesAno(e.target.value)),
                })}
                error={errorsExp.data_fim?.message}
              />
              <label className="flex items-center gap-2 cursor-pointer group px-1">
                <input
                  type="checkbox"
                  {...registerExp("atual")}
                  onChange={(e) => {
                    setValueExp("atual", e.target.checked);
                    if (e.target.checked) setValueExp("data_fim", "");
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-blue-500 transition-colors cursor-pointer"
                />
                <span className="text-[11px] md:text-xs font-bold text-gray-500 group-hover:text-primary transition-colors">
                  Trabalho atualmente neste cargo
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs md:text-sm font-bold text-gray-700 ml-1">
              Atividades e Conquistas
            </label>
            <textarea
              {...registerExp("atividades")}
              className="w-full p-4 md:p-6 bg-gray-50 border border-gray-100 rounded-[20px] md:rounded-[32px] h-32 outline-none text-sm focus:ring-4 focus:ring-blue-500/5 resize-none"
              placeholder="Descreva suas responsabilidades e resultados..."
            />
            {errorsExp.atividades && (
              <p className="text-[11px] md:text-xs text-red-500 ml-2 font-bold">
                {errorsExp.atividades.message}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse md:flex-row justify-center md:justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={fecharFormExperiencia}
              disabled={isSavingExp}
              className="w-full md:w-auto px-8 py-3.5 md:py-4 rounded-full md:rounded-[24px] font-bold text-gray-500 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
            >
              Cancelar
            </button>
            <ButtonType
              type="submit"
              disabled={isSavingExp}
              className="w-full md:w-auto px-10 py-3.5 md:py-4 rounded-full md:rounded-[24px] flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
            >
              <HiOutlineSave size={20} />{" "}
              {isSavingExp ? "Salvando..." : "Salvar Experiência"}
            </ButtonType>
          </div>
        </form>
      )}
    </div>
  );
}
