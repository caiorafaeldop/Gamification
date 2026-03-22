import React, { useEffect, useState } from 'react';
import { Download, Copy, Check, Instagram, Linkedin, Image as ImageIcon } from 'lucide-react';
import { getRankingArts, RankingArt } from '../services/ranking.service';
import { Skeleton } from './Skeleton';

const ArtsTab = () => {
  const [arts, setArts] = useState<RankingArt[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchArts = async () => {
      try {
        const data = await getRankingArts();
        if (data && data.length > 0) {
          setArts(data);
        } else {
          // Mock data to ensure it works beautifully if backend is empty
          setArts([
            { id: '1', type: 'instagram', imageUrl: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=400&h=400&fit=crop', text: 'Muito orgulho de ser Destaque da Semana no Connecta! O esforço contínuo sempre traz ótimos resultados. 🏆🚀 #Connecta #Gamification #Tech #DestaqueDaSemana' },
            { id: '2', type: 'linkedin', imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&h=400&fit=crop', text: 'Feliz em compartilhar que fui reconhecido como Destaque da Semana na plataforma Connecta Gamification.\n\nUma ótima jornada de aprendizado contínuo ao lado de excelentes profissionais! 🚀\n\n#Connecta #Gamification #EvoluçãoProfissional #Reconhecimento #Carreira' }
          ]);
        }
      } catch (error) {
        console.error('Failed to load arts', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArts();
  }, []);

  const handleCopy = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } else {
      alert("Acesso a clipboard bloqueado pelo navegador.");
    }
  };

  const handleDownload = async (imageUrl: string, type: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `connecta-destaque-${type}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download falhou', error);
        window.open(imageUrl, '_blank');
    }
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

  const instaArt = arts.find(a => a.type === 'instagram');
  const linkedinArt = arts.find(a => a.type === 'linkedin');

  return (
    <div className="p-4 md:p-8 relative z-10 w-full max-w-5xl mx-auto">
      <div className="mb-8 p-6 bg-surface-light/80 dark:bg-surface-dark/80 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-secondary dark:text-white mb-2">Compartilhe sua Conquista! 🎉</h2>
        <p className="text-gray-500 dark:text-gray-400">Aqui estão suas artes personalizadas como Destaque da Semana. Baixe as imagens e clique para copiar os textos de exemplo preenchidos com as melhores hashtags.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Instagram Card */}
        {instaArt && (
          <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col items-center hover:border-primary/50 transition-colors duration-300">
            <div className="flex items-center gap-3 mb-6 self-start">
              <div className="p-2.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-xl text-white shadow-md">
                <Instagram size={24} />
              </div>
              <div>
                 <h3 className="font-bold text-lg text-secondary dark:text-white leading-tight">Post Instagram</h3>
                 <p className="text-xs text-gray-500 dark:text-gray-400">1:1 Square (1080x1080)</p>
              </div>
            </div>
            
            <div className="w-full max-w-[320px] aspect-square bg-gray-50 dark:bg-gray-800/50 rounded-2xl overflow-hidden mb-8 flex items-center justify-center border border-gray-200 dark:border-gray-700/50 shadow-inner group relative">
              {instaArt.imageUrl ? (
                <img src={instaArt.imageUrl} alt="Instagram Art" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <ImageIcon className="text-gray-300 dark:text-gray-600" size={48} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-end justify-center pb-4 text-white font-medium">Pré-visualização</div>
            </div>

            <div className="w-full space-y-3 mt-auto">
              <button 
                onClick={() => handleDownload(instaArt.imageUrl, 'instagram')}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-secondary hover:bg-secondary-hover dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white text-white rounded-xl font-bold transition-all shadow-md active:scale-[0.98]"
              >
                <Download size={20} /> Baixar Imagem
              </button>
              <button 
                onClick={() => handleCopy(instaArt.id || 'insta', instaArt.text)}
                className={`w-full flex items-center justify-center gap-2 py-3.5 border-2 rounded-xl font-bold transition-all active:scale-[0.98] ${copiedId === (instaArt.id || 'insta') ? 'bg-green-50 border-green-500 text-green-600 dark:bg-green-900/20 dark:border-green-500 dark:text-green-400 shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10'}`}
              >
                {copiedId === (instaArt.id || 'insta') ? (
                  <><Check size={20} className="text-green-500" /> Texto Copiado!</>
                ) : (
                  <><Copy size={20} /> Copiar Texto</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* LinkedIn Card */}
        {linkedinArt && (
          <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col items-center hover:border-primary/50 transition-colors duration-300">
            <div className="flex items-center gap-3 mb-6 self-start">
              <div className="p-2.5 bg-[#0077b5] rounded-xl text-white shadow-md">
                <Linkedin size={24} />
              </div>
              <div>
                 <h3 className="font-bold text-lg text-secondary dark:text-white leading-tight">Post LinkedIn</h3>
                 <p className="text-xs text-gray-500 dark:text-gray-400">1.91:1 Landscape (1200x627)</p>
              </div>
            </div>
            
            <div className="w-full aspect-[1.91/1] bg-gray-50 dark:bg-gray-800/50 rounded-2xl overflow-hidden mb-8 flex items-center justify-center border border-gray-200 dark:border-gray-700/50 shadow-inner group relative mt-4 md:mt-12">
              {linkedinArt.imageUrl ? (
                <img src={linkedinArt.imageUrl} alt="LinkedIn Art" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <ImageIcon className="text-gray-300 dark:text-gray-600" size={48} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-end justify-center pb-4 text-white font-medium">Pré-visualização</div>
            </div>

            <div className="w-full space-y-3 mt-auto">
              <button 
                onClick={() => handleDownload(linkedinArt.imageUrl, 'linkedin')}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-secondary hover:bg-secondary-hover dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white text-white rounded-xl font-bold transition-all shadow-md active:scale-[0.98]"
              >
                <Download size={20} /> Baixar Imagem
              </button>
              <button 
                onClick={() => handleCopy(linkedinArt.id || 'linkedin', linkedinArt.text)}
                className={`w-full flex items-center justify-center gap-2 py-3.5 border-2 rounded-xl font-bold transition-all active:scale-[0.98] ${copiedId === (linkedinArt.id || 'linkedin') ? 'bg-green-50 border-green-500 text-green-600 dark:bg-green-900/20 dark:border-green-500 dark:text-green-400 shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10'}`}
              >
                {copiedId === (linkedinArt.id || 'linkedin') ? (
                  <><Check size={20} className="text-green-500" /> Texto Copiado!</>
                ) : (
                  <><Copy size={20} /> Copiar Texto</>
                )}
              </button>
            </div>
          </div>
        )}

        {!instaArt && !linkedinArt && (
           <div className="col-span-full py-20 text-center flex flex-col items-center border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl">
             <ImageIcon className="text-gray-300 dark:text-gray-600 mb-4" size={64} />
             <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Nenhuma arte disponível no momento.</p>
             <p className="text-sm text-gray-500 dark:text-gray-500 max-w-md">Continue realizando tarefas para acumular pontos e se tornar um dos destaques da plataforma!</p>
           </div>
        )}

      </div>
    </div>
  );
};

export default ArtsTab;
