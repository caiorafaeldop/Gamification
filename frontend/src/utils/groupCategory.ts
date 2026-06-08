import { Building2, Users, Briefcase, type LucideIcon } from 'lucide-react';
import type { GroupCategory } from '../services/group.service';

interface CategoryMeta {
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  accentColor: string;
}

export const GROUP_CATEGORIES: GroupCategory[] = ['INSTITUCIONAL', 'COMUNIDADE', 'EXTERNO'];

export const groupCategoryMeta: Record<GroupCategory, CategoryMeta> = {
  INSTITUCIONAL: {
    label: 'Institucionais',
    shortLabel: 'Institucional',
    description: 'Iniciativas oficiais do Centro de Informática',
    icon: Building2,
    accentColor: '#29B6F6',
  },
  COMUNIDADE: {
    label: 'Comunidade',
    shortLabel: 'Comunidade',
    description: 'Grupos de alunos com interesses em comum',
    icon: Users,
    accentColor: '#10B981',
  },
  EXTERNO: {
    label: 'Externos',
    shortLabel: 'Externo',
    description: 'Instituições e empresas parceiras de fora da UFPB',
    icon: Briefcase,
    accentColor: '#F59E0B',
  },
};

export const resolveCategory = (category: GroupCategory | string | null | undefined): GroupCategory => {
  if (typeof category === 'string' && (GROUP_CATEGORIES as string[]).includes(category)) {
    return category as GroupCategory;
  }
  return 'COMUNIDADE';
};
