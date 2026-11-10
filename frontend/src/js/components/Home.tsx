import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { RootState } from '../store/store';

import SideBar from './Home/Sidebar/SideBar';
import MainContent from './Home/Content/MainContent';
import LogoutModal from './LogoutModal';
import DemoMailNotice from './00_Utils/DemoMailNotice';

import '@styles/Home/Home.css';

const Home: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.users.currentUser);
  const [isModalLogoutOpen, setModalLogoutOpen] = useState(false);
  const location = useLocation();
  const esHelpdesk = location.pathname.startsWith('/helpdesk');

  return (
    <div className="mainDiv_Home">
      <aside className="Home_Sidebar">
        <SideBar currentUser={currentUser!} onOpenLogoutModal={() => setModalLogoutOpen(true)} />
      </aside>

      <main className="Home_MainContent">
        {esHelpdesk && <DemoMailNotice />}
        <MainContent currentUser={currentUser!} />
      </main>

      <LogoutModal
        currentUser={currentUser!}
        isOpen={isModalLogoutOpen}
        onClose={() => setModalLogoutOpen(false)}
      />
    </div>
  );
};

export default Home;
