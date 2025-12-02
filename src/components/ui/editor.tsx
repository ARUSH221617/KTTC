'use client';

import '@mdxeditor/editor/style.css';
import { type FC } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import MDXEditor to avoid SSR issues with its dependencies
const MDXEditor = dynamic(
  () => import('@mdxeditor/editor').then((mod) => mod.MDXEditor),
  { ssr: false }
);

// We need to import plugins dynamically or ensure they are used only client side.
// The plugins themselves are usually functions returning config, so they might be safe to import directly
// but using them inside the dynamic component is safer if we pass them as props or define them inside.
// However, MDXEditor documentation suggests standard imports work if the component itself is dynamic.
// Let's try importing plugins normally first, but if that fails, we might need to bundle them.
import { headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, markdownShortcutPlugin } from '@mdxeditor/editor';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const Editor: FC<EditorProps> = ({ value, onChange }) => {
  return (
    <div className="border border-gray-300 rounded-md p-2 prose max-w-none">
      <MDXEditor
        markdown={value}
        onChange={onChange}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin()
        ]}
        contentEditableClassName="min-h-[100px] outline-none"
      />
    </div>
  );
};

export default Editor;
