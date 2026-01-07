import { useState, useEffect } from 'react';
import { getProjects, getProjectDetails } from '../services/project.service';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  return { projects, loading, error, refetch: fetchProjects };
};

export const useProjectDetails = (id: string) => {
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const data = await getProjectDetails(id);
            setProject(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch project details');
        } finally {
            setLoading(false);
        }
    };

    return { project, loading, error, refetch: fetchDetails };
};
