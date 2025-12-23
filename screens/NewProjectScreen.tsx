import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Type, Hash, Users, Award, ArrowLeft, Rocket, LayoutGrid, Crown, Target, Loader } from 'lucide-react';
import { createProject } from '../services/project.service';

const NewProjectScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
      name: '',
      description: '',
      category: 'Desenvolvimento',
      tags: '',
      maxMembers: 4,
      rewardPoints: 1500
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await createProject(formData);
          alert('Projeto criado com sucesso!');
          navigate('/projects');
      } catch (err: any) {
          alert('Erro ao criar projeto: ' + (err.response?.data?.message || err.message));
      } finally {
          setLoading(false);
      }
  };

  const handleChange = (e: any) => {
      setFormData({ ...formData, [e.target.name]: e.target.value }); // Note: name attribute needed on inputs
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary mb-6 transition-colors text-sm font-bold"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <header className="mb-8">
        <h1 className="text-3xl font-display font-extrabold text-secondary dark:text-white mb-2">
          Criar Novo Projeto
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Inicie uma nova jornada acadêmica. Defina objetivos claros e recrute sua equipe.
        </p>
      </header>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-8" onSubmit={handleSubmit}>
        
        {/* Main Form Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
            
            <h3 className="text-lg font-bold text-secondary dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
              Informações Básicas
            </h3>

            {/* Leader Info (Visual only) */}
            <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-xl flex items-center gap-4 border border-primary/10">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                 <Crown size={20} />
              </div>
              <div>
                 <p className="text-xs font-bold text-primary uppercase tracking-wide">Líder do Projeto</p>
                 <p className="text-sm font-bold text-secondary dark:text-white">Você</p>
              </div>
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Type size={16} className="text-primary" /> Nome do Projeto
              </label>
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                type="text" 
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white placeholder-gray-400 font-medium"
                placeholder="Ex: App de Realidade Aumentada para Biologia"
              />
            </div>

             {/* Description & Objectives */}
             <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Target size={16} className="text-primary" /> Objetivos do Projeto
              </label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white placeholder-gray-400 resize-none"
                placeholder="Descreva os objetivos principais..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <LayoutGrid size={16} className="text-primary" /> Categoria
                  </label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white cursor-pointer appearance-none">
                    <option>Desenvolvimento</option>
                    <option>Design & UX</option>
                    <option>Pesquisa Acadêmica</option>
                    <option>Data Science</option>
                    <option>Marketing</option>
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Hash size={16} className="text-primary" /> Tags
                  </label>
                  <input 
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-secondary dark:text-white placeholder-gray-400"
                    placeholder="react, python, ia..."
                  />
                </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-2">
              <button 
                type="button" 
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader className="animate-spin" size={20} /> : <Rocket size={20} />} Lançar Projeto
              </button>
            </div>
        </div>

        {/* Settings Column */}
        <div className="space-y-6">
           {/* Gamification Settings */}
           <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Gamificação</h3>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Award size={16} className="text-yellow-500" /> Recompensa de Conclusão (CP)
                    </label>
                    <input 
                      name="rewardPoints"
                      value={formData.rewardPoints}
                      onChange={handleChange}
                      type="number" 
                      className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary text-secondary dark:text-white font-bold"
                      placeholder="1000"
                    />
                    <p className="text-xs text-gray-400 mt-1">Connecta Points (CP) distribuídos à equipe ao finalizar o projeto.</p>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Users size={16} className="text-sky-500" /> Vagas na Equipe
                    </label>
                    <input 
                      name="maxMembers"
                      value={formData.maxMembers}
                      onChange={handleChange}
                      type="number" 
                      className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary text-secondary dark:text-white font-bold"
                      placeholder="5"
                    />
                 </div>
              </div>
           </div>

           {/* Cover Image Upload - Visual for now */}
           <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Capa do Projeto</h3>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload size={20} className="text-primary" />
                  </div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Clique para upload</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG até 5MB</p>
              </div>
           </div>
        </div>

      </form>
    </div>
  );
};

export default NewProjectScreen;