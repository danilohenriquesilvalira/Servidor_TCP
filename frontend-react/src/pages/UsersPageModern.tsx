import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, VALID_ECLUSAS, VALID_STATUS } from '@/types/auth';
import { usersAPI } from '@/services/api';
import { generateAvatarUrl, generateRandomAvatarUrl, getAllAvatars } from '@/utils/avatarUtils';

// Importar componentes organizados
import { 
  TabNavigation, 
  UserSubPage,
  UsersFilters,
  GestaoCards,
  GestaoCharts,
  UserCard
} from '@/components/usuarios';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TrashIcon } from '@heroicons/react/24/outline';


const UsersPage: React.FC = () => {
  const { user: currentUser, permissions } = useAuth();

  // Técnicos e Operadores não têm acesso à gestão de usuários
  if (currentUser?.cargo === 'Técnico' || currentUser?.cargo === 'Operador') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-edp-marine rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-edp-neutral-darkest mb-2 font-edp">Acesso Restrito</h2>
          <p className="text-edp-neutral-medium">Esta seção é disponível apenas para Administradores e Supervisores.</p>
          <p className="text-sm text-edp-neutral-medium mt-2">Acesse seu perfil através do menu do usuário no header.</p>
        </div>
      </div>
    );
  }

  // Estado principal
  const [activeTab, setActiveTab] = useState<UserSubPage>('lista');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sistema de paginação responsiva para cards
  const [itemsPerPage, setItemsPerPage] = useState(6);
  
  useEffect(() => {
    const calculateCardsPerPage = () => {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      // ALTURA: Elementos fixos ocupados
      // Header (64px) + Layout padding (48px) + Tabs+Filtros (56px) + Paginação (48px) + Margens (32px)
      const fixedHeight = 248;
      const availableHeight = windowHeight - fixedHeight;
      
      // LARGURA: Sistema responsivo inteligente com máximo de 4 cards horizontais
      let cardsPerRow;
      let cardMinWidth; // Largura mínima necessária por card
      
      if (windowWidth < 768) {
        // Mobile: 1 card por linha
        cardsPerRow = 1;
        cardMinWidth = windowWidth - 48; // padding lateral
      } else {
        // Desktop/Tablet: Cálculo inteligente baseado na largura disponível
        const containerWidth = windowWidth - 48; // padding lateral do container
        const gaps = 16; // gap entre cards
        
        // Largura mínima por card para boa legibilidade
        const minCardWidth = 280;
        
        // Calcular quantos cards cabem horizontalmente
        let possibleCards = 1;
        for (let i = 2; i <= 4; i++) {
          const totalGaps = (i - 1) * gaps;
          const availableForCards = containerWidth - totalGaps;
          const cardWidth = availableForCards / i;
          
          if (cardWidth >= minCardWidth) {
            possibleCards = i;
          } else {
            break;
          }
        }
        
        cardsPerRow = Math.min(possibleCards, 4); // Máximo 4 cards horizontais
        cardMinWidth = (containerWidth - ((cardsPerRow - 1) * gaps)) / cardsPerRow;
      }
      
      // ALTURA DO CARD: Baseado no novo layout otimizado
      // Mobile: seção cinza (76px) + seção azul (52px) = 128px total
      // Desktop: seção cinza (88px) + seção azul (52px) = 140px total
      const cardHeight = windowWidth < 768 ? 128 : 140;
      const rowGap = 16; // gap vertical entre linhas
      
      // Quantas linhas cabem na altura disponível
      const maxRows = Math.floor((availableHeight + rowGap) / (cardHeight + rowGap));
      const safeMaxRows = Math.max(1, maxRows); // Garantir pelo menos 1 linha
      
      // Total de cards baseado em linhas e colunas
      let calculatedCards = cardsPerRow * safeMaxRows;
      
      // Limites inteligentes por dispositivo
      if (windowWidth < 768) {
        // Mobile: 3-8 cards (flexível baseado na altura)
        calculatedCards = Math.min(calculatedCards, 8);
        calculatedCards = Math.max(calculatedCards, 3);
      } else if (windowWidth < 1024) {
        // Tablet: 4-12 cards 
        calculatedCards = Math.min(calculatedCards, 12);
        calculatedCards = Math.max(calculatedCards, 4);
      } else {
        // Desktop: 6-20 cards
        calculatedCards = Math.min(calculatedCards, 20);
        calculatedCards = Math.max(calculatedCards, 6);
      }
      
      // Garantir múltiplos da grade para layout perfeito
      const cleanGrid = Math.floor(calculatedCards / cardsPerRow) * cardsPerRow;
      const finalCards = cleanGrid > 0 ? cleanGrid : cardsPerRow;
      
      console.log(`🎯 Layout Inteligente: ${windowWidth}x${windowHeight} → ${cardsPerRow} cols × ${Math.floor(finalCards/cardsPerRow)} rows = ${finalCards} cards (min width: ${Math.round(cardMinWidth)}px)`);
      setItemsPerPage(finalCards);
    };
    
    calculateCardsPerPage();
    window.addEventListener('resize', calculateCardsPerPage);
    
    return () => window.removeEventListener('resize', calculateCardsPerPage);
  }, []);
  
  // Estados dos filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCargo, setSelectedCargo] = useState('');
  const [selectedEclusa, setSelectedEclusa] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Estados dos modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  
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

  // Filtrar e ordenar usuários (bloqueados sempre no final)
  const filteredUsers = users.filter(user => {
    const canSeeUser = canManageUser(user.cargo);
    if (!canSeeUser) return false;

    const matchesSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id_usuario_edp.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCargo = !selectedCargo || user.cargo === selectedCargo;
    const matchesEclusa = !selectedEclusa || user.eclusa === selectedEclusa;
    
    return matchesSearch && matchesCargo && matchesEclusa;
  }).sort((a, b) => {
    // Usuários ativos primeiro, bloqueados por último
    const aActive = a.status === VALID_STATUS[0];
    const bActive = b.status === VALID_STATUS[0];
    
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    
    // Se ambos têm o mesmo status, ordena por nome
    return a.nome.localeCompare(b.nome);
  });

  // Paginação - Ajustada para considerar o card "Criar usuário"
  const hasCreateCard = permissions?.can_create_users;
  const usersPerPage = hasCreateCard ? itemsPerPage - 1 : itemsPerPage; // Reserva 1 slot para o card criar
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCargo, selectedEclusa, filteredUsers.length]);

  // Handlers dos filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCargo('');
    setSelectedEclusa('');
  };

  // Form handlers
  const handleFormChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    
    // Auto-gerar avatar quando nome for digitado
    if (field === 'nome' && value.trim() && !isEditModalOpen) {
      newFormData.url_avatar = generateAvatarUrl(value);
    }
    
    setFormData(newFormData);
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

  // Detectar mobile para ajustar layout
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header com Tabs e Filtros na mesma linha */}
      <div className="flex-shrink-0 mb-4">
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          
          {/* Filtros só aparecem na aba Lista */}
          {activeTab === 'lista' && (
            <div className={`${isMobile ? 'px-4' : ''}`}>
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
          )}
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto"  style={{ scrollBehavior: 'smooth' }}>
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
          /* Página de Lista - Cards + CRUD */
          <div className="h-full flex flex-col gap-4">

            {/* Cards de Usuários */}
            <div className="flex-1 min-h-0">
              {loading ? (
                isMobile ? (
                  /* Mobile Loading Skeletons */
                  <div className="space-y-3 px-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                        <div className="bg-gray-200 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-300" />
                            <div className="flex-1">
                              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
                              <div className="h-3 bg-gray-300 rounded w-1/2" />
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-800 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div className="h-6 bg-gray-300 rounded-full w-16" />
                            <div className="flex gap-1">
                              <div className="w-7 h-7 bg-gray-300 rounded" />
                              <div className="w-7 h-7 bg-gray-300 rounded" />
                              <div className="w-7 h-7 bg-gray-300 rounded" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Desktop Loading Skeletons */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: usersPerPage }).map((_, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                        <div className="bg-gray-200 p-5">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gray-300" />
                            <div className="flex-1">
                              <div className="h-5 bg-gray-300 rounded w-3/4 mb-2" />
                              <div className="h-4 bg-gray-300 rounded w-1/2" />
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-800 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div className="h-6 bg-gray-300 rounded-full w-16" />
                            <div className="flex gap-2">
                              <div className="w-7 h-7 bg-gray-300 rounded" />
                              <div className="w-7 h-7 bg-gray-300 rounded" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : filteredUsers.length === 0 ? (
                /* Empty State Melhorado */
                <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 text-gray-300">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {searchTerm || selectedCargo || selectedEclusa 
                      ? 'Nenhum usuário encontrado' 
                      : 'Nenhum usuário cadastrado'
                    }
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {searchTerm || selectedCargo || selectedEclusa
                      ? 'Tente ajustar os filtros para encontrar o que você procura.'
                      : 'Comece criando o primeiro usuário do sistema EDP.'
                    }
                  </p>
                  {(searchTerm || selectedCargo || selectedEclusa) && (
                    <div className="flex justify-center">
                      <button
                        onClick={handleClearFilters}
                        className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Limpar Filtros
                      </button>
                    </div>
                  )}
                </div>
              ) : isMobile ? (
                /* Mobile Cards List */
                <div className="space-y-3 px-4">
                  {/* Card Criar Usuário - Mobile Estilizado */}
                  {permissions?.can_create_users && (
                    <div
                      onClick={openCreateModal}
                      className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 overflow-hidden group cursor-pointer mb-3"
                    >
                      <div className="bg-gray-200 p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-edp-marine flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-800 truncate mb-1 group-hover:text-edp-marine transition-colors">
                            Criar Novo Usuário
                          </h3>
                          <p className="text-xs text-gray-600 truncate">Adicionar usuário ao sistema</p>
                        </div>
                      </div>
                      <div className="bg-gray-300 px-4 py-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700 flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                          Criar Usuário
                        </span>
                        <div className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {paginatedUsers.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onEdit={openEditModal}
                      onDelete={openDeleteModal}
                      onBlock={handleBlock}
                      canEdit={permissions?.can_update_users && canManageUser(user.cargo)}
                      canBlock={permissions?.can_block_users && canManageUser(user.cargo)}
                      canDelete={permissions?.can_delete_users && canManageUser(user.cargo)}
                      currentUserId={currentUser?.id ? Number(currentUser.id) : undefined}
                      isMobile={true}
                    />
                  ))}
                  
                  {/* Mobile Pagination - Melhorada */}
                  {totalPages > 1 && (
                    <div className="flex flex-col items-center gap-3 pt-4">
                      <div className="flex items-center justify-center gap-2 w-full">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-edp"
                        >
                          Anterior
                        </button>
                        
                        <span className="text-sm text-edp-neutral-medium font-edp mx-4">
                          {currentPage} de {totalPages}
                        </span>
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-edp"
                        >
                          Próximo
                        </button>
                      </div>
                      
                      <div className="text-xs text-edp-neutral-medium font-edp text-center">
                        Mostrando {startIndex + 1}-{Math.min(startIndex + usersPerPage, filteredUsers.length)} de {filteredUsers.length} usuários
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Desktop Cards Grid - Sistema responsivo inteligente */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {/* Card Criar Novo Usuário - Desktop */}
                    {permissions?.can_create_users && (
                      <div 
                        onClick={openCreateModal}
                        className="w-full bg-gray-50 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 overflow-hidden group cursor-pointer"
                      >
                        {/* Top Section - Seguindo padrão exato */}
                        <div className="bg-gray-200 p-5">
                          <div className="flex items-center gap-4">
                            {/* Ícone + - Seguindo padrão do avatar */}
                            <div className="w-16 h-16 rounded-full bg-edp-marine flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                            </div>

                            {/* Info - Seguindo padrão */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-800 truncate mb-1 group-hover:text-edp-marine transition-colors">
                                Criar Novo Usuário
                              </h3>
                              <p className="text-sm text-gray-600 truncate">Adicionar usuário ao sistema</p>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Section - Todo cinza seguindo padrão solicitado */}
                        <div className="bg-gray-300 px-4 py-3">
                          <div className="flex items-center justify-between">
                            {/* Status - Todo cinza */}
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                              <span className="text-sm font-medium text-gray-700">
                                Criar Usuário
                              </span>
                            </div>

                            {/* Ícone de ação */}
                            <div className="flex items-center">
                              <div className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {paginatedUsers.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        onEdit={openEditModal}
                        onDelete={openDeleteModal}
                        onBlock={handleBlock}
                        canEdit={permissions?.can_update_users && canManageUser(user.cargo)}
                        canBlock={permissions?.can_block_users && canManageUser(user.cargo)}
                        canDelete={permissions?.can_delete_users && canManageUser(user.cargo)}
                        currentUserId={currentUser?.id ? Number(currentUser.id) : undefined}
                        isMobile={false}
                      />
                    ))}
                  </div>
                  
                  {/* Desktop Pagination - Completamente Centralizada */}
                  {totalPages > 1 && (
                    <div className="flex flex-col items-center gap-3 pt-6">
                      {/* Controles de Paginação */}
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-edp"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        {/* Números das páginas */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-10 h-10 text-sm rounded-lg transition-colors font-edp ${
                                  currentPage === pageNum
                                    ? 'bg-edp-marine text-white'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-edp"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Informação de Items - Centralizada */}
                      <div className="text-sm text-edp-neutral-medium font-edp">
                        Mostrando {startIndex + 1}-{Math.min(startIndex + usersPerPage, filteredUsers.length)} de {filteredUsers.length} usuários
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Criar Novo Usuário"
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input
            label="Nome"
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
            label="ID EDP"
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
        
        {/* Avatar Compacto */}
        <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-edp-neutral-lightest">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-edp-slate flex items-center justify-center overflow-hidden">
            {formData.url_avatar ? (
              <img 
                src={formData.url_avatar} 
                alt="Avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowAvatarSelector(!showAvatarSelector)}
              className="px-2.5 py-1.5 text-xs sm:text-sm text-edp-marine bg-edp-ice rounded-lg hover:bg-edp-ice/80 transition-colors font-edp"
            >
              Avatar
            </button>
            <button
              type="button"
              onClick={() => handleFormChange('url_avatar', generateRandomAvatarUrl())}
              className="px-2.5 py-1.5 text-xs sm:text-sm text-white bg-edp-slate rounded-lg hover:bg-edp-slate/80 transition-colors font-edp"
            >
              Aleatório
            </button>
          </div>
        </div>
        
        {/* Seletor Visual de Avatares - Compacto */}
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
                    handleFormChange('url_avatar', avatarUrl);
                    setShowAvatarSelector(false);
                  }}
                  className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all hover:scale-105 ${
                    formData.url_avatar === avatarUrl 
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
        
        {/* Avatar Compacto - Modal Edição */}
        <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-edp-neutral-lightest">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-edp-slate flex items-center justify-center overflow-hidden">
            {formData.url_avatar ? (
              <img 
                src={formData.url_avatar} 
                alt="Avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowAvatarSelector(!showAvatarSelector)}
              className="px-2.5 py-1.5 text-xs sm:text-sm text-edp-marine bg-edp-ice rounded-lg hover:bg-edp-ice/80 transition-colors font-edp"
            >
              Avatar
            </button>
            <button
              type="button"
              onClick={() => handleFormChange('url_avatar', generateRandomAvatarUrl())}
              className="px-2.5 py-1.5 text-xs sm:text-sm text-white bg-edp-slate rounded-lg hover:bg-edp-slate/80 transition-colors font-edp"
            >
              Aleatório
            </button>
          </div>
        </div>
        
        {/* Seletor Visual de Avatares - Compacto */}
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
                    handleFormChange('url_avatar', avatarUrl);
                    setShowAvatarSelector(false);
                  }}
                  className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all hover:scale-105 ${
                    formData.url_avatar === avatarUrl 
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