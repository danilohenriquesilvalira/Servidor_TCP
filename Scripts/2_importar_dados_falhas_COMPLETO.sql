-- ===============================================================================
-- SCRIPT 2: IMPORTAR TODOS OS 709 DADOS DAS FALHAS E EVENTOS
-- Importa TODOS os 709 itens do arquivo Falhas_Eventos.txt
-- Execute este script no SQL Shell após executar o script 1
-- ===============================================================================

-- Limpar dados existentes se houver
TRUNCATE TABLE fault_event_history CASCADE;
TRUNCATE TABLE fault_event_current_state CASCADE;  
TRUNCATE TABLE fault_event_definitions CASCADE;
TRUNCATE TABLE collection_sessions CASCADE;

-- Reiniciar sequences
ALTER SEQUENCE fault_event_definitions_id_seq RESTART WITH 1;
ALTER SEQUENCE fault_event_history_id_seq RESTART WITH 1;

-- Função para processar linha do arquivo
CREATE OR REPLACE FUNCTION import_fault_line(
    p_line_number INTEGER,
    p_bit_index INTEGER,
    p_prefix TEXT,
    p_title TEXT
) RETURNS INTEGER AS $$
DECLARE
    v_word_index INTEGER;
    v_type fault_event_type;
    v_sector VARCHAR(50);
    v_severity severity_level;
    v_priority INTEGER;
    v_is_reserved BOOLEAN;
    v_has_parameters BOOLEAN;
    v_code VARCHAR(100);
    v_clean_title TEXT;
    v_debounce_ms INTEGER;
    v_id INTEGER;
BEGIN
    -- Calcular word index (inicia em 17)
    v_word_index := 17 + ((p_line_number - 1) / 16);
    
    -- Determinar tipo e setor
    IF p_prefix LIKE 'AL_%' THEN
        v_type := 'AL';
        v_sector := CASE 
            WHEN p_prefix LIKE '%EnchimentoRG%' OR p_prefix LIKE '%Enchimento%' THEN 'ENCHIMENTO'
            WHEN p_prefix LIKE '%Esvaziamento%' THEN 'ESVAZIAMENTO'
            WHEN p_prefix LIKE '%PortaJusante%' THEN 'PORTA_JUSANTE'
            WHEN p_prefix LIKE '%PortaMontante%' THEN 'PORTA_MONTANTE'
            WHEN p_prefix LIKE '%SalaDeComando%' THEN 'SALA_COMANDO'
            WHEN p_prefix LIKE '%EsgotoDrenagem%' THEN 'ESGOTO_DRENAGEM'
            ELSE 'OUTROS'
        END;
    ELSE
        v_type := 'EV';
        v_sector := CASE 
            WHEN p_prefix LIKE '%Enchimento%' THEN 'ENCHIMENTO'
            WHEN p_prefix LIKE '%Esvaziamento%' THEN 'ESVAZIAMENTO'
            WHEN p_prefix LIKE '%PortaJusante%' THEN 'PORTA_JUSANTE'
            WHEN p_prefix LIKE '%PortaMontante%' THEN 'PORTA_MONTANTE'
            WHEN p_prefix LIKE '%SalaDeComando%' THEN 'SALA_COMANDO'
            WHEN p_prefix LIKE '%EsgotoDrenagem%' THEN 'ESGOTO_DRENAGEM'
            ELSE 'OUTROS'
        END;
    END IF;
    
    -- Verificar se é reservado
    v_is_reserved := p_title ~* '^(XXXX|XXX|RESERVA|X|x)$';
    
    -- Verificar se tem parâmetros
    v_has_parameters := p_title ~ '@\d+%[sd]@|<field ref';
    
    -- Limpar título (escapar aspas simples)
    v_clean_title := trim(regexp_replace(
        regexp_replace(p_title, '@\d+%[sd]@', '', 'g'),
        '<field ref="?\d+"?\s*/?>', '', 'g'
    ));
    
    -- Determinar severidade
    IF v_type = 'AL' THEN
        IF p_title ~* 'EMERGÊNCIA|INUNDAÇÃO|CRITICO|CRÍTICO|STOP|PARAGEM' THEN
            v_severity := 'CRITICAL';
            v_priority := 10;
            v_debounce_ms := 500;
        ELSIF p_title ~* 'DEFEITO|DISPARO|FALHA|ERRO|AVARIA|PROTEÇÃO|FALTA' THEN
            v_severity := 'HIGH';
            v_priority := 8;
            v_debounce_ms := 1000;
        ELSIF p_title ~* 'ALARME|VELOCIDADE|POSIÇÃO|NÍVEL|NIVEL' THEN
            v_severity := 'MEDIUM';
            v_priority := 5;
            v_debounce_ms := 2000;
        ELSE
            v_severity := 'LOW';
            v_priority := 3;
            v_debounce_ms := 2000;
        END IF;
    ELSE
        v_severity := 'INFO';
        v_priority := 2;
        v_debounce_ms := 1000;
    END IF;
    
    -- Ajustar prioridade para reservados
    IF v_is_reserved THEN
        v_priority := 1;
        v_debounce_ms := 5000;
    END IF;
    
    -- Gerar código único
    v_code := v_type || '_' || v_sector || '_W' || v_word_index || '_B' || p_bit_index;
    
    -- Inserir definição
    INSERT INTO fault_event_definitions (
        line_number, code, word_index, bit_index, type, sector, location,
        title, clean_title, is_reserved, has_parameters, severity, priority,
        debounce_ms, enabled
    ) VALUES (
        p_line_number, v_code, v_word_index, p_bit_index, v_type, v_sector, 'RG',
        p_title, v_clean_title, v_is_reserved, v_has_parameters, v_severity, v_priority,
        v_debounce_ms, NOT v_is_reserved
    ) RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- ===============================================================================
-- IMPORTAÇÃO DOS 709 ITENS COMPLETOS
-- ===============================================================================

-- ENCHIMENTO RG - ALARMES (Word 17-20) - Linhas 1-64
SELECT import_fault_line(1, 0, 'AL_EnchimentoRG', 'DISPARO PROTEÇÃO 24VDC ENTRADAS ANALÓGICAS');
SELECT import_fault_line(2, 1, 'AL_EnchimentoRG', 'DISPARO PROTEÇÃO DESCARREGADAOR SOBRETENSÕES');
SELECT import_fault_line(3, 2, 'AL_EnchimentoRG', 'DEFEITO DESCARREGADOR SOBRETENSÕES');
SELECT import_fault_line(4, 3, 'AL_EnchimentoRG', 'DISPARO PROTEÇÃO ALIM. ANALISADOR ENERGIA');
SELECT import_fault_line(5, 4, 'AL_EnchimentoRG', 'FALTA ALIMENTAÇÃO 220 VDC');
SELECT import_fault_line(6, 5, 'AL_EnchimentoRG', 'FALHA COMUNICAÇÃO COM SALA DE COMANDO');
SELECT import_fault_line(7, 6, 'AL_EnchimentoRG', 'BY-PASS CONDIÇOES REMOTAS ABERTURA COMPORTAS ATIVADO!!!!!');
SELECT import_fault_line(8, 7, 'AL_EnchimentoRG', 'XXXXX');
SELECT import_fault_line(9, 8, 'AL_EnchimentoRG', 'EMERGÊNCIA ATIVADA');
SELECT import_fault_line(10, 9, 'AL_EnchimentoRG', 'DEFEITO/ALARME FONTE ALIMENTAÇÃO 400VAC/24VDC');
SELECT import_fault_line(11, 10, 'AL_EnchimentoRG', 'DEFEITO/ALARME FONTE ALIMENTAÇÃO 220VDC/24VDC');
SELECT import_fault_line(12, 11, 'AL_EnchimentoRG', 'DISPARO INTERRUPTOR GERAL ALIMENTAÇÃO 3X400VAC');
SELECT import_fault_line(13, 12, 'AL_EnchimentoRG', 'FALTA ALIMENTAÇÃO FORÇA MOTRIZ 3X400VAC');
SELECT import_fault_line(14, 13, 'AL_EnchimentoRG', 'DISPARO PROTEÇÃO 24VDC ENTRADAS DIGITAIS');
SELECT import_fault_line(15, 14, 'AL_EnchimentoRG', 'DISPARO PROTEÇÃO 24VDC SAIDAS DIGITAIS');
SELECT import_fault_line(16, 15, 'AL_EnchimentoRG', 'DISPARO PROTEÇÃO 24VDC QUADRO FORÇA MOTRIZ');
SELECT import_fault_line(17, 0, 'AL_EnchimentoRG', 'XXXX');
SELECT import_fault_line(18, 1, 'AL_EnchimentoRG', 'XXXX');
SELECT import_fault_line(19, 2, 'AL_EnchimentoRG', 'XXXX');
SELECT import_fault_line(20, 3, 'AL_EnchimentoRG', 'XXXX');
SELECT import_fault_line(21, 4, 'AL_EnchimentoRG', 'DEFEITO AUTOMATO ERRO DIAGNOSTICO');
SELECT import_fault_line(22, 5, 'AL_EnchimentoRG', 'DEFEITO AUTOMATO ERRO PROGRAMA');
SELECT import_fault_line(23, 6, 'AL_EnchimentoRG', 'DEFEITO AUTOMATO ERRO MODULOS');
SELECT import_fault_line(24, 7, 'AL_EnchimentoRG', 'DEFEITO AUTOMATO ERRO BASTIDOR');
SELECT import_fault_line(25, 8, 'AL_EnchimentoRG', 'DEFEITO RESPOSTA DE MARCHA BOMBA A COMPORTA DIREITA');
SELECT import_fault_line(26, 9, 'AL_EnchimentoRG', 'DEFEITO ARRANCADOR SUAVE BOMBA A COMPORTA DIREITA');
SELECT import_fault_line(27, 10, 'AL_EnchimentoRG', 'DISPARO PROTEÇÃO BOMBA A COMPORTA DIREITA');
SELECT import_fault_line(28, 11, 'AL_EnchimentoRG', 'DISPARO PROTEÇÃO VALVULA DISTRIBUIÇÃO COMPORTA DIREITA');
SELECT import_fault_line(29, 12, 'AL_EnchimentoRG', 'DISPARO PROTEÇÃO VALVULA DESCIDA COMPORTA DIREITA');
SELECT import_fault_line(30, 13, 'AL_EnchimentoRG', 'DEFEITO MEDIDA DE POSIÇÃO COMPORTA DIREITA');
SELECT import_fault_line(31, 14, 'AL_EnchimentoRG', 'XXXX');
SELECT import_fault_line(32, 15, 'AL_EnchimentoRG', 'XXXX');
SELECT import_fault_line(33, 0, 'AL_EnchimentoRG', 'XXXX');
SELECT import_fault_line(34, 1, 'AL_EnchimentoRG', 'XXXX');
SELECT import_fault_line(35, 2, 'AL_EnchimentoRG', 'XXXX');
SELECT import_fault_line(36, 3, 'AL_EnchimentoRG', 'XXXX');
SELECT import_fault_line(37, 4, 'AL_EnchimentoRG', 'XXXX');
SELECT import_fault_line(38, 5, 'AL_EnchimentoRG', 'XXXX');
SELECT import_fault_line(39, 6, 'AL_EnchimentoRG', 'XXXX');
SELECT import_fault_line(40, 7, 'AL_EnchimentoRG', 'XXXX');
SELECT import_fault_line(41, 8, 'AL_EnchimentoRG', 'DEFEITO RESPOSTA DE MARCHA BOMBA B COMPORTA ESQUERDA');
SELECT import_fault_line(42, 9, 'AL_EnchimentoRG', 'DEFEITO ARRANCADOR SUAVE BOMBA B COMPORTA ESQUERDA');
SELECT import_fault_line(43, 10, 'AL_EnchimentoRG', 'DISPARO PROTEÇÃO BOMBA B COMPORTA ESQUERDA');
SELECT import_fault_line(44, 11, 'AL_EnchimentoRG', 'DISPARO PROTEÇÃO VALVULA DISTRIBUIÇÃO COMPORTA ESQUERDA');
SELECT import_fault_line(45, 12, 'AL_EnchimentoRG', 'DISPARO PROTEÇÃO VALVULA DESCIDA COMPORTA ESQUERDA');
SELECT import_fault_line(46, 13, 'AL_EnchimentoRG', 'DEFEITO MEDIDA DE POSIÇÃO COMPORTA ESQUERDA');
SELECT import_fault_line(47, 14, 'AL_EnchimentoRG', 'XXXX');
SELECT import_fault_line(48, 15, 'AL_EnchimentoRG', 'XXXX');
SELECT import_fault_line(49, 0, 'AL_EnchimentoRG', 'VELOCIDADE ALTA 2º PATAMAR ABERTURA RAPIDA COMPORTA B_ESQUERDA @1%d@  mts/m');
SELECT import_fault_line(50, 1, 'AL_EnchimentoRG', 'VELOCIDADE BAIXA 2º PATAMAR ABERTURA RAPIDA COMPORTA B_ESQUERDA  @1%d@ mts/m');
SELECT import_fault_line(51, 2, 'AL_EnchimentoRG', 'VELOCIDADE ALTA FECHO COMPORTA B_ESQUERDA  @1%d@ mts/m');
SELECT import_fault_line(52, 3, 'AL_EnchimentoRG', 'VELOCIDADE BAIXA FECHO COMPORTA B_ESQUERDA @1%d@  mts/m');
SELECT import_fault_line(53, 4, 'AL_EnchimentoRG', 'VELOCIDADE BAIXA FECHO COMPORTA B_ESQUERDA @1%d@  mts/m');
SELECT import_fault_line(54, 5, 'AL_EnchimentoRG', 'VELOCIDADE BAIXA FECHO COMPORTA B_ESQUERDA @1%d@ mts/m');
SELECT import_fault_line(55, 6, 'AL_EnchimentoRG', 'VELOCIDADE BAIXA FECHO COMPORTA B_ESQUERDA  @1%d@ mts/m');
SELECT import_fault_line(56, 7, 'AL_EnchimentoRG', 'VELOCIDADE BAIXA FECHO COMPORTA B_ESQUERDA @1%d@  mts/m');
SELECT import_fault_line(57, 8, 'AL_EnchimentoRG', 'VELOCIDADE ALTA 1º PATAMAR ABERTURA LENTA COMPORTA A DIREITA  @1%d@  mts/m');
SELECT import_fault_line(58, 9, 'AL_EnchimentoRG', 'VELOCIDADE BAIXA 1º PATAMAR ABERTURA LENTA COMPORTA A DIREITA @1%d@ mts/m');
SELECT import_fault_line(59, 10, 'AL_EnchimentoRG', 'VELOCIDADE ALTA 2º PATAMAR ABERTURA RAPIDA COMPORTA A DIREITA @1%d@  mts/m');
SELECT import_fault_line(60, 11, 'AL_EnchimentoRG', 'VELOCIDADE BAIXA 2º PATAMAR ABERTURA RAPIDA COMPORTA A DIREITA @1%d@ mts/m');
SELECT import_fault_line(61, 12, 'AL_EnchimentoRG', 'VELOCIDADE ALTA FECHO COMPORTA A DIREITA @1%d@  mts/m');
SELECT import_fault_line(62, 13, 'AL_EnchimentoRG', 'VELOCIDADE BAIXA FECHO COMPORTA A DIREITA  @1%d@ mts/m');
SELECT import_fault_line(63, 14, 'AL_EnchimentoRG', 'VELOCIDADE ALTA 1º PATAMAR ABERTURA LENTA COMPORTA B_ESQUERDA @1%d@   mts/m');
SELECT import_fault_line(64, 15, 'AL_EnchimentoRG', 'VELOCIDADE BAIXA 1º PATAMAR ABERTURA LENTA COMPORTA B_ESQUERDA @1%d@  mts/m');

