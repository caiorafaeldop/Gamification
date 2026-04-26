import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Upload, Type, Hash, ArrowLeft, Rocket, LayoutGrid, Crown,
  Target, Loader, Check, Eye, Sparkles, FlaskConical
} from 'lucide-react';
import { createProject, uploadProjectCover, getProjectDetails, updateProject } from '../services/project.service';
import toast from 'react-hot-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { PageHero, SurfaceCard, SectionHeader } from '../components/ui';
import { useGroups } from '../hooks/useGroups';
import { useAuth } from '../hooks/useAuth';

const NewProjectScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Desenvolvimento',
    type: 'Interno',
    tags: '',
    maxMembers: 4,
    rewardPoints: 1500,
    coverUrl: '',
    visibility: 'PUBLIC_LIKE' as 'PRIVATE' | 'PUBLIC_VIEW' | 'PUBLIC_LIKE' | 'PUBLIC_OPEN',
    groupId: '' as string,
  });

  const { user } = useAuth();
  const { groups, loading: loadingGroups } = useGroups();

  const myGroups = useMemo(() => {
    if (!user?.id) return [];
    return groups.filter((g) =>
      (g.GroupMember || []).some((m: any) => m.userId === user.id)
    );
  }, [groups, user?.id]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingProject, setLoadingProject] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      setLoadingProject(true);
      try {
        const project = await getProjectDetails(id);
        
        // Security check: only leader or admin can edit
        const isLeader = project.leaderId === user?.id;
        const isAdmin = user?.role === 'ADMIN';

        if (!isLeader && !isAdmin) {
          toast.error('Você não tem permissão para editar este projeto.');
          navigate(`/project-details/${id}`);
          return;
        }

        setFormData({
          name: project.title || '',
          description: project.description || '',
          category: project.category || 'Desenvolvimento',
          type: (project as any).type || 'Interno',
          tags: (project as any).tags || '',
          maxMembers: project.maxMembers || 4,
          rewardPoints: project.rewardPoints || 1500,
          coverUrl: project.coverUrl || '',
          visibility: ((project as any).visibility === 'PUBLIC_VIEW' ? 'PUBLIC_LIKE' : (project as any).visibility) || 'PUBLIC_LIKE',
          groupId: (project as any).groupId || (project as any).Group?.id || '',
        });
      } catch (err: any) {
        toast.error('Erro ao carregar projeto');
        navigate('/projects');
      } finally {
        setLoadingProject(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.groupId) {
        toast.error('Selecione um grupo para o projeto.');
        return;
      }
      if (isEditing && id) {
        await updateProject(id, {
          title: formData.name,
          description: formData.description,
          category: formData.category,
          coverUrl: formData.coverUrl,
          visibility: formData.visibility,
          groupId: formData.groupId,
        });
        toast.success('Projeto atualizado com sucesso! ✓');
        navigate(`/project-details/${id}`);
      } else {
        await createProject({
          title: formData.name,
          description: formData.description,
          category: formData.category,
          type: formData.type,
          tags: formData.tags,
          coverUrl: formData.coverUrl,
          visibility: formData.visibility,
          groupId: formData.groupId,
        });
        toast.success('Projeto criado com sucesso! 🚀');
        navigate('/projects');
      }
    } catch (err: any) {
      toast.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} projeto: ` + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      try {
        const response = await uploadProjectCover(file);
        setFormData({ ...formData, coverUrl: response.url });
      } catch (error) {
        console.error('Error upload:', error);
        toast.error('Erro ao fazer upload da imagem.');
      } finally {
        setUploading(false);
      }
    }
  };

  if (loadingProject) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const submitForm = () => {
    const form = document.querySelector('form');
    if (form) form.requestSubmit();
  };

  return (
    <div className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHero
        icon={Rocket}
        tagLabel={
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/20"
          >
            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
            Voltar
          </button>
        }
        title={isEditing ? 'Editar Projeto' : 'Criar Novo Projeto'}
        description={
          isEditing
            ? 'Atualize as informações do seu projeto e mantenha sua equipe alinhada.'
            : 'Inicie uma nova jornada acadêmica. Defina objetivos claros e recrute sua equipe.'
        }
        actionButtons={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-400 dark:hover:bg-white/5"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={submitForm}
              disabled={loading || !formData.groupId}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? <Loader className="animate-spin" size={18} /> : (isEditing ? <Check size={18} /> : <Rocket size={18} />)}
              {isEditing ? 'Salvar Alterações' : 'Lançar Projeto'}
            </button>
          </div>
        }
      />

      <form className="grid grid-cols-1 gap-8 lg:grid-cols-3" onSubmit={handleSubmit}>
        <div className="space-y-6 lg:col-span-2">
          <SurfaceCard padding="lg">
            <SectionHeader
              icon={<Sparkles size={22} />}
              title="Informações Básicas"
              description="Conte o que o projeto faz e como ele aparece para outras pessoas."
            />

            <div className="mt-5 space-y-5">
              <div className="flex items-center gap-4 rounded-xl border border-primary/10 bg-primary/5 p-4 dark:bg-primary/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                  <Crown size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Líder do Projeto</p>
                  <p className="text-sm font-bold text-secondary dark:text-white">Você</p>
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <Type size={16} className="text-primary" /> Nome do Projeto
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                  placeholder="Ex: App de Realidade Aumentada para Biologia"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <Target size={16} className="text-primary" /> Objetivos do Projeto
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                  placeholder="Descreva os objetivos principais..."
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <LayoutGrid size={16} className="text-primary" /> Categoria
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger className="h-12 w-full border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-background-dark">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                      <SelectItem value="Design & UX">Design & UX</SelectItem>
                      <SelectItem value="Pesquisa Acadêmica">Pesquisa Acadêmica</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <Target size={16} className="text-primary" /> Tipo
                  </label>
                  <Select
                    value={formData.type}
                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                  >
                    <SelectTrigger className="h-12 w-full border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-background-dark">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Interno">Interno</SelectItem>
                      <SelectItem value="Extensão">Extensão</SelectItem>
                      <SelectItem value="Pesquisa">Pesquisa</SelectItem>
                      <SelectItem value="Empresa">Empresa</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <Hash size={16} className="text-primary" /> Tags
                  </label>
                  <input
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                    placeholder="react, python, ia..."
                  />
                </div>
              </div>
            </div>
          </SurfaceCard>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:h-max">
          <SurfaceCard padding="lg">
            <SectionHeader
              icon={<FlaskConical size={20} />}
              title="Grupo & Visibilidade"
              description="Vincule o projeto a um grupo e defina quem pode vê-lo."
            />
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <FlaskConical size={16} className="text-primary" /> Grupo <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.groupId || undefined}
                  onValueChange={(val) => setFormData({ ...formData, groupId: val })}
                  disabled={loadingGroups || myGroups.length === 0}
                >
                  <SelectTrigger className="h-12 w-full border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-background-dark">
                    <SelectValue
                      placeholder={
                        loadingGroups
                          ? 'Carregando grupos...'
                          : myGroups.length === 0
                            ? 'Você ainda não faz parte de nenhum grupo'
                            : 'Selecione um grupo'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {myGroups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/10 dark:ring-white/10"
                            style={{ backgroundColor: g.color || '#29B6F6' }}
                          />
                          <span>{g.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-gray-400">
                  {myGroups.length === 0 && !loadingGroups
                    ? 'Você precisa fazer parte de um grupo para criar projetos.'
                    : 'Todo projeto pertence a um grupo. Ele aparecerá nos espaços do grupo selecionado.'}
                </p>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <Eye size={16} className="text-primary" /> Visibilidade
                </label>
                <Select
                  value={formData.visibility === 'PUBLIC_VIEW' ? 'PUBLIC_LIKE' : formData.visibility}
                  onValueChange={(val) => setFormData({ ...formData, visibility: val as any })}
                >
                  <SelectTrigger className="h-12 w-full border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-background-dark">
                    <SelectValue placeholder="Selecione a visibilidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC_LIKE">Público</SelectItem>
                    <SelectItem value="PUBLIC_OPEN">Público e Aberto</SelectItem>
                    <SelectItem value="PRIVATE">Privado</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-gray-400">
                  {formData.visibility === 'PRIVATE'
                    ? 'O projeto não aparece na aba Projetos. Só os membros do grupo veem.'
                    : formData.visibility === 'PUBLIC_OPEN'
                      ? 'Aparece na aba Projetos. Qualquer um pode entrar com um clique — entra no projeto e no grupo.'
                      : 'Aparece na aba Projetos e recebe likes. Outros usuários podem solicitar entrada.'}
                </p>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard padding="lg">
            <SectionHeader
              icon={<Upload size={20} />}
              title="Capa do Projeto"
              description="A imagem que aparece no card e na landing."
            />
            <label className={`mt-5 flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 p-8 text-center transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-white/5 ${uploading ? 'pointer-events-none opacity-50' : ''} group relative`}>
              <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />

              {formData.coverUrl ? (
                <div className="absolute inset-0 h-full w-full">
                  <img src={formData.coverUrl} alt="Project Cover" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="font-bold text-white">Alterar Imagem</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 transition-transform group-hover:scale-110 dark:bg-sky-900/20">
                    {uploading ? <Loader size={20} className="animate-spin text-primary" /> : <Upload size={20} className="text-primary" />}
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{uploading ? 'Enviando...' : 'Clique para upload'}</p>
                  <p className="mt-1 text-xs text-gray-400">PNG, JPG até 5MB</p>
                </>
              )}
            </label>
          </SurfaceCard>
        </aside>
      </form>
    </div>
  );
};

export default NewProjectScreen;
