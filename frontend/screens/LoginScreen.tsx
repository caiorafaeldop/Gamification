import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Rocket, Mail, Lock, EyeOff, Loader2 } from 'lucide-react';
import { login, register, resetPassword } from '../services/auth.service';
import toast from 'react-hot-toast';
import logo from '../assets/logo2.png';

const LoginScreen = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'register' | 'forgot-password'>('login');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register specific
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot Password specific
  const [newPassword, setNewPassword] = useState('');
  const [secretWord, setSecretWord] = useState('');

  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setConfirmPassword('');
    setNewPassword('');
    setSecretWord('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao entrar.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      await register(fullName, email, password);
      toast.success('Conta criada com sucesso! Faça login.');
      setTimeout(() => {
        resetForm();
        setView('login');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao registrar.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      if (secretWord !== 'ciconectado') {
        // Client-side check helpful but backend is source of truth. 
        // We can submit anyway or check here. Backend checks `ciconectado` securely.
      }
      await resetPassword(email, newPassword, secretWord);
      toast.success('Senha redefinida com sucesso! Faça login.');
      setTimeout(() => {
        resetForm();
        setView('login');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao redefinir senha.');
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
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 max-w-lg">
          <div className="mb-8 inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl border border-primary/20 backdrop-blur-sm">
            <Rocket size={48} className="text-primary" />
          </div>
          <h2 className="text-4xl font-display font-bold mb-6 leading-tight">
            Transforme seus projetos em <span className="text-primary">conquistas</span>
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Acesse o ecossistema FACENE/FAMENE para gerenciar suas atividades, colaborar com equipes e acompanhar seu progresso gamificado.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-10 group cursor-pointer inline-flex items-center gap-3 px-5 py-3.5 rounded-md bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white dark:border-white/10 shadow-xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-300" onClick={() => { resetForm(); setView('login'); }}>
              <img src={logo} alt="FACENE/FAMENE Logo" className="h-10 w-auto rounded-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform" />
              <span className="font-display font-bold text-2xl text-secondary dark:text-white tracking-tight">
                FACENE/<span className="text-primary">FAMENE</span>
              </span>
            </div>

            <h1 className="text-3xl font-display font-extrabold text-secondary dark:text-white mb-2">
              {view === 'login' && 'Bem-vindo de volta!'}
              {view === 'register' && 'Crie sua conta'}
              {view === 'forgot-password' && 'Recuperar senha'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {view === 'login' && 'Insira suas credenciais para acessar sua conta.'}
              {view === 'register' && 'Preencha os dados abaixo para se registrar.'}
              {view === 'forgot-password' && 'Redefina sua senha usando a palavra secreta.'}
            </p>
          </div>



          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">Email ou Nome de Usuário</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={20} className="text-gray-400" />
                    </div>
                    <input
                      className="pl-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-surface-dark dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-3 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                      id="email"
                      placeholder="Email ou usuário"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">Senha</label>
                    <button type="button" onClick={() => { resetForm(); setView('forgot-password'); }} className="text-sm font-semibold text-primary hover:text-secondary transition-colors">Esqueceu a senha?</button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={20} className="text-gray-400" />
                    </div>
                    <input
                      className="pl-10 pr-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-surface-dark dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-3 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                      id="password"
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <button
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-0.5 disabled:opacity-80 disabled:cursor-not-allowed disabled:transform-none"
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar na Plataforma'}
              </button>
              <div className="text-center mt-4">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Não tem uma conta? </span>
                <button type="button" onClick={() => { resetForm(); setView('register'); }} className="text-primary font-bold hover:underline text-sm">Cadastre-se</button>
              </div>
            </form>
          )}

          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                    <input
                      className="block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-surface-dark dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-3 px-4"
                      placeholder="Nome"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sobrenome</label>
                    <input
                      className="block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-surface-dark dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-3 px-4"
                      placeholder="Sobrenome"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome de usuário ou Email</label>
                  <input
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-surface-dark dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-3 px-4"
                    placeholder="usuário ou email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha (mínimo 6 dígitos)</label>
                  <input
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-surface-dark dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-3 px-4"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Digite a senha novamente</label>
                  <input
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-surface-dark dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-3 px-4"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-0.5 disabled:opacity-80 disabled:cursor-not-allowed disabled:transform-none"
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Registrar'}
              </button>
              <div className="text-center mt-4">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Já tem uma conta? </span>
                <button type="button" onClick={() => { resetForm(); setView('login'); }} className="text-primary font-bold hover:underline text-sm">Entrar</button>
              </div>
            </form>
          )}

          {view === 'forgot-password' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email ou Nome de Usuário</label>
                  <input
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-surface-dark dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-3 px-4"
                    placeholder="Email ou usuário"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova Senha</label>
                  <input
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-surface-dark dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-3 px-4"
                    type="password"
                    placeholder="Novas senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qual a palavra secreta? (Pergunte a um diretor)</label>
                  <input
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-surface-dark dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-3 px-4"
                    placeholder="Palavra secreta"
                    value={secretWord}
                    onChange={(e) => setSecretWord(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-0.5 disabled:opacity-80 disabled:cursor-not-allowed disabled:transform-none"
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Redefinir Senha'}
              </button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => { resetForm(); setView('login'); }} className="text-primary font-bold hover:underline text-sm">Voltar para o Login</button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
