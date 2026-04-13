"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  HiOutlineOfficeBuilding,
  HiOutlineX,
  HiOutlineSave,
  HiOutlineMap,
  HiOutlineMail,
} from "react-icons/hi";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";

const editarEmpresaSchema = z.object({
  razao_social: z.string().min(3, "Razão social obrigatória"),
  nome_fantasia: z.string().min(3, "Nome fantasia obrigatório"),
  cnpj: z.string().min(18, "CNPJ incompleto"),
  email_institucional: z
    .string()
    .email("E-mail inválido")
    .nullable()
    .or(z.literal("")),
  tipo_vinculo_aci: z.enum(["ASSOCIADA", "NAO_ASSOCIADA"]),
  logradouro: z.string().min(3, "Rua obrigatória"),
  numero: z.string().min(1, "Nº obrigatório"),
  complemento: z.string().optional(),
  cep: z.string().min(9, "CEP incompleto"),
  bairro: z.string().min(2, "Bairro obrigatório"),
  cidade: z.string().min(2, "Cidade obrigatória"),
  uf: z.string().length(2, "UF deve ter 2 caracteres"),
});

type EditarEmpresaFormData = z.infer<typeof editarEmpresaSchema>;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: any;
  onSuccess: () => void;
}

export function ModalEditarEmpresa({
  isOpen,
  onClose,
  empresa,
  onSuccess,
}: ModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EditarEmpresaFormData>({
    resolver: zodResolver(editarEmpresaSchema),
  });

  useEffect(() => {
    if (empresa && isOpen) {
      reset({
        cnpj: empresa.cnpj,
        razao_social: empresa.razao_social,
        nome_fantasia: empresa.nome_fantasia,
        tipo_vinculo_aci: empresa.tipo_vinculo_aci,
        logradouro: empresa.endereco?.logradouro || "",
        numero: empresa.endereco?.numero || "",
        complemento: empresa.endereco?.complemento || "",
        cep: empresa.endereco?.cep || "",
        bairro: empresa.endereco?.bairro || "",
        cidade: empresa.endereco?.cidade || "",
        uf: empresa.endereco?.uf || "",
      });
    }
  }, [empresa, isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: EditarEmpresaFormData) => {
    setIsLoading(true);
    await toast.promise(
      api.put(`/admin/empresas/${empresa.id_empresa}`, data),
      {
        loading: "Salvando alterações...",
        success: () => {
          onSuccess();
          onClose();
          return "Dados da empresa atualizados!";
        },
        error: (err) => err.response?.data?.error || "Erro ao atualizar dados.",
      },
    );
    setIsLoading(false);
  };

  const maskCNPJ = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .substring(0, 18);
  };

  const maskCEP = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{5})(\d)/, "$1-$2")
      .substring(0, 9);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <HiOutlineOfficeBuilding className="text-blue-600" /> Editar Dados
            da Empresa
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <HiOutlineX size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-y-auto p-8 space-y-8 custom-scrollbar"
        >
          {/* Seção 1: Identificação */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full flex items-center gap-2 text-blue-700 font-bold text-[10px] uppercase tracking-[0.2em]">
              <HiOutlineOfficeBuilding size={14} /> Dados Institucionais
            </div>

            <Input
              label="CNPJ"
              placeholder="00.000.000/0000-00"
              {...register("cnpj")}
              error={errors.cnpj?.message}
              onChange={(e) =>
                setValue("cnpj", maskCNPJ(e.target.value), {
                  shouldValidate: true,
                })
              }
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Vínculo com a ACI
              </label>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 h-[46px]">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={watch("tipo_vinculo_aci") === "ASSOCIADA"}
                    onChange={(e) =>
                      setValue(
                        "tipo_vinculo_aci",
                        e.target.checked ? "ASSOCIADA" : "NAO_ASSOCIADA",
                      )
                    }
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span
                  className={`text-xs font-bold transition-colors ${watch("tipo_vinculo_aci") === "ASSOCIADA" ? "text-blue-700" : "text-gray-500"}`}
                >
                  {watch("tipo_vinculo_aci") === "ASSOCIADA"
                    ? "Empresa Associada"
                    : "Não Associada"}
                </span>
              </div>
            </div>

            <Input
              label="Nome Fantasia"
              placeholder="Ex: ACI Panambi"
              {...register("nome_fantasia")}
              error={errors.nome_fantasia?.message}
            />
            <Input
              label="Razão Social"
              placeholder="Ex: Associação Comercial e Industrial"
              {...register("razao_social")}
              error={errors.razao_social?.message}
            />
          </section>

          <hr className="border-gray-100" />

          {/* Seção 2: Endereço */}
          <section className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="col-span-full flex items-center gap-2 text-blue-700 font-bold text-[10px] uppercase tracking-[0.2em]">
              <HiOutlineMap size={14} /> Localização e Endereço
            </div>

            <div className="md:col-span-2">
              <Input
                label="CEP"
                placeholder="00000-000"
                {...register("cep")}
                error={errors.cep?.message}
                onChange={(e) =>
                  setValue("cep", maskCEP(e.target.value), {
                    shouldValidate: true,
                  })
                }
              />
            </div>

            <div className="md:col-span-3">
              <Input
                label="Logradouro"
                placeholder="Ex: Rua Hermann Meyer"
                {...register("logradouro")}
                error={errors.logradouro?.message}
              />
            </div>

            <div className="md:col-span-1">
              <Input
                label="Nº"
                placeholder="123"
                {...register("numero")}
                error={errors.numero?.message}
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Bairro"
                placeholder="Centro"
                {...register("bairro")}
                error={errors.bairro?.message}
              />
            </div>

            <div className="md:col-span-3">
              <Input
                label="Cidade"
                placeholder="Panambi"
                {...register("cidade")}
                error={errors.cidade?.message}
              />
            </div>

            <div className="md:col-span-1">
              <Input
                label="UF"
                placeholder="RS"
                maxLength={2}
                {...register("uf")}
                error={errors.uf?.message}
              />
            </div>

            <div className="md:col-span-6">
              <Input
                label="Complemento (Opcional)"
                placeholder="Ex: Sala 201, Próximo ao banco..."
                {...register("complemento")}
              />
            </div>
          </section>

          {/* Footer Ações */}
          <div className="pt-4 flex flex-col md:flex-row gap-3">
            <ButtonType
              type="submit"
              variant="primary"
              className="flex-1 py-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
              disabled={isLoading}
            >
              <HiOutlineSave size={20} /> Salvar Alterações
            </ButtonType>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-all rounded-xl hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
