import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FlaskConical, Save, Users, BookOpen, Sparkles, Loader } from 'lucide-react';
import { useCreateGroup, useGroup, useUpdateGroup } from '../hooks/useGroups';
import { PageHero, SurfaceCard, SectionHeader, ColorPicker, LogoUpload } from '../components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Lock, Globe } from 'lucide-react';

const NewGroupScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup(id || '');
  const { group, loading: loadingGroup } = useGroup(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#29B6F6',
    logoUrl: '',
    isRestricted: false,
  });

  useEffect(() => {
    if (isEditing && group) {
      setFormData({
        name: group.name || '',
        description: group.description || '',
        color: group.color || '#29B6F6',
        logoUrl: group.logoUrl || '',
        isRestricted: group.isRestricted || false,
      });
    }
  }, [isEditing, group]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (isEditing && id) {
      await updateGroup.mutateAsync({
        name: formData.name.trim(),
        description: formData.description || undefined,
        color: formData.color,
        logoUrl: formData.logoUrl || undefined,
        isRestricted: formData.isRestricted,
      });
      navigate(`/groups/${id}`);
      return;
    }

    const group = await createGroup.mutateAsync({
      name: formData.name.trim(),
      description: formData.description || undefined,
      color: formData.color,
      logoUrl: formData.logoUrl || undefined,
      isRestricted: formData.isRestricted,
    });
    navigate(`/groups/${group.id}`);
  };

  const isPending = createGroup.isPending || updateGroup.isPending;

  if (isEditing && loadingGroup) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const previewColor = formData.color || '#29B6F6';

  return (
    <div className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHero
        icon={FlaskConical}
        tagLabel={
          <button
            onClick={() => navigate(isEditing && id ? `/groups/${id}` : '/groups')}
            className="group inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/20"
          >
            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
            Voltar
          </button>
        }
        title={isEditing ? 'Editar Grupo' : 'Novo Grupo'}
        description={
          isEditing
            ? 'Atualize a identidade visual e as informações do Conhecer.'
            : 'Defina a identidade visual e convide colegas. Projetos e integrantes poderão ser adicionados depois.'
        }
        actionButtons={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(isEditing && id ? `/groups/${id}` : '/groups')}
              className="rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-400 dark:hover:bg-white/5"
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                const form = document.querySelector('form');
                if (form) form.requestSubmit();
              }}
              disabled={isPending || !formData.name.trim()}
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50"
              style={{
                backgroundColor: previewColor,
                boxShadow: `0 10px 20px -10px ${previewColor}`,
              }}
            >
              {isPending ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
              {isEditing ? 'Salvar Alterações' : 'Salvar Grupo'}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
          <SurfaceCard padding="lg">
            <SectionHeader
              icon={<Sparkles size={22} />}
              title="Identidade"
              description="Nome e descrição aparecem no catálogo de grupos."
            />
            <div className="mt-5 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                  Nome do Grupo <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  required
                  placeholder="Ex: Laboratório de IA Aplicada"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                  Tipo de Grupo
                </label>
                <Select
                  value={formData.isRestricted ? 'restricted' : 'open'}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, isRestricted: val === 'restricted' }))}
                >
                  <SelectTrigger className="h-12 w-full border-slate-200 bg-slate-50 shadow-inner dark:border-slate-700 dark:bg-background-dark">
                    <SelectValue placeholder="Selecione o tipo de grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">
                      <div className="flex items-center gap-2">
                        <Globe size={16} className="text-green-500" /> Aberto (Qualquer um pode entrar)
                      </div>
                    </SelectItem>
                    <SelectItem value="restricted">
                      <div className="flex items-center gap-2">
                        <Lock size={16} className="text-amber-500" /> Restrito (Requer aprovação)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Conte sobre o propósito, áreas de pesquisa e o tipo de projetos que o grupo promove..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                />
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard padding="lg">
            <SectionHeader
              icon={<Sparkles size={22} />}
              title="Identidade Visual"
              description="Cor e logo definem como o grupo aparece no sistema e colorem a interface quando você navega por ele."
            />
            <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
              <ColorPicker
                value={formData.color}
                onChange={(color) => setFormData((prev) => ({ ...prev, color }))}
              />
              <LogoUpload
                value={formData.logoUrl || undefined}
                onChange={(url) => setFormData((prev) => ({ ...prev, logoUrl: url || '' }))}
                color={formData.color}
              />
            </div>
          </SurfaceCard>

        </form>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:h-max">
          <SurfaceCard padding="none" className="overflow-hidden">
            <div className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Preview em tempo real</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Veja como o card do grupo aparecerá.
              </p>
            </div>
            <div className="px-4 pb-4">
              <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm dark:border-gray-800">
                <div
                  className="relative h-28 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${previewColor} 0%, ${previewColor}CC 100%)`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                    }}
                  />
                  <div className="absolute -bottom-6 left-4">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border-4 border-surface-light bg-surface-light shadow-lg dark:border-surface-dark dark:bg-surface-dark">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center text-white"
                          style={{ backgroundColor: previewColor }}
                        >
                          <FlaskConical size={20} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-surface-light px-4 pb-4 pt-8 dark:bg-surface-dark">
                  <h4 className="text-base font-display font-bold text-secondary dark:text-white flex items-center justify-between">
                    <span className="truncate">{formData.name || 'Nome do Grupo'}</span>
                    {formData.isRestricted && <Lock size={14} className="text-amber-500 shrink-0" />}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                    {formData.description || 'A descrição do grupo aparecerá aqui...'}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users size={12} style={{ color: previewColor }} /> 1 membro
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={12} style={{ color: previewColor }} /> 0 projetos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SurfaceCard>
        </aside>
      </div>
    </div>
  );
};

export default NewGroupScreen;
