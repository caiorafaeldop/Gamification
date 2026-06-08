import React, { useEffect, useMemo, useState } from 'react';
import { Download, Copy, Check, Instagram, Linkedin, Image as ImageIcon, Pencil, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { WeeklyWinner } from '../services/ranking.service';
import { useWeeklyRanking } from '../hooks/useRanking';
import { generatePodiumImage, PodiumWinner } from '../utils/podiumCanvas';
import { Skeleton } from './Skeleton';
import { SurfaceCard } from './ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';

function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek) + 1;
}

const generateTexts = (winners: WeeklyWinner[], week: number) => {
  const line = (pos: number, medal: string) => {
    const w = winners.find((x) => x.position === pos);
    if (!w) return `${medal} —`;
    return `${medal} ${w.user.name} — ${w.points} XP`;
  };

  const insta = `🏆 Top 3 da Semana ${week} no ConnectaHub!\n\n${line(1, '🥇')}\n${line(2, '🥈')}\n${line(3, '🥉')}\n\nParabéns pela dedicação. Bora continuar somando! 🚀\n\n#ConnectaHub #Top3 #Gamificação #UFPB`;

  const linkedin = `🏆 Top 3 da Semana ${week} no ConnectaHub\n\nReconhecimento aos estudantes que mais somaram pontos esta semana através de tarefas, projetos e colaboração:\n\n${line(1, '🥇')}\n${line(2, '🥈')}\n${line(3, '🥉')}\n\nNetworking acadêmico com gamificação que conecta a comunidade.\n\n#ConnectaHub #Gamificação #Universidade #Networking`;

  return { insta, linkedin };
};

interface PreviewCardProps {
  variant: 'instagram' | 'linkedin';
  imageUrl: string;
  text: string;
  isEditing: boolean;
  copied: boolean;
  onTextChange: (v: string) => void;
  onToggleEdit: () => void;
  onCopy: () => void;
  onDownload: () => void;
}

const variantMeta = {
  instagram: {
    label: 'Instagram',
    sub: 'Post 4:5 (1080×1350)',
    iconBg: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500',
    Icon: Instagram,
    aspect: 'aspect-[4/5]',
    previewMaxW: 'max-w-[280px]',
  },
  linkedin: {
    label: 'LinkedIn',
    sub: 'Post 1.91:1 (1200×628)',
    iconBg: 'bg-[#0077B5]',
    Icon: Linkedin,
    aspect: 'aspect-[1.91/1]',
    previewMaxW: 'max-w-full',
  },
} as const;

