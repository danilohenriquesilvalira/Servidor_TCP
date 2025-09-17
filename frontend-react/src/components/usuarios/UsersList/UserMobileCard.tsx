import React, { useState } from 'react';
import { 
  PencilIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
  ChevronRightIcon,
  XMarkIcon,
  UserIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { User, VALID_STATUS } from '@/types/auth';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface UserMobileCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onBlock: (user: User) => void;
  canEdit?: boolean;
  canBlock?: boolean;
  canDelete?: boolean;
  currentUserId?: number;
}

export const UserMobileCard: React.FC<UserMobileCardProps> = ({
  user,
  onEdit,
  onDelete,
  onBlock,
  canEdit = false,
  canBlock = false,
  canDelete = false,
  currentUserId
}) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const isCurrentUser = Number(user.id) === currentUserId;
  const isActive = user.status === VALID_STATUS[0];

  return (
    <>
      {/* Mobile Card */}
      <div 
        className="bg-white border border-edp-neutral-lighter rounded-lg p-4 active:bg-edp-neutral-white-wash transition-colors cursor-pointer"
        onClick={() => setIsDetailModalOpen(true)}
      >
        <div className="flex items-center justify-between">
          {/* Left: Avatar + Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-edp-neutral-lighter flex items-center justify-center overflow-hidden flex-shrink-0">
              {user.url_avatar ? (
                <img src={user.url_avatar} alt={user.nome} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            {/* User Info */}
            <div className="min-w-0 flex-1">
              <div className="font-medium text-edp-neutral-darkest text-base truncate">
                {user.nome}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                  isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isActive ? 'Ativo' : 'Bloqueado'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Chevron */}
          <ChevronRightIcon className="w-5 h-5 text-edp-neutral-medium flex-shrink-0" />
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title=""
        size="sm"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-edp-neutral-lighter flex items-center justify-center overflow-hidden">
                {user.url_avatar ? (
                  <img src={user.url_avatar} alt={user.nome} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-edp font-semibold text-edp-neutral-darkest">
                  {user.nome}
                </h3>
                <p className="text-sm text-edp-neutral-medium">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDetailModalOpen(false)}
              className="w-8 h-8 p-0"
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* User Details */}
          <div className="space-y-4">
            {/* ID EDP */}
            <div className="flex items-center gap-3 p-3 bg-edp-neutral-white-wash rounded-lg">
              <div className="w-8 h-8 bg-[#7C9599] rounded-md flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-edp-neutral-medium">ID EDP</div>
                <div className="text-sm font-edp font-medium text-edp-neutral-darkest">
                  {user.id_usuario_edp}
                </div>
              </div>
            </div>

            {/* Cargo */}
            <div className="flex items-center gap-3 p-3 bg-edp-neutral-white-wash rounded-lg">
              <div className="w-8 h-8 bg-[#7C9599] rounded-md flex items-center justify-center">
                <BriefcaseIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-edp-neutral-medium">Cargo</div>
                <div className="text-sm font-edp font-medium text-edp-neutral-darkest">
                  {user.cargo}
                </div>
              </div>
            </div>

            {/* Eclusa */}
            <div className="flex items-center gap-3 p-3 bg-edp-neutral-white-wash rounded-lg">
              <div className="w-8 h-8 bg-[#7C9599] rounded-md flex items-center justify-center">
                <BuildingOfficeIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-edp-neutral-medium">Eclusa</div>
                <div className="text-sm font-edp font-medium text-edp-neutral-darkest">
                  {user.eclusa}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 p-3 bg-edp-neutral-white-wash rounded-lg">
              <div className="w-8 h-8 bg-[#7C9599] rounded-md flex items-center justify-center">
                <ShieldCheckIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-edp-neutral-medium">Status</div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                    isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isActive ? 'Ativo' : 'Bloqueado'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <div className="text-sm font-edp font-medium text-edp-neutral-darkest mb-2">
              Ações Disponíveis
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Edit Button */}
              {canEdit && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onEdit(user);
                    setIsDetailModalOpen(false);
                  }}
                  className="w-full flex items-center gap-3 justify-start p-4 h-auto"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <PencilIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-edp-neutral-darkest">Editar Usuário</div>
                    <div className="text-xs text-edp-neutral-medium">Alterar dados do usuário</div>
                  </div>
                </Button>
              )}

              {/* Block/Unblock Button */}
              {canBlock && !isCurrentUser && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onBlock(user);
                    setIsDetailModalOpen(false);
                  }}
                  className="w-full flex items-center gap-3 justify-start p-4 h-auto"
                >
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                    isActive ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {isActive ? (
                      <LockClosedIcon className="w-4 h-4 text-red-600" />
                    ) : (
                      <LockOpenIcon className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-edp-neutral-darkest">
                      {isActive ? 'Bloquear Usuário' : 'Desbloquear Usuário'}
                    </div>
                    <div className="text-xs text-edp-neutral-medium">
                      {isActive ? 'Impedir acesso ao sistema' : 'Permitir acesso ao sistema'}
                    </div>
                  </div>
                </Button>
              )}

              {/* Delete Button */}
              {canDelete && !isCurrentUser && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onDelete(user);
                    setIsDetailModalOpen(false);
                  }}
                  className="w-full flex items-center gap-3 justify-start p-4 h-auto border-red-200 hover:bg-red-50"
                >
                  <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                    <TrashIcon className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-red-700">Excluir Usuário</div>
                    <div className="text-xs text-red-500">Remover permanentemente</div>
                  </div>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};