-- ENCHIMENTO - EVENTOS (Linhas 65-112)
SELECT import_fault_line(65, 0, 'EV_Enchimento', 'ORDEM LOCAL FECHO COMPORTAS');
SELECT import_fault_line(66, 1, 'EV_Enchimento', 'ORDEM LOCAL PARAGEM COMPORTAS');
SELECT import_fault_line(67, 2, 'EV_Enchimento', 'CONDIÇÃO PORTA JUSANTE FECHADA PRESENTE');
SELECT import_fault_line(68, 3, 'EV_Enchimento', 'CONDIÇÃO CIRCUITO ESVAZIAMENTO FECHADO PRESENTE');
SELECT import_fault_line(69, 4, 'EV_Enchimento', 'COMPORTA A DIREITA ABERTA    TEMPO ABERT. @1%d@ seg');
SELECT import_fault_line(70, 5, 'EV_Enchimento', 'COMPORTA A DIREITA NA POSIÇÃO DE ESTABILIZAÇÃO  TEMPO ABERT.  @1%d@ seg');
SELECT import_fault_line(71, 6, 'EV_Enchimento', 'COMPORTA A DIREITA FECHADA   TEMPO FECHO  @1%d@ seg');
SELECT import_fault_line(72, 7, 'EV_Enchimento', 'COMPORTA B ESQUERDA ABERTA    TEMPO ABERT. @1%d@ seg');
SELECT import_fault_line(73, 8, 'EV_Enchimento', 'BOTÃO ACEITAÇÃO DE AVARIAS PREMIDO');
SELECT import_fault_line(74, 9, 'EV_Enchimento', 'SISTEMA EM MANUAL');
SELECT import_fault_line(75, 10, 'EV_Enchimento', 'SISTEMA EM AUTOMATICO');
SELECT import_fault_line(76, 11, 'EV_Enchimento', 'SISTEMA DESLIGADO');
SELECT import_fault_line(77, 12, 'EV_Enchimento', 'ORDEM REMOTA ABERTURA COMPORTAS');
SELECT import_fault_line(78, 13, 'EV_Enchimento', 'ORDEM REMOTA FECHO COMPORTAS');
SELECT import_fault_line(79, 14, 'EV_Enchimento', 'ORDEM REMOTA DE PARAGEM COMPORTAS');
SELECT import_fault_line(80, 15, 'EV_Enchimento', 'ORDEM LOCAL ABERTURA COMPORTAS');
SELECT import_fault_line(81, 0, 'EV_Enchimento', 'COMPORTA A DIREITA SELECIONADA REMOTO');
SELECT import_fault_line(82, 1, 'EV_Enchimento', 'COMPORTA B ESQUERDA SELECIONADA REMOTO');
SELECT import_fault_line(83, 2, 'EV_Enchimento', 'COMPORTA A DIREITA A ABRIR - AUTOMATICO');
SELECT import_fault_line(84, 3, 'EV_Enchimento', 'COMPORTA B ESQUERDA A ABRIR - AUTOMATICO');
SELECT import_fault_line(85, 4, 'EV_Enchimento', 'COMPORTA A DIREITA A ABRIR SUBIDA RAPIDA - AUTOMATICO');
SELECT import_fault_line(86, 5, 'EV_Enchimento', 'COMPORTA B ESQUERDA A ABRIR SUBIDA RAPIDA - AUTOMATICO');
SELECT import_fault_line(87, 6, 'EV_Enchimento', 'COMPORTA A DIREITA A FECHAR - AUTOMATICO');
SELECT import_fault_line(88, 7, 'EV_Enchimento', 'COMPORTA B ESQUERDA A FECHAR - AUTOMATICO');
SELECT import_fault_line(89, 8, 'EV_Enchimento', 'COMPORTA B ESQUERDA NA POSIÇÃO DE ESTABILIZAÇÃO  TEMPO ABERT. <field ref="0" />seg');
SELECT import_fault_line(90, 9, 'EV_Enchimento', 'COMPORTA B ESQUERDA FECHADA   TEMPO FECHO <field ref="0" />seg');
SELECT import_fault_line(91, 10, 'EV_Enchimento', 'BOMBA OLEO COMPORTA A DIREITA LIGADA');
SELECT import_fault_line(92, 11, 'EV_Enchimento', 'BOMBA OLEO COMPORTA B ESQUERDA LIGADA');
SELECT import_fault_line(93, 12, 'EV_Enchimento', 'COMPORTA A DIREITA A FECHAR');
SELECT import_fault_line(94, 13, 'EV_Enchimento', 'COMPORTA B ESQUERDA A FECHAR');
SELECT import_fault_line(95, 14, 'EV_Enchimento', 'COMPORTA A DIREITA SELECIONADA LOCAL');
SELECT import_fault_line(96, 15, 'EV_Enchimento', 'COMPORTA B ESQUERDA SELECIONADA LOCAL');
SELECT import_fault_line(97, 0, 'EV_Enchimento', 'RESERVA');
SELECT import_fault_line(98, 1, 'EV_Enchimento', 'RESERVA');
SELECT import_fault_line(99, 2, 'EV_Enchimento', 'RESERVA');
SELECT import_fault_line(100, 3, 'EV_Enchimento', 'RESERVA');
SELECT import_fault_line(101, 4, 'EV_Enchimento', 'RESERVA');
SELECT import_fault_line(102, 5, 'EV_Enchimento', 'RESERVA');
SELECT import_fault_line(103, 6, 'EV_Enchimento', 'RESERVA');
SELECT import_fault_line(104, 7, 'EV_Enchimento', 'RESERVA');
SELECT import_fault_line(105, 8, 'EV_Enchimento', 'COMPORTAS EM PROGRAMA DE LIMPEZA PORTA JUSANTE');
SELECT import_fault_line(106, 9, 'EV_Enchimento', 'COMPORTA A DIREITA FORA DE SERVIÇO');
SELECT import_fault_line(107, 10, 'EV_Enchimento', 'COMPORTA B ESQUERDA FORA DE SERVIÇO');
SELECT import_fault_line(108, 11, 'EV_Enchimento', 'RESERVA');
SELECT import_fault_line(109, 12, 'EV_Enchimento', 'RESERVA');
SELECT import_fault_line(110, 13, 'EV_Enchimento', 'RESERVA');
SELECT import_fault_line(111, 14, 'EV_Enchimento', 'RESERVA');
SELECT import_fault_line(112, 15, 'EV_Enchimento', 'RESERVA');

-- ESVAZIAMENTO - ALARMES (Linhas 113-172)
SELECT import_fault_line(113, 0, 'AL_Esvaziamento', 'DISPARO PROTEÇÃO 24VDC ENTRADAS ANALÓGICAS');
SELECT import_fault_line(114, 1, 'AL_Esvaziamento', 'DISPARO PROTEÇÃO DESCARREGADAOR SOBRETENSÕES');
SELECT import_fault_line(115, 2, 'AL_Esvaziamento', 'DEFEITO DESCARREGADOR SOBRETENSÕES');
SELECT import_fault_line(116, 3, 'AL_Esvaziamento', 'DISPARO PROTEÇÃO ALIM. ANALISADOR ENERGIA');
SELECT import_fault_line(117, 4, 'AL_Esvaziamento', 'FALTA ALIMENTAÇÃO 220 VDC');
SELECT import_fault_line(118, 5, 'AL_Esvaziamento', 'FALHA COMUNICAÇÃO COM SALA DE COMANDO');
SELECT import_fault_line(119, 6, 'AL_Esvaziamento', 'BY-PASS CONDIÇOES REMOTAS ABERTURA COMPORTAS ATIVADO!!!!!');
SELECT import_fault_line(120, 7, 'AL_Esvaziamento', 'XXXXX');
SELECT import_fault_line(121, 8, 'AL_Esvaziamento', 'EMERGÊNCIA ATIVADA');
SELECT import_fault_line(122, 9, 'AL_Esvaziamento', 'DEFEITO/ALARME FONTE ALIMENTAÇÃO 400VAC/24VDC');
SELECT import_fault_line(123, 10, 'AL_Esvaziamento', 'DEFEITO/ALARME FONTE ALIMENTAÇÃO 220VDC/24VDC');
SELECT import_fault_line(124, 11, 'AL_Esvaziamento', 'DISPARO INTERRUPTOR GERAL ALIMENTAÇÃO 3X400VAC');
SELECT import_fault_line(125, 12, 'AL_Esvaziamento', 'FALTA ALIMENTAÇÃO FORÇA MOTRIZ 3X400VAC');
SELECT import_fault_line(126, 13, 'AL_Esvaziamento', 'DISPARO PROTEÇÃO 24VDC ENTRADAS DIGITAIS');
SELECT import_fault_line(127, 14, 'AL_Esvaziamento', 'DISPARO PROTEÇÃO 24VDC SAIDAS DIGITAIS');
SELECT import_fault_line(128, 15, 'AL_Esvaziamento', 'DISPARO PROTEÇÃO 24VDC QUADRO FORÇA MOTRIZ');
SELECT import_fault_line(129, 0, 'AL_Esvaziamento', 'XXXX');
SELECT import_fault_line(130, 1, 'AL_Esvaziamento', 'XXXX');
SELECT import_fault_line(131, 2, 'AL_Esvaziamento', 'XXXX');
SELECT import_fault_line(132, 3, 'AL_Esvaziamento', 'XXXX');
SELECT import_fault_line(133, 4, 'AL_Esvaziamento', 'DEFEITO AUTOMATO ERRO DIAGNOSTICO');
SELECT import_fault_line(134, 5, 'AL_Esvaziamento', 'DEFEITO AUTOMATO ERRO PROGRAMA');
SELECT import_fault_line(135, 6, 'AL_Esvaziamento', 'DEFEITO AUTOMATO ERRO MODULOS');
SELECT import_fault_line(136, 7, 'AL_Esvaziamento', 'DEFEITO AUTOMATO ERRO BASTIDOR');
SELECT import_fault_line(137, 8, 'AL_Esvaziamento', 'DEFEITO RESPOSTA DE MARCHA BOMBA A COMPORTA DIREITA');
SELECT import_fault_line(138, 9, 'AL_Esvaziamento', 'DEFEITO ARRANCADOR SUAVE BOMBA A COMPORTA DIREITA');
SELECT import_fault_line(139, 10, 'AL_Esvaziamento', 'DISPARO PROTEÇÃO BOMBA A COMPORTA DIREITA');
SELECT import_fault_line(140, 11, 'AL_Esvaziamento', 'DISPARO PROTEÇÃO VALVULA DISTRIBUIÇÃO COMPORTA DIREITA');
SELECT import_fault_line(141, 12, 'AL_Esvaziamento', 'DISPARO PROTEÇÃO VALVULA DESCIDA COMPORTA DIREITA');
SELECT import_fault_line(142, 13, 'AL_Esvaziamento', 'DEFEITO MEDIDA DE POSIÇÃO COMPORTA DIREITA');
SELECT import_fault_line(143, 14, 'AL_Esvaziamento', 'XXXX');
SELECT import_fault_line(144, 15, 'AL_Esvaziamento', 'XXXX');
SELECT import_fault_line(145, 0, 'AL_Esvaziamento', 'XXXX');
SELECT import_fault_line(146, 1, 'AL_Esvaziamento', 'XXXX');
SELECT import_fault_line(147, 2, 'AL_Esvaziamento', 'XXXX');
SELECT import_fault_line(148, 3, 'AL_Esvaziamento', 'XXXX');
SELECT import_fault_line(149, 4, 'AL_Esvaziamento', 'XXXX');
SELECT import_fault_line(150, 5, 'AL_Esvaziamento', 'XXXX');
SELECT import_fault_line(151, 6, 'AL_Esvaziamento', 'XXXX');
SELECT import_fault_line(152, 7, 'AL_Esvaziamento', 'XXXX');
SELECT import_fault_line(153, 8, 'AL_Esvaziamento', 'DEFEITO RESPOSTA DE MARCHA BOMBA B COMPORTA ESQUERDA');
SELECT import_fault_line(154, 9, 'AL_Esvaziamento', 'DEFEITO ARRANCADOR SUAVE BOMBA B COMPORTA ESQUERDA');
SELECT import_fault_line(155, 10, 'AL_Esvaziamento', 'DISPARO PROTEÇÃO BOMBA A COMPORTA ESQUERDA');
SELECT import_fault_line(156, 11, 'AL_Esvaziamento', 'DISPARO PROTEÇÃO VALVULA DISTRIBUIÇÃO COMPORTA ESQUERDA');
SELECT import_fault_line(157, 12, 'AL_Esvaziamento', 'DISPARO PROTEÇÃO VALVULA DESCIDA COMPORTA ESQUERDA');
SELECT import_fault_line(158, 13, 'AL_Esvaziamento', 'DEFEITO MEDIDA DE POSIÇÃO COMPORTA ESQUERDA');
SELECT import_fault_line(159, 14, 'AL_Esvaziamento', 'XXXX');
SELECT import_fault_line(160, 15, 'AL_Esvaziamento', 'XXXX');
SELECT import_fault_line(161, 0, 'AL_Esvaziamento', 'VELOCIDADE ALTA 2º PATAMAR ABERTURA RAPIDA COMPORTA B_ESQUERDA @1%d@ mts/m');
SELECT import_fault_line(162, 1, 'AL_Esvaziamento', 'VELOCIDADE BAIXA 2º PATAMAR ABERTURA RAPIDA COMPORTA B_ESQUERDA @1%d@  mts/m');
SELECT import_fault_line(163, 2, 'AL_Esvaziamento', 'VELOCIDADE ALTA FECHO COMPORTA B_ESQUERDA @1%d@  mts/m');
SELECT import_fault_line(164, 3, 'AL_Esvaziamento', 'VELOCIDADE BAIXA FECHO COMPORTA B_ESQUERDA @1%d@  mts/m');
SELECT import_fault_line(165, 8, 'AL_Esvaziamento', 'VELOCIDADE ALTA 1º PATAMAR ABERTURA LENTA COMPORTA A DIREITA @1%d@  mts/m');
SELECT import_fault_line(166, 9, 'AL_Esvaziamento', 'VELOCIDADE BAIXA 1º PATAMAR ABERTURA LENTA COMPORTA A DIREITA @1%d@ mts/m');
SELECT import_fault_line(167, 10, 'AL_Esvaziamento', 'VELOCIDADE ALTA 2º PATAMAR ABERTURA RAPIDA COMPORTA A DIREITA @1%d@  mts/m');
SELECT import_fault_line(168, 11, 'AL_Esvaziamento', 'VELOCIDADE BAIXA 2º PATAMAR ABERTURA RAPIDA COMPORTA A DIREITA @1%d@  mts/m');
SELECT import_fault_line(169, 12, 'AL_Esvaziamento', 'VELOCIDADE ALTA FECHO COMPORTA A DIREITA @1%d@  mts/m');
SELECT import_fault_line(170, 13, 'AL_Esvaziamento', 'VELOCIDADE BAIXA FECHO COMPORTA A DIREITA @1%d@  mts/m');
SELECT import_fault_line(171, 14, 'AL_Esvaziamento', 'VELOCIDADE ALTA 1º PATAMAR ABERTURA LENTA COMPORTA B_ESQUERDA @1%d@  mts/m');
SELECT import_fault_line(172, 15, 'AL_Esvaziamento', 'VELOCIDADE BAIXA 1º PATAMAR ABERTURA LENTA COMPORTA B_ESQUERDA @1%d@  mts/m');

