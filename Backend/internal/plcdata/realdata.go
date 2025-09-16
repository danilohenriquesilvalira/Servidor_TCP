package plcdata

// RealDataDefinition representa a definição de um valor real
type RealDataDefinition struct {
	Name        string  `json:"name"`
	Equipment   string  `json:"equipment"`
	Index       int     `json:"index"`
	Description string  `json:"description"`
	Value       float32 `json:"value"`
}

// RealDataStructure organiza os dados reais por equipamento
type RealDataStructure struct {
	Enchimento      []RealDataDefinition `json:"enchimento"`       // Reals 0-22
	Esvaziamento    []RealDataDefinition `json:"esvaziamento"`     // Reals 23-45
	PortaJusante    []RealDataDefinition `json:"porta_jusante"`    // Reals 46-77
	PortaMontante   []RealDataDefinition `json:"porta_montante"`   // Reals 78-103
	EsgotoDrenagem  []RealDataDefinition `json:"esgoto_drenagem"`  // Reals 104-105
	SalaComando     []RealDataDefinition `json:"sala_comando"`     // Reals 106-122
	UsoGeral        []RealDataDefinition `json:"uso_geral"`        // Reals 123-130
}

// GetRealDataDefinitions retorna todas as definições dos dados reais organizadas
func GetRealDataDefinitions() *RealDataStructure {
	return &RealDataStructure{
		// ENCHIMENTO - Reals 0-22
		Enchimento: []RealDataDefinition{
			{Name: "MED_AB_CILIND.MED_CILIND_DIR", Equipment: "Enchimento", Index: 0, Description: "Medida Cilindro Direito"},
			{Name: "MED_AB_CILIND.PORC_CILIND_DIR", Equipment: "Enchimento", Index: 1, Description: "Porcentagem Cilindro Direito"},
			{Name: "MED_AB_CILIND.MED_CILIND_ESQ", Equipment: "Enchimento", Index: 2, Description: "Medida Cilindro Esquerdo"},
			{Name: "MED_AB_CILIND.PORC_CILIND_ESQ", Equipment: "Enchimento", Index: 3, Description: "Porcentagem Cilindro Esquerdo"},
			{Name: "POSICAO_COMP.VELOC_C_A", Equipment: "Enchimento", Index: 4, Description: "Velocidade Comporta A"},
			{Name: "POSICAO_COMP.VELOC_C_B", Equipment: "Enchimento", Index: 5, Description: "Velocidade Comporta B"},
			{Name: "ENERGIA.VOLTAG_L1_L2", Equipment: "Enchimento", Index: 6, Description: "Voltagem L1-L2"},
			{Name: "ENERGIA.VOLTAG_L2_L3", Equipment: "Enchimento", Index: 7, Description: "Voltagem L2-L3"},
			{Name: "ENERGIA.VOLTAG_L1_L3", Equipment: "Enchimento", Index: 8, Description: "Voltagem L1-L3"},
			{Name: "ENERGIA.CURRENT_L1", Equipment: "Enchimento", Index: 9, Description: "Corrente L1"},
			{Name: "ENERGIA.CURRENT_L2", Equipment: "Enchimento", Index: 10, Description: "Corrente L2"},
			{Name: "ENERGIA.CURRENT_L3", Equipment: "Enchimento", Index: 11, Description: "Corrente L3"},
			{Name: "ENERGIA.POTENC_L1", Equipment: "Enchimento", Index: 12, Description: "Potência L1"},
			{Name: "ENERGIA.POTENC_L2", Equipment: "Enchimento", Index: 13, Description: "Potência L2"},
			{Name: "ENERGIA.POTENC_L3", Equipment: "Enchimento", Index: 14, Description: "Potência L3"},
			{Name: "ENERGIA.FREQ", Equipment: "Enchimento", Index: 15, Description: "Frequência"},
			{Name: "ENERGIA.FACT_POT", Equipment: "Enchimento", Index: 16, Description: "Fator de Potência"},
			{Name: "ENERGIA.POTENC_TOTAL", Equipment: "Enchimento", Index: 17, Description: "Potência Total"},
			{Name: "ANIM.WINCC_HS_BOMBA_A_REAL", Equipment: "Enchimento", Index: 18, Description: "Animação Bomba A"},
			{Name: "ANIM.WINCC_HS_BOMBA_B_REAL", Equipment: "Enchimento", Index: 19, Description: "Animação Bomba B"},
			{Name: "RESERVA", Equipment: "Enchimento", Index: 20, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Enchimento", Index: 21, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Enchimento", Index: 22, Description: "Reserva"},
		},

		// ESVAZIAMENTO - Reals 23-45
		Esvaziamento: []RealDataDefinition{
			{Name: "MED_AB_CILIND.MED_CILIND_DIR", Equipment: "Esvaziamento", Index: 23, Description: "Medida Cilindro Direito"},
			{Name: "MED_AB_CILIND.PORC_CILIND_DIR", Equipment: "Esvaziamento", Index: 24, Description: "Porcentagem Cilindro Direito"},
			{Name: "MED_AB_CILIND.MED_CILIND_ESQ", Equipment: "Esvaziamento", Index: 25, Description: "Medida Cilindro Esquerdo"},
			{Name: "MED_AB_CILIND.PORC_CILIND_ESQ", Equipment: "Esvaziamento", Index: 26, Description: "Porcentagem Cilindro Esquerdo"},
			{Name: "POSICAO_COMP.VELOC_C_A", Equipment: "Esvaziamento", Index: 27, Description: "Velocidade Comporta A"},
			{Name: "POSICAO_COMP.VELOC_C_B", Equipment: "Esvaziamento", Index: 28, Description: "Velocidade Comporta B"},
			{Name: "ENERGIA.VOLTAG_L1_L2", Equipment: "Esvaziamento", Index: 29, Description: "Voltagem L1-L2"},
			{Name: "ENERGIA.VOLTAG_L2_L3", Equipment: "Esvaziamento", Index: 30, Description: "Voltagem L2-L3"},
			{Name: "ENERGIA.VOLTAG_L1_L3", Equipment: "Esvaziamento", Index: 31, Description: "Voltagem L1-L3"},
			{Name: "ENERGIA.CURRENT_L1", Equipment: "Esvaziamento", Index: 32, Description: "Corrente L1"},
			{Name: "ENERGIA.CURRENT_L2", Equipment: "Esvaziamento", Index: 33, Description: "Corrente L2"},
			{Name: "ENERGIA.CURRENT_L3", Equipment: "Esvaziamento", Index: 34, Description: "Corrente L3"},
			{Name: "ENERGIA.POTENC_L1", Equipment: "Esvaziamento", Index: 35, Description: "Potência L1"},
			{Name: "ENERGIA.POTENC_L2", Equipment: "Esvaziamento", Index: 36, Description: "Potência L2"},
			{Name: "ENERGIA.POTENC_L3", Equipment: "Esvaziamento", Index: 37, Description: "Potência L3"},
			{Name: "ENERGIA.FREQ", Equipment: "Esvaziamento", Index: 38, Description: "Frequência"},
			{Name: "ENERGIA.FACT_POT", Equipment: "Esvaziamento", Index: 39, Description: "Fator de Potência"},
			{Name: "ENERGIA.POTENC_TOTAL", Equipment: "Esvaziamento", Index: 40, Description: "Potência Total"},
			{Name: "ANIM.WINCC_HS_BOMBA_A_REAL", Equipment: "Esvaziamento", Index: 41, Description: "Animação Bomba A"},
			{Name: "ANIM.WINCC_HS_BOMBA_B_REAL", Equipment: "Esvaziamento", Index: 42, Description: "Animação Bomba B"},
			{Name: "RESERVA", Equipment: "Esvaziamento", Index: 43, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esvaziamento", Index: 44, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esvaziamento", Index: 45, Description: "Reserva"},
		},

		// PORTA JUSANTE - Reals 46-77
		PortaJusante: []RealDataDefinition{
			{Name: "ENERGIA.VOLTAG_L1_L2", Equipment: "Porta_Jusante", Index: 46, Description: "Voltagem L1-L2"},
			{Name: "ENERGIA.VOLTAG_L2_L3", Equipment: "Porta_Jusante", Index: 47, Description: "Voltagem L2-L3"},
			{Name: "ENERGIA.VOLTAG_L1_L3", Equipment: "Porta_Jusante", Index: 48, Description: "Voltagem L1-L3"},
			{Name: "ENERGIA.CURRENT_L1", Equipment: "Porta_Jusante", Index: 49, Description: "Corrente L1"},
			{Name: "ENERGIA.CURRENT_L2", Equipment: "Porta_Jusante", Index: 50, Description: "Corrente L2"},
			{Name: "ENERGIA.CURRENT_L3", Equipment: "Porta_Jusante", Index: 51, Description: "Corrente L3"},
			{Name: "ENERGIA.POTENC_L1", Equipment: "Porta_Jusante", Index: 52, Description: "Potência L1"},
			{Name: "ENERGIA.POTENC_L2", Equipment: "Porta_Jusante", Index: 53, Description: "Potência L2"},
			{Name: "ENERGIA.POTENC_L3", Equipment: "Porta_Jusante", Index: 54, Description: "Potência L3"},
			{Name: "ENERGIA.FREQ", Equipment: "Porta_Jusante", Index: 55, Description: "Frequência"},
			{Name: "ENERGIA.FACT_POT", Equipment: "Porta_Jusante", Index: 56, Description: "Fator de Potência"},
			{Name: "ENERGIA.POTENC_TOTAL", Equipment: "Porta_Jusante", Index: 57, Description: "Potência Total"},
			{Name: "SP_FC_DESC_DB1_52", Equipment: "Porta_Jusante", Index: 58, Description: "Setpoint Frequência Descida"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", Index: 59, Description: "Reserva"},
			{Name: "POSICAO.DIFF_DIR_ESQ", Equipment: "Porta_Jusante", Index: 60, Description: "Diferença Posição Direita-Esquerda"},
			{Name: "POSICAO.DIFF_ESQ_DIR", Equipment: "Porta_Jusante", Index: 61, Description: "Diferença Posição Esquerda-Direita"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", Index: 62, Description: "Reserva"},
			{Name: "GEST_MOT.INT_MOT_DIR_REAL", Equipment: "Porta_Jusante", Index: 63, Description: "Intensidade Motor Direito"},
			{Name: "GEST_MOT.INT_MOT_ESQ_REAL", Equipment: "Porta_Jusante", Index: 64, Description: "Intensidade Motor Esquerdo"},
			{Name: "PORTA_JUSANT_POS_DIR_REAL", Equipment: "Porta_Jusante", Index: 65, Description: "Posição Porta Jusante Direita"},
			{Name: "PORTA_JUSANT_POS_ESQ_REAL", Equipment: "Porta_Jusante", Index: 66, Description: "Posição Porta Jusante Esquerda"},
			{Name: "HORAS_FUNC_PORT_JUSANT_REAL", Equipment: "Porta_Jusante", Index: 67, Description: "Horas Funcionamento Porta Jusante"},
			{Name: "MED_PAT1_DESC_DB5_26", Equipment: "Porta_Jusante", Index: 68, Description: "Medida Patamar 1 Descida"},
			{Name: "MED_PAT2_SUBIDA_DB5_6", Equipment: "Porta_Jusante", Index: 69, Description: "Medida Patamar 2 Subida"},
			{Name: "MED_PAT1_SUBIDA_DB5_0", Equipment: "Porta_Jusante", Index: 70, Description: "Medida Patamar 1 Subida"},
			{Name: "INT_MOT_ESCRAV_ESQ_DB3_18", Equipment: "Porta_Jusante", Index: 71, Description: "Intensidade Motor Escravo Esquerdo"},
			{Name: "PLC_USANT_VELOCIDADE_ESQ_DB1_42", Equipment: "Porta_Jusante", Index: 72, Description: "Velocidade Esquerda PLC"},
			{Name: "INT_MOT_MEST_DIR_DB3_0", Equipment: "Porta_Jusante", Index: 73, Description: "Intensidade Motor Mestre Direito"},
			{Name: "VELOCIDADE_DIR_DB1_40", Equipment: "Porta_Jusante", Index: 74, Description: "Velocidade Direita"},
			{Name: "COTA_JUS+OFFSET", Equipment: "Porta_Jusante", Index: 75, Description: "Cota Jusante + Offset"},
			{Name: "OFFSET_MTS", Equipment: "Porta_Jusante", Index: 76, Description: "Offset em Metros"},
			{Name: "SP_FC_SUBIDA_DB1_48", Equipment: "Porta_Jusante", Index: 77, Description: "Setpoint Frequência Subida"},
		},

		// PORTA MONTANTE - Reals 78-103
		PortaMontante: []RealDataDefinition{
			{Name: "ENERGIA.VOLTAG_L1_L2", Equipment: "Porta_Montante", Index: 78, Description: "Voltagem L1-L2"},
			{Name: "ENERGIA.VOLTAG_L2_L3", Equipment: "Porta_Montante", Index: 79, Description: "Voltagem L2-L3"},
			{Name: "ENERGIA.VOLTAG_L1_L3", Equipment: "Porta_Montante", Index: 80, Description: "Voltagem L1-L3"},
			{Name: "ENERGIA.CURRENT_L1", Equipment: "Porta_Montante", Index: 81, Description: "Corrente L1"},
			{Name: "ENERGIA.CURRENT_L2", Equipment: "Porta_Montante", Index: 82, Description: "Corrente L2"},
			{Name: "ENERGIA.CURRENT_L3", Equipment: "Porta_Montante", Index: 83, Description: "Corrente L3"},
			{Name: "ENERGIA.POTENC_L1", Equipment: "Porta_Montante", Index: 84, Description: "Potência L1"},
			{Name: "ENERGIA.POTENC_L2", Equipment: "Porta_Montante", Index: 85, Description: "Potência L2"},
			{Name: "ENERGIA.POTENC_L3", Equipment: "Porta_Montante", Index: 86, Description: "Potência L3"},
			{Name: "ENERGIA.FREQ", Equipment: "Porta_Montante", Index: 87, Description: "Frequência"},
			{Name: "ENERGIA.FACT_POT", Equipment: "Porta_Montante", Index: 88, Description: "Fator de Potência"},
			{Name: "ENERGIA.POTENC_TOTAL", Equipment: "Porta_Montante", Index: 89, Description: "Potência Total"},
			{Name: "ANIM.HORAS_FUNC", Equipment: "Porta_Montante", Index: 90, Description: "Horas Funcionamento"},
			{Name: "POSICAO.DIFF_DIR_ESQ", Equipment: "Porta_Montante", Index: 91, Description: "Diferença Posição Direita-Esquerda"},
			{Name: "POSICAO.DIFF_ESQ_DIR", Equipment: "Porta_Montante", Index: 92, Description: "Diferença Posição Esquerda-Direita"},
			{Name: "PORTA_MONT_POS_DIR_REAL", Equipment: "Porta_Montante", Index: 93, Description: "Posição Porta Montante Direita"},
			{Name: "PORTA_MONT_POS_ESQ_REAL", Equipment: "Porta_Montante", Index: 94, Description: "Posição Porta Montante Esquerda"},
			{Name: "INT_MOT_MEST_ESQ_DB3_0", Equipment: "Porta_Montante", Index: 95, Description: "Intensidade Motor Mestre Esquerdo"},
			{Name: "INT_MOT_ESCRAV_DIR_DB3_18", Equipment: "Porta_Montante", Index: 96, Description: "Intensidade Motor Escravo Direito"},
			{Name: "VELOCIDADE_ESQ_DB1_42", Equipment: "Porta_Montante", Index: 97, Description: "Velocidade Esquerda"},
			{Name: "VELOCIDADE_DIR_DB1_40", Equipment: "Porta_Montante", Index: 98, Description: "Velocidade Direita"},
			{Name: "WINCC_HORAS_FUNC_PORT_MONT_REAL", Equipment: "Porta_Montante", Index: 99, Description: "Horas Funcionamento Porta Montante"},
			{Name: "SP_FC_SUBIDA_DB1_48", Equipment: "Porta_Montante", Index: 100, Description: "Setpoint Frequência Subida"},
			{Name: "SP_FC_DESCIDA_DB1_52", Equipment: "Porta_Montante", Index: 101, Description: "Setpoint Frequência Descida"},
			{Name: "RESERVA", Equipment: "Porta_Montante", Index: 102, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", Index: 103, Description: "Reserva"},
		},

		// ESGOTO E DRENAGEM - Reals 104-105
		EsgotoDrenagem: []RealDataDefinition{
			{Name: "ESGOTO E DRANGEM", Equipment: "Esgoto e Drenagem", Index: 104, Description: "Esgoto e Drenagem 1"},
			{Name: "ESGOTO E DRANGEM", Equipment: "Esgoto e Drenagem", Index: 105, Description: "Esgoto e Drenagem 2"},
		},

		// SALA DE COMANDO - Reals 106-122
		SalaComando: []RealDataDefinition{
			{Name: "NIV.NIV_JUSANTE_COTA", Equipment: "Sala de Comando", Index: 106, Description: "Nível Jusante Cota"},
			{Name: "NIV.NIV_CALD_COTA", Equipment: "Sala de Comando", Index: 107, Description: "Nível Caldeira Cota"},
			{Name: "NIV.NIV_MONT_COTA", Equipment: "Sala de Comando", Index: 108, Description: "Nível Montante Cota"},
			{Name: "NIV.DIFF_MONT_CALD", Equipment: "Sala de Comando", Index: 109, Description: "Diferença Montante-Caldeira"},
			{Name: "NIV.DIFF_CALD_JUS", Equipment: "Sala de Comando", Index: 110, Description: "Diferença Caldeira-Jusante"},
			{Name: "NIV.MIN_MONT_COTA", Equipment: "Sala de Comando", Index: 111, Description: "Nível Mínimo Montante Cota"},
			{Name: "ANIM_NIV_JUSANTE_COTA", Equipment: "Sala de Comando", Index: 112, Description: "Animação Nível Jusante"},
			{Name: "ANIM_NIV_CALD_COTA", Equipment: "Sala de Comando", Index: 113, Description: "Animação Nível Caldeira"},
			{Name: "ANIM_NIV_MONT_COTA", Equipment: "Sala de Comando", Index: 114, Description: "Animação Nível Montante"},
			{Name: "RADAR_VEL_JUSANT", Equipment: "Sala de Comando", Index: 115, Description: "Radar Velocidade Jusante"},
			{Name: "RADAR_VEL_MONT", Equipment: "Sala de Comando", Index: 116, Description: "Radar Velocidade Montante"},
			{Name: "RADAR_VEL_CALD_AGRUP", Equipment: "Sala de Comando", Index: 117, Description: "Radar Velocidade Caldeira Agrupado"},
			{Name: "RESERVA", Equipment: "Sala de Comando", Index: 118, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", Index: 119, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", Index: 120, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", Index: 121, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", Index: 122, Description: "Reserva"},
		},

		// USO GERAL - Reals 123-130
		UsoGeral: []RealDataDefinition{
			{Name: "RESERVA", Equipment: "Uso_Geral", Index: 123, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Uso_Geral", Index: 124, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Uso_Geral", Index: 125, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Uso_Geral", Index: 126, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Uso_Geral", Index: 127, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Uso_Geral", Index: 128, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Uso_Geral", Index: 129, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Uso_Geral", Index: 130, Description: "Reserva"},
		},
	}
}

// ProcessRealData preenche os valores dos dados reais baseado nos dados do PLC
func ProcessRealData(reals []float32) *RealDataStructure {
	realDefs := GetRealDataDefinitions()
	
	// Preencher valores para cada equipamento
	for i := range realDefs.Enchimento {
		if realDefs.Enchimento[i].Index < len(reals) {
			realDefs.Enchimento[i].Value = reals[realDefs.Enchimento[i].Index]
		}
	}
	
	for i := range realDefs.Esvaziamento {
		if realDefs.Esvaziamento[i].Index < len(reals) {
			realDefs.Esvaziamento[i].Value = reals[realDefs.Esvaziamento[i].Index]
		}
	}
	
	for i := range realDefs.PortaJusante {
		if realDefs.PortaJusante[i].Index < len(reals) {
			realDefs.PortaJusante[i].Value = reals[realDefs.PortaJusante[i].Index]
		}
	}
	
	for i := range realDefs.PortaMontante {
		if realDefs.PortaMontante[i].Index < len(reals) {
			realDefs.PortaMontante[i].Value = reals[realDefs.PortaMontante[i].Index]
		}
	}
	
	for i := range realDefs.EsgotoDrenagem {
		if realDefs.EsgotoDrenagem[i].Index < len(reals) {
			realDefs.EsgotoDrenagem[i].Value = reals[realDefs.EsgotoDrenagem[i].Index]
		}
	}
	
	for i := range realDefs.SalaComando {
		if realDefs.SalaComando[i].Index < len(reals) {
			realDefs.SalaComando[i].Value = reals[realDefs.SalaComando[i].Index]
		}
	}
	
	for i := range realDefs.UsoGeral {
		if realDefs.UsoGeral[i].Index < len(reals) {
			realDefs.UsoGeral[i].Value = reals[realDefs.UsoGeral[i].Index]
		}
	}
	
	return realDefs
}