// Bibliotecas
import React, { lazy } from 'react'

// Componentes
const Home = lazy(() => import('../components/Home'));

const MainLayout: React.FC = () => {

  return (
      <Home />
  )
}

export default MainLayout
