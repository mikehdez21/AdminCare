import React, { useState, FormEvent } from 'react';
import { login } from '../../../store/authActions'; // Asegúrate de que este archivo esté correctamente configurado

import { setCurrentUser } from '@/store/Users/usersReducer';
import { setAuthState } from '@/store/authReducer'

import { AppDispatch } from '../../../store/store'; // Asegúrate de importar AppDispatch
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LoginMessages from './LoginMessages';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import redirectByRole from '../../PageRedirect';

const LoginFormInputs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); // Tipar el dispatch aquí
  const navigate = useNavigate();

  const [email_usuario, setEmail_Usuario] = useState<string>('');
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

    try {
      // Despachar la acción de login
      const resultAction = await dispatch(login({ email_usuario, password })).unwrap();
      console.log(resultAction)

      // Verifica el estado de éxito
      if (resultAction.success) {
        setLoginMessage(resultAction.message);
        setIsSuccess(true); 
        setShowLoginMessage(true);
        
        dispatch(setCurrentUser(resultAction.userData!)); // Establece el usuario en el estado
        dispatch(setAuthState(resultAction.success)) // Establece Auth como True

        
        localStorage.setItem('userData', JSON.stringify(resultAction.userData)); // Almacena el usuario en localStorage
        localStorage.setItem('userRol', JSON.stringify(resultAction.userRol)); // Almacena el rol en localStorage
        localStorage.setItem('userDepartamento', JSON.stringify(resultAction.userDepartamento)); // Almacena el departamento en localStorage

        
        // Justo después de despachar las acciones de login
        console.log('Estado de autenticación:', resultAction.success);
        console.log('Usuario Logeado:', resultAction.userData);
        console.log('userRol:', resultAction.userRol);
        console.log('userDepartamento:', resultAction.userDepartamento);
        
        
        setTimeout(() => {
          setShowLoginMessage(false);
          setLoginMessage('');
          
          redirectByRole(JSON.stringify(resultAction.userRol), navigate); // Se envia el string del rol

        
        }, 100);
      } else {
        // Manejar el caso en que la respuesta no es exitosa
        setLoginMessage(resultAction.message);
        setIsSuccess(false); // Establecer isSuccess en false
        setShowLoginMessage(true);
        
        setTimeout(() => {
          setShowLoginMessage(false);
          setLoginMessage('');
        }, 1500);
      }

    } catch (error: unknown) { // Cambiado a 'unknown' para mejor manejo de tipos
      console.error('Error al iniciar sesión:', error);

      // Asegúrate de que estás obteniendo el mensaje correcto
      let errorMessage = 'Error de conexión. Por favor, inténtalo de nuevo.';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message; // Usar el mensaje de error del backend
      }

      setLoginMessage(errorMessage);
      setIsSuccess(false); // Establecer isSuccess en false
      setShowLoginMessage(true);

      setTimeout(() => {
        setShowLoginMessage(false);
        setLoginMessage('');
      }, 1500);
    }
  };

  
  

  return (
    <form onSubmit={handleLogin}>
      <div className='titleDiv_Login'>
        <h1>PRUEBAS</h1>
      </div>

      <div className='divInputs_Login'>
        <label>
          Usuario de Hospital San Serafin:
          <input
            type="email"
            value={email_usuario}
            onChange={(e) => setEmail_Usuario(e.target.value)}
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
