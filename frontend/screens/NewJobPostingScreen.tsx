import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, ArrowLeft, Users, Info, Check, Sparkles, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGroups } from '../hooks/useGroups';
import { createJobPosting } from '../services/jobPosting.service';
import { PageHero, SurfaceCard, SectionHeader } from '../components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';

const NewJobPostingScreen = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { groups, loading: loadingGroups } = useGroups();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [groupId, setGroupId] = useState<string>('none');

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

  const myGroups = useMemo(() => {
    if (!currentUserId) return [];
    return groups.filter((g) =>
      (g.GroupMember || []).some((m: any) => m.userId === currentUserId),
    );
  }, [groups, currentUserId]);

  const mutation = useMutation({
    mutationFn: () =>
      createJobPosting({
        title,
        description,
        contact,
        groupId: groupId === 'none' ? null : groupId,
      }),
    onSuccess: () => {
      toast.success('Vaga publicada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      navigate('/jobs');
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || 'Erro ao publicar vaga.'),
  });

  const canSubmit =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    contact.trim().length > 0 &&
    !mutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    mutation.mutate();
  };

  const submitForm = () => {
    const form = document.getElementById('new-job-form') as HTMLFormElement;
    if (form) form.requestSubmit();
  };

  return (
    <div className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHero
        icon={Briefcase}
        tagLabel={
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/20"
          >
            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
            Voltar
          </button>
        }
        title="Publicar Nova Vaga"
        description="Divulgue uma oportunidade para a comunidade acadêmica. Defina claramente o que você precisa."
        actionButtons={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-400 dark:hover:bg-white/5"
              disabled={mutation.isPending}
            >
              Cancelar
            </button>
            <button
              onClick={submitForm}
              disabled={!canSubmit}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {mutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Check size={18} />
              )}
              {mutation.isPending ? 'Publicando...' : 'Publicar Vaga'}
            </button>
          </div>
        }
      />

      <form id="new-job-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          <SurfaceCard padding="lg">
            <SectionHeader
              icon={<Sparkles size={22} />}
              title="Detalhes da Vaga"
              description="Informações básicas sobre a oportunidade."
            />

            <div className="mt-6 space-y-6">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  Título da Oportunidade
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  placeholder="Ex: Procuramos UI Designer para Projeto de IC"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  Descrição Completa
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Detalhe o contexto, requisitos, tecnologias utilizadas e carga horária..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    Forma de Contato
                  </label>
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    maxLength={300}
                    placeholder="E-mail, link do Forms, WhatsApp..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    Vincular a um Grupo
                  </label>
                  {loadingGroups ? (
                    <div className="flex h-12 w-full animate-pulse items-center rounded-xl bg-slate-100 px-4 dark:bg-surface-darker">
                      <span className="text-sm text-slate-400">Carregando...</span>
                    </div>
                  ) : myGroups.length === 0 ? (
                    <div className="flex h-12 w-full items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 dark:border-slate-700 dark:bg-surface-darker">
                      <span className="text-sm text-slate-500">Nenhum grupo disponível</span>
                    </div>
                  ) : (
                    <Select value={groupId} onValueChange={(val) => setGroupId(val)}>
                      <SelectTrigger className="h-12 w-full border-slate-200 bg-slate-50 shadow-inner dark:border-slate-700 dark:bg-background-dark">
                        <SelectValue placeholder="Selecione um grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— Vaga Pessoal (Sem vínculo)</SelectItem>
                        {myGroups.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>
          </SurfaceCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <SurfaceCard padding="md" className="border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10">
            <h4 className="mb-3 flex items-center gap-2 font-bold text-blue-800 dark:text-blue-300">
              <Info size={18} className="text-blue-600 dark:text-blue-400" />
              Dicas Importantes
            </h4>
            <ul className="space-y-3 text-sm text-blue-900/70 dark:text-blue-200/70">
              <li className="flex items-start gap-2">
                <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400"></span>
                Especifique a carga horária se for um projeto de laboratório.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400"></span>
                Seja muito claro quanto aos pré-requisitos essenciais.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400"></span>
                Informe se a vaga oferece bolsa, certificado ou se é voluntária.
              </li>
            </ul>
          </SurfaceCard>

          <SurfaceCard padding="md">
            <h4 className="mb-3 flex items-center gap-2 font-bold text-secondary dark:text-white">
              <Users size={18} className="text-primary" />
              Impacto dos Grupos
            </h4>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Vincular a vaga a um grupo a fará aparecer na página oficial dele, fortalecendo a credibilidade da oportunidade e alcançando talentos mais focados na sua área.
            </p>
          </SurfaceCard>
        </div>
      </form>
    </div>
  );
};

export default NewJobPostingScreen;
