import React from 'react';

interface TicketCardProps {
  etiqueta: string;
  valor: string | number;
}

/**
 * Tarjeta de métrica del panel: etiqueta + conteo.
 * Reutilizada por el resumen de conteos y por las tarjetas del dashboard.
 */
const TicketCard: React.FC<TicketCardProps> = ({ etiqueta, valor }) => (
  <div className='ticketCard'>
    <span>{etiqueta}</span>
    <strong>{valor}</strong>
  </div>
);

export default TicketCard;