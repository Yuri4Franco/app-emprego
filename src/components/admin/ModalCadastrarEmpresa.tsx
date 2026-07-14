"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/src/services/api";
import { HiOutlineX, HiOutlineEye, HiOutlineEyeOff, HiOutlineOfficeBuilding, HiOutlineMap, HiOutlineUserCircle } from "react-icons/hi";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";
import toast from 'react-hot-toast';

const empresaSchema = z.object({
    nome: z.string().min(3, "Nome do responsável é obrigatório"),
    email: z.string().email("E-mail inválido"),
    senha: z.string().min(8, "Mínimo 8 caracteres"),
    cnpj: z.string().min(18, "CNPJ incompleto"),
    razao_social: z.string().min(3, "Razão social obrigatória"),
    nome_fantasia: z.string().min(3, "Nome fantasia obrigatório"),
    logradouro: z.string().min(1, "Obrigatório"),
    numero: z.string().min(1, "Obrigatório"),
    complemento: z.string().optional(),
    cep: z.string().min(9, "CEP incompleto"),
    cidade: z.string().min(1, "Obrigatório"),
    uf: z.string().length(2, "UF inválida"),
    bairro: z.string().min(1, "Bairro é obrigatório"),
    tipo_vinculo_aci: z.enum(["ASSOCIADA", "NAO_ASSOCIADA"]),
});

