import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Type, AlignLeft, ArrowLeft, Rocket, Tag } from 'lucide-react';
import { createEvent } from '../services/event.service';
import toast from 'react-hot-toast';

const EVENT_TYPES = [
    { id: 'MEETING', label: 'Reunião', color: 'blue' },
    { id: 'WORKSHOP', label: 'Workshop', color: 'purple' },
    { id: 'EVENT', label: 'Evento', color: 'yellow' },
];

const NewEventScreen = () => {
    const navigate = useNavigate();

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
            await createEvent({
                title: formData.title,
                type: formData.type as 'MEETING' | 'WORKSHOP' | 'EVENT',
                date: formData.date,
                time: formData.time,
                location: formData.location || undefined,
                description: formData.description || undefined,
            });

            toast.success('Evento criado com sucesso! 🎉');
            navigate('/activities');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Erro ao criar evento.');
        } finally {
            setSubmitting(false);
        }
    };

    const getTypeColor = (typeId: string) => {
        switch (typeId) {
            case 'meeting': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'workshop': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
            case 'event': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary mb-6 transition-colors text-sm font-bold"
            >
                <ArrowLeft size={16} /> Voltar
            </button>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                    <header className="mb-8">
                        <h1 className="text-3xl font-display font-extrabold text-secondary dark:text-white mb-2">
                            Criar Novo Evento
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Organize reuniões, workshops e eventos para a comunidade Connecta.
                        </p>
                    </header>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">

                            {/* Title Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Type size={16} className="text-primary" /> Título do Evento *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white placeholder-gray-400"
                                    placeholder="Ex: Reunião Geral de Alinhamento"
                                />
                            </div>

                            {/* Event Type */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                    <Tag size={16} className="text-primary" /> Tipo de Evento *
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {EVENT_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: type.id })}
                                            className={`relative py-3 px-4 rounded-xl border-2 transition-all text-center font-bold text-sm ${formData.type === type.id
                                                ? `${getTypeColor(type.id)} border-current shadow-md`
                                                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-background-dark text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
                                                }`}
                                        >
                                            {type.label}
                                            {formData.type === type.id && (
                                                <div className="absolute top-2 right-2">
                                                    <div className="w-2 h-2 rounded-full bg-current"></div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <Calendar size={16} className="text-primary" /> Data *
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <Clock size={16} className="text-primary" /> Horário *
                                    </label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <MapPin size={16} className="text-primary" /> Local
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white placeholder-gray-400"
                                    placeholder="Ex: Google Meet, Auditório C, Sala 101..."
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <AlignLeft size={16} className="text-primary" /> Descrição
                                </label>
                                <textarea
                                    rows={4}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white placeholder-gray-400 resize-none"
                                    placeholder="Descreva os detalhes do evento, pauta, objetivos..."
                                />
                            </div>

                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                disabled={submitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-sky-500 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Rocket size={20} />
                                {submitting ? 'Criando...' : 'Criar Evento'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar Info */}
                <div className="hidden lg:block w-80 space-y-6">
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 border border-primary/10">
                        <h3 className="font-bold text-primary flex items-center gap-2 mb-3">
                            <Calendar size={18} /> Sobre Eventos
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                            Eventos aparecem na Agenda Connecta e são visíveis para toda a comunidade.
                        </p>
                        <div className="h-px bg-primary/10 my-4"></div>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tipos disponíveis:</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Reunião</span>
                                <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Workshop</span>
                                <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">Evento</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewEventScreen;
