import React from 'react';

interface Project {
  id: string;
  title: string;
}

interface ProjectFilterSelectProps {
  projects: Project[];
  selectedProjectIds: string[];
  onToggle: (projectId: string) => void;
  onClear: () => void;
}

const ProjectFilterSelect: React.FC<ProjectFilterSelectProps> = ({
  projects,
  selectedProjectIds,
  onToggle,
  onClear,
}) => {
  if (projects.length === 0) return null;

  return (
    <div className="mt-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Filtrar por projeto
        </p>
        {selectedProjectIds.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-bold text-primary hover:underline"
          >
            Limpar
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {projects.map((project) => {
          const selected = selectedProjectIds.includes(project.id);
          return (
            <button
              key={project.id}
              type="button"
              onClick={() => onToggle(project.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                selected
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                  : 'bg-gray-50 dark:bg-surface-darker text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/40'
              }`}
            >
              {project.title}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-400 mt-2">
        {selectedProjectIds.length === 0
          ? 'Sem filtro — exibindo ranking global.'
          : 'Pontuação somada dos projetos selecionados.'}
      </p>
    </div>
  );
};

export default ProjectFilterSelect;
