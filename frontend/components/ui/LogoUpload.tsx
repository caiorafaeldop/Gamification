import React, { useRef, useState } from 'react';
import { Upload, Loader, ImagePlus, X } from 'lucide-react';
import { uploadFile } from '../../services/upload.service';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

interface LogoUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  label?: string;
  description?: string;
  color?: string;
  shape?: 'square' | 'round';
  maxSizeMb?: number;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({
  value,
  onChange,
  label = 'Logo do Grupo',
  description = 'PNG ou JPG, até 5MB. Aparece no catálogo e nas telas do grupo.',
  color = '#29B6F6',
  shape = 'square',
  maxSizeMb = 5,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleSelect = () => inputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`A imagem deve ter no máximo ${maxSizeMb}MB`);
      return;
    }
    setUploading(true);
    try {
      const res = await uploadFile(file);
      onChange(res.url);
      toast.success('Logo atualizada!');
    } catch (err: any) {
      toast.error('Erro ao enviar imagem.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ImagePlus size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-secondary dark:text-white">{label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSelect}
          disabled={uploading}
          className={cn(
            'group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border-2 border-dashed shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
            shape === 'round' ? 'rounded-full' : 'rounded-2xl',
            value ? 'border-transparent' : 'border-gray-300 dark:border-gray-600'
          )}
          style={{
            backgroundColor: value ? undefined : `${color}15`,
            borderColor: value ? undefined : `${color}40`,
          }}
          aria-label="Selecionar logo"
        >
          {uploading ? (
            <Loader className="animate-spin text-primary" size={24} />
          ) : value ? (
            <>
              <img src={value} alt="Logo preview" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Upload className="text-white" size={22} />
              </div>
            </>
          ) : (
            <Upload size={28} style={{ color }} />
          )}

          {value && !uploading && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleRemove}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRemove(e as any); }}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-700 shadow-md transition-transform hover:scale-110 dark:bg-slate-900 dark:text-gray-200"
              aria-label="Remover logo"
            >
              <X size={14} />
            </span>
          )}
        </button>

        <div className="flex-1">
          <button
            type="button"
            onClick={handleSelect}
            disabled={uploading}
            className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
          >
            {uploading ? <Loader className="animate-spin" size={14} /> : <Upload size={14} />}
            {value ? 'Trocar imagem' : 'Enviar imagem'}
          </button>
          <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
            Recomendado: 512x512px, fundo transparente.
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleFile}
      />
    </div>
  );
};

export default LogoUpload;
