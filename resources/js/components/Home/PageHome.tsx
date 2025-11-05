import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store'; 
import { setSelectedSection } from '@/store/sectionReducer';

// Components
import SideBar from '../Home/Sidebar/SideBar';
import MainContent from './Content/MainContent';

// Modals_Components
import LogoutModal from '../LogoutModal';

// Styles
import '@styles/Home/PageHome.css';

const PageHome: React.FC = () => {  
  const dispatch = useDispatch<AppDispatch>();

  // OBTENER EL USUARIO DESDE EL ESTADO [CURRENTUSER]
  const currentUser = useSelector((state: RootState) => state.users.currentUser);
  
  // Cargar la sección desde localStorage al cargar el componente si existe
  useEffect(() => {
    const storedSection = localStorage.getItem('selectedSection');
    if (storedSection) {
      dispatch(setSelectedSection(storedSection));
    }
  }, [dispatch]);

  

  const [isModalLogoutOpen, setModalLogoutOpen] = useState(false);

  const openModalLogout = () => {
    setModalLogoutOpen(true);
  };

  const closeModalLogout = () => {
    setModalLogoutOpen(false);
  };

  return(
    <div className="mainDiv_PageHome">
      {/* Izq - SideBar */}
      <aside className="pageHome_Sidebar">
        <SideBar currentUser={currentUser!}  onOpenLogoutModal={openModalLogout} />
      </aside>

      {/* Der - HomeContent */}
      <main className="pageHome_MainContent">
        <MainContent currentUser={currentUser!} />
      </main>

      {isModalLogoutOpen && (
        <LogoutModal currentUser={currentUser!} isOpen={isModalLogoutOpen} onClose={closeModalLogout} />
      )}

    </div>
  );
}

export default PageHome;
