"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineExclamation,
  HiOutlineSave,
  HiOutlineGift,
} from "react-icons/hi";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";

// --- SCHEMA DE VALIDAÇÃO (Usando 'descricao' conforme o DB) ---
const beneficioSchema = z.object({
  descricao: z.string().min(2, "O benefício deve ter pelo menos 2 caracteres."),
});

type BeneficioFormData = z.infer<typeof beneficioSchema>;

export function TabBeneficios() {
  const [beneficios, setBeneficios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState("");

  // Estados dos Modais
  const [modalForm, setModalForm] = useState<{
    isOpen: boolean;
    beneficio: any | null;
  }>({
    isOpen: false,
    beneficio: null,
  });
  const [modalDelete, setModalDelete] = useState<{
    isOpen: boolean;
    beneficio: any | null;
  }>({
    isOpen: false,
    beneficio: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm<BeneficioFormData>({
    resolver: zodResolver(beneficioSchema),
    mode: "onChange",
  });

  // --- CARREGAMENTO DE DADOS ---
  const carregarBeneficios = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/taxonomia/beneficios");
      setBeneficios(res.data.data || res.data || []);
    } catch (error) {
      toast.error("Erro ao carregar os benefícios.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarBeneficios();
  }, [carregarBeneficios]);

  // --- CONTROLES DE MODAL ---
  const abrirModalForm = (beneficio?: any) => {
    if (beneficio) {
      setValue("descricao", beneficio.descricao);
      setModalForm({ isOpen: true, beneficio });
    } else {
      reset({ descricao: "" });
      setModalForm({ isOpen: true, beneficio: null });
    }
  };

  const fecharModalForm = () => {
    setModalForm({ isOpen: false, beneficio: null });
    reset({ descricao: "" });
  };

  const abrirModalDelete = (beneficio: any) => {
    setModalDelete({ isOpen: true, beneficio });
  };

  const fecharModalDelete = () => {
    setModalDelete({ isOpen: false, beneficio: null });
  };

  // --- AÇÕES DA API ---
  const onSubmit = async (data: BeneficioFormData) => {
    setIsSubmitting(true);
    try {
      if (modalForm.beneficio) {
        await api.put(
          `/admin/taxonomia/beneficios/${modalForm.beneficio.id_beneficio}`,
          data,
        );
        toast.success("Benefício atualizado com sucesso!");
      } else {
        // Cria Novo Benefício
        await api.post("/admin/taxonomia/beneficios", data);
        toast.success("Novo benefício criado com sucesso!");
      }
      fecharModalForm();
      carregarBeneficios();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao salvar o benefício.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletarBeneficio = async () => {
    if (!modalDelete.beneficio) return;
    setIsSubmitting(true);
    try {
      await api.delete(
        `/admin/taxonomia/beneficios/${modalDelete.beneficio.id_beneficio}`,
      );
      toast.success("Benefício excluído com sucesso!");
      fecharModalDelete();
      carregarBeneficios();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
          "Erro ao excluir o benefício. Ele pode estar vinculado a vagas ativas.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- FILTRAGEM ---
  const beneficiosFiltrados = beneficios.filter((b) =>
    b.descricao.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER DA TAB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900">
            Catálogo de Benefícios
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Gerencie os benefícios que as empresas podem atrelar às vagas.
          </p>
        </div>
        <ButtonType
          onClick={() => abrirModalForm()}
          className="flex items-center justify-center gap-2 px-6 py-3 shadow-md shadow-emerald-100"
        >
          <HiOutlinePlus size={18} /> Adicionar Benefício
        </ButtonType>
      </div>

      {/* BARRA DE BUSCA */}
      <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-3">
        <HiOutlineSearch className="text-gray-400 shrink-0 ml-2" size={20} />
        <input
          type="text"
          placeholder="Buscar benefício..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-transparent outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {/* LISTAGEM */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
            Carregando catálogo...
          </div>
        ) : beneficiosFiltrados.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineGift size={28} />
            </div>
            <p className="text-gray-800 font-black text-lg mb-1">
              Nenhum benefício encontrado
            </p>
            <p className="text-sm text-gray-500 font-medium">
              Tente buscar com outros termos ou adicione um novo.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {beneficiosFiltrados.map((beneficio) => (
              <div
                key={beneficio.id_beneficio}
                className="flex items-center justify-between p-4 px-6 hover:bg-emerald-50/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 text-gray-500 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-emerald-600 group-hover:shadow-sm transition-all">
                    <HiOutlineGift size={20} />
                  </div>
                  <span className="font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                    {beneficio.descricao}
                  </span>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => abrirModalForm(beneficio)}
                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Editar Benefício"
                  >
                    <HiOutlinePencilAlt size={18} />
                  </button>
                  <button
                    onClick={() => abrirModalDelete(beneficio)}
                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Excluir Benefício"
                  >
                    <HiOutlineTrash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODAIS ================= */}

      {/* Modal Formulário (Criação / Edição) */}
      {modalForm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <HiOutlineGift className="text-emerald-500" />
                {modalForm.beneficio ? "Editar Benefício" : "Novo Benefício"}
              </h3>
              <button
                onClick={fecharModalForm}
                className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Descrição do Benefício"
                placeholder="Ex: Vale Refeição (VR)"
                {...register("descricao")}
                error={errors.descricao?.message}
                autoFocus
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={fecharModalForm}
                  disabled={isSubmitting}
                  className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <ButtonType
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="flex-1 py-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <HiOutlineSave size={18} /> Salvar
                    </>
                  )}
                </ButtonType>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Exclusão */}
      {modalDelete.isOpen && modalDelete.beneficio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-md shadow-2xl text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineExclamation size={32} />
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-2">
              Excluir Benefício?
            </h3>
            <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
              Tem certeza que deseja excluir o benefício{" "}
              <span className="font-bold text-gray-800">
                "{modalDelete.beneficio.descricao}"
              </span>
              ? Esta ação não poderá ser desfeita e removerá o benefício das
              empresas atreladas.
            </p>

            <div className="flex gap-3">
              <button
                onClick={fecharModalDelete}
                disabled={isSubmitting}
                className="flex-1 py-4 font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={deletarBeneficio}
                disabled={isSubmitting}
                className="flex-1 py-4 font-black text-white bg-red-600 hover:bg-red-700 rounded-2xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Sim, Excluir"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
