import React from 'react';
import { usePLC } from '../contexts/PLCContext';
import BasePistaoEnchimento from '../components/Enchimento/BasePistaoEnchimento';
import PistaoEnchimento from '../components/Enchimento/PistaoEnchimento';
import CilindroEnchimento from '../components/Enchimento/CilindroEnchimento';
import PipeSystem from '../components/Enchimento/PipeSystem';
import ValvulaOnOff from '../components/Enchimento/ValvulaOnOff';
import ValvulaFlange from '../components/Enchimento/ValvulaFlange';
import MotorEnchimento from '../components/Enchimento/MotorEnchimento';
import ValvulaGaveta from '../components/Enchimento/ValvulaGaveta';
import ValveDirecional from '../components/Enchimento/ValveDirecional';
import ValvulaVertical from '../components/Enchimento/ValvulaVertical';

interface EnchimentoProps {
  sidebarOpen?: boolean;
}

// Configuração responsiva da BASE dos pistões - REDUZIDO 30%
const BASE_PISTAO_CONFIG = {
  desktop: {
    direito: {
      verticalPercent: 84.9,
      horizontalPercent: 74.2,
      widthPercent: 18.872, // 26.96 * 0.7 (redução de 30%)
      heightPercent: 50.3216, // 71.888 * 0.7 (redução de 30%)
    },
    esquerdo: {
      verticalPercent: 84.9,
      horizontalPercent: 0.9,
      widthPercent: 18.872, // 26.96 * 0.7 (redução de 30%)
      heightPercent: 50.3216, // 71.888 * 0.7 (redução de 30%)
    }
  },
  mobile: {
    direito: {
      verticalPercent: 50,
      horizontalPercent: 70,
      widthPercent: 21.84, // 31.2 * 0.7 (redução de 30%)
      heightPercent: 43.68, // 62.4 * 0.7 (redução de 30%)
    },
    esquerdo: {
      verticalPercent: 50,
      horizontalPercent: 5,
      widthPercent: 21.84, // 31.2 * 0.7 (redução de 30%)
      heightPercent: 43.68, // 62.4 * 0.7 (redução de 30%)
    }
  }
};

// Configuração responsiva do PISTÃO MÓVEL - REDUZIDO 30%
const PISTAO_CONFIG = {
  desktop: {
    direito: {
      verticalPercent: 56,
      horizontalPercent: 68.5,
      widthPercent: 30.324, // 43.32 * 0.7 (redução de 30%)
      heightPercent: 75.81, // 108.3 * 0.7 (redução de 30%)
    },
    esquerdo: {
      verticalPercent: 56,
      horizontalPercent: -4.8,
      widthPercent: 30.324, // 43.32 * 0.7 (redução de 30%)
      heightPercent: 75.81, // 108.3 * 0.7 (redução de 30%)
    }
  },
  mobile: {
    direito: {
      verticalPercent: 50,
      horizontalPercent: 70,
      widthPercent: 35.378, // 50.54 * 0.7 (redução de 30%)
      heightPercent: 60.648, // 86.64 * 0.7 (redução de 30%)
    },
    esquerdo: {
      verticalPercent: 50,
      horizontalPercent: 5,
      widthPercent: 35.378, // 50.54 * 0.7 (redução de 30%)
      heightPercent: 60.648, // 86.64 * 0.7 (redução de 30%)
    }
  }
};

// Configuração responsiva dos CILINDROS - REDUZIDO MAIS 2%
const CILINDRO_CONFIG = {
  desktop: {
    direito: {
      verticalPercent: 14.5,
      horizontalPercent: 77.8,
      widthPercent: 11.675794, // 11.914076 * 0.98 (redução adicional de 2%)
      heightPercent: 58.37899,  // 59.57040 * 0.98 (redução adicional de 2%)
    },
    esquerdo: {
      verticalPercent: 14.5,
      horizontalPercent: 4.5,
      widthPercent: 11.675794, // 11.914076 * 0.98 (redução adicional de 2%)
      heightPercent: 58.37899,  // 59.57040 * 0.98 (redução adicional de 2%)
    }
  },
  mobile: {
    direito: {
      verticalPercent: 20,
      horizontalPercent: 75,
      widthPercent: 21.892115, // 22.338893 * 0.98 (redução adicional de 2%)
      heightPercent: 63.85199,  // 65.15509 * 0.98 (redução adicional de 2%)
    },
    esquerdo: {
      verticalPercent: 20,
      horizontalPercent: 8,
      widthPercent: 21.892115, // 22.338893 * 0.98 (redução adicional de 2%)
      heightPercent: 63.85199,  // 65.15509 * 0.98 (redução adicional de 2%)
    }
  }
};

// Configuração responsiva do PIPE SYSTEM - para ajustes de posição e altura
const PIPE_SYSTEM_CONFIG = {
  desktop: {
    verticalPercent: -2,      // % da altura total (posição Y) - ajustável
    horizontalPercent: 0,    // % da largura total (posição X) - ajustável  
    widthPercent: 94,       // % da largura total (tamanho) - ajustável
    heightPercent: 94,      // % da altura total (tamanho) - ajustável
  },
  mobile: {
    verticalPercent: 0,      // % da altura total (posição Y) - ajustável
    horizontalPercent: 0,    // % da largura total (posição X) - ajustável
    widthPercent: 100,       // % da largura total (tamanho) - ajustável
    heightPercent: 100,      // % da altura total (tamanho) - ajustável
  }
};

// Configuração responsiva do SUPORTE PISTA - SVG - DOIS ELEMENTOS (ESQUERDO/DIREITO)
const SUPORTE_PISTA_CONFIG = {
  desktop: {
    esquerdo: {
      verticalPercent: 59.7,      // % da altura total (posição Y) - ajustável
      horizontalPercent: -7.1,    // % da largura total (posição X) - ajustável
      widthPercent: 35,         // % da largura total (tamanho) - ajustável
      heightPercent: 23,        // % da altura total (tamanho) - ajustável
    },
    direito: {
      verticalPercent: 59.7,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 66.0,    // % da largura total (posição X) - ajustável
      widthPercent: 35,         // % da largura total (tamanho) - ajustável
      heightPercent: 23,        // % da altura total (tamanho) - ajustável
    }
  },
  mobile: {
    esquerdo: {
      verticalPercent: 75,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 5,     // % da largura total (posição X) - ajustável
      widthPercent: 50,         // % da largura total (tamanho) - ajustável
      heightPercent: 30,        // % da altura total (tamanho) - ajustável
    },
    direito: {
      verticalPercent: 75,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 45,    // % da largura total (posição X) - ajustável
      widthPercent: 50,         // % da largura total (tamanho) - ajustável
      heightPercent: 30,        // % da altura total (tamanho) - ajustável
    }
  }
};

// Configuração responsiva do BASE FUNDO ENCHIMENTO - SVG DE FUNDO
const BASE_FUNDO_ENCHIMENTO_CONFIG = {
  desktop: {
    verticalPercent: 24,       // % da altura total (posição Y) - ajustável
    horizontalPercent: -12,     // % da largura total (posição X) - ajustável
    widthPercent: 120,        // % da largura total (tamanho) - ajustável
    heightPercent: 120,       // % da altura total (tamanho) - ajustável
  },
  mobile: {
    verticalPercent: 0,       // % da altura total (posição Y) - ajustável
    horizontalPercent: 0,     // % da largura total (posição X) - ajustável
    widthPercent: 100,        // % da largura total (tamanho) - ajustável
    heightPercent: 100,       // % da altura total (tamanho) - ajustável
  }
};

