import React, { useState, FormEvent, useEffect, useRef } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Evita doble submit durante esperas

  // Guarda el id del timer de navegación para limpiarlo al desmontar.
  const navigateTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Cleanup al desmontar: evita fugas si el usuario navega/cambia de página
    // durante los ~900ms de espera del mensaje de éxito.
    return () => {
      if (navigateTimerRef.current !== null) {
        window.clearTimeout(navigateTimerRef.current);
      }
    };
  }, []);

  const [loginMessage, setLoginMessage] = useState('');
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Evita doble submit mientras se procesa el login o se espera la navegación.
    if (isSubmitting) return;

    setIsSubmitting(true);

    // login SIEMPRE resuelve fulfilled (nunca rechaza).
    // El resultado contiene { success, message, ... } en todos los caminos.
    const resultAction = await dispatch(login({ user, password })).unwrap();

    if (resultAction.success) {
      setLoginMessage(resultAction.message);
      setIsSuccess(true);
      setShowLoginMessage(true);

      dispatch(setCurrentUser(resultAction.userData!)); // Establece el usuario en el estado
      dispatch(setAuthState(resultAction.success)); // Establece Auth como True

      // No limpiar showLoginMessage/loginMessage de inmediato: con el
      // batching de React 18 el único render vería los estados finales y el
      // mensaje de éxito nunca sería visible. Se muestra el box verde mientras
      // el componente sigue montado y se navega al shell tras un breve retraso.
      // El botón permanece deshabilitado durante la espera (isSubmitting).
      navigateTimerRef.current = window.setTimeout(() => {
        navigate('/app'); // Abre el shell autenticado sin seleccionar un módulo
      }, 900);
    } else {
      // Manejar el caso en que la respuesta no es exitosa
      setLoginMessage(resultAction.message);
      setIsSuccess(false);
      setShowLoginMessage(true);
      setIsSubmitting(false); // Re-habilita el botón para reintentar
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
            placeholder='DEMOADMIN | DEMOALMACEN'
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
              placeholder='demoadmin | demoalmacen'
              required
              autoComplete='current-password'
            />
            <div className='showPassword_Icon' onClick={toggleShowPassword}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
        </label>

        <br />

        <button className='buttonFormLogin' type='submit' disabled={isSubmitting}>
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
