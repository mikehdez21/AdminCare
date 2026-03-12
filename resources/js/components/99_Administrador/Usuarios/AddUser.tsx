import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { RootState, AppDispatch } from '@/store/store';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

import { setListUsuarios } from '@/store/administrador/Users/usersReducer';
import { addUser, getUsers } from '@/store/administrador/Users/usersActions';

import { getRoles } from '@/store/administrador/Roles/rolesActions';
import { getDepartamentos } from '@/store/administrador/Departamentos/departamentosActions';
import { getEmpleados } from '@/store/administrador/Empleados/empleadosActions';

import { User, Roles, Departamentos } from '@/@types/mainTypes';
import { Empleados } from '@/@types/mainTypes';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import AddRolModal from '@/components/99_Administrador/Usuarios/AddRolModal';


import '@styles/99_Administrador/Usuarios/modalUsuarios.css';
import { getFechaHoraActual } from '@/utils/dateFormat';

interface AddUserProps {
  isOpen: boolean;
  onClose: () => void;
}

Modal.setAppElement('#root');

const AddUser: React.FC<AddUserProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const roles = useSelector((state: RootState) => state.roles.roles);
  const departamentos = useSelector((state: RootState) => state.departamentos.departamentos);
  const empleados = useSelector((state: RootState) => state.empleados.empleados);

  const [isModalAddRolOpen, setModalAddRolOpen] = useState(false);

  const [nombreUsuario, setNombreUsuario] = useState<string>('');
  const [emailUsuario, setEmailUsuario] = useState<string>('');
  const [passwordUsuario, setPasswordUsuario] = useState<string>('');
  const [estatusActivo, setEstatusActivo] = useState<boolean>(true);
  const [fechaBaja, setFechaBaja] = useState<string>('');
  const [userCompartido, setUserCompartido] = useState<boolean>(false);
  const [rolesUsuario, setRolesUsuario] = useState<Roles[]>([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<string>('');
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<string>('');

  // Cargar roles, empleados y departamentos si no están disponibles
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


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const nuevoUsuario: User = {
        nombre_usuario: nombreUsuario,
        email_usuario: emailUsuario,
        password: passwordUsuario,
        estatus_activo: estatusActivo,
        fecha_baja: getFechaHoraActual(),
        usuario_compartido: userCompartido,
        roles: rolesUsuario,
        id_empleado: Number(empleadoSeleccionado) || null,
        id_departamento: Number(departamentoSeleccionado),

      };

      console.log('dataUserADD_Enviada: ', nuevoUsuario);
      const resultAction = await dispatch(addUser(nuevoUsuario)).unwrap();
      console.log('Respuesta del servidor:', resultAction);

      if (resultAction.success) {
        // Si el usuario fue agregado con éxito, recargar la lista de usuarios
        const usuariosActualizados = await dispatch(getUsers()).unwrap();

        if (usuariosActualizados.success) {
          dispatch(setListUsuarios(usuariosActualizados.users!)); // Actualiza la lista de usuarios en el estado
          setNombreUsuario('');
          setEmailUsuario('');
          setPasswordUsuario('');
          setEstatusActivo(true);
          setFechaBaja('');
          setUserCompartido(false);
          setRolesUsuario([]);
          setEmpleadoSeleccionado('');
          setDepartamentoSeleccionado('');

          console.log('Usuario agregado y lista recargada:', usuariosActualizados.users);

          // Mostrar SweetAlert para éxito
          Swal.fire({
            icon: 'success',
            title: 'Usuario Añadido',
            text: 'El Usuario ha sido añadido exitosamente.',
            confirmButtonText: 'OK',
          });
          onClose(); // Cerrar modal al completar el envío
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al añadir el usuario. Por favor, inténtalo de nuevo.',
          confirmButtonText: 'OK',
        });
        console.log('Error al agregar el usuario: ', resultAction.message);
      }
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
    <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Añadir Nueva Entity" className="modalUsuarios">
      <div className="mainDiv_modalUsuarios">
        <h2>Añadir Usuario</h2>

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
                    value={emailUsuario.split('@')[0]}
                    id="emailUsuario"
                    name="emailUsuario"
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
                    id="emailDomain"
                    name="emailDomain"
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
                  id="passwordUsuario"
                  name="passwordUsuario"
                  onChange={(e) => setPasswordUsuario(e.target.value)}
                  placeholder="Contraseña de mínimo 8 caracteres"
                  required
                />
              </label>

              <label>
                *Departamento:
                <select
                  value={departamentoSeleccionado}
                  id="departamentoSeleccionado"
                  name="departamentoSeleccionado"
                  onChange={(e) => setDepartamentoSeleccionado(e.target.value)}
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
                        name="userAsociado"
                        id="userAsociado"
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
                  onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
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

export default AddUser;
