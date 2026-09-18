import React from 'react';
import { useLocation } from 'react-router-dom';

// Utils
import { getAppName } from '../../../utils/getAppName';
import { getSectionForPath } from '@/router/sections';

// Interface
import { User } from '@/@types/mainTypes';

interface MainContentProps {
  currentUser: User;
}

const MainContent: React.FC<MainContentProps> = ({ currentUser }) => {

  const location = useLocation();
  const SectionComponent = getSectionForPath(location.pathname);

  // /app es deliberadamente un área vacía: no hay resumen ni módulo por defecto.
  if (!SectionComponent) {
    return <div className='div_MainContent' aria-label="Contenido del módulo" />;
  }

  return (
    <div className='div_MainContent'>
<div className='div_infoHeader'>
        <p>| {getAppName()} - {currentUser ? currentUser.nombre_usuario : 'Usuario no identificado'} |</p>
      </div>

      <div className='div_SectionSelected'>
        <SectionComponent />
      </div>
    </div>
  );
};

export default MainContent;
