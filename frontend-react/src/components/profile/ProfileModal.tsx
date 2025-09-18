import React, { useState, useEffect } from 'react';
import { 
  UserIcon,
  PencilIcon,
  KeyIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/services/api';
import { VALID_ECLUSAS, VALID_STATUS } from '@/types/auth';
import { generateRandomAvatarUrl, getAllAvatars } from '@/utils/avatarUtils';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user: currentUser, updateUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form data for profile editing
  const [profileData, setProfileData] = useState({
    nome: currentUser?.nome || '',
    email: currentUser?.email || '',
    eclusa: currentUser?.eclusa || '',
    url_avatar: currentUser?.url_avatar || ''
  });

  // Form data for password change
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        nome: currentUser.nome,
        email: currentUser.email,
        eclusa: currentUser.eclusa,
        url_avatar: currentUser.url_avatar || ''
      });
    }
  }, [currentUser]);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateProfileForm = () => {
    const errors: Record<string, string> = {};
    
    if (!profileData.nome.trim()) errors.nome = 'Nome é obrigatório';
    if (!profileData.email.trim()) errors.email = 'Email é obrigatório';
    if (!profileData.email.includes('@')) errors.email = 'Email inválido';
    if (!profileData.eclusa) errors.eclusa = 'Eclusa é obrigatória';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};
    
    if (!passwordData.current_password) errors.current_password = 'Senha atual é obrigatória';
    if (!passwordData.new_password) errors.new_password = 'Nova senha é obrigatória';
    if (passwordData.new_password.length < 6) errors.new_password = 'Nova senha deve ter pelo menos 6 caracteres';
    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = 'Confirmação não confere com a nova senha';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) return;
    
    try {
      setSubmitting(true);
      setApiError('');
      
      await usersAPI.update(currentUser!.id, profileData);
      updateUser(profileData);
      setSuccessMessage('Perfil atualizado com sucesso!');
      setIsEditModalOpen(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao atualizar perfil';
      setApiError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;
    
    try {
      setSubmitting(true);
      setApiError('');
      
      await usersAPI.changePassword(currentUser!.id, {
        nova_senha: passwordData.new_password
      });
      
      setSuccessMessage('Senha alterada com sucesso!');
      setIsPasswordModalOpen(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao alterar senha';
      setApiError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = () => {
    setApiError('');
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const openPasswordModal = () => {
    setApiError('');
    setFormErrors({});
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    setIsPasswordModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    return status === VALID_STATUS[0] ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    return status === VALID_STATUS[0] ? CheckCircleIcon : XCircleIcon;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Main Profile Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Meu Perfil"
        size="xl"
      >
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <p className="text-green-800 font-medium text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Profile Main Section */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-edp-neutral-lighter rounded-lg">
              
              {/* Header */}
              <div className="px-4 py-3 border-b border-edp-neutral-lighter">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-edp-neutral-darkest font-edp">
                    Informações Pessoais
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openEditModal}
                    className="flex items-center gap-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Editar
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                
                {/* Avatar e Info Principal */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-edp-slate flex items-center justify-center overflow-hidden">
                    {currentUser.url_avatar ? (
                      <img 
                        src={currentUser.url_avatar} 
                        alt={currentUser.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-7 h-7 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-edp-neutral-darkest mb-1 font-edp">
                      {currentUser.nome}
                    </h4>
                    <p className="text-edp-neutral-dark text-sm mb-1">{currentUser.email}</p>
                    <p className="text-xs text-edp-neutral-medium">
                      ID EDP: {currentUser.id_usuario_edp}
                    </p>
                  </div>
                </div>

                {/* Grid de Informações */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Cargo */}
                  <div className="p-3 bg-edp-neutral-white-wash border border-edp-neutral-lighter rounded-lg">
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="w-4 h-4 text-edp-marine" />
                      <div>
                        <p className="text-xs text-edp-neutral-medium">Cargo</p>
                        <p className="font-semibold text-edp-neutral-darkest text-sm">{currentUser.cargo}</p>
                      </div>
                    </div>
                  </div>

                  {/* Eclusa */}
                  <div className="p-3 bg-edp-neutral-white-wash border border-edp-neutral-lighter rounded-lg">
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="w-4 h-4 text-edp-marine" />
                      <div>
                        <p className="text-xs text-edp-neutral-medium">Eclusa</p>
                        <p className="font-semibold text-edp-neutral-darkest text-sm">{currentUser.eclusa}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="p-3 bg-edp-neutral-white-wash border border-edp-neutral-lighter rounded-lg">
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className="w-4 h-4 text-edp-marine" />
                      <div>
                        <p className="text-xs text-edp-neutral-medium">Status</p>
                        <div className="flex items-center gap-1">
                          {React.createElement(getStatusIcon(currentUser.status), {
                            className: `w-3 h-3 ${getStatusColor(currentUser.status)}`
                          })}
                          <p className={`font-semibold text-sm ${getStatusColor(currentUser.status)}`}>
                            {currentUser.status === VALID_STATUS[0] ? 'Ativo' : 'Bloqueado'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Membro desde */}
                  <div className="p-3 bg-edp-neutral-white-wash border border-edp-neutral-lighter rounded-lg">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-edp-marine" />
                      <div>
                        <p className="text-xs text-edp-neutral-medium">Membro desde</p>
                        <p className="font-semibold text-edp-neutral-darkest text-sm">{formatDate(currentUser.criado_em)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            
            {/* Security Card */}
            <div className="bg-white border border-edp-neutral-lighter rounded-lg">
              <div className="px-4 py-3 border-b border-edp-neutral-lighter">
                <h4 className="font-semibold text-edp-neutral-darkest font-edp">
                  Segurança
                </h4>
              </div>
              
              <div className="p-4">
                <Button
                  variant="outline"
                  onClick={openPasswordModal}
                  className="w-full flex items-center justify-center gap-2 mb-3"
                  size="sm"
                >
                  <KeyIcon className="w-4 h-4" />
                  Alterar Senha
                </Button>
                
                <div className="p-2 bg-edp-neutral-white-wash rounded text-center">
                  <p className="text-xs text-edp-neutral-medium mb-1">Última atualização:</p>
                  <p className="text-xs text-edp-neutral-dark font-medium">{formatDate(currentUser.atualizado_em)}</p>
                </div>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="bg-white border border-edp-neutral-lighter rounded-lg">
              <div className="px-4 py-3 border-b border-edp-neutral-lighter">
                <h4 className="font-semibold text-edp-neutral-darkest font-edp">
                  Resumo da Conta
                </h4>
              </div>
              
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-edp-neutral-medium">Nível</span>
                  <span className="text-xs font-semibold text-edp-neutral-darkest">{currentUser.cargo}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-edp-neutral-medium">Local</span>
                  <span className="text-xs font-semibold text-edp-neutral-darkest">{currentUser.eclusa}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-edp-neutral-medium">ID Sistema</span>
                  <span className="text-xs font-mono font-semibold text-edp-marine">#{currentUser.id}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-edp-neutral-lighter">
                  <span className="text-xs text-edp-neutral-medium">Status</span>
                  <span className={`text-xs font-semibold ${getStatusColor(currentUser.status)}`}>
                    {currentUser.status === VALID_STATUS[0] ? 'Ativa' : 'Bloqueada'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Perfil"
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input
            label="Nome Completo"
            value={profileData.nome}
            onChange={(e) => handleProfileChange('nome', e.target.value)}
            error={formErrors.nome}
            required
          />
          
          <Input
            label="Email"
            type="email"
            value={profileData.email}
            onChange={(e) => handleProfileChange('email', e.target.value)}
            error={formErrors.email}
            required
          />
          
          <div className="sm:col-span-2">
            <Select
              label="Eclusa"
              value={profileData.eclusa}
              onChange={(value) => handleProfileChange('eclusa', value)}
              options={VALID_ECLUSAS.map(eclusa => ({ value: eclusa, label: eclusa }))}
              error={formErrors.eclusa}
              required
            />
          </div>
        </div>
        
        {/* Avatar Section */}
        <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-edp-neutral-lightest">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-edp-slate flex items-center justify-center overflow-hidden">
            {profileData.url_avatar ? (
              <img 
                src={profileData.url_avatar} 
                alt="Avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowAvatarSelector(!showAvatarSelector)}
              className="px-2.5 py-1.5 text-xs sm:text-sm text-edp-marine bg-edp-ice rounded-lg hover:bg-edp-ice/80 transition-colors font-edp"
            >
              Escolher Avatar
            </button>
            <button
              type="button"
              onClick={() => handleProfileChange('url_avatar', generateRandomAvatarUrl())}
              className="px-2.5 py-1.5 text-xs sm:text-sm text-white bg-edp-slate rounded-lg hover:bg-edp-slate/80 transition-colors font-edp"
            >
              Aleatório
            </button>
          </div>
        </div>
        
        {/* Avatar Selector */}
        {showAvatarSelector && (
          <div className="mt-3 p-3 bg-edp-neutral-white-wash rounded-lg border border-edp-neutral-lighter">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-edp-neutral-dark">Escolha um Avatar:</span>
              <button
                type="button"
                onClick={() => setShowAvatarSelector(false)}
                className="text-edp-neutral-medium hover:text-edp-neutral-darkest"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-8 gap-2">
              {getAllAvatars().todos.map((avatarUrl, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    handleProfileChange('url_avatar', avatarUrl);
                    setShowAvatarSelector(false);
                  }}
                  className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all hover:scale-105 ${
                    profileData.url_avatar === avatarUrl 
                      ? 'border-edp-marine ring-2 ring-edp-marine/30' 
                      : 'border-edp-neutral-lighter hover:border-edp-marine'
                  }`}
                >
                  <img 
                    src={avatarUrl} 
                    alt={`Avatar ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {apiError && (
          <div className="mt-4 p-3 bg-edp-semantic-red/10 border border-edp-semantic-red/20 rounded-lg">
            <p className="text-sm text-edp-semantic-red font-edp">{apiError}</p>
          </div>
        )}

        <div className="flex gap-3 mt-6 justify-end">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateProfile}
            isLoading={submitting}
          >
            Salvar Alterações
          </Button>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Alterar Senha"
      >
        <div className="space-y-4">
          <div className="relative">
            <Input
              label="Senha Atual"
              type={showCurrentPassword ? 'text' : 'password'}
              value={passwordData.current_password}
              onChange={(e) => handlePasswordChange('current_password', e.target.value)}
              error={formErrors.current_password}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-9 text-edp-neutral-medium hover:text-edp-neutral-dark transition-colors"
            >
              {showCurrentPassword ? (
                <EyeSlashIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <div className="relative">
            <Input
              label="Nova Senha"
              type={showNewPassword ? 'text' : 'password'}
              value={passwordData.new_password}
              onChange={(e) => handlePasswordChange('new_password', e.target.value)}
              error={formErrors.new_password}
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-9 text-edp-neutral-medium hover:text-edp-neutral-dark transition-colors"
            >
              {showNewPassword ? (
                <EyeSlashIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <Input
            label="Confirmar Nova Senha"
            type="password"
            value={passwordData.confirm_password}
            onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
            error={formErrors.confirm_password}
            required
          />
          
          {/* Dicas de Segurança */}
          <div className="p-3 bg-edp-neutral-white-wash border border-edp-neutral-lighter rounded-lg">
            <p className="text-xs text-edp-neutral-medium mb-2 font-medium">Dicas de segurança:</p>
            <ul className="text-xs text-edp-neutral-dark space-y-1">
              <li>• Use pelo menos 6 caracteres</li>
              <li>• Combine letras, números e símbolos</li>
              <li>• Evite informações pessoais óbvias</li>
            </ul>
          </div>
        </div>

        {apiError && (
          <div className="mt-4 p-3 bg-edp-semantic-red/10 border border-edp-semantic-red/20 rounded-lg">
            <p className="text-sm text-edp-semantic-red font-edp">{apiError}</p>
          </div>
        )}

        <div className="flex gap-3 mt-6 justify-end">
          <Button
            variant="outline"
            onClick={() => setIsPasswordModalOpen(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleChangePassword}
            isLoading={submitting}
          >
            Alterar Senha
          </Button>
        </div>
      </Modal>
    </>
  );
};