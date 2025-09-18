package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
	"projeto-hmi/internal/middleware"
	"projeto-hmi/internal/handlers"
	"projeto-hmi/internal/database"
	"projeto-hmi/internal/repository"
	"projeto-hmi/internal/services"
	"projeto-hmi/internal/auth"
	"github.com/gorilla/websocket"
	"github.com/gorilla/mux"
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

// handleWebSocket gerencia conexões WebSocket com segurança avançada
func (s *Server) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	// Verificar origin e headers de segurança
	if r.Header.Get("Origin") == "" {
		log.Printf("⚠️ WebSocket rejeitado: Origin vazio de %s", r.RemoteAddr)
		http.Error(w, "Origin necessário", http.StatusBadRequest)
		return
	}
	
	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("❌ WebSocket upgrade error: %v", err)
		return
	}

	client := s.AddClient(conn)
	clientCount := s.GetClientCount()
	log.Printf("🌐 Cliente WebSocket conectado de %s. Total: %d", r.RemoteAddr, clientCount)

	defer func() {
		s.RemoveClient(client)
		clientCount := s.GetClientCount()
		log.Printf("🌐 Cliente WebSocket desconectado. Total: %d", clientCount)
	}()

	// Configurar timeouts
	conn.SetReadDeadline(time.Now().Add(client.readTimeout))
	
	// Mantém conexão viva e escuta mensagens com rate limiting
	messageCount := 0
	lastMessage := time.Now()
	
	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("❌ WebSocket erro inesperado: %v", err)
			}
			break
		}
		
		// Rate limiting por cliente: máximo 10 mensagens por segundo
		now := time.Now()
		if now.Sub(lastMessage) < 100*time.Millisecond {
			messageCount++
			if messageCount > 10 {
				log.Printf("⚠️ Cliente %s enviando muitas mensagens, desconectando", r.RemoteAddr)
				break
			}
		} else {
			messageCount = 0
			lastMessage = now
		}

		// Processa mensagens de escrita via WebSocket
		if messageType == websocket.TextMessage {
			var writeReq WriteRequest
			if err := json.Unmarshal(message, &writeReq); err == nil {
				log.Printf("📝 Comando via WebSocket de %s: %+v", r.RemoteAddr, writeReq)
				s.WriteToPLC(writeReq)
			} else {
				log.Printf("⚠️ Mensagem JSON inválida de %s: %v", r.RemoteAddr, err)
			}
		}
		
		// Reset deadline
		conn.SetReadDeadline(time.Now().Add(client.readTimeout))
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

// handleStatusAPI retorna status detalhado do servidor
func (s *Server) handleStatusAPI(w http.ResponseWriter, r *http.Request) {
	sent, dropped, errors := s.GetBroadcastStats()
	
	status := map[string]interface{}{
		"websocket_clients": s.GetClientCount(),
		"plc_connections":   s.GetPLCCount(),
		"server_status":     "running",
		"broadcast_stats": map[string]interface{}{
			"messages_sent":    sent,
			"messages_dropped": dropped,
			"messages_errors":  errors,
			"drop_rate":        float64(dropped) / float64(sent+dropped) * 100,
		},
		"uptime": time.Since(time.Now()).String(), // Será atualizado com timestamp real
		"security": map[string]interface{}{
			"rate_limiting_enabled": true,
			"timeout_protection":    true,
			"health_monitoring":     true,
		},
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
		
		// Sistema de usuários em memória para fallback
		var users = []map[string]interface{}{
			{
				"id": "1",
				"nome": "Admin Teste",
				"email": "admin@edp.com",
				"id_usuario_edp": "EDP001",
				"cargo": "Admin",
				"eclusa": "RÉGUA",
				"status": "Ativo",
				"url_avatar": "/Avatar/M_Avatar_13.svg",
			},
			{
				"id": "2", 
				"nome": "Maria Silva",
				"email": "maria@edp.com",
				"id_usuario_edp": "EDP002",
				"cargo": "Gerente",
				"eclusa": "CRESTUMA",
				"status": "Ativo",
				"url_avatar": "/Avatar/Avatar_1.svg",
			},
		}
		
		// Rota de login de fallback
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
					"user": users[0],
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
		
		// GET /api/users - Listar usuários
		s.router.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(users)
			log.Printf("📋 Lista de usuários solicitada")
		}).Methods("GET", "OPTIONS")
		
		// POST /api/users - Criar usuário
		s.router.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
			var newUser map[string]interface{}
			if err := json.NewDecoder(r.Body).Decode(&newUser); err != nil {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "JSON inválido"})
				return
			}
			
			// Gerar ID único
			newUser["id"] = fmt.Sprintf("%d", len(users)+1)
			users = append(users, newUser)
			
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(newUser)
			log.Printf("✅ Usuário criado: %s", newUser["nome"])
		}).Methods("POST", "OPTIONS")
		
		// PUT /api/users/{id} - Atualizar usuário
		s.router.HandleFunc("/api/users/{id}", func(w http.ResponseWriter, r *http.Request) {
			vars := mux.Vars(r)
			userID := vars["id"]
			
			var updateData map[string]interface{}
			if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "JSON inválido"})
				return
			}
			
			// Encontrar e atualizar usuário
			for i, user := range users {
				if user["id"] == userID {
					for key, value := range updateData {
						if key != "id" { // Não permitir alterar ID
							users[i][key] = value
						}
					}
					w.Header().Set("Content-Type", "application/json")
					json.NewEncoder(w).Encode(users[i])
					log.Printf("✅ Usuário %s atualizado", userID)
					return
				}
			}
			
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "Usuário não encontrado"})
		}).Methods("PUT", "OPTIONS")
		
		// DELETE /api/users/{id} - Deletar usuário  
		s.router.HandleFunc("/api/users/{id}", func(w http.ResponseWriter, r *http.Request) {
			vars := mux.Vars(r)
			userID := vars["id"]
			
			// Encontrar e remover usuário
			for i, user := range users {
				if user["id"] == userID {
					users = append(users[:i], users[i+1:]...)
					w.WriteHeader(http.StatusNoContent)
					log.Printf("✅ Usuário %s deletado", userID)
					return
				}
			}
			
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "Usuário não encontrado"})
		}).Methods("DELETE", "OPTIONS")
		
		// PUT /api/users/{id}/block - Bloquear usuário
		s.router.HandleFunc("/api/users/{id}/block", func(w http.ResponseWriter, r *http.Request) {
			vars := mux.Vars(r)
			userID := vars["id"]
			
			for i, user := range users {
				if user["id"] == userID {
					users[i]["status"] = "Bloqueado"
					w.Header().Set("Content-Type", "application/json")
					json.NewEncoder(w).Encode(users[i])
					log.Printf("🔒 Usuário %s bloqueado", userID)
					return
				}
			}
			
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "Usuário não encontrado"})
		}).Methods("PUT", "OPTIONS")
		
		// PUT /api/users/{id}/unblock - Desbloquear usuário
		s.router.HandleFunc("/api/users/{id}/unblock", func(w http.ResponseWriter, r *http.Request) {
			vars := mux.Vars(r)
			userID := vars["id"]
			
			for i, user := range users {
				if user["id"] == userID {
					users[i]["status"] = "Ativo"
					w.Header().Set("Content-Type", "application/json")
					json.NewEncoder(w).Encode(users[i])
					log.Printf("🔓 Usuário %s desbloqueado", userID)
					return
				}
			}
			
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "Usuário não encontrado"})
		}).Methods("PUT", "OPTIONS")
		
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

