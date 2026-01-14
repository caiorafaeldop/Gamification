import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, User, Zap, BarChart3, Edit, Clock } from 'lucide-react';
import { Task } from '../types';

interface TaskDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: any; // Using any to be safe with varied backend responses, but ideally Task interface
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ isOpen, onClose, task }) => {
    const navigate = useNavigate();

    if (!isOpen || !task) return null;

    const handleEdit = () => {
        navigate(`/edit-task/${task.id}`);
        onClose();
    };

    const getDifficultyLabel = (difficulty: number) => {
        if (difficulty <= 3) return 'Básica';
        if (difficulty <= 6) return 'Média';
        return 'Grande';
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'todo': return 'A Fazer';
            case 'in_progress': return 'Em Progresso';
            case 'done': return 'Concluído';
            default: return status;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start bg-gray-50/50 dark:bg-black/10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${task.status === 'done' ? 'bg-green-100 text-green-600' :
                                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                                        'bg-gray-200 text-gray-600'
                                }`}>
                                {getStatusLabel(task.status)}
                            </span>
                            {task.priority && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-xs font-bold uppercase">
                                    {task.priority}
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl font-display font-extrabold text-secondary dark:text-white leading-tight">
                            {task.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-8 flex-1">

                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Descrição</h3>
                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {task.description || "Nenhuma descrição fornecida."}
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-surface-darker p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase">Responsável</p>
                                <p className="font-bold text-secondary dark:text-white">
                                    {task.assignedTo?.name || "Não atribuído"}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-surface-darker p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600">
                                <Zap size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase">Recompensa</p>
                                <p className="font-bold text-secondary dark:text-white">
                                    {task.pointsReward} XP
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-surface-darker p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                <BarChart3 size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase">Dificuldade</p>
                                <p className="font-bold text-secondary dark:text-white">
                                    {getDifficultyLabel(task.difficulty)}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-surface-darker p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase">Prazo</p>
                                <p className="font-bold text-secondary dark:text-white">
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Sem prazo"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {task.estimatedTimeMinutes && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg w-fit">
                            <Clock size={16} />
                            Tempo estimado: <strong>{task.estimatedTimeMinutes / 60} horas</strong>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/10 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/5 transition-colors"
                    >
                        Fechar
                    </button>
                    <button
                        onClick={handleEdit}
                        className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all flex items-center gap-2"
                    >
                        <Edit size={18} /> Editar Tarefa
                    </button>
                </div>

            </div>
        </div>
    );
};

export default TaskDetailsModal;
