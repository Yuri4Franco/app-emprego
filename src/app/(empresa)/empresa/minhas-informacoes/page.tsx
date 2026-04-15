"use client";

import { useEffect, useState, useCallback } from "react";
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
  HiOutlineInformationCircle,
  HiOutlineX,
  HiOutlineGift,
} from "react-icons/hi";
import { FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";

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

  // Estados para Controle de Arquivos e Previews (Trava de Segurança)
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [todosBeneficios, setTodosBeneficios] = useState<Beneficio[]>([]);
  const [selecionados, setSelecionados] = useState<Beneficio[]>([]);

  const {
    register,
    handleSubmit,
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

  // Lógica de Preview Local (Não sobe para o servidor ainda)
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

  // Update centralizado (Imagens + Texto)
  const onSubmit = async (data: PerfilFormData) => {
    setIsSaving(true);
    try {
      // 1. Upload de Banner se foi alterado
      if (bannerFile) {
        const formDataBanner = new FormData();
        formDataBanner.append("banner", bannerFile);
        await api.patch("/empresa/perfil/banner", formDataBanner);
      }

      // 2. Upload de Logo se foi alterado
      if (logoFile) {
        const formDataLogo = new FormData();
        formDataLogo.append("logo", logoFile);
        await api.patch("/empresa/perfil/logo", formDataLogo);
      }

      // 3. Update de dados textuais e benefícios
      const beneficios_ids = selecionados.map((b) => b.id_beneficio);
      const payload = {
        ...data,
        beneficios_ids,
      };

      await api.put("/empresa/perfil", payload);

      toast.success("Perfil atualizado com sucesso!");

      // Limpa os previews locais e sincroniza com o banco
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
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4duration-700">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <section className="relative mb-32">
          {/* Área do Banner */}
          <div className="relative h-72 w-full rounded-[48px] overflow-hidden bg-gray-200 shadow-2xl group">
            <Image
              src={bannerPreview || empresa?.banner_url || DefaultBanner}
              alt="Banner da Empresa"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFileChange(e, "banner")}
                accept="image/*"
              />
              <div className="flex flex-col items-center gap-2 text-white">
                <HiOutlineCamera size={40} />
                <span className="text-xs font-black uppercase tracking-widest">
                  Alterar Capa
                </span>
                <p className="text-white/70 text-[10px] font-medium mt-1">
                  Recomendado: 1200x400px
                </p>
              </div>
            </label>
          </div>

          {/* Área da Logo */}
          <div className="absolute -bottom-20 left-12 group">
            <div className="relative w-44 h-44 rounded-full overflow-hidden border-[5px] border-white bg-white shadow-2xl transition-transform group-hover:scale-105">
              <Image
                src={logoPreview || empresa?.logotipo_url || DefaultLogo}
                alt="Logo da Empresa"
                fill
                className="object-contain rounded-full"
              />
              <label className="absolute inset-0 bg-primary/80 flex flex-col items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "logo")}
                  accept="image/*"
                />
                <HiOutlineCamera size={28} className="text-white" />
                <div className="text-center px-2">
                  <p className="text-white text-[10px] font-black uppercase tracking-widest">
                    Alterar Logo
                  </p>
                  <p className="text-white/70 text-[9px] font-medium">
                    400x400px
                  </p>
                </div>
              </label>
            </div>
          </div>
        </section>

        <div className="flex flex-col space-y-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                  <HiOutlineInformationCircle size={18} /> Dados Institucionais
                </div>
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
                  label="Nome Fantasia (Como os candidatos verão)"
                  placeholder="Ex: ACI Soluções Tecnológicas"
                  {...register("nome_fantasia")}
                  error={errors.nome_fantasia?.message}
                />
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    Quem Somos
                  </label>
                  <textarea
                    {...register("quem_somos")}
                    className={`w-full p-6 bg-gray-50 border border-gray-100 rounded-[32px] h-52 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all text-gray-600 leading-relaxed resize-none ${errors.quem_somos ? "border-red-500" : ""}`}
                    placeholder="Descreva a cultura, missão e o ambiente de trabalho da sua empresa..."
                  />
                  {errors.quem_somos && (
                    <p className="text-xs text-red-500 ml-2">
                      {errors.quem_somos.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

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

            <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                <HiOutlineGift size={18} /> Benefícios Oferecidos
              </div>
              <select
                onChange={handleAddBeneficio}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] outline-none text-sm text-gray-700 font-medium"
              >
                <option value="">Adicionar um benefício...</option>
                {todosBeneficios.map((b) => (
                  <option key={b.id_beneficio} value={b.id_beneficio}>
                    {b.descricao}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                {selecionados.map((ben) => (
                  <div
                    key={ben.id_beneficio}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 animate-in zoom-in-95"
                  >
                    {ben.descricao}
                    <button
                      type="button"
                      onClick={() => handleRemoveBeneficio(ben.id_beneficio)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <HiOutlineX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <ButtonType
              type="submit"
              disabled={isSaving}
              className="w-full py-6 rounded-[32px] shadow-2xl shadow-blue-200/50 flex items-center justify-center gap-3 text-lg font-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
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
