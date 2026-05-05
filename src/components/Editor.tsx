"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaListUl,
  FaListOl,
  FaParagraph,
} from "react-icons/fa";

interface EditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    // Corrige o delay de atualização quando o perfil carrega
    immediatelyRender: false,

    // A MÁGICA ACONTECE AQUI:
    // Injetamos as classes diretamente no elemento editável nativo do TipTap
    editorProps: {
      attributes: {
        class:
          "p-6 min-h-[200px] outline-none prose prose-sm max-w-none text-gray-600",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="w-full border border-gray-100 rounded-[32px] overflow-hidden bg-gray-50 focus-within:ring-2 focus-within:ring-primary/10 transition-all flex flex-col">
      {/* Toolbar Simples */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-100 bg-white/50 shrink-0">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          icon={<FaBold size={12} />}
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          icon={<FaItalic size={12} />}
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          icon={<FaStrikethrough size={12} />}
        />
        <div className="w-[1px] h-4 bg-gray-200 mx-1 self-center" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          icon={<FaListUl size={12} />}
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          icon={<FaListOl size={12} />}
        />
      </div>

      {/* Área de Texto c/ Fallback de Clique */}
      <div
        className="cursor-text flex-1"
        // Garante que clicar em QUALQUER pixel dessa div foque o editor
        onClick={() => editor.chain().focus().run()}
      >
        {/* Removemos as classes daqui, pois agora elas moram no editorProps */}
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .tiptap {
          outline: none !important;
        }
        .tiptap ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        .tiptap ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }
      `}</style>
    </div>
  );
}

function MenuButton({ onClick, active, icon }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${active ? "bg-primary text-white shadow-md" : "text-gray-400 hover:bg-gray-200"}`}
    >
      {icon}
    </button>
  );
}
