package utils

import "net/http"

// GetClientIP extrai o IP do cliente da requisição HTTP
// Verifica headers X-Forwarded-For e X-Real-IP antes de usar RemoteAddr
func GetClientIP(r *http.Request) string {
	forwarded := r.Header.Get("X-Forwarded-For")
	if forwarded != "" {
		return forwarded
	}
	
	realIP := r.Header.Get("X-Real-IP")
	if realIP != "" {
		return realIP
	}
	
	return r.RemoteAddr
}