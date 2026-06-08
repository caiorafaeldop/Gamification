import React, { useEffect, useRef, useState } from 'react';
import { Link as LinkIcon, ExternalLink, MoreVertical, Plus, Paperclip } from 'lucide-react';
import { formatLink } from '../RichEditor';

interface LinkListEditorProps {
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
}

export const LinkListEditor: React.FC<LinkListEditorProps> = ({
  value,
  onChange,
  label = 'Links / Anexos',
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuIndex(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const update = (index: number, val: string) => {
    const next = [...value];
    next[index] = val;
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    setMenuIndex(null);
    setEditingIndex(null);
  };

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...value, trimmed]);
    setDraft('');
  };

  return (
    <div className="space-y-2">
      <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
        <Paperclip size={12} /> {label} ({value.length})
      </h4>

      <div className="space-y-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800/50">
        {value.map((url, index) => (
          <div
            key={index}
            className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800"
          >
            {editingIndex === index ? (
              <input
                type="text"
                value={url}
                onChange={(e) => update(index, e.target.value)}
                onBlur={() => setEditingIndex(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingIndex(null)}
                className="flex-1 rounded border border-primary bg-transparent px-2 py-1 text-xs dark:text-gray-100"
                autoFocus
              />
            ) : (
              <>
                <ExternalLink size={12} className="flex-shrink-0 text-blue-500" />
                <a
                  href={formatLink(url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-xs text-blue-600 hover:underline dark:text-blue-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  {url}
                </a>
                <div className="relative" ref={menuIndex === index ? menuRef : null}>
                  <button
                    type="button"
                    onClick={() => setMenuIndex(menuIndex === index ? null : index)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                  >
                    <MoreVertical size={14} />
                  </button>
                  {menuIndex === index && (
                    <div className="absolute right-0 top-full z-10 mt-1 min-w-[100px] rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-surface-dark">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingIndex(index);
                          setMenuIndex(null);
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="w-full px-3 py-1.5 text-left text-xs text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Deletar
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800">
          <LinkIcon size={12} className="flex-shrink-0 text-gray-400" />
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={add}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
            placeholder="Cole um link e pressione Enter..."
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400 dark:text-gray-100"
          />
          <button
            type="button"
            onClick={add}
            disabled={!draft.trim()}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-primary disabled:opacity-30 dark:hover:bg-gray-700"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkListEditor;
