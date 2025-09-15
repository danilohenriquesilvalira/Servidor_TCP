package plcdata

// BitExtractor extrai bits individuais das Words
type BitExtractor struct {
	StatusBits  [][]bool `json:"status_bits"`  // Words 0-16 (Status/Animações)
	AlarmBits   [][]bool `json:"alarm_bits"`   // Words 17-47 (Alarmes)
	EventBits   [][]bool `json:"event_bits"`   // Words 48-64 (Eventos)
}

// ExtractBitsFromWords converte array de Words em bits categorizados
func ExtractBitsFromWords(words []uint16) *BitExtractor {
	extractor := &BitExtractor{
		StatusBits: make([][]bool, 17), // Words 0-16
		AlarmBits:  make([][]bool, 31), // Words 17-47  
		EventBits:  make([][]bool, 17), // Words 48-64
	}

	// Processar todas as 65 words (0-64)
	for wordIndex := 0; wordIndex < len(words) && wordIndex < 65; wordIndex++ {
		word := words[wordIndex]
		bits := extractBitsFromWord(word)

		// Categorizar por faixa de Word
		if wordIndex <= 16 {
			// Status/Animações (Words 0-16)
			extractor.StatusBits[wordIndex] = bits
		} else if wordIndex <= 47 {
			// Alarmes (Words 17-47)
			alarmIndex := wordIndex - 17
			extractor.AlarmBits[alarmIndex] = bits
		} else if wordIndex <= 64 {
			// Eventos (Words 48-64)
			eventIndex := wordIndex - 48
			extractor.EventBits[eventIndex] = bits
		}
	}

	return extractor
}

// extractBitsFromWord extrai 16 bits de uma Word
func extractBitsFromWord(word uint16) []bool {
	bits := make([]bool, 16)
	for i := 0; i < 16; i++ {
		bits[i] = (word & (1 << i)) != 0
	}
	return bits
}

// GetBitRange retorna os bits de uma faixa específica (ex: bits 0-15 da Word 0)
func (be *BitExtractor) GetBitRange(category string, wordIndex int, startBit, endBit int) []bool {
	var wordBits []bool

	switch category {
	case "status":
		if wordIndex < len(be.StatusBits) {
			wordBits = be.StatusBits[wordIndex]
		}
	case "alarm":
		if wordIndex < len(be.AlarmBits) {
			wordBits = be.AlarmBits[wordIndex]
		}
	case "event":
		if wordIndex < len(be.EventBits) {
			wordBits = be.EventBits[wordIndex]
		}
	}

	if wordBits == nil || startBit < 0 || endBit >= len(wordBits) || startBit > endBit {
		return []bool{}
	}

	return wordBits[startBit : endBit+1]
}

// GetSingleBit retorna um bit específico
func (be *BitExtractor) GetSingleBit(category string, wordIndex, bitIndex int) bool {
	bits := be.GetBitRange(category, wordIndex, bitIndex, bitIndex)
	if len(bits) > 0 {
		return bits[0]
	}
	return false
}