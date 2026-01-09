'use client';

import { ButtonType } from "./ButtonType";
import { HiOutlineLocationMarker, HiOutlineClock, HiOutlineCurrencyDollar, HiOutlineBriefcase } from "react-icons/hi";

// Interface para definir o formato dos dados da vaga
interface JobProps {
    id: string | number;
    company: string;
    title: string;
    location: string;
    type: string; // Híbrido, Presencial, Remoto
    contract: string; // CLT, PJ, Estágio
    salary?: string; // Opcional
    isPcd?: boolean;
    datePosted: string;
}

export function JobCard({ job }: { job: JobProps }) {
    return (
        <div className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col justify-between h-full">

            {/* Cabeçalho do Card */}
            <div className="space-y-3">
                <div className="flex justify-between items-start">
                    <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                        {job.company}
                    </span>
                    {job.isPcd && (
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                            Vaga PCD
                        </span>
                    )}
                </div>

                <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-2">
                    {job.title}
                </h3>

                {/* Tags de Detalhes */}
                <div className="flex flex-wrap gap-2 pt-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 text-xs font-medium text-gray-600 border border-gray-100">
                        <HiOutlineLocationMarker className="text-primary" /> {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 text-xs font-medium text-gray-600 border border-gray-100">
                        <HiOutlineBriefcase className="text-primary" /> {job.type}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 text-xs font-medium text-gray-600 border border-gray-100">
                        <HiOutlineClock className="text-primary" /> {job.contract}
                    </span>
                    {job.salary && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 text-xs font-medium text-green-700 border border-green-100">
                            <HiOutlineCurrencyDollar /> {job.salary}
                        </span>
                    )}
                </div>
            </div>

            {/* Rodapé do Card */}
            <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                    Publicada há {job.datePosted}
                </span>
                <ButtonType href={`/vagas/${job.id}`} variant="outline" size="sm" className="hover:bg-primary hover:text-white hover:border-primary">
                    Tenho interesse
                </ButtonType>
            </div>
        </div>
    );
}