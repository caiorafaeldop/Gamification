import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  GitBranch,
  HelpCircle,
  LayoutGrid,
  ListTodo,
  LockKeyhole,
  Milestone,
  Pencil,
  PlayCircle,
  Plus,
  Rocket,
  Save,
  Trash2,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useProjectDetails } from '../hooks/useProjects';
import { useProfile } from '../hooks/useProfile';
import {
  createProjectVersion,
  deleteProjectVersion,
  getProjectVersions,
  ProjectVersion,
  ProjectVersionStatus,
  updateProjectVersion,
} from '../services/project.service';
import { getProjectKanban, updateTask } from '../services/task.service';
import { EmptyState, SectionHeader, SurfaceCard } from '../components/ui';
import { Skeleton } from '../components/Skeleton';
import ProjectDetailsScreen from './ProjectDetailsScreen';
import TaskModal from '../components/TaskModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';

type TabId = 'versions' | 'backlog' | 'board' | 'help';

interface ProjectWorkspaceScreenProps {
  defaultTab?: TabId;
}

const TABS: Array<{ id: TabId; label: string; icon: any }> = [
  { id: 'versions', label: 'Versões', icon: Milestone },
  { id: 'backlog', label: 'Backlog', icon: ListTodo },
  { id: 'board', label: 'Quadros', icon: LayoutGrid },
];

const VERSION_STATUS_LABELS: Record<ProjectVersionStatus, string> = {
  PLANNED: 'Planejada',
  IN_PROGRESS: 'Em andamento',
  LOCKED: 'Fechada',
  RELEASED: 'Lançada',
  ARCHIVED: 'Arquivada',
};

const VERSION_STATUS_STYLES: Record<ProjectVersionStatus, string> = {
  PLANNED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  IN_PROGRESS: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  LOCKED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  RELEASED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  ARCHIVED: 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
};

const STATUS_ICON: Record<ProjectVersionStatus, any> = {
  PLANNED: CircleDashed,
  IN_PROGRESS: PlayCircle,
  LOCKED: LockKeyhole,
  RELEASED: Rocket,
  ARCHIVED: Trash2,
};

const emptyVersionForm = {
  name: '',
  description: '',
  status: 'PLANNED' as ProjectVersionStatus,
  startDate: '',
  dueDate: '',
};

const toDateInput = (value?: string | null) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

const toIsoOrNull = (value: string) => (value ? new Date(`${value}T12:00:00`).toISOString() : null);

const formatDate = (value?: string | null) => {
  if (!value) return 'Sem prazo';
  return new Date(value).toLocaleDateString('pt-BR');
};

const getVersionProgress = (version?: ProjectVersion | null) => {
  const tasks = version?.tasks || [];
  const total = version?._count?.tasks ?? tasks.length;
  const done = tasks.filter((task) => task.completedAt || task.status === 'done').length;
  return {
    total,
    done,
    open: Math.max(total - done, 0),
    percent: total > 0 ? Math.round((done / total) * 100) : 0,
  };
};

const pickDefaultVersion = (items: ProjectVersion[]) => {
  return (
    items.find((version) => version.status === 'IN_PROGRESS') ||
    items.find((version) => version.status === 'PLANNED') ||
    items.find((version) => version.status === 'LOCKED') ||
    items.find((version) => version.status === 'RELEASED') ||
    items[0]
  );
};

