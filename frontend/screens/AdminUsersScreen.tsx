import React, { useState, useEffect } from 'react';
import { getAdminUsers, updateUserPoints, getAdminLogs } from '../services/admin.service';
import { User, Edit, Save, X, Search, History } from 'lucide-react';
import { toast } from 'react-hot-toast';

const USERS_PER_PAGE = 10;

const AdminUsersScreen = () => {
    // Users
    const [users, setUsers] = useState<any[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Logs
    const [logs, setLogs] = useState<any[]>([]);
    const [logFilters, setLogFilters] = useState({
        date: '',
        user: ''
    });

    // Edit
    const [editingUser, setEditingUser] = useState<any>(null);
    const [newPoints, setNewPoints] = useState<number>(0);

    const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

    // Users
    const fetchUsers = async () => {
        try {
            setLoading(true);

            const data = await getAdminUsers({
                page,
                limit: USERS_PER_PAGE,
                search: searchTerm,
                all: false
            });

            setUsers(data.users || []);
            setTotalUsers(data.total || 0);
        } catch {
            toast.error('Erro ao carregar usuários.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, searchTerm]);

    // Logs
    const fetchLogs = async () => {
        try {
            const data = await getAdminLogs({
                all: true,
                search: logFilters.user,
                date: logFilters.date
            });

            setLogs(data.logs || []);
        } catch {
            toast.error('Erro ao carregar logs.');
        }
    };

    // Carrega logs apenas ao montar a tela
    useEffect(() => {
        fetchLogs();
    }, []);

    // Edit
    const handleEditPoints = (user: any) => {
        setEditingUser(user);
        setNewPoints(user.connectaPoints);
    };

    const handleSavePoints = async () => {
        if (!editingUser) return;

        try {
            await updateUserPoints(editingUser.id, Number(newPoints));
            toast.success('Pontos atualizados com sucesso!');
            setEditingUser(null);
            fetchUsers();
        } catch {
            toast.error('Erro ao atualizar pontos.');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="text-primary" /> Gestão de Pessoas (Admin)
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Gerencie usuários e pontuações manualmente.
                    </p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar usuário..."
                        value={searchTerm}
                        onChange={(e) => {
                            setPage(1);
                            setSearchTerm(e.target.value);
                        }}
                        className="pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-surface-dark
                        border border-gray-200 dark:border-gray-700
                        focus:ring-2 focus:ring-primary outline-none
                        text-gray-900 dark:text-white w-full md:w-64"
                    />
                </div>
            </div>

            {/* USERS TABLE */}
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4">Usuário</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Pontos</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-6 text-center text-gray-500">
                                        Carregando...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-6 text-center text-gray-500">
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <img
                                                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=${user.avatarColor}`}
                                                className="w-8 h-8 rounded-full"
                                            />
                                            {user.name}
                                        </td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN'
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold">
                                            {user.connectaPoints}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleEditPoints(user)}
                                                className="text-primary hover:bg-primary/10 p-2 rounded-lg"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="flex justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-sm">
                        Página {page} de {totalPages || 1}
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 border rounded-lg disabled:opacity-50"
                        >
                            Anterior
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 border rounded-lg disabled:opacity-50"
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            </div>

            {/* LOGS */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                    <History /> Logs de Auditoria
                </h2>

                <div className="flex gap-3 mb-4">
                    <input
                        type="date"
                        value={logFilters.date}
                        onChange={(e) =>
                            setLogFilters(f => ({ ...f, date: e.target.value }))
                        }
                        className="px-4 py-2 rounded-lg
                       bg-white dark:bg-surface-dark
                       border border-gray-200 dark:border-gray-700
                       text-gray-900 dark:text-white"
                    />

                    <input
                        type="text"
                        placeholder="Usuário do log..."
                        value={logFilters.user}
                        onChange={(e) =>
                            setLogFilters(f => ({ ...f, user: e.target.value }))
                        }
                        className="px-4 py-2 rounded-lg
                       bg-white dark:bg-surface-dark
                       border border-gray-200 dark:border-gray-700
                       text-gray-900 dark:text-white"
                    />

                    <button
                        onClick={fetchLogs}
                        className="px-4 py-2 bg-primary text-white rounded-lg"
                    >
                        Filtrar
                    </button>
                </div>

                <div className="h-64 overflow-y-auto space-y-2">
                    {logs.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 italic">
                            Nenhuma atividade registrada.
                        </p>
                    ) : (
                        logs.map(log => (
                            <div
                                key={log.id}
                                className="p-3 rounded-lg
                               bg-white dark:bg-surface-dark
                               border border-gray-200 dark:border-gray-800"
                            >
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-800 dark:text-gray-200">
                                        <strong className="text-primary">
                                            {log.user.name}
                                        </strong>{' '}
                                        {log.description}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>


            {/* Edit Points Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl w-full max-w-md shadow-2xl p-6 border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white">Editar Pontos</h3>
                            <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={24} /></button>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Usuário: <span className="font-bold text-gray-900 dark:text-white">{editingUser.name}</span></p>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total de Pontos (Connecta Points)</label>
                            <input
                                type="number"
                                value={newPoints}
                                onChange={(e) => setNewPoints(Number(e.target.value))}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none text-2xl font-bold text-center"
                            />
                            <p className="text-xs text-secondary mt-2">⚠️ Esta ação sobrescreve o valor atual e será registrada nos logs.</p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setEditingUser(null)} className="flex-1 py-3 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">Cancelar</button>
                            <button onClick={handleSavePoints} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
                                <Save size={18} /> Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminUsersScreen;
