package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Database DatabaseConfig
	JWT      JWTConfig
	Server   ServerConfig
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

type JWTConfig struct {
	Secret string
	Issuer string
}

type ServerConfig struct {
	Port string
}

func LoadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		log.Printf("Arquivo .env não encontrado, usando variáveis de ambiente do sistema")
	}

	return &Config{
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "danilo"),
			Password: getEnv("DB_PASSWORD", "Danilo@34333528"),
			DBName:   getEnv("DB_NAME", "EDP_USERS"),
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
			Issuer: getEnv("JWT_ISSUER", "edp-users-api"),
		},
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}