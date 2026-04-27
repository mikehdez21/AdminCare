import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setSelectedSection } from '@/store/sectionReducer'; // Importar la acción para actualizar la sección

// Components
import AdminDashboard from '@/components/01_HomeDashboard/AdminDashboard';
import HomeUsuario from '@/components/01_HomeDashboard/HomeUsuario';

// AlmacenGeneral
import Main_AlmacenGeneral from '@/components/02_Almacenes/AlmacenGeneral/AlmacenGeneral';

// Administrador
import Main_UsuariosControl from '@/components/99_Administrador/Usuarios/UsuariosControl';
import Main_EmpleadosControl from '@/components/99_Administrador/Empleados/EmpleadosControl';
import Main_DepartamentosControl from '@/components/99_Administrador/Departamentos/DepartamentoControl';
import Main_RolesControl from '@/components/99_Administrador/Roles/RolesControl';
import Main_UbicacionesControl from '@/components/99_Administrador/Ubicaciones/UbicacionControl';

// Interface
import { User } from '@/@types/mainTypes';


interface MainContentProps {
  currentUser: User;
}

const MainContent: React.FC<MainContentProps> = ({ currentUser }) => {

  const dispatch = useDispatch();
  const sectionSelected_FromSidebar = useSelector((state: RootState) => state.section.selectedSection);


  const storedRol = localStorage.getItem('userRol');
  const rolSinComillas = storedRol ? storedRol.replace(/"/g, '') : '';

  // useEffect para actualizar la sección inicial basada en el rol del usuario
  useEffect(() => {
    if (rolSinComillas) {
      let defaultSection = ''; // Sección predeterminada

      if (rolSinComillas === 'Admin') {
        defaultSection = 'AdminDashboard';
      } else if (rolSinComillas === 'JAlmacenGeneral') {
        defaultSection = 'Home'
      }

      // Actualizar la sección seleccionada basada en el rol
      dispatch(setSelectedSection(defaultSection));
    }
  }, [dispatch]);

  return (
    <div className='div_MainContent'>
      <div className='div_infoHeader'>
        <p>| HSS - {currentUser ? currentUser.nombre_usuario : 'Usuario no identificado'} |</p>
      </div>

      <div className='div_SectionSelected'>
        {/* Renderizado del contenido basado en la sección seleccionada */}
        {sectionSelected_FromSidebar === 'AdminDashboard' && <AdminDashboard />}
        {sectionSelected_FromSidebar === 'Home' && <HomeUsuario />}

        {/* AlmacenGeneral */}
        {sectionSelected_FromSidebar === 'Almacen' && <Main_AlmacenGeneral />}

        {/* Administrador */}
        {sectionSelected_FromSidebar === 'GestionUsuarios' && <Main_UsuariosControl />}
        {sectionSelected_FromSidebar === 'GestionEmpleados' && <Main_EmpleadosControl />}
        {sectionSelected_FromSidebar === 'GestionDepartamentos' && <Main_DepartamentosControl />}
        {sectionSelected_FromSidebar === 'GestionRoles' && <Main_RolesControl />}
        {sectionSelected_FromSidebar === 'GestionUbicaciones' && <Main_UbicacionesControl />}




      </div>
    </div>
  );
};

export default MainContent;
