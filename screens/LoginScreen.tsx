import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Rocket, Mail, Lock, EyeOff } from 'lucide-react';
import { login } from '../services/auth.service';

const LoginScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user)); // Store user info
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Falha ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-gray-100 font-sans transition-colors duration-300 min-h-screen flex flex-col md:flex-row">
      {/* Decorative Side */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 relative bg-secondary overflow-hidden items-center justify-center p-12 text-center text-white">
        <div className="absolute inset-0 z-0 bg-network-pattern opacity-30"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-600/30 rounded-full blur-3xl"></div>
        <div className="relative z-10 max-w-lg">
          <div className="mb-8 inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl border border-primary/20 backdrop-blur-sm">
            <Rocket size={48} className="text-primary" />
          </div>
          <h2 className="text-4xl font-display font-bold mb-6 leading-tight">
            Transforme seus projetos em <span className="text-primary">conquistas</span>
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Acesse o ecossistema Connecta para gerenciar suas atividades, colaborar com equipes e acompanhar seu progresso gamificado.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 mb-8 group cursor-pointer">
              <div className="relative w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
                <Network size={20} />
              </div>
              <span className="font-display font-bold text-2xl text-secondary dark:text-white tracking-tight">
                connecta<span className="text-primary">CI</span>
              </span>
            </div>
            <h1 className="text-3xl font-display font-extrabold text-secondary dark:text-white mb-2">Bem-vindo de volta!</h1>
            <p className="text-gray-500 dark:text-gray-400">Insira suas credenciais para acessar sua conta.</p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">E-mail Institucional</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={20} className="text-gray-400" />
                  </div>
                  <input
                    className="pl-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-surface-dark dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-3 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                    id="email"
                    name="email"
                    placeholder="exemplo@academico.ufpb.br"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">Senha</label>
                  <a className="text-sm font-semibold text-primary hover:text-sky-400 transition-colors" href="#">Esqueceu a senha?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    className="pl-10 pr-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-surface-dark dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-3 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <EyeOff size={20} />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <button
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar na Plataforma'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;