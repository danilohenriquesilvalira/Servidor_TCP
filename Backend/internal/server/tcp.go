package server

import (
	"log"
	"net"
	"time"
)

// startTCP inicia o servidor TCP para conexões PLC
func (s *Server) startTCP() {
	listener, err := net.Listen("tcp", s.config.TCPPort)
	if err != nil {
		log.Fatal("❌ ERRO TCP servidor:", err)
	}
	defer listener.Close()

	log.Println("📡 TCP Server aguardando PLC...")

	for {
		conn, err := listener.Accept()
		if err != nil {
			log.Printf("❌ Erro aceitar conexão: %v", err)
			continue
		}

		log.Printf("🎉 PLC conectado: %s", conn.RemoteAddr())
		s.AddPLCConnection(conn)
		go s.handlePLCConnection(conn)
	}
}

// handlePLCConnection gerencia uma conexão individual do PLC
func (s *Server) handlePLCConnection(conn net.Conn) {
	defer func() {
		s.RemovePLCConnection(conn)
		conn.Close()
		log.Printf("🔌 PLC desconectado: %s | PLCs ativos: %d", conn.RemoteAddr(), s.GetPLCCount())
	}()

	buffer := make([]byte, 4096)

	for {
		// Timeout de 30 segundos para leitura
		conn.SetReadDeadline(time.Now().Add(30 * time.Second))

		n, err := conn.Read(buffer)
		if err != nil {
			log.Printf("🔌 Erro leitura PLC %s: %v", conn.RemoteAddr(), err)
			break
		}

		// Copia dados para evitar race conditions
		data := make([]byte, n)
		copy(data, buffer[:n])

		log.Printf("📨 Recebido de %s: %d bytes", conn.RemoteAddr(), n)

		// Parse e broadcast dos dados
		plcData := ParsePLCData(data)
		s.BroadcastData(plcData)
	}
}
