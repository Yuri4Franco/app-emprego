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
} from "react-icons/hi";

// 1. AS TIPAGENS QUE DEIXAM O TYPESCRIPT FELIZ
interface Candidato {
  id_candidatura: number;
  nome: string;
  id_usuario: number;
  fora_do_perfil: boolean;
  data_inscricao: string;
  possui_agendamento: boolean;
  data_entrevista: string | null;
}

interface Coluna {
  id_etapa: number;
  nome_etapa: string;
  candidatos: Candidato[];
}

interface KanbanBoardProps {
  colunasIniciais: Coluna[];
  onAtualizar: () => void;
  onAbrirCandidato: (id: number) => void;
}

export function KanbanBoard({
  colunasIniciais,
  onAtualizar,
  onAbrirCandidato,
}: KanbanBoardProps) {
  // Passamos o tipo <Coluna[]> para o estado
  const [colunas, setColunas] = useState<Coluna[]>(colunasIniciais);

  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => setIsBrowser(true), []);

  useEffect(() => {
    setColunas(colunasIniciais);
  }, [colunasIniciais]);

  if (!isBrowser) return null;

  // Adicionamos a tipagem "DropResult" do próprio pangea/dnd
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColIndex = colunas.findIndex(
      (c) => c.id_etapa.toString() === source.droppableId,
    );
    const destColIndex = colunas.findIndex(
      (c) => c.id_etapa.toString() === destination.droppableId,
    );

    // Criamos uma cópia nova da matriz para não mutar o estado diretamente
    const newColunas = [...colunas];
    const sourceCol = newColunas[sourceColIndex];
    const destCol = newColunas[destColIndex];

    const sourceCandidatos = [...sourceCol.candidatos];
    const [candidatoMovido] = sourceCandidatos.splice(source.index, 1);

    const destCandidatos = [...destCol.candidatos];
    destCandidatos.splice(destination.index, 0, candidatoMovido);

    newColunas[sourceColIndex] = { ...sourceCol, candidatos: sourceCandidatos };
    newColunas[destColIndex] = { ...destCol, candidatos: destCandidatos };
    setColunas(newColunas);

    try {
      await api.patch(
        `/empresa/candidaturas/${candidatoMovido.id_candidatura}/mover`,
        {
          id_etapa_destino: destCol.id_etapa,
        },
      );
      // A UI já foi atualizada instantaneamente. Opcionalmente podemos chamar onAtualizar()
    } catch (error) {
      console.error(error);
      toast.error("Erro ao mover candidato. Desfazendo ação...");
      setColunas(colunasIniciais);
    }
  };

  return (
    <div className="w-full h-full flex overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 h-full items-start px-2">
          {colunas.map((coluna) => (
            <div
              key={coluna.id_etapa}
              className="bg-gray-100/80 rounded-3xl w-80 flex flex-col max-h-full border border-gray-200/60 shadow-sm shrink-0"
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
                    {coluna.candidatos.map((candidato, index) => (
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
                            className={`bg-white p-4 rounded-2xl border transition-all
                              ${snapshot.isDragging ? "shadow-2xl border-primary scale-105 rotate-2" : "shadow-sm border-gray-200 hover:border-gray-300 hover:shadow-md"}
                            `}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-blue-100 text-primary rounded-full flex items-center justify-center font-bold shrink-0">
                                <HiOutlineUser size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-800 truncate text-sm">
                                  {candidato.nome}
                                </p>
                                <p className="text-[10px] text-gray-400 font-medium">
                                  ID: #{candidato.id_candidatura}
                                </p>
                              </div>
                            </div>

                            {/* Tags do Candidato */}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {candidato.fora_do_perfil && (
                                <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-red-50 text-red-600 px-2 py-1 rounded-lg">
                                  <HiOutlineExclamationCircle size={14} /> Fora
                                  do Perfil
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
                    ))}
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
