package server

import (
	"encoding/binary"
	"math"
	"time"

	"projeto-hmi/internal/plcdata"
)

// ParsePLCData converte dados binários RECEBIDOS em estrutura PLCData
func ParsePLCData(data []byte) *plcdata.PLCData {
	plcData := plcdata.NewPLCData()
	plcData.Timestamp = time.Now().Format("2006-01-02 15:04:05.000")
	plcData.BytesSize = len(data)

	offset := 0

	// 1. WORDS[0..64] = 130 bytes (65 words)
	offset = parseWords(data, offset, plcData.Words)

	// 2. INTS[0..80] = 162 bytes (81 ints)
	offset = parseInts(data, offset, plcData.Ints)

	// 3. REALS[0..130] = 524 bytes (131 reals)
	offset = parseReals(data, offset, plcData.Reals)

	// 4. STRINGS[0..1] = 64 bytes (2 strings)
	offset = parseStrings(data, offset, plcData.Strings)

	// 5. CONTADORES = 8 bytes (4 contadores de 2 bytes cada)
	parseCounts(data, offset, &plcData.Counts)

	// 6. EXTRAIR BITS DAS WORDS
	plcData.BitData = plcdata.ExtractBitsFromWords(plcData.Words)
	
	// 7. PROCESSAR BITS DE STATUS (Words 0-16)
	plcData.StatusBits = plcdata.ProcessStatusBits(plcData.BitData)
	
	// 8. PROCESSAR BITS DE ALARMES (Words 17-47,63)
	plcData.AlarmBits = plcdata.ProcessAlarmBits(plcData.BitData)
	
	// 9. PROCESSAR BITS DE EVENTOS (Words 48-62)
	plcData.EventBits = plcdata.ProcessEventBits(plcData.BitData)
	
	// 10. PROCESSAR DADOS INTEIROS ORGANIZADOS (Ints 0-80)
	plcData.IntData = plcdata.ProcessIntData(plcData.Ints)
	
	// 11. PROCESSAR DADOS REAIS ORGANIZADOS (Reals 0-130)
	plcData.RealData = plcdata.ProcessRealData(plcData.Reals)

	return plcData
}

// SerializeWriteRequest converte WriteRequest em bytes para ENVIO ao PLC
// Word[0..2] + Int[0..10] + Real[0..10] + String[0..4]
func SerializeWriteRequest(req WriteRequest) []byte {
	// Estrutura de envio: 6 + 22 + 44 + 160 + 8 = 240 bytes
	data := make([]byte, 240)
	offset := 0

	// 1. Words[0..2] = 6 bytes (3 words)
	words := make([]uint16, 3)
	wordCount := 0
	for _, wv := range req.Words {
		if wv.Index >= 0 && wv.Index < 3 {
			if val, ok := wv.Value.(float64); ok {
				words[wv.Index] = uint16(val)
				wordCount++
			}
		}
	}
	for i := 0; i < 3; i++ {
		binary.BigEndian.PutUint16(data[offset:offset+2], words[i])
		offset += 2
	}

	// 2. Int[0..10] = 22 bytes (11 ints)
	ints := make([]int16, 11)
	intCount := 0
	for _, iv := range req.Ints {
		if iv.Index >= 0 && iv.Index < 11 {
			if val, ok := iv.Value.(float64); ok {
				ints[iv.Index] = int16(val)
				intCount++
			}
		}
	}
	for i := 0; i < 11; i++ {
		binary.BigEndian.PutUint16(data[offset:offset+2], uint16(ints[i]))
		offset += 2
	}

	// 3. Real[0..10] = 44 bytes (11 reals)
	reals := make([]float32, 11)
	realCount := 0
	for _, rv := range req.Reals {
		if rv.Index >= 0 && rv.Index < 11 {
			if val, ok := rv.Value.(float64); ok {
				reals[rv.Index] = float32(val)
				realCount++
			}
		}
	}
	for i := 0; i < 11; i++ {
		bits := math.Float32bits(reals[i])
		binary.BigEndian.PutUint32(data[offset:offset+4], bits)
		offset += 4
	}

	// 4. String[0..4] = 160 bytes (5 strings)
	strings := make([]string, 5)
	stringCount := 0
	for _, sv := range req.Strings {
		if sv.Index >= 0 && sv.Index < 5 {
			if val, ok := sv.Value.(string); ok {
				strings[sv.Index] = val
				stringCount++
			}
		}
	}
	for i := 0; i < 5; i++ {
		stringBytes := make([]byte, 32)
		if strings[i] != "" {
			stringBytes[0] = 30 // MaxLen
			if len(strings[i]) > 30 {
				strings[i] = strings[i][:30]
			}
			stringBytes[1] = byte(len(strings[i])) // ActLen
			copy(stringBytes[2:], []byte(strings[i]))
		} else {
			stringBytes[0] = 30 // MaxLen
			stringBytes[1] = 0  // ActLen = 0 (vazia)
		}
		copy(data[offset:offset+32], stringBytes)
		offset += 32
	}

	// 5. CONTADORES = 8 bytes (4 contadores de 2 bytes cada)
	binary.BigEndian.PutUint16(data[offset:offset+2], uint16(wordCount))
	binary.BigEndian.PutUint16(data[offset+2:offset+4], uint16(intCount))
	binary.BigEndian.PutUint16(data[offset+4:offset+6], uint16(realCount))
	binary.BigEndian.PutUint16(data[offset+6:offset+8], uint16(stringCount))

	return data
}

