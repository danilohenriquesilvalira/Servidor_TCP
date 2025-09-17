// Página de Login EDP - Design System Oficial EDP 2025 - RESPONSIVIDADE CORRIGIDA
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { Notification, useNotification } from '@/components/ui/Notification';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const loginSchema = z.object({
  username: z.string().min(1, 'Nome de usuário é obrigatório').min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
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
      await login(data.username, data.password);
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

      {/* Contêiner Principal - RESPONSIVIDADE CORRIGIDA */}
      <div className="min-h-screen bg-edp-marine flex items-center justify-center px-4 py-6 lg:px-8 relative overflow-hidden">
        
        {/* Logo EDP Grande no Canto Superior Esquerdo - MOBILE FIRST RESPONSIVO */}
        <div className="absolute -top-[10%] -left-[10%] xs:-top-[12%] xs:-left-[12%] sm:-top-[15%] sm:-left-[15%] md:-top-[20%] md:-left-[20%] lg:-top-[25%] lg:-left-[22.5%] xl:-top-[30%] xl:-left-[25%] 2xl:-top-[35%] 2xl:-left-[27.5%] z-0">
          <img 
            src="/Logo_EDP.svg" 
            alt="EDP Logo Background" 
            className="w-[40vw] min-w-[120px] xs:w-[42vw] sm:w-[45vw] md:w-[48vw] lg:w-[50vw] xl:w-[52vw] 2xl:w-[55vw] h-auto object-contain transform rotate-12 opacity-90"
          />
        </div>
        
        {/* Card Principal Centralizado - LARGURAS CONTROLADAS */}
        <div className="w-full max-w-xs mx-auto sm:max-w-sm md:max-w-md lg:max-w-md xl:max-w-lg 2xl:max-w-lg 3xl:max-w-xl relative z-10">
          
          <div className="bg-edp-spruce rounded-2xl sm:rounded-3xl py-5 sm:py-6 lg:py-8 px-5 sm:px-6 lg:px-8 shadow-2xl animate-fade-in-right">
            
            {/* Logo EDP no topo */}
            <div className="text-center mb-4 sm:mb-5">
              <img 
                src="/LOGO_EDP_2025.svg" 
                alt="Logo EDP 2025" 
                className="h-12 sm:h-14 lg:h-16 w-auto object-contain mx-auto"
              />
            </div>

            {/* Card de Login - CONTAINER RESPONSIVO CORRIGIDO */}
            <div className="w-full">
              <div className="bg-edp-spruce/40 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl text-white">
                
                {/* Header do Card de Login */}
                <div className="text-center mb-3 sm:mb-4">
                  <h2 className="text-base sm:text-lg font-edp font-semibold text-white">
                    Acesso ao Sistema HMI
                  </h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
                  
                  {/* Input Username - COMPONENTE PADRONIZADO */}
                  <Input
                    {...register('username')}
                    type="text"
                    label="Nome de Usuário"
                    placeholder="admin"
                    error={errors.username?.message}
                    leftIcon={<UserIcon className="h-5 w-5" />}
                    autoComplete="nope"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    variant="login"
                    data-form-type="other"
                  />

                  {/* Input Senha - COMPONENTE PADRONIZADO */}
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    label="Senha"
                    placeholder="••••••••••"
                    error={errors.password?.message}
                    leftIcon={<LockClosedIcon className="h-5 w-5" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-white/60 hover:text-edp-electric transition-colors focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    }
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    variant="login"
                    data-form-type="other"
                  />

                  {/* Botão Login - COMPONENTE PADRONIZADO */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isLoading}
                      disabled={isLoading}
                      className="w-full bg-edp-electric hover:bg-edp-electric/90 text-edp-marine shadow-[0_8px_32px_rgba(40,255,82,0.3)] transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <>
                          <span className="hidden sm:inline">Entrando no sistema...</span>
                          <span className="sm:hidden">Entrando...</span>
                        </>
                      ) : (
                        <>
                          Entrar
                          <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Footer Compacto */}
            <div className="mt-4 pt-3 border-t border-white/5 text-center">
              <div className="flex items-center justify-center space-x-2 text-xs font-edp text-white/60">
                <span>Desenvolvido por</span>
                <span className="font-bold text-edp-electric">EDP Portugal</span>
                <span>© 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}