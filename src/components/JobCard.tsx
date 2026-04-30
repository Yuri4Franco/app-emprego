import Link from "next/link";
import Image from "next/image";
import {
  HiOutlineDocumentDuplicate,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineBriefcase,
  HiStar,
  HiSparkles,
  HiUserGroup,
} from "react-icons/hi2";
import { HiOutlineLocationMarker, HiShieldCheck, HiOutlineOfficeBuilding } from "react-icons/hi";

export interface JobProps {
  id: string | number;
  company: string;
  logoUrl?: string | null; 
  isMember?: boolean;
  title: string;
  location: string;
  type: string;
  contract: string;
  salary?: string;
  shift?: string;
  uf?: string;
  pcdType?: "EXCLUSIVA_PCD" | "VAGA_INCLUSIVA" | null;
  isNew?: boolean;
  datePosted: string;
  nivel?: string;
}

interface JobCardComponentProps {
  job: JobProps;
  urlPrefix?: string;
}

// Utilitário para pegar versão leve do Cloudinary (96x96 px, corte automático, formato moderno)
const optimizeCloudinaryUrl = (url?: string | null) => {
  if (!url) return null;
  if (!url.includes("cloudinary.com")) return url;
  // Insere os parâmetros de otimização logo após o /upload/
  return url.replace("/upload/", "/upload/c_fill,w_96,h_96,q_auto,f_auto/");
};

export function JobCard({ job, urlPrefix = "" }: JobCardComponentProps) {
  let borderClass = "border-l-4 border-l-gray-300";

  if (job.isNew) {
    borderClass = "border-l-4 border-l-green-500";
  } else if (job.pcdType === "EXCLUSIVA_PCD") {
    borderClass = "border-l-4 border-l-purple-600";
  } else if (job.pcdType === "VAGA_INCLUSIVA") {
    borderClass = "border-l-4 border-l-indigo-400";
  }

  const logoOtimizada = optimizeCloudinaryUrl(job.logoUrl);

  return (
    <Link
      href={`${urlPrefix}/vagas/${job.id}`}
      className={`
        group block relative bg-white rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col justify-between h-full
        border border-y-gray-200 border-r-gray-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer
        ${borderClass} 
      `}
    >
      {/* --- BADGES FLUTUANTES NO CANTO SUPERIOR DIREITO --- */}
      <div className="absolute top-1 right-4 flex items-center gap-1.5 z-10">
        {job.isNew && (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow-sm border border-green-200">
            <HiSparkles className="text-xs" /> Nova
          </span>
        )}
        {job.pcdType === "EXCLUSIVA_PCD" && (
          <span className="inline-flex items-center gap-1 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow-sm">
            <HiShieldCheck className="text-xs" /> Exclusiva PCD
          </span>
        )}
        {job.pcdType === "VAGA_INCLUSIVA" && (
          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border border-indigo-100">
            <HiUserGroup className="text-xs" /> Aceita PCD
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* --- CABEÇALHO (Logo + Infos) --- */}
        {/* Adicionado pr-20 (padding-right) para o texto não ficar por baixo dos badges flutuantes */}
        <div className="flex items-start gap-4 pr-20">

          {/* Logo da Empresa */}
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm">
            {/* Nota: Mudei para rounded-xl (quadrado com borda arredondada) que costuma ficar mais elegante para logos, se preferir redondo volte para rounded-full */}
            {logoOtimizada ? (
              <Image
                src={logoOtimizada}
                alt={`Logo ${job.company}`}
                fill
                className="object-contain p-1.5"
                sizes="56px"
              />
            ) : (
              <HiOutlineOfficeBuilding className="text-gray-300 text-2xl" />
            )}
          </div>

          <div className="flex-1 min-w-0 pt-1">
            {/* Empresa e Estrela */}
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider truncate max-w-[150px] md:max-w-[200px]">
                {job.company}
              </span>
              {job.isMember && (
                <div className="group/tooltip relative cursor-help flex shrink-0">
                  <HiStar className="text-primary text-base" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg font-medium">
                    Empresa Associada
                  </span>
                </div>
              )}
            </div>


            {/* Título da Vaga */}
            <h3 className="text-lg md:text-xl font-black text-gray-800 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
              {job.title}
            </h3>

            {job.nivel && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black text-primary bg-blue-50 border border-blue-100 uppercase tracking-tight">
                {job.nivel}
              </span>
            )}
          </div>
        </div>

        {/* --- TAGS DE DETALHES DA VAGA --- */}
        <div className="flex flex-wrap gap-2 pt-2"> 
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 text-xs font-medium text-gray-600 border border-gray-100">
            <HiOutlineLocationMarker className="text-primary" /> {job.location}/{job.uf}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 text-xs font-medium text-gray-600 border border-gray-100">
            <HiOutlineBriefcase className="text-primary" /> {job.type}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 text-xs font-medium text-gray-600 border border-gray-100">
            <HiOutlineDocumentDuplicate className="text-primary" /> {job.contract}
          </span>
          {job.salary && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 text-xs font-medium text-green-700 border border-green-100">
              <HiOutlineCurrencyDollar /> {job.salary}
            </span>
          )}
          {job.shift && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-xs font-medium text-blue-700 border border-blue-100">
              <HiOutlineClock /> {job.shift}
            </span>
          )}
        </div>
      </div>

      {/* --- RODAPÉ --- */}
      <div className="pt-4 mt-5 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
          {job.isNew && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
          {job.isNew ? "Publicada recentemente" : `Há ${job.datePosted}`}
        </span>

        <span className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-bold rounded-xl border border-gray-200 text-gray-600 bg-white group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 shadow-sm group-hover:shadow-md">
          Ver detalhes
        </span>
      </div>
    </Link>
  );
}