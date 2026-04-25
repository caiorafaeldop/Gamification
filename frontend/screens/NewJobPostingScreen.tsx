import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, ArrowLeft, FlaskConical } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGroups } from '../hooks/useGroups';
import { createJobPosting } from '../services/jobPosting.service';
import { PageHero } from '../components/ui';

const NewJobPostingScreen = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { groups, loading: loadingGroups } = useGroups();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [groupId, setGroupId] = useState<string>('');

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
      (g.GroupMember || []).some((m) => m.userId === currentUserId),
    );
  }, [groups, currentUserId]);

  const mutation = useMutation({
    mutationFn: () =>
      createJobPosting({
        title,
        description,
        contact,
        groupId: groupId || null,
      }),
    onSuccess: () => {
      toast.success('Vaga publicada!');
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

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">
      <button
        onClick={() => navigate('/jobs')}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-primary"
      >
        <ArrowLeft size={16} /> Voltar para vagas
      </button>

      <PageHero
        icon={Briefcase}
        tagLabel="Nova publicação"
        title="Publicar vaga"
        description="Conte para a comunidade sobre a oportunidade. Você pode opcionalmente vincular a vaga a um dos seus grupos."
      />

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-gray-100 bg-surface-light p-6 shadow-sm dark:border-gray-800 dark:bg-surface-dark"
      >
        <Field label="Título *" hint="Resuma a oportunidade em uma linha.">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="Ex: Procuro dev React para projeto de portfólio"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-surface-darker"
            required
          />
        </Field>

        <Field label="Descrição *" hint="Detalhe responsabilidades, perfil esperado e contexto.">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Descreva o que você precisa, escopo, dedicação esperada..."
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-surface-darker"
            required
          />
        </Field>

        <Field label="Contato *" hint="E-mail, link do LinkedIn ou WhatsApp.">
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            maxLength={300}
            placeholder="seu@email.com ou https://wa.me/55..."
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-surface-darker"
            required
          />
        </Field>

        <Field
          label="Vincular a um grupo (opcional)"
          hint="Apenas grupos dos quais você é membro aparecem aqui."
        >
          {loadingGroups ? (
            <div className="text-sm text-gray-400">Carregando grupos...</div>
          ) : myGroups.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:bg-white/5">
              Você ainda não é membro de nenhum grupo. A vaga será publicada sem
              vínculo.
            </div>
          ) : (
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-surface-darker"
            >
              <option value="">— Sem vínculo (vaga pessoal)</option>
              {myGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          )}
          {groupId && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <FlaskConical size={12} />
              Vinculada a {myGroups.find((g) => g.id === groupId)?.name}
            </div>
          )}
        </Field>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white shadow transition-all hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? 'Publicando...' : 'Publicar vaga'}
          </button>
        </div>
      </form>
    </div>
  );
};

const Field: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <div>
    <label className="mb-1 block text-sm font-bold text-secondary dark:text-white">
      {label}
    </label>
    {hint && <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    {children}
  </div>
);

export default NewJobPostingScreen;
