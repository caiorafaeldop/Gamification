import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { createTask, getTask } from '../services/task.service';
import { useProjects } from '../hooks/useProjects';
import { getAllUsers } from '../services/user.service';
import { getProjectDetails } from '../services/project.service';
import { useAuth } from '../hooks/useAuth';

interface UseNewTaskFormProps {
    taskId?: string | null;
    projectId?: string | null;
    onSuccess?: () => void;
}

export const useNewTaskForm = (props?: UseNewTaskFormProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: paramId } = useParams<{ id: string }>();
    
    // Priority: props > util params
    const id = props?.taskId !== undefined ? props.taskId : paramId;
    
    const { user } = useAuth();
    const { projects, loading: loadingProjects } = useProjects();
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const [taskLevel, setTaskLevel] = useState<'basic' | 'medium' | 'large'>('medium');
    const [points, setPoints] = useState(150);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [projectId, setProjectId] = useState(props?.projectId || location.state?.projectId || '');
    const [assignedToId, setAssignedToId] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [deadline, setDeadline] = useState('');
    const [startDate, setStartDate] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mobile collapsible sections
    const [showQuickActions, setShowQuickActions] = useState(true);
    const [showDescription, setShowDescription] = useState(false);

    // Check if mobile viewport
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchContextData = async () => {
            setLoadingUsers(true);
            try {
                if (projectId) {
                    const projectData = await getProjectDetails(projectId);
                    if (projectData.members) {
                        setUsers(projectData.members.map((m: any) => m.user || m));
                    } else {
                        const allUsers = await getAllUsers();
                        setUsers(allUsers);
                    }
                } else {
                    const data = await getAllUsers();
                    setUsers(data || []);
                }
            } catch (err) {
                console.error("Failed to fetch context data", err);
                try {
                    const data = await getAllUsers();
                    setUsers(data || []);
                } catch (e) { console.error(e) }
            } finally {
                setLoadingUsers(false);
            }
        };

        if (projectId || !projectId) {
            fetchContextData();
        }
    }, [projectId]);

    // Removed editing effect


    useEffect(() => {
        switch (taskLevel) {
            case 'basic': setPoints(50); break;
            case 'medium': setPoints(100); break;
            case 'large': setPoints(200); break;
        }
    }, [taskLevel]);

    const mapLevelToDifficulty = (level: string) => {
        switch (level) {
            case 'basic': return 1;
            case 'medium': return 2;
            case 'large': return 3;
            default: return 2;
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError(null);
        if (submitting) return;
        setSubmitting(true);

        if (!title || !projectId) {
            setError("Título e Projeto são obrigatórios.");
            setSubmitting(false);
            return;
        }

        try {
            const payload = {
                title,
                description,
                projectId,
                assignedToId: assignedToId || undefined,
                difficulty: mapLevelToDifficulty(taskLevel),
                estimatedTimeMinutes: estimatedTime ? parseInt(estimatedTime) * 60 : undefined,
                dueDate: deadline ? new Date(deadline).toISOString() : undefined,
                isExternalDemand: false
            };

            await createTask(payload);

            if (props?.onSuccess) {
                props.onSuccess();
            } else {
                navigate(-1);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Erro ao salvar tarefa. Verifique os dados.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const target = e.currentTarget;
            const start = target.selectionStart;
            const end = target.selectionEnd;

            const newValue = description.substring(0, start) + "\t" + description.substring(end);
            setDescription(newValue);

            setTimeout(() => {
                target.selectionStart = target.selectionEnd = start + 1;
            }, 0);
        }
    };

    // Get selected project name
    const selectedProject = projects.find((p: any) => p.id === projectId);

    return {
        navigate,
        location,
        user,
        projects,
        loadingProjects,
        users,
        loadingUsers,
        taskLevel,
        points,
        title,
        description,
        projectId,
        assignedToId,
        estimatedTime,
        deadline,
        startDate,
        submitting,
        error,
        showQuickActions,
        showDescription,
        isMobile,
        selectedProject,
        setTaskLevel,
        setPoints,
        setTitle,
        setDescription,
        setProjectId,
        setAssignedToId,
        setEstimatedTime,
        setDeadline,
        setStartDate,
        setSubmitting,
        setError,
        setShowQuickActions,
        setShowDescription,
        setIsMobile, 
        handleSubmit,
        handleKeyDown
    };
};
