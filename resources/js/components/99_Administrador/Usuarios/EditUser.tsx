import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { RootState, AppDispatch } from '@/store/store';
import { useSelector, useDispatch } from 'react-redux';

import AddRolModal from '@/components/99_Administrador/Usuarios/AddRolModal'

import { editUsuario, getUsers } from '@/store/Users/usersActions';
import { setListUsuarios } from '@/store/Users/usersReducer';

import { User, Roles, Departamentos } from '@/@types/mainTypes';
import { Empleados } from '@/@types/mainTypes';
import { getRoles } from '@/store/Roles/rolesActions';
import { getDepartamentos } from '@/store/Departamentos/departamentosActions';

import Swal from 'sweetalert2'; 

import '@styles/99_Administrador/addeditdelete_adminEntities.css'

interface EditUserProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioToEdit: User | null;
}

Modal.setAppElement('#root');

const EditUser: React.FC<EditUserProps> = ({ isOpen, onClose, usuarioToEdit }) => {

  const dispatch = useDispatch<AppDispatch>();
  const roles = useSelector((state: RootState) => state.roles.roles);
  const departamentos = useSelector((state: RootState) => state.departamentos.departamentos);
  const empleados = useSelector((state: RootState) => state.empleados.empleados)
  
  const [isModalAddRolOpen, setModalAddRolOpen] = useState(false);


  // Añadir Roles
  const openModalAddRol = () => {
    setModalAddRolOpen(true);
  };
  const closeModalAddRol = () => {
    setModalAddRolOpen(false);
  };

  
  const [nombreUsuario, setNombreUsuario] = useState<string>('');
  const [emailUsuario, setEmail] = useState<string>('@');
  const emailParts = emailUsuario ? emailUsuario.split('@') : ['', ''];
  const localPart = emailParts[0] || '';
  const domainPart = emailParts[1] || '';
  const [passwordUsuario, setPassword] = useState<string>('');
  const [userActive, setUserActive] = useState<boolean>(true);
  const [userShared, setUserShared] = useState<boolean>(true);
  const [rolesUsuario, setRolesUsuario] = useState<Roles[]>(usuarioToEdit?.roles || []);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleados['id_empleado']>(0);
  const [departamentoSeleccionado, setUserDepartamento] = useState<Departamentos['id_departamento']>(0);

  // Cargar roles y departamentos si no están disponibles
  useEffect(() => {
    if (roles.length === 0) {
      dispatch(getRoles());
    }
    if (departamentos.length === 0) {
      dispatch(getDepartamentos());
    }
  }, [dispatch, roles.length, departamentos.length]);

  const handleUserActive = () => {
    setUserActive((prevState) => !prevState);
  };

  const handleUserShared = () => {
    setUserShared((prevState) => !prevState);
  };

  const handleAddRol = () => {
    openModalAddRol();
  }

  const handleRolesSelected = (selectedRoles: Roles[]) => {
    console.log('asd:', selectedRoles)
    const newRole = selectedRoles[0]; // Siempre es un único rol
    // Evitar duplicados
    if (!rolesUsuario.some((rol) => rol.id === newRole.id)) {
      setRolesUsuario((prev) => [...prev, newRole]);
    }
  };

  useEffect(() => {
    if (usuarioToEdit) {
      console.log('Información ACTUAL del usuario:', usuarioToEdit); // Log completo del usuario
  
      setNombreUsuario(usuarioToEdit.nombre_usuario);
  
      setEmail(usuarioToEdit.email_usuario || '@');
  
      setPassword(usuarioToEdit.password || '');
  
      setUserActive(usuarioToEdit.estatus_activo || false);

      setUserShared(usuarioToEdit.usuario_compartido || false);
  
      setRolesUsuario(usuarioToEdit.roles || []);
  
      setUserDepartamento(usuarioToEdit.id_departamento || 0);
      
    } else {
      // Reset states for a clean form
      console.log('Reseteando los estados del formulario porque no hay usuario a editar.');
      setNombreUsuario('');
      setEmail('@');
      setPassword('');
      setUserActive(true);
      setUserShared(false);
      setRolesUsuario([]);
      setUserDepartamento(0);
    }
  }, [usuarioToEdit]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Verificar que al menos un rol esté seleccionado
      if (rolesUsuario.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Roles requeridos',
          text: 'Debe seleccionar al menos un rol para el usuario.',
          confirmButtonText: 'OK',
        });
        return;
      }
      
      const usuarioEditado: User = {
        id_usuario: usuarioToEdit?.id_usuario, // Mantener el ID del usuario
        nombre_usuario: nombreUsuario,
        email_usuario: emailUsuario,
        password: passwordUsuario,
        estatus_activo: userActive,
        usuario_compartido: userShared,
        roles: rolesUsuario,
        id_empleado: usuarioToEdit?.id_empleado,
        id_departamento: usuarioToEdit?.id_departamento,

        
      };
    
      const formData = new FormData();
      
      formData.append('id_usuario', usuarioEditado.id_usuario!.toString());
      formData.append('nombre_usuario', usuarioEditado.nombre_usuario);
      formData.append('email', usuarioEditado.email_usuario);
      formData.append('password', usuarioEditado.password);

      formData.append('estatus_activo', usuarioEditado.estatus_activo ? '1' : '0'); 
      formData.append('usuario_compartido', usuarioEditado.usuario_compartido ? '1' : '0');

      const empleado = empleados.find((emp) => emp.id_empleado === empleadoSeleccionado);
      if (empleado) {
        formData.append('id_empleado', empleado.id_empleado!.toString());
      } else {
        console.error('Empleado no encontrado:', empleadoSeleccionado);
      }

      const departamento = departamentos.find((dep) => dep.id_departamento === departamentoSeleccionado);
      if (departamento) {
        formData.append('id_departamento', departamento.id_departamento!.toString());
      } else {
        console.error('Departamento no encontrado:', departamentoSeleccionado);
      }
  

      // Agregar roles al FormData
      const roleNames = rolesUsuario.map((rol) => rol.name);  // Extraer solo los 'name'
      roleNames.forEach((name) => {
        formData.append('roles[]', name);
      });
  
      
      for (const [key, value] of formData.entries()) {
        console.log(`EditUser - ${key}: `, value);  // Verifica todos los valores que están siendo agregados
      }
  
      console.log('dataUserEDIT_Enviada: ', usuarioEditado)
      const resultAction = await dispatch(editUsuario(usuarioEditado)).unwrap();
      console.log('Respuesta del servidor:', resultAction);
  
      if (resultAction.success) {
        // Si el proveedor fue editado con éxito, recargar la lista de usuarios
        const usuariosActualizados = await dispatch(getUsers()).unwrap();
        if (usuariosActualizados.success) {
          dispatch(setListUsuarios(usuariosActualizados.users!)); // Actualiza la lista de usuarios en el estado
          setNombreUsuario('')
          setEmail('')
          setPassword('')
          setUserActive(true)
          setUserShared(false)
          setRolesUsuario([]); // Limpiar roles seleccionados
          setUserDepartamento(0); // Limpiar departamento seleccionado
          setEmpleadoSeleccionado(0); // Limpiar empleado seleccionado

          console.log('Usuario editado y lista recargada:', usuariosActualizados.users);

        }

        Swal.fire({
          icon: 'success',
          title: 'Usuario Editado',
          text: 'El usuario ha sido editado exitosamente.',
          confirmButtonText: 'OK',
        });

        onClose(); // Cerrar modal al completar la edición
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: resultAction.message || 'Hubo un problema al editar el usuario.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error al editar el usuario:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al editar el usuario. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Editar Nueva Entity"
      className="modal_CRUD_AdminEntity"
      overlayClassName="modal_OverlayCRUD_AdminEntity"
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
    >
      <div className="modal_Content_Admin">
        <h2>Editar Usuario</h2>

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
                      value={localPart || ''}
                      onChange={(e) => setEmail(`${e.target.value}@${domainPart}`)}
                    />
                    <span> @ </span>
                    <input
                      type="text"
                      value={domainPart || ''}
                      onChange={(e) => setEmail(`${localPart}@${e.target.value}`)}
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
                    onChange={(e) => setPassword(e.target.value)} 
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
                    onChange={(e) => setUserDepartamento(parseInt(e.target.value, 10))} // Convertir string a number
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
              *Departamento:
                    <select
                      value={departamentoSeleccionado}
                      id='departamentoSeleccionado'
                      name='departamentoSeleccionado'
                      onChange={(e) => setUserDepartamento(parseInt(e.target.value, 10))} // Convertir string a number
                      required
                    >
                      <option value="Selecciona el Departamento Asignado" disabled>
    Selecciona el Departamento Asignado
                      </option>
                      {departamentos.map((departamento) => (
                        <option key={departamento.id_departamento} value={departamento.id_departamento}>
                          {departamento.nombre_departamento.charAt(0).toUpperCase() + departamento.nombre_departamento.slice(1)}
                        </option>
                      ))}
                    </select>
                  </label>

                </div>


              </div>

              <div className='mainlist_roles'>
                <h3>Roles del Usuario</h3>

                <div className="list_roles">
                  <ul>
                    {rolesUsuario.length > 0 ? (
                      rolesUsuario.map((rol, index) => (
                        <li key={index}>
                          {rol.name}
                        </li>
                      ))
                    ) : (
                      <p>No tiene roles asignados.</p>
                    )}
                  </ul>
                </div>

                <div className='addRol' onClick={handleAddRol}>
                  <p> Modificar Roles </p>
                </div>

              </div>

            </div>
            
            <div className="modal_buttons">
              <button type="submit" className="button_addedit">Guardar Cambios</button>
              <button type="button" className="button_close" onClick={onClose}>Cancelar</button>
            </div>

          </form>
        </div>

        {isModalAddRolOpen && (
          <AddRolModal isOpen={isModalAddRolOpen} onClose={closeModalAddRol} onRolesSelected={handleRolesSelected} initialSelectedRoles={rolesUsuario}/>
        )}
        
      </div>
    </Modal>
  );
};

export default EditUser;
