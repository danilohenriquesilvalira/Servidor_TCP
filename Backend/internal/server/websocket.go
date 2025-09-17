package server

import (
	"encoding/json"
	"log"
	"net/http"
	"projeto-hmi/internal/middleware"
	"projeto-hmi/internal/handlers"
	"projeto-hmi/internal/database"
	"projeto-hmi/internal/repository"
	"projeto-hmi/internal/services"
	"projeto-hmi/internal/auth"
)

// startHTTP inicia o servidor HTTP e WebSocket
func (s *Server) startHTTP() error {
	// Middleware CORS para todas as rotas
	corsMiddleware := middleware.NewCORSMiddleware()
	s.router.Use(corsMiddleware.Handler)
	
	// Middleware de log para debug
	s.router.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			log.Printf("📥 %s %s de %s", r.Method, r.URL.Path, r.RemoteAddr)
			next.ServeHTTP(w, r)
		})
	})
	
	// Configurar autenticação primeiro
	s.setupAuthentication()
	
	// Rotas do PLC (WebSocket e APIs de escrita)
	s.router.HandleFunc("/ws", s.handleWebSocket).Methods("GET")
	s.router.HandleFunc("/api/write", s.handleWriteAPI).Methods("POST", "OPTIONS")
	s.router.HandleFunc("/api/status", s.handleStatusAPI).Methods("GET", "OPTIONS")
	
	// Rota de teste simples
	s.router.HandleFunc("/api/test", func(w http.ResponseWriter, r *http.Request) {
		log.Printf("🧪 Requisição recebida: %s %s de %s", r.Method, r.URL.Path, r.RemoteAddr)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message":"API funcionando!","status":"ok"}`))
	}).Methods("GET", "OPTIONS")

	// Serve arquivos estáticos
	fs := http.FileServer(http.Dir(s.config.StaticDir))
	s.router.PathPrefix("/").Handler(fs)

	log.Println("✅ Servidores rodando!")
	log.Printf("🌐 Backend HTTP escutando em: %s", s.config.HTTPPort)
	log.Printf("📡 API Write: http://%s/api/write", s.config.HTTPPort)
	log.Printf("📊 API Status: http://%s/api/status", s.config.HTTPPort) 
	log.Printf("🧪 API Test: http://%s/api/test", s.config.HTTPPort)
	log.Printf("🔐 API Login: http://%s/api/login", s.config.HTTPPort)
	log.Println("💡 Acesse via:")
	log.Println("   - Localhost: http://localhost:8081/api/test")
	log.Println("   - Rede local: http://[SEU_IP_LOCAL]:8081/api/test") 
	log.Println("   - Tailscale: http://100.95.236.96:8081/api/test")

	return http.ListenAndServe(s.config.HTTPPort, s.router)
}

// handleWebSocket gerencia conexões WebSocket
func (s *Server) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("❌ WebSocket upgrade error: %v", err)
		return
	}
	defer conn.Close()

	s.AddClient(conn)
	clientCount := s.GetClientCount()
	log.Printf("🌐 Cliente WebSocket conectado. Total: %d", clientCount)

	defer func() {
		s.RemoveClient(conn)
		clientCount := s.GetClientCount()
		log.Printf("🌐 Cliente WebSocket desconectado. Total: %d", clientCount)
	}()

	// Mantém conexão viva e escuta mensagens
	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			break
		}

		// Processa mensagens de escrita via WebSocket
		if messageType == 1 { // Text message
			var writeReq WriteRequest
			if err := json.Unmarshal(message, &writeReq); err == nil {
				log.Printf("📝 Comando via WebSocket: %+v", writeReq)
				s.WriteToPLC(writeReq)
			}
		}
	}
}

// handleWriteAPI processa solicitações de escrita via HTTP POST
func (s *Server) handleWriteAPI(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var writeReq WriteRequest
	if err := json.NewDecoder(r.Body).Decode(&writeReq); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	log.Printf("📝 Comando via API: %+v", writeReq)
	s.WriteToPLC(writeReq)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Comando enviado"})
}

// handleStatusAPI retorna status do servidor
func (s *Server) handleStatusAPI(w http.ResponseWriter, r *http.Request) {
	status := map[string]interface{}{
		"websocket_clients": s.GetClientCount(),
		"plc_connections":   s.GetPLCCount(),
		"server_status":     "running",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
}

// setupAuthentication configura todos os handlers e middlewares de autenticação
func (s *Server) setupAuthentication() {
	// Configuração do banco de dados
	dbConfig := database.Config{
		Host:     "localhost",
		Port:     "5432",
		User:     "danilo",
		Password: "Danilo@34333528",
		DBName:   "EDP_USERS",
	}
	
	// Inicializar database
	log.Println("🔌 Tentando conectar ao banco de dados...")
	db, err := database.NewConnection(dbConfig)
	if err != nil {
		log.Printf("❌ Erro ao conectar database: %v", err)
		log.Println("⚠️ Criando rotas de fallback para autenticação...")
		
		// Criar rota de login de fallback para testes (usuários hardcoded)
		s.router.HandleFunc("/api/login", func(w http.ResponseWriter, r *http.Request) {
			log.Printf("🔐 Login (modo fallback): %s", r.RemoteAddr)
			
			var loginReq struct {
				Email string `json:"email"`
				Senha string `json:"senha"`
			}
			
			if err := json.NewDecoder(r.Body).Decode(&loginReq); err != nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusBadRequest)
				w.Write([]byte(`{"error":"JSON inválido"}`))
				return
			}
			
			// Usuário de teste hardcoded
			if loginReq.Email == "admin@edp.com" && loginReq.Senha == "123456" {
				token := "test-token-123"
				response := map[string]interface{}{
					"token": token,
					"user": map[string]interface{}{
						"id": "1",
						"nome": "Admin Teste",
						"email": "admin@edp.com",
						"cargo": "Admin",
						"eclusa": "RÉGUA",
						"status": "Ativo",
					},
					"permissions": map[string]bool{
						"can_create_users": true,
						"can_update_users": true,
						"can_delete_users": true,
						"can_block_users": true,
					},
				}
				
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				json.NewEncoder(w).Encode(response)
				log.Printf("✅ Login bem-sucedido (teste): %s", loginReq.Email)
			} else {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				w.Write([]byte(`{"error":"Email ou senha inválidos"}`))
				log.Printf("❌ Login falhado (teste): %s", loginReq.Email)
			}
		}).Methods("POST", "OPTIONS")
		
		return
	}
	log.Println("✅ Banco de dados conectado com sucesso!")
	
	// Inicializar repositórios
	userRepo := repository.NewUserRepository(db)
	auditRepo := repository.NewAuditRepository(db)
	
	// Inicializar serviços
	jwtService := auth.NewJWTService("edp-users-jwt-secret-key-2024-secure", "edp-users-api")
	rbacService := auth.NewRBACService()
	userService := services.NewUserService(userRepo, auditRepo, jwtService, rbacService)
	
	// Inicializar handlers e middlewares
	userHandler := handlers.NewUserHandler(userService)
	authMiddleware := middleware.NewAuthMiddleware(jwtService, userRepo)
	rateLimiter := middleware.NewRateLimiter()
	
	// Configurar rotas de autenticação
	log.Println("🔗 Configurando rotas de autenticação...")
	s.SetupAuthRoutes(userHandler, authMiddleware, rateLimiter)
	
	log.Println("✅ Sistema de autenticação configurado!")
}

