package main

import (
	"log"
	"os"
	"path/filepath"
	"projeto-hmi/internal/auth"
	"projeto-hmi/internal/config"
	"projeto-hmi/internal/database"
	"projeto-hmi/internal/handlers"
	"projeto-hmi/internal/middleware"
	"projeto-hmi/internal/repository"
	"projeto-hmi/internal/server"
	"projeto-hmi/internal/services"
)

func main() {
	// === INICIALIZAR SISTEMA DE USUÁRIOS ===
	cfg := config.LoadConfig()

	db, err := database.NewConnection(database.Config{
		Host:     cfg.Database.Host,
		Port:     cfg.Database.Port,
		User:     cfg.Database.User,
		Password: cfg.Database.Password,
		DBName:   cfg.Database.DBName,
	})
	if err != nil {
		log.Println("⚠️ Banco de dados não disponível, continuando sem autenticação:", err)
	} else {
		defer db.Close()
		if err := db.RunMigrations(); err != nil {
			log.Println("⚠️ Erro nas migrações:", err)
		}
		if err := db.SeedUsers(); err != nil {
			log.Println("⚠️ Erro nos dados iniciais:", err)
		}
		log.Println("✅ Sistema de usuários inicializado!")
	}

	// === CÓDIGO ORIGINAL DO PLC ===
	// Determinar diretório do frontend automaticamente
	exe, err := os.Executable()
	if err != nil {
		log.Fatal("Erro obtendo caminho do executável:", err)
	}
	
	// Vai para o diretório pai do Backend
	projectDir := filepath.Dir(filepath.Dir(exe))
	frontendDir := filepath.Join(projectDir, "frontend-react", "dist")
	
	// Se não existir, tenta o caminho relativo padrão
	if _, err := os.Stat(frontendDir); os.IsNotExist(err) {
		frontendDir = "../frontend-react/dist/"
		// Se ainda não existir, usa caminho absoluto fixo
		if _, err := os.Stat(frontendDir); os.IsNotExist(err) {
			frontendDir = "C:/Users/Admin/Desktop/PROJETO_HMI/frontend-react/dist/"
		}
	}
	
	log.Printf("📁 Diretório frontend: %s", frontendDir)

	config := &server.Config{
		TCPPort:   ":8080",
		HTTPPort:  ":8081",
		StaticDir: frontendDir,
	}

	srv := server.New(config)

	// === ADICIONAR ROTAS DE USUÁRIOS SE BD ESTIVER DISPONÍVEL ===
	if db != nil {
		userRepo := repository.NewUserRepository(db)
		auditRepo := repository.NewAuditRepository(db)
		jwtService := auth.NewJWTService(cfg.JWT.Secret, cfg.JWT.Issuer)
		rbacService := auth.NewRBACService()
		userService := services.NewUserService(userRepo, auditRepo, jwtService, rbacService)
		authMiddleware := middleware.NewAuthMiddleware(jwtService, userRepo)
		userHandler := handlers.NewUserHandler(userService)
		rateLimiter := middleware.NewRateLimiter()

		srv.SetupAuthRoutes(userHandler, authMiddleware, rateLimiter)
		log.Println("🔐 Rotas de autenticação adicionadas!")
	}

	log.Println("🚀 Iniciando servidor PLC...")
	if err := srv.Start(); err != nil {
		log.Fatal("❌ Erro ao iniciar servidor:", err)
	}
}