-- ESVAZIAMENTO - EVENTOS (Linhas 173-220)
SELECT import_fault_line(173, 0, 'EV_Esvaziamento', 'ORDEM LOCAL FECHO COMPORTAS');
SELECT import_fault_line(174, 1, 'EV_Esvaziamento', 'ORDEM LOCAL PARAGEM COMPORTAS');
SELECT import_fault_line(175, 2, 'EV_Esvaziamento', 'CONDIÇÃO PORTA MONTANTE FECHADA PRESENTE');
SELECT import_fault_line(176, 3, 'EV_Esvaziamento', 'CONDIÇÃO CIRCUITO ENCHIMENTO FECHADO PRESENTE');
SELECT import_fault_line(177, 4, 'EV_Esvaziamento', 'COMPORTA A DIREITA ABERTA    TEMPO ABERT. @1%d@  seg');
SELECT import_fault_line(178, 5, 'EV_Esvaziamento', 'COMPORTA A DIREITA NA POSIÇÃO DE ESTABILIZAÇÃO  TEMPO ABERT. @1%d@  seg');
SELECT import_fault_line(179, 6, 'EV_Esvaziamento', 'COMPORTA A DIREITA FECHADA   TEMPO FECHO @1%d@  seg');
SELECT import_fault_line(180, 7, 'EV_Esvaziamento', 'COMPORTA B ESQUERDA ABERTA    TEMPO ABERT. @1%d@  seg');
SELECT import_fault_line(181, 8, 'EV_Esvaziamento', 'BOTÃO ACEITAÇÃO DE AVARIAS PREMIDO');
SELECT import_fault_line(182, 9, 'EV_Esvaziamento', 'SISTEMA EM MANUAL');
SELECT import_fault_line(183, 10, 'EV_Esvaziamento', 'SISTEMA EM AUTOMATICO');
SELECT import_fault_line(184, 11, 'EV_Esvaziamento', 'SISTEMA DESLIGADO');
SELECT import_fault_line(185, 12, 'EV_Esvaziamento', 'ORDEM REMOTA ABERTURA COMPORTAS');
SELECT import_fault_line(186, 13, 'EV_Esvaziamento', 'ORDEM REMOTA FECHO COMPORTAS');
SELECT import_fault_line(187, 14, 'EV_Esvaziamento', 'ORDEM REMOTA DE PARAGEM COMPORTAS');
SELECT import_fault_line(188, 15, 'EV_Esvaziamento', 'ORDEM LOCAL ABERTURA COMPORTAS');
SELECT import_fault_line(189, 0, 'EV_Esvaziamento', 'COMPORTA A DIREITA SELECIONADA REMOTO');
SELECT import_fault_line(190, 1, 'EV_Esvaziamento', 'COMPORTA B ESQUERDA SELECIONADA REMOTO');
SELECT import_fault_line(191, 2, 'EV_Esvaziamento', 'COMPORTA A DIREITA A ABRIR - AUTOMATICO');
SELECT import_fault_line(192, 3, 'EV_Esvaziamento', 'COMPORTA B ESQUERDA A ABRIR - AUTOMATICO');
SELECT import_fault_line(193, 4, 'EV_Esvaziamento', 'COMPORTA A DIREITA A ABRIR SUBIDA RAPIDA - AUTOMATICO');
SELECT import_fault_line(194, 5, 'EV_Esvaziamento', 'COMPORTA B ESQUERDA A ABRIR SUBIDA RAPIDA - AUTOMATICO');
SELECT import_fault_line(195, 6, 'EV_Esvaziamento', 'COMPORTA A DIREITA A FECHAR - AUTOMATICO');
SELECT import_fault_line(196, 7, 'EV_Esvaziamento', 'COMPORTA B ESQUERDA A FECHAR - AUTOMATICO');
SELECT import_fault_line(197, 8, 'EV_Esvaziamento', 'COMPORTA B ESQUERDA NA POSIÇÃO DE ESTABILIZAÇÃO  TEMPO ABERT. @1%d@  seg');
SELECT import_fault_line(198, 9, 'EV_Esvaziamento', 'COMPORTA B ESQUERDA FECHADA   TEMPO FECHO  @1%d@  seg');
SELECT import_fault_line(199, 10, 'EV_Esvaziamento', 'BOMBA OLEO COMPORTA A DIREITA LIGADA');
SELECT import_fault_line(200, 11, 'EV_Esvaziamento', 'BOMBA OLEO COMPORTA B ESQUERDA LIGADA');
SELECT import_fault_line(201, 12, 'EV_Esvaziamento', 'COMPORTA A DIREITA A FECHAR');
SELECT import_fault_line(202, 13, 'EV_Esvaziamento', 'COMPORTA B ESQUERDA A FECHAR');
SELECT import_fault_line(203, 14, 'EV_Esvaziamento', 'COMPORTA A DIREITA SELECIONADA LOCAL');
SELECT import_fault_line(204, 15, 'EV_Esvaziamento', 'COMPORTA B ESQUERDA SELECIONADA LOCAL');
SELECT import_fault_line(205, 0, 'EV_Esvaziamento', 'RESERVA');
SELECT import_fault_line(206, 1, 'EV_Esvaziamento', 'RESERVA');
SELECT import_fault_line(207, 2, 'EV_Esvaziamento', 'RESERVA');
SELECT import_fault_line(208, 3, 'EV_Esvaziamento', 'RESERVA');
SELECT import_fault_line(209, 4, 'EV_Esvaziamento', 'RESERVA');
SELECT import_fault_line(210, 5, 'EV_Esvaziamento', 'RESERVA');
SELECT import_fault_line(211, 6, 'EV_Esvaziamento', 'RESERVA');
SELECT import_fault_line(212, 7, 'EV_Esvaziamento', 'RESERVA');
SELECT import_fault_line(213, 8, 'EV_Esvaziamento', 'COMPORTAS EM PROGRAMA DE LIMPEZA PORTA JUSANTE');
SELECT import_fault_line(214, 9, 'EV_Esvaziamento', 'COMPORTA A DIREITA FORA DE SERVIÇO');
SELECT import_fault_line(215, 10, 'EV_Esvaziamento', 'COMPORTA B ESQUERDA FORA DE SERVIÇO');
SELECT import_fault_line(216, 11, 'EV_Esvaziamento', 'RESERVA');
SELECT import_fault_line(217, 12, 'EV_Esvaziamento', 'RESERVA');
SELECT import_fault_line(218, 13, 'EV_Esvaziamento', 'RESERVA');
SELECT import_fault_line(219, 14, 'EV_Esvaziamento', 'RESERVA');
SELECT import_fault_line(220, 15, 'EV_Esvaziamento', 'RESERVA');

