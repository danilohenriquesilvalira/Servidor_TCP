package handlers

import (
	"encoding/json"
	"net/http"
	"projeto-hmi/internal/middleware"
	"projeto-hmi/internal/models"
	"projeto-hmi/internal/services"
	"projeto-hmi/internal/utils"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type UserHandler struct {
	userService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondWithError(w, http.StatusBadRequest, "Dados inválidos")
		return
	}

	ipAddress := utils.GetClientIP(r)
	userAgent := r.Header.Get("User-Agent")

	response, err := h.userService.Login(req.Username, req.Senha, ipAddress, userAgent)
	if err != nil {
		h.respondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}

	h.respondWithJSON(w, http.StatusOK, response)
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	currentUser := middleware.GetUserFromContext(r.Context())
	if currentUser == nil {
		h.respondWithError(w, http.StatusUnauthorized, "Usuário não autenticado")
		return
	}

	var req models.UserCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondWithError(w, http.StatusBadRequest, "Dados inválidos")
		return
	}

	if err := utils.ValidateUserCreateRequest(&req); err != nil {
		h.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	ipAddress := utils.GetClientIP(r)
	response, err := h.userService.CreateUser(&req, currentUser, ipAddress)
	if err != nil {
		h.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.respondWithJSON(w, http.StatusCreated, response)
}

func (h *UserHandler) GetUsers(w http.ResponseWriter, r *http.Request) {
	currentUser := middleware.GetUserFromContext(r.Context())
	if currentUser == nil {
		h.respondWithError(w, http.StatusUnauthorized, "Usuário não autenticado")
		return
	}

	users, err := h.userService.GetUsers(currentUser)
	if err != nil {
		h.respondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	h.respondWithJSON(w, http.StatusOK, users)
}

func (h *UserHandler) GetUserByID(w http.ResponseWriter, r *http.Request) {
	currentUser := middleware.GetUserFromContext(r.Context())
	if currentUser == nil {
		h.respondWithError(w, http.StatusUnauthorized, "Usuário não autenticado")
		return
	}

	vars := mux.Vars(r)
	userID, err := uuid.Parse(vars["id"])
	if err != nil {
		h.respondWithError(w, http.StatusBadRequest, "ID de usuário inválido")
		return
	}

	user, err := h.userService.GetUserByID(userID, currentUser)
	if err != nil {
		h.respondWithError(w, http.StatusNotFound, err.Error())
		return
	}

	h.respondWithJSON(w, http.StatusOK, user)
}

func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	currentUser := middleware.GetUserFromContext(r.Context())
	if currentUser == nil {
		h.respondWithError(w, http.StatusUnauthorized, "Usuário não autenticado")
		return
	}

	vars := mux.Vars(r)
	userID, err := uuid.Parse(vars["id"])
	if err != nil {
		h.respondWithError(w, http.StatusBadRequest, "ID de usuário inválido")
		return
	}

	var req models.UserUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondWithError(w, http.StatusBadRequest, "Dados inválidos")
		return
	}

	if err := utils.ValidateUserUpdateRequest(&req); err != nil {
		h.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	ipAddress := utils.GetClientIP(r)
	response, err := h.userService.UpdateUser(userID, &req, currentUser, ipAddress)
	if err != nil {
		h.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.respondWithJSON(w, http.StatusOK, response)
}

func (h *UserHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	currentUser := middleware.GetUserFromContext(r.Context())
	if currentUser == nil {
		h.respondWithError(w, http.StatusUnauthorized, "Usuário não autenticado")
		return
	}

	vars := mux.Vars(r)
	userID, err := uuid.Parse(vars["id"])
	if err != nil {
		h.respondWithError(w, http.StatusBadRequest, "ID de usuário inválido")
		return
	}

	var req models.ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondWithError(w, http.StatusBadRequest, "Dados inválidos")
		return
	}

	ipAddress := utils.GetClientIP(r)
	if err := h.userService.ChangePassword(userID, &req, currentUser, ipAddress); err != nil {
		h.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.respondWithJSON(w, http.StatusOK, map[string]string{"message": "Senha alterada com sucesso"})
}

func (h *UserHandler) BlockUser(w http.ResponseWriter, r *http.Request) {
	currentUser := middleware.GetUserFromContext(r.Context())
	if currentUser == nil {
		h.respondWithError(w, http.StatusUnauthorized, "Usuário não autenticado")
		return
	}

	vars := mux.Vars(r)
	userID, err := uuid.Parse(vars["id"])
	if err != nil {
		h.respondWithError(w, http.StatusBadRequest, "ID de usuário inválido")
		return
	}

	ipAddress := utils.GetClientIP(r)
	if err := h.userService.BlockUser(userID, currentUser, ipAddress); err != nil {
		h.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.respondWithJSON(w, http.StatusOK, map[string]string{"message": "Usuário bloqueado com sucesso"})
}

func (h *UserHandler) UnblockUser(w http.ResponseWriter, r *http.Request) {
	currentUser := middleware.GetUserFromContext(r.Context())
	if currentUser == nil {
		h.respondWithError(w, http.StatusUnauthorized, "Usuário não autenticado")
		return
	}

	vars := mux.Vars(r)
	userID, err := uuid.Parse(vars["id"])
	if err != nil {
		h.respondWithError(w, http.StatusBadRequest, "ID de usuário inválido")
		return
	}

	ipAddress := utils.GetClientIP(r)
	if err := h.userService.UnblockUser(userID, currentUser, ipAddress); err != nil {
		h.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.respondWithJSON(w, http.StatusOK, map[string]string{"message": "Usuário desbloqueado com sucesso"})
}

func (h *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	currentUser := middleware.GetUserFromContext(r.Context())
	if currentUser == nil {
		h.respondWithError(w, http.StatusUnauthorized, "Usuário não autenticado")
		return
	}

	vars := mux.Vars(r)
	userID, err := uuid.Parse(vars["id"])
	if err != nil {
		h.respondWithError(w, http.StatusBadRequest, "ID de usuário inválido")
		return
	}

	ipAddress := utils.GetClientIP(r)
	if err := h.userService.DeleteUser(userID, currentUser, ipAddress); err != nil {
		h.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.respondWithJSON(w, http.StatusOK, map[string]string{"message": "Usuário deletado com sucesso"})
}

func (h *UserHandler) GetUserPermissions(w http.ResponseWriter, r *http.Request) {
	currentUser := middleware.GetUserFromContext(r.Context())
	if currentUser == nil {
		h.respondWithError(w, http.StatusUnauthorized, "Usuário não autenticado")
		return
	}

	permissions := h.userService.GetUserPermissions(currentUser.Cargo)
	h.respondWithJSON(w, http.StatusOK, permissions)
}

func (h *UserHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	currentUser := middleware.GetUserFromContext(r.Context())
	if currentUser == nil {
		h.respondWithError(w, http.StatusUnauthorized, "Usuário não autenticado")
		return
	}

	response := models.UserResponse{
		ID:           currentUser.ID,
		Nome:         currentUser.Nome,
		Email:        currentUser.Email,
		IDUsuarioEDP: currentUser.IDUsuarioEDP,
		Eclusa:       currentUser.Eclusa,
		URLAvatar:    currentUser.URLAvatar,
		Cargo:        currentUser.Cargo,
		Status:       currentUser.Status,
		CriadoEm:     currentUser.CriadoEm,
		AtualizadoEm: currentUser.AtualizadoEm,
	}

	h.respondWithJSON(w, http.StatusOK, response)
}

func (h *UserHandler) respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}

func (h *UserHandler) respondWithError(w http.ResponseWriter, code int, message string) {
	h.respondWithJSON(w, code, map[string]string{"error": message})
}

