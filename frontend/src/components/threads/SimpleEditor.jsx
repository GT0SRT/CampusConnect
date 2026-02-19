import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import { useUserStore } from "../../store/useUserStore";
import { uploadImageToCloudinary } from "../../services/cloudinaryService";
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Heading2, Heading3, Link as LinkIcon, Unlink, Image as ImageIcon
} from "lucide-react";

export default function SimpleEditor({ onChange, initialContent = "", placeholder = "Describe your discussion..." }) {
  const theme = useUserStore((state) => state.theme);

  const editorAttrClass = `${theme === 'dark'
    ? 'prose prose-sm max-w-none min-h-[150px] focus:outline-none p-4 text-gray-200 [&_ol]:list-decimal [&_ul]:list-disc [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child]:before:text-gray-400 [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:pointer-events-none'
    : 'prose prose-sm max-w-none min-h-[150px] focus:outline-none p-4 text-gray-700 [&_ol]:list-decimal [&_ul]:list-disc [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child]:before:text-gray-400 [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:pointer-events-none'
    }`;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-h-[400px] object-contain',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: editorAttrClass,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: { class: editorAttrClass },
        },
      });
    }
  }, [theme, editor]);

  const addImage = async (e) => {
    if (!editor) return;
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await uploadImageToCloudinary(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      alert("Failed to upload image");
    }
  };

  if (!editor) return null;

  return (
    <div className={`w-full rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition shadow-sm ${theme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>

      {/* TOOLBAR */}
      <div className={`flex flex-wrap items-center gap-1 p-1 border-b ${theme === 'dark' ? 'border-gray-600 bg-gray-700/60' : 'border-gray-200 bg-gray-100/50'}`}>
        <div className="flex gap-0.5">
          <ToolbarButton theme={theme} onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} icon={<Bold size={15} />} />
          <ToolbarButton theme={theme} onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} icon={<Italic size={15} />} />
          <ToolbarButton theme={theme} onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} icon={<UnderlineIcon size={15} />} />
        </div>

        <div className={`w-px h-4 mx-2 ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-300'}`}></div>

        <div className="flex gap-0.5">
          <ToolbarButton theme={theme} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} icon={<Heading2 size={16} />} />
          <ToolbarButton theme={theme} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} icon={<Heading3 size={16} />} />
        </div>

        <div className={`w-px h-4 mx-2 ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-300'}`}></div>

        <div className="flex gap-0.5">
          <ToolbarButton theme={theme} onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} icon={<List size={16} />} />
          <ToolbarButton theme={theme} onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} icon={<ListOrdered size={16} />} />
        </div>

        <div className={`w-px h-4 mx-2 ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-300'}`}></div>

        <div className="flex gap-0.5">
          <ToolbarButton theme={theme}
            onClick={() => {
              const url = prompt("Enter URL");
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}
            active={editor.isActive("link")}
            icon={<LinkIcon size={15} />}
          />
          <ToolbarButton theme={theme} onClick={() => editor.chain().focus().unsetLink().run()} icon={<Unlink size={15} />} />
        </div>

        <div className={`w-px h-4 mx-2 ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-300'}`}></div>

        <label className={`cursor-pointer p-1.5 rounded transition flex items-center justify-center ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`}>
          <input type="file" hidden accept="image/*" onChange={addImage} />
          <ImageIcon size={16} />
        </label>
      </div>

      {/* EDITOR AREA */}
      <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} cursor-text`} onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>

    </div>
  );
}

function ToolbarButton({ onClick, icon, active, theme }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded transition flex items-center justify-center ${active
        ? `${theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`
        : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-600 hover:text-gray-200' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`
        }`}
    >
      {icon}
    </button>
  );
}