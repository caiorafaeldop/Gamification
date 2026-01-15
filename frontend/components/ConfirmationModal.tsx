import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    type = 'danger'
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // Wait for exit animation
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-start justify-center pt-10 transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop - Invisible but handles clicks to close */}
            <div 
                className="absolute inset-0 bg-transparent" 
                onClick={onClose}
            />

            {/* Modal Content - Wider & Shorter (Horizontal Layout) */}
            <div 
                className={`
                    relative bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 
                    rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4 transform transition-all duration-500 ease-in-out
                    flex items-center gap-6
                    ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}
                `}
            >
                <div className={`
                    w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center
                    ${type === 'danger' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-primary/10 text-primary'}
                `}>
                    <AlertTriangle size={24} />
                </div>

                <div className="flex-1 text-left">
                    <h3 className="text-lg font-display font-bold text-secondary dark:text-white mb-1">
                        {title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-snug">
                        {message}
                    </p>
                </div>

                <div className="flex gap-3 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`
                            px-4 py-2 rounded-lg text-white font-bold shadow-lg transition-all transform active:scale-95 text-sm
                            ${type === 'danger' 
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' 
                                : 'bg-primary hover:bg-sky-500 shadow-primary/30'}
                        `}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
