import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, User, KeyRound, ShieldCheck, Sparkles } from 'lucide-react';
import { login, register, resetPassword } from '../services/auth.service';
import toast from 'react-hot-toast';
import logo from '../assets/logo.webp';
import loginScreenLeft from '../assets/login-screen-left.png';
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
    'w-full rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none transition-all duration-200 text-sm';
  const inputWithIcon = `${inputBase} pl-11 pr-4 py-3.5`;
  const inputWithTrailing = `${inputBase} pl-11 pr-11 py-3.5`;
  const labelBase = 'block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2';

  const GoogleButton = ({ label }: { label: string }) => (
    <button
      type="button"
      onClick={() => googleLogin()}
      disabled={loading}
      className="cursor-pointer w-full flex justify-center items-center gap-3 py-3.5 px-4 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-sm font-semibold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:outline-none focus:ring-4 focus:ring-primary/15 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="relative my-1">
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
      className="cursor-pointer w-full group relative flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary to-sky-500 hover:from-sky-500 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
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
      {/* Decorative Side - LEFT */}
      <div className="hidden md:flex md:w-1/2 lg:w-[45%] relative overflow-hidden">
        <img
          src={loginScreenLeft}
          alt="ConnectaCI"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 via-secondary/70 to-primary/60 dark:from-secondary/95 dark:via-secondary/85 dark:to-primary/50" />

        {/* Decorative blurred orbs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-16 w-80 h-80 bg-sky-400/30 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-10 lg:p-14 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="ConnectaCI"
              className="h-11 w-11 rounded-xl shadow-lg shadow-black/20 ring-1 ring-white/20"
            />
            <span className="font-display font-bold text-2xl tracking-tight">
              Connecta<span className="text-primary">CI</span>
            </span>
          </div>

          {/* Tagline */}
          <div className="space-y-6 max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide">
              <Sparkles size={14} className="text-primary" />
              Gamificação Acadêmica
            </div>
            <h2 className="font-display font-extrabold text-4xl lg:text-5xl leading-tight tracking-tight">
              Aprenda, conecte e <span className="text-primary">conquiste</span>.
            </h2>
            <p className="text-base lg:text-lg text-white/80 leading-relaxed">
              Transforme sua jornada acadêmica em uma experiência colaborativa com rankings, missões e conquistas.
            </p>

            {/* Mini stats row */}
            <div className="flex items-center gap-6 pt-4 border-t border-white/15">
              <div>
                <div className="font-display font-bold text-2xl">+500</div>
                <div className="text-xs text-white/70 uppercase tracking-wider">Alunos</div>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div>
                <div className="font-display font-bold text-2xl">+50</div>
                <div className="text-xs text-white/70 uppercase tracking-wider">Projetos</div>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div>
                <div className="font-display font-bold text-2xl">24/7</div>
                <div className="text-xs text-white/70 uppercase tracking-wider">Ativo</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 text-xs text-white/60">
            <ShieldCheck size={14} />
            <span>Plataforma segura e criptografada</span>
          </div>
        </div>
      </div>

      {/* Form Side - RIGHT */}
      <div className="w-full md:w-1/2 lg:w-[55%] flex items-center justify-center p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        {/* Decorative blurs behind form */}
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-200/40 dark:bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Mobile logo (only visible on small screens) */}
        <div className="md:hidden absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          <img src={logo} alt="ConnectaCI" className="h-9 w-9 rounded-lg shadow-md" />
          <span className="font-display font-bold text-xl text-secondary dark:text-white">
            Connecta<span className="text-primary">CI</span>
          </span>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-secondary dark:text-white tracking-tight mb-2">
              {view === 'login' && 'Bem-vindo de volta'}
              {view === 'register' && 'Crie sua conta'}
              {view === 'forgot-password' && 'Recuperar senha'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {view === 'login' && 'Acesse sua conta para continuar sua jornada.'}
              {view === 'register' && 'Preencha os dados abaixo para começar.'}
              {view === 'forgot-password' && 'Use sua palavra secreta para redefinir.'}
            </p>
          </div>

          {/* Segmented toggle - only for login/register */}
          {view !== 'forgot-password' && (
            <div className="relative flex p-1 mb-7 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => switchView('login')}
                className={`cursor-pointer relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${view === 'login'
                    ? 'text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => switchView('register')}
                className={`cursor-pointer relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${view === 'register'
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
            <div className="space-y-5">
              <GoogleButton label="Continuar com Google" />
              <Divider text="Ou com email" />

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className={labelBase} htmlFor="email">Email ou usuário</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
                  <div className="flex items-center justify-between mb-2">
                    <label className={`${labelBase} mb-0`} htmlFor="password">Senha</label>
                    <button
                      type="button"
                      onClick={() => switchView('forgot-password')}
                      className="cursor-pointer text-xs font-semibold text-primary hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
                    >
                      Esqueceu?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <PrimaryButton>Entrar na Plataforma</PrimaryButton>
                </div>
              </form>
            </div>
          )}

          {view === 'register' && (
            <div className="space-y-5">
              <GoogleButton label="Registrar com Google" />
              <Divider text="Ou com email" />

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelBase}>Nome</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
                      <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
                  <label className={labelBase}>Senha (mínimo 6 caracteres)</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelBase}>Confirme a senha</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <PrimaryButton>Criar minha conta</PrimaryButton>
                </div>
              </form>
            </div>
          )}

          {view === 'forgot-password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className={labelBase}>Email ou usuário</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelBase}>Palavra secreta</label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className={inputWithIcon}
                    placeholder="Pergunte a um diretor"
                    value={secretWord}
                    onChange={(e) => setSecretWord(e.target.value)}
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  A palavra secreta é fornecida pela direção da instituição.
                </p>
              </div>

              <div className="pt-2">
                <PrimaryButton>Redefinir senha</PrimaryButton>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="cursor-pointer text-sm font-semibold text-primary hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
                >
                  ← Voltar para o login
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} ConnectaCI · Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
