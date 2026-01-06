import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { 
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Heading2, Heading3, Link as LinkIcon, Unlink, Image as ImageIcon
} from "lucide-react";

export default function SimpleEditor({ onChange, initialContent = "", placeholder = "Describe your discussion..." }) {
  
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
        class: "prose prose-sm max-w-none min-h-[150px] focus:outline-none p-4 text-gray-700 [&_ol]:list-decimal [&_ul]:list-disc [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child]:before:text-gray-400 [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:pointer-events-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
        { method: "POST", body: formData }
    );
    const data = await response.json();
    return data.secure_url;
  };

  const addImage = async (e) => {
    if (!editor) return;
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await uploadToCloudinary(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      alert("Failed to upload image");
    }
  };

  if (!editor) return null;

  return (
    <div className="w-full bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition shadow-sm">
      
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1 p-1 border-b border-gray-200 bg-gray-100/50">
        <div className="flex gap-0.5">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} icon={<Bold size={15} />} />
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} icon={<Italic size={15} />} />
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} icon={<UnderlineIcon size={15} />} />
        </div>
        
        <div className="w-px h-4 bg-gray-300 mx-2"></div>

        <div className="flex gap-0.5">
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} icon={<Heading2 size={16} />} />
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} icon={<Heading3 size={16} />} />
        </div>

        <div className="w-px h-4 bg-gray-300 mx-2"></div>

        <div className="flex gap-0.5">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} icon={<List size={16} />} />
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} icon={<ListOrdered size={16} />} />
        </div>

        <div className="w-px h-4 bg-gray-300 mx-2"></div>

        <div className="flex gap-0.5">
          <ToolbarButton 
            onClick={() => {
              const url = prompt("Enter URL");
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }} 
            active={editor.isActive("link")} 
            icon={<LinkIcon size={15} />} 
          />
          <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} icon={<Unlink size={15} />} />
        </div>

        <div className="w-px h-4 bg-gray-300 mx-2"></div>

        <label className="cursor-pointer p-1.5 rounded hover:bg-gray-200 text-gray-600 transition flex items-center justify-center">
          <input type="file" hidden accept="image/*" onChange={addImage} />
          <ImageIcon size={16} />
        </label>
      </div>

      {/* EDITOR AREA */}
      <div className="bg-gray-50 cursor-text" onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>

    </div>
  );
}

function ToolbarButton({ onClick, icon, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded transition flex items-center justify-center ${
        active
          ? "bg-blue-100 text-blue-600"
          : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
      }`}
    >
      {icon}
    </button>
  );
}