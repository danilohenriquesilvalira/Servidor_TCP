// Página de Login EDP - Design System Oficial EDP 2025
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { Notification, useNotification } from '@/components/ui/Notification';

const loginSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const { notification, showNotification, hideNotification } = useNotification();

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Hook para detectar resolução da tela
  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Função para determinar o breakpoint atual
  const getCurrentBreakpoint = () => {
    const width = screenSize.width;
    if (width >= 3840) return '6xl (3840px+)';
    if (width >= 2560) return '5xl (2560px+)';
    if (width >= 1920) return '4xl (1920px+)';
    if (width >= 1440) return '3xl (1440px+)';
    if (width >= 1280) return '2xl (1280px+)';
    if (width >= 1024) return 'xl (1024px+)';
    if (width >= 768) return 'lg (768px+)';
    if (width >= 425) return 'md (425px+)';
    if (width >= 375) return 'sm (375px+)';
    if (width >= 320) return 'xs (320px+)';
    return 'xs (< 320px)';
  };

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      showNotification('Login realizado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro no login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-edp-marine flex items-center justify-center">
        <div className="text-white text-lg font-edp">Carregando...</div>
      </div>
    );
  }

  return (
    <>
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
      
      {screenSize.width > 0 && (
        <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-sm font-mono border border-gray-500">
          <div className="text-edp-electric font-bold font-tech">🖥️ DEBUG SCREEN</div>
          <div className='font-tech'>Resolução: {screenSize.width} x {screenSize.height}</div>
          <div className='font-tech'>Breakpoint: <span className="text-edp-ice font-bold">{getCurrentBreakpoint()}</span></div>
          <div className="text-xs text-edp-neutral-light mt-1 font-tech">Redimensione para testar</div>
        </div>
      )}

      {/* Contêiner Principal - Fundo EDP Marine */}
      <div className="min-h-screen bg-edp-marine flex items-center justify-center p-6 lg:p-12 overflow-hidden">
        
        {/* Card Grande Centralizado para o Efeito 3D */}
        <div className="w-full max-w-5xl bg-edp-spruce rounded-3xl py-12 px-8 flex flex-col justify-center items-center text-center shadow-2xl animate-fade-in-right space-y-8">
            
            {/* Logo EDP no topo */}
            <div>
                <img 
                    src="/LOGO_EDP_2025.svg" 
                    alt="Logo EDP 2025" 
                    className="h-28 w-auto object-contain mx-auto"
                />
            </div>

            {/* Card de Login Centralizado no Meio */}
            <div className="w-full max-w-sm">
                <div className="w-full bg-edp-spruce/40 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:p-8 shadow-xl text-white">
                    {/* Header do Card de Login */}
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-edp font-semibold text-white">Acesso ao Sistema HMI</h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
                        {/* Input Email */}
                        <div className="space-y-2">
                            <label className="block text-sm font-edp font-medium text-white/90">
                                Email
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-white/60 group-focus-within:text-edp-electric transition-all duration-300" />
                                </div>
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="seu.email@edp.com"
                                    className="w-full h-14 pl-12 pr-4 text-base font-edp font-medium text-white placeholder-white/50 bg-white/10 border border-white/20 rounded-xl focus:border-edp-electric focus:bg-white/15 focus:outline-none focus:ring-0 transition-all duration-300 hover:border-white/30"
                                    autoComplete="email"
                                />
                                {errors.email && (
                                    <div className="text-edp-semantic-red font-edp text-sm mt-2 ml-1">
                                        {errors.email.message}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Input Senha */}
                        <div className="space-y-2">
                            <label className="block text-sm font-edp font-medium text-white/90">
                                Senha
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-white/60 group-focus-within:text-edp-electric transition-all duration-300" />
                                </div>
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••••"
                                    className="w-full h-14 pl-12 pr-12 text-base font-edp font-medium text-white placeholder-white/50 bg-white/10 border border-white/20 rounded-xl focus:border-edp-electric focus:bg-white/15 focus:outline-none focus:ring-0 transition-all duration-300 hover:border-white/30"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-4 flex items-center text-white/60 hover:text-edp-electric group-focus-within:text-edp-electric transition-all duration-300 focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                                {errors.password && (
                                    <div className="text-edp-semantic-red font-edp text-sm mt-2 ml-1">
                                        {errors.password.message}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Botão Login */}
                        <div className="pt-2 text-center">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 text-base font-edp font-semibold bg-edp-electric hover:bg-edp-electric/90 text-edp-marine rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-3 shadow-[0_8px_32px_rgba(40,255,82,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-3">
                                        <div className="w-5 h-5 border-2 border-edp-marine/30 border-t-edp-marine rounded-full animate-spin"></div>
                                        <span>Entrando no sistema...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>Entrar</span>
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Slogan e Footer na parte de baixo */}
            <div className="pb-8 text-white">
                <h1 className="text-2xl font-display font-bold text-white drop-shadow-lg">
                    Inovação e <br /> Energia Conectada
                </h1>
                <p className="mt-4 text-edp-neutral-light/80 text-lg font-edp max-w-sm mx-auto">
                    O futuro da energia começa aqui. Bem-vindo ao Sistema HMI Industrial.
                </p>
                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <div className="space-y-3">
                        <div className="flex items-center justify-center space-x-2 text-sm font-edp">
                            <span className="text-white/60">Desenvolvido por</span>
                            <span className="font-bold text-edp-electric">EDP Portugal</span>
                        </div>
                        <div className="text-xs font-edp text-white/40">
                            © 2025 • Sistema HMI Industrial • Todos os direitos reservados
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}