// serializeBits converte array de bool em bytes
func serializeBits(data []byte, offset int, bits []bool) int {
	bytesNeeded := (len(bits) + 7) / 8
	for i := 0; i < len(bits); i++ {
		byteIndex := offset + i/8
		bitIndex := i % 8
		if byteIndex < len(data) {
			if bits[i] {
				data[byteIndex] |= (1 << bitIndex)
			}
		}
	}
	return offset + bytesNeeded
}

// parseReals extrai dados float32 do buffer
func parseReals(data []byte, offset int, reals []float32) int {
	for i := 0; i < len(reals); i++ {
		if offset+4 <= len(data) {
			bytes := data[offset : offset+4]
			bits := binary.BigEndian.Uint32(bytes)
			reals[i] = math.Float32frombits(bits)
			offset += 4
		}
	}
	return offset
}

// parseInts extrai dados int16 do buffer
func parseInts(data []byte, offset int, ints []int16) int {
	for i := 0; i < len(ints); i++ {
		if offset+2 <= len(data) {
			bytes := data[offset : offset+2]
			ints[i] = int16(binary.BigEndian.Uint16(bytes))
			offset += 2
		}
	}
	return offset
}

// parseWords extrai dados uint16 do buffer
func parseWords(data []byte, offset int, words []uint16) int {
	for i := 0; i < len(words); i++ {
		if offset+2 <= len(data) {
			bytes := data[offset : offset+2]
			words[i] = binary.BigEndian.Uint16(bytes)
			offset += 2
		}
	}
	return offset
}

// parseStrings extrai strings do buffer
func parseStrings(data []byte, offset int, strings []string) int {
	for i := 0; i < len(strings); i++ {
		if offset+32 <= len(data) {
			strBytes := data[offset : offset+32]
			strings[i] = parseString(strBytes)
			offset += 32
		}
	}
	return offset
}

// parseBits extrai dados bool do buffer
func parseBits(data []byte, offset int, bits []bool) int {
	bytesNeeded := (len(bits) + 7) / 8 // Arredonda para cima
	for i := 0; i < len(bits) && offset < len(data); i++ {
		byteIndex := offset + i/8
		bitIndex := i % 8
		if byteIndex < len(data) {
			bits[i] = (data[byteIndex] & (1 << bitIndex)) != 0
		}
	}
	return offset + bytesNeeded
}

// parseCounts extrai contadores do buffer
func parseCounts(data []byte, offset int, counts *plcdata.Counts) {
	if offset+8 <= len(data) {
		remaining := data[offset:]
		counts.WordCount = int16(binary.BigEndian.Uint16(remaining[0:2]))
		counts.IntCount = int16(binary.BigEndian.Uint16(remaining[2:4]))
		counts.RealCount = int16(binary.BigEndian.Uint16(remaining[4:6]))
		counts.StringCount = int16(binary.BigEndian.Uint16(remaining[6:8]))
	}
}

// parseString converte bytes em string usando diferentes métodos
func parseString(data []byte) string {
	// Método 1: Formato Siemens (MaxLen + ActLen + Data)
	if len(data) >= 2 && data[0] == 30 && data[1] <= 30 && data[1] > 0 {
		return string(data[2 : 2+data[1]])
	}

	// Método 2: ASCII direto até null terminator ou caractere inválido
	result := ""
	for _, b := range data {
		if b == 0 {
			break
		}
		if b >= 32 && b <= 126 {
			result += string(b)
		} else if len(result) > 0 {
			break
		}
	}

	return result
}
