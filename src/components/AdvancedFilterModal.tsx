'use client';

import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { BiTrash } from "react-icons/bi";
import { ButtonType } from "./ButtonType";

interface AdvancedFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: any) => void; // Aqui você passaria os dados reais
}

export function AdvancedFilterModal({ isOpen, onClose, onApply }: AdvancedFilterModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    // Animação de entrada/saída
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            // Trava o scroll da página de trás
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // Espera animação
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">

            {/* Overlay Escuro (Clica fora para fechar) */}
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={onClose}
            />

            {/* A Gaveta (Drawer) */}
            <div
                className={`
            relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 ease-out
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
            >

                {/* --- CABEÇALHO --- */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Filtros Avançados</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                {/* --- CORPO COM SCROLL --- */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">


                    {/* 2. Área e Categoria */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Área de Atuação</h3>
                        <div className="space-y-3">
                            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary">
                                <option value="">Selecione uma Categoria...</option>
                                <option value="adm">Administrativo & Financeiro</option>
                                <option value="tech">Tecnologia da Informação</option>
                                <option value="ind">Industrial & Produção</option>
                                <option value="com">Comercial & Vendas</option>
                            </select>

                            {/* Subcategoria (apareceria dinamicamente) */}
                            <select disabled className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-400 outline-none cursor-not-allowed">
                                <option value="">Selecione primeiro a categoria</option>
                            </select>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* 3. Detalhes da Vaga (Grid) */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Detalhes</h3>
                        <div className="space-y-4">

                            {/* Senioridade (Minha sugestão) */}
                            <div>
                                <label className="text-xs text-gray-500 font-medium mb-1.5 block">Nível de Experiência</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Estágio', 'Júnior', 'Pleno', 'Sênior'].map(level => (
                                        <label key={level} className="cursor-pointer">
                                            <input type="checkbox" className="peer sr-only" />
                                            <span className="inline-block px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 peer-checked:bg-blue-50 peer-checked:text-primary peer-checked:border-primary transition-all select-none">
                                                {level}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Modalidade */}
                            <div>
                                <label className="text-xs text-gray-500 font-medium mb-1.5 block">Modalidade</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Presencial', 'Híbrido', 'Remoto'].map(mode => (
                                        <label key={mode} className="cursor-pointer">
                                            <input type="checkbox" className="peer sr-only" />
                                            <span className="inline-block px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 peer-checked:bg-blue-50 peer-checked:text-primary peer-checked:border-primary transition-all select-none">
                                                {mode}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* 4. Salário */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Pretensão Salarial</h3>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                                <input type="number" placeholder="Mínimo" className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" />
                            </div>
                            <span className="text-gray-400">-</span>
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                                <input type="number" placeholder="Máximo" className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" />
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* 5. Escolaridade */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Formação</h3>
                        <div className="space-y-3">
                            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary">
                                <option value="">Nível de Escolaridade</option>
                                <option value="medio">Ensino Médio</option>
                                <option value="tecnico">Ensino Técnico</option>
                                <option value="superior_cursando">Superior Cursando</option>
                                <option value="superior_completo">Superior Completo</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Área de Formação (ex: Administração)"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                            />
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* 6. Inclusão (PCD) */}
                    <section className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                            Inclusão Social
                        </h3>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="radio" name="pcd" className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300" />
                                <span className="text-sm text-gray-700">Mostrar todas as vagas</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="radio" name="pcd" className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300" />
                                <span className="text-sm text-gray-700">Apenas vagas afirmativas (PCD)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="radio" name="pcd" className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300" />
                                <span className="text-sm text-gray-700">Vagas Exclusivas para PCD</span>
                            </label>
                        </div>
                    </section>

                    {/* Espaço extra pro scroll não comer o botão */}
                    <div className="h-20"></div>

                </div>

                {/* --- RODAPÉ STICKY (Sempre visível) --- */}
                <div className="border-t border-gray-100 p-6 bg-white flex items-center gap-4">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors font-medium text-sm">
                        <BiTrash size={18} /> Limpar
                    </button>
                    <ButtonType onClick={() => onApply({})} className="flex-1 rounded-xl shadow-lg">
                        Aplicar Filtros (142)
                    </ButtonType>
                </div>

            </div>
        </div>
    );
}