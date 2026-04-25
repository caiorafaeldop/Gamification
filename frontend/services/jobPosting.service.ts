import api from './api';

export type JobPostingStatus = 'OPEN' | 'CLOSED' | 'FILLED';

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  contact: string;
  status: JobPostingStatus;
  authorId: string;
  groupId: string | null;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; avatarUrl?: string | null; avatarColor?: string | null };
  group?: { id: string; name: string; logoUrl: string | null; color: string | null } | null;
}

export interface CreateJobPostingInput {
  title: string;
  description: string;
  contact: string;
  groupId?: string | null;
}

export interface UpdateJobPostingInput {
  title?: string;
  description?: string;
  contact?: string;
  groupId?: string | null;
  status?: JobPostingStatus;
}

export const listJobPostings = async (filters?: {
  status?: JobPostingStatus;
  groupId?: string;
  authorId?: string;
}): Promise<JobPosting[]> => {
  const { data } = await api.get('/jobs', { params: filters });
  return data;
};

export const createJobPosting = async (input: CreateJobPostingInput): Promise<JobPosting> => {
  const { data } = await api.post('/jobs', input);
  return data;
};

export const getJobPosting = async (id: string): Promise<JobPosting> => {
  const { data } = await api.get(`/jobs/${id}`);
  return data;
};

export const updateJobPosting = async (id: string, input: UpdateJobPostingInput): Promise<JobPosting> => {
  const { data } = await api.patch(`/jobs/${id}`, input);
  return data;
};

export const deleteJobPosting = async (id: string): Promise<{ id: string }> => {
  const { data } = await api.delete(`/jobs/${id}`);
  return data;
};
