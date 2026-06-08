import api from './api';

export interface ToggleLikeResponse {
  liked: boolean;
  likeCount: number;
}

export const toggleProjectLike = async (projectId: string): Promise<ToggleLikeResponse> => {
  const { data } = await api.post(`/projects/${projectId}/like`);
  return data;
};

export const getLikeStatus = async (projectId: string): Promise<{ liked: boolean }> => {
  const { data } = await api.get(`/projects/${projectId}/like`);
  return data;
};
