import api from './api';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  leaderId: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  color?: string;
  coverUrl?: string;
  progress: number;
  pointsPerOpenTask?: number;
  pointsPerCompletedTask?: number;
  tags?: string;
  maxMembers?: number;
  rewardPoints?: number;
  visibility?: 'PRIVATE' | 'PUBLIC_VIEW' | 'PUBLIC_LIKE' | 'PUBLIC_OPEN' | null;
  likeCount?: number;
  liked?: boolean;
  groupId?: string | null;
  versions?: ProjectVersion[];
}

export type ProjectVersionStatus = 'PLANNED' | 'IN_PROGRESS' | 'LOCKED' | 'RELEASED' | 'ARCHIVED';

export interface ProjectVersion {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectVersionStatus;
  startDate?: string | null;
  dueDate?: string | null;
  releasedAt?: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
  tasks?: Array<{ id: string; status: string; completedAt?: string | null }>;
}

export interface InitialProjectVersionInput {
  name: string;
  description?: string | null;
  status?: ProjectVersionStatus;
  startDate?: string | null;
  dueDate?: string | null;
}

export const getProjects = async () => {
  const response = await api.get('/projects');
  return response.data;
};

export const getProjectDetails = async (id: string) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

export const createProject = async (data: Partial<Project> & { initialVersion?: InitialProjectVersionInput }) => {
  const response = await api.post('/projects', data);
  return response.data;
};

export const uploadProjectCover = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/projects/upload-cover', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data; // Expected { url: string }
};

export const joinProject = async (projectId: string) => {
  const response = await api.post(`/projects/${projectId}/join`);
  return response.data;
};
export const updateProject = async (id: string, data: Partial<Project>) => {
  const response = await api.patch(`/projects/${id}`, data);
  return response.data;
};

export const leaveProject = async (projectId: string) => {
  const response = await api.delete(`/projects/${projectId}/leave`);
  return response.data;
};

export const deleteProject = async (projectId: string) => {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
};

export const transferProjectOwnership = async (projectId: string, newLeaderId: string) => {
  const response = await api.put(`/projects/${projectId}/transfer-ownership`, { newLeaderId });
  return response.data;
};

export const getProjectVersions = async (projectId: string): Promise<ProjectVersion[]> => {
  const response = await api.get(`/projects/${projectId}/versions`);
  return response.data;
};

export const createProjectVersion = async (
  projectId: string,
  data: Partial<ProjectVersion>,
): Promise<ProjectVersion> => {
  const response = await api.post(`/projects/${projectId}/versions`, data);
  return response.data;
};

export const updateProjectVersion = async (
  projectId: string,
  versionId: string,
  data: Partial<ProjectVersion>,
): Promise<ProjectVersion> => {
  const response = await api.patch(`/projects/${projectId}/versions/${versionId}`, data);
  return response.data;
};

export const deleteProjectVersion = async (projectId: string, versionId: string) => {
  const response = await api.delete(`/projects/${projectId}/versions/${versionId}`);
  return response.data;
};