-- PORTA JUSANTE - ALARMES (Linhas 221-291)
SELECT import_fault_line(221, 0, 'AL_PortaJusante', 'DISPARO PROTEÇÃO 24VDC QUADROS FORÇA MOTRIZ');
SELECT import_fault_line(222, 1, 'AL_PortaJusante', 'DEFEITO DESNIVELAMENTO PORTA - STOP @1%d@ mm');
SELECT import_fault_line(223, 2, 'AL_PortaJusante', 'ALARME DESNIVELAMENTO PORTA @1%d@ mm');
SELECT import_fault_line(224, 3, 'AL_PortaJusante', 'PARAGEM MARGEM DIREITA ATIVA');
SELECT import_fault_line(225, 4, 'AL_PortaJusante', 'PARAGEM QUADRO ATIVA');
SELECT import_fault_line(226, 5, 'AL_PortaJusante', 'PARAGEM MARGEM ESQUERDA ATIVA');
SELECT import_fault_line(227, 6, 'AL_PortaJusante', 'FALHA COMUNICAÇÃO COM SALA DE COMANDO');
SELECT import_fault_line(228, 7, 'AL_PortaJusante', 'DEFEITO PROTEÇÃO SOBRETENSÃO ALIMENTAÇÃO 3X400VAC');
SELECT import_fault_line(229, 8, 'AL_PortaJusante', 'EMERGÊNCIA ATIVADA');
SELECT import_fault_line(230, 9, 'AL_PortaJusante', 'DEFEITO/ALARME FONTE ALIMENTAÇÃO 400VAC/24VDC');
SELECT import_fault_line(231, 10, 'AL_PortaJusante', 'DEFEITO/ALARME FONTE ALIMENTAÇÃO 220VDC/24VDC');
SELECT import_fault_line(232, 11, 'AL_PortaJusante', 'DISPARO INTERRUPTOR GERAL ALIMENTAÇÃO 3X400VAC');
SELECT import_fault_line(233, 12, 'AL_PortaJusante', 'FALTA ALIMENTAÇÃO FORÇA MOTRIZ 3X400VAC');
SELECT import_fault_line(234, 13, 'AL_PortaJusante', 'XXX');
SELECT import_fault_line(235, 14, 'AL_PortaJusante', 'DISPARO PROTEÇÃO 24VDC ENTRADAS DIGITAIS');
SELECT import_fault_line(236, 15, 'AL_PortaJusante', 'DISPARO PROTEÇÃO 24VDC SAIDAS DIGITAIS');
SELECT import_fault_line(237, 0, 'AL_PortaJusante', 'DISPARO PROTEÇÃO MOTOR MARGEM DIREITA');
SELECT import_fault_line(238, 1, 'AL_PortaJusante', 'DISPARO PROTEÇÃO MOTOR MARGEM ESQUERDA');
SELECT import_fault_line(239, 2, 'AL_PortaJusante', 'DISPARO PROTEÇÃO FREIO MOTOR MARGEM DIREITA');
SELECT import_fault_line(240, 3, 'AL_PortaJusante', 'DISPARO PROTEÇÃO FREIO MOTOR MARGEM ESQUERDA');
SELECT import_fault_line(241, 4, 'AL_PortaJusante', 'DISPARO PROTEÇÃO FREIO HIDR. SEGURANÇA MARGEM DIREITA');
SELECT import_fault_line(242, 5, 'AL_PortaJusante', 'DISPARO PROTEÇÃO FREIO HIDR. SEGURANÇA MARGEM ESQUERDA');
SELECT import_fault_line(243, 6, 'AL_PortaJusante', 'FALTA IGULDADE DE NIVEIS- ORDEM RECUSADA');
SELECT import_fault_line(244, 7, 'AL_PortaJusante', 'XXX');
SELECT import_fault_line(245, 8, 'AL_PortaJusante', 'DETEÇÃO ESFORÇO SUBIDA MARGEM DIREITA MONTANTE_PORTA JUSANTE');
SELECT import_fault_line(246, 9, 'AL_PortaJusante', 'DETEÇÃO ESFORÇO SUBIDA MARGEM DIREITA JUSANTE-PORTA JUSANTE');
SELECT import_fault_line(247, 10, 'AL_PortaJusante', 'DETEÇÃO ESFORÇO DESCIDA MARGEM DIREITA ');
SELECT import_fault_line(248, 11, 'AL_PortaJusante', 'DETEÇÃO ESFORÇO SUBIDA MARGEM ESQUERDA MONTANTE-PORTA JUSANTE');
SELECT import_fault_line(249, 12, 'AL_PortaJusante', 'DETEÇÃO ESFORÇO SUBIDA MARGEM ESQUERDA JUSANTE-PORTA JUSANTE');
SELECT import_fault_line(250, 13, 'AL_PortaJusante', 'DETEÇÃO ESFORÇO DESCIDA MARGEM ESQUERDA');
SELECT import_fault_line(251, 14, 'AL_PortaJusante', 'DEFEITO PROTEÇÃO CONTRA SOBRETENSÕES CIRCUITOS DE COMANDO');
SELECT import_fault_line(252, 15, 'AL_PortaJusante', 'DISPARO PROTEÇÃO DESCARREGADOR SOBRETENSÃO');
SELECT import_fault_line(253, 0, 'AL_PortaJusante', 'FREIOS DE SEGURANÇA ATIVADOS MANUALMENTE!!');
SELECT import_fault_line(254, 1, 'AL_PortaJusante', 'LASER PORTA JUSANTE OBSTRUÇÃO DETECTADA');
SELECT import_fault_line(255, 2, 'AL_PortaJusante', 'LASER PORTA JUSANTE LIMPEZA NECESSÁRIA');
SELECT import_fault_line(256, 3, 'AL_PortaJusante', 'LASER PORTA JUSANTE DESLIGADO');
SELECT import_fault_line(257, 4, 'AL_PortaJusante', 'ALARME DIFERENÇA DE POSIÇÃO ENTRE CONTRA PESO DIREITO E POSIÇÃO GUINCHO');
SELECT import_fault_line(258, 5, 'AL_PortaJusante', 'ALARME DIFERENÇA DE POSIÇÃO ENTRE CONTRA PESO ESQUERDO E POSIÇÃO GUINCHO');
SELECT import_fault_line(259, 6, 'AL_PortaJusante', 'BY-PASS CONDIÇÕES REMOTAS (IGUALDADE NIVEIS) SUBIDA ABERTURA ATIVADO!!!!');
SELECT import_fault_line(260, 7, 'AL_PortaJusante', 'BY-PASS CONDIÇÕES REMOTAS DESCIDA FECHO ATIVADO!!!!');
SELECT import_fault_line(261, 8, 'AL_PortaJusante', 'VARIADOR VELOCIDADE MOTOR DIREITO EM DEFEITO');
SELECT import_fault_line(262, 9, 'AL_PortaJusante', 'VARIADOR VELOCIDADE MOTOR ESQUERDO EM DEFEITO');
SELECT import_fault_line(263, 10, 'AL_PortaJusante', 'DISPARO PROTEÇÃO VENTILADOR MOTOR DIREITO');
SELECT import_fault_line(264, 11, 'AL_PortaJusante', 'DISPARO PROTEÇÃO VENTILADOR MOTOR ESQUERDO');
SELECT import_fault_line(265, 12, 'AL_PortaJusante', 'DISPARO PROTEÇÃO RESISTÊNCIAS MOTOR DIREITO');
SELECT import_fault_line(266, 13, 'AL_PortaJusante', 'DISPARO PROTEÇÃO RESISTÊNCIAS MOTOR ESQUERDO');
SELECT import_fault_line(267, 14, 'AL_PortaJusante', 'VARIADOR MOTOR DIREITO NÃO PRONTO');
SELECT import_fault_line(268, 15, 'AL_PortaJusante', 'VARIADOR MOTOR ESQUERDO NÃO PRONTO');
SELECT import_fault_line(269, 0, 'AL_PortaJusante', 'FALHA COMUNICAÇÃO ENCODER MARGEM DIREITA');
SELECT import_fault_line(270, 1, 'AL_PortaJusante', 'FALHA COMUNICAÇÃO ENCODER MARGEM ESQUERDA');
SELECT import_fault_line(271, 2, 'AL_PortaJusante', 'MEDIDA FORA LIMITES ENCODER MARGEM DIREITA');
SELECT import_fault_line(272, 3, 'AL_PortaJusante', 'MEDIDA FORA LIMITES ENCODER MARGEM ESQUERDA');
SELECT import_fault_line(273, 4, 'AL_PortaJusante', 'XXX');
SELECT import_fault_line(274, 5, 'AL_PortaJusante', 'DEFEITO PRISÃO PORTA');
SELECT import_fault_line(275, 6, 'AL_PortaJusante', 'FALHA COMUNICAÇÃO VARIADOR MESTRE MOTOR DIREITO - FUNC. AUTOMATICO FORA DE SERVIÇO');
SELECT import_fault_line(276, 7, 'AL_PortaJusante', 'FALHA COMUNICAÇÃO VARIADOR ESCRAVO MOTOR ESQUERDO - FUNC. AUTOMATICO FORA DE SERVIÇO');
SELECT import_fault_line(277, 8, 'AL_PortaJusante', 'OBSTRUÇÃO DO LADO DIREITO NO FECHO DA PORTA!! ACIONAR LIMPEZA.<field ref="0" />mm');
SELECT import_fault_line(278, 9, 'AL_PortaJusante', 'OBSTRUÇÃO DO LADO ESQUERDO NO FECHO DA PORTA!! ACIONAR LIMPEZA.<field ref="0" />mm');
SELECT import_fault_line(279, 10, 'AL_PortaJusante', 'XXX');
SELECT import_fault_line(280, 11, 'AL_PortaJusante', 'BY-PASS LAYSER PORTA JUSANTE ATIVADO !!!');
SELECT import_fault_line(281, 12, 'AL_PortaJusante', 'DEFEITO AUTOMATO ERRO DIAGNOSTICO');
SELECT import_fault_line(282, 13, 'AL_PortaJusante', 'DEFEITO AUTOMATO ERRO PROGRAMA');
SELECT import_fault_line(283, 14, 'AL_PortaJusante', 'DEFEITO AUTOMATO ERRO MODULOS');
SELECT import_fault_line(284, 15, 'AL_PortaJusante', 'DEFEITO AUTOMATO ERRO BASTIDOR');
SELECT import_fault_line(285, 8, 'AL_PortaJusante', 'PARAGEM SALA DE COMANDO ATIVA');
SELECT import_fault_line(286, 9, 'AL_PortaJusante', 'PARAGEM QUADRO ATIVA');
SELECT import_fault_line(287, 10, 'AL_PortaJusante', 'ALARME DIFERENÇA ENTRE IGUALDADE DE NIVEIS UMN E AUTÓMATO');
SELECT import_fault_line(288, 11, 'AL_PortaJusante', 'IGUALDADE DE NIVEIS DO AUTÓMATO FORA DE SERVIÇO');
SELECT import_fault_line(289, 12, 'AL_PortaJusante', 'IGUALDADE DE NIVEIS DA UMN FORA DE SERVIÇO');
SELECT import_fault_line(290, 13, 'AL_PortaJusante', 'NÍVEL MINIMO COTA NAVEGAVEL JUSANTE-PORTA JUSANTE');
SELECT import_fault_line(291, 14, 'AL_PortaJusante', 'DISPARO PROTEÇÃO ANALIZADOR');

-- PORTA JUSANTE - EVENTOS (Linhas 292-323)
SELECT import_fault_line(292, 0, 'EV_PortaJusante', 'ORDEM DE PARAGEM BOTONEIRA QUADRO DE COMANDO');
SELECT import_fault_line(293, 1, 'EV_PortaJusante', 'ORDEM DE PARAGEM BOTONEIRA LOCAL MARGEM ESQUERDA');
SELECT import_fault_line(294, 2, 'EV_PortaJusante', 'PORTA ABERTA (SUBIDA) - FIM DE CURSO. POS.DIR @1%d@ -  mm   POS.ESQ -  @2%d@  mm');
SELECT import_fault_line(295, 3, 'EV_PortaJusante', 'PORTA ABERTA (SUBIDA) - POSIÇÃO.   POS.DIR -  @1%d@ mm   POS.ESQ -  @2%d@  mm');
SELECT import_fault_line(296, 4, 'EV_PortaJusante', 'PORTA FECHADA (DESCIDA) - FIM DE CURSO  POS.DIR   - @1%d@   mm   POS.ESQ. -  @2%d@  mm');
SELECT import_fault_line(297, 5, 'EV_PortaJusante', 'PORTA FECHADA (DESCIDA) - POSIÇÃO.  POS.DIR  - @1%d@   mm   POS.ESQ. - @2%d@  mm');
SELECT import_fault_line(298, 6, 'EV_PortaJusante', 'ORDEM DE PARAGEM  DA PORTA - SALA DE COMANDO');
SELECT import_fault_line(299, 7, 'EV_PortaJusante', 'ORDEM DE ABERTURA (SUBIDA) DA PORTA - SALA DE COMANDO');
SELECT import_fault_line(300, 8, 'EV_PortaJusante', 'BOTÃO ACEITAÇÃO DE AVARIAS PREMIDO');
SELECT import_fault_line(301, 9, 'EV_PortaJusante', 'SISTEMA EM MANUAL');
SELECT import_fault_line(302, 10, 'EV_PortaJusante', 'SISTEMA EM AUTOMATICO');
SELECT import_fault_line(303, 11, 'EV_PortaJusante', 'SISTEMA DESLIGADO');
SELECT import_fault_line(304, 12, 'EV_PortaJusante', 'ORDEM DE ABERTURA (SUBIDA) DA PORTA POR BOTONEIRA LOCAL');
SELECT import_fault_line(305, 13, 'EV_PortaJusante', 'ORDEM DE FECHO (DESCIDA) DA PORTA  POR BOTONEIRA LOCAL');
SELECT import_fault_line(306, 14, 'EV_PortaJusante', 'PRESENÇA DE BOTONEIRA DE COMANDO LOCAL');
SELECT import_fault_line(307, 15, 'EV_PortaJusante', 'ORDEM DE PARAGEM BOTONEIRA LOCAL MARGEM DIREITA');
SELECT import_fault_line(308, 0, 'EV_PortaJusante', 'NIVELAMENTO DA PORTA ATIVADO');
SELECT import_fault_line(309, 1, 'EV_PortaJusante', 'FREIO DE SEGURANÇA DIREITO FORÇADO');
SELECT import_fault_line(310, 2, 'EV_PortaJusante', 'FREIO DO MOTOR DIREITO FORÇADO');
SELECT import_fault_line(311, 3, 'EV_PortaJusante', 'FREIO DE SEGURANÇA ESQUERDO FORÇADO');
SELECT import_fault_line(312, 4, 'EV_PortaJusante', 'FREIO DO MOTOR ESQUERDO FORÇADO');
SELECT import_fault_line(313, 5, 'EV_PortaJusante', 'RESERVA');
SELECT import_fault_line(314, 6, 'EV_PortaJusante', 'RESERVA');
SELECT import_fault_line(315, 7, 'EV_PortaJusante', 'RESERVA');
SELECT import_fault_line(316, 8, 'EV_PortaJusante', 'ORDEM DE FECHO (DESCIDA) DA PORTA  - SALA DE COMANDO');
SELECT import_fault_line(317, 9, 'EV_PortaJusante', 'CONDIÇÕES REMOTAS DE ABERTURA PRESENTES (IGUALDADE DE NIVEIS)');
SELECT import_fault_line(318, 10, 'EV_PortaJusante', 'PORTA A ABRIR (A SUBIR)');
SELECT import_fault_line(319, 11, 'EV_PortaJusante', 'PORTA A FECHAR (A DESCER)');
SELECT import_fault_line(320, 12, 'EV_PortaJusante', 'PORTA A ABRIR (A SUBIR) EM AUTOMATICO');
SELECT import_fault_line(321, 13, 'EV_PortaJusante', 'PORTA A FECHAR (A DESCER) EM AUTOMATICO');
SELECT import_fault_line(322, 14, 'EV_PortaJusante', 'ORDEM DE ABERTURA (SUBIDA) DA PORTA POR BOTONEIRA DO QUADRO');
SELECT import_fault_line(323, 15, 'EV_PortaJusante', 'ORDEM DE FECHO (DESCIDA) DA PORTA  POR BOTONEIRA DO QUADRO');

