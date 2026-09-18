// Page_Login.tsx

import React from 'react';

// Componentes
import LoginFormInputs from './FormLogin/LoginFormInputs';

// Estilos
import '../../../css/Login/PageLogin.css';


const PageLogin: React.FC = () => {


  return (
    <div className="mainDiv_PageLogin">

      <div className="mainDivPageLogin_FormLogin">
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
