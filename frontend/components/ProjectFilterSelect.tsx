import React from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/Select';

interface Project {
  id: string;
  title: string;
}

interface ProjectFilterSelectProps {
  projects: Project[];
  selectedProjectIds: string[];
  onToggle: (projectId: string) => void;
  onClear: () => void;
  className?: string;
}

const ProjectFilterSelect: React.FC<ProjectFilterSelectProps> = ({
  projects,
  selectedProjectIds,
  onToggle,
  onClear,
  className,
}) => {
  if (projects.length === 0) return null;

  return (
    <Select
      value={selectedProjectIds[0] || 'all'}
      onValueChange={(val) => {
        if (val === 'all') {
          onClear();
        } else {
          onClear();
          onToggle(val);
        }
      }}
    >
      <SelectTrigger
        className={`w-[220px] bg-surface-light dark:bg-surface-dark border-gray-200 dark:border-gray-700 ${className || ''}`}
      >
        <SelectValue placeholder="Filtrar por projeto" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos os projetos</SelectItem>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ProjectFilterSelect;
