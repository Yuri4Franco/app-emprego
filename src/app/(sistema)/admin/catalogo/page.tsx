"use client";

import { TabAreasAtuacao } from "@/src/components/admin/catalogo/TabAreas";
import { TabBeneficios } from "@/src/components/admin/catalogo/TabBeneficios";
import TabCompetencias from "@/src/components/admin/catalogo/TabCompetencias";
import { useState } from "react";
import {
  HiOutlineLightningBolt,
  HiOutlineBriefcase,
  HiOutlineHeart,
} from "react-icons/hi";

export default function CatalogoAdminPage() {
  const [activeTab, setActiveTab] = useState("competencias");

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Gestão de Catálogos
        </h1>
        <p className="text-gray-500 mt-1 font-medium">
          Aprove, edite e organize os dados padronizados da plataforma.
        </p>
      </header>

      {/* TABS PRINCIPAIS */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-gray-100 rounded-[20px] shadow-sm overflow-x-auto w-full md:w-fit">
        <button
          onClick={() => setActiveTab("competencias")}
          className={`flex items-center gap-2 px-6 py-3 rounded-[16px] text-sm font-bold transition-all ${
            activeTab === "competencias"
              ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 border border-transparent"
          }`}
        >
          <HiOutlineLightningBolt size={18} /> Habilidades
        </button>
        <button
          onClick={() => setActiveTab("areas")}
          className={`flex items-center gap-2 px-6 py-3 rounded-[16px] text-sm font-bold transition-all ${
            activeTab === "areas"
              ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 border border-transparent"
          }`}
        >
          <HiOutlineBriefcase size={18} /> Áreas de Atuação
        </button>
        <button
          onClick={() => setActiveTab("beneficios")}
          className={`flex items-center gap-2 px-6 py-3 rounded-[16px] text-sm font-bold transition-all ${
            activeTab === "beneficios"
              ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 border border-transparent"
          }`}
        >
          <HiOutlineHeart size={18} /> Benefícios
        </button>
      </div>

      {/* CONTEÚDO DA ABA */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
        {activeTab === "competencias" && <TabCompetencias />}
        {activeTab === "areas" && <TabAreasAtuacao />}
        {activeTab === "beneficios" && <TabBeneficios />}
      </div>
    </div>
  );
}
