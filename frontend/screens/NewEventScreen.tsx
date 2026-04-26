import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Calendar, Clock, MapPin, Type, AlignLeft, ArrowLeft, Rocket, Tag, Loader, Check, Sparkles,
} from 'lucide-react';
import { createEvent, updateEvent, getEventById } from '../services/event.service';
import toast from 'react-hot-toast';
import { PageHero, SurfaceCard, SectionHeader } from '../components/ui';

const EVENT_TYPES = [
    { id: 'MEETING', label: 'Reunião', color: 'blue' },
    { id: 'WORKSHOP', label: 'Workshop', color: 'purple' },
    { id: 'EVENT', label: 'Evento', color: 'yellow' },
];

const NewEventScreen = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        type: 'MEETING',
        date: '',
        time: '',
        endTime: '',
        location: '',
        description: '',
    });

    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            setLoading(true);
            getEventById(id)
                .then((event) => {
                    const eventDate = new Date(event.date);
                    setFormData({
                        title: event.title,
                        type: event.type,
                        date: eventDate.toISOString().split('T')[0],
                        time: event.time,
                        endTime: '',
                        location: event.location || '',
                        description: event.description || '',
                    });
                })
                .catch(() => {
                    toast.error('Evento não encontrado.');
                    navigate('/activities');
                })
                .finally(() => setLoading(false));
        }
    }, [id, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.date || !formData.time) {
            toast.error('Preencha os campos obrigatórios: Título, Data e Horário.');
            return;
        }

        setSubmitting(true);

        try {
            const eventData = {
                title: formData.title,
                type: formData.type as 'MEETING' | 'WORKSHOP' | 'EVENT',
                date: formData.date,
                time: formData.time,
                location: formData.location || undefined,
                description: formData.description || undefined,
            };

            if (isEditing && id) {
                await updateEvent(id, eventData);
                toast.success('Evento atualizado com sucesso! ✅');
            } else {
                await createEvent(eventData);
                toast.success('Evento criado com sucesso! 🎉');
            }
            navigate('/activities');
        } catch (err: any) {
            toast.error(err.response?.data?.message || `Erro ao ${isEditing ? 'atualizar' : 'criar'} evento.`);
        } finally {
            setSubmitting(false);
        }
    };

    const getTypeColor = (typeId: string) => {
        switch (typeId) {
            case 'MEETING': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'WORKSHOP': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
            case 'EVENT': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center p-10">
                <Loader className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1480px] space-y-8 p-4 sm:p-6 lg:p-8">
            <PageHero
                icon={Calendar}
                tagLabel={
                    <button
                        onClick={() => navigate(-1)}
                        className="group inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/20"
                    >
                        <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
                        Voltar
                    </button>
                }
                title={isEditing ? 'Editar Evento' : 'Criar Novo Evento'}
                description={
                    isEditing
                        ? 'Atualize as informações do evento.'
                        : 'Organize reuniões, workshops e eventos para a comunidade Connecta.'
                }
                actionButtons={
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-400 dark:hover:bg-white/5"
                            disabled={submitting}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                const form = document.querySelector('form');
                                if (form) form.requestSubmit();
                            }}
                            disabled={submitting}
                            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-sky-500 disabled:opacity-50"
                        >
                            {submitting ? <Loader className="animate-spin" size={18} /> : (isEditing ? <Check size={18} /> : <Rocket size={18} />)}
                            {isEditing ? 'Salvar Alterações' : 'Criar Evento'}
                        </button>
                    </div>
                }
            />

            <form className="grid grid-cols-1 gap-8 lg:grid-cols-3" onSubmit={handleSubmit}>
                <div className="space-y-6 lg:col-span-2">
                    <SurfaceCard padding="lg">
                        <SectionHeader
                            icon={<Sparkles size={22} />}
                            title="Detalhes do Evento"
                            description="Informações que aparecem na Agenda Connecta."
                        />

                        <div className="mt-5 space-y-5">
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <Type size={16} className="text-primary" /> Título do Evento *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                                    placeholder="Ex: Reunião Geral de Alinhamento"
                                />
                            </div>

                            <div>
                                <label className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <Tag size={16} className="text-primary" /> Tipo de Evento *
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {EVENT_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: type.id })}
                                            className={`relative rounded-xl border-2 px-4 py-3 text-center text-sm font-bold transition-all ${formData.type === type.id
                                                ? `${getTypeColor(type.id)} border-current shadow-md`
                                                : 'border-slate-200 bg-slate-50 text-gray-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-background-dark dark:hover:bg-white/5'
                                                }`}
                                        >
                                            {type.label}
                                            {formData.type === type.id && (
                                                <div className="absolute right-2 top-2">
                                                    <div className="h-2 w-2 rounded-full bg-current"></div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                        <Calendar size={16} className="text-primary" /> Data *
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                        <Clock size={16} className="text-primary" /> Horário *
                                    </label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <MapPin size={16} className="text-primary" /> Local
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                                    placeholder="Ex: Google Meet, Auditório C, Sala 101..."
                                />
                            </div>

                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <AlignLeft size={16} className="text-primary" /> Descrição
                                </label>
                                <textarea
                                    rows={4}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 shadow-inner transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-background-dark dark:text-white"
                                    placeholder="Descreva os detalhes do evento, pauta, objetivos..."
                                />
                            </div>
                        </div>
                    </SurfaceCard>
                </div>

                <aside className="space-y-6 lg:sticky lg:top-20 lg:h-max">
                    <SurfaceCard padding="lg">
                        <SectionHeader
                            icon={<Calendar size={20} />}
                            title="Sobre Eventos"
                            description="Aparecem na Agenda Connecta e são visíveis para toda a comunidade."
                        />
                        <div className="mt-5 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tipos disponíveis</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Reunião</span>
                                <span className="rounded-full bg-purple-100 px-2 py-1 text-[10px] font-bold uppercase text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Workshop</span>
                                <span className="rounded-full bg-yellow-100 px-2 py-1 text-[10px] font-bold uppercase text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">Evento</span>
                            </div>
                        </div>
                    </SurfaceCard>
                </aside>
            </form>
        </div>
    );
};

export default NewEventScreen;
