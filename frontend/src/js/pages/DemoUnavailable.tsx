import React from 'react';

const DemoUnavailable: React.FC = () => (
  <main className="demo-unavailable" role="alert">
    <h1>No disponible en la demo</h1>
    <p>Esta funcionalidad requiere una integración externa que no se conecta en el entorno SQLite demo.</p>
  </main>
);

export default DemoUnavailable;
