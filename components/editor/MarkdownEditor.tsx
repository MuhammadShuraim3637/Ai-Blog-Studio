// components/editor/MarkdownEditor.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { Button } from '@/components/ui/Button';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export default function MarkdownEditor({ 
  content, 
  onChange, 
  placeholder = 'Start writing your blog post...',
  readOnly = false 
}: MarkdownEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [showWordCount, setShowWordCount] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-700 underline',
        },
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: 'rounded-lg shadow-md max-w-full',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      Typography,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      // Update word and character count
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      setCharacterCount(text.length);
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML() && !readOnly) {
      editor.commands.setContent(content);
    }
  }, [content, editor, readOnly]);

  // Toolbar buttons
  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleStrike = useCallback(() => {
    editor?.chain().focus().toggleStrike().run();
  }, [editor]);

  const toggleHeading = useCallback((level: 1 | 2 | 3) => {
    editor?.chain().focus().toggleHeading({ level }).run();
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const toggleBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run();
  }, [editor]);

  const toggleCodeBlock = useCallback(() => {
    editor?.chain().focus().toggleCodeBlock().run();
  }, [editor]);

  const setTextAlign = useCallback((align: 'left' | 'center' | 'right') => {
    editor?.chain().focus().setTextAlign(align).run();
  }, [editor]);

  const addLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const toggleHighlight = useCallback(() => {
    editor?.chain().focus().toggleHighlight().run();
  }, [editor]);

  const clearFormatting = useCallback(() => {
    editor?.chain().focus().clearNodes().unsetAllMarks().run();
  }, [editor]);

  const insertHorizontalRule = useCallback(() => {
    editor?.chain().focus().setHorizontalRule().run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      {!readOnly && (
        <div className="border-b border-gray-200 bg-gray-50 p-2 sticky top-0 z-10">
          <div className="flex flex-wrap gap-1">
            {/* Text Formatting */}
            <Button
              variant="ghost"
              size="xs"
              onClick={toggleBold}
              className={editor.isActive('bold') ? 'bg-gray-200' : ''}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 18M6 6L18 6M6 12L18 12" />
              </svg>
            </Button>
            
            <Button
              variant="ghost"
              size="xs"
              onClick={toggleItalic}
              className={editor.isActive('italic') ? 'bg-gray-200' : ''}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l6-16" />
              </svg>
            </Button>
            
            <Button
              variant="ghost"
              size="xs"
              onClick={toggleStrike}
              className={editor.isActive('strike') ? 'bg-gray-200' : ''}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.5 0-3 .5-3 2 0 1.5 1.5 2 3 2s3 .5 3 2-1.5 2-3 2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
              </svg>
            </Button>
            
            <div className="w-px h-6 bg-gray-300 mx-1" />
            
            {/* Headings */}
            <Button
              variant="ghost"
              size="xs"
              onClick={() => toggleHeading(1)}
              className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}
            >
              H1
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => toggleHeading(2)}
              className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
            >
              H2
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => toggleHeading(3)}
              className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}
            >
              H3
            </Button>
            
            <div className="w-px h-6 bg-gray-300 mx-1" />
            
            {/* Lists */}
            <Button
              variant="ghost"
              size="xs"
              onClick={toggleBulletList}
              className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
            
            <Button
              variant="ghost"
              size="xs"
              onClick={toggleOrderedList}
              className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20h10M7 4h10M4 8h16M4 16h16" />
              </svg>
            </Button>
            
            <div className="w-px h-6 bg-gray-300 mx-1" />
            
            {/* Alignment */}
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setTextAlign('left')}
              className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
            
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setTextAlign('center')}
              className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
            
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setTextAlign('right')}
              className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
            
            <div className="w-px h-6 bg-gray-300 mx-1" />
            
            {/* Other */}
            <Button
              variant="ghost"
              size="xs"
              onClick={toggleBlockquote}
              className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </Button>
            
            <Button
              variant="ghost"
              size="xs"
              onClick={toggleCodeBlock}
              className={editor.isActive('codeBlock') ? 'bg-gray-200' : ''}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </Button>
            
            <Button
              variant="ghost"
              size="xs"
              onClick={addLink}
              className={editor.isActive('link') ? 'bg-gray-200' : ''}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m3.172-3.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102" />
              </svg>
            </Button>
            
            <Button
              variant="ghost"
              size="xs"
              onClick={addImage}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Button>
            
            <Button
              variant="ghost"
              size="xs"
              onClick={toggleHighlight}
              className={editor.isActive('highlight') ? 'bg-gray-200' : ''}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </Button>
            
            <Button
              variant="ghost"
              size="xs"
              onClick={insertHorizontalRule}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
              </svg>
            </Button>
            
            <Button
              variant="ghost"
              size="xs"
              onClick={clearFormatting}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          </div>
        </div>
      )}
      
      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="prose prose-lg max-w-none p-6 min-h-[500px] focus:outline-none"
      />
      
      {/* Footer */}
      {showWordCount && !readOnly && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between">
          <div className="flex space-x-4">
            <span>{wordCount} words</span>
            <span>{characterCount} characters</span>
          </div>
          <button 
            onClick={() => setShowWordCount(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}