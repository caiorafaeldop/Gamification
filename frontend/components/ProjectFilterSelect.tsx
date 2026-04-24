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
}

const ProjectFilterSelect: React.FC<ProjectFilterSelectProps> = ({
  projects,
  selectedProjectIds,
  onToggle,
  onClear,
}) => {
  if (projects.length === 0) return null;

  return (
    <div className="mt-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Filtrar por projeto
          </p>
          <p className="text-[11px] text-gray-400">
            {selectedProjectIds.length === 0
              ? 'Exibindo ranking global de todos os projetos.'
              : 'Exibindo ranking exclusivo do projeto selecionado.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select 
            value={selectedProjectIds[0] || "all"} 
            onValueChange={(val) => {
              if (val === "all") {
                onClear();
              } else {
                // Se já estiver selecionado, não faz nada (ou limpa se quiser toggle)
                // Mas num Select padrão, mudar o valor é o esperado.
                // Como o RankingScreen usa setSelectedProjectIds([id]), vamos adaptar.
                onClear(); // Limpa anterior
                onToggle(val); // Seleciona novo
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-[250px] bg-gray-50 dark:bg-surface-darker border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Selecionar Projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🌐 Todos os Projetos (Global)</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ProjectFilterSelect;
