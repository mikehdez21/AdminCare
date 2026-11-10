import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

import SideBar from './Home/Sidebar/SideBar';
import MainContent from './Home/Content/MainContent';
import LogoutModal from './LogoutModal';

import '@styles/Home/Home.css';

const Home: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.users.currentUser);
  const [isModalLogoutOpen, setModalLogoutOpen] = useState(false);

  return (
    <div className="mainDiv_Home">
      <aside className="Home_Sidebar">
        <SideBar currentUser={currentUser!} onOpenLogoutModal={() => setModalLogoutOpen(true)} />
      </aside>

      <main className="Home_MainContent">
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
