package plcdata

// StatusBitDefinition define um bit de status individual
type StatusBitDefinition struct {
	Name        string `json:"name"`
	Equipment   string `json:"equipment"`
	WordIndex   int    `json:"word_index"`
	BitIndex    int    `json:"bit_index"`
	Description string `json:"description"`
	Value       bool   `json:"value"`
}

// StatusBitsStructure organiza todos os bits de status por equipamento
type StatusBitsStructure struct {
	Enchimento      []StatusBitDefinition `json:"enchimento"`       // Words 0-2 (48 bits)
	Esvaziamento    []StatusBitDefinition `json:"esvaziamento"`     // Words 3-5 (48 bits)
	PortaJusante    []StatusBitDefinition `json:"porta_jusante"`    // Words 6-7 (32 bits)
	PortaMontante   []StatusBitDefinition `json:"porta_montante"`   // Words 8-9 (32 bits)
	EsgotoDrenagem  []StatusBitDefinition `json:"esgoto_drenagem"`  // Words 10-11 (32 bits)
	SalaComando     []StatusBitDefinition `json:"sala_comando"`     // Words 12-14 (48 bits)
	ReservaBitsGeral []StatusBitDefinition `json:"reserva_geral"`   // Words 15-16 (32 bits)
}

// AlarmBitsStructure organiza todos os bits de alarme por equipamento
type AlarmBitsStructure struct {
	Enchimento      []StatusBitDefinition `json:"enchimento"`       // Words 17-20 (64 bits)
	Esvaziamento    []StatusBitDefinition `json:"esvaziamento"`     // Words 21-24 (64 bits)
	PortaJusante    []StatusBitDefinition `json:"porta_jusante"`    // Words 25-29 (80 bits)
	PortaMontante   []StatusBitDefinition `json:"porta_montante"`   // Words 30-35 (96 bits)
	ComandoEclusa   []StatusBitDefinition `json:"comando_eclusa"`   // Words 36-41 (96 bits)
	EsgotoDrenagem  []StatusBitDefinition `json:"esgoto_drenagem"`  // Words 42-47 (96 bits)
	ReservaFalhas   []StatusBitDefinition `json:"reserva_falhas"`   // Word 63 (16 bits)
}

// EventBitsStructure organiza todos os bits de eventos por equipamento
type EventBitsStructure struct {
	Enchimento      []StatusBitDefinition `json:"enchimento"`       // Words 48-50 (48 bits)
	Esvaziamento    []StatusBitDefinition `json:"esvaziamento"`     // Words 51-53 (48 bits)
	PortaJusante    []StatusBitDefinition `json:"porta_jusante"`    // Words 54-55 (32 bits)
	PortaMontante   []StatusBitDefinition `json:"porta_montante"`   // Words 56-57 (32 bits)
	ComandoEclusa   []StatusBitDefinition `json:"comando_eclusa"`   // Words 58-60 (48 bits)
	EsgotoDrenagem  []StatusBitDefinition `json:"esgoto_drenagem"`  // Words 61-62 (32 bits)
	ReservaEventos  []StatusBitDefinition `json:"reserva_eventos"`  // Word 64 (16 bits)
}

