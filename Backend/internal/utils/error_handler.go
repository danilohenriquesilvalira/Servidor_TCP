package utils

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/lib/pq"
)

func HandleDatabaseError(err error) error {
	if err == nil {
		return nil
	}

	if errors.Is(err, sql.ErrNoRows) {
		return fmt.Errorf("registro não encontrado")
	}

	if pqErr, ok := err.(*pq.Error); ok {
		switch pqErr.Code {
		case "23505": // unique_violation
			if strings.Contains(string(pqErr.Detail), "email") {
				return fmt.Errorf("email já está em uso")
			}
			if strings.Contains(string(pqErr.Detail), "id_usuario_edp") {
				return fmt.Errorf("ID usuário EDP já está em uso")
			}
			return fmt.Errorf("valor já existe no sistema")
		case "23503": // foreign_key_violation
			return fmt.Errorf("referência inválida no banco de dados")
		case "23502": // not_null_violation
			return fmt.Errorf("campo obrigatório não foi fornecido")
		case "23514": // check_violation
			return fmt.Errorf("valor não atende às restrições do banco de dados")
		case "42P01": // undefined_table
			return fmt.Errorf("erro interno: tabela não encontrada")
		case "42703": // undefined_column
			return fmt.Errorf("erro interno: coluna não encontrada")
		case "08001": // connection_exception
			return fmt.Errorf("erro de conexão com o banco de dados")
		case "08003": // connection_does_not_exist
			return fmt.Errorf("conexão com o banco de dados perdida")
		case "08006": // connection_failure
			return fmt.Errorf("falha na conexão com o banco de dados")
		case "57P01": // admin_shutdown
			return fmt.Errorf("banco de dados indisponível")
		}
		
		return fmt.Errorf("erro no banco de dados: %s", pqErr.Message)
	}

	if strings.Contains(err.Error(), "connection refused") {
		return fmt.Errorf("não foi possível conectar ao banco de dados")
	}

	if strings.Contains(err.Error(), "timeout") {
		return fmt.Errorf("operação no banco de dados expirou")
	}

	return fmt.Errorf("erro interno do sistema")
}

func IsTemporaryError(err error) bool {
	if pqErr, ok := err.(*pq.Error); ok {
		switch pqErr.Code {
		case "08001", "08003", "08006", "57P01":
			return true
		}
	}

	errStr := err.Error()
	return strings.Contains(errStr, "connection") || 
		   strings.Contains(errStr, "timeout") ||
		   strings.Contains(errStr, "temporary")
}