-- PORTA MONTANTE - ALARMES (Linhas 324-413)
SELECT import_fault_line(324, 0, 'AL_PortaMontante', 'DISPARO PROTEÇÃO 24VDC QUADRO FORÇA MOTRIZ-PORTA MONTANTE');
SELECT import_fault_line(325, 1, 'AL_PortaMontante', 'DEFEITO DESNIVELAMENTO PORTA - STOP @1%d@  mm');
SELECT import_fault_line(326, 2, 'AL_PortaMontante', 'ALARME DESNIVELAMENTO PORTA @1%d@  mm');
SELECT import_fault_line(327, 3, 'AL_PortaMontante', 'PARAGEM MARGEM DIREITA ATIVA-PORTA MONTANTE');
SELECT import_fault_line(328, 4, 'AL_PortaMontante', 'PARAGEM QUADRO ATIVA-PORTA MONTANTE');
SELECT import_fault_line(329, 5, 'AL_PortaMontante', 'PARAGEM MARGEM ESQUERDA ATIVA-PORTA MONTANTE');
SELECT import_fault_line(330, 6, 'AL_PortaMontante', 'FALHA COMUNICAÇÃO COM SALA DE COMANDO');
SELECT import_fault_line(331, 7, 'AL_PortaMontante', 'DEFEITO PROTEÇÃO SOBRETENSÃO ALIMENTAÇÃO 3X400VAC');
SELECT import_fault_line(332, 8, 'AL_PortaMontante', 'EMERGÊNCIA ATIVADA-PORTA MONTANTE');
SELECT import_fault_line(333, 9, 'AL_PortaMontante', 'DEFEITO/ALARME FONTE ALIMENTAÇÃO 400VAC/24VDC-PORTA MONTANTE');
SELECT import_fault_line(334, 10, 'AL_PortaMontante', 'DEFEITO/ALARME FONTE ALIMENTAÇÃO 220VDC/24VDC-PORTA MONTANTE');
SELECT import_fault_line(335, 11, 'AL_PortaMontante', 'DISPARO INTERRUPTOR GERAL ALIMENTAÇÃO 3X400VAC-PORTA MONTANTE');
SELECT import_fault_line(336, 12, 'AL_PortaMontante', 'FALTA ALIMENTAÇÃO FORÇA MOTRIZ 3X400VAC-PORTA MONTANTE');
SELECT import_fault_line(337, 13, 'AL_PortaMontante', 'xxx');
SELECT import_fault_line(338, 14, 'AL_PortaMontante', 'DISPARO PROTEÇÃO 24VDC ENTRADAS DIGITAIS-PORTA MONTANTE');
SELECT import_fault_line(339, 15, 'AL_PortaMontante', 'DISPARO PROTEÇÃO 24VDC SAIDAS DIGITAIS-PORTA MONTANTE');
SELECT import_fault_line(340, 0, 'AL_PortaMontante', 'DISPARO PROTEÇÃO MOTOR MARGEM DIREITA-PORTA MONTANTE');
SELECT import_fault_line(341, 1, 'AL_PortaMontante', 'DISPARO PROTEÇÃO MOTOR MARGEM ESQUERDA-PORTA MONTANTE');
SELECT import_fault_line(342, 2, 'AL_PortaMontante', 'DISPARO PROTEÇÃO FREIO MOTOR MARGEM DIREITA-PORTA MONTANTE');
SELECT import_fault_line(343, 3, 'AL_PortaMontante', 'DISPARO PROTEÇÃO FREIO MOTOR MARGEM ESQUERDA-PORTA MONTANTE');
SELECT import_fault_line(344, 4, 'AL_PortaMontante', 'DISPARO PROTEÇÃO FREIO HIDR. SEGURANÇA MARGEM DIREITA');
SELECT import_fault_line(345, 5, 'AL_PortaMontante', 'DISPARO PROTEÇÃO FREIO HIDR. SEGURANÇA MARGEM ESQUERDA');
SELECT import_fault_line(346, 6, 'AL_PortaMontante', 'FALTA IGULDADE DE NIVEIS- ORDEM RECUSADA-PORTA MONTANTE');
SELECT import_fault_line(347, 7, 'AL_PortaMontante', 'xxx');
SELECT import_fault_line(348, 8, 'AL_PortaMontante', 'LASER PORTA MONTANTE OBSTRUÇÃO DETECTADA');
SELECT import_fault_line(349, 9, 'AL_PortaMontante', 'LASER PORTA MONTANTE LIMPEZA NECESSÁRIA');
SELECT import_fault_line(350, 10, 'AL_PortaMontante', 'LASER PORTA MONTANTE DESLIGADO');
SELECT import_fault_line(351, 11, 'AL_PortaMontante', 'BY-PASS LAYSER PORTA MONTANTE ATIVADO !!!');
SELECT import_fault_line(352, 12, 'AL_PortaMontante', 'xxx');
SELECT import_fault_line(353, 13, 'AL_PortaMontante', 'xxx');
SELECT import_fault_line(354, 14, 'AL_PortaMontante', 'DEFEITO PROTEÇÃO CONTRA SOBRETENSÕES CIRCUITOS DE COMANDO');
SELECT import_fault_line(355, 15, 'AL_PortaMontante', 'DISPARO PROTEÇÃO DESCARREGADOR SOBRETENSÃO');
SELECT import_fault_line(356, 0, 'AL_PortaMontante', 'ENCARQUILHAMENTO CORRENTE GUINCHO MARGEM DIREITA');
SELECT import_fault_line(357, 1, 'AL_PortaMontante', 'ENCARQUILHAMENTO CORRENTE GUINCHO MARGEM ESQUERDA');
SELECT import_fault_line(358, 2, 'AL_PortaMontante', 'FREIOS DE SEGURANÇA ATIVADOS MANUALMENTE!!');
SELECT import_fault_line(359, 3, 'AL_PortaMontante', 'SEGURANÇA DETEÇÃO ENCARQUILHAMENTO DESATIVADA!!!!!');
SELECT import_fault_line(360, 4, 'AL_PortaMontante', 'ATENÇÃO!! PORTA DE MONTANTE FORA DE POSIÇÃO!!');
SELECT import_fault_line(361, 5, 'AL_PortaMontante', 'XXX');
SELECT import_fault_line(362, 6, 'AL_PortaMontante', 'BY-PASS CONDIÇÕES REMOTAS SUBIDA - FECHO - ATIVADO!!!!');
SELECT import_fault_line(363, 7, 'AL_PortaMontante', 'BY-PASS CONDIÇÕES REMOTAS (IGUALD. NIVEIS) DESCIDA - ABERTURA - ATIVADO!!!!');
SELECT import_fault_line(364, 8, 'AL_PortaMontante', 'VARIADOR VELOCIDADE MOTOR DIREITO EM DEFEITO');
SELECT import_fault_line(365, 9, 'AL_PortaMontante', 'VARIADOR VELOCIDADE MOTOR ESQUERDO EM DEFEITO');
SELECT import_fault_line(366, 10, 'AL_PortaMontante', 'DISPARO PROTEÇÃO VENTILADOR MOTOR DIREITO');
SELECT import_fault_line(367, 11, 'AL_PortaMontante', 'DISPARO PROTEÇÃO VENTILADOR MOTOR ESQUERDO');
SELECT import_fault_line(368, 12, 'AL_PortaMontante', 'DISPARO PROTEÇÃO RESISTÊNCIAS MOTOR DIREITO');
SELECT import_fault_line(369, 13, 'AL_PortaMontante', 'DISPARO PROTEÇÃO RESISTÊNCIAS MOTOR ESQUERDO');
SELECT import_fault_line(370, 14, 'AL_PortaMontante', 'VARIADOR MOTOR DIREITO NÃO PRONTO');
SELECT import_fault_line(371, 15, 'AL_PortaMontante', 'VARIADOR MOTOR ESQUERDO NÃO PRONTO');
SELECT import_fault_line(372, 0, 'AL_PortaMontante', 'FALHA COMUNICAÇÃO ENCODER MARGEM DIREITA');
SELECT import_fault_line(373, 1, 'AL_PortaMontante', 'FALHA COMUNICAÇÃO ENCODER MARGEM ESQUERDA');
SELECT import_fault_line(374, 8, 'AL_PortaMontante', 'DEFEITO POSIÇÃO GUINCHO DIREITO EM RELAÇÃO À PORTA MONTANTE');
SELECT import_fault_line(375, 9, 'AL_PortaMontante', 'DEFEITO POSIÇÃO GUINCHO ESQUERDO EM RELAÇÃO À PORTA MONTANTE');
SELECT import_fault_line(376, 10, 'AL_PortaMontante', 'BY-PASS SEGURANÇA POSIÇÃO GUINCHO DIREITO');
SELECT import_fault_line(377, 11, 'AL_PortaMontante', 'BY-PASS SEGURANÇA POSIÇÃO GUINCHO ESQUERDO');
SELECT import_fault_line(378, 12, 'AL_PortaMontante', 'DEFEITO AUTOMATO ERRO DIAGNOSTICO');
SELECT import_fault_line(379, 13, 'AL_PortaMontante', 'DEFEITO AUTOMATO ERRO PROGRAMA');
SELECT import_fault_line(380, 14, 'AL_PortaMontante', 'DEFEITO AUTOMATO ERRO MODULOS');
SELECT import_fault_line(381, 15, 'AL_PortaMontante', 'DEFEITO AUTOMATO ERRO BASTIDOR');
SELECT import_fault_line(382, 0, 'AL_PortaMontante', 'RESERVA');
SELECT import_fault_line(383, 1, 'AL_PortaMontante', 'RESERVA');
SELECT import_fault_line(384, 2, 'AL_PortaMontante', 'MEDIDA FORA LIMITES ENCODER MARGEM DIREITA');
SELECT import_fault_line(385, 3, 'AL_PortaMontante', 'MEDIDA FORA LIMITES ENCODER MARGEM ESQUERDA');
SELECT import_fault_line(386, 4, 'AL_PortaMontante', 'XXX');
SELECT import_fault_line(387, 5, 'AL_PortaMontante', 'DEFEITO PRISÃO PORTA');
SELECT import_fault_line(388, 6, 'AL_PortaMontante', 'FALHA COMUNICAÇÃO VARIADOR ESCRAVO MOTOR DIREITO - FUNC. AUTOMATICO FORA DE SERVIÇO');
SELECT import_fault_line(389, 7, 'AL_PortaMontante', 'FALHA COMUNICAÇÃO VARIADOR MESTRE MOTOR ESQUERDO - FUNC. AUTOMATICO FORA DE SERVIÇO');
SELECT import_fault_line(390, 8, 'AL_PortaMontante', 'RESERVA');
SELECT import_fault_line(391, 9, 'AL_PortaMontante', 'RESERVA');
SELECT import_fault_line(392, 10, 'AL_PortaMontante', 'RESERVA');
SELECT import_fault_line(393, 11, 'AL_PortaMontante', 'RESERVA');
SELECT import_fault_line(394, 12, 'AL_PortaMontante', 'RESERVA');
SELECT import_fault_line(395, 13, 'AL_PortaMontante', 'RESERVA');
SELECT import_fault_line(396, 14, 'AL_PortaMontante', 'RESERVA');
SELECT import_fault_line(397, 15, 'AL_PortaMontante', 'RESERVA');
SELECT import_fault_line(398, 0, 'AL_PortaMontante', 'RESERVA');
SELECT import_fault_line(399, 1, 'AL_PortaMontante', 'RESERVA');
SELECT import_fault_line(400, 2, 'AL_PortaMontante', 'RESERVA');
SELECT import_fault_line(401, 3, 'AL_PortaMontante', 'RESERVA');
SELECT import_fault_line(402, 4, 'AL_PortaMontante', 'RESERVA');
SELECT import_fault_line(403, 5, 'AL_PortaMontante', 'RESERVA');
SELECT import_fault_line(404, 6, 'AL_PortaMontante', 'RESERVA');
SELECT import_fault_line(405, 7, 'AL_PortaMontante', 'RESERVA');
SELECT import_fault_line(406, 8, 'AL_PortaMontante', 'PARAGEM SALA DE COMANDO ATIVA');
SELECT import_fault_line(407, 9, 'AL_PortaMontante', 'PARAGEM QUADRO ATIVA');
SELECT import_fault_line(408, 10, 'AL_PortaMontante', 'IGUALDADE DE NIVEIS DO AUTÓMATO FORA DE SERVIÇO');
SELECT import_fault_line(409, 11, 'AL_PortaMontante', 'IGUALDADE DE NIVEIS DA UMN FORA DE SERVIÇO');
SELECT import_fault_line(410, 12, 'AL_PortaMontante', 'NÍVEL MINIMO COTA NAVEGAVEL JUSANTE');
SELECT import_fault_line(411, 13, 'AL_PortaMontante', 'NIVEL MINIMO COTA NAVEGAVEL A MONTANTE');
SELECT import_fault_line(412, 14, 'AL_PortaMontante', 'RESERVA');
SELECT import_fault_line(413, 15, 'AL_PortaMontante', 'RESERVA');

