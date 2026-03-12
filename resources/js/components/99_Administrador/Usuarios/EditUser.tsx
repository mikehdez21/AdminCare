import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { RootState, AppDispatch } from '@/store/store';
import { useSelector, useDispatch } from 'react-redux';

import AddRolModal from '@/components/99_Administrador/Usuarios/AddRolModal';

import { editUsuario, getUsers } from '@/store/administrador/Users/usersActions';
import { setListUsuarios } from '@/store/administrador/Users/usersReducer';

import { User, Roles, Departamentos } from '@/@types/mainTypes';
import { Empleados } from '@/@types/mainTypes';
import { getRoles } from '@/store/administrador/Roles/rolesActions';
import { getDepartamentos } from '@/store/administrador/Departamentos/departamentosActions';
import { getEmpleados } from '@/store/administrador/Empleados/empleadosActions';

import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/99_Administrador/Usuarios/modalUsuarios.css';
import { formatDateHorasToInputs, getFechaHoraActual } from '@/utils/dateFormat';

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
  const empleados = useSelector((state: RootState) => state.empleados.empleados);

  const [isModalAddRolOpen, setModalAddRolOpen] = useState(false);

  const [nombreUsuario, setNombreUsuario] = useState<string>('');
  const [emailUsuario, setEmail] = useState<string>('@');
  const emailParts = emailUsuario ? emailUsuario.split('@') : ['', ''];
  const localPart = emailParts[0] || '';
  const domainPart = emailParts[1] || '';
  const [passwordUsuario, setPassword] = useState<string>('');
  const [estatusActivo, setEstatusActivo] = useState<boolean>(true);
  const [fechaBaja, setFechaBaja] = useState<string>('');
  const [userCompartido, setUserCompartido] = useState<boolean>(false);
  const [rolesUsuario, setRolesUsuario] = useState<Roles[]>(usuarioToEdit?.roles || []);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<number>(0);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<number>(0);


  // Cargar roles y departamentos si no están disponibles
  useEffect(() => {
    if (roles.length === 0) {
      dispatch(getRoles());
    }
    if (departamentos.length === 0) {
      dispatch(getDepartamentos());
    }
    if (empleados.length === 0) {
      dispatch(getEmpleados());
    }
  }, [dispatch, roles.length, departamentos.length, empleados.length]);

  // Añadir Roles
  const openModalAddRol = () => {
    setModalAddRolOpen(true);
  };
  const closeModalAddRol = () => {
    setModalAddRolOpen(false);
  };

  const handleFechaBaja = () => {
    if (estatusActivo) {
      setFechaBaja(getFechaHoraActual());
    } else {
      setFechaBaja('');
    }
  }

  const handleUserActive = () => {
    setEstatusActivo((prevState) => !prevState);
    handleFechaBaja();

  };

  const handleUserCompartido = () => {
    setUserCompartido((prevState) => !prevState);
  };

  const handleAddRol = () => {
    openModalAddRol();
  };

  const handleRolesSelected = (selectedRoles: Roles[]) => {
    const newRole = selectedRoles;
    setRolesUsuario(newRole);
  };

  useEffect(() => {
    if (usuarioToEdit) {
      console.log('Información ACTUAL del usuario:', usuarioToEdit); // Log completo del usuario

      setNombreUsuario(usuarioToEdit.nombre_usuario);

      setEmail(usuarioToEdit.email_usuario || '@');

      setPassword(usuarioToEdit.password || '');

      setEstatusActivo(usuarioToEdit.estatus_activo || false);

      setFechaBaja(formatDateHorasToInputs(usuarioToEdit.fecha_baja) || '');

      setUserCompartido(usuarioToEdit.usuario_compartido || false);

      setRolesUsuario(usuarioToEdit.roles || []);
      setEmpleadoSeleccionado(usuarioToEdit.id_empleado || 0);

      setDepartamentoSeleccionado(usuarioToEdit.id_departamento || 0);
    } else {
      // Reset states for a clean form
      console.log('Reseteando los estados del formulario porque no hay usuario a editar.');
      setNombreUsuario('');
      setEmail('@');
      setPassword('');
      setEstatusActivo(true);
      setFechaBaja('');
      setUserCompartido(false);
      setRolesUsuario([]);
      setEmpleadoSeleccionado(0);
      setDepartamentoSeleccionado(0);
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
        estatus_activo: estatusActivo,
        fecha_baja: fechaBaja ? fechaBaja : null,
        usuario_compartido: userCompartido,
        roles: rolesUsuario,
        id_empleado: empleadoSeleccionado,
        id_departamento: departamentoSeleccionado,
      };

      const formData = new FormData();

      formData.append('id_usuario', usuarioEditado.id_usuario!.toString());
      formData.append('nombre_usuario', usuarioEditado.nombre_usuario);

      if (usuarioToEdit?.password) {
        formData.append('password', usuarioToEdit.password);
      } else {
        formData.append('firma_movimientos', passwordUsuario);
      }

      formData.append('password', usuarioEditado.password);
      formData.append('is_active', usuarioEditado.estatus_activo ? '1' : '0');
      if (usuarioEditado.id_empleado) {
        formData.append('id_empleado', usuarioEditado.id_empleado.toString());
      }
      formData.append('id_departamento', usuarioEditado.id_departamento!.toString());

      // Agregar roles (puedes hacer lo mismo si el usuario tiene roles asociados)
      usuarioEditado.roles.forEach((role) => {
        formData.append('roles[]', role.name);
      });

      console.log('dataUserEDIT_Enviada: ', usuarioEditado);
      const resultAction = await dispatch(editUsuario(usuarioEditado)).unwrap();
      console.log('Respuesta del servidor:', resultAction);

      if (resultAction.success) {
        // Si el proveedor fue editado con éxito, recargar la lista de usuarios
        const usuariosActualizados = await dispatch(getUsers()).unwrap();
        if (usuariosActualizados.success) {
          dispatch(setListUsuarios(usuariosActualizados.users!)); // Actualiza la lista de usuarios en el estado
          setNombreUsuario('');
          setEmail('');
          setPassword('');
          setEstatusActivo(true);
          setUserCompartido(false);
          setRolesUsuario([]); // Limpiar roles seleccionados
          setEmpleadoSeleccionado(0); // Limpiar empleado seleccionado
          setDepartamentoSeleccionado(0); // Limpiar departamento seleccionado

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
      className="modalUsuarios"
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
    >
      <div className="mainDiv_modalUsuarios">
        <h2>Editar Usuario</h2>
        <form onSubmit={handleSubmit} className="formUsuarios">
          <div className="dataInputs_Usuario">
            <section className="firstDiv_Inputs">
              <label>
                *Usuario:
                <input
                  type="text"
                  value={nombreUsuario}
                  id="nombreUsuario"
                  name="nombreUsuario"
                  onChange={(e) => setNombreUsuario(e.target.value)}
                  placeholder="JUsuario - Usuario"
                  required
                />
              </label>

              <label>
                *Email:
                <div className="emailInput">
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
                  id="passwordUsuario"
                  name="passwordUsuario"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña de mínimo 8 caracteres"
                />
              </label>

              <label>
                *Departamento:
                <select
                  value={departamentoSeleccionado}
                  id="departamentoSeleccionado"
                  name="departamentoSeleccionado"
                  onChange={(e) => setDepartamentoSeleccionado(parseInt(e.target.value, 10))} // Convertir string a number
                  required
                >
                  <option>Selecciona el Departamento Asignado</option>
                  {Array.isArray(departamentos) && departamentos.length > 0 ? (
                    departamentos.map((departamentos: Departamentos) => (
                      <option key={departamentos.id_departamento} value={departamentos.id_departamento}>
                        {departamentos.nombre_departamento.charAt(0).toUpperCase() +
                          departamentos.nombre_departamento.slice(1)}
                      </option>
                    ))
                  ) : (
                    <option disabled>No existen Departamentos Creados</option>
                  )}
                </select>
              </label>


            </section>

            <section className="secondDiv_Inputs">
              <div className="rolDepartamentoActive_Inputs">
                <small>
                  *Estatus del Usuario:
                  <div className="checkDiv">
                    <span>
                      {' '}
                      {estatusActivo ? 'Cuenta Activa' : 'Cuenta Desactivada'}
                      <label>
                        <input
                          name="cuentaActiva"
                          id="cuentaActiva"
                          type="checkbox"
                          onChange={handleUserActive}
                          checked={estatusActivo}
                        />
                      </label>
                    </span>
                  </div>
                </small>

                <label htmlFor="fecha_baja">Fecha Baja:</label>
                <input
                  type="datetime-local"
                  id="fecha_baja"
                  disabled={estatusActivo}
                  value={fechaBaja}
                  onChange={(e) => setFechaBaja(e.target.value)}
                />

                <small>
                  *Tipo de Usuario:
                  <div className="checkDiv">
                    <span>
                      {' '}
                      {userCompartido ? 'Usuario Compartido' : 'Usuario Asociado'}
                      <label>
                        <input
                          name="userShared"
                          id="userShared"
                          type="checkbox"
                          onChange={handleUserCompartido}
                          checked={!userCompartido}
                        />
                      </label>
                    </span>
                  </div>
                </small>

                <label>
                  *Empleado Asociado
                  <select
                    value={empleadoSeleccionado}
                    id="empleadoSeleccionado"
                    name="empleadoSeleccionado"
                    disabled={userCompartido}
                    onChange={(e) => setEmpleadoSeleccionado(parseInt(e.target.value, 10))} // Convertir string a number
                    required
                  >
                    <option>Selecciona el Empleado Asociado</option>
                    {Array.isArray(empleados) && empleados.length > 0 ? (
                      [...empleados]
                        .sort((a, b) => {
                          const nombreCompletoA =
                            `${a.nombre_empleado} ${a.apellido_paterno} ${a.apellido_materno}`.toLowerCase();
                          const nombreCompletoB =
                            `${b.nombre_empleado} ${b.apellido_paterno} ${b.apellido_materno}`.toLowerCase();
                          return nombreCompletoA.localeCompare(nombreCompletoB);
                        })
                        .map((empleado: Empleados) => (
                          <option key={empleado.id_empleado} value={empleado.id_empleado!}>
                            {empleado.nombre_empleado.charAt(0).toUpperCase() +
                              empleado.nombre_empleado.slice(1) +
                              ' ' +
                              empleado.apellido_paterno.charAt(0).toUpperCase() +
                              empleado.apellido_paterno.slice(1) +
                              ' ' +
                              empleado.apellido_materno.charAt(0).toUpperCase() +
                              empleado.apellido_materno.slice(1)}
                          </option>
                        ))
                    ) : (
                      <option disabled>No existen Empleados Creados</option>
                    )}
                  </select>
                </label>


              </div>
            </section>

            <section className="mainlist_roles">
              <h3>Roles del Usuario</h3>

              <div className="list_roles">
                <ul>
                  {rolesUsuario.length > 0 ? (
                    rolesUsuario.map((rol, index) => (
                      <li key={index}>{rol.name.charAt(0).toUpperCase() + rol.name.slice(1)}</li>
                    ))
                  ) : (
                    <p>No tiene roles asignados.</p>
                  )}
                </ul>
              </div>

              <div className="addRol" onClick={handleAddRol}>
                <p> Modificar Roles </p>
              </div>
            </section>
          </div>

          <ModalButtons
            buttons={[
              {
                text: 'Guardar',
                type: 'submit',
                className: 'button_addedit',
              },
              {
                text: 'Cancelar',
                type: 'button',
                className: 'button_close',
                onClick: onClose,
              },
            ]}
          />
        </form>

        {isModalAddRolOpen && (
          <AddRolModal
            isOpen={isModalAddRolOpen}
            onClose={closeModalAddRol}
            onRolesSelected={handleRolesSelected}
            initialSelectedRoles={rolesUsuario}
          />
        )}
      </div>
    </Modal>
  );
};

export default EditUser;
