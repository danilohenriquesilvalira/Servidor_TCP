package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

type DB struct {
	*sql.DB
}

type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

func NewConnection(config Config) (*DB, error) {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		config.Host, config.Port, config.User, config.Password, config.DBName)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("erro ao conectar com o banco de dados: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("erro ao verificar conexão com o banco: %w", err)
	}

	log.Printf("Conectado ao banco de dados PostgreSQL: %s", config.DBName)

	return &DB{db}, nil
}

func (db *DB) RunMigrations() error {
	log.Println("Executando migrações do banco de dados...")
	
	if _, err := db.Exec(CreateTablesSQL); err != nil {
		return fmt.Errorf("erro ao executar migrações: %w", err)
	}

	log.Println("Migrações executadas com sucesso!")
	return nil
}