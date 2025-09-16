package repository

import (
	"database/sql"
	"fmt"
	"projeto-hmi/internal/database"
	"projeto-hmi/internal/models"

	"github.com/google/uuid"
)

type UserRepository struct {
	db *database.DB
}

func NewUserRepository(db *database.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *models.User) error {
	query := `
		INSERT INTO users (id, nome, email, senha_hash, id_usuario_edp, eclusa, url_avatar, cargo, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := r.db.Exec(query, user.ID, user.Nome, user.Email, user.SenhaHash, 
		user.IDUsuarioEDP, user.Eclusa, user.URLAvatar, user.Cargo, user.Status)
	
	return err
}

func (r *UserRepository) GetByID(id uuid.UUID) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, nome, email, senha_hash, id_usuario_edp, eclusa, url_avatar, cargo, status, criado_em, atualizado_em
		FROM users WHERE id = $1
	`
	err := r.db.QueryRow(query, id).Scan(&user.ID, &user.Nome, &user.Email, &user.SenhaHash,
		&user.IDUsuarioEDP, &user.Eclusa, &user.URLAvatar, &user.Cargo, &user.Status, &user.CriadoEm, &user.AtualizadoEm)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	
	return user, nil
}

func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, nome, email, senha_hash, id_usuario_edp, eclusa, url_avatar, cargo, status, criado_em, atualizado_em
		FROM users WHERE email = $1
	`
	err := r.db.QueryRow(query, email).Scan(&user.ID, &user.Nome, &user.Email, &user.SenhaHash,
		&user.IDUsuarioEDP, &user.Eclusa, &user.URLAvatar, &user.Cargo, &user.Status, &user.CriadoEm, &user.AtualizadoEm)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	
	return user, nil
}

func (r *UserRepository) GetByIDUsuarioEDP(idUsuarioEDP string) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, nome, email, senha_hash, id_usuario_edp, eclusa, url_avatar, cargo, status, criado_em, atualizado_em
		FROM users WHERE id_usuario_edp = $1
	`
	err := r.db.QueryRow(query, idUsuarioEDP).Scan(&user.ID, &user.Nome, &user.Email, &user.SenhaHash,
		&user.IDUsuarioEDP, &user.Eclusa, &user.URLAvatar, &user.Cargo, &user.Status, &user.CriadoEm, &user.AtualizadoEm)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	
	return user, nil
}

func (r *UserRepository) GetAll() ([]*models.User, error) {
	query := `
		SELECT id, nome, email, senha_hash, id_usuario_edp, eclusa, url_avatar, cargo, status, criado_em, atualizado_em
		FROM users ORDER BY nome
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*models.User
	for rows.Next() {
		user := &models.User{}
		err := rows.Scan(&user.ID, &user.Nome, &user.Email, &user.SenhaHash,
			&user.IDUsuarioEDP, &user.Eclusa, &user.URLAvatar, &user.Cargo, &user.Status, &user.CriadoEm, &user.AtualizadoEm)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

func (r *UserRepository) Update(user *models.User) error {
	query := `
		UPDATE users 
		SET nome = $2, email = $3, eclusa = $4, url_avatar = $5, cargo = $6, status = $7
		WHERE id = $1
	`
	_, err := r.db.Exec(query, user.ID, user.Nome, user.Email, user.Eclusa, user.URLAvatar, user.Cargo, user.Status)
	return err
}

func (r *UserRepository) UpdatePassword(userID uuid.UUID, senhaHash string) error {
	query := `UPDATE users SET senha_hash = $2 WHERE id = $1`
	_, err := r.db.Exec(query, userID, senhaHash)
	return err
}

func (r *UserRepository) UpdateStatus(userID uuid.UUID, status string) error {
	query := `UPDATE users SET status = $2 WHERE id = $1`
	_, err := r.db.Exec(query, userID, status)
	return err
}

func (r *UserRepository) Delete(id uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`
	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("usuário não encontrado")
	}

	return nil
}

func (r *UserRepository) GetUsersCanManage(currentUserCargo string) ([]*models.User, error) {
	var query string
	
	switch currentUserCargo {
	case models.CargoAdmin:
		query = `
			SELECT id, nome, email, senha_hash, id_usuario_edp, eclusa, url_avatar, cargo, status, criado_em, atualizado_em
			FROM users ORDER BY nome
		`
	case models.CargoGerente:
		query = `
			SELECT id, nome, email, senha_hash, id_usuario_edp, eclusa, url_avatar, cargo, status, criado_em, atualizado_em
			FROM users WHERE cargo IN ('Supervisor', 'Técnico', 'Operador') ORDER BY nome
		`
	case models.CargoSupervisor:
		query = `
			SELECT id, nome, email, senha_hash, id_usuario_edp, eclusa, url_avatar, cargo, status, criado_em, atualizado_em
			FROM users WHERE cargo IN ('Técnico', 'Operador') ORDER BY nome
		`
	case models.CargoTecnico:
		query = `
			SELECT id, nome, email, senha_hash, id_usuario_edp, eclusa, url_avatar, cargo, status, criado_em, atualizado_em
			FROM users WHERE cargo = 'Operador' ORDER BY nome
		`
	default:
		return []*models.User{}, nil
	}

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*models.User
	for rows.Next() {
		user := &models.User{}
		err := rows.Scan(&user.ID, &user.Nome, &user.Email, &user.SenhaHash,
			&user.IDUsuarioEDP, &user.Eclusa, &user.URLAvatar, &user.Cargo, &user.Status, &user.CriadoEm, &user.AtualizadoEm)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}