// GetStatusBitDefinitions retorna todas as definições dos bits de status
func GetStatusBitDefinitions() *StatusBitsStructure {
	return &StatusBitsStructure{
		// ENCHIMENTO - Words 0, 1, 2 (Bits 0-47)
		Enchimento: []StatusBitDefinition{
			// Word 0 (Bits 0-15)
			{Name: "BT_MANUAL", Equipment: "Enchimento", WordIndex: 0, BitIndex: 0, Description: "Botão Manual"},
			{Name: "BT_AUTOM", Equipment: "Enchimento", WordIndex: 0, BitIndex: 1, Description: "Botão Automático"},
			{Name: "FC_SUBIDA_AB_COMP_A", Equipment: "Enchimento", WordIndex: 0, BitIndex: 2, Description: "Fim de Curso Subida Abertura Comporta A"},
			{Name: "FC_DESCID_FC_COMP_A", Equipment: "Enchimento", WordIndex: 0, BitIndex: 3, Description: "Fim de Curso Descida Fechamento Comporta A"},
			{Name: "FC_SUBIDA_AB_COMP_B", Equipment: "Enchimento", WordIndex: 0, BitIndex: 4, Description: "Fim de Curso Subida Abertura Comporta B"},
			{Name: "FC_DESCID_FC_COMP_B", Equipment: "Enchimento", WordIndex: 0, BitIndex: 5, Description: "Fim de Curso Descida Fechamento Comporta B"},
			{Name: "RM_BOMB_A", Equipment: "Enchimento", WordIndex: 0, BitIndex: 6, Description: "Relé Motor Bomba A"},
			{Name: "RM_BOMB_B", Equipment: "Enchimento", WordIndex: 0, BitIndex: 7, Description: "Relé Motor Bomba B"},
			{Name: "OM_VALV_DIST_COMP_A", Equipment: "Enchimento", WordIndex: 0, BitIndex: 8, Description: "Ordem Motor Válvula Distribuição Comporta A"},
			{Name: "OM_VALV_DESC_COMP_A", Equipment: "Enchimento", WordIndex: 0, BitIndex: 9, Description: "Ordem Motor Válvula Descarga Comporta A"},
			{Name: "OM_VALV_DIST_COMP_B", Equipment: "Enchimento", WordIndex: 0, BitIndex: 10, Description: "Ordem Motor Válvula Distribuição Comporta B"},
			{Name: "OM_VALV_DESC_COMP_B", Equipment: "Enchimento", WordIndex: 0, BitIndex: 11, Description: "Ordem Motor Válvula Descarga Comporta B"},
			{Name: "OM_VD2_COMP_DIR", Equipment: "Enchimento", WordIndex: 0, BitIndex: 12, Description: "Ordem Motor VD2 Comporta Direita"},
			{Name: "OM_VD2_COMP_ESQ", Equipment: "Enchimento", WordIndex: 0, BitIndex: 13, Description: "Ordem Motor VD2 Comporta Esquerda"},
			{Name: "BT_SEL_COMP_DIR_DIR", Equipment: "Enchimento", WordIndex: 0, BitIndex: 14, Description: "Botão Seleção Comporta Direita"},
			{Name: "BT_SEL_COMP_ESQ_ESQ", Equipment: "Enchimento", WordIndex: 0, BitIndex: 15, Description: "Botão Seleção Comporta Esquerda"},
			
			// Word 1 (Bits 16-31)
			{Name: "RM_BOMB_DIR", Equipment: "Enchimento", WordIndex: 1, BitIndex: 0, Description: "Relé Motor Bomba Direita"},
			{Name: "RM_BOMB_ESQ", Equipment: "Enchimento", WordIndex: 1, BitIndex: 1, Description: "Relé Motor Bomba Esquerda"},
			{Name: "EM_SUB_LENTA", Equipment: "Enchimento", WordIndex: 1, BitIndex: 2, Description: "Estado Motor Subida Lenta"},
			{Name: "EM_SUB_RAP", Equipment: "Enchimento", WordIndex: 1, BitIndex: 3, Description: "Estado Motor Subida Rápida"},
			{Name: "SIN_CIRC_SUBIDA", Equipment: "Enchimento", WordIndex: 1, BitIndex: 4, Description: "Sinalização Circuito Subida"},
			{Name: "SIN_AG_SUBID", Equipment: "Enchimento", WordIndex: 1, BitIndex: 5, Description: "Sinalização Água Subida"},
			{Name: "SIST_DESLIG", Equipment: "Enchimento", WordIndex: 1, BitIndex: 6, Description: "Sistema Desligado"},
			{Name: "SUB_LENTA_ESQ", Equipment: "Enchimento", WordIndex: 1, BitIndex: 7, Description: "Subida Lenta Esquerda"},
			{Name: "SUB_RAP_ESQ", Equipment: "Enchimento", WordIndex: 1, BitIndex: 8, Description: "Subida Rápida Esquerda"},
			{Name: "SIN_CIRC_SUBIDA_ESQ", Equipment: "Enchimento", WordIndex: 1, BitIndex: 9, Description: "Sinalização Circuito Subida Esquerda"},
			{Name: "SIN_AG_SUBID_ESQ", Equipment: "Enchimento", WordIndex: 1, BitIndex: 10, Description: "Sinalização Água Subida Esquerda"},
			{Name: "COMP_A_DIR_SELEC", Equipment: "Enchimento", WordIndex: 1, BitIndex: 11, Description: "Comporta A Direita Selecionada"},
			{Name: "COMP_B_ESQ_SELEC", Equipment: "Enchimento", WordIndex: 1, BitIndex: 12, Description: "Comporta B Esquerda Selecionada"},
			{Name: "DEF_AG_CILIND_B_ESQ", Equipment: "Enchimento", WordIndex: 1, BitIndex: 13, Description: "Defeito Água Cilindro B Esquerda"},
			{Name: "DEF_AG_CILIND_A_DIR", Equipment: "Enchimento", WordIndex: 1, BitIndex: 14, Description: "Defeito Água Cilindro A Direita"},
			{Name: "HMI_B_LIG_VD2_0_DIR", Equipment: "Enchimento", WordIndex: 1, BitIndex: 15, Description: "HMI Botão Ligar VD2 0 Direita"},
			
			// Word 2 (Bits 32-47)
			{Name: "HMI_B_LIG_VD2_0_ESQ", Equipment: "Enchimento", WordIndex: 2, BitIndex: 0, Description: "HMI Botão Ligar VD2 0 Esquerda"},
			{Name: "HMI_VD1_VD2_LIG_DIR", Equipment: "Enchimento", WordIndex: 2, BitIndex: 1, Description: "HMI VD1 VD2 Ligado Direita"},
			{Name: "HMI_VD1_VD2_LIG_ESQ", Equipment: "Enchimento", WordIndex: 2, BitIndex: 2, Description: "HMI VD1 VD2 Ligado Esquerda"},
			{Name: "BT_HMI_AB_CIL_LIMP", Equipment: "Enchimento", WordIndex: 2, BitIndex: 3, Description: "Botão HMI Abertura Cilindro Limpeza"},
			{Name: "RESERVA", Equipment: "Enchimento", WordIndex: 2, BitIndex: 4, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Enchimento", WordIndex: 2, BitIndex: 5, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Enchimento", WordIndex: 2, BitIndex: 6, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Enchimento", WordIndex: 2, BitIndex: 7, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Enchimento", WordIndex: 2, BitIndex: 8, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Enchimento", WordIndex: 2, BitIndex: 9, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Enchimento", WordIndex: 2, BitIndex: 10, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Enchimento", WordIndex: 2, BitIndex: 11, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Enchimento", WordIndex: 2, BitIndex: 12, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Enchimento", WordIndex: 2, BitIndex: 13, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Enchimento", WordIndex: 2, BitIndex: 14, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Enchimento", WordIndex: 2, BitIndex: 15, Description: "Reserva"},
		},
		
		// ESVAZIAMENTO - Words 3, 4, 5 (Bits 48-95)
		Esvaziamento: []StatusBitDefinition{
			// Word 3 (Bits 48-63)
			{Name: "BT_MANUAL", Equipment: "Esvaziamento", WordIndex: 3, BitIndex: 0, Description: "Botão Manual"},
			{Name: "BT_AUTOM", Equipment: "Esvaziamento", WordIndex: 3, BitIndex: 1, Description: "Botão Automático"},
			{Name: "FC_SUBIDA_AB_COMP_A", Equipment: "Esvaziamento", WordIndex: 3, BitIndex: 2, Description: "Fim de Curso Subida Abertura Comporta A"},
			{Name: "FC_DESCID_FC_COMP_A", Equipment: "Esvaziamento", WordIndex: 3, BitIndex: 3, Description: "Fim de Curso Descida Fechamento Comporta A"},
			{Name: "FC_SUBIDA_AB_COMP_B", Equipment: "Esvaziamento", WordIndex: 3, BitIndex: 4, Description: "Fim de Curso Subida Abertura Comporta B"},
			{Name: "FC_DESCID_FC_COMP_B", Equipment: "Esvaziamento", WordIndex: 3, BitIndex: 5, Description: "Fim de Curso Descida Fechamento Comporta B"},
			{Name: "RM_BOMB_A", Equipment: "Esvaziamento", WordIndex: 3, BitIndex: 6, Description: "Relé Motor Bomba A"},
			{Name: "RM_BOMB_B", Equipment: "Esvaziamento", WordIndex: 3, BitIndex: 7, Description: "Relé Motor Bomba B"},
			{Name: "OM_VALV_DIST_COMP_A", Equipment: "Esvaziamento", WordIndex: 3, BitIndex: 8, Description: "Ordem Motor Válvula Distribuição Comporta A"},
			{Name: "OM_VALV_DESC_COMP_A", Equipment: "Esvaziamento", WordIndex: 3, BitIndex: 9, Description: "Ordem Motor Válvula Descarga Comporta A"},
			{Name: "OM_VALV_DIST_COMP_B", Equipment: "Esvaziamento", WordIndex: 3, BitIndex: 10, Description: "Ordem Motor Válvula Distribuição Comporta B"},
			{Name: "OM_VALV_DESC_COMP_B", Equipment: "Esvaziamento", WordIndex: 3, BitIndex: 11, Description: "Ordem Motor Válvula Descarga Comporta B"},
			{Name: "OM_VD2_COMP_DIR", Equipment: "Esvaziamento", WordIndex: 3, BitIndex: 12, Description: "Ordem Motor VD2 Comporta Direita"},
			{Name: "OM_VD2_COMP_ESQ", Equipment: "Esvaziamento", WordIndex: 3, BitIndex: 13, Description: "Ordem Motor VD2 Comporta Esquerda"},
			{Name: "BT_SEL_COMP_DIR_DIR", Equipment: "Esvaziamento", WordIndex: 3, BitIndex: 14, Description: "Botão Seleção Comporta Direita"},
			{Name: "BT_SEL_COMP_ESQ", Equipment: "Esvaziamento", WordIndex: 3, BitIndex: 15, Description: "Botão Seleção Comporta Esquerda"},
			
			// Word 4 (Bits 64-79)
			{Name: "RM_BOMB_DIR", Equipment: "Esvaziamento", WordIndex: 4, BitIndex: 0, Description: "Relé Motor Bomba Direita"},
			{Name: "RM_BOMB_ESQ", Equipment: "Esvaziamento", WordIndex: 4, BitIndex: 1, Description: "Relé Motor Bomba Esquerda"},
			{Name: "EM_SUB_LENTA", Equipment: "Esvaziamento", WordIndex: 4, BitIndex: 2, Description: "Estado Motor Subida Lenta"},
			{Name: "EM_SUB_RAP", Equipment: "Esvaziamento", WordIndex: 4, BitIndex: 3, Description: "Estado Motor Subida Rápida"},
			{Name: "SIN_CIRC_SUBIDA", Equipment: "Esvaziamento", WordIndex: 4, BitIndex: 4, Description: "Sinalização Circuito Subida"},
			{Name: "SIN_AG_SUBID", Equipment: "Esvaziamento", WordIndex: 4, BitIndex: 5, Description: "Sinalização Água Subida"},
			{Name: "SIST_DESLIG", Equipment: "Esvaziamento", WordIndex: 4, BitIndex: 6, Description: "Sistema Desligado"},
			{Name: "EM_SUB_LENTA_ESQ", Equipment: "Esvaziamento", WordIndex: 4, BitIndex: 7, Description: "Estado Motor Subida Lenta Esquerda"},
			{Name: "EM_SUB_RAP_ESQ", Equipment: "Esvaziamento", WordIndex: 4, BitIndex: 8, Description: "Estado Motor Subida Rápida Esquerda"},
			{Name: "SIN_CIRC_SUBIDA_ESQ", Equipment: "Esvaziamento", WordIndex: 4, BitIndex: 9, Description: "Sinalização Circuito Subida Esquerda"},
			{Name: "SIN_AG_SUBID_ESQ", Equipment: "Esvaziamento", WordIndex: 4, BitIndex: 10, Description: "Sinalização Água Subida Esquerda"},
			{Name: "COMP_A_DIR_SELEC", Equipment: "Esvaziamento", WordIndex: 4, BitIndex: 11, Description: "Comporta A Direita Selecionada"},
			{Name: "COMP_B_ESQ_SELEC", Equipment: "Esvaziamento", WordIndex: 4, BitIndex: 12, Description: "Comporta B Esquerda Selecionada"},
			{Name: "DEF_AG_CILIND_B_ESQ", Equipment: "Esvaziamento", WordIndex: 4, BitIndex: 13, Description: "Defeito Água Cilindro B Esquerda"},
			{Name: "DEF_AG_CILIND_A_DIR", Equipment: "Esvaziamento", WordIndex: 4, BitIndex: 14, Description: "Defeito Água Cilindro A Direita"},
			{Name: "HMI_B_LIG_VD2_0_DIR", Equipment: "Esvaziamento", WordIndex: 4, BitIndex: 15, Description: "HMI Botão Ligar VD2 0 Direita"},
			
			// Word 5 (Bits 80-95)
			{Name: "HMI_B_LIG_VD2_0_ESQ", Equipment: "Esvaziamento", WordIndex: 5, BitIndex: 0, Description: "HMI Botão Ligar VD2 0 Esquerda"},
			{Name: "HMI_VD1_VD2_LIG_DIR", Equipment: "Esvaziamento", WordIndex: 5, BitIndex: 1, Description: "HMI VD1 VD2 Ligado Direita"},
			{Name: "HMI_VD1_VD2_LIG_ESQ", Equipment: "Esvaziamento", WordIndex: 5, BitIndex: 2, Description: "HMI VD1 VD2 Ligado Esquerda"},
			{Name: "RESERVA", Equipment: "Esvaziamento", WordIndex: 5, BitIndex: 3, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esvaziamento", WordIndex: 5, BitIndex: 4, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esvaziamento", WordIndex: 5, BitIndex: 5, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esvaziamento", WordIndex: 5, BitIndex: 6, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esvaziamento", WordIndex: 5, BitIndex: 7, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esvaziamento", WordIndex: 5, BitIndex: 8, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esvaziamento", WordIndex: 5, BitIndex: 9, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esvaziamento", WordIndex: 5, BitIndex: 10, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esvaziamento", WordIndex: 5, BitIndex: 11, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esvaziamento", WordIndex: 5, BitIndex: 12, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esvaziamento", WordIndex: 5, BitIndex: 13, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esvaziamento", WordIndex: 5, BitIndex: 14, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esvaziamento", WordIndex: 5, BitIndex: 15, Description: "Reserva"},
		},
		
		// PORTA JUSANTE - Words 6, 7 (Bits 96-127)
		PortaJusante: []StatusBitDefinition{
			// Word 6 (Bits 96-111)
			{Name: "SIST_DESLIG", Equipment: "Porta_Jusante", WordIndex: 6, BitIndex: 0, Description: "Sistema Desligado"},
			{Name: "BT_MANUAL", Equipment: "Porta_Jusante", WordIndex: 6, BitIndex: 1, Description: "Botão Manual"},
			{Name: "BT_AUTOM", Equipment: "Porta_Jusante", WordIndex: 6, BitIndex: 2, Description: "Botão Automático"},
			{Name: "INT_SUBIDA", Equipment: "Porta_Jusante", WordIndex: 6, BitIndex: 3, Description: "Intertravamento Subida"},
			{Name: "INT_DESCIDA", Equipment: "Porta_Jusante", WordIndex: 6, BitIndex: 4, Description: "Intertravamento Descida"},
			{Name: "DEF_FALT_IG_NIV", Equipment: "Porta_Jusante", WordIndex: 6, BitIndex: 5, Description: "Defeito Falta Igualdade Nível"},
			{Name: "M_IG_NIV_JUS", Equipment: "Porta_Jusante", WordIndex: 6, BitIndex: 6, Description: "Memória Igualdade Nível Jusante"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 6, BitIndex: 7, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 6, BitIndex: 8, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 6, BitIndex: 9, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 6, BitIndex: 10, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 6, BitIndex: 11, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 6, BitIndex: 12, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 6, BitIndex: 13, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 6, BitIndex: 14, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 6, BitIndex: 15, Description: "Reserva"},
			
			// Word 7 (Bits 112-127) - Reserva Porta Jusante
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 7, BitIndex: 0, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 7, BitIndex: 1, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 7, BitIndex: 2, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 7, BitIndex: 3, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 7, BitIndex: 4, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 7, BitIndex: 5, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 7, BitIndex: 6, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 7, BitIndex: 7, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 7, BitIndex: 8, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 7, BitIndex: 9, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 7, BitIndex: 10, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 7, BitIndex: 11, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 7, BitIndex: 12, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 7, BitIndex: 13, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 7, BitIndex: 14, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Jusante", WordIndex: 7, BitIndex: 15, Description: "Reserva"},
		},
		
		// PORTA MONTANTE - Words 8, 9 (Bits 128-159)
		PortaMontante: []StatusBitDefinition{
			// Word 8 (Bits 128-143)
			{Name: "BT_MANUAL", Equipment: "Porta_Montante", WordIndex: 8, BitIndex: 0, Description: "Botão Manual"},
			{Name: "BT_AUTOM", Equipment: "Porta_Montante", WordIndex: 8, BitIndex: 1, Description: "Botão Automático"},
			{Name: "DEF_FALT_IG_NIV", Equipment: "Porta_Montante", WordIndex: 8, BitIndex: 2, Description: "Defeito Falta Igualdade Nível"},
			{Name: "INT_DESCIDA", Equipment: "Porta_Montante", WordIndex: 8, BitIndex: 3, Description: "Intertravamento Descida"},
			{Name: "INT_SUBIDA", Equipment: "Porta_Montante", WordIndex: 8, BitIndex: 4, Description: "Intertravamento Subida"},
			{Name: "SIST_DESLIG", Equipment: "Porta_Montante", WordIndex: 8, BitIndex: 5, Description: "Sistema Desligado"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 8, BitIndex: 6, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 8, BitIndex: 7, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 8, BitIndex: 8, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 8, BitIndex: 9, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 8, BitIndex: 10, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 8, BitIndex: 11, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 8, BitIndex: 12, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 8, BitIndex: 13, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 8, BitIndex: 14, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 8, BitIndex: 15, Description: "Reserva"},
			
			// Word 9 (Bits 144-159)
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 9, BitIndex: 0, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 9, BitIndex: 1, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 9, BitIndex: 2, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 9, BitIndex: 3, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 9, BitIndex: 4, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 9, BitIndex: 5, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 9, BitIndex: 6, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 9, BitIndex: 7, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 9, BitIndex: 8, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 9, BitIndex: 9, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 9, BitIndex: 10, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 9, BitIndex: 11, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 9, BitIndex: 12, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 9, BitIndex: 13, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 9, BitIndex: 14, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Porta_Montante", WordIndex: 9, BitIndex: 15, Description: "Reserva"},
		},
		
		// ESGOTO E DRENAGEM - Words 10, 11 (Bits 160-191)
		EsgotoDrenagem: []StatusBitDefinition{
			// Word 10 (Bits 160-175)
			{Name: "GESTAO_ESGOTO_DRENAGEM", Equipment: "Esgoto e Drenagem", WordIndex: 10, BitIndex: 0, Description: "Gestão Esgoto Drenagem"},
			{Name: "GESTAO_ESGOTO_DRENAGEM", Equipment: "Esgoto e Drenagem", WordIndex: 10, BitIndex: 1, Description: "Gestão Esgoto Drenagem"},
			{Name: "GESTAO_ESGOTO_DRENAGEM", Equipment: "Esgoto e Drenagem", WordIndex: 10, BitIndex: 2, Description: "Gestão Esgoto Drenagem"},
			{Name: "GESTAO_ESGOTO_DRENAGEM", Equipment: "Esgoto e Drenagem", WordIndex: 10, BitIndex: 3, Description: "Gestão Esgoto Drenagem"},
			{Name: "GESTAO_ESGOTO_DRENAGEM", Equipment: "Esgoto e Drenagem", WordIndex: 10, BitIndex: 4, Description: "Gestão Esgoto Drenagem"},
			{Name: "GESTAO_ESGOTO_DRENAGEM", Equipment: "Esgoto e Drenagem", WordIndex: 10, BitIndex: 5, Description: "Gestão Esgoto Drenagem"},
			{Name: "GESTAO_ESGOTO_DRENAGEM", Equipment: "Esgoto e Drenagem", WordIndex: 10, BitIndex: 6, Description: "Gestão Esgoto Drenagem"},
			{Name: "GESTAO_ESGOTO_DRENAGEM", Equipment: "Esgoto e Drenagem", WordIndex: 10, BitIndex: 7, Description: "Gestão Esgoto Drenagem"},
			{Name: "GESTAO_ESGOTO_DRENAGEM", Equipment: "Esgoto e Drenagem", WordIndex: 10, BitIndex: 8, Description: "Gestão Esgoto Drenagem"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 10, BitIndex: 9, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 10, BitIndex: 10, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 10, BitIndex: 11, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 10, BitIndex: 12, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 10, BitIndex: 13, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 10, BitIndex: 14, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 10, BitIndex: 15, Description: "Reserva"},
			
			// Word 11 (Bits 176-191) - Reserva Esgoto/Drenagem
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 11, BitIndex: 0, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 11, BitIndex: 1, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 11, BitIndex: 2, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 11, BitIndex: 3, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 11, BitIndex: 4, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 11, BitIndex: 5, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 11, BitIndex: 6, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 11, BitIndex: 7, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 11, BitIndex: 8, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 11, BitIndex: 9, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 11, BitIndex: 10, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 11, BitIndex: 11, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 11, BitIndex: 12, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 11, BitIndex: 13, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 11, BitIndex: 14, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Esgoto e Drenagem", WordIndex: 11, BitIndex: 15, Description: "Reserva"},
		},
		
		// SALA DE COMANDO - Words 12, 13, 14 (Bits 192-239)
		SalaComando: []StatusBitDefinition{
			// Word 12 (Bits 192-207)
			{Name: "M_IG_NIV_MONT", Equipment: "Sala de Comando", WordIndex: 12, BitIndex: 0, Description: "Memória Igualdade Nível Montante"},
			{Name: "M_IG_NIV_JUS", Equipment: "Sala de Comando", WordIndex: 12, BitIndex: 1, Description: "Memória Igualdade Nível Jusante"},
			{Name: "DEF_COTA_JUS", Equipment: "Sala de Comando", WordIndex: 12, BitIndex: 2, Description: "Defeito Cota Jusante"},
			{Name: "DEF_COTA_MONT", Equipment: "Sala de Comando", WordIndex: 12, BitIndex: 3, Description: "Defeito Cota Montante"},
			{Name: "SIN_NIV_FORCADOS", Equipment: "Sala de Comando", WordIndex: 12, BitIndex: 4, Description: "Sinalização Níveis Forçados"},
			{Name: "BY_PASS_IG_JUS", Equipment: "Sala de Comando", WordIndex: 12, BitIndex: 5, Description: "Bypass Igualdade Jusante"},
			{Name: "BY_PASS_IG_MONT", Equipment: "Sala de Comando", WordIndex: 12, BitIndex: 6, Description: "Bypass Igualdade Montante"},
			{Name: "IGUALD_NIV_MONT_UMN", Equipment: "Sala de Comando", WordIndex: 12, BitIndex: 7, Description: "Igualdade Nível Montante UMN"},
			{Name: "IGUALD_NIV_JUS_UMN", Equipment: "Sala de Comando", WordIndex: 12, BitIndex: 8, Description: "Igualdade Nível Jusante UMN"},
			{Name: "HMI_ENCH_A_AB", Equipment: "Sala de Comando", WordIndex: 12, BitIndex: 9, Description: "HMI Enchimento A Aberto"},
			{Name: "HMI_ESVZ_A_AB", Equipment: "Sala de Comando", WordIndex: 12, BitIndex: 10, Description: "HMI Esvaziamento A Aberto"},
			{Name: "BT_COM_MAN", Equipment: "Sala de Comando", WordIndex: 12, BitIndex: 11, Description: "Botão Comando Manual"},
			{Name: "BT_COM_DESLIG", Equipment: "Sala de Comando", WordIndex: 12, BitIndex: 12, Description: "Botão Comando Desligado"},
			{Name: "BT_COM_AUT", Equipment: "Sala de Comando", WordIndex: 12, BitIndex: 13, Description: "Botão Comando Automático"},
			{Name: "M_ENT_INTERD_JUS", Equipment: "Sala de Comando", WordIndex: 12, BitIndex: 14, Description: "Memória Entrada Interdição Jusante"},
			{Name: "M_ENT_AUTOR_JUS", Equipment: "Sala de Comando", WordIndex: 12, BitIndex: 15, Description: "Memória Entrada Autorização Jusante"},
			
			// Word 13 (Bits 208-223)
			{Name: "M_SAID_INTERD_MONT", Equipment: "Sala de Comando", WordIndex: 13, BitIndex: 0, Description: "Memória Saída Interdição Montante"},
			{Name: "M_SAID_AUTOR_MONT", Equipment: "Sala de Comando", WordIndex: 13, BitIndex: 1, Description: "Memória Saída Autorização Montante"},
			{Name: "M_ENT_INTERD_MONT", Equipment: "Sala de Comando", WordIndex: 13, BitIndex: 2, Description: "Memória Entrada Interdição Montante"},
			{Name: "M_ENT_AUTOR_MONT", Equipment: "Sala de Comando", WordIndex: 13, BitIndex: 3, Description: "Memória Entrada Autorização Montante"},
			{Name: "M_SAID_INTERD_JUS", Equipment: "Sala de Comando", WordIndex: 13, BitIndex: 4, Description: "Memória Saída Interdição Jusante"},
			{Name: "M_SAID_AUTOR_JUS", Equipment: "Sala de Comando", WordIndex: 13, BitIndex: 5, Description: "Memória Saída Autorização Jusante"},
			{Name: "RESERVA", Equipment: "Sala de Comando", WordIndex: 13, BitIndex: 6, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", WordIndex: 13, BitIndex: 7, Description: "Reserva"},
			{Name: "PISCA_VERDE_BOTAO_ABRIR_ENCHIMENTO", Equipment: "Sala de Comando", WordIndex: 13, BitIndex: 8, Description: "Pisca Verde Botão Abrir Enchimento"},
			{Name: "PISCA_AMARELO_BOTAO_FECHAR_ENCHIMENTO", Equipment: "Sala de Comando", WordIndex: 13, BitIndex: 9, Description: "Pisca Amarelo Botão Fechar Enchimento"},
			{Name: "PISCA_VERDE_BOTAO_ABRIR_ESVAZIAMENTO", Equipment: "Sala de Comando", WordIndex: 13, BitIndex: 10, Description: "Pisca Verde Botão Abrir Esvaziamento"},
			{Name: "PISCA_AMARELO_BOTAO_FECHAR_ESVAZIAMENTO", Equipment: "Sala de Comando", WordIndex: 13, BitIndex: 11, Description: "Pisca Amarelo Botão Fechar Esvaziamento"},
			{Name: "PISCA_VERDE_BOTAO_ABRIR_JUSANTE", Equipment: "Sala de Comando", WordIndex: 13, BitIndex: 12, Description: "Pisca Verde Botão Abrir Jusante"},
			{Name: "PISCA_AMARELO_BOTAO_FECHAR_JUSANTE", Equipment: "Sala de Comando", WordIndex: 13, BitIndex: 13, Description: "Pisca Amarelo Botão Fechar Jusante"},
			{Name: "PISCA_VERDE_BOTAO_ABRIR_MONTANTE", Equipment: "Sala de Comando", WordIndex: 13, BitIndex: 14, Description: "Pisca Verde Botão Abrir Montante"},
			{Name: "PISCA_AMARELO_BOTAO_FECHAR_MONTANTE", Equipment: "Sala de Comando", WordIndex: 13, BitIndex: 15, Description: "Pisca Amarelo Botão Fechar Montante"},
			
			// Word 14 (Bits 224-239)
			{Name: "RESERVA", Equipment: "Sala de Comando", WordIndex: 14, BitIndex: 0, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", WordIndex: 14, BitIndex: 1, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", WordIndex: 14, BitIndex: 2, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", WordIndex: 14, BitIndex: 3, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", WordIndex: 14, BitIndex: 4, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", WordIndex: 14, BitIndex: 5, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", WordIndex: 14, BitIndex: 6, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", WordIndex: 14, BitIndex: 7, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", WordIndex: 14, BitIndex: 8, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", WordIndex: 14, BitIndex: 9, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", WordIndex: 14, BitIndex: 10, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", WordIndex: 14, BitIndex: 11, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", WordIndex: 14, BitIndex: 12, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", WordIndex: 14, BitIndex: 13, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", WordIndex: 14, BitIndex: 14, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Sala de Comando", WordIndex: 14, BitIndex: 15, Description: "Reserva"},
		},
		
		// RESERVA BITS GERAL - Words 15, 16 (Bits 240-271)
		ReservaBitsGeral: []StatusBitDefinition{
			// Word 15 (Bits 240-255)
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 15, BitIndex: 0, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 15, BitIndex: 1, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 15, BitIndex: 2, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 15, BitIndex: 3, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 15, BitIndex: 4, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 15, BitIndex: 5, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 15, BitIndex: 6, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 15, BitIndex: 7, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 15, BitIndex: 8, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 15, BitIndex: 9, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 15, BitIndex: 10, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 15, BitIndex: 11, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 15, BitIndex: 12, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 15, BitIndex: 13, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 15, BitIndex: 14, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 15, BitIndex: 15, Description: "Reserva"},
			
			// Word 16 (Bits 256-271)
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 16, BitIndex: 0, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 16, BitIndex: 1, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 16, BitIndex: 2, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 16, BitIndex: 3, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 16, BitIndex: 4, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 16, BitIndex: 5, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 16, BitIndex: 6, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 16, BitIndex: 7, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 16, BitIndex: 8, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 16, BitIndex: 9, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 16, BitIndex: 10, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 16, BitIndex: 11, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 16, BitIndex: 12, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 16, BitIndex: 13, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 16, BitIndex: 14, Description: "Reserva"},
			{Name: "RESERVA", Equipment: "Reserva Bits Geral", WordIndex: 16, BitIndex: 15, Description: "Reserva"},
		},
	}
}

// ProcessStatusBits preenche os valores dos bits de status baseado nos dados do PLC
func ProcessStatusBits(bitExtractor *BitExtractor) *StatusBitsStructure {
	statusDefs := GetStatusBitDefinitions()
	
	// Preencher valores para cada equipamento
	for i := range statusDefs.Enchimento {
		bit := &statusDefs.Enchimento[i]
		bit.Value = bitExtractor.GetSingleBit("status", bit.WordIndex, bit.BitIndex)
	}
	
	for i := range statusDefs.Esvaziamento {
		bit := &statusDefs.Esvaziamento[i]
		bit.Value = bitExtractor.GetSingleBit("status", bit.WordIndex, bit.BitIndex)
	}
	
	for i := range statusDefs.PortaJusante {
		bit := &statusDefs.PortaJusante[i]
		bit.Value = bitExtractor.GetSingleBit("status", bit.WordIndex, bit.BitIndex)
	}
	
	for i := range statusDefs.PortaMontante {
		bit := &statusDefs.PortaMontante[i]
		bit.Value = bitExtractor.GetSingleBit("status", bit.WordIndex, bit.BitIndex)
	}
	
	for i := range statusDefs.EsgotoDrenagem {
		bit := &statusDefs.EsgotoDrenagem[i]
		bit.Value = bitExtractor.GetSingleBit("status", bit.WordIndex, bit.BitIndex)
	}
	
	for i := range statusDefs.SalaComando {
		bit := &statusDefs.SalaComando[i]
		bit.Value = bitExtractor.GetSingleBit("status", bit.WordIndex, bit.BitIndex)
	}
	
	for i := range statusDefs.ReservaBitsGeral {
		bit := &statusDefs.ReservaBitsGeral[i]
		bit.Value = bitExtractor.GetSingleBit("status", bit.WordIndex, bit.BitIndex)
	}
	
	return statusDefs
}

