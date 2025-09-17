import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { User, VALID_ECLUSAS, VALID_STATUS } from '@/types/auth';
import { usersAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import ProfilePage from './ProfilePage';

const UsersPage: React.FC = () => {
  const { user: currentUser, permissions } = useAuth();

  // Redireciona Técnicos e Operadores para página de perfil
  if (currentUser?.cargo === 'Técnico' || currentUser?.cargo === 'Operador') {
    return <ProfilePage />;
  }
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCargo, setSelectedCargo] = useState('');
  const [selectedEclusa, setSelectedEclusa] = useState('');

  // Hierarquia de cargos baseada no backend
  const getManageableCargos = () => {
    switch (currentUser?.cargo) {
      case 'Admin':
        return ['Gerente', 'Supervisor', 'Técnico', 'Operador'];
      case 'Gerente':
        return ['Supervisor', 'Técnico', 'Operador'];
      case 'Supervisor':
        return ['Técnico', 'Operador'];
      case 'Técnico':
        return ['Operador'];
      default:
        return [];
    }
  };

  const canManageUser = (targetCargo: string) => {
    const manageableCargos = getManageableCargos();
    return manageableCargos.includes(targetCargo) || currentUser?.cargo === targetCargo;
  };
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    id_usuario_edp: '',
    eclusa: '',
    cargo: '',
    url_avatar: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    // Hierarquia: só mostra usuários que pode gerenciar
    const canSeeUser = canManageUser(user.cargo);
    if (!canSeeUser) return false;

    const matchesSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id_usuario_edp.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCargo = !selectedCargo || user.cargo === selectedCargo;
    const matchesEclusa = !selectedEclusa || user.eclusa === selectedEclusa;
    
    return matchesSearch && matchesCargo && matchesEclusa;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCargo, selectedEclusa]);

  // Form handlers
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.nome.trim()) errors.nome = 'Nome é obrigatório';
    if (!formData.email.trim()) errors.email = 'Email é obrigatório';
    if (!formData.email.includes('@')) errors.email = 'Email inválido';
    if (!formData.id_usuario_edp.trim()) errors.id_usuario_edp = 'ID EDP é obrigatório';
    if (!formData.eclusa) errors.eclusa = 'Eclusa é obrigatória';
    if (!formData.cargo) errors.cargo = 'Cargo é obrigatório';
    if (!isEditModalOpen && !formData.senha.trim()) errors.senha = 'Senha é obrigatória';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      id_usuario_edp: '',
      eclusa: '',
      cargo: '',
      url_avatar: ''
    });
    setFormErrors({});
    setApiError('');
  };

  // CRUD Operations
  const handleCreate = async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      setApiError('');
      
      // Debug: vamos ver o que está sendo enviado
      console.log('Dados enviados:', formData);
      
      await usersAPI.create(formData);
      await loadUsers();
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro desconhecido';
      console.error('Detalhes do erro:', errorMessage);
      setApiError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedUser || !validateForm()) return;
    
    try {
      setSubmitting(true);
      const updateData: { [key: string]: any } = { ...formData };
      if (!updateData.senha) delete updateData.senha;
      
      await usersAPI.update(selectedUser.id, updateData);
      await loadUsers();
      setIsEditModalOpen(false);
      resetForm();
      setSelectedUser(null);
    } catch (error) {
      console.error('Erro ao editar usuário:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    try {
      setSubmitting(true);
      await usersAPI.delete(selectedUser.id);
      await loadUsers();
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBlock = async (user: User) => {
    try {
      setSubmitting(true);
      if (user.status === VALID_STATUS[0]) { // 'Ativo'
        await usersAPI.block(user.id);
        console.log(`Usuário ${user.nome} foi bloqueado`);
      } else {
        await usersAPI.unblock(user.id);
        console.log(`Usuário ${user.nome} foi desbloqueado`);
      }
      await loadUsers();
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      alert('Erro ao alterar status do usuário: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  // Open modals
  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      senha: '',
      id_usuario_edp: user.id_usuario_edp,
      eclusa: user.eclusa,
      cargo: user.cargo,
      url_avatar: user.url_avatar || ''
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Table columns
  const columns = [
    {
      key: 'url_avatar',
      label: '',
      width: '12',
      render: (avatar: string, user: User) => (
        <div className="w-10 h-10 rounded-full bg-edp-neutral-lighter flex items-center justify-center overflow-hidden">
          {avatar ? (
            <img src={avatar} alt={user.nome} className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-5 h-5 text-edp-neutral-medium" />
          )}
        </div>
      )
    },
    {
      key: 'nome',
      label: 'Nome',
      sortable: true,
      render: (nome: string, user: User) => (
        <div>
          <div className="font-medium text-edp-neutral-darkest">{nome}</div>
          <div className="text-xs text-edp-neutral-medium">{user.email}</div>
        </div>
      )
    },
    {
      key: 'id_usuario_edp',
      label: 'ID EDP',
      sortable: true
    },
    {
      key: 'cargo',
      label: 'Cargo',
      sortable: true,
      render: (cargo: string) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium bg-edp-electric/20 text-edp-marine rounded">
          {cargo}
        </span>
      )
    },
    {
      key: 'eclusa',
      label: 'Eclusa',
      sortable: true,
      render: (eclusa: string) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium bg-edp-ice/20 text-edp-marine rounded">
          {eclusa}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (status: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
          status === VALID_STATUS[0] 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {status === VALID_STATUS[0] ? 'Ativo' : 'Bloqueado'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_: any, user: User) => (
        <div className="flex items-center gap-2">
          {permissions?.can_update_users && canManageUser(user.cargo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEditModal(user)}
              className="w-10 h-10 p-0 hover:bg-edp-electric/10"
              title="Editar usuário"
            >
              <PencilIcon className="w-5 h-5 text-edp-neutral-dark hover:text-edp-electric" />
            </Button>
          )}
          
          {permissions?.can_block_users && user.id !== currentUser?.id && canManageUser(user.cargo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBlock(user)}
              className="w-10 h-10 p-0 hover:bg-edp-electric/10"
              title={user.status === VALID_STATUS[0] ? 'Bloquear usuário' : 'Desbloquear usuário'}
            >
              {user.status === VALID_STATUS[0] ? (
                <LockClosedIcon className="w-5 h-5 text-edp-semantic-red hover:text-red-700" />
              ) : (
                <LockOpenIcon className="w-5 h-5 text-green-600 hover:text-green-700" />
              )}
            </Button>
          )}
          
          {permissions?.can_delete_users && user.id !== currentUser?.id && canManageUser(user.cargo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openDeleteModal(user)}
              className="w-10 h-10 p-0 hover:bg-edp-semantic-red/10"
              title="Excluir usuário"
            >
              <TrashIcon className="w-5 h-5 text-edp-semantic-red hover:text-red-700" />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="w-full h-full">
      {/* Page Description */}
      <div className="mb-6">
        <p className="text-base text-edp-neutral-dark font-edp leading-relaxed">
          Gerenciamento de usuários do sistema EDP
          {currentUser?.cargo && (
            <span className="block text-sm text-edp-neutral-medium mt-1">
              Como {currentUser.cargo}, você pode gerenciar: {getManageableCargos().join(', ')}
            </span>
          )}
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white border border-edp-neutral-lighter rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-edp-neutral-medium" />
              <Input
                placeholder="Buscar por nome, email ou ID EDP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select
              placeholder="Filtrar por cargo"
              value={selectedCargo}
              onChange={setSelectedCargo}
              options={[
                { value: '', label: 'Todos os cargos' },
                ...getManageableCargos().map(cargo => ({ value: cargo, label: cargo }))
              ]}
            />
            
            <Select
              placeholder="Filtrar por eclusa"
              value={selectedEclusa}
              onChange={setSelectedEclusa}
              options={[
                { value: '', label: 'Todas as eclusas' },
                ...VALID_ECLUSAS.map(eclusa => ({ value: eclusa, label: eclusa }))
              ]}
            />
          </div>

          {/* Actions */}
          {permissions?.can_create_users && (
            <Button
              variant="primary"
              onClick={openCreateModal}
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Novo Usuário
            </Button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <Table
        data={paginatedUsers}
        columns={columns}
        loading={loading}
        emptyMessage="Nenhum usuário encontrado"
      />

      {/* Pagination */}
      {!loading && filteredUsers.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Criar Novo Usuário"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome Completo"
            value={formData.nome}
            onChange={(e) => handleFormChange('nome', e.target.value)}
            error={formErrors.nome}
            required
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleFormChange('email', e.target.value)}
            error={formErrors.email}
            required
          />
          
          <Input
            label="ID Usuário EDP"
            value={formData.id_usuario_edp}
            onChange={(e) => handleFormChange('id_usuario_edp', e.target.value)}
            error={formErrors.id_usuario_edp}
            required
          />
          
          <Input
            label="Senha"
            type="password"
            value={formData.senha}
            onChange={(e) => handleFormChange('senha', e.target.value)}
            error={formErrors.senha}
            required
          />
          
          <Select
            label="Cargo"
            value={formData.cargo}
            onChange={(value) => handleFormChange('cargo', value)}
            options={getManageableCargos().map(cargo => ({ value: cargo, label: cargo }))}
            error={formErrors.cargo}
            required
          />
          
          <Select
            label="Eclusa"
            value={formData.eclusa}
            onChange={(value) => handleFormChange('eclusa', value)}
            options={VALID_ECLUSAS.map(eclusa => ({ value: eclusa, label: eclusa }))}
            error={formErrors.eclusa}
            required
          />
        </div>
        
        <Input
          label="URL do Avatar (opcional)"
          value={formData.url_avatar}
          onChange={(e) => handleFormChange('url_avatar', e.target.value)}
          className="mt-4"
        />

        {apiError && (
          <div className="mt-4 p-3 bg-edp-semantic-red/10 border border-edp-semantic-red/20 rounded-lg">
            <p className="text-sm text-edp-semantic-red font-edp">{apiError}</p>
          </div>
        )}

        <div className="flex gap-3 mt-6 justify-end">
          <Button
            variant="outline"
            onClick={() => setIsCreateModalOpen(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            isLoading={submitting}
          >
            Criar Usuário
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Usuário"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome Completo"
            value={formData.nome}
            onChange={(e) => handleFormChange('nome', e.target.value)}
            error={formErrors.nome}
            required
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleFormChange('email', e.target.value)}
            error={formErrors.email}
            required
          />
          
          <Input
            label="ID Usuário EDP"
            value={formData.id_usuario_edp}
            onChange={(e) => handleFormChange('id_usuario_edp', e.target.value)}
            error={formErrors.id_usuario_edp}
            required
          />
          
          <Input
            label="Nova Senha (opcional)"
            type="password"
            value={formData.senha}
            onChange={(e) => handleFormChange('senha', e.target.value)}
            error={formErrors.senha}
            placeholder="Deixe em branco para manter a atual"
          />
          
          <Select
            label="Cargo"
            value={formData.cargo}
            onChange={(value) => handleFormChange('cargo', value)}
            options={getManageableCargos().map(cargo => ({ value: cargo, label: cargo }))}
            error={formErrors.cargo}
            required
          />
          
          <Select
            label="Eclusa"
            value={formData.eclusa}
            onChange={(value) => handleFormChange('eclusa', value)}
            options={VALID_ECLUSAS.map(eclusa => ({ value: eclusa, label: eclusa }))}
            error={formErrors.eclusa}
            required
          />
        </div>
        
        <Input
          label="URL do Avatar (opcional)"
          value={formData.url_avatar}
          onChange={(e) => handleFormChange('url_avatar', e.target.value)}
          className="mt-4"
        />

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
            onClick={handleEdit}
            isLoading={submitting}
          >
            Salvar Alterações
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Exclusão"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-edp-semantic-red/10 mb-4">
            <TrashIcon className="w-6 h-6 text-edp-semantic-red" />
          </div>
          
          <h3 className="text-lg font-edp font-semibold text-edp-neutral-darkest mb-2">
            Excluir Usuário
          </h3>
          
          <p className="text-edp-neutral-dark font-edp mb-6">
            Tem certeza que deseja excluir o usuário <strong>{selectedUser?.nome}</strong>?
            Esta ação não pode ser desfeita.
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              isLoading={submitting}
              className="bg-edp-semantic-red hover:bg-edp-semantic-red/90"
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;