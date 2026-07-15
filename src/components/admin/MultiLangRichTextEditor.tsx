'use client'

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { LOCALES, DEFAULT_LOCALE, type Locale, type LocaleMap } from '@/lib/types'
import { labelClass } from './form'
import { Toolbar } from './RichTextToolbar'

const localeLabel: Record<Locale, string> = { en: 'EN', mn: 'MN' }

// One Tiptap instance per locale, all mounted at once and toggled with the
// `hidden` class rather than conditionally rendered — switching locale tabs
// must not unmount/remount an editor, which would lose cursor/undo state.
function SingleLocaleEditor({
  defaultValue,
  visible,
  onChange,
}: {
  defaultValue?: string
  visible: boolean
  onChange: (html: string) => void
}) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false, autolink: true })],
    content: defaultValue ?? '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'tiptap min-h-[240px] px-3 py-2 text-sm outline-none',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  return (
    <div className={visible ? '' : 'hidden'}>
      {editor ? <Toolbar editor={editor} /> : null}
      <EditorContent editor={editor} />
    </div>
  )
}

export function MultiLangRichTextEditor({
  name,
  label,
  defaultValue,
}: {
  name: string
  label: string
  defaultValue?: LocaleMap
}) {
  const [active, setActive] = useState<Locale>(DEFAULT_LOCALE)
  const [values, setValues] = useState<LocaleMap>(defaultValue ?? {})

  function update(locale: Locale, html: string) {
    setValues((prev) => ({ ...prev, [locale]: html }))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className={labelClass}>{label}</label>
        <div className="flex gap-1">
          {LOCALES.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => setActive(locale)}
              className={`h-6 px-2 rounded text-[11px] font-semibold uppercase ${
                active === locale ? 'bg-ink text-ink-contrast' : 'text-body hover:bg-hairline-soft'
              }`}
            >
              {localeLabel[locale]}
              {!values[locale] ? <span className="ml-1 text-status-cancelled-text">•</span> : null}
            </button>
          ))}
        </div>
      </div>
      <input type="hidden" name={name} value={JSON.stringify(values)} readOnly />
      <div className="rounded-md border border-input-border bg-panel">
        {LOCALES.map((locale) => (
          <SingleLocaleEditor
            key={locale}
            defaultValue={defaultValue?.[locale]}
            visible={active === locale}
            onChange={(html) => update(locale, html)}
          />
        ))}
      </div>
    </div>
  )
}
