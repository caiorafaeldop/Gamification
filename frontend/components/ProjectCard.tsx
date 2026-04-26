import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Sparkles, Star, Users, Lock, Eye } from 'lucide-react';
import LikeButton from './LikeButton';
import type { CatalogProject } from '../services/catalog.service';

interface ProjectCardProps {
  project: CatalogProject;
  size?: 'sm' | 'md' | 'lg';
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, size = 'md' }) => {
  const navigate = useNavigate();
  const color = project.Group?.color || project.color || '#29B6F6';

  const heightCls = size === 'sm' ? 'h-32' : size === 'lg' ? 'h-48' : 'h-40';
  const titleCls = size === 'sm' ? 'text-sm' : 'text-base';

  const goDetails = () => navigate(`/project-landing/${project.id}`);

  const visibilityBadge =
    project.visibility === 'PRIVATE' ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
        <Lock size={9} /> Privado
      </span>
    ) : project.visibility === 'PUBLIC_VIEW' ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
        <Eye size={9} /> Apenas leitura
      </span>
    ) : null;

  return (
    <article
      onClick={goDetails}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-100 bg-surface-light shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-surface-dark"
    >
      <div className={`relative ${heightCls} overflow-hidden bg-gray-200`}>
        {project.coverUrl ? (
          <img
            src={project.coverUrl}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${color}33 0%, ${color}11 100%)` }}
          >
            <Star size={40} style={{ color: `${color}66` }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {visibilityBadge}
          {project.visibility === 'PUBLIC_OPEN' && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white"
              style={{ backgroundColor: color }}
            >
              <Sparkles size={9} /> Aberto
            </span>
          )}
        </div>

        <div className="absolute right-2 top-2">
          <LikeButton
            projectId={project.id}
            initialLiked={project.liked}
            initialCount={project.likeCount}
            visibility={project.visibility}
            size="sm"
            variant="overlay"
          />
        </div>

        {project.Group && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5">
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/30 shadow"
              style={{ backgroundColor: project.Group.logoUrl ? undefined : color }}
            >
              {project.Group.logoUrl ? (
                <img
                  src={project.Group.logoUrl}
                  alt={project.Group.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FlaskConical className="text-white" size={12} />
              )}
            </div>
            <p className="truncate text-[10px] font-bold text-white drop-shadow-md">
              {project.Group.name}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        {project.category && (
          <span
            className="inline-flex w-max items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {project.category}
          </span>
        )}

        <h4
          className={`mt-1.5 line-clamp-2 ${titleCls} font-display font-bold leading-tight text-secondary dark:text-white`}
        >
          {project.title}
        </h4>

        {project.description && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
            {project.description}
          </p>
        )}

        <div className="mt-auto flex items-center gap-3 pt-2 text-[10px] text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Users size={11} />
            {project._count?.members ?? project.members.length}
          </div>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <span className="truncate">{project.leader.name}</span>
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
