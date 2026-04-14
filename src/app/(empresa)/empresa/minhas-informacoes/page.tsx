"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import Image from "next/image";
import DefaultLogo from "@/src/assets/default/logo.webp";
import DefaultBanner from "@/src/assets/default/banner.webp";
import {
    HiOutlineCamera,
    HiOutlineOfficeBuilding,
    HiOutlineGlobeAlt,
    HiOutlineSave,
    HiOutlineLink,
    HiOutlineInformationCircle
} from "react-icons/hi";
import {
    FaInstagram,
    FaLinkedin,
    FaFacebook
} from "react-icons/fa";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";

// 1. Schema de Validação
const perfilSchema = z.object({
    nome_fantasia: z.string().min(3, "O nome fantasia deve ter ao menos 3 caracteres"),
    quem_somos: z.string().min(10, "Conte um pouco mais sobre a empresa para os candidatos"),
    site: z.string().url("Insira uma URL válida (ex: https://site.com)").optional().or(z.literal("")),
    instagram: z.string().optional().or(z.literal("")),
    linkedin: z.string().optional().or(z.literal("")),
    facebook: z.string().optional().or(z.literal("")),
});

type PerfilFormData = z.infer<typeof perfilSchema>;

export default function MinhasInformacoesPage() {
    const [empresa, setEmpresa] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<PerfilFormData>({
        resolver: zodResolver(perfilSchema)
    });

    // 2. Busca de Dados (Corrigida para data.data)
    const fetchPerfil = async () => {
        try {
            const response = await api.get("/empresa/perfil");
            const dadosReais = response.data.data; // Acessando o objeto interno do seu backend

            setEmpresa(dadosReais);

            // Preenche o formulário com o que já existe no banco
            reset({
                nome_fantasia: dadosReais.nome_fantasia || "",
                quem_somos: dadosReais.quem_somos || "",
                site: dadosReais.site || "",
                instagram: dadosReais.instagram || "",
                linkedin: dadosReais.linkedin || "",
                facebook: dadosReais.facebook || "",
            });
        } catch (error) {
            toast.error("Não foi possível carregar os dados da empresa.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchPerfil(); }, []);

    // 3. Lógica de Upload de Logo e Banner
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, tipo: "logo" | "banner") => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append(tipo, file);

        setIsUploading(true);
        const endpoint = tipo === "logo" ? "/empresa/perfil/logo" : "/empresa/perfil/banner";

        await toast.promise(
            api.patch(endpoint, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            }),
            {
                loading: `Fazendo upload do ${tipo}...`,
                success: (res) => {
                    // Atualiza a URL no estado local para refletir na tela na hora
                    const campoUrl = tipo === "logo" ? "logotipo_url" : "banner_url";
                    setEmpresa((prev: any) => ({
                        ...prev,
                        [campoUrl]: res.data[campoUrl]
                    }));
                    return `${tipo === "logo" ? "Logotipo" : "Banner"} atualizado com sucesso!`;
                },
                error: "Falha no upload. Verifique o formato do arquivo."
            }
        );
        setIsUploading(false);
    };

    // 4. Update dos dados de texto
    const onSubmit = async (data: PerfilFormData) => {
        await toast.promise(
            api.put("/empresa/perfil", data),
            {
                loading: "Sincronizando dados com a ACI...",
                success: "Perfil institucional atualizado!",
                error: "Erro ao salvar informações."
            }
        );
    };

    if (isLoading) return (
        <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 font-medium">Carregando portal da empresa...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Topo Visual: Banner e Logo */}
            <section className="relative mb-32">
                {/* Área do Banner */}
                <div className="relative h-72 w-full rounded-[48px] overflow-hidden bg-gray-200 shadow-2xl group">
                    <Image
                        src={empresa?.banner_url || DefaultBanner}
                        alt="Banner da Empresa"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                        <input type="file" className="hidden" onChange={(e) => handleUpload(e, "banner")} accept="image/*" />
                        <div className="flex flex-col items-center gap-2 text-white">
                            <HiOutlineCamera size={40} />
                            <span className="text-xs font-black uppercase tracking-widest">Alterar Capa</span>
                            <div className="text-center">
                                <p className="text-white/70 text-[10px] font-medium mt-1">Recomendado: 1200x400px</p>
                            </div>
                        </div>
                    </label>
                </div>

                {/* Área da Logo */}
                <div className="absolute -bottom-20 left-12 group">
                    <div className="relative w-44 h-44 rounded-full overflow-hidden border-[5px] border-white bg-white shadow-2xl transition-transform group-hover:scale-105">
                        <Image
                            src={empresa?.logotipo_url || DefaultLogo} // Certifique-se que DefaultLogo está importado corretamente
                            alt="Logo da Empresa"
                            fill
                            className="object-contain rounded-full" // object-contain p-6 garante que a logo não corte e tenha respiro
                        />

                        {/* Overlay de Upload - Também precisa ser redondo */}
                        <label className="absolute inset-0 bg-primary/80 flex flex-col items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                            <input type="file" className="hidden" onChange={(e) => handleUpload(e, "logo")} accept="image/*" />
                            <HiOutlineCamera size={28} className="text-white" />
                            <div className="text-center">
                                <p className="text-white text-sm font-black uppercase tracking-widest">Alterar Logo</p>
                                <p className="text-white/70 text-[10px] font-medium mt-1">Recomendado: 400x400px</p>
                            </div>
                        </label>
                    </div>
                </div>
            </section>

            {/* Layout do Formulário */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex-row space-y-10">

                {/* Coluna Principal: Informações Acadêmicas/Empresariais */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-10">

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                                <HiOutlineInformationCircle size={18} /> Dados Institucionais
                            </div>
                        </div>

                        {/* Cards de Dados Fixos (Não editáveis) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 bg-gray-50 rounded-[28px] border border-gray-100/50">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Razão Social</p>
                                <p className="text-sm font-bold text-gray-700">{empresa?.razao_social}</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-[28px] border border-gray-100/50">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">CNPJ</p>
                                <p className="text-sm font-mono text-gray-700">{empresa?.cnpj}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Input
                                label="Nome Fantasia (Como os candidatos verão)"
                                placeholder="Ex: ACI Soluções Tecnológicas"
                                {...register("nome_fantasia")}
                                error={errors.nome_fantasia?.message}
                            />

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 ml-1">Quem Somos</label>
                                <textarea
                                    {...register("quem_somos")}
                                    className={`
                                        w-full p-6 bg-gray-50 border border-gray-100 rounded-[32px] h-52 
                                        focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 
                                        outline-none transition-all text-gray-600 leading-relaxed resize-none
                                        ${errors.quem_somos ? "border-red-500" : ""}
                                    `}
                                    placeholder="Descreva a cultura, missão e o ambiente de trabalho da sua empresa..."
                                />
                                {errors.quem_somos && <p className="text-xs text-red-500 ml-2">{errors.quem_somos.message}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coluna Lateral: Links e Ação */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
                        <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                            <HiOutlineLink size={18} /> Links e Redes Sociais
                        </div>

                        <div className="space-y-5">
                            <Input
                                label="Site Institucional"
                                icon={<HiOutlineGlobeAlt size={20} />}
                                {...register("site")}
                                placeholder="https://www.empresa.com.br"
                            />
                            <Input
                                label="Instagram"
                                icon={<FaInstagram size={20} />}
                                {...register("instagram")}
                                placeholder="@suaempresa"
                            />
                            <Input
                                label="LinkedIn"
                                icon={<FaLinkedin size={20} />}
                                {...register("linkedin")}
                                placeholder="linkedin.com/company/..."
                            />
                            <Input
                                label="Facebook"
                                icon={<FaFacebook size={20} />}
                                {...register("facebook")}
                                placeholder="facebook.com/..."
                            />
                        </div>
                    </div>

                    <ButtonType
                        type="submit"
                        className="w-full py-6 rounded-[32px] shadow-2xl shadow-blue-200/50 flex items-center justify-center gap-3 text-lg font-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <HiOutlineSave size={24} /> Salvar Alterações
                    </ButtonType>

                    <p className="text-center text-[11px] text-gray-400 px-4 leading-relaxed">
                        Essas informações serão exibidas publicamente em todas as suas vagas postadas no portal da ACI Panambi.
                    </p>
                </div>
            </form>
        </div>
    );
}