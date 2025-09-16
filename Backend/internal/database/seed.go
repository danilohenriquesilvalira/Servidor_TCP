package database

import (
	"log"
	"projeto-hmi/internal/models"
	"projeto-hmi/internal/utils"

	"github.com/google/uuid"
)

type SeedUser struct {
	Nome         string
	Email        string
	IDUsuarioEDP string
	Eclusa       string
	Cargo        string
}

func (db *DB) SeedUsers() error {
	log.Println("Verificando e inserindo dados iniciais...")

	seedUsers := []SeedUser{
		{
			Nome:         "Admin",
			Email:        "admin@edp.com",
			IDUsuarioEDP: "ADMIN",
			Eclusa:       "RÉGUA",
			Cargo:        models.CargoAdmin,
		},
		{
			Nome:         "João Silva",
			Email:        "joao.silva@edp.com",
			IDUsuarioEDP: "E336140",
			Eclusa:       "RÉGUA",
			Cargo:        models.CargoGerente,
		},
		{
			Nome:         "Maria Santos",
			Email:        "maria.santos@edp.com",
			IDUsuarioEDP: "EX106244",
			Eclusa:       "POCINHO",
			Cargo:        models.CargoSupervisor,
		},
		{
			Nome:         "Pedro Costa",
			Email:        "pedro.costa@edp.com",
			IDUsuarioEDP: "EX115227",
			Eclusa:       "VALEIRA",
			Cargo:        models.CargoTecnico,
		},
		{
			Nome:         "Ana Oliveira",
			Email:        "ana.oliveira@edp.com",
			IDUsuarioEDP: "EX129879",
			Eclusa:       "CRESTUMA",
			Cargo:        models.CargoOperador,
		},
		{
			Nome:         "Carlos Ferreira",
			Email:        "carlos.ferreira@edp.com",
			IDUsuarioEDP: "EX129880",
			Eclusa:       "CARRAPATELO",
			Cargo:        models.CargoOperador,
		},
		{
			Nome:         "Luisa Rodrigues",
			Email:        "luisa.rodrigues@edp.com",
			IDUsuarioEDP: "EX129881",
			Eclusa:       "RÉGUA",
			Cargo:        models.CargoTecnico,
		},
		{
			Nome:         "Miguel Almeida",
			Email:        "miguel.almeida@edp.com",
			IDUsuarioEDP: "EX143191",
			Eclusa:       "POCINHO",
			Cargo:        models.CargoSupervisor,
		},
		{
			Nome:         "Sofia Pereira",
			Email:        "sofia.pereira@edp.com",
			IDUsuarioEDP: "EX72689",
			Eclusa:       "VALEIRA",
			Cargo:        models.CargoGerente,
		},
		{
			Nome:         "Rui Martins",
			Email:        "rui.martins@edp.com",
			IDUsuarioEDP: "EX72693",
			Eclusa:       "CRESTUMA",
			Cargo:        models.CargoTecnico,
		},
		{
			Nome:         "Helena Sousa",
			Email:        "helena.sousa@edp.com",
			IDUsuarioEDP: "EX72694",
			Eclusa:       "CARRAPATELO",
			Cargo:        models.CargoOperador,
		},
		{
			Nome:         "André Lopes",
			Email:        "andre.lopes@edp.com",
			IDUsuarioEDP: "EX72699",
			Eclusa:       "RÉGUA",
			Cargo:        models.CargoOperador,
		},
		{
			Nome:         "Beatriz Cunha",
			Email:        "beatriz.cunha@edp.com",
			IDUsuarioEDP: "EX82413",
			Eclusa:       "POCINHO",
			Cargo:        models.CargoTecnico,
		},
		{
			Nome:         "Francisco Dias",
			Email:        "francisco.dias@edp.com",
			IDUsuarioEDP: "EX92193",
			Eclusa:       "VALEIRA",
			Cargo:        models.CargoSupervisor,
		},
		{
			Nome:         "Catarina Nunes",
			Email:        "catarina.nunes@edp.com",
			IDUsuarioEDP: "EX94182",
			Eclusa:       "CRESTUMA",
			Cargo:        models.CargoOperador,
		},
	}

	defaultPassword := "123456"
	hashedPassword, err := utils.HashPassword(defaultPassword)
	if err != nil {
		return err
	}

	for _, seedUser := range seedUsers {
		var exists bool
		checkQuery := "SELECT EXISTS(SELECT 1 FROM users WHERE id_usuario_edp = $1)"
		err := db.QueryRow(checkQuery, seedUser.IDUsuarioEDP).Scan(&exists)
		if err != nil {
			return err
		}

		if exists {
			log.Printf("Usuário %s (%s) já existe, pulando...", seedUser.Nome, seedUser.IDUsuarioEDP)
			continue
		}

		user := &models.User{
			ID:           uuid.New(),
			Nome:         seedUser.Nome,
			Email:        seedUser.Email,
			SenhaHash:    hashedPassword,
			IDUsuarioEDP: seedUser.IDUsuarioEDP,
			Eclusa:       seedUser.Eclusa,
			URLAvatar:    "",
			Cargo:        seedUser.Cargo,
			Status:       models.StatusAtivo,
		}

		insertQuery := `
			INSERT INTO users (id, nome, email, senha_hash, id_usuario_edp, eclusa, url_avatar, cargo, status)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		`
		_, err = db.Exec(insertQuery, user.ID, user.Nome, user.Email, user.SenhaHash,
			user.IDUsuarioEDP, user.Eclusa, user.URLAvatar, user.Cargo, user.Status)

		if err != nil {
			return err
		}

		log.Printf("Usuário criado: %s (%s) - %s", user.Nome, user.IDUsuarioEDP, user.Cargo)
	}

	log.Println("Dados iniciais inseridos com sucesso!")
	return nil
}