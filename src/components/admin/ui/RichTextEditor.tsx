'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Code, Undo2, Redo2,
  AlignLeft, AlignCenter, AlignRight, Link as LinkIcon,
  Highlighter, Minus, Heading1, Heading2, Heading3, RemoveFormatting,
} from 'lucide-react';
import { useCallback, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Placeholder.configure({ placeholder: placeholder ?? 'Start typing…' }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'rte-link' } }),
      Highlight.configure({ multicolor: false }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'admin-rte-content',
      },
    },
  });

  // Sync external value changes (e.g. when switching between edit/create)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const Btn = ({ active, onClick, title, children }: {
    active?: boolean; onClick: () => void; title: string; children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        width: 30, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 6, border: 'none', cursor: 'pointer',
        background: active ? 'var(--a-green-light)' : 'transparent',
        color: active ? 'var(--a-green)' : 'var(--a-text-muted)',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--a-surface-2)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = active ? 'var(--a-green-light)' : 'transparent';
      }}
    >
      {children}
    </button>
  );

  const Sep = () => (
    <div style={{ width: 1, height: 18, background: 'var(--a-border)', margin: '0 3px', flexShrink: 0 }} />
  );

  return (
    <div className="admin-rte-wrap">
      {/* Toolbar */}
      <div className="admin-rte-toolbar">
        <Btn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
          <Heading2 size={14} />
        </Btn>
        <Btn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
          <Heading3 size={14} />
        </Btn>

        <Sep />

        <Btn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (⌘B)">
          <Bold size={14} />
        </Btn>
        <Btn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (⌘I)">
          <Italic size={14} />
        </Btn>
        <Btn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (⌘U)">
          <UnderlineIcon size={14} />
        </Btn>
        <Btn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          <Strikethrough size={14} />
        </Btn>
        <Btn active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Highlight">
          <Highlighter size={14} />
        </Btn>

        <Sep />

        <Btn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List">
          <List size={14} />
        </Btn>
        <Btn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List">
          <ListOrdered size={14} />
        </Btn>
        <Btn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
          <Quote size={14} />
        </Btn>
        <Btn active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code Block">
          <Code size={14} />
        </Btn>
        <Btn active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
          <Minus size={14} />
        </Btn>

        <Sep />

        <Btn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align Left">
          <AlignLeft size={14} />
        </Btn>
        <Btn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Align Center">
          <AlignCenter size={14} />
        </Btn>
        <Btn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align Right">
          <AlignRight size={14} />
        </Btn>

        <Sep />

        <Btn active={editor.isActive('link')} onClick={setLink} title="Insert Link">
          <LinkIcon size={14} />
        </Btn>

        <div style={{ flex: 1 }} />

        <Btn active={false} onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting">
          <RemoveFormatting size={13} />
        </Btn>
        <Btn active={false} onClick={() => editor.chain().focus().undo().run()} title="Undo (⌘Z)">
          <Undo2 size={13} />
        </Btn>
        <Btn active={false} onClick={() => editor.chain().focus().redo().run()} title="Redo (⌘⇧Z)">
          <Redo2 size={13} />
        </Btn>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
