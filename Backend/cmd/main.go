package main

import (
	"log"
	"os"
	"path/filepath"

	"projeto-hmi/internal/server"
)

func main() {
	// Determinar diretório do frontend automaticamente
	exe, err := os.Executable()
	if err != nil {
		log.Fatal("Erro obtendo caminho do executável:", err)
	}

	// Vai para o diretório pai do Backend
	projectDir := filepath.Dir(filepath.Dir(exe))
	frontendDir := filepath.Join(projectDir, "frontend")

	// Se não existir, tenta o caminho relativo padrão
	if _, err := os.Stat(frontendDir); os.IsNotExist(err) {
		frontendDir = "../frontend/"
		// Se ainda não existir, usa caminho absoluto fixo
		if _, err := os.Stat(frontendDir); os.IsNotExist(err) {
			frontendDir = "C:/Users/Admin/Desktop/PROJETO_HMI/Teste_HTML/"
		}
	}

	log.Printf("📁 Diretório frontend: %s", frontendDir)

	config := &server.Config{
		TCPPort:   "0.0.0.0:8080",
		HTTPPort:  "0.0.0.0:8081",
		StaticDir: frontendDir,
	}

	srv := server.New(config)

	log.Println("🚀 Iniciando servidor PLC...")
	if err := srv.Start(); err != nil {
		log.Fatal("❌ Erro ao iniciar servidor:", err)
	}
}
