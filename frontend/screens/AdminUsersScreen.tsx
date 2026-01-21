import React, { useState, useEffect } from 'react';
import { getAdminUsers, updateUserPoints, getAdminLogs } from '../services/admin.service';
import { User, LogOut, Edit, Save, X, Search, History } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminUsersScreen = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<any>(null);
    const [newPoints, setNewPoints] = useState<number>(0);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, logsData] = await Promise.all([
                getAdminUsers(),
                getAdminLogs()
            ]);
            // Backend returns paginated objects { users: [], total } and { logs: [], total }
            // or sometimes direct arrays if not paginated. Handling both safely.
            setUsers(Array.isArray(usersData) ? usersData : usersData.users || []);
            setLogs(Array.isArray(logsData) ? logsData : logsData.logs || []);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar dados admin.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
            fetchData(); // Reload to refresh list and logs
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar pontos.');
        }
    };

    const filteredUsers = (Array.isArray(users) ? users : []).filter((u: any) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="text-primary" /> Gestão de Pessoas (Admin)
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Gerencie usuários e pontuações manualmente.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar usuário..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white w-full md:w-64"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200">Usuário</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200">Email</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200">Role</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200">Pontos</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr><td colSpan={5} className="p-6 text-center text-gray-500">Carregando...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={5} className="p-6 text-center text-gray-500">Nenhum usuário encontrado.</td></tr>
                            ) : (
                                filteredUsers.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-gray-900 dark:text-white font-medium flex items-center gap-3">
                                             <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="" className="w-8 h-8 rounded-full" />
                                            {user.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-secondary dark:text-white font-mono font-bold">{user.connectaPoints}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleEditPoints(user)}
                                                className="text-primary hover:text-primary-dark p-2 rounded-lg hover:bg-primary/10 transition-colors"
                                                title="Editar Pontos"
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
            </div>

            {/* Audit Logs */}
            <div className="mt-8">
                <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <History className="text-gray-400" /> Logs de Auditoria
                </h2>
                <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 space-y-3 h-64 overflow-y-auto custom-scrollbar border border-gray-200 dark:border-gray-800">
                     {logs.length === 0 ? (
                         <p className="text-gray-500 text-sm text-center italic">Nenhuma atividade registrada.</p>
                     ) : (
                         (Array.isArray(logs) ? logs : []).map(log => (
                             <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm p-3 bg-white dark:bg-surface-dark rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
                                 <div className="flex items-center gap-2">
                                     <span className="font-bold text-primary">{log.user.name}</span>
                                     <span className="text-gray-600 dark:text-gray-300">{log.description}</span>
                                 </div>
                                 <span className="text-xs text-gray-400 mt-1 sm:mt-0">{new Date(log.createdAt).toLocaleString()}</span>
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
