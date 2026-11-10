import React from 'react';

/**
 * Aviso de la demo: no hay servicio de correo configurado. No bloquea las
 * acciones de Helpdesk; solo informa que las notificaciones no se envían.
 */
const DemoMailNotice: React.FC = () => (
  <div className="demo-mail-notice" role="status">
    <strong>Demo sin correo.</strong>{' '}
    Esta demo no tiene servicio de correo configurado. Los tickets y avances se guardan,
    pero no se envían notificaciones por correo.
  </div>
);

export default DemoMailNotice;
