import React, { useEffect } from 'react';
import { AppDispatch } from '../store/store'; // Asegúrate de importar AppDispatch
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authActions'; // Asegúrate de que la ruta es correcta
import { setAuthState } from '@/store/authReducer';
import { RootState } from '@/store/store';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';




// Interface
import { User } from '@/@types/mainTypes';

// Styles
import '@styles/Home/LogoutModal.css';
import { getDepartamentos } from '@/store/administrador/Departamentos/departamentosActions';
import { setListDepartamentos } from '@/store/administrador/Departamentos/departamentosReducer';

interface LogoutModalProps {
  currentUser: User; // Cambia esto para usar el usuario proporcionado
  isOpen: boolean;
  onClose: () => void;
}


const LogoutModal: React.FC<LogoutModalProps> = ({ currentUser, isOpen, onClose }) => {

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const departamentos = useSelector((state: RootState) => state.departamentos.departamentos);

  useEffect(() => {
    if (departamentos.length === 0) {
      const cargarDepartamentos = async () => {
        try {

          const resultAction = await dispatch(getDepartamentos()).unwrap();
          if (resultAction.success && resultAction.departamentos) {
            setListDepartamentos(resultAction.departamentos);
          }

        } catch (error) {
          console.error('Error al cargar los activos fijos por departamento:', error);
        }


      };
      cargarDepartamentos();
    }
  }, [dispatch, departamentos.length]);


  // Acceso a los campos específicos
  const userRol = currentUser?.roles?.map(role => role.name).join(', ') || 'Sin roles';
  const userDepartamento = currentUser?.id_departamento ? departamentos.find(depto => depto.id_departamento === currentUser.id_departamento)?.nombre_departamento : 'Sin departamento';

  const handleLogout = async () => {
    try {
      const resultAction = await dispatch(logout()).unwrap();
      console.log('Cerrando Sesión!');

      if (resultAction.success) {
        localStorage.removeItem('userData');
        localStorage.removeItem('userRol');
        localStorage.removeItem('userDepartamento');
        localStorage.removeItem('lastPath');
        localStorage.removeItem('selectedSection');
        dispatch(setAuthState(false)); // Establece Auth como FALSE
        navigate('/'); // Redirige a la ruta predeterminada

        setTimeout(() => {
          window.location.reload(); // Refresca la página
        }, 100); // Espera un momento antes de refrescar

        console.log('Sesión Finalizada!', resultAction);
      } else {
        console.log('Error al finalizar la sesión!', resultAction);
        Swal.fire({
          icon: 'error',
          title: 'Error al cerrar sesión',
          text: resultAction.message || 'Ocurrió un error inesperado.',
        });
      }

      onClose();
    } catch (error) {
      console.error('Error durante el logout:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al cerrar sesión',
        text: 'No se pudo cerrar la sesión. Contacta a Sistemas!',
      });
    }
  };

  if (!isOpen) return null;


  return (
    <div className="modal_Logout">
      <div className="modal_Content">

        <div className='modal_Header'>
          <h1>Hospital San Serafín</h1>
        </div>



        <hr /> <hr />

        <div className='modal_infoButtons'>

          <div className='info'>
            <h2>Cerrar Sesión</h2>

            <div className='userData'>

              <div className='userInfo'>
                <strong>Usuario:</strong> {currentUser.nombre_usuario || 'Sin dato especificado'}
                <strong>Rol:</strong> {userRol || 'Sin dato especificado'}
                <strong>Departamento:</strong> {userDepartamento || 'Sin dato especificado'}
                <strong>Correo:</strong> {currentUser.email_usuario || 'Sin dato especificado'}

              </div>

            </div>

            <p>¿Quieres cerrar la sesión actual?</p>

          </div>

          <div className='buttons'>
            <button onClick={handleLogout}> <strong>Cerrar la sesión</strong></button>

            <button className='buttonCancelar' onClick={onClose}> <strong>Cancelar</strong></button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LogoutModal;