// Configuração responsiva das VÁLVULAS ON/OFF - 6 VÁLVULAS (3 ESQUERDA + 3 DIREITA)
const VALVULA_CONFIG = {
  desktop: {
    // LADO ESQUERDO - 3 válvulas
    esquerda1: {
      verticalPercent: 19,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 33.5,     // % da largura total (posição X) - ajustável
      widthPercent: 3,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,         // % da altura total (tamanho) - ajustável
    },
    esquerda2: {
      verticalPercent: 19,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 36.9,     // % da largura total (posição X) - ajustável
      widthPercent: 3,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,         // % da altura total (tamanho) - ajustável
    },
    esquerda3: {
      verticalPercent: 19,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 40.4,    // % da largura total (posição X) - ajustável
      widthPercent: 3,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,         // % da altura total (tamanho) - ajustável
    },
    // LADO DIREITO - 3 válvulas
    direita1: {
      verticalPercent: 19,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 52.2,    // % da largura total (posição X) - ajustável
      widthPercent: 3,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,         // % da altura total (tamanho) - ajustável
    },
    direita2: {
      verticalPercent: 19,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 55.7,    // % da largura total (posição X) - ajustável
      widthPercent: 3,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,         // % da altura total (tamanho) - ajustável
    },
    direita3: {
      verticalPercent: 19,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 59.2,    // % da largura total (posição X) - ajustável
      widthPercent: 3,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,         // % da altura total (tamanho) - ajustável
    }
  },
  mobile: {
    // LADO ESQUERDO - 3 válvulas
    esquerda1: {
      verticalPercent: 35,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 10,    // % da largura total (posição X) - ajustável
      widthPercent: 8,          // % da largura total (tamanho) - ajustável
      heightPercent: 12,        // % da altura total (tamanho) - ajustável
    },
    esquerda2: {
      verticalPercent: 55,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 15,    // % da largura total (posição X) - ajustável
      widthPercent: 8,          // % da largura total (tamanho) - ajustável
      heightPercent: 12,        // % da altura total (tamanho) - ajustável
    },
    esquerda3: {
      verticalPercent: 75,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 20,    // % da largura total (posição X) - ajustável
      widthPercent: 8,          // % da largura total (tamanho) - ajustável
      heightPercent: 12,        // % da altura total (tamanho) - ajustável
    },
    // LADO DIREITO - 3 válvulas
    direita1: {
      verticalPercent: 35,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 75,    // % da largura total (posição X) - ajustável
      widthPercent: 8,          // % da largura total (tamanho) - ajustável
      heightPercent: 12,        // % da altura total (tamanho) - ajustável
    },
    direita2: {
      verticalPercent: 55,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 0,    // % da largura total (posição X) - ajustável
      widthPercent: 8,          // % da largura total (tamanho) - ajustável
      heightPercent: 12,        // % da altura total (tamanho) - ajustável
    },
    direita3: {
      verticalPercent: 75,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 0,    // % da largura total (posição X) - ajustável
      widthPercent: 8,          // % da largura total (tamanho) - ajustável
      heightPercent: 12,        // % da altura total (tamanho) - ajustável
    }
  }
};

// Configuração responsiva das VÁLVULAS FLANGE - 6 VÁLVULAS (3 ESQUERDA + 3 DIREITA)
const VALVULA_FLANGE_CONFIG = {
  desktop: {
    // LADO ESQUERDO - 3 válvulas flange
    esquerda1: {
      verticalPercent: 16.2,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 33.1,    // % da largura total (posição X) - ajustável
      widthPercent: 2,          // % da largura total (tamanho) - ajustável
      heightPercent: 3.5,         // % da altura total (tamanho) - ajustável
    },
    esquerda2: {
      verticalPercent: 16.2,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 36.6,    // % da largura total (posição X) - ajustável
      widthPercent: 2,          // % da largura total (tamanho) - ajustável
      heightPercent: 3.5,         // % da altura total (tamanho) - ajustável
    },
    esquerda3: {
      verticalPercent: 16.2,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 40.1,    // % da largura total (posição X) - ajustável
      widthPercent: 2,          // % da largura total (tamanho) - ajustável
      heightPercent: 3.5,         // % da altura total (tamanho) - ajustável
    },
    // LADO DIREITO - 3 válvulas flange
    direita1: {
      verticalPercent: 16.2,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 51.97,    // % da largura total (posição X) - ajustável
      widthPercent: 2,          // % da largura total (tamanho) - ajustável
      heightPercent: 3.5,         // % da altura total (tamanho) - ajustável
    },
    direita2: {
      verticalPercent: 16.2,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 55.48,    // % da largura total (posição X) - ajustável
      widthPercent: 2,          // % da largura total (tamanho) - ajustável
      heightPercent: 3.5,         // % da altura total (tamanho) - ajustável
    },
    direita3: {
      verticalPercent: 16.2,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 58.91,    // % da largura total (posição X) - ajustável
      widthPercent: 2,          // % da largura total (tamanho) - ajustável
      heightPercent: 3.5,         // % da altura total (tamanho) - ajustável
    }
  },
  mobile: {
    // LADO ESQUERDO - 3 válvulas flange
    esquerda1: {
      verticalPercent: 50,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 25,    // % da largura total (posição X) - ajustável
      widthPercent: 4,          // % da largura total (tamanho) - ajustável
      heightPercent: 10,        // % da altura total (tamanho) - ajustável
    },
    esquerda2: {
      verticalPercent: 50,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 30,    // % da largura total (posição X) - ajustável
      widthPercent: 4,          // % da largura total (tamanho) - ajustável
      heightPercent: 10,        // % da altura total (tamanho) - ajustável
    },
    esquerda3: {
      verticalPercent: 50,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 35,    // % da largura total (posição X) - ajustável
      widthPercent: 4,          // % da largura total (tamanho) - ajustável
      heightPercent: 10,        // % da altura total (tamanho) - ajustável
    },
    // LADO DIREITO - 3 válvulas flange
    direita1: {
      verticalPercent: 50,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 60,    // % da largura total (posição X) - ajustável
      widthPercent: 4,          // % da largura total (tamanho) - ajustável
      heightPercent: 10,        // % da altura total (tamanho) - ajustável
    },
    direita2: {
      verticalPercent: 50,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 65,    // % da largura total (posição X) - ajustável
      widthPercent: 4,          // % da largura total (tamanho) - ajustável
      heightPercent: 10,        // % da altura total (tamanho) - ajustável
    },
    direita3: {
      verticalPercent: 50,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 70,    // % da largura total (posição X) - ajustável
      widthPercent: 4,          // % da largura total (tamanho) - ajustável
      heightPercent: 10,        // % da altura total (tamanho) - ajustável
    }
  }
};

// Configuração responsiva do TANQUE OLEO - SVG ESTÁTICO
const TANQUE_OLEO_CONFIG = {
  desktop: {
    verticalPercent: 41.7,       // % da altura total (posição Y) - ajustável
    horizontalPercent: 19.9,     // % da largura total (posição X) - ajustável
    widthPercent: 54,          // % da largura total (tamanho) - ajustável
    heightPercent: 54,         // % da altura total (tamanho) - ajustável
  },
  mobile: {
    verticalPercent: 80,       // % da altura total (posição Y) - ajustável
    horizontalPercent: 35,     // % da largura total (posição X) - ajustável
    widthPercent: 30,          // % da largura total (tamanho) - ajustável
    heightPercent: 20,         // % da altura total (tamanho) - ajustável
  }
};

