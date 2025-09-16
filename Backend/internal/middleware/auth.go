package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"projeto-hmi/internal/auth"
	"projeto-hmi/internal/models"
	"projeto-hmi/internal/repository"
	"strings"
)

type contextKey string

const UserContextKey contextKey = "user"

type AuthMiddleware struct {
	jwtService *auth.JWTService
	userRepo   *repository.UserRepository
}

func NewAuthMiddleware(jwtService *auth.JWTService, userRepo *repository.UserRepository) *AuthMiddleware {
	return &AuthMiddleware{
		jwtService: jwtService,
		userRepo:   userRepo,
	}
}

func (m *AuthMiddleware) RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			m.respondWithError(w, http.StatusUnauthorized, "Token de acesso requerido")
			return
		}

		bearerToken := strings.Split(authHeader, " ")
		if len(bearerToken) != 2 || bearerToken[0] != "Bearer" {
			m.respondWithError(w, http.StatusUnauthorized, "Formato de token inválido")
			return
		}

		claims, err := m.jwtService.ValidateToken(bearerToken[1])
		if err != nil {
			m.respondWithError(w, http.StatusUnauthorized, "Token inválido")
			return
		}

		user, err := m.userRepo.GetByID(claims.UserID)
		if err != nil {
			m.respondWithError(w, http.StatusUnauthorized, "Usuário não encontrado")
			return
		}

		if user == nil || user.Status == models.StatusBloqueado {
			m.respondWithError(w, http.StatusUnauthorized, "Usuário inativo")
			return
		}

		ctx := context.WithValue(r.Context(), UserContextKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

func (m *AuthMiddleware) respondWithError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}

func GetUserFromContext(ctx context.Context) *models.User {
	if user, ok := ctx.Value(UserContextKey).(*models.User); ok {
		return user
	}
	return nil
}