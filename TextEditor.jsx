import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import { Download, ChevronLeft, Bold, Italic, List, ListOrdered, Heading1, Heading2 } from 'lucide-react';

function TextEditor({ document, onSave, onBack }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['paragraph', 'heading'] }),
      Highlight.configure({ multicolor: true }),
      Color,
    ],
    content: document.content || '<p>Commencez à écrire...</p>',
    onUpdate: ({ editor }) => {
      onSave(editor.getHTML());
    },
  });

  const handleExport = () => {
    const text = editor?.getText() || '';
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', `${document.name}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!editor) return <div>Chargement...</div>;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{document.name}</h1>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          <Download className="w-5 h-5" />
          Exporter
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 px-8 py-4 bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg transition ${editor.isActive('bold') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}
        >
          <Bold className="w-5 h-5" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg transition ${editor.isActive('italic') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}
        >
          <Italic className="w-5 h-5" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-lg transition ${editor.isActive('underline') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}
        >
          <u>U</u>
        </button>

        <div className="w-px bg-gray-300"></div>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg transition ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}
        >
          <Heading1 className="w-5 h-5" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg transition ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}
        >
          <Heading2 className="w-5 h-5" />
        </button>

        <div className="w-px bg-gray-300"></div>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg transition ${editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}
        >
          <List className="w-5 h-5" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg transition ${editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}
        >
          <ListOrdered className="w-5 h-5" />
        </button>

        <div className="w-px bg-gray-300"></div>

        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="px-4 py-2 bg-white hover:bg-gray-100 rounded-lg transition text-sm font-semibold"
        >
          ↶ Undo
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="px-4 py-2 bg-white hover:bg-gray-100 rounded-lg transition text-sm font-semibold"
        >
          ↷ Redo
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="max-w-4xl mx-auto prose prose-sm w-full">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

export default TextEditor;
