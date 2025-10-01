-- ===============================================================================
-- SCRIPT 1: CRIAR ESTRUTURA DE TABELAS PARA SISTEMA DE FALHAS
-- Execute este script no seu SQL Shell (psql)
-- ===============================================================================

-- Verificar se o banco eclusa_hmi existe, se não, criar
SELECT 'Verificando banco eclusa_hmi...' as status;

-- Conectar no banco eclusa_hmi (execute: \c eclusa_hmi)
-- Se não existir, criar com: CREATE DATABASE eclusa_hmi;

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipos customizados
CREATE TYPE fault_event_type AS ENUM ('AL', 'EV');
CREATE TYPE severity_level AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE event_action AS ENUM ('ACTIVATED', 'DEACTIVATED');

-- ===============================================================================
-- TABELA 1: DEFINIÇÕES DE FALHAS E EVENTOS
-- ===============================================================================
CREATE TABLE fault_event_definitions (
    id SERIAL PRIMARY KEY,
    line_number INTEGER UNIQUE NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    word_index INTEGER NOT NULL,
    bit_index INTEGER NOT NULL,
    type fault_event_type NOT NULL,
    sector VARCHAR(50) NOT NULL,
    location VARCHAR(10) DEFAULT 'RG',
    title TEXT NOT NULL,
    clean_title TEXT,
    is_reserved BOOLEAN DEFAULT FALSE,
    has_parameters BOOLEAN DEFAULT FALSE,
    severity severity_level DEFAULT 'MEDIUM',
    priority INTEGER DEFAULT 5,
    debounce_ms INTEGER DEFAULT 1000,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(word_index, bit_index)
);

-- ===============================================================================
-- TABELA 2: HISTÓRICO DE EVENTOS
-- ===============================================================================
CREATE TABLE fault_event_history (
    id BIGSERIAL PRIMARY KEY,
    definition_id INTEGER NOT NULL REFERENCES fault_event_definitions(id),
    action event_action NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    plc_context JSONB,
    session_id UUID NOT NULL,
    sequence_number BIGINT NOT NULL,
    UNIQUE(definition_id, action, timestamp)
);

-- ===============================================================================
-- TABELA 3: ESTADO ATUAL DAS FALHAS
-- ===============================================================================
CREATE TABLE fault_event_current_state (
    definition_id INTEGER PRIMARY KEY REFERENCES fault_event_definitions(id),
    is_active BOOLEAN DEFAULT FALSE,
    last_action event_action,
    activated_at TIMESTAMP,
    deactivated_at TIMESTAMP,
    last_updated TIMESTAMP DEFAULT NOW(),
    activation_count BIGINT DEFAULT 0,
    last_sequence_processed BIGINT DEFAULT 0
);

-- ===============================================================================
-- TABELA 4: SESSÕES DE COLETA
-- ===============================================================================
CREATE TABLE collection_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    total_events_processed BIGINT DEFAULT 0,
    total_state_changes BIGINT DEFAULT 0,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    notes TEXT
);

-- ===============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ===============================================================================
CREATE INDEX idx_history_definition_timestamp ON fault_event_history (definition_id, timestamp DESC);
CREATE INDEX idx_history_timestamp ON fault_event_history (timestamp DESC);
CREATE INDEX idx_current_state_active ON fault_event_current_state (definition_id) WHERE is_active = true;
CREATE INDEX idx_definitions_word_bit ON fault_event_definitions (word_index, bit_index);
CREATE INDEX idx_definitions_type_sector ON fault_event_definitions (type, sector) WHERE enabled = true;

-- ===============================================================================
-- VIEWS ÚTEIS
-- ===============================================================================

-- View para falhas ativas
CREATE OR REPLACE VIEW v_active_faults AS
SELECT 
    d.id, d.code, d.type, d.sector, d.title, d.severity, d.priority,
    s.activated_at, 
    EXTRACT(EPOCH FROM (NOW() - s.activated_at))::INTEGER as current_duration_seconds,
    s.activation_count, d.word_index, d.bit_index
FROM fault_event_definitions d
INNER JOIN fault_event_current_state s ON d.id = s.definition_id
WHERE s.is_active = true AND d.enabled = true AND d.is_reserved = false;

