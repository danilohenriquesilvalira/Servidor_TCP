import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, VALID_ECLUSAS, VALID_STATUS } from '@/types/auth';
import { usersAPI } from '@/services/api';
import ProfilePage from './ProfilePage';

// Importar componentes organizados
import { 
  TabNavigation, 
  UserSubPage,
  UsersFilters,
  GestaoCards,
  GestaoCharts
} from '@/components/usuarios';
import { UserMobileCard } from '@/components/usuarios/UsersList/UserMobileCard';
import { TableWithPagination } from '@/components/ui/TableWithPagination';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

// Importar ícones necessários
import { 
  PencilIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';

const UsersPage: React.FC = () => {
  const { user: currentUser, permissions } = useAuth();

  // Redireciona Técnicos e Operadores para página de perfil
  if (currentUser?.cargo === 'Técnico' || currentUser?.cargo === 'Operador') {
    return <ProfilePage />;
  }

  // Estado principal
  const [activeTab, setActiveTab] = useState<UserSubPage>('lista');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Paginação inteligente baseada no espaço disponível real
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  useEffect(() => {
    const calculateItemsPerPage = () => {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      // Altura ocupada pelos elementos fixos (valores otimizados):
      // Header (~64px) + Padding Layout (~32px) + Tabs (~40px) + Filtros (~60px) + Paginação (~48px) + Buffer (~24px)
      const fixedElementsHeight = 268;
      
      // Altura disponível para a tabela
      const availableHeight = windowHeight - fixedElementsHeight;
      
      // Altura de cada linha da tabela (otimizada: ~48px incluindo borders)
      const rowHeight = 48;
      
      // Máximo de linhas que cabem fisicamente
      const maxRowsThatFit = Math.floor(availableHeight / rowHeight);
      
      // Cálculo inteligente baseado em categorias de tela
      let calculatedItems;
      
      // Categorização por resolução total (width x height)
      const screenArea = windowWidth * windowHeight;
      
      if (screenArea >= 3686400) {
        // 4K+ (2560x1440+ = 3,686,400px²) - Telas enormes
        calculatedItems = Math.min(maxRowsThatFit, 12);
      } else if (screenArea >= 2073600) {
        // Full HD+ (1920x1080 = 2,073,600px²) - Desktop grande
        calculatedItems = Math.min(maxRowsThatFit, 10);
      } else if (screenArea >= 1440000) {
        // Laptop grande (1600x900 = 1,440,000px²)
        calculatedItems = Math.min(maxRowsThatFit, 8);
      } else if (screenArea >= 1200000) {
        // Sua resolução debug (1528x834 = 1,274,352px²) - Laptop médio/grande
        calculatedItems = Math.min(maxRowsThatFit, 7);
      } else if (screenArea >= 786432) {
        // Laptop padrão (1024x768 = 786,432px²)
        calculatedItems = Math.min(maxRowsThatFit, 5);
      } else {
        // Tablet/Mobile
        calculatedItems = Math.min(maxRowsThatFit, 3);
      }
      
      // Verificação adicional por altura específica
      if (windowHeight < 700) {
        calculatedItems = Math.min(calculatedItems, 5);
      } else if (windowHeight < 600) {
        calculatedItems = Math.min(calculatedItems, 3);
      }
      
      // Garantir limites razoáveis
      const finalItems = Math.max(3, Math.min(12, calculatedItems));
      
      console.log(`📊 Cálculo: ${windowWidth}x${windowHeight} (${screenArea.toLocaleString()}px²) → ${finalItems} usuários (máx: ${maxRowsThatFit})`);
      setItemsPerPage(finalItems);
    };
    
    calculateItemsPerPage();
    window.addEventListener('resize', calculateItemsPerPage);
    
    return () => window.removeEventListener('resize', calculateItemsPerPage);
  }, []);
  
  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCargo, setSelectedCargo] = useState('');
  const [selectedEclusa, setSelectedEclusa] = useState('');
  
  // Estados dos modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Estados do formulário
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

  // Carregar usuários
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

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    const canSeeUser = canManageUser(user.cargo);
    if (!canSeeUser) return false;

    const matchesSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id_usuario_edp.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCargo = !selectedCargo || user.cargo === selectedCargo;
    const matchesEclusa = !selectedEclusa || user.eclusa === selectedEclusa;
    
    return matchesSearch && matchesCargo && matchesEclusa;
  });

  // Handlers dos filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCargo('');
    setSelectedEclusa('');
  };

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
      await usersAPI.create(formData);
      await loadUsers();
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      setApiError(error.response?.data?.error || error.message || 'Erro desconhecido');
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
      if (user.status === VALID_STATUS[0]) {
        await usersAPI.block(user.id);
      } else {
        await usersAPI.unblock(user.id);
      }
      await loadUsers();
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
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

  // Detectar mobile para ajustar colunas
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Colunas da tabela - ajustadas para mobile
  const mobileColumns = [
    {
      key: 'url_avatar',
      label: '',
      width: '10',
      render: (avatar: string, user: User) => (
        <div className="w-8 h-8 rounded-full bg-edp-neutral-lighter flex items-center justify-center overflow-hidden flex-shrink-0">
          {avatar ? (
            <img src={avatar} alt={user.nome} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      )
    },
    {
      key: 'nome',
      label: 'Usuário',
      sortable: true,
      render: (nome: string, user: User) => (
        <div className="min-w-0 flex-1">
          <div className="font-medium text-edp-neutral-darkest text-sm truncate">{nome}</div>
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="inline-flex px-1.5 py-0.5 text-xs font-medium bg-edp-electric/20 text-edp-marine rounded">
              {user.cargo}
            </span>
            <span className="inline-flex px-1.5 py-0.5 text-xs font-medium bg-edp-ice/20 text-edp-marine rounded">
              {user.eclusa}
            </span>
          </div>
          <div className="text-xs text-edp-neutral-medium mt-1 truncate">{user.email}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => (
        <div className="text-center">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
            status === VALID_STATUS[0] 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {status === VALID_STATUS[0] ? 'Ativo' : 'Bloqueado'}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, user: User) => (
        <div className="flex items-center justify-end gap-1">
          {permissions?.can_update_users && canManageUser(user.cargo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEditModal(user)}
              className="w-8 h-8 p-0 hover:bg-edp-electric/10"
              title="Editar"
            >
              <PencilIcon className="w-4 h-4 text-edp-neutral-dark" />
            </Button>
          )}
          
          {permissions?.can_block_users && user.id !== currentUser?.id && canManageUser(user.cargo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBlock(user)}
              className="w-8 h-8 p-0 hover:bg-edp-electric/10"
              title={user.status === VALID_STATUS[0] ? 'Bloquear' : 'Desbloquear'}
            >
              {user.status === VALID_STATUS[0] ? (
                <LockClosedIcon className="w-4 h-4 text-edp-semantic-red" />
              ) : (
                <LockOpenIcon className="w-4 h-4 text-green-600" />
              )}
            </Button>
          )}
          
          {permissions?.can_delete_users && user.id !== currentUser?.id && canManageUser(user.cargo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openDeleteModal(user)}
              className="w-8 h-8 p-0 hover:bg-edp-semantic-red/10"
              title="Excluir"
            >
              <TrashIcon className="w-4 h-4 text-edp-semantic-red" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const desktopColumns = [
    {
      key: 'url_avatar',
      label: '',
      width: '12',
      render: (avatar: string, user: User) => (
        <div className="w-10 h-10 rounded-full bg-edp-neutral-lighter flex items-center justify-center overflow-hidden">
          {avatar ? (
            <img src={avatar} alt={user.nome} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
            </svg>
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
              <PencilIcon className="w-6 h-6 text-edp-neutral-dark hover:text-edp-electric" />
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
                <LockClosedIcon className="w-6 h-6 text-edp-semantic-red hover:text-red-700" />
              ) : (
                <LockOpenIcon className="w-6 h-6 text-green-600 hover:text-green-700" />
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
              <TrashIcon className="w-6 h-6 text-edp-semantic-red hover:text-red-700" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const columns = isMobile ? mobileColumns : desktopColumns;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Navegação com Tabs */}
      <div className="flex-shrink-0 mb-4">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Conteúdo das Tabs */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'gestao' ? (
          /* Página de Gestão - 100% Gráficos e Dados */
          <div className="w-full space-y-4">
            <div className="w-full">
              <GestaoCards 
                users={users} 
                manageableCargos={getManageableCargos()} 
              />
            </div>
            
            <div className="w-full">
              <GestaoCharts 
                users={users} 
                manageableCargos={getManageableCargos()} 
              />
            </div>
          </div>
        ) : (
          /* Página de Lista - Tabela + Filtros + CRUD */
          <div className="h-full flex flex-col gap-4">
            {/* Filtros compactos */}
            <div className="flex-shrink-0">
              <UsersFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCargo={selectedCargo}
                onCargoChange={setSelectedCargo}
                selectedEclusa={selectedEclusa}
                onEclusaChange={setSelectedEclusa}
                cargoOptions={getManageableCargos()}
                eclusaOptions={[...VALID_ECLUSAS]}
                onClearFilters={handleClearFilters}
                onCreateUser={openCreateModal}
                canCreateUsers={permissions?.can_create_users}
                totalResults={filteredUsers.length}
              />
            </div>

            {/* Tabela / Lista Mobile */}
            <div className="flex-1 min-h-0">
              {isMobile ? (
                /* Mobile List */
                <div className="space-y-3">
                  {loading ? (
                    <div className="bg-white border border-edp-neutral-lighter rounded-lg shadow-sm p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-edp-electric mx-auto"></div>
                      <p className="mt-4 text-edp-neutral-medium font-edp">Carregando...</p>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="bg-white border border-edp-neutral-lighter rounded-lg shadow-sm p-8 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 opacity-50">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-edp-neutral-medium">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h8a2 2 0 012 2v4M6 13h12" />
                        </svg>
                      </div>
                      <p className="text-edp-neutral-medium font-edp">Nenhum usuário encontrado</p>
                    </div>
                  ) : (
                    filteredUsers.slice(0, itemsPerPage).map((user) => (
                      <UserMobileCard
                        key={user.id}
                        user={user}
                        onEdit={openEditModal}
                        onDelete={openDeleteModal}
                        onBlock={handleBlock}
                        canEdit={permissions?.can_update_users && canManageUser(user.cargo)}
                        canBlock={permissions?.can_block_users && canManageUser(user.cargo)}
                        canDelete={permissions?.can_delete_users && canManageUser(user.cargo)}
                        currentUserId={currentUser?.id ? Number(currentUser.id) : undefined}
                      />
                    ))
                  )}
                  
                  {/* Mobile Pagination */}
                  {filteredUsers.length > itemsPerPage && (
                    <div className="flex justify-center mt-4">
                      <div className="bg-white border border-edp-neutral-lighter rounded-lg px-4 py-2">
                        <span className="text-sm text-edp-neutral-medium">
                          Mostrando {Math.min(itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuários
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Desktop Table */
                <div className="bg-white border border-edp-neutral-lighter rounded-lg shadow-sm h-full flex flex-col">
                  <TableWithPagination
                    data={filteredUsers}
                    columns={columns}
                    loading={loading}
                    emptyMessage="Nenhum usuário encontrado"
                    itemsPerPage={itemsPerPage}
                    showPagination={true}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
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

      {/* Modal de Edição */}
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

      {/* Modal de Exclusão */}
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