// Configuração responsiva dos MOTORES - DOIS MOTORES (ESQUERDO/DIREITO)
const MOTOR_CONFIG = {
  desktop: {
    esquerdo: {
      verticalPercent: 51.5,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 30.7,    // % da largura total (posição X) - ajustável
      widthPercent: 12,         // % da largura total (tamanho) - ajustável
      heightPercent: 8,         // % da altura total (tamanho) - ajustável
    },
    direito: {
      verticalPercent: 51.5,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 51.3,    // % da largura total (posição X) - ajustável
      widthPercent: 12,         // % da largura total (tamanho) - ajustável
      heightPercent: 8,         // % da altura total (tamanho) - ajustável
    }
  },
  mobile: {
    esquerdo: {
      verticalPercent: 90,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 10,    // % da largura total (posição X) - ajustável
      widthPercent: 20,         // % da largura total (tamanho) - ajustável
      heightPercent: 10,        // % da altura total (tamanho) - ajustável
    },
    direito: {
      verticalPercent: 90,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 70,    // % da largura total (posição X) - ajustável
      widthPercent: 20,         // % da largura total (tamanho) - ajustável
      heightPercent: 10,        // % da altura total (tamanho) - ajustável
    }
  }
};

// Configuração responsiva das VÁLVULAS GAVETA - 6 VÁLVULAS (3 ESQUERDA + 3 DIREITA)
const VALVULA_GAVETA_CONFIG = {
  desktop: {
    // LADO ESQUERDO - 3 válvulas gaveta
    esquerda1: {
      verticalPercent: 57,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 15,    // % da largura total (posição X) - ajustável
      widthPercent: 2.5,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,        // % da altura total (tamanho) - ajustável
    },
    esquerda2: {
      verticalPercent: 61.8,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 18,    // % da largura total (posição X) - ajustável
      widthPercent: 2.5,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,        // % da altura total (tamanho) - ajustável
    },
    esquerda3: {
      verticalPercent: 51,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 25.5,    // % da largura total (posição X) - ajustável
      widthPercent: 2.5,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,        // % da altura total (tamanho) - ajustável
    },
    // LADO DIREITO - 3 válvulas gaveta
    direita1: {
      verticalPercent: 57,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 76.5,    // % da largura total (posição X) - ajustável
      widthPercent: 2.5,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,        // % da altura total (tamanho) - ajustável
    },
    direita2: {
      verticalPercent: 61.8,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 73.5,    // % da largura total (posição X) - ajustável
      widthPercent: 2.5,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,        // % da altura total (tamanho) - ajustável
    },
    direita3: {
      verticalPercent: 51,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 66,    // % da largura total (posição X) - ajustável
      widthPercent: 2.5,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,        // % da altura total (tamanho) - ajustável
    }
  },
  mobile: {
    // LADO ESQUERDO - 3 válvulas gaveta
    esquerda1: {
      verticalPercent: 65,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 15,    // % da largura total (posição X) - ajustável
      widthPercent: 12,         // % da largura total (tamanho) - ajustável
      heightPercent: 20,        // % da altura total (tamanho) - ajustável
    },
    esquerda2: {
      verticalPercent: 65,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 30,    // % da largura total (posição X) - ajustável
      widthPercent: 12,         // % da largura total (tamanho) - ajustável
      heightPercent: 20,        // % da altura total (tamanho) - ajustável
    },
    esquerda3: {
      verticalPercent: 65,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 45,    // % da largura total (posição X) - ajustável
      widthPercent: 12,         // % da largura total (tamanho) - ajustável
      heightPercent: 20,        // % da altura total (tamanho) - ajustável
    },
    // LADO DIREITO - 3 válvulas gaveta
    direita1: {
      verticalPercent: 65,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 60,    // % da largura total (posição X) - ajustável
      widthPercent: 12,         // % da largura total (tamanho) - ajustável
      heightPercent: 20,        // % da altura total (tamanho) - ajustável
    },
    direita2: {
      verticalPercent: 65,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 75,    // % da largura total (posição X) - ajustável
      widthPercent: 12,         // % da largura total (tamanho) - ajustável
      heightPercent: 20,        // % da altura total (tamanho) - ajustável
    },
    direita3: {
      verticalPercent: 65,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 90,    // % da largura total (posição X) - ajustável
      widthPercent: 12,         // % da largura total (tamanho) - ajustável
      heightPercent: 20,        // % da altura total (tamanho) - ajustável
    }
  }
};

// Configuração responsiva das VÁLVULAS DIRECIONAIS - 6 VÁLVULAS (3 ESQUERDA + 3 DIREITA)
const VALVE_DIRECIONAL_CONFIG = {
  desktop: {
    // LADO ESQUERDO - 3 válvulas direcionais
    esquerda1: {
      verticalPercent: 35.7,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 24.1,    // % da largura total (posição X) - ajustável
      widthPercent: 4.2,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,         // % da altura total (tamanho) - ajustável
    },
    esquerda2: {
      verticalPercent: 30.3,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 31.9,    // % da largura total (posição X) - ajustável
      widthPercent: 4.2,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,         // % da altura total (tamanho) - ajustável
    },
    esquerda3: {
      verticalPercent: 42,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 31.9,    // % da largura total (posição X) - ajustável
      widthPercent: 4.2,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,         // % da altura total (tamanho) - ajustável
    },
    // LADO DIREITO - 3 válvulas direcionais
    direita1: {
      verticalPercent: 35.7,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 65.6,    // % da largura total (posição X) - ajustável
      widthPercent: 4.2,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,         // % da altura total (tamanho) - ajustável
    },
    direita2: {
      verticalPercent: 30.3,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 57.94,    // % da largura total (posição X) - ajustável
      widthPercent: 4.2,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,         // % da altura total (tamanho) - ajustável
    },
    direita3: {
      verticalPercent: 42,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 57.94,    // % da largura total (posição X) - ajustável
      widthPercent: 4.2,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,         // % da altura total (tamanho) - ajustável
    }
  },
  mobile: {
    // LADO ESQUERDO - 3 válvulas direcionais
    esquerda1: {
      verticalPercent: 30,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 15,    // % da largura total (posição X) - ajustável
      widthPercent: 10,         // % da largura total (tamanho) - ajustável
      heightPercent: 12,        // % da altura total (tamanho) - ajustável
    },
    esquerda2: {
      verticalPercent: 45,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 20,    // % da largura total (posição X) - ajustável
      widthPercent: 10,         // % da largura total (tamanho) - ajustável
      heightPercent: 12,        // % da altura total (tamanho) - ajustável
    },
    esquerda3: {
      verticalPercent: 60,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 25,    // % da largura total (posição X) - ajustável
      widthPercent: 10,         // % da largura total (tamanho) - ajustável
      heightPercent: 12,        // % da altura total (tamanho) - ajustável
    },
    // LADO DIREITO - 3 válvulas direcionais
    direita1: {
      verticalPercent: 30,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 75,    // % da largura total (posição X) - ajustável
      widthPercent: 10,         // % da largura total (tamanho) - ajustável
      heightPercent: 12,        // % da altura total (tamanho) - ajustável
    },
    direita2: {
      verticalPercent: 45,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 70,    // % da largura total (posição X) - ajustável
      widthPercent: 10,         // % da largura total (tamanho) - ajustável
      heightPercent: 12,        // % da altura total (tamanho) - ajustável
    },
    direita3: {
      verticalPercent: 60,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 65,    // % da largura total (posição X) - ajustável
      widthPercent: 10,         // % da largura total (tamanho) - ajustável
      heightPercent: 12,        // % da altura total (tamanho) - ajustável
    }
  }
};

