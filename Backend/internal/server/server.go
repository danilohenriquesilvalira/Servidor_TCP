package server

import (
	"log"
	"net"
	"net/http"
	"sync"

	"projeto-hmi/internal/plcdata"

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

// Server gerencia as conexões TCP e WebSocket
type Server struct {
	config       *Config
	clients      map[*websocket.Conn]bool
	plcConns     map[net.Conn]bool
	mutex        sync.RWMutex
	plcMutex     sync.RWMutex
	broadcast    chan *plcdata.PLCData
	writeChannel chan WriteRequest
	upgrader     websocket.Upgrader
}

// New cria uma nova instância do servidor
func New(config *Config) *Server {
	return &Server{
		config:       config,
		clients:      make(map[*websocket.Conn]bool),
		plcConns:     make(map[net.Conn]bool),
		broadcast:    make(chan *plcdata.PLCData, 1000),
		writeChannel: make(chan WriteRequest, 100),
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
