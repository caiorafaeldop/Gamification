import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Download, Copy, Check, Instagram, Linkedin, Image as ImageIcon, Pencil, X, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { WeeklyWinner } from '../services/ranking.service';
import { useWeeklyRanking } from '../hooks/useRanking';
import { generatePodiumImage, PodiumWinner } from '../utils/podiumCanvas';
import { Skeleton } from './Skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/Select';

// Helper: calcula o número da semana atual no ano (1 Jan = Início da Semana 1)
function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek) + 1;
}

const ArtsTab = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [generating, setGenerating] = useState(true);

  const currentYear = new Date().getFullYear();
  const currentWeek = getCurrentWeekNumber();

  const [instaImageUrl, setInstaImageUrl] = useState<string>('');
  const [linkedinImageUrl, setLinkedinImageUrl] = useState<string>('');

  const [instaText, setInstaText] = useState('');
  const [linkedinText, setLinkedinText] = useState('');

  // Gerar opções de semana: mostrar exatamente as 3 anteriores à atual
  const weekOptions = useMemo(() => {
    const startWeek = currentYear === 2026 ? 9 : 1;
    const lastPrevWeek = currentWeek - 1; // Exclui semana atual
    const options = [];
    
    // Pega as 3 semanas anteriores (ex: se hoje é 12, pega 11, 10, 9)
    for (let i = lastPrevWeek; i >= Math.max(startWeek, lastPrevWeek - 2); i--) {
      options.push(i);
    }
    return options;
  }, [currentYear, currentWeek]);

  const [selectedWeek, setSelectedWeek] = useState(() => {
    const startWeek = currentYear === 2026 ? 9 : 1;
    return Math.max(startWeek, currentWeek - 1);
  });

  // Gerar texto dinâmico baseado nos winners reais
  function generateTexts(w: WeeklyWinner[], week: number) {
    const names = w.map(winner => winner.user.name.split(' ')[0]).join(', ');
    const top1 = w.find(x => x.position === 1);
    const top1Name = top1 ? top1.user.name : 'Ninguém ainda';
    
    const insta = `🏆 Destaques da Semana ${week} no ConnectHub!\n\n🥇 ${w[0]?.user.name || '---'}\n🥈 ${w[1]?.user.name || '---'}\n🥉 ${w[2]?.user.name || '---'}\n\nParabéns aos nossos campeões! O esforço contínuo sempre traz resultados. 💪🚀\n\n#ConnectHub #DestaqueDaSemana #Top3 #Tech #Inovação`;

    const linkedin = `Tenho o prazer de compartilhar os destaques da Semana ${week} na plataforma ConnectHub! 🏆\n\n🥇 ${w[0]?.user.name || '---'} — ${w[0]?.points || 0} XP\n🥈 ${w[1]?.user.name || '---'} — ${w[1]?.points || 0} XP\n🥉 ${w[2]?.user.name || '---'} — ${w[2]?.points || 0} XP\n\nUma ótima jornada de aprendizado contínuo ao lado de excelentes profissionais!\n\n#ConnectHub #EvoluçãoProfissional #Reconhecimento #Carreira`;

    return { insta, linkedin };
  }

  const { data: weekWinnersData, isLoading: loadingWinners } = useWeeklyRanking(selectedWeek, currentYear);
  const weekWinners = weekWinnersData ?? [];
  const loading = loadingWinners || generating;

  useEffect(() => {
    const generate = async () => {
      setGenerating(true);
      try {
        const podiumWinners: PodiumWinner[] = weekWinners.map(w => ({
          position: w.position,
          name: w.user.name,
          points: w.points,
          avatarUrl: w.user.avatarUrl,
        }));

        // Se não tiver dados, usar placeholder
        const finalWinners = podiumWinners.length > 0 ? podiumWinners : [
          { position: 1, name: 'Aguardando...', points: 0, avatarUrl: undefined },
          { position: 2, name: 'Aguardando...', points: 0, avatarUrl: undefined },
          { position: 3, name: 'Aguardando...', points: 0, avatarUrl: undefined },
        ];

        // 3. Gerar imagens via Canvas
        const [instaImg, linkedinImg] = await Promise.all([
          generatePodiumImage(finalWinners, selectedWeek, currentYear, 'instagram'),
          generatePodiumImage(finalWinners, selectedWeek, currentYear, 'linkedin'),
        ]);

        setInstaImageUrl(instaImg);
        setLinkedinImageUrl(linkedinImg);

        // 4. Gerar textos
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

  const handleCopy = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } else {
      alert("Acesso a clipboard bloqueado pelo navegador.");
    }
  };

  const handleDownload = (dataUrl: string, type: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `connecta-top3-sem${selectedWeek}-${type}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 relative z-10 w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-[500px] w-full rounded-3xl" />
          <Skeleton className="h-[500px] w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 relative z-10 w-full max-w-5xl mx-auto">
      <div className="mb-8 p-6 bg-surface-light/80 dark:bg-surface-dark/80 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-secondary dark:text-white mb-2">Compartilhe sua Conquista! 🎉</h2>
            <p className="text-gray-500 dark:text-gray-400">Baixe as imagens e copie os textos prontos para postar nas redes sociais.</p>
          </div>
          
          {/* Select de Semana — apenas últimas 5 anteriores */}
          <div className="flex-shrink-0">
            <Select 
              value={selectedWeek.toString()} 
              onValueChange={(val) => setSelectedWeek(Number(val))}
            >
              <SelectTrigger className="w-[200px] border-2 border-primary/20 dark:border-primary/30 font-bold">
                <SelectValue placeholder="Selecionar Semana" />
              </SelectTrigger>
              <SelectContent>
                {weekOptions.map(w => (
                  <SelectItem key={w} value={w.toString()}>
                    📅 Semana {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Instagram Card */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col items-center hover:border-primary/50 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6 self-start">
            <div className="p-2.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-xl text-white shadow-md">
              <Instagram size={24} />
            </div>
            <div>
               <h3 className="font-bold text-lg text-secondary dark:text-white leading-tight">Post Instagram</h3>
               <p className="text-xs text-gray-500 dark:text-gray-400">4:5 Portrait (1080×1350)</p>
            </div>
          </div>
          
          <div className="w-full max-w-[320px] aspect-[4/5] bg-gray-50 dark:bg-gray-800/50 rounded-2xl overflow-hidden mb-6 flex items-center justify-center border border-gray-200 dark:border-gray-700/50 shadow-inner group relative">
            {instaImageUrl ? (
              <img src={instaImageUrl} alt="Instagram Art" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="text-gray-300 dark:text-gray-600" size={48} />
            )}
          </div>

          <div className="w-full mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-4 relative">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Texto da Publicação</span>
              <button 
                onClick={() => setIsEditing(isEditing === 'insta' ? null : 'insta')}
                className="text-gray-400 hover:text-primary transition-colors focus:outline-none"
                title={isEditing === 'insta' ? 'Fechar Edição' : 'Editar Texto'}
              >
                {isEditing === 'insta' ? <X size={16} /> : <Pencil size={16} />}
              </button>
            </div>
            
            {isEditing === 'insta' ? (
              <textarea 
                className="w-full h-32 bg-white dark:bg-gray-900 border border-primary/30 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                value={instaText}
                onChange={(e) => setInstaText(e.target.value)}
                placeholder="Escreva sua legenda aqui..."
              />
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap line-clamp-6">
                {instaText}
              </p>
            )}
          </div>

          <div className="w-full space-y-3 mt-auto">
            <button 
              onClick={() => handleDownload(instaImageUrl, 'instagram')}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-secondary hover:bg-secondary-hover dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white text-white rounded-xl font-bold transition-all shadow-md active:scale-[0.98]"
            >
              <Download size={20} /> Baixar Imagem
            </button>
            <button 
              onClick={() => handleCopy('insta', instaText)}
              className={`w-full flex items-center justify-center gap-2 py-3.5 border-2 rounded-xl font-bold transition-all active:scale-[0.98] ${copiedId === 'insta' ? 'bg-green-50 border-green-500 text-green-600 dark:bg-green-900/20 dark:border-green-500 dark:text-green-400 shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10'}`}
            >
              {copiedId === 'insta' ? (
                <><Check size={20} className="text-green-500" /> Texto Copiado!</>
              ) : (
                <><Copy size={20} /> Copiar Texto</>
              )}
            </button>
          </div>
        </div>

        {/* LinkedIn Card */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col items-center hover:border-primary/50 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6 self-start">
            <div className="p-2.5 bg-[#0077b5] rounded-xl text-white shadow-md">
              <Linkedin size={24} />
            </div>
            <div>
               <h3 className="font-bold text-lg text-secondary dark:text-white leading-tight">Post LinkedIn</h3>
               <p className="text-xs text-gray-500 dark:text-gray-400">1.91:1 Landscape (1200×627)</p>
            </div>
          </div>
          
          <div className="w-full aspect-[1.91/1] bg-gray-50 dark:bg-gray-800/50 rounded-2xl overflow-hidden mb-6 flex items-center justify-center border border-gray-200 dark:border-gray-700/50 shadow-inner group relative mt-4 md:mt-12">
            {linkedinImageUrl ? (
              <img src={linkedinImageUrl} alt="LinkedIn Art" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="text-gray-300 dark:text-gray-600" size={48} />
            )}
          </div>

          <div className="w-full mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-4 relative">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Texto da Publicação</span>
              <button 
                onClick={() => setIsEditing(isEditing === 'linkedin' ? null : 'linkedin')}
                className="text-gray-400 hover:text-primary transition-colors focus:outline-none"
                title={isEditing === 'linkedin' ? 'Fechar Edição' : 'Editar Texto'}
              >
                {isEditing === 'linkedin' ? <X size={16} /> : <Pencil size={16} />}
              </button>
            </div>
            
            {isEditing === 'linkedin' ? (
              <textarea 
                className="w-full h-40 bg-white dark:bg-gray-900 border border-primary/30 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                value={linkedinText}
                onChange={(e) => setLinkedinText(e.target.value)}
                placeholder="Escreva sua publicação aqui..."
              />
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap line-clamp-6">
                {linkedinText}
              </p>
            )}
          </div>

          <div className="w-full space-y-3 mt-auto">
            <button 
              onClick={() => handleDownload(linkedinImageUrl, 'linkedin')}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-secondary hover:bg-secondary-hover dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white text-white rounded-xl font-bold transition-all shadow-md active:scale-[0.98]"
            >
              <Download size={20} /> Baixar Imagem
            </button>
            <button 
              onClick={() => handleCopy('linkedin', linkedinText)}
              className={`w-full flex items-center justify-center gap-2 py-3.5 border-2 rounded-xl font-bold transition-all active:scale-[0.98] ${copiedId === 'linkedin' ? 'bg-green-50 border-green-500 text-green-600 dark:bg-green-900/20 dark:border-green-500 dark:text-green-400 shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10'}`}
            >
              {copiedId === 'linkedin' ? (
                <><Check size={20} className="text-green-500" /> Texto Copiado!</>
              ) : (
                <><Copy size={20} /> Copiar Texto</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ArtsTab;
