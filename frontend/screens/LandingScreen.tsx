import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  ArrowRight,
  Trophy,
  Users,
  Briefcase,
  Globe,
  Target,
  TrendingUp,
} from 'lucide-react';
import { getCatalog } from '../services/catalog.service';
import { listGroups } from '../services/group.service';
import { listJobPostings } from '../services/jobPosting.service';
import ProjectCard from '../components/ProjectCard';
import GroupCard from '../components/GroupCard';

const LandingScreen = () => {
  const navigate = useNavigate();

  const { data: catalog } = useQuery({
    queryKey: ['catalog'],
    queryFn: getCatalog,
    staleTime: 60 * 1000,
  });
  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: listGroups,
    staleTime: 60 * 1000,
  });
  const { data: jobs } = useQuery({
    queryKey: ['jobs', 'OPEN'],
    queryFn: () => listJobPostings({ status: 'OPEN' }),
    staleTime: 60 * 1000,
  });

  const trending = (catalog?.trending ?? []).slice(0, 4);
  const openProjects = (catalog?.openForJoining ?? []).slice(0, 4);
  const topGroups = (groups ?? []).slice(0, 4);
  const openJobs = (jobs ?? []).slice(0, 3);

  return (
    <div className="min-h-screen bg-surface-light dark:bg-background-dark overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-[-5%] w-[30%] h-[30%] bg-sky-500/20 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Gamificação & Colaboração</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-black text-secondary dark:text-white leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              O ecossistema onde seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-500">impacto</span> é reconhecido.
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Conecte-se a grupos, participe de projetos reais, conquiste medalhas e mostre suas habilidades para a comunidade.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link
                to="/login?view=register"
                className="group flex items-center justify-center gap-2 h-14 px-8 rounded-2xl bg-primary text-white text-lg font-bold shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 hover:bg-sky-500 w-full sm:w-auto"
              >
                Começar agora
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/projects"
                className="flex items-center justify-center h-14 px-8 rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/20 backdrop-blur-sm text-secondary dark:text-white text-lg font-bold transition-all hover:bg-white dark:hover:bg-black/40 w-full sm:w-auto"
              >
                Explorar como convidado
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 animate-in fade-in duration-1000 delay-500">
              <div className="flex items-center gap-2">
                <Users size={18} />
                <span className="font-bold text-sm uppercase tracking-wider">Laboratórios</span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={18} />
                <span className="font-bold text-sm uppercase tracking-wider">Projetos</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={18} />
                <span className="font-bold text-sm uppercase tracking-wider">Oportunidades</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={18} />
                <span className="font-bold text-sm uppercase tracking-wider">Reconhecimento</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50/50 dark:bg-black/20 border-y border-gray-100 dark:border-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-black text-secondary dark:text-white mb-4">
              Tudo em um só lugar
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Construa sua reputação digital através de colaboração real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Globe className="text-primary" />}
              title="Hub de Projetos"
              description="Visualize e participe de iniciativas da comunidade, desde protótipos a produtos reais."
              link="/projects"
            />
            <FeatureCard
              icon={<Users className="text-sky-500" />}
              title="Grupos & Labs"
              description="Encontre seu espaço em laboratórios de pesquisa ou coletivos focados em tecnologias específicas."
              link="/groups"
            />
            <FeatureCard
              icon={<Briefcase className="text-emerald-500" />}
              title="Mural de Vagas"
              description="Oportunidades abertas para membros ativos da rede. Publique ou encontre seu próximo job."
              link="/jobs"
            />
            <FeatureCard
              icon={<Trophy className="text-amber-500" />}
              title="Ranking & XP"
              description="Sua contribuição gera pontos e prestígio. Suba no ranking e destaque-se na arena."
              link="/ranking"
            />
          </div>
        </div>
      </section>

      {/* Vitrine: projetos / grupos / vagas reais */}
      {(trending.length > 0 || openProjects.length > 0) && (
        <section className="py-20">
          <div className="container mx-auto px-4 space-y-16">
            {trending.length > 0 && (
              <div>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500">
                      <TrendingUp size={12} /> Em alta
                    </p>
                    <h2 className="mt-1 text-2xl md:text-3xl font-display font-black text-secondary dark:text-white">
                      Projetos mais curtidos da semana
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate('/projects')}
                    className="hidden sm:flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Ver todos <ArrowRight size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {trending.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              </div>
            )}

            {openProjects.length > 0 && (
              <div>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                      <Sparkles size={12} /> Aceitando membros
                    </p>
                    <h2 className="mt-1 text-2xl md:text-3xl font-display font-black text-secondary dark:text-white">
                      Entre num projeto agora
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {openProjects.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              </div>
            )}

            {topGroups.length > 0 && (
              <div>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sky-500">
                      <Users size={12} /> Comunidade
                    </p>
                    <h2 className="mt-1 text-2xl md:text-3xl font-display font-black text-secondary dark:text-white">
                      Grupos em destaque
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate('/groups')}
                    className="hidden sm:flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Ver todos <ArrowRight size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {topGroups.map((g) => (
                    <GroupCard key={g.id} group={g} />
                  ))}
                </div>
              </div>
            )}

            {openJobs.length > 0 && (
              <div>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500">
                      <Briefcase size={12} /> Mural aberto
                    </p>
                    <h2 className="mt-1 text-2xl md:text-3xl font-display font-black text-secondary dark:text-white">
                      Vagas abertas agora
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate('/jobs')}
                    className="hidden sm:flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Ver todas <ArrowRight size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {openJobs.map((job) => (
                    <article
                      key={job.id}
                      onClick={() => navigate('/jobs')}
                      className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800 dark:bg-surface-dark"
                    >
                      {job.group && (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold border"
                          style={{
                            borderColor: `${job.group.color || '#29B6F6'}30`,
                            backgroundColor: `${job.group.color || '#29B6F6'}10`,
                            color: job.group.color || '#29B6F6',
                          }}
                        >
                          {job.group.name}
                        </span>
                      )}
                      <h3 className="mt-2 line-clamp-2 text-base font-display font-bold text-secondary dark:text-white">
                        {job.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm text-gray-500 dark:text-gray-400">
                        {job.description}
                      </p>
                      <div className="mt-3 text-xs text-gray-400">
                        por <span className="font-semibold">{job.author.name}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto rounded-[2rem] bg-gradient-to-br from-secondary to-slate-900 p-8 md:p-16 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[80px] -ml-32 -mb-32" />

            <h2 className="text-3xl md:text-5xl font-display font-black text-white mb-6 relative z-10">
              Pronto para evoluir seu perfil?
            </h2>
            <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto relative z-10">
              Junte-se a centenas de estudantes e profissionais que já estão construindo o futuro juntos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link
                to="/login?view=register"
                className="h-14 px-10 rounded-2xl bg-white text-secondary text-lg font-bold transition-all hover:scale-105 hover:shadow-xl w-full sm:w-auto flex items-center justify-center"
              >
                Criar conta gratuita
              </Link>
              <Link
                to="/login"
                className="h-14 px-10 rounded-2xl bg-primary/20 border border-primary/30 text-white text-lg font-bold backdrop-blur-md transition-all hover:bg-primary/30 w-full sm:w-auto flex items-center justify-center"
              >
                Já tenho uma conta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 dark:border-gray-900 text-center">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
              G
            </div>
            <span className="font-display font-black text-xl text-secondary dark:text-white uppercase tracking-tighter">Gamification</span>
          </div>
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} Gamification Hub. Desenvolvido para impulsionar a inovação.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, link }: { icon: React.ReactNode, title: string, description: string, link: string }) => {
  return (
    <Link to={link} className="group p-8 rounded-[2rem] bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5">
      <div className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-black/20 flex items-center justify-center mb-6 transition-colors group-hover:bg-primary/10">
        {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 28 })}
      </div>
      <h3 className="text-xl font-display font-bold text-secondary dark:text-white mb-3 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
        {description}
      </p>
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
        Ver mais <ArrowRight size={14} />
      </div>
    </Link>
  );
};

export default LandingScreen;
