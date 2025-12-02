'use client';

import '@mdxeditor/editor/style.css';
import { type FC } from 'react';
import dynamic from 'next/dynamic';

const MDXEditor = dynamic(
  () => import('@mdxeditor/editor').then((mod) => mod.MDXEditor),
  { ssr: false }
);

import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CodeToggle,
  ListsToggle,
  CreateLink,
  InsertTable,
  tablePlugin,
  linkPlugin,
  linkDialogPlugin
} from '@mdxeditor/editor';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const Editor: FC<EditorProps> = ({ value, onChange }) => {
  return (
    <div className="border border-gray-300 rounded-md prose max-w-none">
      <MDXEditor
        markdown={value}
        onChange={onChange}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          tablePlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles />
                <ListsToggle />
                <CreateLink />
                <InsertTable />
                <CodeToggle />
              </>
            )
          })
        ]}
        contentEditableClassName="min-h-[200px] outline-none p-4"
      />
    </div>
  );
};

export default Editor;
