// Bibliotecas
import React, { Suspense, lazy } from 'react'



// Componentes
const PageHome = lazy(() => import('../components/Home/PageHome'));

const PageHomeLoader: React.FC = () => (
  <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
    Cargando modulo...
  </div>
);

const LayoutUsuario: React.FC = () => {
  
  return (
    <Suspense fallback={<PageHomeLoader />}>
      <PageHome />
    </Suspense>
  )
}

export default LayoutUsuario
