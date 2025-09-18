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

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onBlock: (user: User) => void;
  canEdit?: boolean;
  canBlock?: boolean;
  canDelete?: boolean;
  currentUserId?: number;
  isMobile?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  onBlock,
  canEdit = false,
  canBlock = false,
  canDelete = false,
  currentUserId,
  isMobile = true
}) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const isCurrentUser = Number(user.id) === currentUserId;
  const isActive = user.status === VALID_STATUS[0];

  if (isMobile) {
    return (
      <>
        {/* Mobile Card - Layout Corrigido */}
        <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
          {/* Top Section - Info Principal - Alinhamento Corrigido */}
          <div className="bg-gray-200 p-4">
            <div className="flex items-center gap-3">
              {/* Avatar - Círculo corrigido */}
              <div className="w-12 h-12 rounded-full bg-[#7C9599] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                {user.url_avatar ? (
                  <img src={user.url_avatar} alt={user.nome} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-6 h-6 text-white" />
                )}
              </div>

              {/* User Info - Alinhamento corrigido */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-800 truncate leading-tight">
                  {user.nome}
                </h3>
                <p className="text-sm text-gray-600 truncate mt-0.5">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Bottom Section - Status e Ações - Altura reduzida */}
          <div className="bg-[#212E3E] px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isActive ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className="text-sm font-medium text-white">
                  {isActive ? 'Ativo' : 'Bloqueado'}
                </span>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-1">
                {canEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(user);
                    }}
                    className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded transition-all"
                    title="Editar"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                )}

                {canBlock && !isCurrentUser && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBlock(user);
                    }}
                    className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded transition-all"
                    title={isActive ? 'Bloquear' : 'Desbloquear'}
                  >
                    {isActive ? (
                      <LockClosedIcon className="w-4 h-4" />
                    ) : (
                      <LockOpenIcon className="w-4 h-4" />
                    )}
                  </button>
                )}

                {canDelete && !isCurrentUser && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(user);
                    }}
                    className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-white/10 rounded transition-all"
                    title="Excluir"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setIsDetailModalOpen(true)}
                  className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded transition-all"
                  title="Ver detalhes"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop Card - Layout também corrigido
  return (
    <>
      {/* Desktop Card - Estilo moderno */}
      <div className="w-full bg-gray-50 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 overflow-hidden group">
        {/* Top Section - Alinhamento corrigido */}
        <div className="bg-gray-200 p-5">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-[#7C9599] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
              {user.url_avatar ? (
                <img src={user.url_avatar} alt={user.nome} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-7 h-7 text-white" />
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-800 truncate mb-1 group-hover:text-[#7C9599] transition-colors">
                {user.nome}
              </h3>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Bottom Section - Actions - Altura reduzida */}
        <div className="bg-[#212E3E] px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${
                isActive ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <span className="text-sm font-medium text-white">
                {isActive ? 'Ativo' : 'Bloqueado'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  onClick={() => onEdit(user)}
                  className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded transition-all"
                  title="Editar"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              )}

              {canBlock && !isCurrentUser && (
                <button
                  onClick={() => onBlock(user)}
                  className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded transition-all"
                  title={isActive ? 'Bloquear' : 'Desbloquear'}
                >
                  {isActive ? (
                    <LockClosedIcon className="w-4 h-4" />
                  ) : (
                    <LockOpenIcon className="w-4 h-4" />
                  )}
                </button>
              )}

              {canDelete && !isCurrentUser && (
                <button
                  onClick={() => onDelete(user)}
                  className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-white/10 rounded transition-all"
                  title="Excluir"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal - Sem alterações */}
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