-- PORTA MONTANTE - EVENTOS (Linhas 414-445)
SELECT import_fault_line(414, 0, 'EV_PortaMontante', 'ORDEM DE PARAGEM BOTONEIRA QUADRO DE COMANDO');
SELECT import_fault_line(415, 1, 'EV_PortaMontante', 'ORDEM DE PARAGEM BOTONEIRA LOCAL MARGEM ESQUERDA');
SELECT import_fault_line(416, 2, 'EV_PortaMontante', 'PORTA FECHADA (SUBIDA) - FIM DE CURSO   POS.DIR - <field ref="0" />mm   POS.ESQ - .<field ref="1" />mm');
SELECT import_fault_line(417, 3, 'EV_PortaMontante', 'PORTA FECHADA (SUBIDA) - POSIÇÃO    POS.DIR - <field ref="0" />mm   POS.ESQ - .<field ref="1" />mm');
SELECT import_fault_line(418, 4, 'EV_PortaMontante', 'PORTA ABERTA (DESCIDA) - FIM DE CURSO   POS.DIR - <field ref="0" />mm   POS.ESQ - .<field ref="1" />mm');
SELECT import_fault_line(419, 5, 'EV_PortaMontante', 'PORTA ABERTA (DESCIDA) - POSIÇÃO   POS.DIR - <field ref="0" />mm   POS.ESQ - .<field ref="1" />mm');
SELECT import_fault_line(420, 6, 'EV_PortaMontante', 'ORDEM DE PARAGEM  DA PORTA - SALA DE COMANDO');
SELECT import_fault_line(421, 7, 'EV_PortaMontante', 'ORDEM DE FECHO (SUBIDA) DA PORTA - SALA DE COMANDO');
SELECT import_fault_line(422, 8, 'EV_PortaMontante', 'BOTÃO ACEITAÇÃO DE AVARIAS PREMIDO');
SELECT import_fault_line(423, 9, 'EV_PortaMontante', 'SISTEMA EM MANUAL');
SELECT import_fault_line(424, 10, 'EV_PortaMontante', 'SISTEMA EM AUTOMATICO');
SELECT import_fault_line(425, 11, 'EV_PortaMontante', 'SISTEMA DESLIGADO');
SELECT import_fault_line(426, 12, 'EV_PortaMontante', 'ORDEM DE FECHO (SUBIDA) DA PORTA POR BOTONEIRA LOCAL');
SELECT import_fault_line(427, 13, 'EV_PortaMontante', 'ORDEM DE ABERTURA (DESCIDA) DA PORTA  POR BOTONEIRA LOCAL');
SELECT import_fault_line(428, 14, 'EV_PortaMontante', 'PRESENÇA DE BOTONEIRA DE COMANDO LOCAL');
SELECT import_fault_line(429, 15, 'EV_PortaMontante', 'ORDEM DE PARAGEM BOTONEIRA LOCAL MARGEM DIREITA');
SELECT import_fault_line(430, 0, 'EV_PortaMontante', 'NIVELAMENTO DA PORTA ATIVADO');
SELECT import_fault_line(431, 1, 'EV_PortaMontante', 'FREIO DE SEGURANÇA DIREITO FORÇADO');
SELECT import_fault_line(432, 2, 'EV_PortaMontante', 'FREIO DO MOTOR DIREITO FORÇADO');
SELECT import_fault_line(433, 3, 'EV_PortaMontante', 'FREIO DE SEGURANÇA ESQUERDO FORÇADO');
SELECT import_fault_line(434, 4, 'EV_PortaMontante', 'FREIO DO MOTOR ESQUERDO FORÇADO');
SELECT import_fault_line(435, 5, 'EV_PortaMontante', 'RESERVA');
SELECT import_fault_line(436, 6, 'EV_PortaMontante', 'RESERVA');
SELECT import_fault_line(437, 7, 'EV_PortaMontante', 'RESERVA');
SELECT import_fault_line(438, 8, 'EV_PortaMontante', 'ORDEM DE ABERTURA (DESCIDA) DA PORTA  - SALA DE COMANDO');
SELECT import_fault_line(439, 9, 'EV_PortaMontante', 'CONDIÇÕES REMOTAS DE ABERTURA PRESENTES (IGUALDADE DE NIVEIS)');
SELECT import_fault_line(440, 10, 'EV_PortaMontante', 'PORTA A FECHAR (A SUBIR)');
SELECT import_fault_line(441, 11, 'EV_PortaMontante', 'PORTA A ABRIR (A DESCER)');
SELECT import_fault_line(442, 12, 'EV_PortaMontante', 'PORTA A FECHAR (A SUBIR) EM AUTOMATICO');
SELECT import_fault_line(443, 13, 'EV_PortaMontante', 'PORTA A ABRIR (A DESCER) EM AUTOMATICO');
SELECT import_fault_line(444, 14, 'EV_PortaMontante', 'ORDEM DE FECHO (SUBIDA) DA PORTA POR BOTONEIRA DO QUADRO');
SELECT import_fault_line(445, 15, 'EV_PortaMontante', 'ORDEM DE ABERTURA (DESCIDA) DA PORTA  POR BOTONEIRA DO QUADRO');

