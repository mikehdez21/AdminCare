// Page_Login.tsx

import React from 'react';

// Componentes
import NewsProvider from './News/NewsProvider';
import LoginFormInputs from './FormLogin/LoginFormInputs';

// Estilos
import '@styles/Login/PageLogin.css';


const PageLogin: React.FC = () => {


  return (
    <div className="mainDiv_PageLogin">
      <div className="mainDivPageLogin_IzqNews">
        <div className='contentDiv_News'>
          <div className='div_ComponentNews'>
            <NewsProvider />
          </div>
        </div>
      </div>

      <div className="mainDivPageLogin_DerLogin">
        <div className='contentDiv_Login'>
          <div className='div_ComponentLogin'>
            <LoginFormInputs />
          </div>
        </div>
      </div>

    </div>
  );
};

export default PageLogin;
