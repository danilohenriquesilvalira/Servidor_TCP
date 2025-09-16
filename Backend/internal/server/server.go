package server

import (
	"log"
	"net"
	"net/http"
	"sync"

	"projeto-hmi/internal/plcdata"
	"projeto-hmi/internal/handlers"
	"projeto-hmi/internal/middleware"

	"github.com/gorilla/websocket"
	"github.com/gorilla/mux"
)

// Config contém as configurações do servidor
type Config struct {
	TCPPort   string
	HTTPPort  string
	StaticDir string
}

// WriteRequest representa uma solicitação de escrita PARA o PLC
type WriteRequest struct {
	Words   []WriteValue `json:"words"`   // Array[0..2] = 3 words
	Ints    []WriteValue `json:"ints"`    // Array[0..10] = 11 ints
	Reals   []WriteValue `json:"reals"`   // Array[0..10] = 11 reals
	Strings []WriteValue `json:"strings"` // Array[0..4] = 5 strings
}

// WriteValue representa um valor a ser escrito em uma posição específica
type WriteValue struct {
	Index int         `json:"index"`
	Value interface{} `json:"value"`
}

// Server gerencia as conexões TCP e WebSocket
type Server struct {
	config         *Config
	clients        map[*websocket.Conn]bool
	plcConns       map[net.Conn]bool
	mutex          sync.RWMutex
	plcMutex       sync.RWMutex
	broadcast      chan *plcdata.PLCData
	writeChannel   chan WriteRequest
	upgrader       websocket.Upgrader
	
	// Campos para autenticação de usuários
	userHandler    *handlers.UserHandler
	authMiddleware *middleware.AuthMiddleware
	rateLimiter    *middleware.RateLimiter
	router         *mux.Router
}

// New cria uma nova instância do servidor
func New(config *Config) *Server {
	return &Server{
		config:       config,
		clients:      make(map[*websocket.Conn]bool),
		plcConns:     make(map[net.Conn]bool),
		broadcast:    make(chan *plcdata.PLCData, 1000),
		writeChannel: make(chan WriteRequest, 100),
		router:       mux.NewRouter(),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool { return true },
		},
	}
}

// Start inicia o servidor TCP e HTTP
func (s *Server) Start() error {
	log.Println("🚀 TCP SERVER BIDIRECIONAL + WEBSOCKET ROBUSTO")
	log.Printf("📡 TCP: Porta %s (PLC)", s.config.TCPPort)
	log.Printf("🌐 WEB: Porta %s (Frontend)", s.config.HTTPPort)

	go s.handleBroadcast()
	go s.handleWriteRequests()
	go s.startTCP()

	return s.startHTTP()
}

// GetRouter retorna o router para configuração de rotas
func (s *Server) GetRouter() *mux.Router {
	return mux.NewRouter()
}

// GetClientCount retorna o número de clientes conectados
func (s *Server) GetClientCount() int {
	s.mutex.RLock()
	defer s.mutex.RUnlock()
	return len(s.clients)
}

// GetPLCCount retorna o número de PLCs conectados
func (s *Server) GetPLCCount() int {
	s.plcMutex.RLock()
	defer s.plcMutex.RUnlock()
	return len(s.plcConns)
}

// BroadcastData envia dados para todos os clientes WebSocket
func (s *Server) BroadcastData(data *plcdata.PLCData) {
	select {
	case s.broadcast <- data:
	default:
		log.Println("⚠️ Canal broadcast cheio, descartando mensagem")
	}
}

// WriteToPlC envia dados para o PLC
func (s *Server) WriteToPLC(req WriteRequest) {
	select {
	case s.writeChannel <- req:
		log.Printf("📤 Dados enfileirados para envio: %d Words, %d Ints, %d Reals, %d Strings",
			len(req.Words), len(req.Ints), len(req.Reals), len(req.Strings))
	default:
		log.Println("⚠️ Canal de escrita cheio, descartando comando")
	}
}

// AddClient adiciona um cliente WebSocket
func (s *Server) AddClient(conn *websocket.Conn) {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	s.clients[conn] = true
}

// RemoveClient remove um cliente WebSocket
func (s *Server) RemoveClient(conn *websocket.Conn) {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	delete(s.clients, conn)
}

// AddPLCConnection adiciona uma conexão PLC
func (s *Server) AddPLCConnection(conn net.Conn) {
	s.plcMutex.Lock()
	defer s.plcMutex.Unlock()
	s.plcConns[conn] = true
}

