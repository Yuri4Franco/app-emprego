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
  onFormOpenChange?: (isOpen: boolean) => void;
}

export default function TabExperiencia({
  dadosIniciais,
  onAtualizarProgresso,
  onFormOpenChange
}: TabExperienciaProps) {
  const [experiencias, setExperiencias] = useState<any[]>(
    dadosIniciais?.experiencias || [],
  );
  const [showExpForm, setShowExpForm] = useState(false);
  const [editingExpId, setEditingExpId] = useState<number | null>(null);
  const [isSavingExp, setIsSavingExp] = useState(false);

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
  // LÓGICA DO 1º EMPREGO (Salva automático ao clicar)
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
        error.response?.data?.error || "Erro ao atualizar a preferência de primeiro emprego.",
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
    if (onFormOpenChange) onFormOpenChange(true);
  };

  const fecharFormExperiencia = () => {
    setShowExpForm(false);
    setEditingExpId(null);
    if (onFormOpenChange) onFormOpenChange(false);
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
      {/* ========================================================================= */}
      {/* LISTAGEM DE EXPERIÊNCIAS E BANNER */}
      {/* ========================================================================= */}
      {!showExpForm && (
        <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm border border-gray-100 space-y-6 md:space-y-8">

          {/* HEADER DA SEÇÃO */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                Histórico Profissional
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Adicione suas experiências
              </p>
            </div>

            <div className="flex flex-col items-end gap-6">
              <label className="w-full sm:w-auto flex items-center justify-between gap-3 cursor-pointer group bg-blue-50/50 px-4 md:px-5 py-3 rounded-[16px] md:rounded-[20px] border border-blue-100 hover:bg-blue-50 transition-colors">
                <span className="text-xs md:text-sm font-black text-blue-900 tracking-wider">
                  Busco Meu 1º Emprego
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

              {/* Botão de Adicionar sempre visível se houver experiências */}
              {experiencias.length > 0 && (
                <button
                  onClick={() => abrirFormExperiencia()}
                  className="hidden md:flex justify-center items-center gap-2 bg-blue-50 text-primary px-5 py-3 md:py-2.5 rounded-full text-sm font-bold hover:bg-blue-100 transition-colors"
                >
                  <HiOutlinePlus size={18} /> Adicionar Mais Experiências
                </button>
              )}
            </div>
          </div>

          {/* BANNER 1º EMPREGO (Não oculta a lista mais, só encoraja) */}
          {primeiroEmprego && (
            <div className="p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-gradient-to-br from-emerald-50 to-teal-50/30 border border-emerald-100 text-center animate-in zoom-in-95 duration-300">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-sm border border-emerald-50">
                <HiOutlineLightningBolt size={24} />
              </div>
              <h3 className="text-lg md:text-xl font-black text-emerald-900 mb-2">
                Todo grande talento tem um começo!
              </h3>
              <p className="text-xs md:text-sm font-medium text-emerald-700/90 max-w-lg mx-auto leading-relaxed">
                As empresas de Panambi valorizam a vontade de aprender. E lembre-se: se você já fez <b>Jovem Aprendiz, Estágios, Trabalhos Voluntários ou Projetos Livres</b>, adicione-os abaixo! Eles contam muito.
              </p>
            </div>
          )}

          {/* ESTADO VAZIO OU LISTA DE EXPERIÊNCIAS */}
          <div className="space-y-4 md:space-y-6">
            {experiencias.length === 0 ? (
              <div
                onClick={() => abrirFormExperiencia()}
                className="p-10 md:p-16 rounded-[24px] md:rounded-[32px] border-2 border-dashed border-gray-200 bg-gray-50/50 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white text-gray-400 shadow-sm border border-gray-100 group-hover:text-blue-500 group-hover:border-blue-200 transition-colors rounded-full flex items-center justify-center mx-auto mb-4 md:mb-5">
                  <HiOutlineBriefcase size={32} className="md:w-10 md:h-10" />
                </div>
                {/* Texto adaptável dependendo se é primeiro emprego ou não */}
                <h3 className="text-lg md:text-xl font-black text-gray-800">
                  {primeiroEmprego ? "Nenhum estágio ou projeto cadastrado" : "Nenhuma experiência cadastrada"}
                </h3>
                <p className="text-sm text-gray-500 mt-1.5 font-medium max-w-sm mx-auto">
                  {primeiroEmprego
                    ? "Clique aqui para registrar estágios, trabalhos voluntários ou Jovem Aprendiz."
                    : "Clique aqui para começar a adicionar suas experiências profissionais."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {experiencias.map((exp: any) => (
                  <div
                    key={exp.id_experiencia}
                    className="group relative flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 rounded-[24px] transition-all gap-5"
                  >
                    <div className="flex items-start gap-4 md:gap-5">
                      <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-gray-50 group-hover:bg-blue-50 border border-gray-100 group-hover:border-blue-100 text-gray-400 group-hover:text-blue-500 rounded-full flex items-center justify-center transition-colors">
                        <HiOutlineBriefcase size={24} />
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="font-black text-gray-900 text-base md:text-lg leading-tight group-hover:text-blue-600 transition-colors">
                          {exp.cargo}
                        </h4>

                        <p className="text-xs md:text-sm font-bold text-gray-500 line-clamp-1">
                          {exp.empresa}
                        </p>

                        <div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100/50">
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
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1 md:mt-0 w-full md:w-auto">
                      <button
                        onClick={() => abrirFormExperiencia(exp)}
                        className="flex-1 md:flex-none flex justify-center items-center px-6 py-2.5 md:py-2 text-xs font-black uppercase tracking-widest text-gray-600 bg-white border border-gray-200 hover:border-blue-300 hover:text-primary hover:bg-blue-50 rounded-xl md:rounded-full transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluirExperiencia(exp.id_experiencia)}
                        className="flex items-center justify-center p-2.5 md:p-2 bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl md:rounded-full transition-colors shrink-0"
                        title="Excluir experiência"
                      >
                        <HiOutlineTrash size={18} className="md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Botão mobile de adicionar */}
                <button
                  onClick={() => abrirFormExperiencia()}
                  className="mt-2 md:hidden w-full flex justify-center items-center gap-2 bg-blue-50 text-primary px-5 py-3 rounded-full text-sm font-bold hover:bg-blue-100 transition-colors"
                >
                  <HiOutlinePlus size={18} /> Adicionar Nova
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORMULÁRIO DINÂMICO (INSERIR / EDITAR) */}
      {/* ========================================================================= */}
      {showExpForm && (
        <form
          onSubmit={handleSubmitExp(salvarExperiencia)}
          className="bg-gray-50/50 p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-inner border border-gray-100 space-y-6 md:space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

          <div className="relative z-10 border-b border-gray-200/60 pb-4 md:pb-5">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
              {editingExpId ? "Editar Experiência Profissional" : "Adicionar Experiência Profissional"}
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Preencha os dados do cargo e as suas principais atividades.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <Input
              label="Nome da Empresa"
              placeholder="Ex: ACI Panambi ou Trabalho Voluntário"
              {...registerExp("empresa")}
              error={errorsExp.empresa?.message}
            />
            <Input
              label="Cargo que Ocupava"
              placeholder="Ex: Auxiliar Administrativo, Estagiário..."
              {...registerExp("cargo")}
              error={errorsExp.cargo?.message}
            />
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
                label="Data de Saída (mês/ano)"
                type="text"
                placeholder={watchExp("atual") ? "Cargo atual" : "MM/AAAA"}
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

          <div className="relative z-10 space-y-1.5 pt-2 flex flex-col">
            <label className="text-xs md:text-sm font-black text-gray-700 ml-1 uppercase tracking-widest">
              Atividades e Conquistas
            </label>
            <textarea
              {...registerExp("atividades")}
              className="w-full p-4 md:p-6 bg-white border border-gray-200 rounded-[20px] h-32 outline-none text-sm focus:border-primary focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm resize-none"
              placeholder="Descreva as suas responsabilidades, o que aprendeu e ferramentas que utilizou..."
            />
            {errorsExp.atividades && (
              <p className="text-[11px] font-bold text-red-500 ml-2 mt-1">
                {errorsExp.atividades.message}
              </p>
            )}
          </div>

          <div className="relative z-10 flex flex-col-reverse md:flex-row justify-center md:justify-end gap-3 pt-8 mt-4 border-t border-gray-200/60">
            <button
              type="button"
              onClick={fecharFormExperiencia}
              disabled={isSavingExp}
              className="w-full md:w-auto px-8 py-4 font-black text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-100 rounded-full md:rounded-2xl border border-gray-200 transition-all uppercase tracking-widest text-xs"
            >
              Cancelar
            </button>
            <ButtonType
              type="submit"
              disabled={isSavingExp}
              className="w-full md:w-auto px-10 py-4 rounded-full md:rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs font-black transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              {isSavingExp ? "Salvando..." : (
                <><HiOutlineSave size={18} /> Salvar</>
              )}
            </ButtonType>
          </div>
        </form>
      )}
    </div>
  );
}