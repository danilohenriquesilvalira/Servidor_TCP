import React, { useState } from 'react';
import { usePLC } from '../../contexts/PLCContext';

const TagsViewer: React.FC = () => {
  const { data: plcData, connectionStatus } = usePLC();
  const [expandedSections, setExpandedSections] = useState<string[]>(['words', 'ints', 'reals', 'bits']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isExpanded = (section: string) => expandedSections.includes(section);

  // Debug removido para evitar spam no console e rate limiting

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Tags WebSocket - BitExtractor</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {connectionStatus.connected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>

      {!plcData ? (
        <div className="text-center py-8 text-gray-500">
          Aguardando dados do WebSocket...
        </div>
      ) : (
        <div className="space-y-4">
          {/* DEBUG INFO */}
          <div className="bg-yellow-100 p-3 rounded border">
            <h3 className="font-bold text-yellow-800 mb-2">DEBUG INFO:</h3>
            <div className="text-xs space-y-1">
              <div>Words length: {plcData.words?.length || 0}</div>
              <div>Bit Data exists: {plcData.bit_data ? 'SIM' : 'NÃO'}</div>
              <div>Status Bits length: {plcData.bit_data?.status_bits?.length || 0}</div>
              <div>Alarm Bits length: {plcData.bit_data?.alarm_bits?.length || 0}</div>
              <div>Event Bits length: {plcData.bit_data?.event_bits?.length || 0}</div>
            </div>
          </div>

          {/* INTS */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('ints')}
              className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 transition-colors"
            >
              <span className="font-semibold text-green-800">
                Integers ({plcData.ints?.length || 0} itens)
              </span>
              <span className={`transform transition-transform ${isExpanded('ints') ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {isExpanded('ints') && (
              <div className="p-3 bg-gray-50 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-4 gap-2">
                  {plcData.ints?.map((value, index) => (
                    <div key={index} className="text-xs bg-white p-2 rounded border">
                      <div className="font-mono text-green-600">Int[{index}]</div>
                      <div className="font-bold">{value}</div>
                    </div>
                  )) || <div className="text-gray-500">Nenhum dado</div>}
                </div>
              </div>
            )}
          </div>

          {/* REALS */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('reals')}
              className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <span className="font-semibold text-purple-800">
                Reals ({plcData.reals?.length || 0} itens)
              </span>
              <span className={`transform transition-transform ${isExpanded('reals') ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {isExpanded('reals') && (
              <div className="p-3 bg-gray-50 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2">
                  {plcData.reals?.map((value, index) => (
                    <div key={index} className="text-xs bg-white p-2 rounded border">
                      <div className="font-mono text-purple-600">Real[{index}]</div>
                      <div className="font-bold">{value.toFixed(2)}</div>
                    </div>
                  )) || <div className="text-gray-500">Nenhum dado</div>}
                </div>
              </div>
            )}
          </div>

          {/* STATUS BITS */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('bits')}
              className="w-full flex items-center justify-between p-3 bg-yellow-50 hover:bg-yellow-100 transition-colors"
            >
              <span className="font-semibold text-yellow-800">
                Status Bits ({plcData.bit_data?.status_bits?.length || 0} words)
              </span>
              <span className={`transform transition-transform ${isExpanded('bits') ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {isExpanded('bits') && (
              <div className="p-3 bg-gray-50 max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {plcData.bit_data?.status_bits?.map((wordBits, wordIndex) => (
                    <div key={wordIndex} className="bg-white p-2 rounded border">
                      <div className="font-mono text-yellow-600 mb-1">Word[{wordIndex}]</div>
                      <div className="grid grid-cols-16 gap-1">
                        {wordBits?.map((bit, bitIndex) => (
                          <div
                            key={bitIndex}
                            className={`w-4 h-4 text-xs flex items-center justify-center rounded ${
                              bit ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                            }`}
                            title={`Bit ${bitIndex}: ${bit}`}
                          >
                            {bitIndex}
                          </div>
                        )) || (
                          <div className="text-gray-500 text-xs">Nenhum bit</div>
                        )}
                      </div>
                    </div>
                  )) || <div className="text-gray-500">Nenhum dado</div>}
                </div>
              </div>
            )}
          </div>

          {/* ALARM BITS */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('alarm_bits')}
              className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <span className="font-semibold text-red-800">
                Alarm Bits ({plcData.bit_data?.alarm_bits?.length || 0} words)
              </span>
              <span className={`transform transition-transform ${isExpanded('alarm_bits') ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {isExpanded('alarm_bits') && (
              <div className="p-3 bg-gray-50 max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {plcData.bit_data?.alarm_bits?.map((wordBits, wordIndex) => (
                    <div key={wordIndex} className="bg-white p-2 rounded border">
                      <div className="font-mono text-red-600 mb-1">Alarm Word[{wordIndex}]</div>
                      <div className="grid grid-cols-16 gap-1">
                        {wordBits?.map((bit, bitIndex) => (
                          <div
                            key={bitIndex}
                            className={`w-4 h-4 text-xs flex items-center justify-center rounded ${
                              bit ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600'
                            }`}
                            title={`Alarm Bit ${bitIndex}: ${bit}`}
                          >
                            {bitIndex}
                          </div>
                        )) || (
                          <div className="text-gray-500 text-xs">Nenhum bit</div>
                        )}
                      </div>
                    </div>
                  )) || <div className="text-gray-500">Nenhum dado</div>}
                </div>
              </div>
            )}
          </div>

          {/* STRINGS */}
          {plcData.strings && plcData.strings.length > 0 && (
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('strings')}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-gray-800">
                  Strings ({plcData.strings?.length || 0} itens)
                </span>
                <span className={`transform transition-transform ${isExpanded('strings') ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {isExpanded('strings') && (
                <div className="p-3 bg-gray-50 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {plcData.strings?.map((value, index) => (
                      <div key={index} className="text-xs bg-white p-2 rounded border">
                        <div className="font-mono text-gray-600">String[{index}]</div>
                        <div className="font-bold break-all">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* INFO TIMESTAMP */}
          <div className="bg-gray-100 p-3 rounded text-sm text-gray-600">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Última atualização:</strong><br />
                {plcData.timestamp ? new Date(plcData.timestamp).toLocaleString() : 'N/A'}
              </div>
              <div>
                <strong>Tamanho dos dados:</strong><br />
                {plcData.bytes_size ? `${plcData.bytes_size} bytes` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsViewer;