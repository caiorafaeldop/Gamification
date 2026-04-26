import api from './api';

export type ProjectVisibility = 'PRIVATE' | 'PUBLIC_VIEW' | 'PUBLIC_LIKE' | 'PUBLIC_OPEN';

export interface CatalogProject {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  coverUrl: string | null;
  color: string | null;
  status: string;
  visibility: ProjectVisibility | null;
  isJoiningOpen: boolean | null;
  likeCount: number;
  liked: boolean;
  leader: { id: string; name: string; avatarUrl?: string | null; avatarColor?: string | null };
  Group?: { id: string; name: string; color: string | null; logoUrl: string | null } | null;
  members: { userId: string }[];
  _count?: { members: number; tasks: number; likes: number };
}

export interface GroupRowGroup {
  id: string;
  name: string;
  color: string | null;
  logoUrl: string | null;
}

export interface CatalogResponse {
  yours: CatalogProject[];
  trending: CatalogProject[];
  recent: CatalogProject[];
  openForJoining: CatalogProject[];
  byGroup: { group: GroupRowGroup; projects: CatalogProject[] }[];
  byCategory: { category: string; projects: CatalogProject[] }[];
  fromYourGroups: CatalogProject[];
}

export const getCatalog = async (): Promise<CatalogResponse> => {
  const { data } = await api.get('/projects/catalog');
  return data;
};
