package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID            uuid.UUID `json:"id" db:"id"`
	Nome          string    `json:"nome" db:"nome"`
	Email         string    `json:"email" db:"email"`
	SenhaHash     string    `json:"-" db:"senha_hash"`
	IDUsuarioEDP  string    `json:"id_usuario_edp" db:"id_usuario_edp"`
	Eclusa        string    `json:"eclusa" db:"eclusa"`
	URLAvatar     string    `json:"url_avatar" db:"url_avatar"`
	Cargo         string    `json:"cargo" db:"cargo"`
	Status        string    `json:"status" db:"status"`
	CriadoEm      time.Time `json:"criado_em" db:"criado_em"`
	AtualizadoEm  time.Time `json:"atualizado_em" db:"atualizado_em"`
}

type UserCreateRequest struct {
	Nome         string `json:"nome" validate:"required"`
	Email        string `json:"email" validate:"required,email"`
	Senha        string `json:"senha" validate:"required,min=6"`
	IDUsuarioEDP string `json:"id_usuario_edp" validate:"required"`
	Eclusa       string `json:"eclusa" validate:"required"`
	URLAvatar    string `json:"url_avatar"`
	Cargo        string `json:"cargo" validate:"required"`
}

type UserUpdateRequest struct {
	Nome      string `json:"nome"`
	Email     string `json:"email" validate:"email"`
	Eclusa    string `json:"eclusa"`
	URLAvatar string `json:"url_avatar"`
	Cargo     string `json:"cargo"`
}

type UserResponse struct {
	ID           uuid.UUID `json:"id"`
	Nome         string    `json:"nome"`
	Email        string    `json:"email"`
	IDUsuarioEDP string    `json:"id_usuario_edp"`
	Eclusa       string    `json:"eclusa"`
	URLAvatar    string    `json:"url_avatar"`
	Cargo        string    `json:"cargo"`
	Status       string    `json:"status"`
	CriadoEm     time.Time `json:"criado_em"`
	AtualizadoEm time.Time `json:"atualizado_em"`
}

type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Senha    string `json:"senha" validate:"required"`
}

type LoginResponse struct {
	Token   string       `json:"token"`
	User    UserResponse `json:"user"`
	Expires time.Time    `json:"expires"`
}

type ChangePasswordRequest struct {
	NovaSenha string `json:"nova_senha" validate:"required,min=6"`
}

type UserPermissions struct {
	CanViewUsers   bool `json:"can_view_users"`
	CanCreateUsers bool `json:"can_create_users"`
	CanUpdateUsers bool `json:"can_update_users"`
	CanDeleteUsers bool `json:"can_delete_users"`
	CanBlockUsers  bool `json:"can_block_users"`
	CanManageAdmin bool `json:"can_manage_admin"`
}

const (
	CargoAdmin      = "Admin"
	CargoGerente    = "Gerente"
	CargoSupervisor = "Supervisor"
	CargoTecnico    = "Técnico"
	CargoOperador   = "Operador"
)

const (
	StatusAtivo     = "Ativo"
	StatusBloqueado = "Bloqueado"
)

var ValidEclusas = []string{
	"RÉGUA",
	"POCINHO",
	"VALEIRA",
	"CRESTUMA",
	"CARRAPATELO",
}

var ValidCargos = []string{
	CargoAdmin,
	CargoGerente,
	CargoSupervisor,
	CargoTecnico,
	CargoOperador,
}