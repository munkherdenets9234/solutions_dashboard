'use client'

import type { Editor } from '@tiptap/react'

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`h-7 min-w-7 px-1.5 rounded text-xs font-semibold ${
        active ? 'bg-ink text-ink-contrast' : 'text-body hover:bg-hairline-soft'
      } disabled:opacity-40`}
    >
      {children}
    </button>
  )
}

export function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-input-border px-2 py-1.5">
      <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        B
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <span className="line-through">S</span>
      </ToolbarButton>
      <span className="w-px h-4 bg-hairline mx-1" />
      <ToolbarButton
        label="Heading 2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>
      <span className="w-px h-4 bg-hairline mx-1" />
      <ToolbarButton
        label="Bullet list"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        •‑
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1.
      </ToolbarButton>
      <ToolbarButton
        label="Quote"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        &ldquo;
      </ToolbarButton>
      <span className="w-px h-4 bg-hairline mx-1" />
      <ToolbarButton
        label="Link"
        active={editor.isActive('link')}
        onClick={() => {
          const previousUrl = editor.getAttributes('link').href as string | undefined
          const url = window.prompt('URL', previousUrl ?? 'https://')
          if (url === null) return
          if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
          }
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }}
      >
        Link
      </ToolbarButton>
      <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        Undo
      </ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        Redo
      </ToolbarButton>
    </div>
  )
}