// Configuração responsiva das VÁLVULAS VERTICAIS - 2 VÁLVULAS (ESQUERDA E DIREITA)
const VALVULA_VERTICAL_CONFIG = {
  desktop: {
    esquerda: {
      verticalPercent: 55.9,      // % da altura total (posição Y) - ajustável
      horizontalPercent:2.0,    // % da largura total (posição X) - ajustável
      widthPercent: 3,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,         // % da altura total (tamanho) - ajustável
    },
    direita: {
      verticalPercent: 55.9,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 89,    // % da largura total (posição X) - ajustável
      widthPercent: 3,          // % da largura total (tamanho) - ajustável
      heightPercent: 8,         // % da altura total (tamanho) - ajustável
    }
  },
  mobile: {
    esquerda: {
      verticalPercent: 75,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 25,    // % da largura total (posição X) - ajustável
      widthPercent: 8,          // % da largura total (tamanho) - ajustável
      heightPercent: 12,        // % da altura total (tamanho) - ajustável
    },
    direita: {
      verticalPercent: 75,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 67,    // % da largura total (posição X) - ajustável
      widthPercent: 8,          // % da largura total (tamanho) - ajustável
      heightPercent: 12,        // % da altura total (tamanho) - ajustável
    }
  }
};

const Enchimento: React.FC<EnchimentoProps> = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = React.useState({ width: 0, height: 0 });
  const [windowDimensions, setWindowDimensions] = React.useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = React.useState(false);

  // UseLayoutEffect para calcular dimensões ANTES da renderização visual
  React.useLayoutEffect(() => {
    const initializeDimensions = () => {
      if (typeof window !== 'undefined') {
        const newWindowDimensions = { width: window.innerWidth, height: window.innerHeight };
        setWindowDimensions(newWindowDimensions);
        
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setContainerDimensions({ width: rect.width, height: rect.height });
        } else {
          // Fallback: calcular dimensões baseado na janela
          const width = Math.min(newWindowDimensions.width - 32, 1920);
          setContainerDimensions({ width, height: 600 });
        }
        
        setIsInitialized(true);
      }
    };
    
    // Executar imediatamente (sem timeout)
    initializeDimensions();
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newDimensions = { width: rect.width, height: rect.height };
        
        setContainerDimensions(prev => {
          if (Math.abs(prev.width - newDimensions.width) > 10 || 
              Math.abs(prev.height - newDimensions.height) > 10) {
            return newDimensions;
          }
          return prev;
        });
      }
      
      const newWindowDimensions = { width: window.innerWidth, height: window.innerHeight };
      setWindowDimensions(prev => {
        if (Math.abs(prev.width - newWindowDimensions.width) > 10 || 
            Math.abs(prev.height - newWindowDimensions.height) > 10) {
          return newWindowDimensions;
        }
        return prev;
      });
    };
    
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Detectar se é mobile
  const isMobile = React.useMemo(() => windowDimensions.width < 1024, [windowDimensions.width]);

  // 🎯 SISTEMA IDÊNTICO AO PORTA JUSANTE/MONTANTE
  const enchimentoAspectRatio = 1348 / 600; // Baseado no container: width="1348" height="600"
  
  // 📐 EXATAMENTE IGUAL PORTA JUSANTE - maxWidth direto
  const maxWidth = Math.min(containerDimensions.width - 32, 1920); // 32px = margem mínima
  
  // 🎯 ENCHIMENTO: sistema de escala igual PortaJusante
  const enchimentoScale = isMobile ? 90 : 100; // 90% mobile, 100% desktop
  const baseEnchimentoWidth = (maxWidth * enchimentoScale) / 100;
  const baseEnchimentoHeight = baseEnchimentoWidth / enchimentoAspectRatio;
  
  // 🎯 ALTURA TOTAL DINÂMICA - igual sistema PortaJusante
  const alturaTotal = baseEnchimentoHeight;
  
  // 📡 USAR O SISTEMA PLC EXISTENTE
  const { data: plcData } = usePLC();
  
  // Extrair dados dos pistões do PLC - SISTEMA ENCHIMENTO
  const pistaoDireito = plcData?.ints?.[0] || 0;   // Pistão direito (índice 0)
  const pistaoEsquerdo = plcData?.ints?.[1] || 0;  // Pistão esquerdo (índice 1)

  // Extrair dados dos motores do PLC - SISTEMA ENCHIMENTO
  const motorEsquerdo = plcData?.ints?.[8] || 0;   // Motor esquerdo (índice 8)
  const motorDireito = plcData?.ints?.[9] || 0;    // Motor direito (índice 9)
  
  // Extrair bits dos cilindros do PLC - STATUS BITS 
  // Bit 29: Word 1, Bit 13 (29 = 1*16 + 13)
  // Bit 30: Word 1, Bit 14 (30 = 1*16 + 14)
  const cilindroDireito = plcData?.bit_data?.status_bits?.[1]?.[13] || 0;  // Cilindro direito (bit 29)
  const cilindroEsquerdo = plcData?.bit_data?.status_bits?.[1]?.[14] || 0; // Cilindro esquerdo (bit 30)

  // Extrair bits para tubulações do PipeSystem (converter para number se for boolean)
  const bit9 = Number(plcData?.bit_data?.status_bits?.[0]?.[9] || 0);
  const bit11 = Number(plcData?.bit_data?.status_bits?.[0]?.[11] || 0);
  const bit12 = Number(plcData?.bit_data?.status_bits?.[0]?.[12] || 0);
  const bit13 = Number(plcData?.bit_data?.status_bits?.[0]?.[13] || 0);
  const bit16 = Number(plcData?.bit_data?.status_bits?.[1]?.[0] || 0);
  const bit17 = Number(plcData?.bit_data?.status_bits?.[1]?.[1] || 0);
  const bit18 = Number(plcData?.bit_data?.status_bits?.[1]?.[2] || 0);
  const bit19 = Number(plcData?.bit_data?.status_bits?.[1]?.[3] || 0);
  const bit20 = Number(plcData?.bit_data?.status_bits?.[1]?.[4] || 0);
  const bit21 = Number(plcData?.bit_data?.status_bits?.[1]?.[5] || 0);
  const bit23 = Number(plcData?.bit_data?.status_bits?.[1]?.[7] || 0);
  const bit24 = Number(plcData?.bit_data?.status_bits?.[1]?.[8] || 0);
  const bit25 = Number(plcData?.bit_data?.status_bits?.[1]?.[9] || 0);
  const bit26 = Number(plcData?.bit_data?.status_bits?.[1]?.[10] || 0);
  const bit30 = Number(plcData?.bit_data?.status_bits?.[1]?.[14] || 0);
  const bit31 = Number(plcData?.bit_data?.status_bits?.[1]?.[15] || 0);
  const bit33 = Number(plcData?.bit_data?.status_bits?.[2]?.[1] || 0);
  const bit34 = Number(plcData?.bit_data?.status_bits?.[2]?.[2] || 0);
  const bit36 = Number(plcData?.bit_data?.status_bits?.[2]?.[4] || 0);

  // Extrair bits para válvulas - LADO ESQUERDO (bits 18, 19, 12)
  const valvulaEsquerda1 = Number(plcData?.bit_data?.status_bits?.[1]?.[2] || 0);  // Bit 18 (Word 1, Bit 2)
  const valvulaEsquerda2 = Number(plcData?.bit_data?.status_bits?.[1]?.[3] || 0);  // Bit 19 (Word 1, Bit 3)
  const valvulaEsquerda3 = Number(plcData?.bit_data?.status_bits?.[0]?.[12] || 0); // Bit 12 (Word 0, Bit 12)

  // Extrair bits para válvulas - LADO DIREITO (bits 13, 24, 23)
  const valvulaDireita1 = Number(plcData?.bit_data?.status_bits?.[0]?.[13] || 0);  // Bit 13 (Word 0, Bit 13)
  const valvulaDireita2 = Number(plcData?.bit_data?.status_bits?.[1]?.[8] || 0);   // Bit 24 (Word 1, Bit 8)
  const valvulaDireita3 = Number(plcData?.bit_data?.status_bits?.[1]?.[7] || 0);   // Bit 23 (Word 1, Bit 7)

  // Extrair bits para válvulas flange - MESMOS BITS DAS VÁLVULAS ON/OFF
  // LADO ESQUERDO (bits 18, 19, 12)
  const valvulaFlangeEsquerda1 = valvulaEsquerda1; // Bit 18
  const valvulaFlangeEsquerda2 = valvulaEsquerda2; // Bit 19
  const valvulaFlangeEsquerda3 = valvulaEsquerda3; // Bit 12

  // LADO DIREITO (bits 13, 24, 23)
  const valvulaFlangeDireita1 = valvulaDireita1; // Bit 13
  const valvulaFlangeDireita2 = valvulaDireita2; // Bit 24
  const valvulaFlangeDireita3 = valvulaDireita3; // Bit 23

  // Extrair bits para válvulas gaveta - LADO ESQUERDO (bits 21, 20, 2)
  const valvulaGavetaEsquerda1 = Number(plcData?.bit_data?.status_bits?.[1]?.[5] || 0);  // Bit 21 (Word 1, Bit 5)
  const valvulaGavetaEsquerda2 = Number(plcData?.bit_data?.status_bits?.[1]?.[4] || 0);  // Bit 20 (Word 1, Bit 4)
  const valvulaGavetaEsquerda3 = Number(plcData?.bit_data?.status_bits?.[0]?.[2] || 0);  // Bit 2 (Word 0, Bit 2)

  // Extrair bits para válvulas gaveta - LADO DIREITO (bits 26, 25, 4)
  const valvulaGavetaDireita1 = Number(plcData?.bit_data?.status_bits?.[1]?.[10] || 0); // Bit 26 (Word 1, Bit 10)
  const valvulaGavetaDireita2 = Number(plcData?.bit_data?.status_bits?.[1]?.[9] || 0);  // Bit 25 (Word 1, Bit 9)
  const valvulaGavetaDireita3 = Number(plcData?.bit_data?.status_bits?.[0]?.[4] || 0);  // Bit 4 (Word 0, Bit 4)

  // Extrair bits para válvulas direcionais - LADO ESQUERDO (bits 9, 8, 6)
  const valvulaDirecionalEsquerda1 = Number(plcData?.bit_data?.status_bits?.[0]?.[9] || 0);  // Bit 9 (Word 0, Bit 9)
  const valvulaDirecionalEsquerda2 = Number(plcData?.bit_data?.status_bits?.[0]?.[8] || 0);  // Bit 8 (Word 0, Bit 8)
  const valvulaDirecionalEsquerda3 = Number(plcData?.bit_data?.status_bits?.[0]?.[6] || 0);  // Bit 6 (Word 0, Bit 6)

  // Extrair bits para válvulas direcionais - LADO DIREITO (bits 15, 10, 12)
  const valvulaDirecionalDireita1 = Number(plcData?.bit_data?.status_bits?.[0]?.[15] || 0); // Bit 15 (Word 0, Bit 15)
  const valvulaDirecionalDireita2 = Number(plcData?.bit_data?.status_bits?.[0]?.[10] || 0); // Bit 10 (Word 0, Bit 10)
  const valvulaDirecionalDireita3 = Number(plcData?.bit_data?.status_bits?.[0]?.[12] || 0); // Bit 12 (Word 0, Bit 12)
  
  // Configuração responsiva BASE
  const baseConfigAtual = isMobile ? BASE_PISTAO_CONFIG.mobile : BASE_PISTAO_CONFIG.desktop;
  const basePistaoDireitoConfig = baseConfigAtual.direito;
  const basePistaoEsquerdoConfig = baseConfigAtual.esquerdo;

  // Configuração responsiva PISTÃO MÓVEL
  const pistaoConfigAtual = isMobile ? PISTAO_CONFIG.mobile : PISTAO_CONFIG.desktop;
  const pistaoDireitoConfig = pistaoConfigAtual.direito;
  const pistaoEsquerdoConfig = pistaoConfigAtual.esquerdo;

  // Configuração responsiva CILINDROS
  const cilindroConfigAtual = isMobile ? CILINDRO_CONFIG.mobile : CILINDRO_CONFIG.desktop;
  const cilindroDireitoConfig = cilindroConfigAtual.direito;
  const cilindroEsquerdoConfig = cilindroConfigAtual.esquerdo;

  // Configuração responsiva PIPE SYSTEM
  const pipeSystemConfigAtual = isMobile ? PIPE_SYSTEM_CONFIG.mobile : PIPE_SYSTEM_CONFIG.desktop;

  // Configuração responsiva SUPORTE PISTA
  const suportePistaConfigAtual = isMobile ? SUPORTE_PISTA_CONFIG.mobile : SUPORTE_PISTA_CONFIG.desktop;
  const suportePistaEsquerdoConfig = suportePistaConfigAtual.esquerdo;
  const suportePistaDireitoConfig = suportePistaConfigAtual.direito;

  // Configuração responsiva BASE FUNDO ENCHIMENTO
  const baseFundoEnchimentoConfigAtual = isMobile ? BASE_FUNDO_ENCHIMENTO_CONFIG.mobile : BASE_FUNDO_ENCHIMENTO_CONFIG.desktop;

  // Configuração responsiva VÁLVULAS
  const valvulaConfigAtual = isMobile ? VALVULA_CONFIG.mobile : VALVULA_CONFIG.desktop;
  const valvulaEsquerda1Config = valvulaConfigAtual.esquerda1;
  const valvulaEsquerda2Config = valvulaConfigAtual.esquerda2;
  const valvulaEsquerda3Config = valvulaConfigAtual.esquerda3;
  const valvulaDireita1Config = valvulaConfigAtual.direita1;
  const valvulaDireita2Config = valvulaConfigAtual.direita2;
  const valvulaDireita3Config = valvulaConfigAtual.direita3;

  // Configuração responsiva VÁLVULAS FLANGE
  const valvulaFlangeConfigAtual = isMobile ? VALVULA_FLANGE_CONFIG.mobile : VALVULA_FLANGE_CONFIG.desktop;
  const valvulaFlangeEsquerda1Config = valvulaFlangeConfigAtual.esquerda1;
  const valvulaFlangeEsquerda2Config = valvulaFlangeConfigAtual.esquerda2;
  const valvulaFlangeEsquerda3Config = valvulaFlangeConfigAtual.esquerda3;
  const valvulaFlangeDireita1Config = valvulaFlangeConfigAtual.direita1;
  const valvulaFlangeDireita2Config = valvulaFlangeConfigAtual.direita2;
  const valvulaFlangeDireita3Config = valvulaFlangeConfigAtual.direita3;

  // Configuração responsiva TANQUE OLEO
  const tanqueOleoConfigAtual = isMobile ? TANQUE_OLEO_CONFIG.mobile : TANQUE_OLEO_CONFIG.desktop;

  // Configuração responsiva MOTORES
  const motorConfigAtual = isMobile ? MOTOR_CONFIG.mobile : MOTOR_CONFIG.desktop;
  const motorEsquerdoConfig = motorConfigAtual.esquerdo;
  const motorDireitoConfig = motorConfigAtual.direito;

  // Configuração responsiva VÁLVULAS GAVETA
  const valvulaGavetaConfigAtual = isMobile ? VALVULA_GAVETA_CONFIG.mobile : VALVULA_GAVETA_CONFIG.desktop;
  const valvulaGavetaEsquerda1Config = valvulaGavetaConfigAtual.esquerda1;
  const valvulaGavetaEsquerda2Config = valvulaGavetaConfigAtual.esquerda2;
  const valvulaGavetaEsquerda3Config = valvulaGavetaConfigAtual.esquerda3;
  const valvulaGavetaDireita1Config = valvulaGavetaConfigAtual.direita1;
  const valvulaGavetaDireita2Config = valvulaGavetaConfigAtual.direita2;
  const valvulaGavetaDireita3Config = valvulaGavetaConfigAtual.direita3;

  // Configuração responsiva VÁLVULAS DIRECIONAIS
  const valvulaDirecionalConfigAtual = isMobile ? VALVE_DIRECIONAL_CONFIG.mobile : VALVE_DIRECIONAL_CONFIG.desktop;
  const valvulaDirecionalEsquerda1Config = valvulaDirecionalConfigAtual.esquerda1;
  const valvulaDirecionalEsquerda2Config = valvulaDirecionalConfigAtual.esquerda2;
  const valvulaDirecionalEsquerda3Config = valvulaDirecionalConfigAtual.esquerda3;
  const valvulaDirecionalDireita1Config = valvulaDirecionalConfigAtual.direita1;
  const valvulaDirecionalDireita2Config = valvulaDirecionalConfigAtual.direita2;
  const valvulaDirecionalDireita3Config = valvulaDirecionalConfigAtual.direita3;

  // Configuração responsiva VÁLVULAS VERTICAIS
  const valvulaVerticalConfigAtual = isMobile ? VALVULA_VERTICAL_CONFIG.mobile : VALVULA_VERTICAL_CONFIG.desktop;
  const valvulaVerticalEsquerdaConfig = valvulaVerticalConfigAtual.esquerda;
  const valvulaVerticalDireitaConfig = valvulaVerticalConfigAtual.direita;

  return (
    <div className="w-full h-auto flex flex-col items-center relative">
      {/* Container do Sistema de Enchimento */}
      <div 
        ref={containerRef}
        className="w-full max-w-[1920px] flex flex-col items-center relative z-10"
        style={{
          height: 'auto',
          minHeight: '60vh',
          overflow: 'visible'
        }}
      >
        {isInitialized && containerDimensions.width > 100 && windowDimensions.width > 0 ? (
          <div 
            className="relative w-full flex items-center justify-center"
            style={{
              maxWidth: `${maxWidth}px`,
              height: `${alturaTotal}px`,
              minHeight: `${alturaTotal}px`
            }}
          >
            {/* SISTEMA DE TUBULAÇÕES - BACKGROUND - CONFIGURAÇÃO RESPONSIVA AJUSTÁVEL */}
            <div 
              className="absolute"
              style={{
                // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
                top: `${(alturaTotal * pipeSystemConfigAtual.verticalPercent) / 100}px`,
                left: `${(maxWidth * pipeSystemConfigAtual.horizontalPercent) / 100}px`,
                width: `${(maxWidth * pipeSystemConfigAtual.widthPercent) / 100}px`,
                height: `${(alturaTotal * pipeSystemConfigAtual.heightPercent) / 100}px`,
                zIndex: 1
              }}
            >
              <PipeSystem 
                bit9={bit9}
                bit11={bit11}
                bit12={bit12}
                bit13={bit13}
                bit16={bit16}
                bit17={bit17}
                bit18={bit18}
                bit19={bit19}
                bit20={bit20}
                bit21={bit21}
                bit23={bit23}
                bit24={bit24}
                bit25={bit25}
                bit26={bit26}
                bit30={bit30}
                bit31={bit31}
                bit33={bit33}
                bit34={bit34}
                bit36={bit36}
                editMode={false}
              />
            </div>

            {/* 🏗️ BASE FUNDO ENCHIMENTO - SVG DE FUNDO - ATRÁS DOS PISTÕES MAS NA FRENTE DA BASE */}
            <div 
              className="absolute"
              style={{
                // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
                top: `${(alturaTotal * baseFundoEnchimentoConfigAtual.verticalPercent) / 100}px`,
                left: `${(maxWidth * baseFundoEnchimentoConfigAtual.horizontalPercent) / 100}px`,
                width: `${(maxWidth * baseFundoEnchimentoConfigAtual.widthPercent) / 100}px`,
                height: `${(alturaTotal * baseFundoEnchimentoConfigAtual.heightPercent) / 100}px`,
                zIndex: 8
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 1348 600"
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full"
              >
                <image
                  href="/Enchimento/Base_Fundo_Enchimento.svg"
                  width="1348"
                  height="600"
                  preserveAspectRatio="xMidYMid meet"
                />
              </svg>
            </div>

            {/* BASE PISTÃO ESQUERDO */}
          <div 
            className="absolute"
            style={{
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * basePistaoEsquerdoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * basePistaoEsquerdoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * basePistaoEsquerdoConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * basePistaoEsquerdoConfig.heightPercent) / 100}px`,
              zIndex: 5
            }}
          >
            <BasePistaoEnchimento 
              side="esquerdo"
              editMode={false}
            />
          </div>

          {/* BASE PISTÃO DIREITO */}
          <div 
            className="absolute"
            style={{
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * basePistaoDireitoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * basePistaoDireitoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * basePistaoDireitoConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * basePistaoDireitoConfig.heightPercent) / 100}px`,
              zIndex: 5
            }}
          >
            <BasePistaoEnchimento 
              side="direito"
              editMode={false}
            />
          </div>

          {/* 🎯 PISTÃO ESQUERDO - COM MOVIMENTO PROPORCIONAL - WEBSOCKET ÍNDICE 1 */}
          <div 
            className="absolute transition-all duration-200 ease-in-out"
            style={{
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * pistaoEsquerdoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * pistaoEsquerdoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * pistaoEsquerdoConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * pistaoEsquerdoConfig.heightPercent) / 100}px`,
              zIndex: 10
            }}
          >
            <PistaoEnchimento 
              websocketValue={pistaoEsquerdo}
              side="esquerdo"
              editMode={false}
            />
          </div>

          {/* 🎯 PISTÃO DIREITO - COM MOVIMENTO PROPORCIONAL - WEBSOCKET ÍNDICE 0 */}
          <div 
            className="absolute transition-all duration-200 ease-in-out"
            style={{
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * pistaoDireitoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * pistaoDireitoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * pistaoDireitoConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * pistaoDireitoConfig.heightPercent) / 100}px`,
              zIndex: 10
            }}
          >
            <PistaoEnchimento 
              websocketValue={pistaoDireito}
              side="direito"
              editMode={false}
            />
          </div>

          {/* 🔧 CILINDRO ESQUERDO - STATUS WORD BIT ÍNDICE 30 */}
          <div 
            className="absolute"
            style={{
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * cilindroEsquerdoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * cilindroEsquerdoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * cilindroEsquerdoConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * cilindroEsquerdoConfig.heightPercent) / 100}px`,
              zIndex: 5
            }}
          >
            <CilindroEnchimento 
              websocketBit={cilindroEsquerdo}
              side="esquerdo"
              editMode={false}
            />
          </div>

          {/* 🔧 CILINDRO DIREITO - STATUS WORD BIT ÍNDICE 29 */}
          <div 
            className="absolute"
            style={{
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * cilindroDireitoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * cilindroDireitoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * cilindroDireitoConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * cilindroDireitoConfig.heightPercent) / 100}px`,
              zIndex: 5
            }}
          >
            <CilindroEnchimento 
              websocketBit={cilindroDireito}
              side="direito"
              editMode={false}
            />
          </div>

          {/* 🏗️ SUPORTE PISTA ESQUERDO - SVG ESTÁTICO - Z-INDEX MAIS ALTO */}
          <div 
            className="absolute"
            style={{
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * suportePistaEsquerdoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * suportePistaEsquerdoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * suportePistaEsquerdoConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * suportePistaEsquerdoConfig.heightPercent) / 100}px`,
              zIndex: 15
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 400 200"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
            >
              <image
                href="/Enchimento/SuportePista.svg"
                width="400"
                height="200"
                preserveAspectRatio="xMidYMid meet"
              />
            </svg>
          </div>

          {/* 🏗️ SUPORTE PISTA DIREITO - SVG ESTÁTICO - Z-INDEX MAIS ALTO */}
          <div 
            className="absolute"
            style={{
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * suportePistaDireitoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * suportePistaDireitoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * suportePistaDireitoConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * suportePistaDireitoConfig.heightPercent) / 100}px`,
              zIndex: 15
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 400 200"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
            >
              <image
                href="/Enchimento/SuportePista.svg"
                width="400"
                height="200"
                preserveAspectRatio="xMidYMid meet"
              />
            </svg>
          </div>

          {/* 🔧 VÁLVULA ESQUERDA 1 - BIT 18 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaEsquerda1Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaEsquerda1Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaEsquerda1Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaEsquerda1Config.heightPercent) / 100}px`,
              zIndex: 12
            }}
          >
            <ValvulaOnOff 
              websocketBit={valvulaEsquerda1}
              editMode={false}
            />
          </div>

          {/* 🔧 VÁLVULA ESQUERDA 2 - BIT 19 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaEsquerda2Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaEsquerda2Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaEsquerda2Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaEsquerda2Config.heightPercent) / 100}px`,
              zIndex: 12
            }}
          >
            <ValvulaOnOff 
              websocketBit={valvulaEsquerda2}
              editMode={false}
            />
          </div>

          {/* 🔧 VÁLVULA ESQUERDA 3 - BIT 12 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaEsquerda3Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaEsquerda3Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaEsquerda3Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaEsquerda3Config.heightPercent) / 100}px`,
              zIndex: 12
            }}
          >
            <ValvulaOnOff 
              websocketBit={valvulaEsquerda3}
              editMode={false}
            />
          </div>

          {/* 🔧 VÁLVULA DIREITA 1 - BIT 13 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaDireita1Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaDireita1Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaDireita1Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaDireita1Config.heightPercent) / 100}px`,
              zIndex: 12
            }}
          >
            <ValvulaOnOff 
              websocketBit={valvulaDireita1}
              editMode={false}
            />
          </div>

          {/* 🔧 VÁLVULA DIREITA 2 - BIT 24 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaDireita2Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaDireita2Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaDireita2Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaDireita2Config.heightPercent) / 100}px`,
              zIndex: 12
            }}
          >
            <ValvulaOnOff 
              websocketBit={valvulaDireita2}
              editMode={false}
            />
          </div>

          {/* 🔧 VÁLVULA DIREITA 3 - BIT 23 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaDireita3Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaDireita3Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaDireita3Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaDireita3Config.heightPercent) / 100}px`,
              zIndex: 12
            }}
          >
            <ValvulaOnOff 
              websocketBit={valvulaDireita3}
              editMode={false}
            />
          </div>

          {/* 🔧 VÁLVULA FLANGE ESQUERDA 1 - BIT 18 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaFlangeEsquerda1Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaFlangeEsquerda1Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaFlangeEsquerda1Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaFlangeEsquerda1Config.heightPercent) / 100}px`,
              zIndex: 11
            }}
          >
            <ValvulaFlange 
              websocketBit={valvulaFlangeEsquerda1}
              editMode={false}
            />
          </div>

          {/* 🔧 VÁLVULA FLANGE ESQUERDA 2 - BIT 19 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaFlangeEsquerda2Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaFlangeEsquerda2Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaFlangeEsquerda2Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaFlangeEsquerda2Config.heightPercent) / 100}px`,
              zIndex: 11
            }}
          >
            <ValvulaFlange 
              websocketBit={valvulaFlangeEsquerda2}
              editMode={false}
            />
          </div>

          {/* 🔧 VÁLVULA FLANGE ESQUERDA 3 - BIT 12 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaFlangeEsquerda3Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaFlangeEsquerda3Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaFlangeEsquerda3Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaFlangeEsquerda3Config.heightPercent) / 100}px`,
              zIndex: 11
            }}
          >
            <ValvulaFlange 
              websocketBit={valvulaFlangeEsquerda3}
              editMode={false}
            />
          </div>

          {/* 🔧 VÁLVULA FLANGE DIREITA 1 - BIT 13 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaFlangeDireita1Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaFlangeDireita1Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaFlangeDireita1Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaFlangeDireita1Config.heightPercent) / 100}px`,
              zIndex: 11
            }}
          >
            <ValvulaFlange 
              websocketBit={valvulaFlangeDireita1}
              editMode={false}
            />
          </div>

          {/* 🔧 VÁLVULA FLANGE DIREITA 2 - BIT 24 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaFlangeDireita2Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaFlangeDireita2Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaFlangeDireita2Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaFlangeDireita2Config.heightPercent) / 100}px`,
              zIndex: 11
            }}
          >
            <ValvulaFlange 
              websocketBit={valvulaFlangeDireita2}
              editMode={false}
            />
          </div>

          {/* 🔧 VÁLVULA FLANGE DIREITA 3 - BIT 23 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaFlangeDireita3Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaFlangeDireita3Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaFlangeDireita3Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaFlangeDireita3Config.heightPercent) / 100}px`,
              zIndex: 11
            }}
          >
            <ValvulaFlange 
              websocketBit={valvulaFlangeDireita3}
              editMode={false}
            />
          </div>

          {/* 🛢️ TANQUE OLEO - SVG ESTÁTICO */}
          <div 
            className="absolute"
            style={{
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * tanqueOleoConfigAtual.verticalPercent) / 100}px`,
              left: `${(maxWidth * tanqueOleoConfigAtual.horizontalPercent) / 100}px`,
              width: `${(maxWidth * tanqueOleoConfigAtual.widthPercent) / 100}px`,
              height: `${(alturaTotal * tanqueOleoConfigAtual.heightPercent) / 100}px`,
              zIndex: 0
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 200 150"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
            >
              <image
                href="/Enchimento/Tanque_Oleo.svg"
                width="200"
                height="150"
                preserveAspectRatio="xMidYMid meet"
              />
            </svg>
          </div>

          {/* ⚙️ MOTOR ESQUERDO - INTEIRO 8 - ESPELHADO */}
          <div 
            className="absolute"
            style={{
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * motorEsquerdoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * motorEsquerdoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * motorEsquerdoConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * motorEsquerdoConfig.heightPercent) / 100}px`,
              zIndex: 9
            }}
          >
            <MotorEnchimento 
              websocketValue={motorEsquerdo}
              side="esquerdo"
              editMode={false}
            />
          </div>

          {/* ⚙️ MOTOR DIREITO - INTEIRO 9 */}
          <div 
            className="absolute"
            style={{
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * motorDireitoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * motorDireitoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * motorDireitoConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * motorDireitoConfig.heightPercent) / 100}px`,
              zIndex: 9
            }}
          >
            <MotorEnchimento 
              websocketValue={motorDireito}
              side="direito"
              editMode={false}
            />
          </div>

          {/* 🚪 VÁLVULA GAVETA ESQUERDA 1 - BIT 21 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaGavetaEsquerda1Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaGavetaEsquerda1Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaGavetaEsquerda1Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaGavetaEsquerda1Config.heightPercent) / 100}px`,
              zIndex: 7
            }}
          >
            <ValvulaGaveta 
              websocketBit={valvulaGavetaEsquerda1}
              editMode={false}
            />
          </div>

          {/* 🚪 VÁLVULA GAVETA ESQUERDA 2 - BIT 20 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaGavetaEsquerda2Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaGavetaEsquerda2Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaGavetaEsquerda2Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaGavetaEsquerda2Config.heightPercent) / 100}px`,
              zIndex: 7
            }}
          >
            <ValvulaGaveta 
              websocketBit={valvulaGavetaEsquerda2}
              editMode={false}
            />
          </div>

          {/* 🚪 VÁLVULA GAVETA ESQUERDA 3 - BIT 2 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaGavetaEsquerda3Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaGavetaEsquerda3Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaGavetaEsquerda3Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaGavetaEsquerda3Config.heightPercent) / 100}px`,
              zIndex: 7
            }}
          >
            <ValvulaGaveta 
              websocketBit={valvulaGavetaEsquerda3}
              editMode={false}
            />
          </div>

          {/* 🚪 VÁLVULA GAVETA DIREITA 1 - BIT 26 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaGavetaDireita1Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaGavetaDireita1Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaGavetaDireita1Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaGavetaDireita1Config.heightPercent) / 100}px`,
              zIndex: 7
            }}
          >
            <ValvulaGaveta 
              websocketBit={valvulaGavetaDireita1}
              editMode={false}
            />
          </div>

          {/* 🚪 VÁLVULA GAVETA DIREITA 2 - BIT 25 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaGavetaDireita2Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaGavetaDireita2Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaGavetaDireita2Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaGavetaDireita2Config.heightPercent) / 100}px`,
              zIndex: 7
            }}
          >
            <ValvulaGaveta 
              websocketBit={valvulaGavetaDireita2}
              editMode={false}
            />
          </div>

          {/* 🚪 VÁLVULA GAVETA DIREITA 3 - BIT 4 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaGavetaDireita3Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaGavetaDireita3Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaGavetaDireita3Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaGavetaDireita3Config.heightPercent) / 100}px`,
              zIndex: 7
            }}
          >
            <ValvulaGaveta 
              websocketBit={valvulaGavetaDireita3}
              editMode={false}
            />
          </div>

          {/* ↔️ VÁLVULA DIRECIONAL ESQUERDA 1 - BIT 9 - ESPELHADA + ROTACIONADA 90° */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaDirecionalEsquerda1Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaDirecionalEsquerda1Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaDirecionalEsquerda1Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaDirecionalEsquerda1Config.heightPercent) / 100}px`,
              zIndex: 13
            }}
          >
            <ValveDirecional 
              websocketBit={valvulaDirecionalEsquerda1}
              mirrored={true}
              rotation={-90}
              editMode={false}
            />
          </div>

          {/* ↔️ VÁLVULA DIRECIONAL ESQUERDA 2 - BIT 8 - ESPELHADA */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaDirecionalEsquerda2Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaDirecionalEsquerda2Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaDirecionalEsquerda2Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaDirecionalEsquerda2Config.heightPercent) / 100}px`,
              zIndex: 13
            }}
          >
            <ValveDirecional 
              websocketBit={valvulaDirecionalEsquerda2}
              mirrored={true}
              editMode={false}
            />
          </div>

          {/* ↔️ VÁLVULA DIRECIONAL ESQUERDA 3 - BIT 6 - ESPELHADA */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaDirecionalEsquerda3Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaDirecionalEsquerda3Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaDirecionalEsquerda3Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaDirecionalEsquerda3Config.heightPercent) / 100}px`,
              zIndex: 13
            }}
          >
            <ValveDirecional 
              websocketBit={valvulaDirecionalEsquerda3}
              mirrored={true}
              editMode={false}
            />
          </div>

          {/* ↔️ VÁLVULA DIRECIONAL DIREITA 1 - BIT 15 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaDirecionalDireita1Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaDirecionalDireita1Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaDirecionalDireita1Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaDirecionalDireita1Config.heightPercent) / 100}px`,
              zIndex: 13
            }}
          >
            <ValveDirecional 
              websocketBit={valvulaDirecionalDireita1}
              rotation={-90}
              editMode={false}
            />
          </div>

          {/* ↔️ VÁLVULA DIRECIONAL DIREITA 2 - BIT 10 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaDirecionalDireita2Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaDirecionalDireita2Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaDirecionalDireita2Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaDirecionalDireita2Config.heightPercent) / 100}px`,
              zIndex: 13
            }}
          >
            <ValveDirecional 
              websocketBit={valvulaDirecionalDireita2}
              editMode={false}
            />
          </div>

          {/* ↔️ VÁLVULA DIRECIONAL DIREITA 3 - BIT 12 */}
          <div 
            className="absolute"
            style={{
              top: `${(alturaTotal * valvulaDirecionalDireita3Config.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaDirecionalDireita3Config.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaDirecionalDireita3Config.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaDirecionalDireita3Config.heightPercent) / 100}px`,
              zIndex: 13
            }}
          >
            <ValveDirecional 
              websocketBit={valvulaDirecionalDireita3}
              editMode={false}
            />
          </div>

          {/* ↕️ VÁLVULA VERTICAL ESQUERDA - BIT 9 */}
          <div 
            className="absolute"
            style={{
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * valvulaVerticalEsquerdaConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaVerticalEsquerdaConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaVerticalEsquerdaConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaVerticalEsquerdaConfig.heightPercent) / 100}px`,
              zIndex: 14
            }}
          >
            <ValvulaVertical 
              websocketBit={bit9}
              editMode={false}
            />
          </div>

          {/* ↕️ VÁLVULA VERTICAL DIREITA - BIT 11 */}
          <div 
            className="absolute"
            style={{
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * valvulaVerticalDireitaConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * valvulaVerticalDireitaConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * valvulaVerticalDireitaConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * valvulaVerticalDireitaConfig.heightPercent) / 100}px`,
              zIndex: 14
            }}
          >
            <ValvulaVertical 
              websocketBit={bit11}
              editMode={false}
            />
          </div>
        </div>
        ) : (
          /* Loading otimizado - mantém proporções corretas */
          <div className="w-full flex items-center justify-center">
            <div 
              className="w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg animate-pulse"
              style={{ 
                height: '600px',
                maxWidth: '800px',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite'
              }}
            >
              <style>{`
                @keyframes shimmer {
                  0% { background-position: -200% 0; }
                  100% { background-position: 200% 0; }
                }
              `}</style>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Enchimento;