-- View para estatísticas por setor
CREATE OR REPLACE VIEW v_sector_statistics AS
SELECT 
    d.sector,
    d.type,
    COUNT(*) as total_definitions,
    COUNT(CASE WHEN s.is_active THEN 1 END) as currently_active,
    COALESCE(SUM(s.activation_count), 0) as total_activations,
    COALESCE(AVG(
        CASE WHEN s.is_active THEN 
            EXTRACT(EPOCH FROM (NOW() - s.activated_at))
        END
    ), 0) as avg_duration_seconds
FROM fault_event_definitions d
LEFT JOIN fault_event_current_state s ON d.id = s.definition_id
WHERE d.enabled = true
GROUP BY d.sector, d.type;

-- ===============================================================================
-- FUNÇÕES ÚTEIS
-- ===============================================================================

-- Função para inserir evento (com verificação de duplicação)
CREATE OR REPLACE FUNCTION insert_fault_event(
    p_definition_id INTEGER,
    p_action event_action,
    p_timestamp TIMESTAMP DEFAULT NOW(),
    p_plc_context TEXT DEFAULT NULL,
    p_session_id UUID DEFAULT NULL,
    p_sequence_number BIGINT DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
    v_event_id BIGINT;
    v_session_id UUID;
BEGIN
    -- Usar sessão ativa se não especificada
    IF p_session_id IS NULL THEN
        SELECT id INTO v_session_id 
        FROM collection_sessions 
        WHERE status = 'ACTIVE' 
        ORDER BY started_at DESC 
        LIMIT 1;
    ELSE
        v_session_id := p_session_id;
    END IF;
    
    -- Inserir no histórico
    INSERT INTO fault_event_history (
        definition_id, action, timestamp, plc_context, session_id, sequence_number
    ) VALUES (
        p_definition_id, p_action, p_timestamp, 
        COALESCE(p_plc_context::JSONB, '{}'::JSONB), 
        v_session_id, COALESCE(p_sequence_number, 1)
    ) RETURNING id INTO v_event_id;
    
    -- Atualizar estado atual
    INSERT INTO fault_event_current_state (
        definition_id, is_active, last_action, 
        activated_at, deactivated_at, last_updated, activation_count
    ) VALUES (
        p_definition_id, 
        (p_action = 'ACTIVATED'),
        p_action,
        CASE WHEN p_action = 'ACTIVATED' THEN p_timestamp END,
        CASE WHEN p_action = 'DEACTIVATED' THEN p_timestamp END,
        p_timestamp,
        CASE WHEN p_action = 'ACTIVATED' THEN 1 ELSE 0 END
    )
    ON CONFLICT (definition_id) DO UPDATE SET
        is_active = (p_action = 'ACTIVATED'),
        last_action = p_action,
        activated_at = CASE 
            WHEN p_action = 'ACTIVATED' THEN p_timestamp 
            ELSE fault_event_current_state.activated_at 
        END,
        deactivated_at = CASE 
            WHEN p_action = 'DEACTIVATED' THEN p_timestamp 
            ELSE fault_event_current_state.deactivated_at 
        END,
        last_updated = p_timestamp,
        activation_count = CASE 
            WHEN p_action = 'ACTIVATED' THEN fault_event_current_state.activation_count + 1
            ELSE fault_event_current_state.activation_count
        END;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar definição por word/bit
CREATE OR REPLACE FUNCTION get_definition_by_word_bit(
    p_word_index INTEGER,
    p_bit_index INTEGER
) RETURNS fault_event_definitions AS $$
DECLARE
    result fault_event_definitions;
BEGIN
    SELECT * INTO result
    FROM fault_event_definitions
    WHERE word_index = p_word_index AND bit_index = p_bit_index
    AND enabled = true;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ===============================================================================
-- VERIFICAÇÕES FINAIS
-- ===============================================================================
SELECT 'Estrutura de tabelas criada com sucesso!' as status;
SELECT 'Total de tabelas:', COUNT(*) as total FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'fault_%' OR table_name LIKE 'collection_%';