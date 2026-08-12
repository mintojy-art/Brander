'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { uploadBlogImage } from '@/lib/supabase'

function ToolbarButton({ onClick, active, disabled, label, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        active ? 'bg-[#1D1D1F] text-white' : 'text-[#424245] hover:bg-[#F5F5F7]'
      }`}
    >
      {children}
    </button>
  )
}

export default function BlogEditor({ value, onChange, toast }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'blog-content min-h-[280px] px-4 py-3 outline-none',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  if (!editor) return null

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Link URL', previousUrl || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const url = await uploadBlogImage(file)
      editor.chain().focus().setImage({ src: url }).run()
    } catch (err) {
      const msg = err.message === 'BUCKET_MISSING'
        ? 'Storage bucket "blog-images" not set up yet — see the setup guide above.'
        : 'Image upload failed: ' + err.message
      toast?.(msg, 'error')
    }
  }

  return (
    <div className="border border-[#D2D2D7] rounded-xl overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-[#D2D2D7] bg-[#FAFAFA]">
        <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></ToolbarButton>
        <span className="w-px h-4 bg-[#D2D2D7] mx-1" />
        <ToolbarButton label="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
        <ToolbarButton label="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
        <span className="w-px h-4 bg-[#D2D2D7] mx-1" />
        <ToolbarButton label="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</ToolbarButton>
        <ToolbarButton label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</ToolbarButton>
        <ToolbarButton label="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>&ldquo;&rdquo;</ToolbarButton>
        <span className="w-px h-4 bg-[#D2D2D7] mx-1" />
        <ToolbarButton label="Link" active={editor.isActive('link')} onClick={setLink}>🔗</ToolbarButton>
        <label className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#424245] hover:bg-[#F5F5F7] cursor-pointer transition-colors" title="Insert image">
          🖼️
          <input type="file" accept="image/*" className="hidden" onChange={addImage} />
        </label>
        <span className="w-px h-4 bg-[#D2D2D7] mx-1" />
        <ToolbarButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>↺</ToolbarButton>
        <ToolbarButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>↻</ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
