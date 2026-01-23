import React from 'react';
import MobileNewTaskScreen from './MobileNewTaskScreen';
import { useNewTaskForm } from '../hooks/useNewTaskForm';

interface MobileNewTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId?: string;
    onSuccess?: () => void;
    
}

const MobileNewTaskModal: React.FC<MobileNewTaskModalProps> = ({ 
    isOpen, 
    onClose, 
    projectId, 
    onSuccess
}) => {
    // Only render if open to avoid overhead/fetching when closed
    if (!isOpen) return null;

    return <MobileNewTaskModalContent onClose={onClose} projectId={projectId} onSuccess={onSuccess} />;
};

const MobileNewTaskModalContent: React.FC<Omit<MobileNewTaskModalProps, 'isOpen'>> = ({ 
    onClose, 
    projectId, 
    onSuccess,
}) => {
    const { isMobile, ...formProps } = useNewTaskForm({
        projectId,
        onSuccess: () => {
            if (onSuccess) onSuccess();
            onClose();
        }
    });

    // Override the navigate function to close the modal instead of going back
    const customNavigate = (to: any) => {
        if (to === -1) {
            onClose();
        }
        
    };

    return (
        <div className="fixed inset-0 z-[60] bg-background-dark">
            <MobileNewTaskScreen 
                {...formProps} 
                navigate={customNavigate}
            />
        </div>
    );
};

export default MobileNewTaskModal;
