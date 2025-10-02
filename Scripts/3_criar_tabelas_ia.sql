-- ===============================================================================
-- SCRIPT 3: CRIAR ESTRUTURA DE TABELAS PARA SISTEMA DE IA
-- Execute este script após os scripts 1 e 2
-- ===============================================================================

-- Conectar no banco eclusa_hmi (execute: \c eclusa_hmi)

-- ===============================================================================
-- TABELA: BASE DE CONHECIMENTO
-- ===============================================================================
CREATE TABLE IF NOT EXISTS knowledge_base_entries (
    id VARCHAR(100) PRIMARY KEY,
    type VARCHAR(20) NOT NULL, -- RULE, PATTERN, SOLUTION, FAQ
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    keywords JSONB DEFAULT '[]'::JSONB, -- Array de palavras-chave
    conditions JSONB DEFAULT '[]'::JSONB, -- Array de condições
    actions JSONB DEFAULT '[]'::JSONB, -- Array de ações sugeridas
    confidence DECIMAL(3,2) DEFAULT 0.8,
    priority INTEGER DEFAULT 5,
    equipment JSONB DEFAULT '[]'::JSONB, -- Array de equipamentos relacionados
    context JSONB DEFAULT '{}'::JSONB, -- Contexto adicional
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(3,2) DEFAULT 0.0,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance na base de conhecimento
CREATE INDEX IF NOT EXISTS idx_knowledge_type ON knowledge_base_entries (type) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_knowledge_keywords ON knowledge_base_entries USING GIN (keywords);
CREATE INDEX IF NOT EXISTS idx_knowledge_equipment ON knowledge_base_entries USING GIN (equipment);
CREATE INDEX IF NOT EXISTS idx_knowledge_priority ON knowledge_base_entries (priority, confidence DESC) WHERE enabled = true;

-- ===============================================================================
-- TABELA: HISTÓRICO DE DIAGNÓSTICOS
-- ===============================================================================
CREATE TABLE IF NOT EXISTS diagnostic_history (
    id BIGSERIAL PRIMARY KEY,
    diagnostic_id VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- current_faults, root_cause, pattern_detection, etc.
    input_data JSONB NOT NULL, -- Dados de entrada da requisição
    output_data JSONB NOT NULL, -- Resultado do diagnóstico
    confidence DECIMAL(3,2) NOT NULL,
    process_time_ms INTEGER NOT NULL,
    user_id VARCHAR(100),
    session_id VARCHAR(100),
    equipment VARCHAR(100),
    severity VARCHAR(20),
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para histórico de diagnósticos
CREATE INDEX IF NOT EXISTS idx_diagnostic_history_type ON diagnostic_history (type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnostic_history_user ON diagnostic_history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnostic_history_equipment ON diagnostic_history (equipment, created_at DESC) WHERE equipment IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_diagnostic_history_session ON diagnostic_history (session_id, created_at DESC) WHERE session_id IS NOT NULL;

-- ===============================================================================
-- TABELA: SESSÕES DE CHAT
-- ===============================================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    title VARCHAR(200),
    context JSONB DEFAULT '{}'::JSONB, -- Contexto do PLC e outras informações
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===============================================================================
-- TABELA: MENSAGENS DE CHAT
-- ===============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- USER, ASSISTANT, SYSTEM
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'TEXT', -- TEXT, DIAGNOSTIC, SUGGESTION, ERROR
    context JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para chat
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages (session_id, created_at ASC);

-- ===============================================================================
-- TABELA: PADRÕES DETECTADOS
-- ===============================================================================
CREATE TABLE IF NOT EXISTS detected_patterns (
    id VARCHAR(100) PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- FREQUENCY, TIME_HOURLY, TIME_WEEKLY, SEQUENCE, CORRELATION
    description TEXT NOT NULL,
    frequency VARCHAR(100),
    confidence DECIMAL(3,2) NOT NULL,
    first_seen TIMESTAMP NOT NULL,
    last_seen TIMESTAMP NOT NULL,
    occurrences INTEGER NOT NULL,
    equipment VARCHAR(100),
    severity VARCHAR(20),
    pattern_data JSONB DEFAULT '{}'::JSONB, -- Dados específicos do padrão
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para padrões detectados
CREATE INDEX IF NOT EXISTS idx_patterns_type ON detected_patterns (type, confidence DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_patterns_equipment ON detected_patterns (equipment, last_seen DESC) WHERE equipment IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patterns_last_seen ON detected_patterns (last_seen DESC) WHERE is_active = true;

-- ===============================================================================
-- TABELA: REGRAS DE DIAGNÓSTICO
-- ===============================================================================
CREATE TABLE IF NOT EXISTS diagnostic_rules (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    conditions JSONB NOT NULL, -- Array de condições
    actions JSONB NOT NULL, -- Array de ações
    priority INTEGER DEFAULT 5,
    enabled BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para regras
CREATE INDEX IF NOT EXISTS idx_rules_priority ON diagnostic_rules (priority, enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_rules_success_rate ON diagnostic_rules ((success_count::DECIMAL / GREATEST(usage_count, 1))) WHERE enabled = true;

-- ===============================================================================
-- TABELA: FEEDBACK DE DIAGNÓSTICOS
-- ===============================================================================
CREATE TABLE IF NOT EXISTS diagnostic_feedback (
    id BIGSERIAL PRIMARY KEY,
    diagnostic_history_id BIGINT REFERENCES diagnostic_history(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5), -- 1-5 estrelas
    was_helpful BOOLEAN,
    was_accurate BOOLEAN,
    comments TEXT,
    suggested_improvement TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para feedback
CREATE INDEX IF NOT EXISTS idx_feedback_diagnostic ON diagnostic_feedback (diagnostic_history_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON diagnostic_feedback (user_id, created_at DESC);

-- ===============================================================================
-- VIEWS ÚTEIS PARA O SISTEMA DE IA
-- ===============================================================================

-- View para estatísticas de diagnósticos
CREATE OR REPLACE VIEW v_diagnostic_statistics AS
SELECT 
    type,
    COUNT(*) as total_diagnostics,
    AVG(confidence) as avg_confidence,
    AVG(process_time_ms) as avg_process_time_ms,
    COUNT(*) FILTER (WHERE success = true) as successful_count,
    COUNT(*) FILTER (WHERE success = false) as failed_count,
    (COUNT(*) FILTER (WHERE success = true)::DECIMAL / COUNT(*)) * 100 as success_rate
FROM diagnostic_history
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY type;

-- View para padrões mais relevantes
CREATE OR REPLACE VIEW v_top_patterns AS
SELECT 
    id, type, description, confidence, occurrences,
    last_seen, equipment,
    EXTRACT(DAYS FROM (NOW() - last_seen)) as days_since_last_seen
FROM detected_patterns
WHERE is_active = true
ORDER BY confidence DESC, occurrences DESC, last_seen DESC
LIMIT 20;

-- View para base de conhecimento mais utilizada
CREATE OR REPLACE VIEW v_top_knowledge_entries AS
SELECT 
    id, type, title, usage_count, success_rate, confidence,
    (usage_count * success_rate * confidence) as relevance_score
FROM knowledge_base_entries
WHERE enabled = true
ORDER BY relevance_score DESC, usage_count DESC
LIMIT 50;

-- View para sessões de chat ativas
CREATE OR REPLACE VIEW v_active_chat_sessions AS
SELECT 
    cs.id, cs.user_id, cs.title, cs.created_at, cs.updated_at,
    COUNT(cm.id) as message_count,
    MAX(cm.created_at) as last_message_at
FROM chat_sessions cs
LEFT JOIN chat_messages cm ON cs.id = cm.session_id
WHERE cs.is_active = true
GROUP BY cs.id, cs.user_id, cs.title, cs.created_at, cs.updated_at
ORDER BY last_message_at DESC NULLS LAST;

-- ===============================================================================
-- FUNÇÕES ÚTEIS
-- ===============================================================================

-- Função para registrar uso de entrada da base de conhecimento
CREATE OR REPLACE FUNCTION record_knowledge_usage(
    p_entry_id VARCHAR(100),
    p_was_successful BOOLEAN DEFAULT true
) RETURNS VOID AS $$
BEGIN
    UPDATE knowledge_base_entries
    SET 
        usage_count = usage_count + 1,
        success_rate = CASE 
            WHEN usage_count = 0 THEN 
                CASE WHEN p_was_successful THEN 1.0 ELSE 0.0 END
            ELSE 
                ((success_rate * usage_count) + CASE WHEN p_was_successful THEN 1 ELSE 0 END) / (usage_count + 1)
        END,
        updated_at = NOW()
    WHERE id = p_entry_id;
END;
$$ LANGUAGE plpgsql;

-- Função para registrar execução de regra
CREATE OR REPLACE FUNCTION record_rule_execution(
    p_rule_id VARCHAR(100),
    p_was_successful BOOLEAN DEFAULT true
) RETURNS VOID AS $$
BEGIN
    UPDATE diagnostic_rules
    SET 
        usage_count = usage_count + 1,
        success_count = success_count + CASE WHEN p_was_successful THEN 1 ELSE 0 END,
        updated_at = NOW()
    WHERE id = p_rule_id;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar dados antigos
CREATE OR REPLACE FUNCTION cleanup_old_data(
    p_days_to_keep INTEGER DEFAULT 90
) RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER := 0;
BEGIN
    -- Limpar histórico de diagnósticos antigos
    DELETE FROM diagnostic_history 
    WHERE created_at < NOW() - (p_days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- Limpar padrões antigos inativos
    DELETE FROM detected_patterns 
    WHERE is_active = false 
    AND updated_at < NOW() - (p_days_to_keep || ' days')::INTERVAL;
    
    -- Limpar sessões de chat antigas inativas
    DELETE FROM chat_sessions 
    WHERE is_active = false 
    AND updated_at < NOW() - (p_days_to_keep || ' days')::INTERVAL;
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ===============================================================================
-- DADOS INICIAIS - EXEMPLOS DE BASE DE CONHECIMENTO
-- ===============================================================================

-- Inserir algumas entradas de exemplo na base de conhecimento
INSERT INTO knowledge_base_entries (id, type, title, description, keywords, equipment, confidence, priority) VALUES
('KB_POWER_001', 'FAQ', 'Como resolver falhas de alimentação?', 'Procedimento padrão para diagnóstico e solução de falhas de alimentação elétrica', '["alimentação", "energia", "220VDC", "400VAC", "fonte"]', '["AL_EnchimentoRG", "AL_Esvaziamento", "AL_PortaJusante", "AL_PortaMontante"]', 0.95, 1),
('KB_COMM_001', 'FAQ', 'Como resolver falhas de comunicação?', 'Procedimento para diagnóstico de problemas de rede e comunicação entre equipamentos', '["comunicação", "rede", "TCP", "conexão", "cabo"]', '["AL_SalaDeComando"]', 0.90, 2),
('KB_EMERGENCY_001', 'SOLUTION', 'Procedimento de Emergência', 'Passos para lidar com situações de emergência no sistema', '["emergência", "parada", "segurança", "isolamento"]', '[]', 0.98, 1),
('KB_PATTERN_CASCADE', 'PATTERN', 'Falhas em Cascata', 'Padrão de falhas que se propagam sequencialmente', '["cascata", "sequência", "propagação", "múltiplas"]', '[]', 0.85, 2);

-- ===============================================================================
-- VERIFICAÇÕES FINAIS
-- ===============================================================================
SELECT 'Estrutura de IA criada com sucesso!' as status;
SELECT 'Total de tabelas de IA:', COUNT(*) as total 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%knowledge%' OR table_name LIKE '%diagnostic%' OR table_name LIKE '%chat%' OR table_name LIKE '%pattern%');

SELECT 'Entradas de conhecimento iniciais:', COUNT(*) as total FROM knowledge_base_entries;