-- SALA DE COMANDO - ALARMES (Linhas 446-595)
SELECT import_fault_line(446, 0, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(447, 1, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(448, 2, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(449, 3, 'AL_SalaDeComando', 'DEFEITO AUTOMATO ERRO DIAGNOSTICO - SALA DE COMANDO');
SELECT import_fault_line(450, 4, 'AL_SalaDeComando', 'DEFEITO AUTOMATO ERRO ACESSO I/O');
SELECT import_fault_line(451, 5, 'AL_SalaDeComando', 'DEFEITO AUTOMATO ERRO PROGRAMA - SALA DE COMANDO');
SELECT import_fault_line(452, 6, 'AL_SalaDeComando', 'DEFEITO AUTOMATO ERRO MODULOS - SALA DE COMANDO');
SELECT import_fault_line(453, 7, 'AL_SalaDeComando', 'DEFEITO AUTOMATO ERRO BASTIDOR - SALA DE COMANDO');
SELECT import_fault_line(454, 8, 'AL_SalaDeComando', 'EMERGÊNCIA ATIVADA QUADRO SALA DE COMANDO');
SELECT import_fault_line(455, 9, 'AL_SalaDeComando', 'DEFEITO/ALARME FONTE ALIMENTAÇÃO 220VDC/24VDC - QUADRO SALA DE COMANDO');
SELECT import_fault_line(456, 10, 'AL_SalaDeComando', 'DEFEITO/ALARME FONTE ALIMENTAÇÃO 400VAC/24VDC - QUADRO SALA DE COMANDO');
SELECT import_fault_line(457, 11, 'AL_SalaDeComando', 'DISPARO PROTEÇÃO 24VDC ENTRADAS DIGITAIS PLC QUADRO SALA DE COMANDO');
SELECT import_fault_line(458, 12, 'AL_SalaDeComando', 'DISPARO PROTEÇÃO 24VDC SAIDAS DIGITAIS PLC QUADRO SALA DE COMANDO');
SELECT import_fault_line(459, 13, 'AL_SalaDeComando', 'DISPARO PROTEÇÃO 24VDC ENTRADAS ANALOGICAS PLC QUADRO SALA DE COMANDO');
SELECT import_fault_line(460, 14, 'AL_SalaDeComando', 'DISPARO PROTEÇÃO 24VDC UNIDADE MEDIDA DE NÍVEL - QUADRO SALA DE COMANDO');
SELECT import_fault_line(461, 15, 'AL_SalaDeComando', 'FALTA ALIMENTAÇÃO 230VAC SEMAFOROS - QUADRO SALA DE COMANDO');
SELECT import_fault_line(462, 0, 'AL_SalaDeComando', 'MN-SC- DEFEITO RELE IGUALDADE DE NÍVEIS JUSANTE - RELE FORÇADO!!!');
SELECT import_fault_line(463, 1, 'AL_SalaDeComando', 'MN-SC- BY-PASS IGUALDADE DE NÍVEIS MONTANTE ATIVADO!!!');
SELECT import_fault_line(464, 2, 'AL_SalaDeComando', 'MN-SC- DEFEITO RELE IGUALDADE DE NÍVEIS MONTANTE - RELE FORÇADO!!!');
SELECT import_fault_line(465, 3, 'AL_SalaDeComando', 'MN-SC- DEFEITO RESPOSTA RELE IGUALDADE DE NÍVEIS JUSANTE');
SELECT import_fault_line(466, 4, 'AL_SalaDeComando', 'MN-SC- DEFEITO RESPOSTA RELE IGUALDADE DE NÍVEIS MONTANTE');
SELECT import_fault_line(467, 5, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(468, 6, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(469, 7, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(470, 8, 'AL_SalaDeComando', 'MN-SC- DEFEITO SONDA MEDIDA DE NÍVELL JUSANTE');
SELECT import_fault_line(471, 9, 'AL_SalaDeComando', 'MN-SC- DEFEITO SONDA MEDIDA DE NÍVEL CALDEIRA');
SELECT import_fault_line(472, 10, 'AL_SalaDeComando', 'MN-SC- DEFEITO SONDA MEDIDA DE NÍVEL MONTANTE');
SELECT import_fault_line(473, 11, 'AL_SalaDeComando', 'MN-SC- COTA MAXIMA DE NAVEGAÇÃO A JUSANTE');
SELECT import_fault_line(474, 12, 'AL_SalaDeComando', 'MN-SC- COTA MINIMA DE NAVEGAÇÃO A JUSANTE');
SELECT import_fault_line(475, 13, 'AL_SalaDeComando', 'MN-SC- COTA MAXIMA DE NAVEGAÇÃO A MONTANTE');
SELECT import_fault_line(476, 14, 'AL_SalaDeComando', 'MN-SC- COTA MINIMA DE NAVEGAÇÃO A MONTANTE');
SELECT import_fault_line(477, 15, 'AL_SalaDeComando', 'MN-SC- BY-PASS IGUALDADE DE NÍVEIS JUSANTE ATIVADO!!!');
SELECT import_fault_line(478, 0, 'AL_SalaDeComando', 'INUNDAÇÃO POÇO DOS CONTRAPESOS PORTA DE MONTANTE');
SELECT import_fault_line(479, 1, 'AL_SalaDeComando', 'INUNDAÇÃO POÇO DOS CONTRAPESOS PORTA DE JUSANTE');
SELECT import_fault_line(480, 2, 'AL_SalaDeComando', 'FALTA ALIMENTAÇÃO QUADRO CONTROLO INUNDAÇÃO CONTRAPESOS');
SELECT import_fault_line(481, 3, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(482, 4, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(483, 5, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(484, 6, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(485, 7, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(486, 8, 'AL_SalaDeComando', 'QUADRO SALA DE COMANDO - FALHA DE COMUNICAÇÃO COM QUADRO CIRCUITO ENCHIMENTO');
SELECT import_fault_line(487, 9, 'AL_SalaDeComando', 'QUADRO SALA DE COMANDO - FALHA DE COMUNICAÇÃO COM QUADRO CIRCUITO ESVAZIAMENTO');
SELECT import_fault_line(488, 10, 'AL_SalaDeComando', 'QUADRO SALA DE COMANDO - FALHA DE COMUNICAÇÃO COM QUADRO PORTA DE JUSANTE');
SELECT import_fault_line(489, 11, 'AL_SalaDeComando', 'QUADRO SALA DE COMANDO - FALHA DE COMUNICAÇÃO COM QUADRO PORTA DE MONTANTE');
SELECT import_fault_line(490, 12, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(491, 13, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(492, 14, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(493, 15, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(494, 0, 'AL_SalaDeComando', 'RADAR JUSANTE EM ERRO/FALHA');
SELECT import_fault_line(495, 1, 'AL_SalaDeComando', 'FALHA COMUNICAÇÃO COM RADAR JUSANTE');
SELECT import_fault_line(496, 2, 'AL_SalaDeComando', 'RADAR CALDEIRA DIREITO EM ERRO/FALHA');
SELECT import_fault_line(497, 3, 'AL_SalaDeComando', 'FALHA COMUNICAÇÃO COM RADAR CALDEIRA DIREITO');
SELECT import_fault_line(498, 4, 'AL_SalaDeComando', 'RADAR CALDEIRA ESQUERDO EM ERRO/FALHA');
SELECT import_fault_line(499, 5, 'AL_SalaDeComando', 'FALHA COMUNICAÇÃO COM RADAR CALDEIRA ESQUERDO');
SELECT import_fault_line(500, 6, 'AL_SalaDeComando', 'RADAR MONTANTE EM ERRO/FALHA');
SELECT import_fault_line(501, 7, 'AL_SalaDeComando', 'FALHA COMUNICAÇÃO COM RADAR MONTANTE');
SELECT import_fault_line(502, 8, 'AL_SalaDeComando', 'FALHA COMUNICAÇÃO ENTRE GATEWAY E PAINEL JUSANTE');
SELECT import_fault_line(503, 9, 'AL_SalaDeComando', 'FALHA COMUNICAÇÃO ENTRE GATEWAY E PAINEL CALDEIRA');
SELECT import_fault_line(504, 10, 'AL_SalaDeComando', 'FALHA COMUNICAÇÃO ENTRE GATEWAY E PAINEL MONTANTE');
SELECT import_fault_line(505, 11, 'AL_SalaDeComando', 'FALHA COMUNICAÇÃO ENTRE PLC SALA COMANDO E GATEWAY PAINEIS');
SELECT import_fault_line(506, 12, 'AL_SalaDeComando', 'XXX');
SELECT import_fault_line(507, 13, 'AL_SalaDeComando', 'XXX');
SELECT import_fault_line(508, 14, 'AL_SalaDeComando', 'FALHA COMUNICAÇÃO ENTRE PLC COMANDO E PLC CONTROLO LASER PORTA MONTANTE');
SELECT import_fault_line(509, 15, 'AL_SalaDeComando', 'FALHA COMUNICAÇÃO ENTRE PLC COMANDO E PLC CONTROLO LASER PORTA JUSANTE');
-- Continuando SALA DE COMANDO linhas 510-589 que estavam faltando
SELECT import_fault_line(510, 0, 'AL_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA SUBIDA ABORTADA - FALHA RESPOSTA MARCHA ABERTURA ENCHIMENTO');
SELECT import_fault_line(511, 1, 'AL_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA SUBIDA ABORTADA - FALHA RESPOSTA MARCHA ABERTURA PORTA MONTANTE');
SELECT import_fault_line(512, 2, 'AL_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA SUBIDA ABORTADA - FALHA RESPOSTA MARCHA FECHO ENCHIMENTO');
SELECT import_fault_line(513, 3, 'AL_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA DESCIDA ABORTADA - TEMPO MÁXIMO OPERAÇÃO ');
SELECT import_fault_line(514, 4, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(515, 5, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(516, 6, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(517, 7, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(518, 8, 'AL_SalaDeComando', 'FALHA COMUNICAÇÃO ENTRE GATEWAY E PAINEL JUSANTE');
SELECT import_fault_line(519, 9, 'AL_SalaDeComando', 'FALHA COMUNICAÇÃO ENTRE GATEWAY E PAINEL CALDEIRA');
SELECT import_fault_line(520, 10, 'AL_SalaDeComando', 'FALHA COMUNICAÇÃO ENTRE GATEWAY E PAINEL MONTANTE');
SELECT import_fault_line(521, 11, 'AL_SalaDeComando', 'FALHA COMUNICAÇÃO ENTRE PLC SALA COMANDO E GATEWAY PAINEIS');
SELECT import_fault_line(522, 12, 'AL_SalaDeComando', 'XXX');
SELECT import_fault_line(523, 13, 'AL_SalaDeComando', 'XXX');
SELECT import_fault_line(524, 14, 'AL_SalaDeComando', 'FALHA COMUNICAÇÃO ENTRE PLC COMANDO E PLC CONTROLO LASER PORTA MONTANTE');
SELECT import_fault_line(525, 15, 'AL_SalaDeComando', 'FALHA COMUNICAÇÃO ENTRE PLC COMANDO E PLC CONTROLO LASER PORTA JUSANTE');
SELECT import_fault_line(526, 0, 'AL_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA DESCIDA ABORTADA - FALHA RESPOSTA MARCHA ABERTURA ESVAZIAMENTO');
SELECT import_fault_line(527, 1, 'AL_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA DESCIDA ABORTADA - FALHA RESPOSTA MARCHA ABERTURA PORTA JUSANTE');
SELECT import_fault_line(528, 2, 'AL_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA DESCIDA ABORTADA - FALHA RESPOSTA MARCHA FECHO ESVAZIAMENTO');
SELECT import_fault_line(529, 3, 'AL_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA DESCIDA ABORTADA - TEMPO MÁXIMO OPERAÇÃO ');
SELECT import_fault_line(530, 4, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(531, 5, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(532, 6, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(533, 7, 'AL_SalaDeComando', 'RESERVA');
SELECT import_fault_line(534, 8, 'AL_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA DESCIDA ABORTADA - DETEÇÃO CAMARAS MIC');
SELECT import_fault_line(535, 9, 'AL_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA DESCIDA ABORTADA - DETEÇÃO FOTOCELULAS');
SELECT import_fault_line(536, 10, 'AL_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA DESCIDA ABORTADA - DETEÇÃO LASER MONTANTE');
SELECT import_fault_line(537, 11, 'AL_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA DESCIDA ABORTADA - FALTA CONDIÇÕES PRELIMINARES FECHO PORTA MONTANTE');
SELECT import_fault_line(538, 12, 'AL_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA DESCIDA ABORTADA - FALTA CONDIÇÕES PRELIMINARES ABERTURA ESVAZIAMENTO');
SELECT import_fault_line(539, 13, 'AL_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA DESCIDA ABORTADA - FALTA CONDIÇÕES PRELIMINARES ABERTURA PORTA JUSANTE');
SELECT import_fault_line(540, 14, 'AL_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA DESCIDA ABORTADA - FALTA CONDIÇÕES PRELIMINARES FECHO ESVAZIAMENTO');
SELECT import_fault_line(541, 15, 'AL_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA DESCIDA ABORTADA - FALHA RESPOSTA MARCHA FECHO PORTA MONTANTE');

-- SALA DE COMANDO - EVENTOS (Linhas 542-589)
SELECT import_fault_line(542, 0, 'EV_SalaDeComando', 'SAÍDA ECLUSA PARA MONTANTE AUTORIZADA');
SELECT import_fault_line(543, 1, 'EV_SalaDeComando', 'ENTRADA ECLUSA POR MONTANTE INTERDITA');
SELECT import_fault_line(544, 2, 'EV_SalaDeComando', 'ENTRADA ECLUSA POR MONTANTE AUTORIZADA');
SELECT import_fault_line(545, 3, 'EV_SalaDeComando', 'ENTRADA ECLUSA POR MONTANTE EM PREPARAÇÃO');
SELECT import_fault_line(546, 4, 'EV_SalaDeComando', 'SAÍDA ECLUSA PARA JUSANTE INTERDITA');
SELECT import_fault_line(547, 5, 'EV_SalaDeComando', 'SAÍDA ECLUSA PARA JUSANTE AUTORIZADA');
SELECT import_fault_line(548, 6, 'EV_SalaDeComando', 'RESERVA');
SELECT import_fault_line(549, 7, 'EV_SalaDeComando', 'RESERVA');
SELECT import_fault_line(550, 8, 'EV_SalaDeComando', 'IGUALDADE DE NIVEIS UMN A MONTANTE PRESENTE');
SELECT import_fault_line(551, 9, 'EV_SalaDeComando', 'IGUALDADE DE NIVEIS UMN A JUSANTE PRESENTE');
SELECT import_fault_line(552, 10, 'EV_SalaDeComando', 'IGUALDADE DE NIVEIS SALA DE COMANDO A MONTANTE PRESENTE');
SELECT import_fault_line(553, 11, 'EV_SalaDeComando', 'IGUALDADE DE NIVEIS SALA DE COMANDO A JUSANTE PRESENTE');
SELECT import_fault_line(554, 12, 'EV_SalaDeComando', 'ENTRADA ECLUSA POR JUSANTE INTERDITA');
SELECT import_fault_line(555, 13, 'EV_SalaDeComando', 'ENTRADA ECLUSA POR JUSANTE AUTORIZADA');
SELECT import_fault_line(556, 14, 'EV_SalaDeComando', 'ENTRADA ECLUSA POR JUSANTE EM PREPARAÇÃO');
SELECT import_fault_line(557, 15, 'EV_SalaDeComando', 'SAÍDA ECLUSA PARA MONTANTE INTERDITA');
SELECT import_fault_line(558, 0, 'EV_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA DE SUBIDA PREPARADA');
SELECT import_fault_line(559, 1, 'EV_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA DE SUBIDA ATIVA');
SELECT import_fault_line(560, 2, 'EV_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA DE SUBIDA CONCLUIDA');
SELECT import_fault_line(561, 3, 'EV_SalaDeComando', 'RESERVA');
SELECT import_fault_line(562, 4, 'EV_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA DE DESCIDA PREPARADA');
SELECT import_fault_line(563, 5, 'EV_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA DE DESCIDA ATIVA');
SELECT import_fault_line(564, 6, 'EV_SalaDeComando', 'ECLUSAGEM AUTOMÁTICA DE DESCIDA CONCLUIDA');
SELECT import_fault_line(565, 7, 'EV_SalaDeComando', 'RESERVA');
SELECT import_fault_line(566, 8, 'EV_SalaDeComando', 'CAMARAS - DETEÇÃO BARCO GRANDE A JUSANTE');
SELECT import_fault_line(567, 9, 'EV_SalaDeComando', 'CAMARAS - DETEÇÃO BARCO PEQUENO A JUSANTE');
SELECT import_fault_line(568, 10, 'EV_SalaDeComando', 'CAMARAS - DETEÇÃO BARCO PEQUENO A MONTANTE');
SELECT import_fault_line(569, 11, 'EV_SalaDeComando', 'CAMARAS - DETEÇÃO BARCO GRANDE A MONTANTE');
SELECT import_fault_line(570, 12, 'EV_SalaDeComando', 'CAMARAS - DETEÇÃO BARCO NA CALDEIRA FORA DOS LIMITES A MONTANTE');
SELECT import_fault_line(571, 13, 'EV_SalaDeComando', 'CAMARAS - DETEÇÃO BARCO NA CALDEIRA FORA DOS LIMITES A JUSANTE');
SELECT import_fault_line(572, 14, 'EV_SalaDeComando', 'CAMARAS - DETEÇÃO BARCO NA CALDEIRA DURANTE ECLUSAGEM AUTOMÁTICA DE DESCIDA');
SELECT import_fault_line(573, 15, 'EV_SalaDeComando', 'CAMARAS - DETEÇÃO BARCO NA CALDEIRA DURANTE ECLUSAGEM AUTOMÁTICA DE SUBIDA');
SELECT import_fault_line(574, 0, 'EV_SalaDeComando', 'RESERVA');
SELECT import_fault_line(575, 1, 'EV_SalaDeComando', 'RESERVA');
SELECT import_fault_line(576, 2, 'EV_SalaDeComando', 'RESERVA');
SELECT import_fault_line(577, 3, 'EV_SalaDeComando', 'RESERVA');
SELECT import_fault_line(578, 4, 'EV_SalaDeComando', 'RESERVA');
SELECT import_fault_line(579, 5, 'EV_SalaDeComando', 'RESERVA');
SELECT import_fault_line(580, 6, 'EV_SalaDeComando', 'RESERVA');
SELECT import_fault_line(581, 7, 'EV_SalaDeComando', 'RESERVA');
SELECT import_fault_line(582, 8, 'EV_SalaDeComando', 'DETEÇÃO EXCESSO VELOCIDADE ENTRADA MONTANTE');
SELECT import_fault_line(583, 9, 'EV_SalaDeComando', 'DETEÇÃO EXCESSO VELOCIDADE CALDEIRA');
SELECT import_fault_line(584, 10, 'EV_SalaDeComando', 'DETEÇÃO EXCESSO VELOCIDADE ENTRADA JUSANTE');
SELECT import_fault_line(585, 11, 'EV_SalaDeComando', 'RESERVA');
SELECT import_fault_line(586, 12, 'EV_SalaDeComando', 'RESERVA');
SELECT import_fault_line(587, 13, 'EV_SalaDeComando', 'RESERVA');
SELECT import_fault_line(588, 14, 'EV_SalaDeComando', 'RESERVA');
SELECT import_fault_line(589, 15, 'EV_SalaDeComando', 'RESERVA');
SELECT import_fault_line(590, 0, 'AL_SalaDeComando', 'FALHA DE COMUNICAÇÃO COM PLC - ENCHIMENTO');
SELECT import_fault_line(591, 1, 'AL_SalaDeComando', 'FALHA DE COMUNICAÇÃO COM PLC - ESVAZIAMENTO');
SELECT import_fault_line(592, 2, 'AL_SalaDeComando', 'FALHA DE COMUNICAÇÃO COM PLC - JUSANTE');
SELECT import_fault_line(593, 3, 'AL_SalaDeComando', 'FALHA DE COMUNICAÇÃO COM PLC - MONTANTE');
SELECT import_fault_line(594, 4, 'AL_SalaDeComando', 'FALHA DE COMUNICAÇÃO COM PLC - ESGOTO E DRENAGEM');
SELECT import_fault_line(595, 5, 'AL_SalaDeComando', 'FALHA DE COMUNICAÇÃO COM PLC - COMANDO');

-- ESGOTO E DRENAGEM - ALARMES E EVENTOS (Linhas 596-709)
SELECT import_fault_line(596, 0, 'AL_EsgotoDrenagem', 'x');
SELECT import_fault_line(597, 1, 'AL_EsgotoDrenagem', 'DISPARO DISJUNTOR QDI PROTEÇÃO 24 VDC ENTRADAS DIGITAIS PLC PRINCIPAL');
SELECT import_fault_line(598, 2, 'AL_EsgotoDrenagem', 'DISPARO DISJUNTOR QAI PROTEÇÃO 24 VDC ENTRADAS ANALÓGICAS PLC PRINCIPAL');
SELECT import_fault_line(599, 3, 'AL_EsgotoDrenagem', 'DISPARO DISJUNTOR QDO PROTEÇÃO 24 VDC SAÍDAS DIGITAIS PLC PRINCIPAL');
SELECT import_fault_line(600, 4, 'AL_EsgotoDrenagem', 'DISPARO DISJUNTOR QCPUR PROTEÇÃO 24 VDC PLC RECURSO');
SELECT import_fault_line(601, 5, 'AL_EsgotoDrenagem', 'DEFEITO CONVERSOR TENSÃO PS1 230VAC/24VDC');
SELECT import_fault_line(602, 6, 'AL_EsgotoDrenagem', 'DEFEITO CONVERSOR TENSÃO PS2 220VDC/24VDC');
SELECT import_fault_line(603, 7, 'AL_EsgotoDrenagem', 'ARRANQUES FREQUENTES BOMBAS');
SELECT import_fault_line(604, 8, 'AL_EsgotoDrenagem', 'EMERGÊNCIA ACTIVADA');
SELECT import_fault_line(605, 9, 'AL_EsgotoDrenagem', 'FALTA ALIMENTAÇÃO 3X400VAC QUADRO QEBED1 (BOMBA 1) ');
SELECT import_fault_line(606, 10, 'AL_EsgotoDrenagem', 'FALTA ALIMENTAÇÃO 3X400VAC QUADRO QEBED2 (BOMBA 2)');
SELECT import_fault_line(607, 11, 'AL_EsgotoDrenagem', 'x');
SELECT import_fault_line(608, 12, 'AL_EsgotoDrenagem', 'x');
SELECT import_fault_line(609, 13, 'AL_EsgotoDrenagem', 'INTERRUPTOR Q0 CORTE GERAL QEBED1 DESLIGADO (BOMBA 1)');
SELECT import_fault_line(610, 14, 'AL_EsgotoDrenagem', 'INTERRUPTOR Q0 CORTE GERAL QEBED2 DESLIGADO (BOMBA 2)');
SELECT import_fault_line(611, 15, 'AL_EsgotoDrenagem', 'x');
SELECT import_fault_line(612, 0, 'AL_EsgotoDrenagem', 'NÍVEL DO POÇO ALTO !!');
SELECT import_fault_line(613, 1, 'AL_EsgotoDrenagem', 'NÍVEL DO POÇO MUITO ALTO !!!!');
SELECT import_fault_line(614, 2, 'AL_EsgotoDrenagem', 'NÍVEL INUNDAÇÃO DO POÇO ATINGIDO !!!!!!');
SELECT import_fault_line(615, 3, 'AL_EsgotoDrenagem', 'NÍVEL DO POÇO MUITO BAIXO !!');
SELECT import_fault_line(616, 4, 'AL_EsgotoDrenagem', 'BOIA - NÍVEL DO POÇO INUNDAÇÃO !!! (ATIVADO POR BOIA)');
SELECT import_fault_line(617, 5, 'AL_EsgotoDrenagem', 'SISTEMA EM MANUAL Á MAIS DE 15MN');
SELECT import_fault_line(618, 6, 'AL_EsgotoDrenagem', 'SISTEMA DESLIGADO !!!!!');
SELECT import_fault_line(619, 7, 'AL_EsgotoDrenagem', 'FUNCIONAMENTO PROLONGADO BOMBAS');
SELECT import_fault_line(620, 8, 'AL_EsgotoDrenagem', 'DEFEITO I/O PLC PRINCIPAL');
SELECT import_fault_line(621, 9, 'AL_EsgotoDrenagem', 'DEFEITO PROGRAMA PLC PRINCIPAL');
SELECT import_fault_line(622, 10, 'AL_EsgotoDrenagem', 'DEFEITO MODULOS PLC PRINCIPAL');
SELECT import_fault_line(623, 11, 'AL_EsgotoDrenagem', 'DEFEITO BASTIDOR PLC PRINCIPAL');
SELECT import_fault_line(624, 12, 'AL_EsgotoDrenagem', 'ALARME DIFERENÇA ENTRE MEDIDAS DE NÍVEL (SONDA DE SERVIÇO E SONDA DE RECURSO)');
SELECT import_fault_line(625, 13, 'AL_EsgotoDrenagem', 'SEM MEDIDA DE NÍVEL!!!! AVARIA DAS DUAS SONDAS!!! FUNCIONAMENTO POR BOIAS!');
SELECT import_fault_line(626, 14, 'AL_EsgotoDrenagem', 'DEFEITO/AVARIA SONDA MEDIDA DE NÍVEL DE SERVIÇO');
SELECT import_fault_line(627, 15, 'AL_EsgotoDrenagem', 'DEFEITO/AVARIA SONDA MEDIDA DE NÍVEL DE RECURSO');
SELECT import_fault_line(628, 8, 'AL_EsgotoDrenagem', 'NÍVEL BAIXO POR BOIA!!');
SELECT import_fault_line(629, 9, 'AL_EsgotoDrenagem', 'DEFEITO AUTÓMATO DE RECURSO S7-1200');
-- Completando linhas que estavam faltando no ESGOTO
-- Linhas 630-645 que estavam faltando
SELECT import_fault_line(630, 0, 'AL_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(631, 1, 'AL_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(632, 2, 'AL_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(633, 3, 'AL_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(634, 4, 'AL_EsgotoDrenagem', 'RESERVA');
SELECT import_fault_line(635, 5, 'AL_EsgotoDrenagem', 'RESERVA');
SELECT import_fault_line(636, 6, 'AL_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(637, 7, 'AL_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(638, 8, 'AL_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(639, 9, 'AL_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(640, 10, 'AL_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(641, 11, 'AL_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(642, 12, 'AL_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(643, 13, 'AL_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(644, 14, 'AL_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(645, 15, 'AL_EsgotoDrenagem', 'XXX');

-- BOMBA 1 - Linhas 646-661
SELECT import_fault_line(646, 0, 'AL_EsgotoDrenagem', 'DEFEITO ARRANCADOR SUAVE ARC1 QEBED1 (BOMBA 1)');
SELECT import_fault_line(647, 1, 'AL_EsgotoDrenagem', 'DEFEITO ARRANQUE PROLONGADO BOMBA 1 QEBED1');
SELECT import_fault_line(648, 2, 'AL_EsgotoDrenagem', 'ALARME INTENSIDADE ALTA BOMBA ESGOTO 1 QEBED1');
SELECT import_fault_line(649, 3, 'AL_EsgotoDrenagem', 'DISPARO POR INTENSIDADE ALTA BOMBA ESGOTO 1 QEBED1');
SELECT import_fault_line(650, 4, 'AL_EsgotoDrenagem', 'RESERVA');
SELECT import_fault_line(651, 5, 'AL_EsgotoDrenagem', 'RESERVA');
SELECT import_fault_line(652, 6, 'AL_EsgotoDrenagem', 'RESERVA');
SELECT import_fault_line(653, 7, 'AL_EsgotoDrenagem', 'RESERVA');
SELECT import_fault_line(654, 8, 'AL_EsgotoDrenagem', 'FALTA TENSÃO COMANDO 230VAC QEBED1 K1 (BOMBA 1)');
SELECT import_fault_line(655, 9, 'AL_EsgotoDrenagem', 'DISPARO DISJUNTOR Q1 PROTEÇÃO POTÊNCIA ARRANCADOR QEBED1 (BOMBA 1)');
SELECT import_fault_line(656, 10, 'AL_EsgotoDrenagem', 'DISPARO DISJUNTOR Q10 PROTEÇÃO COMANDO 230VAC ARRANCADOR QEBED1 (BOMBA 1)');
SELECT import_fault_line(657, 11, 'AL_EsgotoDrenagem', 'DISPARO DISJUNTOR Q9 PROTEÇÃO SISTEMA DETEÇÃO CORRENTE RESIDUAL QEBED1 (BOMBA 1)');
SELECT import_fault_line(658, 12, 'AL_EsgotoDrenagem', 'DISPARO POR DETEÇÃO CORRENTE RESIDUAL QEBED1 RC1 (BOMBA 1)');
SELECT import_fault_line(659, 13, 'AL_EsgotoDrenagem', 'DEFEITO RESPOSTA DE MARCHA CONTATOR DE LINHA KM1 QEBED1 (BOMBA 1)');
SELECT import_fault_line(660, 14, 'AL_EsgotoDrenagem', 'BOMBA 1 EM COMANDO DIRETO QEBED1');
SELECT import_fault_line(661, 15, 'AL_EsgotoDrenagem', 'DEFEITO RESPOSTA DE MARCHA ARRANCADOR SUAVE ARC1 QEBED1 (BOMBA 1)');

-- BOMBA 2 - Linhas 662-677
SELECT import_fault_line(662, 0, 'AL_EsgotoDrenagem', 'DEFEITO ARRANCADOR SUAVE ARC2 QEBED2 (BOMBA 2)');
SELECT import_fault_line(663, 1, 'AL_EsgotoDrenagem', 'DEFEITO ARRANQUE PROLONGADO BOMBA 2 QEBED2');
SELECT import_fault_line(664, 2, 'AL_EsgotoDrenagem', 'ALARME INTENSIDADE ALTA BOMBA 2 QEBED2');
SELECT import_fault_line(665, 3, 'AL_EsgotoDrenagem', 'DISPARO POR INTENSIDADE ALTA BOMBA 2 QEBED2');
SELECT import_fault_line(666, 4, 'AL_EsgotoDrenagem', 'BOMBA 2 EM COMANDO POR BOIAS');
SELECT import_fault_line(667, 5, 'AL_EsgotoDrenagem', 'RESERVA');
SELECT import_fault_line(668, 6, 'AL_EsgotoDrenagem', 'RESERVA');
SELECT import_fault_line(669, 7, 'AL_EsgotoDrenagem', 'RESERVA');
SELECT import_fault_line(670, 8, 'AL_EsgotoDrenagem', 'FALTA TENSÃO COMANDO 230VAC QEBED2 K1 (BOMBA 2)');
SELECT import_fault_line(671, 9, 'AL_EsgotoDrenagem', 'DISPARO DISJUNTOR Q1 PROTEÇÃO POTÊNCIA ARRANCADOR QEBED2 (BOMBA 2)');
SELECT import_fault_line(672, 10, 'AL_EsgotoDrenagem', 'DISPARO DISJUNTOR Q10 PROTEÇÃO COMANDO 230VAC ARRANCADOR QEBED2 (BOMBA 2)');
SELECT import_fault_line(673, 11, 'AL_EsgotoDrenagem', 'DISPARO DISJUNTOR Q9 PROTEÇÃO SISTEMA DETEÇÃO CORRENTE RESIDUAL QEBED2 (BOMBA 2)');
SELECT import_fault_line(674, 12, 'AL_EsgotoDrenagem', 'DISPARO POR DETEÇÃO CORRENTE RESIDUAL QEBED2 RC2 (BOMBA 2)');
SELECT import_fault_line(675, 13, 'AL_EsgotoDrenagem', 'DEFEITO RESPOSTA DE MARCHA CONTATOR DE LINHA KM1 QEBED2 (BOMBA 2)');
SELECT import_fault_line(676, 14, 'AL_EsgotoDrenagem', 'BOMBA 2 EM COMANDO DIRETO QEBED2');
SELECT import_fault_line(677, 15, 'AL_EsgotoDrenagem', 'DEFEITO RESPOSTA DE MARCHA ARRANCADOR SUAVE ARC1 QEBED2 (BOMBA 2)');

-- EVENTOS ESGOTO - Linhas 678-709
SELECT import_fault_line(678, 0, 'EV_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(679, 1, 'EV_EsgotoDrenagem', 'REARME AUTOMATICO ARRANCADOR BE1');
SELECT import_fault_line(680, 2, 'EV_EsgotoDrenagem', 'REARME AUTOMATICO ARRANCADOR BE2');
SELECT import_fault_line(681, 3, 'EV_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(682, 4, 'EV_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(683, 5, 'EV_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(684, 6, 'EV_EsgotoDrenagem', 'DISPARO DISJUNTOR QB ALIMENTAÇÃO BOIAS QEBED2');
SELECT import_fault_line(685, 7, 'EV_EsgotoDrenagem', 'RESERVA');
SELECT import_fault_line(686, 8, 'EV_EsgotoDrenagem', 'BOMBA ESGOTO 1 LIGADA');
SELECT import_fault_line(687, 9, 'EV_EsgotoDrenagem', 'BOMBA ESGOTO 2 LIGADA');
SELECT import_fault_line(688, 10, 'EV_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(689, 11, 'EV_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(690, 12, 'EV_EsgotoDrenagem', 'BOTÃO ACEITAÇÃO DE AVARIAS PREMIDO');
SELECT import_fault_line(691, 13, 'EV_EsgotoDrenagem', 'ORDEM MARCHA BOMBA ESGOTO 1');
SELECT import_fault_line(692, 14, 'EV_EsgotoDrenagem', 'ORDEM MARCHA BOMBA ESGOTO 2');
SELECT import_fault_line(693, 15, 'EV_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(694, 0, 'EV_EsgotoDrenagem', 'FALTA FORÇA MOTRIZ 3X400VAC BE1');
SELECT import_fault_line(695, 1, 'EV_EsgotoDrenagem', 'FALTA FORÇA MOTRIZ 3X400VAC BE2');
SELECT import_fault_line(696, 2, 'EV_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(697, 3, 'EV_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(698, 4, 'EV_EsgotoDrenagem', 'RESERVA');
SELECT import_fault_line(699, 5, 'EV_EsgotoDrenagem', 'RESERVA');
SELECT import_fault_line(700, 6, 'EV_EsgotoDrenagem', 'RESERVA');
SELECT import_fault_line(701, 7, 'EV_EsgotoDrenagem', 'RESERVA');
SELECT import_fault_line(702, 8, 'EV_EsgotoDrenagem', 'SISTEMA EM EM MANUAL');
SELECT import_fault_line(703, 9, 'EV_EsgotoDrenagem', 'SISTEMA EM AUTOMATICO');
SELECT import_fault_line(704, 10, 'EV_EsgotoDrenagem', 'SISTEMA DESLIGADO - FORA SERVIÇO');
SELECT import_fault_line(705, 11, 'EV_EsgotoDrenagem', 'BOMBA ESGOTO 1 FORA DE SERVIÇO POR OPERADOR');
SELECT import_fault_line(706, 12, 'EV_EsgotoDrenagem', 'BOMBA ESGOTO 2 FORA DE SERVIÇO POR OPERADOR');
SELECT import_fault_line(707, 13, 'EV_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(708, 14, 'EV_EsgotoDrenagem', 'XXX');
SELECT import_fault_line(709, 15, 'EV_EsgotoDrenagem', 'RESERVA');

-- ===============================================================================
-- CRIAR ESTADOS INICIAIS
-- ===============================================================================
INSERT INTO fault_event_current_state (definition_id, is_active, last_action)
SELECT id, false, NULL 
FROM fault_event_definitions
WHERE enabled = true;

-- ===============================================================================
-- CRIAR SESSÃO INICIAL
-- ===============================================================================
INSERT INTO collection_sessions (id, started_at, status, created_by, notes)
VALUES (
    uuid_generate_v4(),
    NOW(),
    'ACTIVE',
    'IMPORT_SCRIPT',
    'Sessão inicial criada durante importação dos dados'
);

-- ===============================================================================
-- RELATÓRIO DE IMPORTAÇÃO
-- ===============================================================================
SELECT 'RELATÓRIO DE IMPORTAÇÃO' as titulo;

SELECT 
    'DEFINIÇÕES IMPORTADAS' as categoria,
    COUNT(*) as total,
    COUNT(CASE WHEN type = 'AL' THEN 1 END) as alarmes,
    COUNT(CASE WHEN type = 'EV' THEN 1 END) as eventos,
    COUNT(CASE WHEN is_reserved THEN 1 END) as reservados,
    COUNT(CASE WHEN enabled THEN 1 END) as habilitados
FROM fault_event_definitions;

-- Distribuição por setor
SELECT 
    'DISTRIBUIÇÃO POR SETOR' as categoria,
    sector,
    type,
    COUNT(*) as quantidade
FROM fault_event_definitions
GROUP BY sector, type
ORDER BY sector, type;

-- Mapeamento de Words
SELECT 
    'MAPEAMENTO DE WORDS' as categoria,
    word_index,
    COUNT(*) as bits_total,
    COUNT(CASE WHEN enabled THEN 1 END) as bits_ativos
FROM fault_event_definitions
GROUP BY word_index
ORDER BY word_index;

-- Estados criados
SELECT 
    'ESTADOS CRIADOS' as categoria,
    COUNT(*) as total_estados
FROM fault_event_current_state;

-- Verificação de integridade
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM fault_event_definitions 
            GROUP BY word_index, bit_index 
            HAVING COUNT(*) > 1
        ) THEN '❌ ERRO: Bits duplicados encontrados!'
        ELSE '✅ OK: Sem duplicação de bits'
    END as verificacao_bits;

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM fault_event_definitions WHERE enabled = true) = 
             (SELECT COUNT(*) FROM fault_event_current_state) 
        THEN '✅ OK: Estados criados para todas as definições'
        ELSE '❌ ERRO: Estados em falta'
    END as verificacao_estados;

-- Teste das views
SELECT 'v_active_faults' as view_name, COUNT(*) as registros FROM v_active_faults;
SELECT 'v_sector_statistics' as view_name, COUNT(*) as registros FROM v_sector_statistics;

-- Limpar função temporária
DROP FUNCTION import_fault_line(INTEGER, INTEGER, TEXT, TEXT);

SELECT 'Importação concluída! Sistema pronto para uso.' as status;
SELECT '709 linhas do arquivo Falhas_Eventos.txt foram processadas' as info;
SELECT 'Execute agora: SELECT * FROM fault_event_definitions ORDER BY line_number;' as proximo_passo;