const getTaskCode = (taskId: string) => {
  let hash = 0;
  for (let i = 0; i < taskId.length; i++) {
    hash = taskId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const code = Math.abs(hash) % 100000;
  return `#${String(code).padStart(5, '0')}`;
};

const ProjectWorkspaceScreen: React.FC<ProjectWorkspaceScreenProps> = ({ defaultTab = 'versions' }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { project, loading: loadingProject, refetch: refetchProject } = useProjectDetails(id!);
  const { data: user } = useProfile();
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [loadingVersions, setLoadingVersions] = useState(true);
  const [boardColumns, setBoardColumns] = useState<any[]>([]);
  const [loadingBacklog, setLoadingBacklog] = useState(true);
  const [backlogFilter, setBacklogFilter] = useState('all');

  const [form, setForm] = useState(emptyVersionForm);
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [savingVersion, setSavingVersion] = useState(false);
  const [showVersionForm, setShowVersionForm] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [taskModalInitialVersionId, setTaskModalInitialVersionId] = useState<string | undefined>(undefined);

  const projectAny = project as any;
  const canManageVersions = !!user && (
    user.role === 'ADMIN' ||
    projectAny?.leaderId === user.id ||
    projectAny?.leader?.id === user.id
  );

  const refreshVersions = async () => {
    if (!id) return;
    setLoadingVersions(true);
    try {
      const data = await getProjectVersions(id);
      setVersions(data);
      setSelectedVersionId((current) => {
        if (current && data.some((version) => version.id === current)) return current;
        return pickDefaultVersion(data)?.id || '';
      });
    } catch (error) {
      console.error('Failed to load versions', error);
      toast.error('Erro ao carregar versões.');
    } finally {
      setLoadingVersions(false);
    }
  };

  const refreshBacklog = async () => {
    if (!id) return;
    setLoadingBacklog(true);
    try {
      setBoardColumns(await getProjectKanban(id, 'all'));
    } catch (error) {
      console.error('Failed to load backlog', error);
      toast.error('Erro ao carregar backlog.');
    } finally {
      setLoadingBacklog(false);
    }
  };

  useEffect(() => {
    refreshVersions();
    refreshBacklog();
  }, [id]);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, id]);

  const allTasks = useMemo(() => (
    boardColumns.flatMap((column) =>
      (column.tasks || []).map((task: any) => ({ ...task, columnTitle: column.title }))
    )
  ), [boardColumns]);

  const selectedVersion = useMemo(
    () => versions.find((version) => version.id === selectedVersionId) || pickDefaultVersion(versions),
    [selectedVersionId, versions],
  );

  const selectedVersionTasks = useMemo(() => {
    if (!selectedVersion) return [];
    return allTasks.filter((task: any) => task.versionId === selectedVersion.id);
  }, [allTasks, selectedVersion]);

  const activeVersions = useMemo(
    () => versions.filter((version) => version.status !== 'ARCHIVED'),
    [versions],
  );

  const sortedVersions = useMemo(() => {
    return [...versions].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [versions]);

  const unversionedTasks = useMemo(
    () => allTasks.filter((task: any) => !task.versionId),
    [allTasks],
  );

  const filteredBacklogTasks = useMemo(() => {
    if (backlogFilter === 'all') return allTasks;
    if (backlogFilter === 'unversioned') return unversionedTasks;
    return allTasks.filter((task: any) => task.versionId === backlogFilter);
  }, [allTasks, backlogFilter, unversionedTasks]);

  const selectedProgress = getVersionProgress(selectedVersion);
  const completedTasks = projectAny?.stats?.tasksCompleted ?? allTasks.filter((task: any) => task.completedAt || task.status === 'done').length;
  const totalTasks = projectAny?.stats?.tasksCount ?? allTasks.length;
  const projectProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const resetVersionForm = () => {
    setEditingVersionId(null);
    setForm(emptyVersionForm);
  };

  const startEditVersion = (version: ProjectVersion) => {
    setActiveTab('versions');
    setEditingVersionId(version.id);
    setSelectedVersionId(version.id);
    setForm({
      name: version.name,
      description: version.description || '',
      status: version.status,
      startDate: toDateInput(version.startDate),
      dueDate: toDateInput(version.dueDate),
    });
  };

  const submitVersion = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id || !form.name.trim()) return;
    setSavingVersion(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      status: form.status,
      startDate: toIsoOrNull(form.startDate),
      dueDate: toIsoOrNull(form.dueDate),
    };

    try {
      if (editingVersionId) {
        const updated = await updateProjectVersion(id, editingVersionId, payload);
        setSelectedVersionId(updated.id);
        toast.success('Versão atualizada.');
      } else {
        const created = await createProjectVersion(id, payload);
        setSelectedVersionId(created.id);
        toast.success('Versão criada.');
      }

      resetVersionForm();
      await Promise.all([refreshVersions(), refreshBacklog(), refetchProject()]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar versão.');
    } finally {
      setSavingVersion(false);
    }
  };

  const removeVersion = async (version: ProjectVersion) => {
    if (!id) return;
    if (!confirm(`Excluir a versão "${version.name}"? As tarefas voltam para triagem sem versão.`)) return;

    try {
      await deleteProjectVersion(id, version.id);
      toast.success('Versão excluída.');
      if (selectedVersionId === version.id) setSelectedVersionId('');
      await Promise.all([refreshVersions(), refreshBacklog(), refetchProject()]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao excluir versão.');
    }
  };

  if (loadingProject) {
    return (
      <div className="mx-auto max-w-[1480px] space-y-5 p-4 sm:p-6 lg:p-8">
        <Skeleton height={96} className="rounded-2xl" />
        <Skeleton height={180} className="rounded-2xl" />
        <Skeleton height={420} className="rounded-2xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-[1480px] p-4 sm:p-6 lg:p-8">
        <EmptyState
          icon={ClipboardList}
          title="Projeto não encontrado"
          description="O projeto pode ter sido removido ou você pode não ter acesso."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1480px] space-y-5 p-4 sm:p-6 lg:p-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <button
              onClick={() => navigate('/projects')}
              className="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:text-sky-500"
            >
              <ArrowLeft size={12} /> Projetos
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-display text-2xl font-black text-secondary dark:text-white lg:text-3xl">
                {project.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold transition-colors ${activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-300 dark:hover:bg-white/5'
                  }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {activeTab === 'versions' && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* Coluna da Esquerda (Conteúdo Central da Versão) */}
          <div className="space-y-5">
            <SurfaceCard padding="lg">
              {loadingVersions ? (
                <Skeleton height={150} className="rounded-xl" />
              ) : selectedVersion ? (
                <>
                  <div className="mt-2">
                    <h2 className="font-display text-2xl font-black text-secondary dark:text-white">
                      {selectedVersion.name}
                    </h2>
                    {selectedVersion.description && (
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {selectedVersion.description}
                      </p>
                    )}
                  </div>

                  {/* Tarefas da Versão */}
                  <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-base font-bold text-secondary dark:text-white flex items-center gap-2">
                        <ListTodo size={16} className="text-primary" />
                        Tarefas desta versão ({selectedVersionTasks.length})
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setTaskModalInitialVersionId(selectedVersion.id);
                          setTaskToEdit(null);
                          setIsTaskModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-sky-500 shadow-sm"
                      >
                        <Plus size={12} /> Nova tarefa
                      </button>
                    </div>

                    {selectedVersionTasks.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center border border-dashed border-slate-200 rounded-xl dark:border-slate-800">
                        Nenhuma tarefa criada para esta versão ainda. Clique em "+ Nova tarefa" para começar!
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 dark:border-slate-800/60">
                            <tr>
                              <th className="py-2 pr-4">Título</th>
                              <th className="py-2 pr-4">Responsáveis</th>
                              <th className="py-2 pr-4">Coluna/Status</th>
                              <th className="py-2 text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                            {selectedVersionTasks.map((task: any) => (
                              <tr key={task.id} className="text-slate-700 dark:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-white/5">
                                <td className="py-2.5 pr-4 font-semibold">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTaskToEdit(task);
                                      setTaskModalInitialVersionId(selectedVersion.id);
                                      setIsTaskModalOpen(true);
                                    }}
                                    className="hover:text-primary transition-colors text-left"
                                  >
                                    {task.title}
                                  </button>
                                </td>
                                <td className="py-2.5 pr-4">
                                  {task.assignees?.length
                                    ? task.assignees.map((a: any) => a.user?.name).filter(Boolean).join(', ')
                                    : task.assignedTo?.name || '-'}
                                </td>
                                <td className="py-2.5 pr-4">
                                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${task.completedAt
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                                    }`}>
                                    {task.completedAt ? 'Concluída' : task.columnTitle || task.status}
                                  </span>
                                </td>
                                <td className="py-2.5 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTaskToEdit(task);
                                      setTaskModalInitialVersionId(selectedVersion.id);
                                      setIsTaskModalOpen(true);
                                    }}
                                    className="p-1 text-slate-400 hover:text-primary rounded"
                                    title="Editar tarefa"
                                  >
                                    <Pencil size={12} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={Milestone}
                  title="Crie a primeira versão"
                  description="Sem versão, o quadro fica solto. Comece definindo a próxima entrega no painel ao lado."
                />
              )}
            </SurfaceCard>
          </div>

          {/* Coluna da Direita (Lista de Versões e Formulário Inline) */}
          <SurfaceCard padding="sm" className="h-max max-h-[700px] overflow-y-auto">
            {showVersionForm && canManageVersions ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-sm font-black text-secondary dark:text-white">
                    {editingVersionId ? 'Editar versão' : 'Nova versão'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      resetVersionForm();
                      setShowVersionForm(false);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold"
                  >
                    Voltar
                  </button>
                </div>
                <form className="space-y-3" onSubmit={async (e) => {
                  await submitVersion(e);
                  setShowVersionForm(false);
                }}>
                  <InputField label="Nome da versão" value={form.name} onChange={(value) => setForm({ ...form, name: value })} placeholder="Ex: 1.0.0" required />
                  <div>
                    <label className="mb-0.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Objetivo</label>
                    <textarea
                      value={form.description}
                      onChange={(event) => setForm({ ...form, description: event.target.value })}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs dark:border-slate-700 dark:bg-background-dark dark:text-white"
                      placeholder="Objetivo da versão"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={savingVersion || !form.name.trim()}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white shadow-md transition-colors hover:bg-sky-500 disabled:opacity-50"
                    >
                      <Save size={12} /> {savingVersion ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-3">
                {canManageVersions && (
                  <button
                    type="button"
                    onClick={() => {
                      resetVersionForm();
                      setShowVersionForm(true);
                    }}
                    className="inline-flex w-full h-9 items-center justify-center gap-1.5 rounded-lg bg-primary text-xs font-bold text-white shadow-sm transition-colors hover:bg-sky-500"
                  >
                    <Plus size={14} /> Nova Versão
                  </button>
                )}

                <div className="border-t border-slate-100 pt-2 dark:border-slate-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Versões</p>
                  {loadingVersions ? (
                    <div className="space-y-1">
                      <Skeleton height={28} className="rounded" />
                      <Skeleton height={28} className="rounded" />
                      <Skeleton height={28} className="rounded" />
                    </div>
                  ) : sortedVersions.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2 text-center">Nenhuma versão cadastrada.</p>
                  ) : (
                    <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                      {sortedVersions.map((version) => (
                        <div
                          key={version.id}
                          onClick={() => setSelectedVersionId(version.id)}
                          className={`flex items-center justify-between rounded-lg p-2 transition-colors cursor-pointer text-xs ${selectedVersion?.id === version.id
                              ? 'bg-primary/10 border border-primary/20 text-primary font-bold'
                              : 'hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent text-slate-600 dark:text-slate-300'
                            }`}
                        >
                          <span className="truncate pr-2">{version.name}</span>
                          {canManageVersions && selectedVersion?.id === version.id && (
                            <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => {
                                  startEditVersion(version);
                                  setShowVersionForm(true);
                                }}
                                className="p-0.5 text-slate-400 hover:text-primary transition-colors"
                                title="Editar"
                              >
                                <Pencil size={11} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeVersion(version)}
                                className="p-0.5 text-slate-400 hover:text-red-600 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </SurfaceCard>
        </div>
      )}

      {activeTab === 'backlog' && (
        <SurfaceCard padding="lg">
          <SectionHeader
            icon={<ListTodo size={20} />}
            title="Backlog do projeto"
            action={
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTaskModalInitialVersionId(undefined);
                    setTaskToEdit(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-white shadow-md shadow-primary/20 transition-colors hover:bg-sky-500"
                >
                  <Plus size={15} /> Criar tarefa
                </button>
                <Select
                  value={backlogFilter}
                  onValueChange={(val) => setBacklogFilter(val)}
                >
                  <SelectTrigger className="h-10 w-48 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-300">
                    <SelectValue placeholder="Todas as tarefas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as tarefas</SelectItem>
                    {sortedVersions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        {version.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="unversioned">Sem versão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }
          />

          {unversionedTasks.length > 0 && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <p>
                Há tarefas sem versão. Elas continuam visíveis aqui, mas não deveriam ser o fluxo normal de trabalho.
              </p>
            </div>
          )}

          <div className="mt-5 overflow-x-auto">
            {loadingBacklog ? (
              <Skeleton height={220} className="rounded-xl" />
            ) : filteredBacklogTasks.length === 0 ? (
              <EmptyState icon={ListTodo} title="Nada para triar neste filtro" description="Quando surgirem tarefas sem versão, elas aparecerão aqui primeiro." />
            ) : (
              <table className="w-full min-w-[820px] text-left text-sm text-slate-700 dark:text-slate-300">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-widest text-slate-400 dark:border-slate-800">
                  <tr>
                    <th className="py-1.5 pr-4">Código</th>
                    <th className="py-1.5 pr-4 w-[450px]">Tarefa</th>
                    <th className="py-1.5 pr-4">Versão Alvo</th>
                    <th className="py-1.5 pr-4">Status</th>
                    <th className="py-1.5 pr-4">Responsáveis</th>
                    <th className="py-1.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredBacklogTasks.map((task: any) => (
                    <tr key={task.id} className="text-slate-700 dark:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-white/5">
                      <td className="py-1.5 pr-4 font-mono text-xs text-slate-400">
                        {getTaskCode(task.id)}
                      </td>
                      <td className="py-1.5 pr-4 w-[450px]">
                        <button
                          type="button"
                          onClick={() => {
                            setTaskToEdit(task);
                            setTaskModalInitialVersionId(task.versionId);
                            setIsTaskModalOpen(true);
                          }}
                          className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors text-left text-xs"
                        >
                          {task.title}
                        </button>
                      </td>
                      <td className="py-1.5 pr-4 text-xs text-slate-700 dark:text-slate-300">
                        {task.version?.name || versions.find((v: any) => v.id === task.versionId)?.name || 'Sem versão'}
                      </td>
                      <td className="py-1.5 pr-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${task.completedAt
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                          }`}>
                          {task.completedAt ? 'Concluída' : task.columnTitle || task.status}
                        </span>
                      </td>
                      <td className="py-1.5 pr-4 text-xs">
                        {task.assignees?.length
                          ? task.assignees.map((a: any) => a.user?.name).filter(Boolean).join(', ')
                          : task.assignedTo?.name || 'Sem responsável'}
                      </td>
                      <td className="py-1.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setTaskToEdit(task);
                            setTaskModalInitialVersionId(task.versionId);
                            setIsTaskModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-primary rounded transition-colors"
                          title="Editar tarefa"
                        >
                          <Pencil size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </SurfaceCard>
      )}

      {activeTab === 'board' && (
        <div className="-mx-4 -mb-8 min-h-[720px] overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-surface-dark sm:-mx-6 lg:-mx-8">
          <ProjectDetailsScreen initialVersionFilter={selectedVersionId || selectedVersion?.id} />
        </div>
      )}

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setTaskToEdit(null);
            setTaskModalInitialVersionId(undefined);
          }}
          onSuccess={() => {
            refreshBacklog();
            refreshVersions();
          }}
          projectId={id}
          initialVersionId={taskModalInitialVersionId}
          task={taskToEdit}
          projectMembers={project?.members}
        />
      )}
    </div>
  );
};