type EmpresaFormData = z.infer<typeof empresaSchema>;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ModalCadastrarEmpresa({ isOpen, onClose, onSuccess }: ModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<EmpresaFormData>({
        resolver: zodResolver(empresaSchema),
        defaultValues: {
            cidade: "Panambi",
            uf: "RS",
            tipo_vinculo_aci: "ASSOCIADA",
            cnpj: "",
            cep: "98280-000",
            senha: "@Acivagas555",
        }
    });

    if (!isOpen) return null;

    // Funções de Máscara
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

    const onSubmit = async (data: EmpresaFormData) => {
        const payload = { ...data }; // limpe seus dados aqui

        // O toast.promise gerencia o loading, o sucesso e o erro sozinho!
        await toast.promise(
            api.post("/admin/cadastrar-empresa", payload),
            {
                loading: 'Salvando empresa...',
                success: <b>Empresa cadastrada com sucesso!</b>,
                error: (err) => <b>{err.response?.data?.error || "Erro ao salvar."}</b>,
            }
        );

        // Se chegou aqui, deu certo
        reset();
        onSuccess();
        onClose();
    };

    const onInvalid = (errors: any) => {
        console.error("ERROS DE VALIDAÇÃO:", errors);
        setError("Preencha todos os campos obrigatórios corretamente.");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl max-h-[95vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3 text-blue-900">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <HiOutlineOfficeBuilding size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Cadastrar Empresa</h2>
                            <p className="text-sm text-gray-500">Preencha os dados para criar o acesso administrativo.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <HiOutlineX size={24} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="overflow-y-auto p-8 custom-scrollbar">
                    {(error || Object.keys(errors).length > 0) && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-medium">
                            {error || "Existem erros no formulário. Verifique os campos em vermelho."}
                        </div>
                    )}

                    <div className="space-y-10">

                        {/* Seção 1: Institucional */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-full flex items-center gap-2 text-blue-700 font-semibold text-sm uppercase tracking-wider">
                                <HiOutlineOfficeBuilding /> Dados Institucionais
                            </div>
                            <Input
                                label="CNPJ"
                                error={errors.cnpj?.message}
                                placeholder="00.000.000/0000-00"
                                {...register("cnpj")}
                                onChange={(e) => setValue("cnpj", maskCNPJ(e.target.value), { shouldValidate: true })}
                            />
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700">Vínculo com a ACI</label>
                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 h-[45px]">
                                    {/* O Switch em si */}
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            // Lógica para transformar o booleano do switch no Enum do seu backend
                                            checked={watch("tipo_vinculo_aci") === "ASSOCIADA"}
                                            onChange={(e) => {
                                                setValue("tipo_vinculo_aci", e.target.checked ? "ASSOCIADA" : "NAO_ASSOCIADA");
                                            }}
                                        />
                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>

                                    {/* Texto dinâmico ao lado do Switch */}
                                    <span className={`text-sm font-bold transition-colors ${watch("tipo_vinculo_aci") === "ASSOCIADA" ? "text-blue-700" : "text-gray-500"
                                        }`}>
                                        {watch("tipo_vinculo_aci") === "ASSOCIADA" ? "Empresa Associada" : "Não Associada"}
                                    </span>
                                </div>
                            </div>
                            <Input label="Nome Fantasia" placeholder="Ex: ACI Panambi" {...register("nome_fantasia")} error={errors.nome_fantasia?.message} />
                            <Input label="Razão Social" placeholder="Ex: Associação Comercial e Industrial" {...register("razao_social")} error={errors.razao_social?.message} />
                        </section>

                        {/* Seção 2: Endereço */}
                        <section className="grid grid-cols-1 md:grid-cols-6 gap-6">
                            <div className="col-span-full flex items-center gap-2 text-blue-700 font-semibold text-sm uppercase tracking-wider">
                                <HiOutlineMap /> Localização
                            </div>

                            {/* CEP ocupa 2 colunas */}
                            <div className="md:col-span-2">
                                <Input
                                    label="CEP"
                                    error={errors.cep?.message}
                                    placeholder="00000-000"
                                    {...register("cep")}
                                    onChange={(e) => setValue("cep", maskCEP(e.target.value), { shouldValidate: true })}
                                />
                            </div>

                            {/* Logradouro ocupa 3 colunas */}
                            <div className="md:col-span-3">
                                <Input
                                    label="Logradouro"
                                    placeholder="Ex: Rua Hermann Meyer"
                                    {...register("logradouro")}
                                    error={errors.logradouro?.message}
                                />
                            </div>

                            {/* Número ocupa 1 coluna */}
                            <div className="md:col-span-1">
                                <Input
                                    label="Nº"
                                    placeholder="123"
                                    {...register("numero")}
                                    error={errors.numero?.message}
                                />
                            </div>

                            {/* Bairro ocupa 2 colunas */}
                            <div className="md:col-span-2">
                                <Input
                                    label="Bairro"
                                    placeholder="Ex: Centro"
                                    {...register("bairro")}
                                    error={errors.bairro?.message}
                                />
                            </div>

                            {/* Cidade ocupa 3 colunas */}
                            <div className="md:col-span-3">
                                <Input
                                    label="Cidade"
                                    {...register("cidade")}
                                    error={errors.cidade?.message}
                                />
                            </div>

                            {/* UF ocupa 1 coluna */}
                            <div className="md:col-span-1">
                                <Input
                                    label="UF"
                                    placeholder="RS"
                                    maxLength={2}
                                    {...register("uf")}
                                    error={errors.uf?.message}
                                />
                            </div>

                            {/* Complemento (Opcional) - Ocupa a linha toda se quiser ou 3 colunas */}
                            <div className="md:col-span-6">
                                <Input
                                    label="Complemento (Opcional)"
                                    placeholder="Ex: Sala 201, Próximo ao banco..."
                                    {...register("complemento")}
                                    error={errors.complemento?.message}
                                />
                            </div>
                        </section>

                        {/* Seção 3: Responsável */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                            <div className="col-span-full flex items-center gap-2 text-blue-700 font-semibold text-sm uppercase tracking-wider">
                                <HiOutlineUserCircle /> Acesso do Responsável
                            </div>
                            <div className="md:col-span-2">
                                <Input label="Nome do responsável" placeholder="Nome completo do responsável" {...register("nome")} error={errors.nome?.message} />
                            </div>
                            <Input label="E-mail do responsável" type="email" placeholder="gestor@empresa.com" {...register("email")} error={errors.email?.message} />

                            <div className="relative">
                                <Input
                                    label="Senha provisória"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Mínimo 8 caracteres"
                                    error={errors.senha?.message}
                                    {...register("senha")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[38px] text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    {showPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
                                </button>
                            </div>
                        </section>
                    </div>
                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-all"
                        >
                            Cancelar
                        </button>
                        <ButtonType
                            type="submit"
                            variant="primary"
                            disabled={isLoading}
                            className="px-8 shadow-lg shadow-blue-600/20"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Salvando...
                                </span>
                            ) : "Concluir Cadastro"}
                        </ButtonType>
                    </div>
                </form>
            </div>
        </div>
    );
}