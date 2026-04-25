import api from './api';

export interface GroupProjectSummary {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  coverUrl: string | null;
  status: string;
  visibility: 'PUBLIC' | 'PRIVATE' | null;
  isJoiningOpen: boolean | null;
  leader: { id: string; name: string; avatarUrl?: string | null };
  _count?: { members: number; tasks: number };
}

export interface GroupMemberSummary {
  userId: string;
  groupId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  User: { id: string; name: string; avatarUrl: string | null; avatarColor: string | null };
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  totalXp: number | null;
  createdAt: string;
  updatedAt: string;
  GroupMember?: GroupMemberSummary[];
  Project?: GroupProjectSummary[];
  _count?: { GroupMember: number; Project: number };
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
  color?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

export const listGroups = async (): Promise<Group[]> => {
  const { data } = await api.get('/groups');
  return data;
};

export const getGroup = async (id: string): Promise<Group> => {
  const { data } = await api.get(`/groups/${id}`);
  return data;
};

export const createGroup = async (payload: CreateGroupPayload): Promise<Group> => {
  const { data } = await api.post('/groups', payload);
  return data;
};

export const updateGroup = async (id: string, payload: Partial<CreateGroupPayload>): Promise<Group> => {
  const { data } = await api.patch(`/groups/${id}`, payload);
  return data;
};

export const deleteGroup = async (id: string) => {
  const { data } = await api.delete(`/groups/${id}`);
  return data;
};

export const joinGroup = async (id: string) => {
  const { data } = await api.post(`/groups/${id}/join`);
  return data;
};

export const leaveGroup = async (id: string) => {
  const { data } = await api.delete(`/groups/${id}/leave`);
  return data;
};
