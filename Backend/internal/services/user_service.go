package services

import (
	"fmt"
	"projeto-hmi/internal/auth"
	"projeto-hmi/internal/models"
	"projeto-hmi/internal/repository"
	"projeto-hmi/internal/utils"
	"time"

	"github.com/google/uuid"
)

type UserService struct {
	userRepo     *repository.UserRepository
	auditRepo    *repository.AuditRepository
	jwtService   *auth.JWTService
	rbacService  *auth.RBACService
}

func NewUserService(userRepo *repository.UserRepository, auditRepo *repository.AuditRepository, jwtService *auth.JWTService, rbacService *auth.RBACService) *UserService {
	return &UserService{
		userRepo:    userRepo,
		auditRepo:   auditRepo,
		jwtService:  jwtService,
		rbacService: rbacService,
	}
}

func (s *UserService) Login(username, password, ipAddress, userAgent string) (*models.LoginResponse, error) {
	user, err := s.userRepo.GetByIDUsuarioEDP(username)
	if err != nil {
		s.logAuth(uuid.Nil, username, models.ActionLoginFailed, ipAddress, userAgent, false)
		return nil, fmt.Errorf("credenciais inválidas")
	}

	if user == nil {
		s.logAuth(uuid.Nil, username, models.ActionLoginFailed, ipAddress, userAgent, false)
		return nil, fmt.Errorf("credenciais inválidas")
	}

	if user.Status == models.StatusBloqueado {
		s.logAuth(user.ID, username, models.ActionLoginFailed, ipAddress, userAgent, false)
		return nil, fmt.Errorf("usuário bloqueado")
	}

	if !utils.CheckPasswordHash(password, user.SenhaHash) {
		s.logAuth(user.ID, username, models.ActionLoginFailed, ipAddress, userAgent, false)
		return nil, fmt.Errorf("credenciais inválidas")
	}

	token, expires, err := s.jwtService.GenerateToken(user)
	if err != nil {
		return nil, fmt.Errorf("erro ao gerar token: %w", err)
	}

	s.logAuth(user.ID, username, models.ActionLogin, ipAddress, userAgent, true)

	return &models.LoginResponse{
		Token: token,
		User: models.UserResponse{
			ID:           user.ID,
			Nome:         user.Nome,
			Email:        user.Email,
			IDUsuarioEDP: user.IDUsuarioEDP,
			Eclusa:       user.Eclusa,
			URLAvatar:    user.URLAvatar,
			Cargo:        user.Cargo,
			Status:       user.Status,
			CriadoEm:     user.CriadoEm,
			AtualizadoEm: user.AtualizadoEm,
		},
		Expires: expires,
	}, nil
}

func (s *UserService) CreateUser(req *models.UserCreateRequest, currentUser *models.User, ipAddress string) (*models.UserResponse, error) {
	if !s.rbacService.CanManageUser(currentUser.Cargo, req.Cargo) {
		return nil, fmt.Errorf("sem permissão para criar usuário com cargo %s", req.Cargo)
	}

	if !s.isValidEclusa(req.Eclusa) {
		return nil, fmt.Errorf("eclusa inválida: %s", req.Eclusa)
	}

	if !s.isValidCargo(req.Cargo) {
		return nil, fmt.Errorf("cargo inválido: %s", req.Cargo)
	}

	existingUser, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		return nil, fmt.Errorf("erro ao verificar email: %w", err)
	}
	if existingUser != nil {
		return nil, fmt.Errorf("email já está em uso")
	}

	existingUser, err = s.userRepo.GetByIDUsuarioEDP(req.IDUsuarioEDP)
	if err != nil {
		return nil, fmt.Errorf("erro ao verificar ID usuário EDP: %w", err)
	}
	if existingUser != nil {
		return nil, fmt.Errorf("ID usuário EDP já está em uso")
	}

	hashedPassword, err := utils.HashPassword(req.Senha)
	if err != nil {
		return nil, fmt.Errorf("erro ao criptografar senha: %w", err)
	}

	user := &models.User{
		ID:           uuid.New(),
		Nome:         req.Nome,
		Email:        req.Email,
		SenhaHash:    hashedPassword,
		IDUsuarioEDP: req.IDUsuarioEDP,
		Eclusa:       req.Eclusa,
		URLAvatar:    req.URLAvatar,
		Cargo:        req.Cargo,
		Status:       models.StatusAtivo,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, fmt.Errorf("erro ao criar usuário: %w", err)
	}

	s.logAudit(currentUser.ID, currentUser.Email, &user.ID, &user.Email,
		models.AuditActionCreateUser, fmt.Sprintf("Usuário criado: %s (%s)", user.Nome, user.Email), ipAddress)

	return &models.UserResponse{
		ID:           user.ID,
		Nome:         user.Nome,
		Email:        user.Email,
		IDUsuarioEDP: user.IDUsuarioEDP,
		Eclusa:       user.Eclusa,
		URLAvatar:    user.URLAvatar,
		Cargo:        user.Cargo,
		Status:       user.Status,
		CriadoEm:     user.CriadoEm,
		AtualizadoEm: user.AtualizadoEm,
	}, nil
}

