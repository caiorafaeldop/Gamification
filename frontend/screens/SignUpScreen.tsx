// import { SignUp } from '@clerk/clerk-react';
import { Rocket } from 'lucide-react';
import logo from '../assets/logo.webp';
// import { clerkAppearance } from '../clerkAppearance';

const SignUpScreen = () => {
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
            Crie sua conta e comece a colaborar com equipes, acompanhar seu progresso gamificado e muito mais.
          </p>
        </div>
      </div>

      {/* Clerk SignUp Side - Comentado */}
      <div className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-10 group cursor-pointer inline-flex items-center gap-3 px-5 py-3.5 rounded-md bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white dark:border-white/10 shadow-xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-300">
              <img src={logo} alt="ConnectaCI Logo" className="h-10 w-auto rounded-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform" />
              <span className="font-display font-bold text-2xl text-secondary dark:text-white tracking-tight">
                Connecta<span className="text-primary">CI</span>
              </span>
            </div>
          </div>

          {/* <div className="flex justify-center">
            <SignUp
              signInUrl="/#/"
              forceRedirectUrl="/dashboard"
              appearance={clerkAppearance as any}
            />
          </div> */}
          <p className="text-center text-gray-500 dark:text-gray-400">Cadastro via formulário na tela de login.</p>
        </div>
      </div>
    </div>
  );
};

export default SignUpScreen;
