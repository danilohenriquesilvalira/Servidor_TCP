import React, { useState, useEffect } from 'react';
import { 
  UserIcon,
  PencilIcon,
  KeyIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/services/api';
import { VALID_ECLUSAS, VALID_STATUS } from '@/types/auth';

const ProfilePage: React.FC = () => {
  const { user: currentUser, updateUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
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
    setIsEditModalOpen(true);
  };

  const openPasswordModal = () => {
    setApiError('');
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    setIsPasswordModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    return status === VALID_STATUS[0] ? 'text-green-600' : 'text-edp-semantic-red';
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

  if (!currentUser) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      {/* Page Description */}
      <div className="mb-4 sm:mb-6">
        <p className="text-base text-edp-neutral-dark font-edp leading-relaxed">
          Gerenciamento do seu perfil pessoal no sistema EDP
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-green-800 font-edp">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-edp-neutral-lighter rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-6 gap-3">
              <h2 className="text-lg sm:text-xl font-edp font-semibold text-edp-neutral-darkest">
                Informações Pessoais
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={openEditModal}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <PencilIcon className="w-4 h-4" />
                Editar
              </Button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-edp-neutral-lighter flex items-center justify-center overflow-hidden flex-shrink-0">
                  {currentUser.url_avatar ? (
                    <img 
                      src={currentUser.url_avatar} 
                      alt={currentUser.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-10 h-10 sm:w-12 sm:h-12 text-edp-neutral-medium" />
                  )}
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-edp font-bold text-edp-neutral-darkest mb-2">
                    {currentUser.nome}
                  </h3>
                  <p className="text-edp-neutral-dark font-edp mb-1 break-all">{currentUser.email}</p>
                  <p className="text-sm text-edp-neutral-medium font-edp">
                    ID EDP: {currentUser.id_usuario_edp}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-edp font-medium text-edp-neutral-dark mb-2">
                    Cargo
                  </label>
                  <div className="px-3 py-2 bg-edp-electric/20 text-edp-marine rounded-lg">
                    <span className="font-edp font-medium">{currentUser.cargo}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-edp font-medium text-edp-neutral-dark mb-2">
                    Eclusa
                  </label>
                  <div className="px-3 py-2 bg-edp-ice/20 text-edp-marine rounded-lg">
                    <span className="font-edp font-medium">{currentUser.eclusa}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-edp font-medium text-edp-neutral-dark mb-2">
                    Status
                  </label>
                  <div className="flex items-center gap-2">
                    {React.createElement(getStatusIcon(currentUser.status), {
                      className: `w-5 h-5 ${getStatusColor(currentUser.status)}`
                    })}
                    <span className={`font-edp font-medium ${getStatusColor(currentUser.status)}`}>
                      {currentUser.status === VALID_STATUS[0] ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-edp font-medium text-edp-neutral-dark mb-2">
                    Membro desde
                  </label>
                  <div className="flex items-center gap-2 text-edp-neutral-dark">
                    <ClockIcon className="w-4 h-4" />
                    <span className="font-edp">{formatDate(currentUser.criado_em)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Security Card */}
          <div className="bg-white border border-edp-neutral-lighter rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-edp font-semibold text-edp-neutral-darkest mb-4">
              Segurança
            </h3>
            
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={openPasswordModal}
                className="w-full flex items-center justify-center gap-2"
              >
                <KeyIcon className="w-4 h-4" />
                Alterar Senha
              </Button>
              
              <div className="text-sm text-edp-neutral-medium font-edp">
                <p>Última atualização:</p>
                <p className="break-all">{formatDate(currentUser.atualizado_em)}</p>
              </div>
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="bg-edp-neutral-white-wash border border-edp-neutral-lighter rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-edp font-semibold text-edp-neutral-darkest mb-4">
              Informações Rápidas
            </h3>
            
            <div className="space-y-3 text-sm font-edp">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-edp-neutral-medium">Nível de Acesso:</span>
                <span className="text-edp-neutral-darkest font-medium">{currentUser.cargo}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-edp-neutral-medium">Local de Trabalho:</span>
                <span className="text-edp-neutral-darkest font-medium">{currentUser.eclusa}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-edp-neutral-medium">Status da Conta:</span>
                <span className={`font-medium ${getStatusColor(currentUser.status)}`}>
                  {currentUser.status === VALID_STATUS[0] ? 'Ativa' : 'Bloqueada'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Perfil"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <div className="col-span-1 md:col-span-2">
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
        
        <Input
          label="URL do Avatar (opcional)"
          value={profileData.url_avatar}
          onChange={(e) => handleProfileChange('url_avatar', e.target.value)}
          className="mt-4"
        />

        {apiError && (
          <div className="mt-4 p-3 bg-edp-semantic-red/10 border border-edp-semantic-red/20 rounded-lg">
            <p className="text-sm text-edp-semantic-red font-edp">{apiError}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-end">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(false)}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateProfile}
            isLoading={submitting}
            className="w-full sm:w-auto"
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
              className="absolute right-3 top-9 text-edp-neutral-medium hover:text-edp-neutral-dark"
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
              className="absolute right-3 top-9 text-edp-neutral-medium hover:text-edp-neutral-dark"
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
        </div>

        {apiError && (
          <div className="mt-4 p-3 bg-edp-semantic-red/10 border border-edp-semantic-red/20 rounded-lg">
            <p className="text-sm text-edp-semantic-red font-edp">{apiError}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-end">
          <Button
            variant="outline"
            onClick={() => setIsPasswordModalOpen(false)}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleChangePassword}
            isLoading={submitting}
            className="w-full sm:w-auto"
          >
            Alterar Senha
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;