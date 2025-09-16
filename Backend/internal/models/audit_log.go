package models

import (
	"time"

	"github.com/google/uuid"
)

type AuthLog struct {
	ID        uuid.UUID `json:"id" db:"id"`
	UserID    uuid.UUID `json:"user_id" db:"user_id"`
	Email     string    `json:"email" db:"email"`
	Action    string    `json:"action" db:"action"`
	IPAddress string    `json:"ip_address" db:"ip_address"`
	UserAgent string    `json:"user_agent" db:"user_agent"`
	Success   bool      `json:"success" db:"success"`
	Timestamp time.Time `json:"timestamp" db:"timestamp"`
}

type AuditLog struct {
	ID               uuid.UUID `json:"id" db:"id"`
	UserID           uuid.UUID `json:"user_id" db:"user_id"`
	UserEmail        string    `json:"user_email" db:"user_email"`
	TargetUserID     *uuid.UUID `json:"target_user_id" db:"target_user_id"`
	TargetUserEmail  *string   `json:"target_user_email" db:"target_user_email"`
	Action           string    `json:"action" db:"action"`
	Description      string    `json:"description" db:"description"`
	IPAddress        string    `json:"ip_address" db:"ip_address"`
	Timestamp        time.Time `json:"timestamp" db:"timestamp"`
}

const (
	ActionLogin         = "LOGIN"
	ActionLogout        = "LOGOUT"
	ActionLoginFailed   = "LOGIN_FAILED"
)

const (
	AuditActionCreateUser    = "CREATE_USER"
	AuditActionUpdateUser    = "UPDATE_USER"
	AuditActionBlockUser     = "BLOCK_USER"
	AuditActionUnblockUser   = "UNBLOCK_USER"
	AuditActionDeleteUser    = "DELETE_USER"
	AuditActionChangePassword = "CHANGE_PASSWORD"
)