const PreviewCard: React.FC<PreviewCardProps> = ({
  variant,
  imageUrl,
  text,
  isEditing,
  copied,
  onTextChange,
  onToggleEdit,
  onCopy,
  onDownload,
}) => {
  const meta = variantMeta[variant];
  const { Icon } = meta;

  return (
    <SurfaceCard padding="lg" className="flex flex-col gap-5">
      <header className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md ${meta.iconBg}`}>
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-display font-bold leading-tight text-secondary dark:text-white">
            Post {meta.label}
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{meta.sub}</p>
        </div>
      </header>

      <div className={`mx-auto w-full ${meta.previewMaxW}`}>
        <div className={`${meta.aspect} w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-inner dark:border-gray-700 dark:bg-background-dark`}>
          {imageUrl ? (
            <img src={imageUrl} alt={`Preview ${meta.label}`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="text-gray-300 dark:text-gray-600" size={40} />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-background-dark">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Legenda
          </span>
          <button
            onClick={onToggleEdit}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-primary dark:hover:bg-white/5"
            title={isEditing ? 'Fechar edição' : 'Editar'}
          >
            {isEditing ? <X size={14} /> : <Pencil size={14} />}
          </button>
        </div>
        {isEditing ? (
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            rows={6}
            className="w-full resize-none rounded-md border border-primary/30 bg-white px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:text-gray-200"
          />
        ) : (
          <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-600 line-clamp-6 dark:text-gray-300">
            {text}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onDownload}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-sky-500 active:scale-[0.98]"
        >
          <Download size={14} /> Baixar imagem
        </button>
        <button
          onClick={onCopy}
          className={`flex items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-2.5 text-xs font-bold transition-all active:scale-[0.98] ${
            copied
              ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-300 dark:hover:border-primary'
          }`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copiado!' : 'Copiar texto'}
        </button>
      </div>
    </SurfaceCard>
  );
};

const ArtsTab = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(true);

  const currentYear = new Date().getFullYear();
  const currentWeek = getCurrentWeekNumber();

  const [instaImageUrl, setInstaImageUrl] = useState('');
  const [linkedinImageUrl, setLinkedinImageUrl] = useState('');
  const [instaText, setInstaText] = useState('');
  const [linkedinText, setLinkedinText] = useState('');

  const weekOptions = useMemo(() => {
    const startWeek = currentYear === 2026 ? 9 : 1;
    const lastPrevWeek = currentWeek - 1;
    const options: number[] = [];
    for (let i = lastPrevWeek; i >= Math.max(startWeek, lastPrevWeek - 2); i--) {
      options.push(i);
    }
    return options;
  }, [currentYear, currentWeek]);

  const [selectedWeek, setSelectedWeek] = useState(() => {
    const startWeek = currentYear === 2026 ? 9 : 1;
    return Math.max(startWeek, currentWeek - 1);
  });

  const { data: weekWinnersData, isLoading: loadingWinners } = useWeeklyRanking(selectedWeek, currentYear);
  const weekWinners = weekWinnersData ?? [];
  const loading = loadingWinners || generating;

  useEffect(() => {
    const generate = async () => {
      setGenerating(true);
      try {
        const podiumWinners: PodiumWinner[] = weekWinners.map((w) => ({
          position: w.position,
          name: w.user.name,
          points: w.points,
          avatarUrl: w.user.avatarUrl,
        }));

        const finalWinners = podiumWinners.length
          ? podiumWinners
          : [
              { position: 1, name: 'Aguardando...', points: 0 },
              { position: 2, name: 'Aguardando...', points: 0 },
              { position: 3, name: 'Aguardando...', points: 0 },
            ];

        const [instaImg, linkedinImg] = await Promise.all([
          generatePodiumImage(finalWinners, selectedWeek, currentYear, 'instagram'),
          generatePodiumImage(finalWinners, selectedWeek, currentYear, 'linkedin'),
        ]);

        setInstaImageUrl(instaImg);
        setLinkedinImageUrl(linkedinImg);

        const texts = generateTexts(weekWinners, selectedWeek);
        setInstaText(texts.insta);
        setLinkedinText(texts.linkedin);
      } catch (error) {
        console.error('Failed to generate arts', error);
      } finally {
        setGenerating(false);
      }
    };
    if (!loadingWinners) generate();
  }, [selectedWeek, currentYear, weekWinnersData, loadingWinners]);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Texto copiado!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Não foi possível copiar.');
    }
  };

  const handleDownload = (dataUrl: string, type: string) => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `connectahub-top3-sem${selectedWeek}-${type}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <SurfaceCard padding="md" className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Semana selecionada
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Visualize, edite e baixe as artes do Top 3 para divulgar nas redes.
          </p>
        </div>
        <Select value={selectedWeek.toString()} onValueChange={(val) => setSelectedWeek(Number(val))}>
          <SelectTrigger className="h-10 w-[180px] text-xs font-bold">
            <SelectValue placeholder="Selecionar semana" />
          </SelectTrigger>
          <SelectContent>
            {weekOptions.map((w) => (
              <SelectItem key={w} value={w.toString()}>
                Semana {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SurfaceCard>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-[560px] w-full rounded-2xl" />
          <Skeleton className="h-[420px] w-full rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PreviewCard
            variant="instagram"
            imageUrl={instaImageUrl}
            text={instaText}
            isEditing={editingId === 'insta'}
            copied={copiedId === 'insta'}
            onTextChange={setInstaText}
            onToggleEdit={() => setEditingId(editingId === 'insta' ? null : 'insta')}
            onCopy={() => handleCopy('insta', instaText)}
            onDownload={() => handleDownload(instaImageUrl, 'instagram')}
          />
          <PreviewCard
            variant="linkedin"
            imageUrl={linkedinImageUrl}
            text={linkedinText}
            isEditing={editingId === 'linkedin'}
            copied={copiedId === 'linkedin'}
            onTextChange={setLinkedinText}
            onToggleEdit={() => setEditingId(editingId === 'linkedin' ? null : 'linkedin')}
            onCopy={() => handleCopy('linkedin', linkedinText)}
            onDownload={() => handleDownload(linkedinImageUrl, 'linkedin')}
          />
        </div>
      )}
    </div>
  );
};

export default ArtsTab;
