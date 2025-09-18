package server

import (
	"encoding/json"
	"log"
	"net"
	"net/http"
	"sync"
	"sync/atomic"
	"time"

	"projeto-hmi/internal/handlers"
	"projeto-hmi/internal/middleware"
	"projeto-hmi/internal/plcdata"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
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

// WSClient representa um cliente WebSocket com rate limiting e controle de qualidade
type WSClient struct {
	conn          *websocket.Conn
	send          chan []byte
	lastSent      time.Time
	messageCount  int64
	rateLimit     time.Duration
	isHealthy     bool
	slowResponses int
	maxSlowCount  int
	writeTimeout  time.Duration
	readTimeout   time.Duration
	pingInterval  time.Duration
	lastPong      time.Time
	closed        bool
	closeMutex    sync.Mutex
}

// NewWSClient cria um novo cliente WebSocket com configurações de segurança
func NewWSClient(conn *websocket.Conn) *WSClient {
	return &WSClient{
		conn:         conn,
		send:         make(chan []byte, 1000), // Buffer maior para evitar bloqueios
		rateLimit:    100 * time.Millisecond,  // Máximo 10 msgs/segundo por cliente
		isHealthy:    true,
		maxSlowCount: 5, // Máximo 5 respostas lentas antes de desconectar
		writeTimeout: 10 * time.Second,
		readTimeout:  60 * time.Second,
		pingInterval: 30 * time.Second,
		lastPong:     time.Now(),
		closed:       false,
	}
}

// Server gerencia as conexões TCP e WebSocket
type Server struct {
	config       *Config
	clients      map[*WSClient]bool
	plcConns     map[net.Conn]bool
	mutex        sync.RWMutex
	plcMutex     sync.RWMutex
	broadcast    chan *plcdata.PLCData
	writeChannel chan WriteRequest
	upgrader     websocket.Upgrader

	// Controle de broadcast avançado
	lastBroadcast  time.Time
	debounceTimer  *time.Timer
	debounceDelay  time.Duration
	broadcastStats struct {
		sent    int64
		dropped int64
		errors  int64
	}

	// Campos para autenticação de usuários
	userHandler    *handlers.UserHandler
	authMiddleware *middleware.AuthMiddleware
	rateLimiter    *middleware.RateLimiter
	router         *mux.Router
}

// New cria uma nova instância do servidor
func New(config *Config) *Server {
	return &Server{
		config:        config,
		clients:       make(map[*WSClient]bool),
		plcConns:      make(map[net.Conn]bool),
		broadcast:     make(chan *plcdata.PLCData, 5000), // Buffer muito maior
		writeChannel:  make(chan WriteRequest, 500),      // Buffer maior para escritas
		router:        mux.NewRouter(),
		debounceDelay: 50 * time.Millisecond, // Debounce de 50ms
		upgrader: websocket.Upgrader{
			CheckOrigin:     func(r *http.Request) bool { return true },
			ReadBufferSize:  4096,
			WriteBufferSize: 4096,
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

// BroadcastData envia dados para todos os clientes WebSocket com debounce e controle de qualidade
func (s *Server) BroadcastData(data *plcdata.PLCData) {
	now := time.Now()

	// Rate limiting global: evita spam de broadcasts
	if now.Sub(s.lastBroadcast) < 10*time.Millisecond {
		atomic.AddInt64(&s.broadcastStats.dropped, 1)
		return
	}

	select {
	case s.broadcast <- data:
		s.lastBroadcast = now
		atomic.AddInt64(&s.broadcastStats.sent, 1)
	default:
		atomic.AddInt64(&s.broadcastStats.dropped, 1)
		log.Printf("⚠️ Canal broadcast cheio (%d enviadas, %d descartadas)",
			atomic.LoadInt64(&s.broadcastStats.sent),
			atomic.LoadInt64(&s.broadcastStats.dropped))
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
func (s *Server) AddClient(conn *websocket.Conn) *WSClient {
	client := NewWSClient(conn)
	s.mutex.Lock()
	defer s.mutex.Unlock()
	s.clients[client] = true

	// Iniciar goroutines para o cliente
	go s.handleClientWrites(client)
	go s.handleClientHealth(client)

	return client
}

// RemoveClient remove um cliente WebSocket
func (s *Server) RemoveClient(client *WSClient) {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	delete(s.clients, client)

	// Evitar fechar canal duas vezes
	client.closeMutex.Lock()
	defer client.closeMutex.Unlock()
	if !client.closed {
		close(client.send)
		client.closed = true
	}
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

// handleBroadcast processa o broadcast de dados para clientes WebSocket com timeout
func (s *Server) handleBroadcast() {
	for data := range s.broadcast {
		// Extrai bits das words usando BitExtractor
		bitExtractor := plcdata.ExtractBitsFromWords(data.Words)
		// Payload organizado: primeiro bits das words, depois ints, reals, strings
		payload := map[string]interface{}{
			"status_bits": bitExtractor.StatusBits, // Words 0-16 (Status/Animações)
			"alarm_bits":  bitExtractor.AlarmBits,  // Words 17-47 (Alarmes)
			"event_bits":  bitExtractor.EventBits,  // Words 48-64 (Eventos)
			"ints":        data.Ints,               // Inteiros
			"reals":       data.Reals,              // Reais
			"strings":     data.Strings,            // Strings
		}
		dataBytes, err := json.Marshal(payload)
		if err != nil {
			log.Printf("❌ Erro serializando dados: %v", err)
			continue
		}

		s.mutex.RLock()
		var clientsToRemove []*WSClient

		for client := range s.clients {
			if !client.isHealthy {
				clientsToRemove = append(clientsToRemove, client)
				continue
			}

			// Rate limiting por cliente
			if time.Since(client.lastSent) < client.rateLimit {
				continue
			}

			// Envio com timeout para evitar clientes lentos
			select {
			case client.send <- dataBytes:
				client.lastSent = time.Now()
				atomic.AddInt64(&client.messageCount, 1)
			default:
				// Cliente lento, incrementar contador
				client.slowResponses++
				if client.slowResponses >= client.maxSlowCount {
					log.Printf("⚠️ Cliente lento removido após %d tentativas", client.maxSlowCount)
					clientsToRemove = append(clientsToRemove, client)
				}
			}
		}
		s.mutex.RUnlock()

		// Remover clientes problemáticos
		for _, client := range clientsToRemove {
			s.RemoveClient(client)
			client.conn.Close()
		}
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

// handleClientWrites gerencia envio de mensagens para um cliente específico
func (s *Server) handleClientWrites(client *WSClient) {
	defer func() {
		client.conn.Close()
		s.RemoveClient(client)
	}()

	for {
		// Verificar se cliente já foi fechado
		client.closeMutex.Lock()
		if client.closed {
			client.closeMutex.Unlock()
			return
		}
		client.closeMutex.Unlock()

		select {
		case message, ok := <-client.send:
			if !ok {
				return
			}

			client.conn.SetWriteDeadline(time.Now().Add(client.writeTimeout))
			if err := client.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Printf("❌ Erro enviando para cliente: %v", err)
				return
			}

		case <-time.After(client.pingInterval):
			client.conn.SetWriteDeadline(time.Now().Add(client.writeTimeout))
			if err := client.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				log.Printf("❌ Erro enviando ping: %v", err)
				return
			}
		}
	}
}

// handleClientHealth monitora a saúde do cliente
func (s *Server) handleClientHealth(client *WSClient) {
	client.conn.SetReadDeadline(time.Now().Add(client.readTimeout))
	client.conn.SetPongHandler(func(string) error {
		client.lastPong = time.Now()
		client.conn.SetReadDeadline(time.Now().Add(client.readTimeout))
		return nil
	})

	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			// Verificar se cliente está responsivo
			if time.Since(client.lastPong) > 90*time.Second {
				log.Printf("⚠️ Cliente não responsivo há %v", time.Since(client.lastPong))
				client.isHealthy = false
				return
			}
		}
	}
}

// GetBroadcastStats retorna estatísticas do broadcast
func (s *Server) GetBroadcastStats() (sent, dropped, errors int64) {
	return atomic.LoadInt64(&s.broadcastStats.sent),
		atomic.LoadInt64(&s.broadcastStats.dropped),
		atomic.LoadInt64(&s.broadcastStats.errors)
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
