import React from 'react';

import '@styles/00_Utils/RouteLoader.css';

const RouteLoader: React.FC = () => {
  return (
    <div className="contenedorRouteLoader">
      <div className="spinnerRouteLoader" />
      <p>Cargando modulo...</p>
    </div>
  );
};

export default RouteLoader;
