import React, { useState, FormEvent } from 'react';
import { login } from '../../../store/authActions'; // Asegúrate de que este archivo esté correctamente configurado

import { setCurrentUser } from '@/store/administrador/Users/usersReducer';
import { setAuthState } from '@/store/authReducer'

import { AppDispatch } from '../../../store/store'; // Asegúrate de importar AppDispatch
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LoginMessages from './LoginMessages';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { getAppName } from '../../../utils/getAppName';

const LoginFormInputs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); // Tipar el dispatch aquí
  const navigate = useNavigate();

  const [user, setUser] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false); // Nuevo estado para determinar el éxito

  const [loginMessage, setLoginMessage] = useState('');
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // login SIEMPRE resuelve fulfilled (nunca rechaza).
    // El resultado contiene { success, message, ... } en todos los caminos.
    const resultAction = await dispatch(login({ user, password })).unwrap();

    if (resultAction.success) {
      setLoginMessage(resultAction.message);
      setIsSuccess(true);
      setShowLoginMessage(true);

      dispatch(setCurrentUser(resultAction.userData!)); // Establece el usuario en el estado
      dispatch(setAuthState(resultAction.success)); // Establece Auth como True
      setShowLoginMessage(false);
      setLoginMessage('');
      navigate('/app'); // Abre el shell autenticado sin seleccionar un módulo
    } else {
      // Manejar el caso en que la respuesta no es exitosa
      setLoginMessage(resultAction.message);
      setIsSuccess(false);
      setShowLoginMessage(true);

    }
  };




  return (
    <form onSubmit={handleLogin}>
      <div className='titleDiv_Login'>
        <h1>{getAppName()}</h1>
      </div>

      <div className='divInputs_Login'>
        <label>
          Usuario:
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder='demo_admin'
            required
            autoComplete='username'
          />
        </label>

        <br />

        <label>
          Contraseña:
          <div className='inputPassword'>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='DemoAdmin-2026'
              required
              autoComplete='current-password'
            />
            <div className='showPassword_Icon' onClick={toggleShowPassword}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
        </label>

        <br />

        <button className='buttonFormLogin' type='submit'>
          <span>Iniciar Sesión</span>
        </button>
      </div>

      <div className='div_MessagesLogin'>
        <LoginMessages
          showMessage={showLoginMessage} // Actualizado a showMessage
          message={loginMessage} // Actualizado a message
          setShowMessage={setShowLoginMessage} // Actualizado a setShowMessage
          isSuccess={isSuccess} // Pasar el estado de éxito
        />
      </div>
    </form>
  );
};

export default LoginFormInputs;
