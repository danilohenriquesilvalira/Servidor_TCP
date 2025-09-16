package auth

import "projeto-hmi/internal/models"

type RBACService struct{}

func NewRBACService() *RBACService {
	return &RBACService{}
}

func (r *RBACService) GetUserPermissions(cargo string) models.UserPermissions {
	switch cargo {
	case models.CargoAdmin:
		return models.UserPermissions{
			CanViewUsers:   true,
			CanCreateUsers: true,
			CanUpdateUsers: true,
			CanDeleteUsers: true,
			CanBlockUsers:  true,
			CanManageAdmin: false,
		}
	case models.CargoGerente:
		return models.UserPermissions{
			CanViewUsers:   true,
			CanCreateUsers: true,
			CanUpdateUsers: true,
			CanDeleteUsers: true,
			CanBlockUsers:  true,
			CanManageAdmin: false,
		}
	case models.CargoSupervisor:
		return models.UserPermissions{
			CanViewUsers:   true,
			CanCreateUsers: true,
			CanUpdateUsers: true,
			CanDeleteUsers: true,
			CanBlockUsers:  true,
			CanManageAdmin: false,
		}
	case models.CargoTecnico:
		return models.UserPermissions{
			CanViewUsers:   true,
			CanCreateUsers: true,
			CanUpdateUsers: true,
			CanDeleteUsers: false,
			CanBlockUsers:  true,
			CanManageAdmin: false,
		}
	case models.CargoOperador:
		return models.UserPermissions{
			CanViewUsers:   true,
			CanCreateUsers: false,
			CanUpdateUsers: false,
			CanDeleteUsers: false,
			CanBlockUsers:  false,
			CanManageAdmin: false,
		}
	default:
		return models.UserPermissions{}
	}
}

func (r *RBACService) CanManageUser(managerCargo, targetCargo string) bool {
	managerLevel := r.getCargoLevel(managerCargo)
	targetLevel := r.getCargoLevel(targetCargo)
	
	if targetCargo == models.CargoAdmin && managerCargo != models.CargoAdmin {
		return false
	}
	
	return managerLevel < targetLevel
}

func (r *RBACService) getCargoLevel(cargo string) int {
	switch cargo {
	case models.CargoAdmin:
		return 0
	case models.CargoGerente:
		return 1
	case models.CargoSupervisor:
		return 2
	case models.CargoTecnico:
		return 3
	case models.CargoOperador:
		return 4
	default:
		return 999
	}
}

func (r *RBACService) GetManageableCargos(managerCargo string) []string {
	switch managerCargo {
	case models.CargoAdmin:
		return []string{models.CargoGerente, models.CargoSupervisor, models.CargoTecnico, models.CargoOperador}
	case models.CargoGerente:
		return []string{models.CargoSupervisor, models.CargoTecnico, models.CargoOperador}
	case models.CargoSupervisor:
		return []string{models.CargoTecnico, models.CargoOperador}
	case models.CargoTecnico:
		return []string{models.CargoOperador}
	default:
		return []string{}
	}
}