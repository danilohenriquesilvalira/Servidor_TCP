package server

import (
	"encoding/json"
	"log"
	"net/http"
)

// startHTTP inicia o servidor HTTP e WebSocket
func (s *Server) startHTTP() error {
	http.HandleFunc("/ws", s.handleWebSocket)
	http.HandleFunc("/api/write", s.handleWriteAPI)
	http.HandleFunc("/api/status", s.handleStatusAPI)

	// Serve arquivos estáticos
	fs := http.FileServer(http.Dir(s.config.StaticDir))
	http.Handle("/", fs)

	log.Println("✅ Servidores rodando!")
	log.Printf("🌐 Acesse: http://localhost%s", s.config.HTTPPort)
	log.Printf("📡 API Write: http://localhost%s/api/write", s.config.HTTPPort)
	log.Printf("📊 API Status: http://localhost%s/api/status", s.config.HTTPPort)

	return http.ListenAndServe(s.config.HTTPPort, nil)
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