func (s *UserService) GetUsers(currentUser *models.User) ([]*models.UserResponse, error) {
	permissions := s.rbacService.GetUserPermissions(currentUser.Cargo)
	if !permissions.CanViewUsers {
		return nil, fmt.Errorf("sem permissão para visualizar usuários")
	}

	users, err := s.userRepo.GetUsersCanManage(currentUser.Cargo)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar usuários: %w", err)
	}

	var response []*models.UserResponse
	for _, user := range users {
		response = append(response, &models.UserResponse{
			ID:           user.ID,
			Nome:         user.Nome,
			Email:        user.Email,
			IDUsuarioEDP: user.IDUsuarioEDP,
			Eclusa:       user.Eclusa,
			URLAvatar:    user.URLAvatar,
			Cargo:        user.Cargo,
			Status:       user.Status,
			CriadoEm:     user.CriadoEm,
			AtualizadoEm: user.AtualizadoEm,
		})
	}

	return response, nil
}

func (s *UserService) GetUserByID(userID uuid.UUID, currentUser *models.User) (*models.UserResponse, error) {
	permissions := s.rbacService.GetUserPermissions(currentUser.Cargo)
	if !permissions.CanViewUsers {
		return nil, fmt.Errorf("sem permissão para visualizar usuários")
	}

	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar usuário: %w", err)
	}
	if user == nil {
		return nil, fmt.Errorf("usuário não encontrado")
	}

	if !s.rbacService.CanManageUser(currentUser.Cargo, user.Cargo) && currentUser.ID != user.ID {
		return nil, fmt.Errorf("sem permissão para visualizar este usuário")
	}

	return &models.UserResponse{
		ID:           user.ID,
		Nome:         user.Nome,
		Email:        user.Email,
		IDUsuarioEDP: user.IDUsuarioEDP,
		Eclusa:       user.Eclusa,
		URLAvatar:    user.URLAvatar,
		Cargo:        user.Cargo,
		Status:       user.Status,
		CriadoEm:     user.CriadoEm,
		AtualizadoEm: user.AtualizadoEm,
	}, nil
}

