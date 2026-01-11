'use client';

import { ButtonType } from "./ButtonType";
import {
  HiOutlineClock, 
  HiOutlineCurrencyDollar, 
  HiOutlineBriefcase,
  HiStar,      // Estrela para Associados
  HiSparkles,  // Brilho para Nova
  HiUserGroup  // Ícone alternativo para PCD (Inclusão)
  
} from "react-icons/hi2";
import {HiOutlineLocationMarker, HiShieldCheck } from "react-icons/hi";

export interface JobProps {
  id: string | number;
  company: string;
  isMember?: boolean; 
  title: string;
  location: string;
  type: string;
  contract: string;
  salary?: string;
  
  // MUDANÇA AQUI: Em vez de true/false, agora temos tipos
  pcdType?: 'exclusive' | 'inclusive' | null; 
  
  isNew?: boolean;    
  datePosted: string;
}

export function JobCard({ job }: { job: JobProps }) {
  let borderClass = 'border-l-4 border-l-gray-300'; 
  
  if (job.isNew) {
    borderClass = 'border-l-4 border-l-green-500';
  } else if (job.pcdType === 'exclusive') {
    borderClass = 'border-l-4 border-l-purple-600'; // Roxo mais forte para exclusiva
  }

  return (
    <div 
      className={`
        group relative bg-white rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between h-full
        border border-y-gray-200 border-r-gray-200 hover:shadow-xl hover:-translate-y-1
        ${borderClass} 
      `}
    >
      
      {/* --- CABEÇALHO --- */}
      <div className="space-y-3">
        
        {/* Topo: Empresa e Badges */}
        <div className="flex justify-between items-start mb-2">
            
            {/* Empresa + Estrela */}
            <div className="flex items-center gap-1.5 pr-2">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider line-clamp-1">
                    {job.company}
                </span>
                {job.isMember && (
                    <div className="group/tooltip relative cursor-help">
                        <HiStar className="text-amber-400 text-lg drop-shadow-sm" />
                         <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                            Empresa Associada ACI
                        </span>
                    </div>
                )}
            </div>

            {/* STACK DE BADGES (Direita) */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
                
                {/* 1. Badge NOVA (Prioridade Máxima) */}
                {job.isNew && (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase shadow-sm border border-green-200">
                        <HiSparkles className="text-xs" /> Nova
                    </span>
                )}
                
                {/* 2. Badge EXCLUSIVA PCD (Roxo Forte) */}
                {job.pcdType === 'exclusive' && (
                    <span className="inline-flex items-center gap-1 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase shadow-sm">
                        <HiShieldCheck className="text-xs" /> Exclusiva PCD
                    </span>
                )}

                {/* 3. Badge TAMBÉM PCD (Roxo Suave/Azul) */}
                {/* Usamos um tom diferente para diferenciar da exclusiva */}
                {job.pcdType === 'inclusive' && (
                    <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-indigo-100">
                        <HiUserGroup className="text-xs" /> Também para PCD
                    </span>
                )}
            </div>
        </div>
        
        {/* Título */}
        <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
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

      {/* --- RODAPÉ --- */}
      <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium">
          {job.isNew ? 'Publicada recentemente' : `Há ${job.datePosted}`}
        </span>
        
        <ButtonType href={`/vagas/${job.id}`} variant="outline" size="sm" className="hover:bg-primary hover:text-white hover:border-primary">
          Tenho interesse
        </ButtonType>
      </div>
    </div>
  );
}