import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Plus,
  Search,
  FlaskConical,
  Mail,
  ExternalLink,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  listJobPostings,
  deleteJobPosting,
  updateJobPosting,
  JobPosting,
  JobPostingStatus,
} from '../services/jobPosting.service';
import { Skeleton } from '../components/Skeleton';
import { PageHero, EmptyState } from '../components/ui';

const statusMeta: Record<
  JobPostingStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  OPEN: { label: 'Aberta', color: '#10B981', icon: <Clock size={11} /> },
  CLOSED: { label: 'Fechada', color: '#6B7280', icon: <XCircle size={11} /> },
  FILLED: { label: 'Preenchida', color: '#0EA5E9', icon: <CheckCircle2 size={11} /> },
};

const isExternalLink = (s: string) => /^(https?:)?\/\//.test(s.trim());

const JobsBoardScreen = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | JobPostingStatus>('OPEN');

  const currentUserId = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.id || parsed?.userId || null;
    } catch {
      return null;
    }
  }, []);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs', statusFilter],
    queryFn: () =>
      listJobPostings(statusFilter === 'ALL' ? {} : { status: statusFilter }),
    staleTime: 30 * 1000,
  });

  const filtered = useMemo(() => {
    if (!jobs) return [];
    if (!search.trim()) return jobs;
    const term = search.toLowerCase();
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(term) ||
        j.description.toLowerCase().includes(term) ||
        j.author.name.toLowerCase().includes(term) ||
        j.group?.name.toLowerCase().includes(term),
    );
  }, [jobs, search]);

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteJobPosting(id),
    onSuccess: () => {
      toast.success('Vaga removida');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: () => toast.error('Falha ao remover vaga'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobPostingStatus }) =>
      updateJobPosting(id, { status }),
    onSuccess: () => {
      toast.success('Status atualizado');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: () => toast.error('Falha ao atualizar status'),
  });

  const heroActions = (
    <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
      <div className="relative w-full sm:w-64">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="text-gray-400" size={18} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar vaga..."
          className="h-11 w-full rounded-xl border border-gray-200 bg-surface-light py-2.5 pl-10 pr-4 text-sm text-gray-700 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-surface-darker dark:text-gray-200"
        />
      </div>
      <button
        onClick={() => navigate('/jobs/new')}
        className="flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-sky-500"
      >
        <Plus size={16} /> Publicar vaga
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHero
        icon={Briefcase}
        tagLabel="Mural aberto da comunidade"
        title="Vagas"
        description="Publique uma vaga ou descubra oportunidades. Qualquer pessoa pode postar — opcionalmente vinculada a um grupo."
        actionButtons={heroActions}
      />

      <div className="flex flex-wrap items-center gap-2">
        {(['ALL', 'OPEN', 'CLOSED', 'FILLED'] as const).map((opt) => {
          const isActive = statusFilter === opt;
          const label =
            opt === 'ALL' ? 'Todas' : statusMeta[opt as JobPostingStatus].label;
          return (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                isActive
                  ? 'border-primary bg-primary text-white shadow'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-white/5 dark:text-gray-400'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={200} className="rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={search ? 'Nenhuma vaga encontrada' : 'Nenhuma vaga publicada'}
          description={
            search
              ? `Sem resultados para "${search}".`
              : 'Seja o primeiro: publique uma vaga aberta para a comunidade.'
          }
          action={
            <button
              onClick={() => navigate('/jobs/new')}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-sky-500"
            >
              <Plus size={16} /> Publicar vaga
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isAuthor={currentUserId === job.authorId}
              onDelete={() => {
                if (window.confirm('Remover esta vaga?')) removeMutation.mutate(job.id);
              }}
              onChangeStatus={(status) =>
                updateStatusMutation.mutate({ id: job.id, status })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface JobCardProps {
  job: JobPosting;
  isAuthor: boolean;
  onDelete: () => void;
  onChangeStatus: (status: JobPostingStatus) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, isAuthor, onDelete, onChangeStatus }) => {
  const meta = statusMeta[job.status];
  const groupColor = job.group?.color || '#29B6F6';
  const isLink = isExternalLink(job.contact);

  return (
    <article className="flex flex-col rounded-2xl border border-gray-100 bg-surface-light p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800 dark:bg-surface-dark">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white"
              style={{ backgroundColor: meta.color }}
            >
              {meta.icon} {meta.label}
            </span>
            {job.group && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest"
                style={{ backgroundColor: `${groupColor}20`, color: groupColor }}
              >
                <FlaskConical size={9} /> {job.group.name}
              </span>
            )}
          </div>
          <h3 className="mt-2 line-clamp-2 text-base font-display font-bold text-secondary dark:text-white">
            {job.title}
          </h3>
        </div>
        {isAuthor && (
          <button
            onClick={onDelete}
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            aria-label="Remover vaga"
          >
            <Trash2 size={16} />
          </button>
        )}
      </header>

      <p className="mt-3 line-clamp-4 text-sm text-gray-600 dark:text-gray-400">
        {job.description}
      </p>

      <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
        {job.author.avatarUrl ? (
          <img
            src={job.author.avatarUrl}
            alt={job.author.name}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: job.author.avatarColor || '#29B6F6' }}
          >
            {job.author.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-gray-700 dark:text-gray-300">
            {job.author.name}
          </p>
          <p className="truncate text-[10px] text-gray-400">
            {new Date(job.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
            })}
          </p>
        </div>
      </div>

      <a
        href={isLink ? job.contact : `mailto:${job.contact}`}
        target={isLink ? '_blank' : undefined}
        rel={isLink ? 'noreferrer' : undefined}
        className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-primary py-2 text-xs font-black uppercase tracking-widest text-white transition-transform hover:scale-[1.02]"
      >
        {isLink ? <ExternalLink size={13} /> : <Mail size={13} />}
        Entrar em contato
      </a>

      {isAuthor && job.status === 'OPEN' && (
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => onChangeStatus('FILLED')}
            className="flex-1 rounded-lg border border-sky-200 bg-sky-50 py-1.5 text-[10px] font-black uppercase tracking-widest text-sky-700 transition hover:bg-sky-100 dark:border-sky-900/40 dark:bg-sky-500/10 dark:text-sky-300"
          >
            Preenchida
          </button>
          <button
            onClick={() => onChangeStatus('CLOSED')}
            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-white/5 dark:text-gray-400"
          >
            Fechar
          </button>
        </div>
      )}
      {isAuthor && job.status !== 'OPEN' && (
        <button
          onClick={() => onChangeStatus('OPEN')}
          className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-500/10 dark:text-emerald-300"
        >
          Reabrir
        </button>
      )}
    </article>
  );
};

export default JobsBoardScreen;
