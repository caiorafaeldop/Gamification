import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, CheckSquare, Trophy, Code, Megaphone, Clock, ArrowRight, Store, Folder } from 'lucide-react';
import { TOP_STUDENTS } from '../constants';

const DashboardScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Card */}
      <header className="relative rounded-3xl overflow-hidden bg-surface-light dark:bg-surface-dark shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="absolute inset-0 bg-network-pattern opacity-50 dark:opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 p-6 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center justify-center lg:justify-start gap-2">
              <Sun size={14} className="text-yellow-500" />
              Bom dia
            </p>
            <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-secondary dark:text-white mb-2">
              Bem-vindo, <span className="text-primary">Lucas!</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-md">
              Você tem novas atualizações nos seus projetos. Continue colaborando para subir no ranking!
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
              <button onClick={() => navigate('/kanban')} className="px-5 py-2.5 bg-secondary dark:bg-white text-white dark:text-secondary rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg">
                <CheckSquare size={16} /> Ver Tarefas
              </button>
              <button onClick={() => navigate('/ranking')} className="px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-lg font-bold text-sm hover:bg-primary/20 transition-colors flex items-center gap-2">
                <Trophy size={16} /> Ranking Geral
              </button>
            </div>
          </div>
          <div className="bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 w-full lg:w-96 border border-white/40 dark:border-white/10 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Meus Pontos</p>
                <p className="text-4xl font-display font-black text-primary">1.250 <span className="text-lg text-gray-400 font-bold">CP</span></p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <Trophy className="text-white" size={28} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-300">
                <span>Nível 5: <span className="text-secondary dark:text-white">Explorador</span></span>
                <span>1.500 CP</span>
              </div>
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-sky-500 w-[83%] rounded-full shadow-[0_0_10px_rgba(29,78,216,0.5)]"></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">Faltam 250 CP para o próximo nível</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-display font-bold text-secondary dark:text-white flex items-center gap-2">
                <Folder className="text-primary" size={24} />
                Projetos que você participa
              </h2>
              <Link to="/projects" className="text-sm font-bold text-primary hover:underline">Ver todos</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Card 1 */}
              <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 dark:border-gray-800 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                    <Code size={20} />
                  </div>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-lg uppercase">Em Andamento</span>
                </div>
                <h3 className="text-lg font-bold text-secondary dark:text-white mb-2">Plataforma E-learning</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">Desenvolvimento do módulo de gamificação para ensino à distância.</p>
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">
                    <span>Progresso</span>
                    <span>75%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full">
                    <div className="h-full bg-green-500 w-[75%] rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white dark:border-surface-dark"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white dark:border-surface-dark"></div>
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-dark bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">+3</div>
                  </div>
                  <Link to="/project-details" className="text-sm font-bold text-secondary dark:text-white hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1">
                    Acessar <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
              
              {/* Project Card 2 - Changed from Orange to Light Blue (Sky) */}
              <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 dark:border-gray-800 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-sky-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-lg">
                    <Megaphone size={20} />
                  </div>
                  <span className="px-2 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs font-bold rounded-lg uppercase">Planejamento</span>
                </div>
                <h3 className="text-lg font-bold text-secondary dark:text-white mb-2">Divulgação Hackathon</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">Criação de identidade visual e posts para redes sociais do evento.</p>
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">
                    <span>Progresso</span>
                    <span>30%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full">
                    <div className="h-full bg-sky-500 w-[30%] rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white dark:border-surface-dark"></div>
                  </div>
                  <Link to="/project-details" className="text-sm font-bold text-secondary dark:text-white hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1">
                    Acessar <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg text-secondary dark:text-white">Top Estudantes</h3>
              <Link to="/ranking" className="text-xs font-bold text-primary uppercase hover:underline">Ver Rank</Link>
            </div>
            <div className="space-y-4">
              {TOP_STUDENTS.slice(0, 3).map((student, i) => (
                <div key={student.id} className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full border-2 ${i === 0 ? 'border-yellow-400' : i === 1 ? 'border-gray-300' : 'border-sky-300'} bg-gray-300`}></div>
                    <div className={`absolute -top-1 -right-1 w-5 h-5 ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-300' : 'bg-sky-300'} rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>{student.rank}</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-secondary dark:text-white">{student.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{student.course}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary">{student.points}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">CP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-secondary/40 rounded-2xl p-6 border border-blue-100 dark:border-gray-800">
            <h3 className="font-display font-bold text-lg text-secondary dark:text-white mb-4">Próximas Atividades</h3>
            <div className="space-y-3">
              <div className="bg-white dark:bg-surface-dark p-3 rounded-xl shadow-sm flex items-center gap-3">
                <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold uppercase">Hoje</span>
                  <span className="text-lg font-black">14</span>
                </div>
                <div>
                  <h5 className="font-bold text-sm text-secondary dark:text-white leading-tight">Reunião Semanal</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Projeto E-learning • 14h</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary to-sky-500 rounded-2xl p-6 text-center text-white shadow-lg shadow-primary/30">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Store className="text-white" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-1">Troque seus Pontos!</h3>
            <p className="text-sm text-white/80 mb-4">Novos itens disponíveis na loja.</p>
            <button className="bg-white text-primary font-bold px-4 py-2 rounded-lg text-sm w-full hover:bg-gray-100 transition-colors">
              Visitar Loja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;