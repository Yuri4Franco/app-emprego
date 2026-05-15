"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineMap, HiOutlineArrowLeft, HiOutlineHome } from "react-icons/hi";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
            <div className="max-w-md w-full text-center space-y-8 relative">

                {/* Efeito de luz de fundo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>

                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-white border border-gray-100 shadow-xl rounded-[28px] flex items-center justify-center text-primary transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                        <HiOutlineMap size={48} />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-6xl font-black text-gray-900 tracking-tighter">404</h1>
                    <h2 className="text-2xl font-black text-gray-800">
                        Página não encontrada
                    </h2>
                    <p className="text-gray-500 font-medium leading-relaxed">
                        Parece que você tentou acessar um link quebrado, ou a página que você procura foi movida ou não existe mais.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button
                        // Agora usamos o router do próprio Next.js
                        onClick={() => router.back()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-full text-xs font-black uppercase tracking-widest hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <HiOutlineArrowLeft size={18} /> Voltar
                    </button>

                    <Link
                        href="/"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all"
                    >
                        <HiOutlineHome size={18} /> Início
                    </Link>
                </div>
            </div>
        </div>
    );
}