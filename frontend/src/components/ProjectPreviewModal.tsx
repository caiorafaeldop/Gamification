import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, LogIn } from 'lucide-react';
import type { CatalogProject } from '../services/catalog.service';

interface ProjectPreviewModalProps {
  project: CatalogProject;
  onClose: () => void;
}

const ProjectPreviewModal: React.FC<ProjectPreviewModalProps> = ({ project, onClose }) => {
  const navigate = useNavigate();

  const goLogin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    navigate(`/login?returnTo=${encodeURIComponent(`/project-details/${project.id}`)}`);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-surface-light p-6 shadow-2xl dark:bg-surface-dark"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <h2 className="pr-8 text-xl font-display font-extrabold text-secondary dark:text-white">
          {project.title}
        </h2>

        <p className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {project.description || 'Sem descrição.'}
        </p>

        <p className="mt-5 text-xs text-gray-500 dark:text-gray-400">
          Para ver mais detalhes, faça login.
        </p>

        <button
          type="button"
          onClick={goLogin}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-sky-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.01]"
        >
          <LogIn size={16} /> Entrar
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ProjectPreviewModal;
