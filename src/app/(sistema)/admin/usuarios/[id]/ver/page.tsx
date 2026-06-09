"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import { HiOutlineArrowLeft } from "react-icons/hi";
import PerfilCandidato from "@/src/components/admin/usuarios/PerfilCandidato";
import PerfilEmpresa from "@/src/components/admin/usuarios/PerfilEmpresa";


export default function VerUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const idUsuario = resolvedParams.id;
  const router = useRouter();

  const [dadosGerais, setDadosGerais] = useState<{
    conta: any;
    detalhes: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRaioX = async () => {
      try {
        const response = await api.get(`/admin/usuarios/${idUsuario}`);
        setDadosGerais(response.data.data);
      } catch (error) {
        toast.error("Erro ao buscar detalhes do usuário.");
        router.push("/admin/usuarios");
      } finally {
        setIsLoading(false);
      }
    };

    if (idUsuario) fetchRaioX();
  }, [idUsuario, router]);

  if (isLoading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-400 font-bold">
          Carregando raio-x do usuário...
        </p>
      </div>
    );
  }

  if (!dadosGerais) return null;

  const { conta, detalhes } = dadosGerais;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* HEADER DA PÁGINA */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
          title="Voltar para a lista"
        >
          <HiOutlineArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Raio-X: {conta.nome}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                conta.status === "ATIVO"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {conta.status}
            </span>
            <span className="text-sm font-medium text-gray-500">
              ID #{conta.id_usuario}
            </span>
          </div>
        </div>
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL DOS MÓDULOS */}
      {conta.tipo_usuario === "CANDIDATO" ? (
        <PerfilCandidato conta={conta} detalhes={detalhes} />
      ) : (
        <PerfilEmpresa conta={conta} detalhes={detalhes} />
      )}
    </div>
  );
}
