package utils

import (
	"fmt"
	"net/mail"
	"projeto-hmi/internal/models"
	"regexp"
	"strings"
	"unicode/utf8"
)

var (
	nameRegex     = regexp.MustCompile(`^[a-zA-ZÀ-ÿ\s]{2,100}$`)
	passwordRegex = regexp.MustCompile(`^.{6,255}$`)
	idEDPRegex    = regexp.MustCompile(`^[A-Z0-9]{3,20}$`)
)

func ValidateUserCreateRequest(req *models.UserCreateRequest) error {
	if err := ValidateName(req.Nome); err != nil {
		return err
	}
	
	if err := ValidateEmail(req.Email); err != nil {
		return err
	}
	
	if err := ValidatePassword(req.Senha); err != nil {
		return err
	}
	
	if err := ValidateIDUsuarioEDP(req.IDUsuarioEDP); err != nil {
		return err
	}
	
	if err := ValidateEclusa(req.Eclusa); err != nil {
		return err
	}
	
	if err := ValidateCargo(req.Cargo); err != nil {
		return err
	}
	
	if req.URLAvatar != "" && !ValidateURL(req.URLAvatar) {
		return fmt.Errorf("URL do avatar inválida")
	}
	
	return nil
}

func ValidateUserUpdateRequest(req *models.UserUpdateRequest) error {
	if req.Nome != "" {
		if err := ValidateName(req.Nome); err != nil {
			return err
		}
	}
	
	if req.Email != "" {
		if err := ValidateEmail(req.Email); err != nil {
			return err
		}
	}
	
	if req.Eclusa != "" {
		if err := ValidateEclusa(req.Eclusa); err != nil {
			return err
		}
	}
	
	if req.Cargo != "" {
		if err := ValidateCargo(req.Cargo); err != nil {
			return err
		}
	}
	
	if req.URLAvatar != "" && !ValidateURL(req.URLAvatar) {
		return fmt.Errorf("URL do avatar inválida")
	}
	
	return nil
}

func ValidateName(name string) error {
	name = strings.TrimSpace(name)
	if name == "" {
		return fmt.Errorf("nome é obrigatório")
	}
	
	if !utf8.ValidString(name) {
		return fmt.Errorf("nome contém caracteres inválidos")
	}
	
	if len(name) < 2 || len(name) > 100 {
		return fmt.Errorf("nome deve ter entre 2 e 100 caracteres")
	}
	
	if !nameRegex.MatchString(name) {
		return fmt.Errorf("nome contém caracteres não permitidos")
	}
	
	return nil
}

func ValidateEmail(email string) error {
	email = strings.TrimSpace(email)
	if email == "" {
		return fmt.Errorf("email é obrigatório")
	}
	
	if len(email) > 255 {
		return fmt.Errorf("email muito longo")
	}
	
	_, err := mail.ParseAddress(email)
	if err != nil {
		return fmt.Errorf("email inválido")
	}
	
	if !strings.HasSuffix(email, "@edp.com") {
		return fmt.Errorf("email deve ser do domínio @edp.com")
	}
	
	return nil
}

func ValidatePassword(password string) error {
	if password == "" {
		return fmt.Errorf("senha é obrigatória")
	}
	
	if !utf8.ValidString(password) {
		return fmt.Errorf("senha contém caracteres inválidos")
	}
	
	if !passwordRegex.MatchString(password) {
		return fmt.Errorf("senha deve ter entre 6 e 255 caracteres")
	}
	
	return nil
}

func ValidateIDUsuarioEDP(idEDP string) error {
	idEDP = strings.TrimSpace(idEDP)
	if idEDP == "" {
		return fmt.Errorf("ID usuário EDP é obrigatório")
	}
	
	if !idEDPRegex.MatchString(idEDP) {
		return fmt.Errorf("ID usuário EDP deve conter apenas letras maiúsculas e números, entre 3 e 20 caracteres")
	}
	
	return nil
}

func ValidateEclusa(eclusa string) error {
	eclusa = strings.TrimSpace(eclusa)
	if eclusa == "" {
		return fmt.Errorf("eclusa é obrigatória")
	}
	
	for _, valid := range models.ValidEclusas {
		if valid == eclusa {
			return nil
		}
	}
	
	return fmt.Errorf("eclusa inválida. Valores permitidos: %v", models.ValidEclusas)
}

func ValidateCargo(cargo string) error {
	cargo = strings.TrimSpace(cargo)
	if cargo == "" {
		return fmt.Errorf("cargo é obrigatório")
	}
	
	for _, valid := range models.ValidCargos {
		if valid == cargo {
			return nil
		}
	}
	
	return fmt.Errorf("cargo inválido. Valores permitidos: %v", models.ValidCargos)
}

func ValidateURL(url string) bool {
	url = strings.TrimSpace(url)
	if url == "" {
		return true
	}
	
	// Aceitar URLs completas (http/https) ou caminhos relativos de avatar
	return strings.HasPrefix(url, "http://") || 
		   strings.HasPrefix(url, "https://") || 
		   strings.HasPrefix(url, "/Avatar/")
}

func SanitizeString(input string) string {
	input = strings.TrimSpace(input)
	input = strings.ReplaceAll(input, "<", "&lt;")
	input = strings.ReplaceAll(input, ">", "&gt;")
	input = strings.ReplaceAll(input, "\"", "&quot;")
	input = strings.ReplaceAll(input, "'", "&#x27;")
	input = strings.ReplaceAll(input, "&", "&amp;")
	return input
}