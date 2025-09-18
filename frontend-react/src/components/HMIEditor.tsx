import React, { useState, useRef, useEffect } from 'react';
import NivelCaldeira from '@/components/Eclusa/caldeira/Nivel_Caldeira';
import NivelMontante from '@/components/Eclusa/caldeira/Nivel_Montante';
import NivelJusante from '@/components/Eclusa/caldeira/Nivel_Jusante';

interface ComponentConfig {
  id: string;
  type: 'nivel-caldeira' | 'nivel-montante' | 'nivel-jusante';
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  visible: boolean;
  websocketValue?: number;
}

interface HMIEditorProps {
  editMode: boolean;
  onSave: (configs: ComponentConfig[]) => void;
  children: React.ReactNode;
  websocketData?: {
    nivelCaldeira?: number;
    nivelMontante?: number;
    nivelJusante?: number;
  };
}

export default function HMIEditor({ editMode, onSave, children, websocketData }: HMIEditorProps) {
  const [components, setComponents] = useState<ComponentConfig[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const editorRef = useRef<HTMLDivElement>(null);

  // Carrega configurações salvas
  useEffect(() => {
    const saved = localStorage.getItem('hmi-components-config');
    if (saved) {
      try {
        setComponents(JSON.parse(saved));
      } catch (e) {
        console.warn('Erro ao carregar configurações HMI:', e);
      }
    }
  }, []);

  // Salva configurações
  const saveConfig = () => {
    localStorage.setItem('hmi-components-config', JSON.stringify(components));
    onSave(components);
    console.log('✅ Configurações HMI salvas:', components);
  };

  // Adiciona novo componente
  const addComponent = (type: 'nivel-caldeira' | 'nivel-montante' | 'nivel-jusante') => {
    const defaultSizes = {
      'nivel-caldeira': { width: 350, height: 80 },
      'nivel-montante': { width: 250, height: 70 },
      'nivel-jusante': { width: 185, height: 60 }
    };
    
    const newComponent: ComponentConfig = {
      id: `${type}-${Date.now()}`,
      type,
      x: 200,
      y: 200,
      ...defaultSizes[type],
      scale: 1,
      visible: true
    };
    setComponents(prev => [...prev, newComponent]);
  };

  // Renderiza o componente correto baseado no tipo
  const renderComponent = (comp: ComponentConfig) => {
    const commonProps = {
      editMode: false, // Componente sempre em modo operação
      websocketValue: getWebsocketValue(comp.type),
      componentWidth: comp.width,
      componentHeight: comp.height,
    };

    switch (comp.type) {
      case 'nivel-caldeira':
        return <NivelCaldeira {...commonProps} />;
      case 'nivel-montante':
        return <NivelMontante {...commonProps} />;
      case 'nivel-jusante':
        return <NivelJusante {...commonProps} />;
      default:
        return (
          <div className="w-full h-full bg-gray-500/20 border border-gray-500 flex items-center justify-center text-xs">
            Componente desconhecido: {comp.type}
          </div>
        );
    }
  };

  // Pega valor do websocket baseado no tipo
  const getWebsocketValue = (type: string) => {
    if (!websocketData) return 50; // Valor padrão

    switch (type) {
      case 'nivel-caldeira':
        return websocketData.nivelCaldeira ?? 75;
      case 'nivel-montante':
        return websocketData.nivelMontante ?? 60;
      case 'nivel-jusante':
        return websocketData.nivelJusante ?? 45;
      default:
        return 50;
    }
  };

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent, componentId: string) => {
    if (!editMode) return;
    e.preventDefault();
    setSelectedComponent(componentId);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!editMode || !isDragging || !selectedComponent) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setComponents(prev => prev.map(comp => 
      comp.id === selectedComponent 
        ? { ...comp, x: comp.x + deltaX, y: comp.y + deltaY }
        : comp
    ));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setSelectedComponent(null);
  };

  // Atualiza propriedades do componente
  const updateComponent = (id: string, updates: Partial<ComponentConfig>) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  };

  // Remove componente
  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    setSelectedComponent(null);
  };

  const selectedConfig = components.find(c => c.id === selectedComponent);

  return (
    <div className="relative w-full h-full">
      {/* Editor de componentes */}
      <div
        ref={editorRef}
        className="w-full h-full relative"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {children}

        {/* Renderiza componentes HMI */}
        {components.map(comp => (
          <div
            key={comp.id}
            style={{
              position: 'absolute',
              left: comp.x,
              top: comp.y,
              width: comp.width,
              height: comp.height,
              transform: `scale(${comp.scale})`,
              transformOrigin: 'top left',
              border: editMode ? '2px solid #ff0000' : 'none', // Sempre vermelho para debug
              backgroundColor: editMode ? 'rgba(255, 0, 0, 0.3)' : 'transparent', // Sempre visível
              cursor: editMode ? 'move' : 'default',
              zIndex: selectedComponent === comp.id ? 1000 : 500, // Z-index mais alto
              display: comp.visible ? 'block' : 'none'
            }}
            onMouseDown={(e) => handleMouseDown(e, comp.id)}
          >
            {/* Debug info */}
            <div className="absolute -top-6 left-0 text-xs bg-red-600 text-white px-1 rounded z-50">
              {comp.type} ({comp.x}, {comp.y})
            </div>
            
            {/* Componente real renderizado */}
            {renderComponent(comp)}

            {/* Handles de redimensionamento */}
            {editMode && selectedComponent === comp.id && (
              <>
                <div 
                  className="absolute -right-1 -bottom-1 w-3 h-3 bg-green-500 cursor-se-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    // TODO: Implementar redimensionamento
                  }}
                />
                <button
                  className="absolute -top-6 -right-6 bg-red-500 text-white w-5 h-5 rounded text-xs"
                  onClick={() => removeComponent(comp.id)}
                >
                  ×
                </button>
              </>
            )}
          </div>
        ))}

        {/* Grid de alinhamento */}
        {editMode && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,255,0,0.2) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,255,0,0.2) 1px, transparent 1px)
              `,
              backgroundSize: '25px 25px'
            }}
          />
        )}
      </div>

      {/* Painel de controle */}
      {editMode && (
        <div className="fixed right-4 top-20 w-80 bg-black/95 border-2 border-green-500 text-white p-4 rounded-lg text-sm z-50 shadow-2xl">
          <h3 className="font-bold mb-3">🛠️ Editor HMI</h3>
          
          {/* Botões para adicionar componentes */}
          <div className="mb-4">
            <p className="text-sm mb-3 font-bold text-green-400">🎯 Adicionar Componentes:</p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => addComponent('nivel-caldeira')}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-bold transition-colors"
              >
                ➕ Nível Caldeira
              </button>
              <button 
                onClick={() => addComponent('nivel-montante')}
                className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-sm font-bold transition-colors"
              >
                ➕ Nível Montante
              </button>
              <button 
                onClick={() => addComponent('nivel-jusante')}
                className="bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded text-sm font-bold transition-colors"
              >
                ➕ Nível Jusante
              </button>
            </div>
          </div>

          {/* Propriedades do componente selecionado */}
          {selectedConfig && (
            <div className="mb-4 p-3 bg-gray-800 rounded">
              <p className="font-bold text-xs mb-2">📐 {selectedConfig.id}</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label>X:</label>
                <input 
                  type="number" 
                  value={Math.round(selectedConfig.x)}
                  onChange={(e) => updateComponent(selectedConfig.id, { x: Number(e.target.value) })}
                  className="bg-gray-700 px-1 py-0.5 rounded w-full"
                />
                
                <label>Y:</label>
                <input 
                  type="number" 
                  value={Math.round(selectedConfig.y)}
                  onChange={(e) => updateComponent(selectedConfig.id, { y: Number(e.target.value) })}
                  className="bg-gray-700 px-1 py-0.5 rounded w-full"
                />
                
                <label>Width:</label>
                <input 
                  type="number" 
                  value={selectedConfig.width}
                  onChange={(e) => updateComponent(selectedConfig.id, { width: Number(e.target.value) })}
                  className="bg-gray-700 px-1 py-0.5 rounded w-full"
                />
                
                <label>Height:</label>
                <input 
                  type="number" 
                  value={selectedConfig.height}
                  onChange={(e) => updateComponent(selectedConfig.id, { height: Number(e.target.value) })}
                  className="bg-gray-700 px-1 py-0.5 rounded w-full"
                />
                
                <label>Scale:</label>
                <input 
                  type="number" 
                  step="0.1"
                  min="0.1"
                  max="3"
                  value={selectedConfig.scale}
                  onChange={(e) => updateComponent(selectedConfig.id, { scale: Number(e.target.value) })}
                  className="bg-gray-700 px-1 py-0.5 rounded w-full"
                />
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex flex-col gap-2">
            <button 
              onClick={saveConfig}
              className="bg-green-600 px-3 py-2 rounded text-sm font-bold"
            >
              💾 Salvar
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('hmi-components-config');
                setComponents([]);
                setSelectedComponent(null);
              }}
              className="bg-red-600 px-3 py-2 rounded text-sm font-bold"
            >
              🗑️ Limpar Tudo
            </button>
            <button 
              onClick={() => {
                // Espalha componentes para debug
                setComponents(prev => prev.map((comp, index) => ({
                  ...comp,
                  x: 100 + (index % 5) * 150,
                  y: 200 + Math.floor(index / 5) * 100
                })));
              }}
              className="bg-yellow-600 px-3 py-2 rounded text-sm font-bold"
            >
              🎯 Espalhar
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            {components.length} componentes • Clique para selecionar
          </p>
        </div>
      )}
    </div>
  );
}