func (s *UserService) UpdateUser(userID uuid.UUID, req *models.UserUpdateRequest, currentUser *models.User, ipAddress string) (*models.UserResponse, error) {
	permissions := s.rbacService.GetUserPermissions(currentUser.Cargo)
	if !permissions.CanUpdateUsers {
		return nil, fmt.Errorf("sem permissão para atualizar usuários")
	}

	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar usuário: %w", err)
	}
	if user == nil {
		return nil, fmt.Errorf("usuário não encontrado")
	}

	if !s.rbacService.CanManageUser(currentUser.Cargo, user.Cargo) && currentUser.ID != user.ID {
		return nil, fmt.Errorf("sem permissão para atualizar este usuário")
	}

	if req.Email != "" && req.Email != user.Email {
		existingUser, err := s.userRepo.GetByEmail(req.Email)
		if err != nil {
			return nil, fmt.Errorf("erro ao verificar email: %w", err)
		}
		if existingUser != nil {
			return nil, fmt.Errorf("email já está em uso")
		}
		user.Email = req.Email
	}

	if req.Nome != "" {
		user.Nome = req.Nome
	}

	if req.Eclusa != "" {
		if !s.isValidEclusa(req.Eclusa) {
			return nil, fmt.Errorf("eclusa inválida: %s", req.Eclusa)
		}
		user.Eclusa = req.Eclusa
	}

	// Permitir atualizar URLAvatar mesmo se estiver vazio (para remover avatar)
	user.URLAvatar = req.URLAvatar

	if req.Cargo != "" && req.Cargo != user.Cargo {
		if !s.isValidCargo(req.Cargo) {
			return nil, fmt.Errorf("cargo inválido: %s", req.Cargo)
		}
		if !s.rbacService.CanManageUser(currentUser.Cargo, req.Cargo) {
			return nil, fmt.Errorf("sem permissão para definir cargo %s", req.Cargo)
		}
		user.Cargo = req.Cargo
	}

	if err := s.userRepo.Update(user); err != nil {
		return nil, fmt.Errorf("erro ao atualizar usuário: %w", err)
	}

	s.logAudit(currentUser.ID, currentUser.Email, &user.ID, &user.Email,
		models.AuditActionUpdateUser, fmt.Sprintf("Usuário atualizado: %s (%s)", user.Nome, user.Email), ipAddress)

	return &models.UserResponse{
		ID:           user.ID,
		Nome:         user.Nome,
		Email:        user.Email,
		IDUsuarioEDP: user.IDUsuarioEDP,
		Eclusa:       user.Eclusa,
		URLAvatar:    user.URLAvatar,
		Cargo:        user.Cargo,
		Status:       user.Status,
		CriadoEm:     user.CriadoEm,
		AtualizadoEm: user.AtualizadoEm,
	}, nil
}

func (s *UserService) ChangePassword(userID uuid.UUID, req *models.ChangePasswordRequest, currentUser *models.User, ipAddress string) error {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return fmt.Errorf("erro ao buscar usuário: %w", err)
	}
	if user == nil {
		return fmt.Errorf("usuário não encontrado")
	}

	if !s.rbacService.CanManageUser(currentUser.Cargo, user.Cargo) && currentUser.ID != user.ID {
		return fmt.Errorf("sem permissão para alterar senha deste usuário")
	}

	hashedPassword, err := utils.HashPassword(req.NovaSenha)
	if err != nil {
		return fmt.Errorf("erro ao criptografar senha: %w", err)
	}

	if err := s.userRepo.UpdatePassword(userID, hashedPassword); err != nil {
		return fmt.Errorf("erro ao atualizar senha: %w", err)
	}

	s.logAudit(currentUser.ID, currentUser.Email, &user.ID, &user.Email,
		models.AuditActionChangePassword, fmt.Sprintf("Senha alterada para usuário: %s (%s)", user.Nome, user.Email), ipAddress)

	return nil
}

func (s *UserService) BlockUser(userID uuid.UUID, currentUser *models.User, ipAddress string) error {
	return s.updateUserStatus(userID, models.StatusBloqueado, currentUser, ipAddress)
}

func (s *UserService) UnblockUser(userID uuid.UUID, currentUser *models.User, ipAddress string) error {
	return s.updateUserStatus(userID, models.StatusAtivo, currentUser, ipAddress)
}

func (s *UserService) DeleteUser(userID uuid.UUID, currentUser *models.User, ipAddress string) error {
	permissions := s.rbacService.GetUserPermissions(currentUser.Cargo)
	if !permissions.CanDeleteUsers {
		return fmt.Errorf("sem permissão para deletar usuários")
	}

	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return fmt.Errorf("erro ao buscar usuário: %w", err)
	}
	if user == nil {
		return fmt.Errorf("usuário não encontrado")
	}

	if user.Cargo == models.CargoAdmin {
		return fmt.Errorf("não é possível deletar usuários Admin")
	}

	if !s.rbacService.CanManageUser(currentUser.Cargo, user.Cargo) {
		return fmt.Errorf("sem permissão para deletar este usuário")
	}

	if err := s.userRepo.Delete(userID); err != nil {
		return fmt.Errorf("erro ao deletar usuário: %w", err)
	}

	s.logAudit(currentUser.ID, currentUser.Email, &user.ID, &user.Email,
		models.AuditActionDeleteUser, fmt.Sprintf("Usuário deletado: %s (%s)", user.Nome, user.Email), ipAddress)

	return nil
}

func (s *UserService) GetUserPermissions(cargo string) models.UserPermissions {
	return s.rbacService.GetUserPermissions(cargo)
}

func (s *UserService) updateUserStatus(userID uuid.UUID, status string, currentUser *models.User, ipAddress string) error {
	permissions := s.rbacService.GetUserPermissions(currentUser.Cargo)
	if !permissions.CanBlockUsers {
		return fmt.Errorf("sem permissão para alterar status de usuários")
	}

	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return fmt.Errorf("erro ao buscar usuário: %w", err)
	}
	if user == nil {
		return fmt.Errorf("usuário não encontrado")
	}

	if user.Cargo == models.CargoAdmin {
		return fmt.Errorf("não é possível alterar status de usuários Admin")
	}

	if !s.rbacService.CanManageUser(currentUser.Cargo, user.Cargo) {
		return fmt.Errorf("sem permissão para alterar status deste usuário")
	}

	if err := s.userRepo.UpdateStatus(userID, status); err != nil {
		return fmt.Errorf("erro ao atualizar status: %w", err)
	}

	action := models.AuditActionBlockUser
	description := fmt.Sprintf("Usuário bloqueado: %s (%s)", user.Nome, user.Email)
	if status == models.StatusAtivo {
		action = models.AuditActionUnblockUser
		description = fmt.Sprintf("Usuário desbloqueado: %s (%s)", user.Nome, user.Email)
	}

	s.logAudit(currentUser.ID, currentUser.Email, &user.ID, &user.Email, action, description, ipAddress)

	return nil
}

func (s *UserService) isValidEclusa(eclusa string) bool {
	for _, valid := range models.ValidEclusas {
		if valid == eclusa {
			return true
		}
	}
	return false
}

func (s *UserService) isValidCargo(cargo string) bool {
	for _, valid := range models.ValidCargos {
		if valid == cargo {
			return true
		}
	}
	return false
}

func (s *UserService) logAuth(userID uuid.UUID, email, action, ipAddress, userAgent string, success bool) {
	authLog := &models.AuthLog{
		ID:        uuid.New(),
		UserID:    userID,
		Email:     email,
		Action:    action,
		IPAddress: ipAddress,
		UserAgent: userAgent,
		Success:   success,
		Timestamp: time.Now(),
	}
	s.auditRepo.CreateAuthLog(authLog)
}

func (s *UserService) logAudit(userID uuid.UUID, userEmail string, targetUserID *uuid.UUID, targetUserEmail *string, action, description, ipAddress string) {
	auditLog := &models.AuditLog{
		ID:              uuid.New(),
		UserID:          userID,
		UserEmail:       userEmail,
		TargetUserID:    targetUserID,
		TargetUserEmail: targetUserEmail,
		Action:          action,
		Description:     description,
		IPAddress:       ipAddress,
		Timestamp:       time.Now(),
	}
	s.auditRepo.CreateAuditLog(auditLog)
}