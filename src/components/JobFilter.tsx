'use client';

import { useState } from "react";

export function JobFilters() {
    // Exemplo visual (a lógica real viria depois)
    return (
        <aside className="w-full space-y-8">

            {/* Filtro: Localização */}
            <div>
                <h3 className="font-bold text-gray-800 mb-4">Localização</h3>
                <div className="space-y-2">
                    {['Panambi - RS', 'Condor - RS', 'Ijuí - RS', 'Remoto'].map((item) => (
                        <label key={item} className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                            <span className="text-gray-600 group-hover:text-primary transition-colors text-sm">{item}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Filtro: Modelo de Trabalho */}
            <div>
                <h3 className="font-bold text-gray-800 mb-4">Modelo</h3>
                <div className="space-y-2">
                    {['Presencial', 'Híbrido', 'Remoto'].map((item) => (
                        <label key={item} className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                            <span className="text-gray-600 group-hover:text-primary transition-colors text-sm">{item}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Filtro: Tipo de Contrato */}
            <div>
                <h3 className="font-bold text-gray-800 mb-4">Contrato</h3>
                <div className="space-y-2">
                    {['CLT (Efetivo)', 'PJ', 'Estágio', 'Temporário'].map((item) => (
                        <label key={item} className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                            <span className="text-gray-600 group-hover:text-primary transition-colors text-sm">{item}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Filtro: PCD */}
            <div className="pt-4 border-t border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Vagas para PCD</span>
                </label>
            </div>

        </aside>
    );
}