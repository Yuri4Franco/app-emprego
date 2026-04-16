"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
    HiOutlineUser, HiOutlineBriefcase, HiOutlineAcademicCap,
    HiOutlineLightningBolt, HiOutlineSave, HiOutlineTrash, HiOutlinePlus
} from "react-icons/hi";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";

export const maskCPF = (value: string | undefined | null) => {
    if (!value) return "";
    return value
        .replace(/\D/g, "") // Tira letras
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1"); // Limita a 14 caracteres com a máscara
};

// Remove tudo que não é número e aplica a máscara 00000-000
export const maskCEP = (value: string | undefined | null) => {
    if (!value) return "";
    return value
        .replace(/\D/g, "")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .replace(/(-\d{3})\d+?$/, "$1"); // Limita a 9 caracteres com a máscara
};

// Remove tudo que não é número e aplica a máscara (00) 00000-0000
export const maskTelefone = (value: string | undefined | null) => {
    if (!value) return "";
    return value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4,5})(\d{4})/, "$1-$2")
        .replace(/(-\d{4})\d+?$/, "$1"); // Limita a 15 caracteres
};

// 1. Schema dos Dados Gerais (Espelho do Backend)
const dadosGeraisSchema = z.object({
    cpf: z.string().optional().nullable(),
    data_nascimento: z.string().optional().nullable(),
    genero: z.string().optional().nullable(),
    telefone: z.string().optional().nullable(),
    whatsapp: z.string().optional().nullable(),

    link_linkedin: z.string().url("URL inválida").optional().or(z.literal("")).nullable(),
    link_portfolio: z.string().url("URL inválida").optional().or(z.literal("")).nullable(),

    objetivo_profissional: z.string().max(200).optional().nullable(),
    resumo_profissional: z.string().min(20, "Fale um pouco mais sobre você").optional().nullable(),
    pretensao_salarial: z.coerce.number().optional().nullable(),
    sem_pretensao: z.boolean().default(false),

    pcd: z.boolean().default(false),
    tipo_pcd: z.string().optional().nullable(),
    disponibilidade_viagem: z.boolean().default(false),
    disponibilidade_mudanca: z.boolean().default(false),

    // Endereço
    cep: z.string().min(8, "CEP obrigatório").optional().nullable(),
    logradouro: z.string().min(3, "Rua obrigatória").optional().nullable(),
    numero: z.string().min(1, "Nº obrigatório").optional().nullable(),
    complemento: z.string().optional().nullable(),
    bairro: z.string().min(2, "Bairro obrigatório"),
    cidade: z.string().min(2, "Cidade obrigatória").default("Panambi"),
    uf: z.string().length(2, "UF obrigatória").default("RS"),
});

type DadosGeraisData = z.infer<typeof dadosGeraisSchema>;

