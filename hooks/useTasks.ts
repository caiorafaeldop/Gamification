import { useState, useEffect, useCallback } from 'react';
import { getTasks, updateTaskStatus } from '../services/task.service';

export const useTasks = (projectId: string) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await getTasks(projectId);
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const moveTask = async (taskId: string, newStatus: string) => {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      
      try {
          await updateTaskStatus(taskId, newStatus);
      } catch (err) {
          // Revert if failed
          fetchTasks();
          console.error("Failed to update task status", err);
      }
  };

  return { tasks, loading, error, refetch: fetchTasks, moveTask };
};
