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
  HiOutlineCollection,
  HiOutlineX,
  HiOutlineExclamation,
  HiOutlineSave,
  HiOutlineBriefcase,
} from "react-icons/hi";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";

// --- SCHEMA DE VALIDAÇÃO ---
const areaSchema = z.object({
  nome: z.string().min(2, "O nome da área deve ter pelo menos 2 caracteres."),
});

type AreaFormData = z.infer<typeof areaSchema>;

export function TabAreasAtuacao() {
  const [areas, setAreas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState("");

  // Estados dos Modais
  const [modalForm, setModalForm] = useState<{
    isOpen: boolean;
    area: any | null;
  }>({
    isOpen: false,
    area: null,
  });
  const [modalDelete, setModalDelete] = useState<{
    isOpen: boolean;
    area: any | null;
  }>({
    isOpen: false,
    area: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm<AreaFormData>({
    resolver: zodResolver(areaSchema),
    mode: "onChange",
  });

  // --- CARREGAMENTO DE DADOS ---
  const carregarAreas = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/taxonomia/areas");
      // O backend pode retornar direto o array ou dentro de um objeto { data: ... }
      setAreas(res.data.data || res.data || []);
    } catch (error) {
      toast.error("Erro ao carregar as áreas de atuação.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarAreas();
  }, [carregarAreas]);

  // --- CONTROLES DE MODAL ---
  const abrirModalForm = (area?: any) => {
    if (area) {
      setValue("nome", area.nome);
      setModalForm({ isOpen: true, area });
    } else {
      reset({ nome: "" });
      setModalForm({ isOpen: true, area: null });
    }
  };

  const fecharModalForm = () => {
    setModalForm({ isOpen: false, area: null });
    reset({ nome: "" });
  };

  const abrirModalDelete = (area: any) => {
    setModalDelete({ isOpen: true, area });
  };

  const fecharModalDelete = () => {
    setModalDelete({ isOpen: false, area: null });
  };

  // --- AÇÕES DA API ---
  const onSubmit = async (data: AreaFormData) => {
    setIsSubmitting(true);
    try {
      if (modalForm.area) {
        // Atualiza Área Existente
        await api.put(`/admin/taxonomia/${modalForm.area.id_area}`, data); // Ajuste a rota se necessário
        toast.success("Área atualizada com sucesso!");
      } else {
        // Cria Nova Área
        await api.post("/admin/taxonomia/areas", data);
        toast.success("Nova área criada com sucesso!");
      }
      fecharModalForm();
      carregarAreas();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao salvar a área.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletarArea = async () => {
    if (!modalDelete.area) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/admin/taxonomia/areas/${modalDelete.area.id_area}`);
      toast.success("Área excluída com sucesso!");
      fecharModalDelete();
      carregarAreas();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
          "Erro ao excluir a área. Ela pode estar em uso.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- FILTRAGEM ---
  const areasFiltradas = areas.filter((a) =>
    a.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER DA TAB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900">Áreas de Atuação</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Gerencie os setores profissionais disponíveis para vagas e
            candidatos.
          </p>
        </div>
        <ButtonType
          onClick={() => abrirModalForm()}
          className="flex items-center justify-center gap-2 px-6 py-3 shadow-md shadow-blue-100"
        >
          <HiOutlinePlus size={18} /> Adicionar Área
        </ButtonType>
      </div>

      {/* BARRA DE BUSCA */}
      <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-3">
        <HiOutlineSearch className="text-gray-400 shrink-0 ml-2" size={20} />
        <input
          type="text"
          placeholder="Buscar área por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-transparent outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {/* LISTAGEM */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            Carregando catálogo...
          </div>
        ) : areasFiltradas.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineCollection size={28} />
            </div>
            <p className="text-gray-800 font-black text-lg mb-1">
              Nenhuma área encontrada
            </p>
            <p className="text-sm text-gray-500 font-medium">
              Tente buscar com outros termos ou adicione uma nova.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {areasFiltradas.map((area) => (
              <div
                key={area.id_area}
                className="flex items-center justify-between p-4 px-6 hover:bg-blue-50/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 text-gray-500 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm transition-all">
                    <HiOutlineBriefcase size={20} />
                  </div>
                  <span className="font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                    {area.nome}
                  </span>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => abrirModalForm(area)}
                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Editar Área"
                  >
                    <HiOutlinePencilAlt size={18} />
                  </button>
                  <button
                    onClick={() => abrirModalDelete(area)}
                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Excluir Área"
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
                <HiOutlineCollection className="text-blue-600" />
                {modalForm.area ? "Editar Área" : "Nova Área de Atuação"}
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
                label="Nome da Área"
                placeholder="Ex: Tecnologia da Informação"
                {...register("nome")}
                error={errors.nome?.message}
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
      {modalDelete.isOpen && modalDelete.area && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-md shadow-2xl text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineExclamation size={32} />
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-2">
              Excluir Área?
            </h3>
            <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
              Tem certeza que deseja excluir a área{" "}
              <span className="font-bold text-gray-800">
                "{modalDelete.area.nome}"
              </span>
              ? Esta ação não poderá ser desfeita e pode falhar se houver vagas
              vinculadas a ela.
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
                onClick={deletarArea}
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
