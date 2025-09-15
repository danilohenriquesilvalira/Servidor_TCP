package plcdata

// IntDataDefinition representa a definição de um valor inteiro
type IntDataDefinition struct {
	Name        string `json:"name"`
	Equipment   string `json:"equipment"`
	Index       int    `json:"index"`
	Description string `json:"description"`
	Value       int16  `json:"value"`
}

// IntDataStructure organiza os dados inteiros por equipamento
type IntDataStructure struct {
	Enchimento      []IntDataDefinition `json:"enchimento"`       // Ints 0-12
	Esvaziamento    []IntDataDefinition `json:"esvaziamento"`     // Ints 13-25
	PortaJusante    []IntDataDefinition `json:"porta_jusante"`    // Ints 26-46
	PortaMontante   []IntDataDefinition `json:"porta_montante"`   // Ints 47-64
	EsgotoDrenagem  []IntDataDefinition `json:"esgoto_drenagem"`  // Ints 65-71
	SalaComando     []IntDataDefinition `json:"sala_comando"`     // Ints 72-80
}

// GetIntDataDefinitions retorna todas as definições dos dados inteiros organizadas
func GetIntDataDefinitions() *IntDataStructure {
	return &IntDataStructure{
		// ENCHIMENTO - Ints 0-12
		Enchimento: []IntDataDefinition{
			{Name: "MED_AB_CILIND.POS_DIR_INT", Equipment: "Enchimento", Index: 0, Description: "Posição Cilindro Direito"},
			{Name: "MED_AB_CILIND.POS_ESQ_INT", Equipment: "Enchimento", Index: 1, Description: "Posição Cilindro Esquerdo"},
			{Name: "POSICAO_COMP.CONTAG_TEMP_SUB_A", Equipment: "Enchimento", Index: 2, Description: "Contador Tempo Subida A"},
			{Name: "POSICAO_COMP.CONTAG_TEMP_DESC_A", Equipment: "Enchimento", Index: 3, Description: "Contador Tempo Descida A"},
			{Name: "POSICAO_COMP.CONTAG_TEMP_ESTAB_A", Equipment: "Enchimento", Index: 4, Description: "Contador Tempo Estabilização A"},
			{Name: "POSICAO_COMP.CONTAG_TEMP_SUB_B", Equipment: "Enchimento", Index: 5, Description: "Contador Tempo Subida B"},
			{Name: "POSICAO_COMP.CONTAG_TEMP_DESC_B", Equipment: "Enchimento", Index: 6, Description: "Contador Tempo Descida B"},
			{Name: "POSICAO_COMP.CONTAG_TEMP_ESTAB_B", Equipment: "Enchimento", Index: 7, Description: "Contador Tempo Estabilização B"},
			{Name: "ANIM_ANIM_BOMBA_A_ENCH", Equipment: "Enchimento", Index: 8, Description: "Animação Bomba A Enchimento"},
			{Name: "ANIM_ANIM_BOMBA_B_ENCH", Equipment: "Enchimento", Index: 9, Description: "Animação Bomba B Enchimento"},
			{Name: "RESERVA", Equipment: "Enchimento", Index: 10, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Enchimento", Index: 11, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Enchimento", Index: 12, Description: "Reserva"},
		},

		// ESVAZIAMENTO - Ints 13-25
		Esvaziamento: []IntDataDefinition{
			{Name: "MED_AB_CILIND.POS_DIR_INT", Equipment: "Esvaziamento", Index: 13, Description: "Posição Cilindro Direito"},
			{Name: "MED_AB_CILIND.POS_ESQ_INT", Equipment: "Esvaziamento", Index: 14, Description: "Posição Cilindro Esquerdo"},
			{Name: "POSICAO_COMP.CONTAG_TEMP_SUB_A", Equipment: "Esvaziamento", Index: 15, Description: "Contador Tempo Subida A"},
			{Name: "POSICAO_COMP.CONTAG_TEMP_DESC_A", Equipment: "Esvaziamento", Index: 16, Description: "Contador Tempo Descida A"},
			{Name: "POSICAO_COMP.CONTAG_TEMP_ESTAB_A", Equipment: "Esvaziamento", Index: 17, Description: "Contador Tempo Estabilização A"},
			{Name: "POSICAO_COMP.CONTAG_TEMP_SUB_B", Equipment: "Esvaziamento", Index: 18, Description: "Contador Tempo Subida B"},
			{Name: "POSICAO_COMP.CONTAG_TEMP_DESC_B", Equipment: "Esvaziamento", Index: 19, Description: "Contador Tempo Descida B"},
			{Name: "POSICAO_COMP.CONTAG_TEMP_ESTAB_B", Equipment: "Esvaziamento", Index: 20, Description: "Contador Tempo Estabilização B"},
			{Name: "ANIM_ANIM_BOMBA_A_ENCH", Equipment: "Esvaziamento", Index: 21, Description: "Animação Bomba A Esvaziamento"},
			{Name: "ANIM_ANIM_BOMBA_B_ENCH", Equipment: "Esvaziamento", Index: 22, Description: "Animação Bomba B Esvaziamento"},
			{Name: "RESERVA", Equipment: "Esvaziamento", Index: 23, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esvaziamento", Index: 24, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esvaziamento", Index: 25, Description: "Reserva"},
		},

		// PORTA JUSANTE - Ints 26-46
		PortaJusante: []IntDataDefinition{
			{Name: "MOT.VELOC_MOT_MEST_DIR", Equipment: "Porta_Jusante", Index: 26, Description: "Velocidade Motor Mestre Direito"},
			{Name: "MOT.VELOC_MOT_ESCRAV_ESQ", Equipment: "Porta_Jusante", Index: 27, Description: "Velocidade Motor Escravo Esquerdo"},
			{Name: "ANIM_JUSANT_MOT_DIR", Equipment: "Porta_Jusante", Index: 28, Description: "Animação Motor Direito"},
			{Name: "ANIM_JUSANT_MOT_ESQ", Equipment: "Porta_Jusante", Index: 29, Description: "Animação Motor Esquerdo"},
			{Name: "ANIM_LASER", Equipment: "Porta_Jusante", Index: 30, Description: "Animação Laser"},
			{Name: "ANIM_LASER_FEIXE_1", Equipment: "Porta_Jusante", Index: 31, Description: "Animação Laser Feixe 1"},
			{Name: "ANIM_LASER_FEIXE_2", Equipment: "Porta_Jusante", Index: 32, Description: "Animação Laser Feixe 2"},
			{Name: "ANIM_LASER_FEIXE_3", Equipment: "Porta_Jusante", Index: 33, Description: "Animação Laser Feixe 3"},
			{Name: "VAR.VELOC_1_SUB", Equipment: "Porta_Jusante", Index: 34, Description: "Velocidade 1 Subida"},
			{Name: "VAR.VELOC_2_SUB", Equipment: "Porta_Jusante", Index: 35, Description: "Velocidade 2 Subida"},
			{Name: "VAR.VELOC_3_SUBIDA", Equipment: "Porta_Jusante", Index: 36, Description: "Velocidade 3 Subida"},
			{Name: "VAR.VELOC_1_DESC", Equipment: "Porta_Jusante", Index: 37, Description: "Velocidade 1 Descida"},
			{Name: "VAR.VELOC_2_DESC", Equipment: "Porta_Jusante", Index: 38, Description: "Velocidade 2 Descida"},
			{Name: "MOVIMENTO_PORTA_JUSANTE", Equipment: "Porta_Jusante", Index: 39, Description: "Movimento Porta Jusante"},
			{Name: "MOVIMENTO_CONTRA_PESO_DIREITO", Equipment: "Porta_Jusante", Index: 40, Description: "Movimento Contra Peso Direito"},
			{Name: "MOVIMENTO_CONTRA_PESO_ESQUERDO", Equipment: "Porta_Jusante", Index: 41, Description: "Movimento Contra Peso Esquerdo"},
			{Name: "MOVIMENTO_PORTA_JUSANTE_CALDEIRA", Equipment: "Porta_Jusante", Index: 42, Description: "Movimento Porta Jusante Caldeira"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", Index: 43, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", Index: 44, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", Index: 45, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", Index: 46, Description: "Reserva"},
		},

		// PORTA MONTANTE - Ints 47-64
		PortaMontante: []IntDataDefinition{
			{Name: "MOT.VELOC_MOT_MEST_ESQ", Equipment: "Porta_Montante", Index: 47, Description: "Velocidade Motor Mestre Esquerdo"},
			{Name: "MOT.VELOC_MOT_ESCRAV_DIR", Equipment: "Porta_Montante", Index: 48, Description: "Velocidade Motor Escravo Direito"},
			{Name: "VELOC_VAR_VELOC_1_SUB", Equipment: "Porta_Montante", Index: 49, Description: "Velocidade Variável 1 Subida"},
			{Name: "VELOC_VAR_VELOC_1_DESC", Equipment: "Porta_Montante", Index: 50, Description: "Velocidade Variável 1 Descida"},
			{Name: "ANIM_MONT_MOT_DIR", Equipment: "Porta_Montante", Index: 51, Description: "Animação Motor Direito"},
			{Name: "ANIM_MONT_MOT_ESQ", Equipment: "Porta_Montante", Index: 52, Description: "Animação Motor Esquerdo"},
			{Name: "ANIM_LASER", Equipment: "Porta_Montante", Index: 53, Description: "Animação Laser"},
			{Name: "ANIM_LASER_FEIXE_1", Equipment: "Porta_Montante", Index: 54, Description: "Animação Laser Feixe 1"},
			{Name: "ANIM_LASER_FEIXE_2", Equipment: "Porta_Montante", Index: 55, Description: "Animação Laser Feixe 2"},
			{Name: "ANIM_LASER_FEIXE_3", Equipment: "Porta_Montante", Index: 56, Description: "Animação Laser Feixe 3"},
			{Name: "MOVIMENTAR_PORTA_MONTANTE", Equipment: "Porta_Montante", Index: 57, Description: "Movimentar Porta Montante"},
			{Name: "MOVIMENTAR_CONTRA_PESO_DIREITO", Equipment: "Porta_Montante", Index: 58, Description: "Movimentar Contra Peso Direito"},
			{Name: "MOVIMENTAR_CONTRA_PESO_ESQUERDO", Equipment: "Porta_Montante", Index: 59, Description: "Movimentar Contra Peso Esquerdo"},
			{Name: "MOVIMENTAR_PORTA_MONTANTE_CALDEIRA", Equipment: "Porta_Montante", Index: 60, Description: "Movimentar Porta Montante Caldeira"},
			{Name: "RESERVA", Equipment: "Porta_Montante", Index: 61, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", Index: 62, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", Index: 63, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", Index: 64, Description: "Reserva"},
		},

		// ESGOTO E DRENAGEM - Ints 65-71
		EsgotoDrenagem: []IntDataDefinition{
			{Name: "ESGOTO_DRENAGEM\\GESTAO_ESGOTO_DRENAGEM", Equipment: "Esgoto e Drenagem", Index: 65, Description: "Gestão Esgoto Drenagem 1"},
			{Name: "ESGOTO_DRENAGEM\\GESTAO_ESGOTO_DRENAGEM", Equipment: "Esgoto e Drenagem", Index: 66, Description: "Gestão Esgoto Drenagem 2"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", Index: 67, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", Index: 68, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", Index: 69, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", Index: 70, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", Index: 71, Description: "Reserva"},
		},

		// SALA DE COMANDO - Ints 72-80
		SalaComando: []IntDataDefinition{
			{Name: "WINCC_WORD_SIN_INICIO_CICLO_SUB_SEMAF_JUSANT", Equipment: "Sala de Comando", Index: 72, Description: "Sinal Início Ciclo Subida Semáforo Jusante"},
			{Name: "WINCC_WORD_SIN_INICIO_CICLO_DESC_SEMAF_MONT", Equipment: "Sala de Comando", Index: 73, Description: "Sinal Início Ciclo Descida Semáforo Montante"},
			{Name: "RESERVA", Equipment: "Sala de Comando", Index: 74, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", Index: 75, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", Index: 76, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", Index: 77, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", Index: 78, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", Index: 79, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", Index: 80, Description: "Reserva"},
		},
	}
}

// ProcessIntData preenche os valores dos dados inteiros baseado nos dados do PLC
func ProcessIntData(ints []int16) *IntDataStructure {
	intDefs := GetIntDataDefinitions()
	
	// Preencher valores para cada equipamento
	for i := range intDefs.Enchimento {
		if intDefs.Enchimento[i].Index < len(ints) {
			intDefs.Enchimento[i].Value = ints[intDefs.Enchimento[i].Index]
		}
	}
	
	for i := range intDefs.Esvaziamento {
		if intDefs.Esvaziamento[i].Index < len(ints) {
			intDefs.Esvaziamento[i].Value = ints[intDefs.Esvaziamento[i].Index]
		}
	}
	
	for i := range intDefs.PortaJusante {
		if intDefs.PortaJusante[i].Index < len(ints) {
			intDefs.PortaJusante[i].Value = ints[intDefs.PortaJusante[i].Index]
		}
	}
	
	for i := range intDefs.PortaMontante {
		if intDefs.PortaMontante[i].Index < len(ints) {
			intDefs.PortaMontante[i].Value = ints[intDefs.PortaMontante[i].Index]
		}
	}
	
	for i := range intDefs.EsgotoDrenagem {
		if intDefs.EsgotoDrenagem[i].Index < len(ints) {
			intDefs.EsgotoDrenagem[i].Value = ints[intDefs.EsgotoDrenagem[i].Index]
		}
	}
	
	for i := range intDefs.SalaComando {
		if intDefs.SalaComando[i].Index < len(ints) {
			intDefs.SalaComando[i].Value = ints[intDefs.SalaComando[i].Index]
		}
	}
	
	return intDefs
}