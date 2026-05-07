"use client";

import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
  HiOutlineCalendar,
  HiOutlineExclamationCircle,
  HiOutlineUser,
  HiStar,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";

interface Candidato {
  id_candidatura: number;
  nome: string;
  id_usuario: number;
  fora_do_perfil: boolean;
  data_inscricao: string;
  possui_agendamento: boolean;
  data_entrevista: string | null;
  avaliacao_nota?: number | null;
  whatsapp?: string | null;
  visualizada: boolean;
}

interface Coluna {
  id_etapa: number;
  nome_etapa: string;
  candidatos: Candidato[];
}

interface KanbanBoardProps {
  colunas: Coluna[]; // Recebe as colunas já mastigadas e filtradas do Pai
  onAtualizar: () => void;
  onAbrirCandidato: (id: number) => void;
}

export function KanbanBoard({
  colunas,
  onAtualizar,
  onAbrirCandidato,
}: KanbanBoardProps) {
  // Estado local para o Drag and Drop funcionar liso antes do servidor responder
  const [boardData, setBoardData] = useState<Coluna[]>(colunas);
  const [isBrowser, setIsBrowser] = useState(false);

  // Sempre que o pai mandar colunas novas (por causa de um filtro ou atualização), a gente sincroniza
  useEffect(() => {
    setBoardData(colunas);
  }, [colunas]);

  // Previne erro de hidratação do SSR no Next.js com o Drag and Drop
  useEffect(() => setIsBrowser(true), []);
  if (!isBrowser) return null;

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColIndex = boardData.findIndex(
      (c) => c.id_etapa.toString() === source.droppableId,
    );
    const destColIndex = boardData.findIndex(
      (c) => c.id_etapa.toString() === destination.droppableId,
    );

    const newBoard = [...boardData];
    const sourceCol = newBoard[sourceColIndex];
    const destCol = newBoard[destColIndex];

    const sourceCandidatos = [...sourceCol.candidatos];
    const [candidatoMovido] = sourceCandidatos.splice(source.index, 1);

    const destCandidatos = [...destCol.candidatos];
    destCandidatos.splice(destination.index, 0, candidatoMovido);

    newBoard[sourceColIndex] = { ...sourceCol, candidatos: sourceCandidatos };
    newBoard[destColIndex] = { ...destCol, candidatos: destCandidatos };

    // Atualização otimista na tela (move o card instantaneamente)
    setBoardData(newBoard);

    try {
      await api.patch(
        `/empresa/candidaturas/${candidatoMovido.id_candidatura}/mover`,
        {
          id_etapa_destino: destCol.id_etapa,
        },
      );
      // Avisa o pai que deu certo para ele recarregar os números oficiais
      onAtualizar();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao mover candidato. Desfazendo ação...");
      // Se der erro na API, desfaz a animação e volta pros dados originais
      setBoardData(colunas);
    }
  };

  return (
    <div className="flex-1 w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 h-full items-start px-2">
          {boardData.map((coluna) => (
            <div
              key={coluna.id_etapa}
              className="bg-gray-100/80 rounded-3xl w-80 flex flex-col max-h-full border border-gray-200/60 shadow-sm shrink-0 animate-in zoom-in-95 duration-200"
            >
              {/* Header da Coluna */}
              <div className="p-5 border-b border-gray-200/60 flex items-center justify-between bg-white/50 rounded-t-3xl">
                <h3 className="font-black text-gray-700 uppercase tracking-widest text-xs">
                  {coluna.nome_etapa}
                </h3>
                <span className="bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full text-xs font-bold">
                  {coluna.candidatos.length}
                </span>
              </div>

              {/* Área Soltável (Droppable) */}
              <Droppable droppableId={coluna.id_etapa.toString()}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-[150px] transition-colors rounded-b-3xl
                    ${snapshot.isDraggingOver ? "bg-blue-50/50" : ""}
                  `}
                  >
                    {coluna.candidatos.map((candidato, index) => {
                      // LÓGICA DE CORES E TAGS
                      let cardColorClass =
                        "bg-white border-gray-200 hover:border-gray-300 shadow-sm";
                      let iconBgClass = "bg-blue-100 text-primary";

                      if (candidato.avaliacao_nota) {
                        if (candidato.avaliacao_nota >= 4) {
                          cardColorClass =
                            "bg-amber-50/30 border-amber-300 hover:border-amber-400 shadow-amber-100";
                          iconBgClass = "bg-amber-100 text-amber-600";
                        } else if (candidato.avaliacao_nota <= 2) {
                          cardColorClass =
                            "bg-gray-50 border-gray-200 opacity-75 hover:opacity-100";
                          iconBgClass = "bg-gray-200 text-gray-500";
                        }
                      }

                      const diasInscrito = Math.floor(
                        (new Date().getTime() -
                          new Date(candidato.data_inscricao).getTime()) /
                          (1000 * 3600 * 24),
                      );
                      const isNovo = diasInscrito <= 2;
                      const isNaoLido = !candidato.visualizada;

                      return (
                        <Draggable
                          key={candidato.id_candidatura.toString()}
                          draggableId={candidato.id_candidatura.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() =>
                                onAbrirCandidato(candidato.id_candidatura)
                              }
                              className={`relative p-4 rounded-2xl border transition-all cursor-pointer group
                                ${snapshot.isDragging ? "shadow-2xl border-primary scale-105 rotate-2 bg-white opacity-100" : cardColorClass}
                              `}
                            >
                              {/* Indicador Visual de Não Lido (Bolinha Azul) */}
                              {isNaoLido && (
                                <div
                                  className="absolute top-4 right-4 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm"
                                  title="Currículo não visualizado"
                                ></div>
                              )}

                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${iconBgClass}`}
                                  >
                                    <HiOutlineUser size={20} />
                                  </div>
                                  <div className="flex-1 min-w-0 pr-4">
                                    <p
                                      className={`truncate text-sm ${isNaoLido ? "font-black text-gray-900" : "font-bold text-gray-800"}`}
                                    >
                                      {candidato.nome}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <p className="text-[10px] text-gray-400 font-medium">
                                        #{candidato.id_candidatura}
                                      </p>

                                      {candidato.avaliacao_nota && (
                                        <div className="flex items-center text-amber-400">
                                          <span className="text-[10px] font-black">
                                            {candidato.avaliacao_nota}
                                          </span>
                                          <HiStar size={12} />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {candidato.whatsapp && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const zapLimpo =
                                        candidato.whatsapp!.replace(/\D/g, "");
                                      window.open(
                                        `https://wa.me/55${zapLimpo}`,
                                        "_blank",
                                      );
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-emerald-500 hover:bg-emerald-50 rounded-full transition-all"
                                    title="Chamar no WhatsApp"
                                  >
                                    <FaWhatsapp size={18} />
                                  </button>
                                )}
                              </div>

                              {/* Tags do Candidato */}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {isNovo && (
                                  <span className="flex items-center text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-200">
                                    Novo
                                  </span>
                                )}

                                {candidato.fora_do_perfil && (
                                  <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-red-50 text-red-600 px-2 py-1 rounded-lg">
                                    <HiOutlineExclamationCircle size={14} />{" "}
                                    Fora do Perfil
                                  </span>
                                )}

                                {candidato.possui_agendamento && (
                                  <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-purple-50 text-purple-600 px-2 py-1 rounded-lg">
                                    <HiOutlineCalendar size={14} />
                                    {candidato.data_entrevista
                                      ? new Date(
                                          candidato.data_entrevista,
                                        ).toLocaleDateString("pt-BR")
                                      : "Agendado"}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
