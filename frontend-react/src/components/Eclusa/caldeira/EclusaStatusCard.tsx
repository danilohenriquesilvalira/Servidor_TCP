import React from 'react';
import { usePLC } from '../../../contexts/PLCContext';
import { useAuth } from '../../../contexts/AuthContext';

interface EclusaStatusCardProps {
  height?: number;
}

const EclusaStatusCard: React.FC<EclusaStatusCardProps> = ({ height = 180 }) => {
  const { data: plcData, connectionStatus } = usePLC();
  const { user } = useAuth();

  // Dados do operador
  const operadorNome = user?.nome || 'N/A';

  // Status da operação baseado nos dados PLC
  const portaJusante = plcData?.ints?.[42] || 0;
  const portaMontante = plcData?.ints?.[59] || 0;

  // Determinar status operacional da eclusa
  const getStatusEclusa = () => {
    if (!connectionStatus.connected) return { status: 'Sem Operação', color: 'text-red-600', bg: 'bg-red-100' };
    if (portaJusante > 0 || portaMontante > 0) return { status: 'Operando Local', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'Telecomando', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const statusEclusa = getStatusEclusa();

  // Status da comunicação
  const getStatusComunicacao = () => {
    if (connectionStatus.connected) return { status: 'Sem Falha', color: 'text-green-600', bg: 'bg-green-100' };
    return { status: 'Com Falha', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const statusComunicacao = getStatusComunicacao();

  // Status dos alarmes (simulado - pode ser baseado em PLC real)
  const hasAlarmes = false; // TODO: conectar com dados reais do PLC
  const statusAlarmes = hasAlarmes 
    ? { status: 'Ativo', color: 'text-red-600', bg: 'bg-red-100' }
    : { status: 'Normal', color: 'text-green-600', bg: 'bg-green-100' };

  // Responsividade baseada na altura
  const isSmall = height < 160;
  
  return (
    <div 
      className="bg-gray-200 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
      style={{ height: `${height}px` }}
    >
      {/* Header azul - igual aos outros cards */}
      <div className="bg-slate-700 text-white px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-edp-electric rounded px-1.5 py-1 flex items-center justify-center">
              <svg className="w-4 h-4 text-edp-marine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h4 className="text-sm font-medium">Status da Eclusa</h4>
          </div>
          
          {/* Valores no header - lado direito igual aos outros cards */}
          <div className="flex items-center gap-3 text-xs">
            <div className="text-center">
              <div className="text-gray-300">Con</div>
              <div className={`font-bold ${connectionStatus.connected ? 'text-green-400' : 'text-red-400'}`}>
                {connectionStatus.connected ? 'OK' : 'OFF'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-300">Op</div>
              <div className={`font-bold ${statusEclusa.color.includes('green') ? 'text-green-400' : statusEclusa.color.includes('yellow') ? 'text-yellow-400' : 'text-red-400'}`}>
                {statusEclusa.status === 'Telecomando' ? 'TEL' : statusEclusa.status === 'Operando Local' ? 'LOC' : 'OFF'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo com 6 seções em grid - ajustado para direita */}
      <div className="flex-1 w-full bg-gray-200 pl-5 pr-3 py-3 flex flex-col justify-center">
        {/* Grid 3x2 para aproveitar melhor o espaço */}
        <div className="grid grid-cols-3 gap-2 h-full">
          
          {/* 1. Operador */}
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-700 truncate">
                {operadorNome}
              </div>
              <div className="text-xs text-gray-500">
                Operador
              </div>
            </div>
          </div>

          {/* 2. Status da Eclusa */}
          <div className="flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600 flex-shrink-0">
              <path d="M8.37123 2.18755C8.66345 2.07551 8.99109 2.22178 9.10304 2.51425C9.21498 2.80672 9.06884 3.13464 8.77662 3.24668C8.41049 3.38706 8.05182 3.5455 7.70177 3.72135C3.70813 5.7276 1.13322 9.81902 1.13322 14.3716C1.13322 14.9494 1.17428 15.5218 1.25553 16.086C1.30016 16.396 1.08527 16.6835 0.775536 16.7282C0.465807 16.7729 0.178536 16.5578 0.133899 16.2478C0.0449436 15.63 0 15.0036 0 14.3716C0 9.3859 2.82031 4.90457 7.19342 2.70769C7.57696 2.51501 7.97 2.34139 8.37123 2.18755ZM5.00504 24.6476C4.75864 24.4545 4.71526 24.0981 4.90816 23.8515C5.10106 23.6049 5.45719 23.5614 5.70359 23.7545C7.78087 25.3821 10.3373 26.2806 13.032 26.2806C15.7617 26.2806 18.349 25.3586 20.4395 23.692C20.6842 23.4969 21.0407 23.5373 21.2357 23.7823C21.4306 24.0272 21.3903 24.384 21.1455 24.5792C18.8562 26.4043 16.0205 27.4147 13.032 27.4147C10.0818 27.4147 7.27998 26.4301 5.00504 24.6476ZM8.14756 23.518C8.20574 23.8257 8.00364 24.1224 7.69617 24.1806L5.7507 24.549L5.92649 26.6398C5.95273 26.9519 5.72122 27.2262 5.40939 27.2524C5.09757 27.2787 4.82351 27.047 4.79727 26.7349L4.57863 24.1345C4.55428 23.8449 4.7526 23.5837 5.0379 23.5297L7.4855 23.0662C7.79297 23.008 8.08939 23.2103 8.14756 23.518ZM17.4676 2.10363C22.5852 3.95745 26.064 8.83486 26.064 14.3716C26.064 14.6976 26.052 15.0221 26.0282 15.3446L27.0939 14.5462C27.3444 14.3585 27.6995 14.4096 27.887 14.6604C28.0745 14.9112 28.0234 15.2666 27.7729 15.4542L25.6853 17.0178C25.4529 17.1919 25.1265 17.162 24.9295 16.9484L23.2398 15.1166C23.0275 14.8865 23.0418 14.5277 23.2717 14.3153C23.5017 14.1028 23.8601 14.1171 24.0724 14.3472L24.8994 15.2434C24.9203 14.9545 24.9308 14.6637 24.9308 14.3716C24.9308 9.31618 21.7543 4.86265 17.0819 3.17011C16.7877 3.06352 16.6355 2.73837 16.742 2.44387C16.8485 2.14937 17.1734 1.99704 17.4676 2.10363ZM5.8297 1.41858C5.95053 1.12967 6.28249 0.993507 6.57115 1.11444L8.86897 2.07712C9.13682 2.18934 9.27656 2.48605 9.19258 2.76424L8.43853 5.26232C8.34803 5.56213 8.03182 5.73175 7.73227 5.64118C7.43271 5.5506 7.26323 5.23412 7.35373 4.93431L7.96 2.92585L6.13358 2.16066C5.84492 2.03973 5.70887 1.70749 5.8297 1.41858Z" fill="currentColor"/>
              <path d="M13.0306 4.9148C14.3866 4.9148 15.4859 3.81459 15.4859 2.4574C15.4859 1.10022 14.3866 0 13.0306 0C11.6746 0 10.5753 1.10022 10.5753 2.4574C10.5753 3.81459 11.6746 4.9148 13.0306 4.9148ZM23.7962 17.9579C25.1522 17.9579 26.2515 19.0581 26.2515 20.4153C26.2515 21.7725 25.1522 22.8727 23.7962 22.8727C22.4401 22.8727 21.3409 21.7725 21.3409 20.4153C21.3409 19.0581 22.4401 17.9579 23.7962 17.9579ZM2.6428 17.9579C3.99883 17.9579 5.0981 19.0581 5.0981 20.4153C5.0981 21.7725 3.99883 22.8727 2.6428 22.8727C1.28678 22.8727 0.1875 21.7725 0.1875 20.4153C0.1875 19.0581 1.28678 17.9579 2.6428 17.9579ZM23.7962 19.0921C23.066 19.0921 22.4741 19.6845 22.4741 20.4153C22.4741 21.1461 23.066 21.7385 23.7962 21.7385C24.5263 21.7385 25.1183 21.1461 25.1183 20.4153C25.1183 19.6845 24.5263 19.0921 23.7962 19.0921ZM2.6428 19.0921C1.91263 19.0921 1.32072 19.6845 1.32072 20.4153C1.32072 21.1461 1.91263 21.7385 2.6428 21.7385C3.37297 21.7385 3.96489 21.1461 3.96489 20.4153C3.96489 19.6845 3.37297 19.0921 2.6428 19.0921ZM13.0306 1.13419C13.7608 1.13419 14.3527 1.72661 14.3527 2.4574C13.3527 3.18819 13.7608 3.78062 13.0306 3.78062C12.3005 3.78062 11.7085 3.18819 11.7085 2.4574C11.7085 1.72661 12.3005 1.13419 13.0306 1.13419Z" fill="currentColor"/>
              <path d="M8.33816 17.3636L7.12644 17.2615C6.90931 17.2432 6.7219 17.1019 6.64441 16.8981C6.43039 16.3351 6.29284 15.7443 6.23679 15.138C6.21656 14.9192 6.32448 14.7084 6.51376 14.5969L7.55127 13.9863C7.597 13.5159 7.70375 13.0572 7.86787 12.6193L7.20349 11.6272C7.08035 11.4433 7.07538 11.2045 7.19075 11.0156C7.50748 10.4971 7.89333 10.0229 8.33699 9.60583C8.49496 9.45734 8.72373 9.41204 8.9263 9.48915L10.0654 9.92273C10.4459 9.68151 10.8552 9.48726 11.2849 9.34501L11.6509 8.20004C11.7176 7.99124 11.8986 7.83965 12.1157 7.81071C12.4184 7.77036 12.7248 7.75 13.0337 7.75C13.3425 7.75 13.649 7.77036 13.9516 7.81071C14.1687 7.83965 14.3497 7.99124 14.4165 8.20004L14.7825 9.34501C15.2122 9.48726 15.6215 9.68151 16.002 9.92273L17.1411 9.48915C17.3436 9.41204 17.5724 9.45734 17.7304 9.60583C18.174 10.0229 18.5599 10.4971 18.8766 11.0156C18.992 11.2045 18.987 11.4433 18.8639 11.6272L18.1995 12.6193C18.3636 13.0572 18.4704 13.5159 18.5161 13.9863L19.5536 14.5969C19.7429 14.7084 19.8508 14.9192 19.8306 15.138C19.7745 15.7443 19.637 16.3351 19.423 16.8981C19.3455 17.1019 19.1581 17.2432 18.9409 17.2615L17.7292 17.3636C17.4861 17.7549 17.1939 18.1144 16.8601 18.4334L17.0274 19.6167C17.0583 19.835 16.9599 20.0515 16.7752 20.1716C16.2623 20.5053 15.7059 20.7694 15.1199 20.9556C14.9131 21.0213 14.6868 20.963 14.5374 20.8054L13.7013 19.9234C13.4809 19.9498 13.2581 19.9631 13.0337 19.9631C12.8093 19.9631 12.5864 19.9498 12.3661 19.9234L11.5299 20.8054C11.3805 20.963 11.1543 21.0213 10.9474 20.9556C10.3615 20.7694 9.8051 20.5053 9.29216 20.1716C9.10745 20.0515 9.00907 19.835 9.03994 19.6167L9.20726 18.4334C8.87348 18.1144 8.58125 17.7549 8.33816 17.3636ZM8.72661 16.2581C8.91641 16.2741 9.08548 16.3845 9.17661 16.5519C9.43067 17.0185 9.77051 17.436 10.1775 17.7824C10.3255 17.9083 10.3987 18.1014 10.3715 18.2939L10.2143 19.4055C10.4539 19.5409 10.7031 19.6589 10.9603 19.7584L11.7465 18.9291C11.8774 18.791 12.0688 18.7279 12.2561 18.761C12.5108 18.806 12.7706 18.8289 13.0337 18.8289C13.2968 18.8289 13.5566 18.806 13.8113 18.761C13.9986 18.7279 14.19 18.791 14.3209 18.9291L15.107 19.7584C15.3642 19.6589 15.6135 19.5409 15.8531 19.4055L15.6959 18.2939C15.6686 18.1014 15.7419 17.9083 15.8898 17.7824C16.2969 17.436 16.6367 17.0185 16.8907 16.5519C16.9819 16.3845 17.151 16.2741 17.3408 16.2581L18.4783 16.1623C18.5567 15.9088 18.6169 15.6495 18.6583 15.3857L17.6841 14.8123C17.5177 14.7144 17.4126 14.5385 17.4051 14.3455C17.384 13.8012 17.2605 13.2742 17.0431 12.7846C16.9641 12.6066 16.9819 12.4004 17.0903 12.2386L17.7135 11.3078C17.5583 11.0867 17.3872 10.8767 17.2017 10.6795L16.1306 11.0872C15.9533 11.1547 15.754 11.1289 15.5996 11.0184C15.1739 10.7137 14.6959 10.4868 14.1868 10.35C14.0007 10.3 13.8528 10.1587 13.7941 9.97508L13.4501 8.899C13.3121 8.88914 13.1732 8.88419 13.0337 8.88419C12.8941 8.88419 12.7553 8.88914 12.6172 8.899L12.2733 9.97508C12.2146 10.1587 12.0666 10.3 11.8805 10.35C11.3714 10.4868 10.8935 10.7137 10.4677 11.0184C10.3134 11.1289 10.1141 11.1547 9.93674 11.0872L8.86569 10.6795C8.68016 10.8767 8.50906 11.0867 8.35384 11.3078L8.97711 12.2386C9.08548 12.4004 9.10327 12.6066 9.02423 12.7846C8.80685 13.2742 8.68334 13.8012 8.66223 14.3455C8.65474 14.5385 8.54963 14.7144 8.38328 14.8123L7.40908 15.3857C7.45051 15.6495 7.51071 15.9088 7.58908 16.1623L8.72661 16.2581ZM13.1281 17.9577C11.2983 17.9577 9.8229 16.4301 9.8229 14.5551C9.8229 12.6802 11.2983 11.1526 13.1281 11.1526C14.9579 11.1526 16.4333 12.6802 16.4333 14.5551C16.4333 16.4301 14.9579 17.9577 13.1281 17.9577ZM13.1281 16.8235C14.3233 16.8235 15.3001 15.8121 15.3001 14.5551C15.3001 13.2981 14.3233 12.2867 13.1281 12.2867C11.9329 12.2867 10.9561 13.2981 10.9561 14.5551C10.9561 15.8121 11.9329 16.8235 13.1281 16.8235Z" fill="currentColor"/>
            </svg>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-700 truncate">
                {statusEclusa.status}
              </div>
              <div className="text-xs text-gray-500">
                Status
              </div>
            </div>
          </div>

          {/* 3. Comunicação */}
          <div className="flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600 flex-shrink-0">
              <path d="M28.001 0H20.9492V27.41H28.001V0Z" fill="currentColor"/>
              <path d="M17.5361 9.71094H10.4844V27.4087H17.5361V9.71094Z" fill="currentColor"/>
              <path d="M7.05369 18.2188H0V27.3997H7.05369V18.2188Z" fill="currentColor"/>
            </svg>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-700 truncate">
                {statusComunicacao.status}
              </div>
              <div className="text-xs text-gray-500">
                Comunicação
              </div>
            </div>
          </div>

          {/* 4. Alarmes */}
          <div className="flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600 flex-shrink-0">
              <path d="M23.5279 23.6813V13.8055C23.5279 8.3517 19.2613 3.92969 13.9991 3.92969C8.73697 3.92969 4.47034 8.3517 4.47034 13.8055V23.6813H0V27.4082H28V23.6813H23.5279Z" fill="currentColor"/>
              <path d="M14.001 7.8723C16.0985 7.8723 17.7988 6.10999 17.7988 3.93612C17.7988 1.76226 16.0985 0 14.001 0C11.9035 0 10.2031 1.76226 10.2031 3.93612C10.2031 6.10999 11.9035 7.8723 14.001 7.8723Z" fill="currentColor"/>
            </svg>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-700 truncate">
                {statusAlarmes.status}
              </div>
              <div className="text-xs text-gray-500">
                Alarmes
              </div>
            </div>
          </div>

          {/* 5. Emergência */}
          <div className="flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 36 35" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600 flex-shrink-0">
              <path d="M19.3575 19.2212C19.3575 18.9595 19.1751 18.7026 18.9134 18.7026H18.9059C18.1589 18.7026 17.551 18.0047 17.551 17.1471V16.6285C17.551 13.1975 19.9821 10.4062 22.9704 10.4062C25.9587 10.4062 28.3897 13.1975 28.3897 16.6285V17.1471C28.3897 18.0047 27.7819 18.7026 27.0349 18.7026H27.0273C26.7657 18.7026 26.5833 18.9595 26.5833 19.2212C26.5833 19.4828 26.7657 19.7397 27.0273 19.7397H28.1085C28.7627 19.7397 29.293 20.27 29.293 20.9242V23.874C29.293 25.5999 27.8939 26.999 26.168 26.999H19.7728C18.0469 26.999 16.6478 25.5999 16.6478 23.874V20.9242C16.6478 20.27 17.1781 19.7397 17.8323 19.7397H18.9134C19.1751 19.7397 19.3575 19.4828 19.3575 19.2212Z" fill="currentColor"/>
              <path d="M12.9013 1.97139C13.2343 2.04514 13.5828 1.9919 13.8786 1.82209C14.7326 1.33209 15.6882 1.07283 16.6429 1.07283H21.1324C22.7121 1.07283 24.2589 1.57268 25.6065 2.51847L31.1008 6.3737C31.6554 6.76259 32 7.46778 32 8.24868C32 9.43817 31.1568 10.4063 30.1208 10.4063C29.7943 10.4063 29.4723 10.3083 29.1887 10.1221L25.2357 7.52856C25.0395 7.39985 24.7742 7.579 24.7742 7.81364C24.7742 8.67128 24.1663 9.36921 23.4194 9.36921H17.8022C17.2968 9.36921 16.7924 9.29765 16.3033 9.15713C15.4999 8.92691 14.7565 8.52038 14.094 7.94949C13.6404 7.55885 13.029 7.40505 12.4446 7.53452L7.80081 8.56311C5.84977 8.99526 4 7.51039 4 5.51206V3.89283C4 1.89453 5.84971 0.409661 7.80073 0.841761L12.9013 1.97139Z" fill="currentColor"/>
            </svg>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-700 truncate">
                Normal
              </div>
              <div className="text-xs text-gray-500">
                Emergência
              </div>
            </div>
          </div>

          {/* 6. Servidor */}
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>
            </svg>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-700 truncate">
                Online
              </div>
              <div className="text-xs text-gray-500">
                Servidor
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EclusaStatusCard;