import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, User, KeyRound, Code2, Braces, Rocket, Users, Globe } from 'lucide-react';
import { login, register, resetPassword } from '../services/auth.service';
import toast from 'react-hot-toast';
import logo from '../assets/logo.webp';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../services/api';

type View = 'login' | 'register' | 'forgot-password';

const LoginScreen = () => {
  const navigate = useNavigate();

  const [view, setView] = useState<View>('login');

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleGoogleSuccess = async (tokenResponse: any) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google', { token: tokenResponse.access_token });
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao entrar com Google.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Falha no login com Google.'),
  });

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setConfirmPassword('');
    setNewPassword('');
    setSecretWord('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowNewPassword(false);
  };

  const switchView = (next: View) => {
    resetForm();
    setView(next);
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

  const inputBase =
    'w-full rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none transition-all duration-200 text-[11px]';
  const inputWithIcon = `${inputBase} pl-9 pr-4 py-1.5`;
  const inputWithTrailing = `${inputBase} pl-9 pr-9 py-1.5`;
  const labelBase = 'block text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1';

  const GoogleButton = ({ label }: { label: string }) => (
    <button
      type="button"
      onClick={() => googleLogin()}
      disabled={loading}
      className="cursor-pointer w-full flex justify-center items-center gap-3 py-2 px-4 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-[10px] font-semibold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:outline-none focus:ring-4 focus:ring-primary/15 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      {label}
    </button>
  );

  const Divider = ({ text }: { text: string }) => (
    <div className="relative my-0.5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="px-3 bg-background-light dark:bg-background-dark text-slate-400 dark:text-slate-500 uppercase tracking-widest font-medium">{text}</span>
      </div>
    </div>
  );

  const PrimaryButton = ({ children }: { children: React.ReactNode }) => (
    <button
      className="cursor-pointer w-full group relative flex justify-center items-center gap-2 py-2 px-4 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r from-primary to-sky-500 hover:from-sky-500 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
      type="submit"
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <>
          <span>{children}</span>
          <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
        </>
      )}
    </button>
  );

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-gray-100 font-sans min-h-screen flex flex-col md:flex-row">
      {/* LEFT - Connecta Hub panel, 50% */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-slate-950 min-h-screen">
        {/* Deep gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#050b1e] to-[#020617]" />

        {/* Blurred orbs */}
        <div className="absolute top-1/3 -left-40 w-[30rem] h-[30rem] bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-[30rem] h-[30rem] bg-sky-500/10 rounded-full blur-3xl" />

        {/* Dotted grid */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(56,189,248,0.9) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Code snippet - top left */}
        <pre className="absolute top-8 left-8 text-[11px] font-mono text-slate-500/70 leading-relaxed pointer-events-none select-none whitespace-pre">
{`// Connecta Hub
const network = true;
let ideias = conectar();

function transformar() {
  return impacto;
}`}
        </pre>

        {/* Tags - top right */}
        <div className="absolute top-8 right-8 text-[11px] font-mono text-slate-500/70 text-right leading-relaxed pointer-events-none select-none">
          <div>&lt;Connecta /&gt;</div>
          <div>&lt;Hub ativo /&gt;</div>
          <div>&lt;Inovação /&gt;</div>
        </div>

        {/* Comments - bottom left */}
        <div className="absolute bottom-8 left-8 text-[11px] font-mono text-slate-500/70 leading-relaxed pointer-events-none select-none">
          <div>// networking</div>
          <div>// inovação</div>
          <div>// empreendedorismo</div>
          <div>// código</div>
          <div>// impacto</div>
        </div>

        {/* Floating icon badges */}
        <div className="absolute top-[26%] left-10 w-11 h-11 rounded-lg border border-primary/30 bg-primary/5 backdrop-blur flex items-center justify-center">
          <Code2 size={18} className="text-primary/80" />
        </div>
        <div className="absolute top-[26%] right-10 w-11 h-11 rounded-lg border border-primary/30 bg-primary/5 backdrop-blur flex items-center justify-center">
          <Braces size={18} className="text-primary/80" />
        </div>
        <div className="absolute bottom-[38%] left-10 w-11 h-11 rounded-lg border border-primary/30 bg-primary/5 backdrop-blur flex items-center justify-center">
          <Rocket size={18} className="text-primary/80" />
        </div>
        <div className="absolute bottom-[38%] right-10 w-11 h-11 rounded-lg border border-primary/30 bg-primary/5 backdrop-blur flex items-center justify-center">
          <Users size={18} className="text-primary/80" />
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white text-center">
          <img
            src={logo}
            alt="Connecta"
            className="h-20 w-20 rounded-2xl shadow-2xl shadow-primary/40 ring-1 ring-primary/40 mb-5"
          />
          <h1 className="font-display font-extrabold text-5xl tracking-tight mb-10">
            Connecta<span className="text-primary">CI</span>
          </h1>

          <p className="text-slate-300 text-base">bem-vindo ao</p>
          <h2 className="font-display font-bold text-3xl text-primary mb-2 flex items-center gap-2">
            Connecta Hub <Globe size={26} />
          </h2>

          <div className="flex items-center gap-2 my-4">
            <div className="h-px w-16 bg-primary/40" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <div className="h-px w-16 bg-primary/40" />
          </div>

          <p className="font-bold text-lg mb-1">Networking acadêmico</p>
          <p className="text-slate-300 text-sm">
            onde <span className="text-primary font-semibold">Empresas</span> se conectam com a{' '}
            <span className="text-primary font-semibold">academia</span>
          </p>

          {/* Discord CTA */}
          <a
            href="https://discord.gg/NfJe4vUdAj"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 w-full max-w-sm flex items-center gap-4 p-4 rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur hover:border-primary/60 hover:bg-primary/10 transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/40">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor" aria-hidden="true">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs text-slate-300">entre também na nossa</p>
              <p className="font-bold text-sm text-white">
                <span className="text-primary">comunidade</span> no <span className="text-primary">discord</span>
              </p>
            </div>
            <ArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* RIGHT - Form side, 50% (top-aligned so toggle doesn't jump on view change) */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-start p-6 sm:p-8 lg:p-10 lg:pt-2 relative overflow-hidden min-h-screen">
        {/* Decorative blurs */}
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-200/40 dark:bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2 mb-6 z-10">
          <img src={logo} alt="ConnectaCI" className="h-9 w-9 rounded-lg shadow-md" />
          <span className="font-display font-bold text-xl text-secondary dark:text-white">
            Connecta<span className="text-primary">CI</span>
          </span>
        </div>

        <div className="relative z-10 w-full max-w-md mt-4 md:mt-2">
          {/* Header */}
          <div className="mb-5">
            <h1 className="font-display font-extrabold text-xl sm:text-2xl text-secondary dark:text-white tracking-tight mb-1">
              {view === 'login' && 'Bem-vindo de volta'}
              {view === 'register' && 'Crie sua conta'}
              {view === 'forgot-password' && 'Recuperar senha'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              {view === 'login' && 'Acesse sua conta para continuar sua jornada.'}
              {view === 'register' && 'Preencha os dados abaixo para começar.'}
              {view === 'forgot-password' && 'Use sua palavra secreta para redefinir.'}
            </p>
          </div>

          {/* Segmented toggle - only for login/register */}
          {view !== 'forgot-password' && (
            <div className="relative flex p-1 mb-5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => switchView('login')}
                className={`cursor-pointer relative z-10 flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 ${view === 'login'
                    ? 'text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => switchView('register')}
                className={`cursor-pointer relative z-10 flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 ${view === 'register'
                    ? 'text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
              >
                Cadastrar
              </button>
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-lg bg-gradient-to-r from-primary to-sky-500 shadow-md shadow-primary/25 transition-all duration-300 ${view === 'login' ? 'left-1' : 'left-[calc(50%+0rem)]'
                  }`}
              />
            </div>
          )}

          {view === 'login' && (
            <div className="space-y-4">
              <GoogleButton label="Continuar com Google" />
              <Divider text="Ou com email" />

              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className={labelBase} htmlFor="email">Email ou usuário</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className={inputWithIcon}
                      id="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`${labelBase} mb-0`} htmlFor="password">Senha</label>
                    <button
                      type="button"
                      onClick={() => switchView('forgot-password')}
                      className="cursor-pointer text-[9px] font-semibold text-primary hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
                    >
                      Esqueceu?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className={inputWithTrailing}
                      id="password"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="cursor-pointer absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <PrimaryButton>Entrar na Plataforma</PrimaryButton>
                </div>
              </form>
            </div>
          )}

          {view === 'register' && (
            <div className="space-y-4">
              <GoogleButton label="Registrar com Google" />
              <Divider text="Ou com email" />

              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelBase}>Nome</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        className={inputWithIcon}
                        placeholder="Nome"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        autoComplete="given-name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelBase}>Sobrenome</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        className={inputWithIcon}
                        placeholder="Sobrenome"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        autoComplete="family-name"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelBase}>Email ou usuário</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className={inputWithIcon}
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelBase}>Senha (6+)</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        className={inputWithTrailing}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="cursor-pointer absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelBase}>Confirmar</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        className={inputWithTrailing}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((s) => !s)}
                        className="cursor-pointer absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <PrimaryButton>Criar minha conta</PrimaryButton>
                </div>
              </form>
            </div>
          )}

          {view === 'forgot-password' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className={labelBase}>Email ou usuário</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className={inputWithIcon}
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className={labelBase}>Nova senha</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className={inputWithTrailing}
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Nova senha (mínimo 6)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((s) => !s)}
                    className="cursor-pointer absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label={showNewPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelBase}>Palavra secreta</label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className={inputWithIcon}
                    placeholder="Pergunte a um diretor"
                    value={secretWord}
                    onChange={(e) => setSecretWord(e.target.value)}
                    required
                  />
                </div>
                <p className="mt-1 text-[9px] text-slate-500 dark:text-slate-400">
                  A palavra secreta é fornecida pela direção da instituição.
                </p>
              </div>

              <div className="pt-1">
                <PrimaryButton>Redefinir senha</PrimaryButton>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="cursor-pointer text-xs font-semibold text-primary hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
                >
                  ← Voltar para o login
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <p className="mt-6 text-center text-[10px] text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} ConnectaCI · Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