const VersionStatusBadge = ({ status }: { status: ProjectVersionStatus }) => {
  const Icon = STATUS_ICON[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${VERSION_STATUS_STYLES[status]}`}>
      <Icon size={12} />
      {VERSION_STATUS_LABELS[status]}
    </span>
  );
};

const VersionCard = ({
  version,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: {
  version: ProjectVersion;
  selected: boolean;
  onSelect: () => void;
  onEdit?: (version: ProjectVersion) => void;
  onDelete?: (version: ProjectVersion) => void;
}) => {
  const progress = getVersionProgress(version);

  return (
    <article
      className={`rounded-xl border p-4 transition-colors ${selected
          ? 'border-primary bg-primary/5 dark:bg-primary/10'
          : 'border-slate-200 bg-white hover:border-primary/40 dark:border-slate-800 dark:bg-surface-dark'
        }`}
    >
      <button type="button" onClick={onSelect} className="block w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-secondary dark:text-white">{version.name}</h3>
            <p className="mt-1 line-clamp-2 min-h-[40px] text-sm text-slate-500 dark:text-slate-400">
              {version.description || 'Sem objetivo descrito.'}
            </p>
          </div>
          <VersionStatusBadge status={version.status} />
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress.percent}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>{progress.done}/{progress.total} tarefas</span>
          <span><Calendar size={12} className="mr-1 inline" />{formatDate(version.dueDate)}</span>
        </div>
      </button>

      {(onEdit || onDelete) && (
        <div className="mt-4 flex gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(version)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-white/5"
            >
              <Pencil size={13} /> Editar
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(version)}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20"
            >
              <Trash2 size={13} /> Excluir
            </button>
          )}
        </div>
      )}
    </article>
  );
};

const InputField = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) => (
  <div>
    <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">{label}</label>
    <input
      type={type}
      value={value}
      required={required}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium dark:border-slate-700 dark:bg-background-dark dark:text-white"
    />
  </div>
);

const ProjectHelpTab = () => (
  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
    <HelpSection
      icon={GitBranch}
      title="Nova regra da casa"
      items={[
        'Projeto é o objetivo maior; versão é a entrega controlável.',
        'Tarefa nova deve nascer com versão alvo sempre que existir uma versão ativa.',
        'Sem versão significa triagem, não execução principal.',
        'O quadro mostra fluxo diário, mas a governança fica nas versões.',
      ]}
    />
    <HelpSection
      icon={Milestone}
      title="Ciclo de uma versão"
      items={[
        'Planejada: escopo aberto para montar a entrega.',
        'Em andamento: equipe executando no quadro.',
        'Fechada: entrada controlada, foco em finalizar.',
        'Lançada ou arquivada: entrega encerrada e histórico preservado.',
      ]}
    />
    <HelpSection
      icon={ListTodo}
      title="Triagem"
      items={[
        'Use a triagem para demandas novas, dúvidas e itens ainda sem compromisso.',
        'Antes de executar, mova a tarefa para uma versão alvo.',
        'A contagem de sem versão é um sinal de bagunça para resolver.',
        'Demandas soltas podem existir, mas não devem governar o projeto.',
      ]}
    />
    <HelpSection
      icon={Users}
      title="Papéis"
      items={[
        'Líder e admin mantêm roadmap, status e prioridade.',
        'Membros executam tarefas dentro da versão ativa.',
        'Comentários e anexos continuam na tarefa.',
        'A visão executiva vem do progresso por versão, não só do kanban.',
      ]}
    />
  </div>
);

const HelpSection = ({ icon: Icon, title, items }: { icon: any; title: string; items: string[] }) => (
  <SurfaceCard padding="lg">
    <SectionHeader icon={<Icon size={20} />} title={title} />
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={16} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </SurfaceCard>
);

export default ProjectWorkspaceScreen;
