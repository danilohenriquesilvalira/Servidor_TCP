package middleware

import (
	"encoding/json"
	"net/http"
	"projeto-hmi/internal/utils"
	"sync"
	"time"
)

type RateLimiter struct {
	clients map[string]*ClientInfo
	mutex   sync.RWMutex
}

type ClientInfo struct {
	requests   int
	lastReset  time.Time
	blocked    bool
	blockUntil time.Time
}

func NewRateLimiter() *RateLimiter {
	rl := &RateLimiter{
		clients: make(map[string]*ClientInfo),
	}
	
	go rl.cleanup()
	return rl
}

func (rl *RateLimiter) LoginRateLimit(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		clientIP := utils.GetClientIP(r)
		
		rl.mutex.Lock()
		defer rl.mutex.Unlock()
		
		client, exists := rl.clients[clientIP]
		if !exists {
			client = &ClientInfo{
				requests:  0,
				lastReset: time.Now(),
			}
			rl.clients[clientIP] = client
		}
		
		now := time.Now()
		
		if client.blocked && now.Before(client.blockUntil) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "Muitas tentativas de login. Tente novamente em alguns minutos.",
			})
			return
		}
		
		if now.Sub(client.lastReset) >= time.Minute {
			client.requests = 0
			client.lastReset = now
			client.blocked = false
		}
		
		client.requests++
		
		if client.requests >= 5 {
			client.blocked = true
			client.blockUntil = now.Add(15 * time.Minute)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "Limite de tentativas de login excedido. Bloqueado por 15 minutos.",
			})
			return
		}
		
		next.ServeHTTP(w, r)
	}
}

func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()
	
	for {
		select {
		case <-ticker.C:
			rl.mutex.Lock()
			now := time.Now()
			for ip, client := range rl.clients {
				if now.Sub(client.lastReset) > time.Hour {
					delete(rl.clients, ip)
				}
			}
			rl.mutex.Unlock()
		}
	}
}

