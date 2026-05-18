"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
  HiOutlineUser,
  HiOutlineCamera,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineSave,
} from "react-icons/hi";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";

// Importando as máscaras e schemas que separamos
import {
  maskCPF,
  maskTelefone,
  maskCEP,
  descricoesCnh,
  descricoesTurno,
} from "@/src/utils/curriculoUtils";
import {
  dadosGeraisSchema,
  DadosGeraisData,
} from "@/src/schemas/curriculoSchemas";

interface TabDadosGeraisProps {
  dadosIniciais: any;
  onAtualizarProgresso: () => void; // Para avisar o pai que salvou
}

export default function TabDadosGerais({
  dadosIniciais,
  onAtualizarProgresso,
}: TabDadosGeraisProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [fotoUrl, setFotoUrl] = useState<string | null>(
    dadosIniciais?.foto_url || null,
  );
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const [nomeCandidato] = useState<string>(
    dadosIniciais?.usuario?.nome || dadosIniciais?.nome || "Meu Perfil",
  );

  // Áreas de Atuação
  const [listaTaxonomiaAreas, setListaTaxonomiaAreas] = useState<any[]>([]);
  const [areasSelecionadas, setAreasSelecionadas] = useState<any[]>([]);
  const [erroAreas, setErroAreas] = useState<string | null>(null);
  const [searchTermArea, setSearchTermArea] = useState("");
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);

  const [mostrarLinks, setMostrarLinks] = useState(
    !!(
      dadosIniciais?.link_linkedin ||
      dadosIniciais?.link_portfolio ||
      dadosIniciais?.link_outro
    ),
  );

  // Inicializa o formulário com os dados que vieram do Pai
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DadosGeraisData>({
    resolver: zodResolver(dadosGeraisSchema) as any, // ✨ Adicione o 'as any' aqui
    defaultValues: {
      cpf: maskCPF(dadosIniciais?.cpf) || "",
      data_nascimento: dadosIniciais?.data_nascimento
        ? dadosIniciais.data_nascimento.split("T")[0]
        : "",
      genero: dadosIniciais?.genero || "",
      telefone: maskTelefone(dadosIniciais?.telefone) || "",
      whatsapp: maskTelefone(dadosIniciais?.whatsapp) || "",
      link_linkedin: dadosIniciais?.link_linkedin || "",
      link_portfolio: dadosIniciais?.link_portfolio || "",
      link_outro: dadosIniciais?.link_outro || "",
      objetivo_profissional: dadosIniciais?.objetivo_profissional || "",
      resumo_profissional: dadosIniciais?.resumo_profissional || "",
      pretensao_salarial: dadosIniciais?.pretensao_salarial || "",
      tipo_contato: Array.isArray(dadosIniciais?.tipo_contato)
        ? dadosIniciais.tipo_contato
        : (dadosIniciais?.tipo_contato ? [dadosIniciais.tipo_contato] : ["WHATSAPP"]),
      sem_pretensao: !dadosIniciais?.pretensao_salarial,
      pcd: dadosIniciais?.pcd || false,
      tipo_pcd: dadosIniciais?.tipo_pcd || "",
      necessidade: dadosIniciais?.necessidade || "",
      disponibilidade_viagem: dadosIniciais?.disponibilidade_viagem || false,
      disponibilidade_mudanca: dadosIniciais?.disponibilidade_mudanca || false,
      disponibilidade_sabados: dadosIniciais?.disponibilidade_sabados || false,
      turno_preferido: dadosIniciais?.turno_preferido || [],
      cnh: dadosIniciais?.cnh || [],
      primeiro_emprego: dadosIniciais?.primeiro_emprego || false,
      cep: maskCEP(dadosIniciais?.endereco?.cep) || "",
      logradouro: dadosIniciais?.endereco?.logradouro || "",
      numero: dadosIniciais?.endereco?.numero || "",
      complemento: dadosIniciais?.endereco?.complemento || "",
      bairro: dadosIniciais?.endereco?.bairro || "",
      cidade: dadosIniciais?.endereco?.cidade || "Panambi",
      uf: dadosIniciais?.endereco?.uf || "RS",
    },
  });

  // Busca as áreas de atuação ao montar o componente
  useEffect(() => {
    const carregarAreas = async () => {
      try {
        const resAreas = await api.get("/taxonomia/areas");
        setListaTaxonomiaAreas(resAreas.data?.data || resAreas.data || []);
      } catch (error) {
        console.error("Erro ao carregar áreas", error);
      }
    };
    carregarAreas();

    // Seta as áreas iniciais do usuário
    if (dadosIniciais) {
      const areasSalvas = (
        dadosIniciais.areas_atuacao ||
        dadosIniciais.candidatoAreaAtuacao ||
        []
      ).map((item: any) => ({
        id_area: item.id_area || item.area?.id_area,
        nome: item.area?.nome || "Área",
      }));
      setAreasSelecionadas(areasSalvas);
    }
  }, [dadosIniciais]);

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setFotoUrl(previewUrl);
    setIsUploadingFoto(true);

    const formData = new FormData();
    formData.append("foto", file);

    try {
      const res = await api.patch("/candidato/foto-perfil", formData);
      toast.success("Foto de perfil atualizada!");
      if (res.data?.foto_url) setFotoUrl(res.data.foto_url);
    } catch (error) {
      toast.error("Erro ao enviar a foto.");
      setFotoUrl(dadosIniciais?.foto_url || null); // Reverte em caso de erro
    } finally {
      setIsUploadingFoto(false);
    }
  };

  const onSubmit = async (data: DadosGeraisData) => {
    if (areasSelecionadas.length === 0) {
      setErroAreas("Selecione pelo menos uma área de atuação.");
      toast.error("Preencha as Áreas de Atuação antes de salvar.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Salvando seus dados...");

    try {
      const payload = {
        ...data,
        cpf: data.cpf ? data.cpf.replace(/\D/g, "") : null,
        telefone: data.telefone ? data.telefone.replace(/\D/g, "") : null,
        whatsapp: data.whatsapp ? data.whatsapp.replace(/\D/g, "") : null,
        pretensao_salarial: data.sem_pretensao ? null : data.pretensao_salarial,
        necessidade: data.pcd ? data.necessidade : null,

        objetivo_profissional: data.objetivo_profissional?.trim() || null,
        resumo_profissional: data.resumo_profissional?.trim() || null,

        endereco: {
          cep: data.cep ? data.cep.replace(/\D/g, "") : null,
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.cidade,
          uf: data.uf,
        },
      };

      // 1. Salva os dados básicos
      await api.put("/candidato/meu-curriculo", payload);

      // 2. Salva as áreas de atuação
      const areas_ids = areasSelecionadas.map((a) => a.id_area || a.id);
      await api.put("/candidato/areas/sync", { areas_ids });

      // ✨ 3. O GATILHO MÁGICO DE VISIBILIDADE
      // Se o currículo estava invisível (novo cadastro ou o candidato tinha ocultado)
      // nós ativamos ele automaticamente agora que temos os dados mínimos!
      if (dadosIniciais?.perfil_visivel_empresas === false) {
        await api.patch("/candidato/visibilidade", {
          perfil_visivel_empresas: true,
        });
        toast.success(
          "Dados salvos e perfil ativado no Banco de Talentos! 🚀",
          { id: toastId },
        );
      } else {
        toast.success("Dados atualizados com sucesso!", { id: toastId });
      }

      // Avisa o componente Pai (page.tsx) para buscar os dados frescos.
      // Isso vai atualizar a barra de progresso e o botãozinho toggle do cabeçalho sozinhos!
      onAtualizarProgresso();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao salvar os dados.", {
        id: toastId,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Funções Auxiliares para Áreas
  const filteredAreas = listaTaxonomiaAreas.filter((tax) => {
    const idReal = tax.id_area || tax.id;
    const jaAdicionou = areasSelecionadas.some(
      (a) => (a.id_area || a.id) === idReal,
    );
    return (
      !jaAdicionou &&
      tax.nome.toLowerCase().includes(searchTermArea.toLowerCase())
    );
  });

  const adicionarArea = (area: any) => {
    if (areasSelecionadas.length >= 10)
      return toast.error("Máximo de 10 áreas.");
    setAreasSelecionadas([...areasSelecionadas, area]);
    setSearchTermArea("");
    setIsAreaDropdownOpen(false);
    setErroAreas(null);
  };

  const removerArea = (id: number) => {
    setAreasSelecionadas(
      areasSelecionadas.filter((a) => (a.id_area || a.id) !== id),
    );
  };

  const getFieldStatus = (fieldName: keyof DadosGeraisData) => {
    if (errors[fieldName])
      return "border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20";
    const value = watch(fieldName);
    if (value && value !== "" && value !== 0)
      return "border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-emerald-500/20";
    return "border-gray-200 bg-gray-50 focus:border-blue-500";
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 pt-4"
    >
      <div className="flex justify-between items-end mb-4 md:mb-6 ml-1 md:ml-2">
        <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed">
          Itens com a tag{" "}
          <span className="font-bold text-gray-400">(opcional)</span> não travam
          o cadastro, mas enriquecem seu perfil. Não esqueça de clicar em
          "Salvar" ao terminar!
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 1. DADOS PESSOAIS E FOTO */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-[24px] md:rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col items-center justify-center p-6 md:p-10 bg-gradient-to-b from-blue-50/80 to-white border-b border-gray-50">
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-blue-100 flex items-center justify-center border-[4px] md:border-[6px] border-white shadow-xl overflow-hidden group mb-4 md:mb-5">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt="Sua foto"
                className="w-full h-full object-cover"
              />
            ) : (
              <HiOutlineUser
                size={48}
                className="text-blue-300 md:w-14 md:h-14"
              />
            )}
            <label
              className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer ${fotoUrl ? "opacity-0 group-hover:opacity-100" : "opacity-100 hover:bg-black/70"}`}
            >
              <HiOutlineCamera size={24} className="mb-1" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center px-2">
                {fotoUrl ? "Trocar Foto" : "Adicionar Foto"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadFoto}
                disabled={isUploadingFoto}
              />
            </label>
            {isUploadingFoto && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight text-center">
            {nomeCandidato}
          </h2>
        </div>

        <div className="p-5 md:p-8 space-y-8 md:space-y-10">
          <div>
            <h3 className="text-[11px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-3 md:mb-4 ml-1">
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                className={getFieldStatus("cpf")}
                {...register("cpf", {
                  onChange: (e) => (e.target.value = maskCPF(e.target.value)),
                })}
                error={errors.cpf?.message}
              />
              <Input
                label="Nascimento"
                type="date"
                className={getFieldStatus("data_nascimento")}
                {...register("data_nascimento")}
                error={errors.data_nascimento?.message}
              />
              <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-bold text-gray-700 ml-1">
                  Gênero
                </label>
                <select
                  {...register("genero")}
                  className={`w-full p-3.5 md:p-4 rounded-[16px] md:rounded-[20px] outline-none text-sm transition-colors border ${getFieldStatus("genero")}`}
                >
                  <option value="">Selecione...</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                  <option value="OUTRO">Outro / Prefiro não informar</option>
                </select>
                {errors.genero && (
                  <p className="text-[11px] text-red-500 ml-2 font-bold">
                    {errors.genero.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-3 md:mb-4 ml-1">
              Contatos & Redes Sociais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="WhatsApp"
                placeholder="(55) 99999-9999"
                className={getFieldStatus("whatsapp")}
                {...register("whatsapp", {
                  onChange: (e) =>
                    (e.target.value = maskTelefone(e.target.value)),
                })}
                error={errors.whatsapp?.message}
              />
              <Input
                label="Telefone / Celular (opcional)"
                placeholder="(55) 9999-9999"
                className={getFieldStatus("telefone")}
                {...register("telefone", {
                  onChange: (e) =>
                    (e.target.value = maskTelefone(e.target.value)),
                })}
                error={errors.telefone?.message}
              />
            </div>
            {!mostrarLinks ? (
              <button
                type="button"
                onClick={() => setMostrarLinks(true)}
                className="w-full py-4 mt-2 border-2 border-dashed border-gray-200 rounded-[20px] text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-primary hover:border-blue-200 transition-all flex items-center justify-center gap-2 group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">
                  +
                </span>
                Adicionar LinkedIn, Portfólio ou Site (Opcional)
              </button>
            ) : (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 pt-2">
                <div className="flex items-center justify-between ml-1 pr-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    Seus Links Profissionais
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      // Opcional: Limpar os campos se ele ocultar
                      setValue("link_linkedin", "");
                      setValue("link_portfolio", "");
                      setValue("link_outro", "");
                      setMostrarLinks(false);
                    }}
                    className="text-[10px] text-red-400 font-bold uppercase hover:text-red-600 transition-colors"
                  >
                    Ocultar links
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="LinkedIn (URL)"
                    placeholder="https://linkedin.com/in/..."
                    className={getFieldStatus("link_linkedin")}
                    {...register("link_linkedin")}
                    error={errors.link_linkedin?.message}
                  />
                  <Input
                    label="Portfólio/GitHub"
                    placeholder="https://..."
                    className={getFieldStatus("link_portfolio")}
                    {...register("link_portfolio")}
                    error={errors.link_portfolio?.message}
                  />
                  <Input
                    label="Outro Link"
                    placeholder="https://..."
                    className={getFieldStatus("link_outro")}
                    {...register("link_outro")}
                    error={errors.link_outro?.message}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PERFIL PROFISSIONAL & PRETENSÃO */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 md:p-8 rounded-[24px] md:rounded-[40px] shadow-sm border border-gray-100 space-y-6 md:space-y-8">
        <h2 className="text-lg md:text-xl font-black text-gray-800">
          Perfil Profissional
        </h2>

        <div className="space-y-6">
          <div className="space-y-3">
            <div>
              <label className="text-xs md:text-sm font-bold text-gray-700 ml-1 flex items-center justify-between">
                Áreas de Atuação
                <span
                  className={`text-[10px] uppercase tracking-widest font-black ${areasSelecionadas.length === 10 ? "text-red-500" : "text-blue-500"}`}
                >
                  {areasSelecionadas.length}/10
                </span>
              </label>
              <p className="text-[11px] md:text-xs text-gray-500 mt-1 leading-relaxed">
                Selecione até 10 áreas que mais se encaixam com seu perfil e com seus interesses. Isso ajuda os recrutadores a encontrarem seu currículo em nosso Banco de Talentos!
              </p>
            </div>
            <div className="relative group z-20">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 z-10" />
              <input
                type="text"
                placeholder={
                  areasSelecionadas.length >= 10
                    ? "Limite de áreas atingido"
                    : "Buscar área (Ex: TI, RH...)"
                }
                disabled={areasSelecionadas.length >= 10}
                className={`w-full pl-12 pr-4 py-3.5 md:py-4 border rounded-[20px] md:rounded-[24px] outline-none text-sm transition-all disabled:opacity-50 ${erroAreas
                  ? "bg-red-50/30 border-red-500 focus:ring-4 focus:ring-red-500/20"
                  : "bg-gray-50 border-gray-100 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500"
                  }`}
                value={searchTermArea}
                onChange={(e) => {
                  setSearchTermArea(e.target.value);
                  setIsAreaDropdownOpen(true);
                }}
                onFocus={() => setIsAreaDropdownOpen(true)}
                onBlur={() =>
                  setTimeout(() => setIsAreaDropdownOpen(false), 200)
                }
              />
              {isAreaDropdownOpen && (
                <div className="absolute w-full mt-2 bg-white border border-gray-100 rounded-[24px] shadow-2xl z-50 max-h-60 overflow-y-auto p-2">
                  {filteredAreas.length > 0 ? (
                    filteredAreas.map((a: any) => {
                      const idReal = a.id_area_atuacao || a.id_area || a.id;
                      return (
                        <button
                          key={`area-drop-${idReal}`}
                          type="button"
                          onClick={() => adicionarArea(a)}
                          className="w-full text-left px-5 py-3 hover:bg-blue-50 rounded-[16px] text-sm font-bold text-gray-700 hover:text-blue-700 transition-colors"
                        >
                          {a.nome}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-5 py-4 text-sm text-gray-400 font-medium italic">
                      Nenhuma área disponível...
                    </div>
                  )}
                </div>
              )}
            </div>
            {erroAreas && (
              <p className="text-[11px] font-bold text-red-500 ml-2 mt-1">
                {erroAreas}
              </p>
            )}
            {areasSelecionadas.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {areasSelecionadas.map((a: any) => {
                  const idReal = a.id_area_atuacao || a.id_area || a.id;
                  return (
                    <div
                      key={`area-sel-${idReal}`}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-primary border border-blue-100 rounded-full text-xs font-bold animate-in zoom-in duration-200"
                    >
                      {a.nome}
                      <button
                        type="button"
                        onClick={() => removerArea(idReal)}
                        className="text-primary hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"
                      >
                        <HiOutlineX size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {(!watch("resumo_profissional") ||
            !watch("objetivo_profissional")) && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3 animate-in fade-in duration-500">
                <span className="text-xl shrink-0">💡</span>
                <div>
                  <h4 className="text-xs md:text-sm font-black text-blue-900">
                    Dica de Ouro para chegar aos 100%
                  </h4>
                  <p className="text-[11px] md:text-xs text-blue-800/80 mt-0.5 leading-relaxed font-medium">
                    Estes dois campos abaixo são opcionais, mas preenchê-los
                    garante a pontuação máxima do seu currículo. Recrutadores
                    adoram ler um bom resumo antes de olhar as experiências!
                  </p>
                </div>
              </div>
            )}

          <div className="space-y-2">
            <label className="text-xs md:text-sm font-bold text-gray-700 ml-1">
              Resumo Profissional (opcional)
            </label>
            <textarea
              {...register("resumo_profissional")}
              className={`w-full p-4 md:p-6 rounded-[24px] md:rounded-[32px] h-32 outline-none text-sm focus:ring-2 resize-none transition-colors border ${getFieldStatus("resumo_profissional")}`}
              placeholder="Exemplo: Sou um profissional com 3 anos de experiência em atendimento ao público, apaixonado por resolver problemas e trabalhar em equipe..."
            />
            {errors.resumo_profissional && (
              <p className="text-[11px] text-red-500 ml-2 font-bold">
                {errors.resumo_profissional.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs md:text-sm font-bold text-gray-700 ml-1">
              Objetivos Profissionais (opcional)
            </label>
            <textarea
              {...register("objetivo_profissional")}
              className={`w-full p-4 md:p-6 rounded-[24px] md:rounded-[32px] h-32 outline-none text-sm focus:ring-2 resize-none transition-colors border ${getFieldStatus("objetivo_profissional")}`}
              placeholder="Exemplo: Busco uma primeira oportunidade na área de vendas para desenvolver minhas habilidades de comunicação e contribuir com os resultados da empresa..."
            />
            {errors.objetivo_profissional && (
              <p className="text-[11px] text-red-500 ml-2 font-bold">
                {errors.objetivo_profissional.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 p-5 md:p-6 bg-gray-50 rounded-[24px] md:rounded-[32px] border border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-800">
              Pretensão Salarial
            </h3>
            <p className="text-[11px] md:text-xs text-gray-500 max-w-sm mt-1 leading-relaxed">
              Informe um valor médio ou marque a opção ao lado.
            </p>
          </div>
          <div className="flex-1 w-full max-w-sm space-y-3">
            <Input
              label="Valor (R$)"
              type="number"
              disabled={watch("sem_pretensao")}
              className={`transition-colors bg-white ${watch("sem_pretensao") ? "opacity-50 bg-gray-200 border-gray-200" : getFieldStatus("pretensao_salarial")}`}
              {...register("pretensao_salarial")}
            />
            <label className="flex items-center gap-2 cursor-pointer ml-1 md:ml-2 group">
              <input
                type="checkbox"
                {...register("sem_pretensao")}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-blue-500"
              />
              <span className="text-[11px] md:text-xs font-bold text-gray-500 group-hover:text-primary transition-colors">
                Sem pretensão / Prefiro não responder
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ENDEREÇO */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 md:p-8 rounded-[24px] md:rounded-[40px] shadow-sm border border-gray-100 space-y-5 md:space-y-6">
        <h2 className="text-lg md:text-xl font-black text-gray-800">
          Endereço
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="CEP"
            placeholder="00000-000"
            className={getFieldStatus("cep")}
            {...register("cep", {
              onChange: (e) => (e.target.value = maskCEP(e.target.value)),
            })}
          />
          <div className="md:col-span-2">
            <Input
              label="Logradouro (Rua/Avenida)"
              className={getFieldStatus("logradouro")}
              {...register("logradouro")}
            />
          </div>
          <Input
            label="Número"
            className={getFieldStatus("numero")}
            {...register("numero")}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Complemento"
            className={getFieldStatus("complemento")}
            {...register("complemento")}
          />
          <Input
            label="Bairro"
            className={getFieldStatus("bairro")}
            {...register("bairro")}
          />
          <Input
            label="Cidade"
            className={getFieldStatus("cidade")}
            {...register("cidade")}
          />
          <Input
            label="UF"
            className={getFieldStatus("uf")}
            {...register("uf")}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PREFERÊNCIAS & DIVERSIDADE */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 md:p-8 rounded-[24px] md:rounded-[40px] shadow-sm border border-gray-100 space-y-6 md:space-y-8">
        <h2 className="text-lg md:text-xl font-black text-gray-800 border-b border-gray-50 pb-3 md:pb-4">
          Preferências & Diversidade
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-6 md:space-y-8">
            <div className="bg-gray-50 p-4 md:p-6 rounded-[20px] md:rounded-[24px] border border-gray-100 space-y-4">
              <div>
                <h3 className="text-xs md:text-sm font-black text-gray-800">
                  Canal de Contato
                </h3>
                <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">
                  Como as empresas devem te procurar?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "QUALQUER_UM", label: "Qualquer um" },
                  { id: "WHATSAPP", label: "WhatsApp" },
                  { id: "EMAIL", label: "E-mail" },
                  { id: "LIGACAO", label: "Ligação" },
                ].map((metodo) => {
                  const contatosSelecionados = watch("tipo_contato") || [];
                  const isChecked = contatosSelecionados.includes(metodo.id as any);

                  const handleContatoChange = (
                    e: React.ChangeEvent<HTMLInputElement>
                  ) => {
                    if (e.target.checked) {
                      if (metodo.id === "QUALQUER_UM") {
                        setValue("tipo_contato", ["QUALQUER_UM"]);
                      } else {
                        setValue("tipo_contato", [
                          ...contatosSelecionados.filter((c: string) => c !== "QUALQUER_UM"),
                          metodo.id as any,
                        ]);
                      }
                    } else {
                      // Se desmarcou, remove da lista
                      const filtrado = contatosSelecionados.filter((c: string) => c !== metodo.id);
                      // Se a lista ficar vazia, volta pro padrão "Qualquer um"
                      setValue("tipo_contato", filtrado.length === 0 ? ["QUALQUER_UM"] : filtrado);
                    }
                  };

                  return (
                    <label key={metodo.id} className="cursor-pointer w-full">
                      <input
                        type="checkbox"
                        value={metodo.id}
                        checked={isChecked}
                        onChange={handleContatoChange}
                        className="sr-only peer"
                      />
                      <div className="w-full h-full flex items-center justify-center text-center px-2 py-3 rounded-xl border border-gray-200 bg-white text-[11px] md:text-xs font-bold text-gray-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 peer-checked:border-emerald-300 hover:border-blue-200 transition-all shadow-sm">
                        {metodo.label}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 p-4 md:p-6 rounded-[20px] md:rounded-[24px] border border-gray-100 space-y-4">
              <h3 className="text-xs md:text-sm font-black text-gray-800">
                Disponibilidade Logística
              </h3>
              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between cursor-pointer group bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm hover:border-blue-200 transition-all">
                  <div>
                    <span className="block text-xs md:text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">
                      Trabalharia aos sábados?
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    {...register("disponibilidade_sabados")}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer group bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-xs md:text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">
                    Aceita viagens a trabalho?
                  </span>
                  <input
                    type="checkbox"
                    {...register("disponibilidade_viagem")}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer group bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-xs md:text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">
                    Toparia mudar de cidade?
                  </span>
                  <input
                    type="checkbox"
                    {...register("disponibilidade_mudanca")}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>

            <div
              className={`p-4 md:p-6 rounded-[20px] md:rounded-[24px] border transition-all shadow-sm ${watch("pcd") ? "bg-blue-50/50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
            >
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    {...register("pcd")}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-blue-500"
                  />
                </div>
                <div>
                  <span className="block text-xs md:text-sm font-black text-gray-800 group-hover:text-primary transition-colors">
                    Me identifico como PcD ou Neurodivergente
                  </span>
                  <span className="block text-[10px] md:text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Preenchimento opcional. Ajuda as empresas a promoverem
                    ambientes mais inclusivos.
                  </span>
                </div>
              </label>

              {watch("pcd") && (
                <div className="mt-5 space-y-5 animate-in slide-in-from-top-4 pt-5 border-t border-blue-100">
                  <Input
                    label="Como você descreve sua condição?"
                    placeholder="Ex: Física, Auditiva, TEA..."
                    {...register("tipo_pcd")}
                  />
                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-bold text-gray-700 ml-1">
                      Como podemos tornar o processo seletivo mais acessível
                      para você?
                    </label>
                    <textarea
                      {...register("necessidade")}
                      className="w-full p-4 bg-white shadow-sm rounded-xl h-24 outline-none text-xs focus:ring-4 resize-none border border-gray-200"
                      placeholder="Ex: Rampa de acesso, intérprete..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="bg-gray-50 p-4 md:p-6 rounded-[20px] md:rounded-[24px] border border-gray-100 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs md:text-sm font-black text-gray-800">
                    Turno de Trabalho
                  </h3>
                </div>
                <span
                  className={`px-2 py-1 bg-white rounded-md border text-[10px] font-black shadow-sm ${(watch("turno_preferido") || []).length > 3 ? "text-red-500 border-red-200" : "text-primary border-blue-100"}`}
                >
                  {(watch("turno_preferido") || []).length}/3
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: "QUALQUER_TURNO",
                    label: "Sem Preferência",
                    colSpan: "col-span-2 sm:col-span-3",
                  },
                  { id: "HORARIO_COMERCIAL", label: "Comercial", colSpan: "" },
                  { id: "PRIMEIRO_TURNO", label: "1º Turno", colSpan: "" },
                  { id: "SEGUNDO_TURNO", label: "2º Turno", colSpan: "" },
                  { id: "TERCEIRO_TURNO", label: "3º Turno", colSpan: "" },
                ].map((turno) => {
                  const turnosSelecionados = watch("turno_preferido") || [];
                  const isChecked = turnosSelecionados.includes(
                    turno.id as any,
                  );
                  const isAtMaxLimit =
                    turnosSelecionados.length >= 3 &&
                    !isChecked &&
                    turno.id !== "QUALQUER_TURNO";

                  const handleTurnoChange = (
                    e: React.ChangeEvent<HTMLInputElement>,
                  ) => {
                    if (e.target.checked) {
                      if (turno.id === "QUALQUER_TURNO")
                        setValue("turno_preferido", ["QUALQUER_TURNO"]);
                      else
                        setValue("turno_preferido", [
                          ...turnosSelecionados.filter(
                            (t) => t !== "QUALQUER_TURNO",
                          ),
                          turno.id as any,
                        ]);
                    } else {
                      const filtrado = turnosSelecionados.filter(
                        (t) => t !== turno.id,
                      );
                      setValue(
                        "turno_preferido",
                        filtrado.length === 0 ? ["QUALQUER_TURNO"] : filtrado,
                      );
                    }
                  };

                  return (
                    <label
                      key={turno.id}
                      className={`cursor-pointer w-full ${turno.colSpan} ${isAtMaxLimit ? "opacity-40" : ""}`}
                    >
                      <input
                        type="checkbox"
                        value={turno.id}
                        disabled={isAtMaxLimit}
                        checked={isChecked}
                        onChange={handleTurnoChange}
                        className="sr-only peer"
                      />
                      <div className="w-full h-full flex items-center justify-center text-center px-2 py-3 rounded-xl border border-gray-200 bg-white text-[11px] md:text-xs font-bold text-gray-500 peer-checked:bg-blue-50 peer-checked:text-primary peer-checked:border-blue-300 transition-all shadow-sm">
                        {turno.label}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 p-4 md:p-6 rounded-[20px] md:rounded-[24px] border border-gray-100 space-y-4">
              <div>
                <h3 className="text-xs md:text-sm font-black text-gray-800">
                  Carteira de Habilitação (CNH)
                </h3>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                <label className="cursor-pointer w-full col-span-3 sm:col-span-5">
                  <input
                    type="checkbox"
                    value="NAO_POSSUO"
                    checked={(watch("cnh") || []).includes("NAO_POSSUO")}
                    onChange={(e) => {
                      if (e.target.checked) setValue("cnh", ["NAO_POSSUO"]);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-full text-center px-2 py-3 rounded-xl border border-gray-200 bg-white text-[11px] md:text-xs font-bold text-gray-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 peer-checked:border-emerald-300 transition-all shadow-sm">
                    Não Possuo
                  </div>
                </label>
                {["A", "B", "C", "D", "E"].map((categoria) => {
                  const cnhSelecionadas = watch("cnh") || [];
                  const isChecked = cnhSelecionadas.includes(categoria as any);

                  const handleCnhChange = (
                    e: React.ChangeEvent<HTMLInputElement>,
                  ) => {
                    if (e.target.checked)
                      setValue("cnh", [
                        ...cnhSelecionadas.filter((c) => c !== "NAO_POSSUO"),
                        categoria as any,
                      ]);
                    else {
                      const filtrado = cnhSelecionadas.filter(
                        (c) => c !== categoria,
                      );
                      setValue(
                        "cnh",
                        filtrado.length === 0 ? ["NAO_POSSUO"] : filtrado,
                      );
                    }
                  };

                  return (
                    <label key={categoria} className="cursor-pointer w-full">
                      <input
                        type="checkbox"
                        value={categoria}
                        checked={isChecked}
                        onChange={handleCnhChange}
                        className="sr-only peer"
                      />
                      <div className="w-full flex items-center justify-center px-1 py-3 rounded-xl border border-gray-200 bg-white text-xs md:text-sm font-black text-gray-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 peer-checked:border-emerald-300 transition-all shadow-sm">
                        {categoria}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center md:justify-end pt-4 md:pt-8 w-full">
        <ButtonType
          type="submit"
          disabled={isSaving}
          className="w-full md:w-auto px-6 md:px-10 py-4 md:py-5 rounded-full md:rounded-[24px] flex items-center justify-center gap-2 shadow-lg shadow-blue-100 text-base md:text-lg"
        >
          <HiOutlineSave size={24} />
          {isSaving ? "Salvando..." : "Salvar Dados Básicos"}
        </ButtonType>
      </div>
    </form>
  );
}
