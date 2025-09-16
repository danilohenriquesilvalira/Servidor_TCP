package plcdata

// PLCData representa os dados RECEBIDOS do PLC
type PLCData struct {
	Words       []uint16             `json:"words"`       // Array[0..64] = 65 words
	Ints        []int16              `json:"ints"`        // Array[0..80] = 81 ints
	Reals       []float32            `json:"reals"`       // Array[0..130] = 131 reals
	Strings     []string             `json:"strings"`     // Array[0..1] = 2 strings
	BitData     *BitExtractor        `json:"bit_data"`    // Bits extraídos das Words
	StatusBits  *StatusBitsStructure `json:"status_bits"` // Bits de status organizados (Words 0-16)
	AlarmBits   *AlarmBitsStructure  `json:"alarm_bits"`  // Bits de alarmes organizados (Words 17-47,63)
	EventBits   *EventBitsStructure  `json:"event_bits"`  // Bits de eventos organizados (Words 48-62)
	IntData     *IntDataStructure    `json:"int_data"`    // Dados inteiros organizados por equipamento
	RealData    *RealDataStructure   `json:"real_data"`   // Dados reais organizados por equipamento
	Counts      Counts               `json:"counts"`
	Timestamp   string               `json:"timestamp"`
	BytesSize   int                  `json:"bytes_size"`
}

// Counts representa os contadores dos dados do PLC
type Counts struct {
	WordCount   int16 `json:"word_count"`
	IntCount    int16 `json:"int_count"`
	RealCount   int16 `json:"real_count"`
	StringCount int16 `json:"string_count"`
}

// NewPLCData cria uma nova instância de PLCData com valores padrão (RECEBE)
func NewPLCData() *PLCData {
	return &PLCData{
		Words:   make([]uint16, 65),   // [0..64]
		Ints:    make([]int16, 81),    // [0..80] 
		Reals:   make([]float32, 131), // [0..130]
		Strings: make([]string, 2),    // [0..1]
		Counts:  Counts{},
	}
}
