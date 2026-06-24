import Link from "next/link";
import {
    HiOutlineDocumentDuplicate,
    HiOutlineBriefcase,
    HiOutlineClock,
    HiOutlineLocationMarker,
    HiOutlineChevronRight,
} from "react-icons/hi";
import { HiSparkles, HiShieldCheck, HiUserGroup } from "react-icons/hi2";
import { JobProps } from "./JobCard";

interface CompanyJobListItemProps {
    job: JobProps;
    urlPrefix?: string;
}

export function CompanyJobListItem({ job, urlPrefix = "" }: CompanyJobListItemProps) {
    // Cores da borda lateral para destaques
    let borderClass = "border-l-4 border-l-transparent";
    if (job.isNew) borderClass = "border-l-4 border-l-emerald-500";
    else if (job.pcdType === "EXCLUSIVA_PCD") borderClass = "border-l-4 border-l-purple-500";
    else if (job.pcdType === "VAGA_INCLUSIVA") borderClass = "border-l-4 border-l-indigo-400";

    return (
        <Link
            href={`${urlPrefix}/vagas/${job.id}`}
            className={`group flex flex-col md:flex-row md:items-center justify-between bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 gap-6 relative overflow-hidden ${borderClass}`}
        >
            {/* LADO ESQUERDO: Informações da Vaga */}
            <div className="flex-1 space-y-4">
                {/* Badges Topo */}
                <div className="flex flex-wrap items-center gap-2">
                    {job.nivel && (
                        <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-md uppercase tracking-widest">
                            {job.nivel}
                        </span>
                    )}
                    {job.isNew && (
                        <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider border border-emerald-100">
                            <HiSparkles size={12} className="text-emerald-500" /> Nova
                        </span>
                    )}
                    {job.pcdType === "EXCLUSIVA_PCD" && (
                        <span className="flex items-center gap-1 bg-purple-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                            <HiShieldCheck size={12} /> Exclusiva PCD
                        </span>
                    )}
                    {job.pcdType === "VAGA_INCLUSIVA" && (
                        <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider border border-indigo-100">
                            <HiUserGroup size={12} /> TAMBÉM PARA PCD
                        </span>
                    )}
                </div>

                {/* Título */}
                <h3 className="text-xl md:text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                    {job.title}
                </h3>

                {/* Metadados */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500">
                    <span className="flex items-center gap-1.5">
                        <HiOutlineLocationMarker className="text-blue-500 shrink-0" size={16} />
                        {job.location} - {job.uf}
                    </span>
                    <span className="hidden md:inline text-gray-300">•</span>
                    <span className="flex items-center gap-1.5">
                        <HiOutlineBriefcase className="text-blue-500 shrink-0" size={16} />
                        {job.type}
                    </span>
                    <span className="hidden md:inline text-gray-300">•</span>
                    <span className="flex items-center gap-1.5">
                        <HiOutlineDocumentDuplicate className="text-blue-500 shrink-0" size={16} />
                        {job.contract}
                    </span>
                </div>
            </div>

            {/* LADO DIREITO: Ação e Tempo */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <HiOutlineClock size={14} /> Há {job.datePosted}
                </span>
                <div className="flex items-center gap-2 text-blue-600 font-black uppercase text-[11px] tracking-widest bg-blue-50 px-6 py-3.5 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    Ver Detalhes <HiOutlineChevronRight size={16} />
                </div>
            </div>
        </Link>
    );
}