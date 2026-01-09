'use client';

import { useState, useRef, useEffect } from "react";
import { BiChevronDown } from "react-icons/bi";

interface FilterSelectProps {
    label: string;
    options: string[];
    onChange?: (value: string) => void;
}

export function FilterSelect({ label, options, onChange }: FilterSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fecha o dropdown se clicar fora dele
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option: string) => {
        setSelected(option);
        setIsOpen(false);
        if (onChange) onChange(option);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all text-sm font-medium ${selected
                        ? 'bg-blue-50 border-primary text-primary' // Estilo quando tem algo selecionado
                        : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400' // Estilo padrão
                    }`}
            >
                {selected || label}
                <BiChevronDown className={`text-lg transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Menu Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                    <ul className="py-2">
                        <li
                            className="px-4 py-2 hover:bg-gray-50 text-sm text-gray-500 cursor-pointer"
                            onClick={() => { setSelected(null); setIsOpen(false); }}
                        >
                            Limpar seleção
                        </li>
                        {options.map((option) => (
                            <li
                                key={option}
                                onClick={() => handleSelect(option)}
                                className="px-4 py-2 hover:bg-blue-50 hover:text-primary text-sm text-gray-700 cursor-pointer transition-colors"
                            >
                                {option}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}