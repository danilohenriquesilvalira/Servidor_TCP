// Tipos baseados na estrutura Go do backend
export interface PLCData {
  words: number[];
  ints: number[];
  reals: number[];
  strings: string[];
  bit_data: BitExtractor;
  status_bits: StatusBitsStructure;
  alarm_bits: AlarmBitsStructure;
  event_bits: EventBitsStructure;
  int_data: IntDataStructure;
  real_data: RealDataStructure;
  counts: Counts;
  timestamp: string;
  bytes_size: number;
}

export interface Counts {
  word_count: number;
  int_count: number;
  real_count: number;
  string_count: number;
}

export interface BitExtractor {
  status_bits: boolean[][];
  alarm_bits: boolean[][];
  event_bits: boolean[][];
}

export interface StatusBitDefinition {
  name: string;
  equipment: string;
  word_index: number;
  bit_index: number;
  description: string;
  value: boolean;
}

export interface StatusBitsStructure {
  enchimento: StatusBitDefinition[];
  esvaziamento: StatusBitDefinition[];
  porta_jusante: StatusBitDefinition[];
  porta_montante: StatusBitDefinition[];
  esgoto_drenagem: StatusBitDefinition[];
  sala_comando: StatusBitDefinition[];
  reserva_geral?: StatusBitDefinition[];
}

export interface AlarmBitsStructure {
  enchimento: StatusBitDefinition[];
  esvaziamento: StatusBitDefinition[];
  porta_jusante: StatusBitDefinition[];
  porta_montante: StatusBitDefinition[];
  comando_eclusa: StatusBitDefinition[];
  esgoto_drenagem: StatusBitDefinition[];
  reserva_falhas?: StatusBitDefinition[];
}

export interface EventBitsStructure {
  enchimento: StatusBitDefinition[];
  esvaziamento: StatusBitDefinition[];
  porta_jusante: StatusBitDefinition[];
  porta_montante: StatusBitDefinition[];
  comando_eclusa: StatusBitDefinition[];
  esgoto_drenagem: StatusBitDefinition[];
  reserva_eventos?: StatusBitDefinition[];
}

export interface IntDataDefinition {
  name: string;
  equipment: string;
  index: number;
  description: string;
  value: number;
}

export interface IntDataStructure {
  enchimento: IntDataDefinition[];
  esvaziamento: IntDataDefinition[];
  porta_jusante: IntDataDefinition[];
  porta_montante: IntDataDefinition[];
  esgoto_drenagem: IntDataDefinition[];
  sala_comando: IntDataDefinition[];
}

export interface RealDataDefinition {
  name: string;
  equipment: string;
  index: number;
  description: string;
  value: number;
}

export interface RealDataStructure {
  enchimento: RealDataDefinition[];
  esvaziamento: RealDataDefinition[];
  porta_jusante: RealDataDefinition[];
  porta_montante: RealDataDefinition[];
  esgoto_drenagem: RealDataDefinition[];
  sala_comando: RealDataDefinition[];
  uso_geral: RealDataDefinition[];
}

// Tipos para comandos de escrita
export interface WriteValue<T = any> {
  index: number;
  value: T;
}

export interface WriteRequest {
  words: WriteValue<number>[];
  ints: WriteValue<number>[];
  reals: WriteValue<number>[];
  strings: WriteValue<string>[];
}

// Tipos para conexão WebSocket
export interface ConnectionStatus {
  connected: boolean;
  lastUpdate: Date | null;
  plc_connections: number;
  websocket_clients: number;
}

// Tipos para logs
export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

// Equipamentos disponíveis
export type Equipment = 
  | 'enchimento'
  | 'esvaziamento' 
  | 'porta_jusante'
  | 'porta_montante'
  | 'esgoto_drenagem'
  | 'sala_comando'
  | 'comando_eclusa'
  | 'uso_geral';

// Tipos de dados
export type DataType = 'words' | 'ints' | 'reals' | 'strings';
export type BitType = 'status' | 'alarm' | 'event';