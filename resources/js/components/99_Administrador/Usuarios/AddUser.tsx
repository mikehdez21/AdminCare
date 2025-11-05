import React, {useState, useEffect} from 'react'
import Modal from 'react-modal';
import { RootState, AppDispatch } from '@/store/store';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2'; 

import { setListUsuarios } from '@/store/Users/usersReducer';
import { addUser, getUsers } from '@/store/Users/usersActions';

import { getRoles } from '@/store/Roles/rolesActions';
import { getDepartamentos } from '@/store/Departamentos/departamentosActions';
import { getEmpleados } from '@/store/Empleados/empleadosActions';

import { User, Roles, Departamentos } from '@/@types/mainTypes';
import { Empleados } from '@/@types/mainTypes';

import '@styles/99_Administrador/addeditdelete_adminEntities.css'

interface AddUserProps {
    isOpen: boolean;
    onClose: () => void;
  }

Modal.setAppElement('#root');


const AddUser: React.FC<AddUserProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const roles = useSelector((state: RootState) => state.roles.roles);
  const departamentos = useSelector((state: RootState) => state.departamentos.departamentos);
  const empleados = useSelector((state: RootState) => state.empleados.empleados)

  const [nombreUsuario, setNombreUsuario] = useState<string>('');
  const [emailUsuario, setEmailUsuario] = useState<string>('');
  const [passwordUsuario, setPasswordUsuario] = useState<string>('');
  const [userActive, setUserActive] = useState<boolean>(true);
  const [userShared, setUserShared] = useState<boolean>(false);
  const [rolSeleccionado, setRolSeleccionado] = useState<Roles['name']>('');
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleados['nombre_empleado']>('');
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<Departamentos['nombre_departamento']>('');


  
  // Cargar roles, empleados y departamentos si no están disponibles
  useEffect(() => {
    if (roles.length === 0) {
      dispatch(getRoles());
    }
    if (departamentos.length === 0) {
      dispatch(getDepartamentos());
    }
    if (empleados.length === 0){
      dispatch(getEmpleados());
    }
  }, [dispatch, roles.length, departamentos.length]);


  const handleUserActive = () => {
    setUserActive((prevState) => !prevState);
  };

  const handleUserShared = () => {
    setUserShared((prevState) => !prevState);
  };
  


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const nuevoUsuario: User = {
        nombre_usuario: nombreUsuario,
        email_usuario: emailUsuario,
        password: passwordUsuario,
        estatus_activo: userActive,
        usuario_compartido: userShared,
        
        roles: [roles.find(role => role.name === rolSeleccionado) || { 
          id: 0, 
          name: '', 
          guard_name: '', 
          created_at: '', 
          updated_at: '', 
          pivot: { model_type: '', model_id: 0, role_id: 0 }
        }],

      
      };

      const formData = new FormData();

      formData.append('nombre_usuario', nuevoUsuario.nombre_usuario);
      formData.append('email', nuevoUsuario.email_usuario);
      formData.append('password', nuevoUsuario.password);
      formData.append('estatus_activo', nuevoUsuario.estatus_activo.toString());
      formData.append('usuario_compartido', nuevoUsuario.usuario_compartido.toString());
      
      formData.append('rol', rolSeleccionado);
      formData.append('id_empleado', empleadoSeleccionado);
      formData.append('id_departamento', departamentoSeleccionado);
    
      console.log('dataUserADD_Enviada: ', nuevoUsuario)
      const resultAction = await dispatch(addUser(nuevoUsuario)).unwrap();
      console.log('Respuesta del servidor:', resultAction);

      if (resultAction.success) {
        // Si el usuario fue agregado con éxito, recargar la lista de usuarios
        const usuariosActualizados = await dispatch(getUsers()).unwrap();
    
        if (usuariosActualizados.success) {
          dispatch(setListUsuarios(usuariosActualizados.users!)); // Actualiza la lista de usuarios en el estado
          setNombreUsuario('')
          setEmailUsuario('')
          setPasswordUsuario('')
          setUserActive(true)
          setUserShared(false)
          setRolSeleccionado('')
          setEmpleadoSeleccionado('')
          setDepartamentoSeleccionado('')
    
          console.log('Usuario agregado y lista recargada:', usuariosActualizados.users);
        }
      } else {
        console.log('Error al agregar el usuario: ', resultAction.message);
      }
    
      // Mostrar SweetAlert para éxito
      Swal.fire({
        icon: 'success',
        title: 'Usuario Añadido',
        text: 'El Usuario ha sido añadido exitosamente.',
        confirmButtonText: 'OK',
    
      });
      onClose(); // Cerrar modal al completar el envío


    } catch (error) {
      console.error('Error al agregar el usuario: ', error);
    
      // Mostrar SweetAlert para error
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al añadir el usuario. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
    
      });
    }
  };
      
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Añadir Nueva Entity"
      className="modal_CRUD_AdminEntity"
      overlayClassName="modal_OverlayCRUD_AdminEntity"
    >

      <div className="modal_Content_Admin">
        <h2>Añadir Usuario</h2>

        <div className='mainInputs_addedit_AdminEntity'>

          <form onSubmit={handleSubmit} className="form_AdminEntity">
            
            <div className='dataInputs_Usuario'>
            
              <div className='leftDiv_Inputs'>

                <label>
              *Usuario:
                  <input 
                    type="text" 
                    value={nombreUsuario} 
                    id='nombreUsuario'
                    name='nombreUsuario'
                    onChange={(e) => setNombreUsuario(e.target.value)} 
                    placeholder='JUsuario - Usuario'
                    required 
                  />
                </label>

                <label>
              *Email:
                  <div className='emailInput'>
                    <input
                      type="text"
                      value={emailUsuario.split('@')[0]}
                      id='emailUsuario'
                      name='emailUsuario'
                      onChange={(e) => {
                        const domain = emailUsuario.split('@')[1] || '';
                        setEmailUsuario(`${e.target.value}@${domain}`);
                      }}
                      required
                      placeholder="email"
                    />
                    <span> @ </span>
                    <input
                      type="text"
                      value={emailUsuario.split('@')[1] || ''}
                      id='emailDomain'
                      name='emailDomain'
                      onChange={(e) => {
                        const firstPart = emailUsuario.split('@')[0];
                        setEmailUsuario(`${firstPart}@${e.target.value}`);
                      }}
                      required
                      placeholder="dominio.com"
                    />
                  </div>
                </label>

                <label>
              *Contraseña:
                  <input 
                    type="text" 
                    value={passwordUsuario} 
                    id='passwordUsuario'
                    name='passwordUsuario'
                    onChange={(e) => setPasswordUsuario(e.target.value)} 
                    placeholder='Contraseña de mínimo 8 caracteres'
                    required 
                  />
                </label>

                <label>
                    *Empleado Asociado
                  <select
                    value={empleadoSeleccionado}
                    id='empleadoSeleccionado'
                    name='empleadoSeleccionado'
                    disabled={userShared}
                    onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
                    required
                  >
                    <option>Selecciona el Empleado Asociado</option>
                    {Array.isArray(empleados) && empleados.length > 0 ? (
                      [...empleados]
                        .sort((a, b) => {
                          const nombreCompletoA = `${a.nombre_empleado} ${a.apellido_paterno} ${a.apellido_materno}`.toLowerCase();
                          const nombreCompletoB = `${b.nombre_empleado} ${b.apellido_paterno} ${b.apellido_materno}`.toLowerCase();
                          return nombreCompletoA.localeCompare(nombreCompletoB);
                        })
                        .map((empleado: Empleados) => (
                          <option key={empleado.id_empleado} value={empleado.id_empleado!}>
                            {empleado.nombre_empleado.charAt(0).toUpperCase() +
                              empleado.nombre_empleado.slice(1) +
                              ' ' + empleado.apellido_paterno.charAt(0).toUpperCase() + empleado.apellido_paterno.slice(1) +
                              ' ' + empleado.apellido_materno.charAt(0).toUpperCase() + empleado.apellido_materno.slice(1)}
                          </option>
                        ))
                    ) : (
                      <option disabled>No existen Empleados Creados</option>
                    )}
                  </select>
                </label>

                
              </div>

              <div className='rightDiv_Inputs'>

                <div className="rolDepartamentoActive_Inputs">

                  <small>
                      *Estatus del Usuario:
                    <div className='checkDiv'>

                      <span> {userActive ? 'Cuenta Activa' : 'Cuenta Desactivada'}
                        <label>
                          <input name="cuentaActiva" id="cuentaActiva" type="checkbox" onChange={handleUserActive} checked={userActive} />
                        </label>
                      </span>

                    </div>
                  </small>

                  <small>
                      *Tipo de Usuario:
                    <div className='checkDiv'>

                      <span> {userShared ? 'Usuario Compartido' : 'Usuario Asociado'}
                        <label>
                          <input name="userShared" id="userShared" type="checkbox" onChange={handleUserShared} checked={userShared} />
                        </label>
                      </span>

                    </div>
                  </small>
                  
                  <label>
              *Rol:
                    <select
                      value={rolSeleccionado}
                      id='rolSeleccionado'
                      name='rolSeleccionado'
                      onChange={(e) => setRolSeleccionado((e.target.value))}
                      required
                    >
                      <option>Selecciona el Rol Asignado</option>
                      {Array.isArray(roles) && roles.length > 0 ? (
                        roles.map((role: Roles) => (
                          <option key={role.id} value={role.id}>
                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                          </option>
                        ))
                      ) : (
                        <option disabled>No existen Roles Creados</option>
                      )}
                    </select>
                  </label>

                  <label>
              *Departamento:
                    <select
                      value={departamentoSeleccionado}
                      id='departamentoSeleccionado'
                      name='departamentoSeleccionado'
                      onChange={(e) => setDepartamentoSeleccionado(e.target.value)}
                      required
                    >
                      <option>Selecciona el Departamento Asignado</option>
                      {Array.isArray(departamentos) && departamentos.length > 0 ? (
                        departamentos.map((departamentos: Departamentos) => (
                          <option key={departamentos.id_departamento} value={departamentos.id_departamento}>
                            {departamentos.nombre_departamento.charAt(0).toUpperCase() + departamentos.nombre_departamento.slice(1)}
                          </option>
                        ))
                      ) : (
                        <option disabled>No existen Departamentos Creados</option>
                      )}
                    </select>
                  </label>

                </div>

              </div>


            </div>


            <div className="modal_buttons">
              <button type="submit" className="button_addedit">Añadir</button>
              <button type="button" className="button_close" onClick={onClose}>Cancelar</button>
            </div>

          </form>


        </div>

      </div>

    </Modal>
  )
}

export default AddUser