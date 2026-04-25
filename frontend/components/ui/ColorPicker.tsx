import React, { useState, useRef, useEffect } from 'react';
import { Check, Palette } from 'lucide-react';
import { cn } from '../../utils/cn';

const PRESET_COLORS = [
  '#29B6F6', // ConnectaCI primary (sky)
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // emerald
  '#14B8A6', // teal
  '#0EA5E9', // sky
  '#64748B', // slate
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  description?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label = 'Cor do Grupo',
  description = 'Define a identidade visual do grupo.',
}) => {
  const [customOpen, setCustomOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);


  const isPreset = PRESET_COLORS.includes(value.toUpperCase()) || PRESET_COLORS.includes(value);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Palette size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-secondary dark:text-white">{label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {PRESET_COLORS.map((color) => {
          const selected = value.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={cn(
                'group relative flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
                selected && 'ring-2 ring-offset-2 ring-offset-surface-light dark:ring-offset-surface-dark'
              )}
              style={{ backgroundColor: color, boxShadow: selected ? `0 0 0 2px ${color}` : undefined }}
              aria-label={`Selecionar cor ${color}`}
            >
              {selected && <Check size={18} className="text-white drop-shadow" strokeWidth={3} />}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => {
            setCustomOpen(true);
            setTimeout(() => inputRef.current?.click(), 0);
          }}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-xs font-bold text-gray-500 transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary dark:border-gray-600',
            !isPreset && 'border-solid text-primary'
          )}
          style={!isPreset ? { backgroundColor: value, color: 'white', borderColor: value } : undefined}
          aria-label="Escolher cor customizada"
        >
          {!isPreset ? <Check size={18} strokeWidth={3} /> : '+'}
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-surface-darker/50">
        <div
          className="h-9 w-9 rounded-lg shadow-inner"
          style={{ backgroundColor: value }}
        />
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Hex</p>
          <p className="font-mono text-sm font-bold text-secondary dark:text-white">{value.toUpperCase()}</p>
        </div>
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded-lg border-none bg-transparent"
          aria-label="Seletor de cor avançado"
        />
      </div>
    </div>
  );
};

export default ColorPicker;