// RemovePLCConnection remove uma conexão PLC
func (s *Server) RemovePLCConnection(conn net.Conn) {
	s.plcMutex.Lock()
	defer s.plcMutex.Unlock()
	delete(s.plcConns, conn)
}

// handleBroadcast processa o broadcast de dados para clientes WebSocket
func (s *Server) handleBroadcast() {
	for data := range s.broadcast {
		s.mutex.RLock()
		for client := range s.clients {
			err := client.WriteJSON(data)
			if err != nil {
				log.Printf("❌ Erro enviando WebSocket: %v", err)
				client.Close()
				delete(s.clients, client)
			}
		}
		s.mutex.RUnlock()
	}
}

// handleWriteRequests processa solicitações de escrita para PLCs
func (s *Server) handleWriteRequests() {
	for writeReq := range s.writeChannel {
		s.plcMutex.RLock()
		if len(s.plcConns) == 0 {
			log.Println("⚠️ Nenhum PLC conectado para enviar dados")
			s.plcMutex.RUnlock()
			continue
		}

		// Converte WriteRequest para bytes
		data := SerializeWriteRequest(writeReq)

		// Envia para todos os PLCs conectados
		for plcConn := range s.plcConns {
			_, err := plcConn.Write(data)
			if err != nil {
				log.Printf("❌ Erro enviando para PLC %s: %v", plcConn.RemoteAddr(), err)
				plcConn.Close()
				delete(s.plcConns, plcConn)
			} else {
				log.Printf("✅ Dados enviados para PLC %s: %d bytes", plcConn.RemoteAddr(), len(data))
			}
		}
		s.plcMutex.RUnlock()
	}
}

// SetupAuthRoutes configura as rotas de autenticação no router mux
func (s *Server) SetupAuthRoutes(userHandler *handlers.UserHandler, authMiddleware *middleware.AuthMiddleware, rateLimiter *middleware.RateLimiter) {
	s.userHandler = userHandler
	s.authMiddleware = authMiddleware
	s.rateLimiter = rateLimiter
	
	// Subrouter para /api
	apiRouter := s.router.PathPrefix("/api").Subrouter()
	
	// Rota de login (sem autenticação)
	apiRouter.HandleFunc("/login", s.rateLimiter.LoginRateLimit(s.userHandler.Login)).Methods("POST", "OPTIONS")
	
	// Rotas protegidas (requerem autenticação)
	apiRouter.HandleFunc("/me", s.authMiddleware.RequireAuth(s.userHandler.GetCurrentUser)).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/permissions", s.authMiddleware.RequireAuth(s.userHandler.GetUserPermissions)).Methods("GET", "OPTIONS")
	
	// Rotas de gerenciamento de usuários
	apiRouter.HandleFunc("/users", s.authMiddleware.RequireAuth(s.userHandler.GetUsers)).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/users", s.authMiddleware.RequireAuth(s.userHandler.CreateUser)).Methods("POST", "OPTIONS")
	apiRouter.HandleFunc("/users/{id}", s.authMiddleware.RequireAuth(s.userHandler.GetUserByID)).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/users/{id}", s.authMiddleware.RequireAuth(s.userHandler.UpdateUser)).Methods("PUT", "OPTIONS")
	apiRouter.HandleFunc("/users/{id}", s.authMiddleware.RequireAuth(s.userHandler.DeleteUser)).Methods("DELETE", "OPTIONS")
	apiRouter.HandleFunc("/users/{id}/password", s.authMiddleware.RequireAuth(s.userHandler.ChangePassword)).Methods("PUT", "OPTIONS")
	apiRouter.HandleFunc("/users/{id}/block", s.authMiddleware.RequireAuth(s.userHandler.BlockUser)).Methods("PUT", "OPTIONS")
	apiRouter.HandleFunc("/users/{id}/unblock", s.authMiddleware.RequireAuth(s.userHandler.UnblockUser)).Methods("PUT", "OPTIONS")
	
	// Rota de health check para autenticação
	apiRouter.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Sistema de autenticação EDP ativo"))
	}).Methods("GET", "OPTIONS")
	
	log.Println("✅ Rotas de autenticação registradas no mux!")
	log.Println("🔐 Login: POST /api/login")
	log.Println("👤 Perfil: GET /api/me")
	log.Println("🔑 Permissões: GET /api/permissions")
	log.Println("👥 Usuários: GET/POST /api/users")
	log.Println("🏥 Health: GET /api/health")
}

