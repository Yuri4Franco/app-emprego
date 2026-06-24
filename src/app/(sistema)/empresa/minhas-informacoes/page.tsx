"use client";

import { useEffect, useState, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import DefaultLogo from "@/src/assets/default/logo.webp";
import DefaultBanner from "@/src/assets/default/banner.webp";
import {
  HiOutlineCamera,
  HiOutlineOfficeBuilding,
  HiOutlineGlobeAlt,
  HiOutlineSave,
  HiOutlineLink,
  HiOutlineInformationCircle,
  HiOutlineX,
  HiOutlineGift,
  HiOutlineExternalLink, // <-- Ícone importado para o botão de visualização
} from "react-icons/hi";
import { FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";
import Editor from "@/src/components/Editor";

// 1. Schema de Validação
const perfilSchema = z.object({
  nome_fantasia: z
    .string()
    .min(3, "O nome fantasia deve ter ao menos 3 caracteres"),
  quem_somos: z
    .string()
    .min(10, "Conte um pouco mais sobre a empresa para os candidatos"),
  site: z
    .string()
    .url("Insira uma URL válida (ex: https://site.com)")
    .optional()
    .or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  linkedin: z.string().optional().or(z.literal("")),
  facebook: z.string().optional().or(z.literal("")),
});

type PerfilFormData = z.infer<typeof perfilSchema>;

interface Beneficio {
  id_beneficio: number;
  descricao: string;
}

export default function MinhasInformacoesPage() {
  const [empresa, setEmpresa] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para Controle de Arquivos e Previews
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [todosBeneficios, setTodosBeneficios] = useState<Beneficio[]>([]);
  const [selecionados, setSelecionados] = useState<Beneficio[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
  });

  const fetchPerfil = useCallback(async () => {
    try {
      const response = await api.get("/empresa/perfil");
      const dadosReais = response.data.data;

      const responseBeneficios = await api.get("/taxonomia/beneficios");
      setTodosBeneficios(responseBeneficios.data);

      if (dadosReais.beneficios_padrao) {
        setSelecionados(
          dadosReais.beneficios_padrao.map((bp: any) => bp.beneficio),
        );
      }

      setEmpresa(dadosReais);

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
  }, [reset]);

  useEffect(() => {
    fetchPerfil();
  }, [fetchPerfil]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: "logo" | "banner",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    if (tipo === "banner") {
      setBannerFile(file);
      setBannerPreview(previewUrl);
    } else {
      setLogoFile(file);
      setLogoPreview(previewUrl);
    }
  };

  const handleAddBeneficio = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    if (!id || selecionados.find((b) => b.id_beneficio === id)) return;

    const beneficio = todosBeneficios.find((b) => b.id_beneficio === id);
    if (beneficio) setSelecionados([...selecionados, beneficio]);
    e.target.value = "";
  };

  const handleRemoveBeneficio = (id: number) => {
    setSelecionados(selecionados.filter((b) => b.id_beneficio !== id));
  };

  const onSubmit = async (data: PerfilFormData) => {
    setIsSaving(true);
    try {
      if (bannerFile) {
        const formDataBanner = new FormData();
        formDataBanner.append("banner", bannerFile);
        await api.patch("/empresa/perfil/banner", formDataBanner);
      }

      if (logoFile) {
        const formDataLogo = new FormData();
        formDataLogo.append("logo", logoFile);
        await api.patch("/empresa/perfil/logo", formDataLogo);
      }

      const beneficios_ids = selecionados.map((b) => b.id_beneficio);
      const payload = {
        ...data,
        beneficios_ids,
      };

      await api.put("/empresa/perfil", payload);

      toast.success("Perfil atualizado com sucesso!");

      setBannerFile(null);
      setBannerPreview(null);
      setLogoFile(null);
      setLogoPreview(null);
      fetchPerfil();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao salvar informações.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 font-medium">Carregando portal...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ======================================================== */}
        {/* HEADER HERO (Idêntico à página pública)                  */}
        {/* ======================================================== */}

        {/* 1. BANNER */}
        <div className="w-full h-64 md:h-80 relative overflow-hidden group">
          <Image
            src={bannerPreview || empresa?.banner_url || DefaultBanner}
            alt="Banner da Empresa"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/40" />

          <label className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 text-white px-5 py-3 rounded-[20px] transition-all sm:opacity-0 group-hover:opacity-100 flex flex-col items-center gap-1 cursor-pointer shadow-lg">
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleFileChange(e, "banner")}
              accept="image/*"
            />
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
              <HiOutlineCamera size={18} /> Trocar Capa
            </div>
            <span className="text-[10px] font-medium text-white/80">
              Recomendado: 1200x400px
            </span>
          </label>
        </div>

        {/* 2. CONTAINER CENTRALIZADO COM LOGO E TEXTOS */}
        <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-12 relative z-10 mb-12">
          <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col items-center text-center gap-5">
            {/* LOGO SOBREPOSTA CENTRALIZADA */}
            <div className="w-36 h-36 md:w-44 md:h-44 bg-white rounded-full p-1.5 border-2 border-white shadow-xl -mt-28 md:-mt-32 relative shrink-0 group">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                <Image
                  src={logoPreview || empresa?.logotipo_url || DefaultLogo}
                  alt="Logo da Empresa"
                  fill
                  className="object-contain"
                />
              </div>
              <label className="absolute inset-0 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer backdrop-blur-sm">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "logo")}
                  accept="image/*"
                />
                <HiOutlineCamera size={26} className="mb-1" />
                <span className="text-[10px] font-black uppercase tracking-widest mt-1">
                  Trocar Logo
                </span>
                <span className="text-[9px] font-medium text-white/70 mt-0.5">
                  400x400px
                </span>
              </label>
            </div>

            {/* NOME E BOTÃO DA PÁGINA CENTRALIZADOS */}
            <div className="flex flex-col items-center gap-5 w-full pt-2">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-none">
                  {empresa?.nome_fantasia || "Minha Empresa"}
                </h1>
                <p className="text-sm font-bold text-gray-500 mt-2">
                  Configurações do Perfil Institucional
                </p>
              </div>

              {empresa?.slug && (
                <Link
                  href={`/${empresa.slug}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-colors shadow-sm"
                >
                  <HiOutlineExternalLink size={18} />
                  Ver Página Pública
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RESTANTE DO FORMULÁRIO                                   */}
        {/* ======================================================== */}

        <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-8">
          <div className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">
              <HiOutlineInformationCircle size={18} /> Dados Institucionais
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-gray-50 rounded-[28px] border border-gray-100/50">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Razão Social
                </p>
                <p className="text-sm font-bold text-gray-700">
                  {empresa?.razao_social}
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-[28px] border border-gray-100/50">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  CNPJ
                </p>
                <p className="text-sm font-mono text-gray-700">
                  {empresa?.cnpj}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <Input
                label="Nome Fantasia"
                placeholder="Ex: ACI Soluções Tecnológicas"
                {...register("nome_fantasia")}
                error={errors.nome_fantasia?.message}
              />
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Quem Somos
                </label>
                <Controller
                  name="quem_somos"
                  control={control}
                  render={({ field }) => (
                    <Editor content={field.value} onChange={field.onChange} />
                  )}
                />
                {errors.quem_somos && (
                  <p className="text-xs text-red-500 ml-2 font-bold">
                    {errors.quem_somos.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
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

          <div className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">
              <HiOutlineGift size={18} /> Benefícios Oferecidos
            </div>
            <select
              onChange={handleAddBeneficio}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] outline-none text-sm text-gray-700 font-medium focus:border-blue-500"
            >
              <option value="">Adicionar um benefício...</option>
              {todosBeneficios.map((b) => (
                <option key={b.id_beneficio} value={b.id_beneficio}>
                  {b.descricao}
                </option>
              ))}
            </select>

            {selecionados.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selecionados.map((ben) => (
                  <div
                    key={ben.id_beneficio}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 animate-in zoom-in-95"
                  >
                    {ben.descricao}
                    <button
                      type="button"
                      onClick={() => handleRemoveBeneficio(ben.id_beneficio)}
                      className="hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"
                    >
                      <HiOutlineX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-center pb-10">
            <ButtonType
              type="submit"
              disabled={isSaving}
              className="w-full md:w-auto min-w-[300px] py-5 rounded-[32px] shadow-2xl shadow-blue-200/50 flex items-center justify-center gap-3 text-base md:text-lg font-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
            >
              {isSaving ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <HiOutlineSave size={24} /> Salvar Alterações
                </>
              )}
            </ButtonType>
          </div>
        </div>
      </form>
    </div>
  );
}
