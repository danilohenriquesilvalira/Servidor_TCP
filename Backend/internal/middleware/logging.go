package middleware

import (
	"net/http"
	"projeto-hmi/internal/utils"
	"projeto-hmi/pkg/logger"
	"time"
)

type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func newResponseWriter(w http.ResponseWriter) *responseWriter {
	return &responseWriter{w, http.StatusOK}
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func RequestLogging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		
		rw := newResponseWriter(w)
		
		next.ServeHTTP(rw, r)
		
		duration := time.Since(start)
		
		clientIP := utils.GetClientIP(r)
		userAgent := r.Header.Get("User-Agent")
		
		logger.Info("HTTP Request: %s %s - Status: %d - Duration: %v - IP: %s - User-Agent: %s",
			r.Method, r.RequestURI, rw.statusCode, duration, clientIP, userAgent)
		
		if rw.statusCode >= 400 {
			logger.Warn("HTTP Error Response: %s %s - Status: %d - IP: %s",
				r.Method, r.RequestURI, rw.statusCode, clientIP)
		}
	})
}