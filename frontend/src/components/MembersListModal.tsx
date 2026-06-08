import React from 'react';

interface Member {
    user: {
        id: string;
        name: string;
        avatarUrl?: string; // Optional, as it might not be present
        email?: string;
    }
}

interface MembersListModalProps {
    isOpen: boolean;
    onClose: () => void;
    members: Member[] | undefined;
    leaderId: string | undefined;
    currentUserId: string | undefined;
    onTransfer: (newLeaderId: string) => void;
}

const MembersListModal: React.FC<MembersListModalProps> = ({ isOpen, onClose, members, leaderId, currentUserId, onTransfer }) => {
    if (!isOpen) return null;

    // Filter members to separate leader and other members if needed, 
    // or just mark the leader in the list.
    // Let's sort so leader is first.
    const sortedMembers = React.useMemo(() => {
        if (!members) return [];
        return [...members].sort((a, b) => {
            if (a.user.id === leaderId) return -1;
            if (b.user.id === leaderId) return 1;
            return a.user.name.localeCompare(b.user.name);
        });
    }, [members, leaderId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-4 shrink-0">
                    <h2 className="text-xl font-bold text-secondary dark:text-white">
                        Membros do Projeto
                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                            {members?.length || 0}
                        </span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <span className="material-icons">close</span>
                    </button>
                </div>

                <div className="overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-3 flex-1">
                    {sortedMembers.map((member) => (
                        <div key={member.user.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                            <img
                                src={member.user.avatarUrl || `https://ui-avatars.com/api/?name=${member.user.name}&background=random`}
                                alt={member.user.name}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/20 transition-all"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200 truncate">
                                        {member.user.name}
                                    </h3>
                                    {member.user.id === leaderId && (
                                        <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800 uppercase tracking-wide">
                                            Líder
                                        </span>
                                    )}
                                </div>
                                {currentUserId === leaderId && member.user.id !== leaderId && (
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Tem certeza que deseja transferir a liderança para ${member.user.name}?`)) {
                                                onTransfer(member.user.id);
                                            }
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all"
                                        title="Transferir Liderança"
                                    >
                                        <span className="material-icons">manage_accounts</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {(!members || members.length === 0) && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            Nenhum membro encontrado.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MembersListModal;