export default function MeuCurriculoPage() {
    const [activeTab, setActiveTab] = useState("dados");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Estados Locais para listas (Evita refetch da página inteira)
    const [competencias, setCompetencias] = useState<any[]>([]);
    const [listaTaxonomiaCompetencias, setListaTaxonomiaCompetencias] = useState<any[]>([]);

    const { register, handleSubmit, reset, watch, getValues, formState: { errors } } = useForm<DadosGeraisData>({
        resolver: zodResolver(dadosGeraisSchema) as any,
        defaultValues: {
            cpf: "", data_nascimento: "", genero: "", telefone: "", whatsapp: "",
            link_linkedin: "", link_portfolio: "", objetivo_profissional: "", resumo_profissional: "",
            pretensao_salarial: 0, sem_pretensao: false, pcd: false, tipo_pcd: "",
            disponibilidade_viagem: false, disponibilidade_mudanca: false,
            cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "Panambi", uf: "RS",
        }
    });

    // Função Mágica para Cores Dinâmicas (Verde = Preenchido | Vermelho = Erro)
    const getFieldStatus = (fieldName: keyof DadosGeraisData) => {
        if (errors[fieldName]) return "border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20";

        const value = watch(fieldName);
        // Se tem valor (e não é falso/vazio), fica verdinho
        if (value && value !== "" && value !== 0) return "border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-emerald-500/20";

        return "border-gray-200 bg-gray-50 focus:border-blue-500"; // Padrão
    };

    useEffect(() => {
        const carregarCurriculo = async () => {
            try {
                const [resCurriculo, resTaxonomia] = await Promise.all([
                    api.get("/candidato/meu-curriculo"),
                    api.get("/taxonomia/competencias")
                ]);

                const dados = resCurriculo.data.data;

                // Injeta os dados do banco exatamente nos campos do formulário
                if (dados) {
                    reset({
                        cpf: maskCPF(dados.cpf) || "",
                        data_nascimento: dados.data_nascimento ? dados.data_nascimento.split('T')[0] : "", // Formata data para input type="date"
                        genero: dados.genero || "",
                        telefone: maskTelefone(dados.telefone) || "",
                        whatsapp: maskTelefone(dados.whatsapp) || "",
                        link_linkedin: dados.link_linkedin || "",
                        link_portfolio: dados.link_portfolio || "",
                        objetivo_profissional: dados.objetivo_profissional || "",
                        resumo_profissional: dados.resumo_profissional || "",
                        pretensao_salarial: dados.pretensao_salarial || "",
                        sem_pretensao: !dados.pretensao_salarial, // Se veio null do banco, marca o checkbox
                        pcd: dados.pcd || false,
                        tipo_pcd: dados.tipo_pcd || "",
                        disponibilidade_viagem: dados.disponibilidade_viagem || false,
                        disponibilidade_mudanca: dados.disponibilidade_mudanca || false,

                        // Endereço aninhado
                        cep: maskCEP(dados.endereco?.cep) || "",
                        logradouro: dados.endereco?.logradouro || "",
                        numero: dados.endereco?.numero || "",
                        complemento: dados.endereco?.complemento || "",
                        bairro: dados.endereco?.bairro || "",
                        cidade: dados.endereco?.cidade || "Panambi",
                        uf: dados.endereco?.uf || "RS",
                    });
                }

                setCompetencias(dados?.competencias || []);
                setListaTaxonomiaCompetencias(resTaxonomia.data);

            } catch (error) {
                toast.error("Erro ao carregar seu currículo.");
            } finally {
                setIsLoading(false);
            }
        };
        carregarCurriculo();
    }, [reset]);

    // 3. Atualizar Dados Gerais (PUT /candidato/meu-curriculo)
    const onSubmitDadosGerais = async (data: DadosGeraisData) => {
        setIsSaving(true);
        try {
            const payload = {
                cpf: data.cpf,
                data_nascimento: data.data_nascimento,
                genero: data.genero,
                telefone: data.telefone ? data.telefone.replace(/\D/g, "") : null,
                whatsapp: data.whatsapp ? data.whatsapp.replace(/\D/g, "") : null,
                link_linkedin: data.link_linkedin,
                link_portfolio: data.link_portfolio,
                objetivo_profissional: data.objetivo_profissional,
                resumo_profissional: data.resumo_profissional,
                pretensao_salarial: data.sem_pretensao ? null : data.pretensao_salarial,
                pcd: data.pcd,
                tipo_pcd: data.tipo_pcd,
                disponibilidade_viagem: data.disponibilidade_viagem,
                disponibilidade_mudanca: data.disponibilidade_mudanca,
                endereco: {
                    cep: data.cep ? data.cep.replace(/\D/g, "") : null,
                    logradouro: data.logradouro,
                    numero: data.numero,
                    complemento: data.complemento,
                    bairro: data.bairro,
                    cidade: data.cidade,
                    uf: data.uf,
                }
            };

            await api.put("/candidato/meu-curriculo", payload);
            toast.success("Dados atualizados com sucesso!");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Erro ao salvar.");
        } finally {
            setIsSaving(false);
        }
    };

    // 4. Lógica de Competências (Sincronização Pessimista/Otimista)
    const adicionarCompetencia = async (id_competencia: number) => {
        if (competencias.length >= 10) {
            toast.error("Você já atingiu o limite máximo de 10 competências.");
            return;
        }

        if (competencias.find(c => c.id_competencia === id_competencia)) {
            toast.error("Você já adicionou essa competência.");
            return;
        }

        try {
            const payload = { id_competencia, nivel: "INTERMEDIARIO" };
            // 1. Avisa o backend "por baixo dos panos"
            await api.post("/candidato/competencias", payload);

            // 2. Atualiza APENAS o estado local (Evita um GET enorme na página)
            const compTaxonomia = listaTaxonomiaCompetencias.find(c => c.id_competencia === id_competencia);
            setCompetencias(prev => [...prev, { ...payload, competencia: compTaxonomia }]);

            toast.success("Competência adicionada!");
        } catch (error) {
            toast.error("Erro ao adicionar competência.");
        }
    };

    const removerCompetencia = async (id_competencia: number) => {
        try {
            // 1. Remove do backend
            await api.delete(`/candidato/competencias/${id_competencia}`);

            // 2. Tira do estado local instantaneamente
            setCompetencias(prev => prev.filter(c => c.id_competencia !== id_competencia));
            toast.success("Competência removida.");
        } catch (error) {
            toast.error("Erro ao remover.");
        }
    };

    if (isLoading) return <div className="p-20 text-center animate-pulse font-bold text-gray-400">Carregando currículo...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-8 animate-in fade-in duration-700">

            <header className="mb-8">
                <h1 className="text-3xl font-black text-gray-800 tracking-tight">Meu Currículo</h1>
                <p className="text-gray-500 text-sm mt-1">Mantenha seus dados atualizados para aumentar suas chances de contratação.</p>
            </header>

            {/* Sistema de Abas */}
            <div className="flex flex-wrap gap-2 p-1 bg-white border border-gray-100 rounded-[24px] w-fit shadow-sm">
                {[
                    { id: "dados", label: "Dados Básicos", icon: <HiOutlineUser /> },
                    { id: "experiencia", label: "Experiência", icon: <HiOutlineBriefcase /> },
                    { id: "formacao", label: "Formação", icon: <HiOutlineAcademicCap /> },
                    { id: "competencias", label: "Habilidades", icon: <HiOutlineLightningBolt /> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-[20px] text-sm font-bold transition-all ${activeTab === tab.id
                            ? "bg-blue-50 text-blue-600 shadow-sm"
                            : "text-gray-500 hover:bg-gray-50"
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTEÚDO DAS ABAS */}

            {/* ABA 1: DADOS GERAIS */}
            {activeTab === "dados" && (
                <form onSubmit={handleSubmit(onSubmitDadosGerais)} className="space-y-8 animate-in slide-in-from-bottom-4">

                    {/* BLOCO 1: DADOS PESSOAIS */}
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
                        <h2 className="text-xl font-black text-gray-800">Dados Pessoais & Contato</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="CPF"
                                placeholder="000.000.000-00"
                                className={`transition-colors ${getFieldStatus("cpf")}`}
                                {...register("cpf", {
                                    onChange: (e) => {
                                        e.target.value = maskCPF(e.target.value);
                                    }
                                })}
                                error={errors.cpf?.message}
                            />
                            <Input label="Nascimento" type="date" className={`transition-colors ${getFieldStatus("data_nascimento")}`} {...register("data_nascimento")} error={errors.data_nascimento?.message} />

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 ml-1">Gênero</label>
                                <select {...register("genero")} className={`w-full p-4 rounded-[20px] outline-none text-sm transition-colors border ${getFieldStatus("genero")}`}>
                                    <option value="">Selecione...</option>
                                    <option value="MASCULINO">Masculino</option>
                                    <option value="FEMININO">Feminino</option>
                                    <option value="OUTRO">Outro / Prefiro não informar</option>
                                </select>
                                {errors.genero && <p className="text-xs text-red-500 ml-2 font-bold">{errors.genero.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Telefone Fixo"
                                placeholder="(55) 3333-3333"
                                className={`transition-colors ${getFieldStatus("telefone")}`}
                                {...register("telefone", {
                                    onChange: (e) => {
                                        e.target.value = maskTelefone(e.target.value);
                                    }
                                })}
                                error={errors.telefone?.message}
                            />
                            <Input label="LinkedIn (URL)" placeholder="https://linkedin.com/in/..." className={`transition-colors ${getFieldStatus("link_linkedin")}`} {...register("link_linkedin")} error={errors.link_linkedin?.message} />
                            <Input label="Portfólio/GitHub" placeholder="https://..." className={`transition-colors ${getFieldStatus("link_portfolio")}`} {...register("link_portfolio")} error={errors.link_portfolio?.message} />
                        </div>
                    </div>

                    {/* BLOCO 2: PERFIL PROFISSIONAL & PRETENSÃO */}
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
                        <h2 className="text-xl font-black text-gray-800">Perfil Profissional</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Objetivo Profissional (Cargo)" placeholder="Ex: Desenvolvedor Front-end" className={`transition-colors ${getFieldStatus("objetivo_profissional")}`} {...register("objetivo_profissional")} error={errors.objetivo_profissional?.message} />

                            {/* O Bloco Especial da Pretensão Salarial */}
                            <div className="space-y-2 p-4 bg-gray-50 rounded-[24px] border border-gray-100">
                                <Input
                                    label="Pretensão Salarial (R$)"
                                    type="number"
                                    disabled={watch("sem_pretensao")}
                                    className={`transition-colors ${watch("sem_pretensao") ? 'opacity-50 bg-gray-200 border-gray-200' : getFieldStatus("pretensao_salarial")}`}
                                    {...register("pretensao_salarial")}
                                    error={errors.pretensao_salarial?.message}
                                />
                                <label className="flex items-center gap-2 cursor-pointer ml-2 mt-2 group">
                                    <input type="checkbox" {...register("sem_pretensao")} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="text-xs font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Sem pretensão / Prefiro não responder</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 ml-1">Resumo Profissional</label>
                            <textarea
                                {...register("resumo_profissional")}
                                className={`w-full p-6 rounded-[32px] h-32 outline-none text-sm focus:ring-4 resize-none transition-colors border ${getFieldStatus("resumo_profissional")}`}
                                placeholder="Fale sobre suas experiências, objetivos e o que você busca na carreira..."
                            />
                            {errors.resumo_profissional && <p className="text-xs text-red-500 ml-2 font-bold">{errors.resumo_profissional.message}</p>}
                        </div>
                    </div>

                    {/* MANTÉM OS BLOCOS DE ENDEREÇO E PCD EXATAMENTE COMO ESTAVAM... */}
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
                        <h2 className="text-xl font-black text-gray-800">Endereço</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Input
                                label="CEP"
                                placeholder="00000-000"
                                className={`transition-colors ${getFieldStatus("cep")}`}
                                {...register("cep", {
                                    onChange: (e) => {
                                        e.target.value = maskCEP(e.target.value);
                                    }
                                })}
                                error={errors.cep?.message}
                            />
                            <div className="md:col-span-2">
                                <Input label="Logradouro (Rua)" className={`transition-colors ${getFieldStatus("logradouro")}`} {...register("logradouro")} error={errors.logradouro?.message} />
                            </div>
                            <Input label="Número" className={`transition-colors ${getFieldStatus("numero")}`} {...register("numero")} error={errors.numero?.message} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Input label="Complemento" className={`transition-colors ${getFieldStatus("complemento")}`} {...register("complemento")} error={errors.complemento?.message} />
                            <Input label="Bairro" className={`transition-colors ${getFieldStatus("bairro")}`} {...register("bairro")} error={errors.bairro?.message} />
                            <Input label="Cidade" className={`transition-colors ${getFieldStatus("cidade")}`} {...register("cidade")} error={errors.cidade?.message} />
                            <Input label="UF" className={`transition-colors ${getFieldStatus("uf")}`} {...register("uf")} error={errors.uf?.message} />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
                        <h2 className="text-xl font-black text-gray-800">Preferências & Diversidade</h2>

                        <div className="flex gap-8 border-b border-gray-100 pb-6">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-600 cursor-pointer group">
                                <input type="checkbox" {...register("disponibilidade_viagem")} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="group-hover:text-blue-600 transition-colors">Disponibilidade para Viagens</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-600 cursor-pointer group">
                                <input type="checkbox" {...register("disponibilidade_mudanca")} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="group-hover:text-blue-600 transition-colors">Disponibilidade para Mudança</span>
                            </label>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-600 cursor-pointer group mb-4">
                                <input type="checkbox" {...register("pcd")} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="group-hover:text-blue-600 transition-colors">Sou Pessoa com Deficiência (PcD)</span>
                            </label>
                            {watch("pcd") && (
                                <Input label="Qual o tipo da deficiência?" placeholder="Ex: Física, Visual, Auditiva..." {...register("tipo_pcd")} error={errors.tipo_pcd?.message} />
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-8">
                        <ButtonType type="submit" disabled={isSaving} className="px-10 py-5 rounded-[24px] flex items-center gap-2 shadow-lg shadow-blue-100 text-lg">
                            <HiOutlineSave size={24} />
                            {isSaving ? "Salvando Dados..." : "Salvar Currículo Completo"}
                        </ButtonType>
                    </div>
                </form>
            )
            }

            {/* ABA 4: COMPETÊNCIAS (LIMITE DE 10) */}
            {
                activeTab === "competencias" && (
                    <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-8 animate-in slide-in-from-bottom-4">
                        <div>
                            <h2 className="text-xl font-black text-gray-800">Suas Habilidades</h2>
                            <p className="text-sm text-gray-500">Adicione até 10 competências (Você usou {competencias.length}/10).</p>
                        </div>

                        {/* Input de Seleção (Chama a API por trás) */}
                        <select
                            onChange={(e) => {
                                const id = Number(e.target.value);
                                if (id) adicionarCompetencia(id);
                                e.target.value = ""; // Reseta o select
                            }}
                            disabled={competencias.length >= 10}
                            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] outline-none text-sm font-bold text-gray-600 disabled:opacity-50"
                        >
                            <option value="">{competencias.length >= 10 ? "Limite de 10 atingido" : "Selecione uma competência para adicionar..."}</option>
                            {listaTaxonomiaCompetencias.map((comp: any) => (
                                <option key={comp.id_competencia} value={comp.id_competencia}>{comp.nome}</option>
                            ))}
                        </select>

                        {/* Lista de Tags com botão de deletar (Estado Local) */}
                        <div className="flex flex-wrap gap-3">
                            {competencias.map((c: any) => (
                                <div key={c.id_competencia} className="flex items-center gap-3 px-5 py-3 bg-blue-50 text-blue-700 rounded-full text-xs font-black border border-blue-100 animate-in zoom-in-95">
                                    {c.competencia?.nome || "Carregando..."}
                                    <button
                                        type="button"
                                        onClick={() => removerCompetencia(c.id_competencia)}
                                        className="bg-blue-100 p-1 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        <HiOutlineTrash size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )
            }

            {/* PLACHOLDERS PARA EXPERIÊNCIA E FORMAÇÃO */}
            {
                (activeTab === "experiencia" || activeTab === "formacao") && (
                    <section className="bg-white p-20 rounded-[40px] shadow-sm border border-gray-100 text-center border-dashed">
                        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HiOutlinePlus size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700">Área de {activeTab === "experiencia" ? "Experiências" : "Formações"}</h3>
                        <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">
                            Aqui você irá listar seu histórico. Essa parte fará POST/PUT nas rotas específicas de {activeTab}.
                        </p>
                    </section>
                )
            }

        </div >
    );
}