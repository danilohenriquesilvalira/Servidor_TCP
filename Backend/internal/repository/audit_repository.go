package repository

import (
	"projeto-hmi/internal/database"
	"projeto-hmi/internal/models"
)

type AuditRepository struct {
	db *database.DB
}

func NewAuditRepository(db *database.DB) *AuditRepository {
	return &AuditRepository{db: db}
}

func (r *AuditRepository) CreateAuthLog(authLog *models.AuthLog) error {
	query := `
		INSERT INTO auth_logs (id, user_id, email, action, ip_address, user_agent, success)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.Exec(query, authLog.ID, authLog.UserID, authLog.Email, 
		authLog.Action, authLog.IPAddress, authLog.UserAgent, authLog.Success)
	
	return err
}

func (r *AuditRepository) CreateAuditLog(auditLog *models.AuditLog) error {
	query := `
		INSERT INTO audit_logs (id, user_id, user_email, target_user_id, target_user_email, action, description, ip_address)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.Exec(query, auditLog.ID, auditLog.UserID, auditLog.UserEmail,
		auditLog.TargetUserID, auditLog.TargetUserEmail, auditLog.Action, auditLog.Description, auditLog.IPAddress)
	
	return err
}

func (r *AuditRepository) GetAuthLogs(limit int) ([]*models.AuthLog, error) {
	query := `
		SELECT id, user_id, email, action, ip_address, user_agent, success, timestamp
		FROM auth_logs 
		ORDER BY timestamp DESC 
		LIMIT $1
	`
	rows, err := r.db.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []*models.AuthLog
	for rows.Next() {
		log := &models.AuthLog{}
		err := rows.Scan(&log.ID, &log.UserID, &log.Email, &log.Action,
			&log.IPAddress, &log.UserAgent, &log.Success, &log.Timestamp)
		if err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}

	return logs, nil
}

func (r *AuditRepository) GetAuditLogs(limit int) ([]*models.AuditLog, error) {
	query := `
		SELECT id, user_id, user_email, target_user_id, target_user_email, action, description, ip_address, timestamp
		FROM audit_logs 
		ORDER BY timestamp DESC 
		LIMIT $1
	`
	rows, err := r.db.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []*models.AuditLog
	for rows.Next() {
		log := &models.AuditLog{}
		err := rows.Scan(&log.ID, &log.UserID, &log.UserEmail, &log.TargetUserID,
			&log.TargetUserEmail, &log.Action, &log.Description, &log.IPAddress, &log.Timestamp)
		if err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}

	return logs, nil
}