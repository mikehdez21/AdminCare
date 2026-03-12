import React, { useState, useEffect } from 'react'
import Modal from 'react-modal';
import { RootState, AppDispatch } from '@/store/store';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

import { addEmpleado, getEmpleados } from '@/store/administrador/Empleados/empleadosActions';
import { setListEmpleados } from '@/store/administrador/Empleados/empleadosReducer';
import { getDepartamentos } from '@/store/administrador/Departamentos/departamentosActions';

import { Empleados } from '@/@types/mainTypes';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import { getFechaHoraActual } from '@/utils/dateFormat';

import '@styles/99_Administrador/Empleados/modalEmpleados.css'


interface AddUserProps {
  isOpen: boolean;
  onClose: () => void;
}

Modal.setAppElement('#root');

const AddEmpleado: React.FC<AddUserProps> = ({ isOpen, onClose }) => {

  const dispatch = useDispatch<AppDispatch>();

  const departamentos = useSelector((state: RootState) => state.departamentos.departamentos);

  const [nombreEmpleado, setNombreEmpleado] = useState<string>('');
  const [apellidoPaterno, setApellidoPaterno] = useState<string>('');
  const [apellidoMaterno, setApellidoMaterno] = useState<string>('');
  const [emailEmpleado, setEmailEmpleado] = useState<string>('');
  const [telefonoEmpleado, setTelefonoEmpleado] = useState<string>('');
  const [generoEmpleado, setGeneroEmpleado] = useState<string>('');
  const [fechaNacimiento, setFechaNacimiento] = useState<string>('');
  const [estatusActivo, setEstatusActivo] = useState<boolean>(true);
  const [fechaAlta, setFechaAlta] = useState<string>(getFechaHoraActual);
  const [fechaBaja, setFechaBaja] = useState<string>('');
  const [fotoEmpleado, setFotoEmpleado] = useState<File | null>(null);
  const [imagenEmpleadoPreview, setImagenEmpleadoPreview] = useState<string | null>(null)
  const [firmaMovimientos, setFirmaMovimientos] = useState('');
  const [confirmarFirmaMov, setConfirmarFirmaMov] = useState('');
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<string>('');

  // Cargar departamentos si no están disponibles
  useEffect(() => {
    if (departamentos.length === 0) {
      dispatch(getDepartamentos());
    }
  }, [dispatch, departamentos.length]);

  const handleUserActive = () => {
    setEstatusActivo((prevState) => {
      const nextState = !prevState;
      setFechaBaja(nextState ? '' : getFechaHoraActual());
      return nextState;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagenEmpleadoPreview(result);
      };
      reader.readAsDataURL(file);
    }
    setFotoEmpleado(file!);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (firmaMovimientos !== confirmarFirmaMov) {
      Swal.fire({
        icon: 'error',
        title: 'Las Firmas no coinciden',
        text: 'Verifica que coincidan las firmas',
        confirmButtonText: 'OK',

      });
      setFirmaMovimientos('');
      setConfirmarFirmaMov('');
      return;
    }

    try {
      const nuevoEmpleado: Empleados = {
        nombre_empleado: nombreEmpleado,
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno,
        email_empleado: emailEmpleado,
        telefono_empleado: telefonoEmpleado,
        genero: generoEmpleado,
        fecha_nacimiento: fechaNacimiento,
        estatus_activo: estatusActivo,
        fecha_alta: fechaAlta,
        fecha_baja: estatusActivo ? '' : fechaBaja || getFechaHoraActual(),
        foto_empleado: fotoEmpleado,
        firma_movimientos: firmaMovimientos,
        id_departamento: Number(departamentoSeleccionado),
      };

      const formData = new FormData();

      formData.append('nombre_empleado', nuevoEmpleado.nombre_empleado);
      formData.append('apellido_paterno', nuevoEmpleado.apellido_paterno);
      formData.append('apellido_materno', nuevoEmpleado.apellido_materno);
      formData.append('email_empleado', nuevoEmpleado.email_empleado);
      formData.append('telefono_empleado', nuevoEmpleado.telefono_empleado);
      formData.append('genero', nuevoEmpleado.genero);
      formData.append(
        'fecha_nacimiento',
        nuevoEmpleado.fecha_nacimiento ? nuevoEmpleado.fecha_nacimiento.toString() : '',
      );
      formData.append('estatus_activo', nuevoEmpleado.estatus_activo ? '1' : '0');
      formData.append(
        'fecha_alta',
        nuevoEmpleado.fecha_alta ? nuevoEmpleado.fecha_alta.toString() : '',
      );
      if (!nuevoEmpleado.estatus_activo && nuevoEmpleado.fecha_baja) {
        formData.append('fecha_baja', nuevoEmpleado.fecha_baja.toString());
      }
      if (fotoEmpleado) {
        formData.append('foto_empleado', fotoEmpleado);
      }
      formData.append('firma_movimientos', nuevoEmpleado.firma_movimientos);
      formData.append('id_departamento', nuevoEmpleado.id_departamento!.toString());

      console.log('FormData preparado para envío:', formData);

      // 👇 Envío correcto con todos los parámetros
      const resultAction = await dispatch(addEmpleado(formData)).unwrap();

      if (resultAction.success) {
        const empleadosActualizados = await dispatch(getEmpleados()).unwrap();

        if (empleadosActualizados.success) {
          dispatch(setListEmpleados(empleadosActualizados.empleados!));
          setNombreEmpleado('');
          setApellidoPaterno('');
          setApellidoMaterno('');
          setEmailEmpleado('');
          setEstatusActivo(true);
          setFechaAlta('');
          setFechaBaja('');
          setFotoEmpleado(null);
          setImagenEmpleadoPreview(null);
          setFirmaMovimientos('');
          setConfirmarFirmaMov('');

          console.log('Empleado agregado y lista recargada:', empleadosActualizados.empleados);
        }
      } else {
        console.log('Error al agregar al empleado:', resultAction.message);
      }

      // Mostrar SweetAlert para éxito
      Swal.fire({
        icon: 'success',
        title: 'Empleado Añadido',
        text: 'El Empleado ha sido añadido exitosamente.',
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
      className="modalEmpleados"
    >
      <div className="mainDiv_modalDepartamentos">
        <h2>Añadir Empleado</h2>

        <form onSubmit={handleSubmit} className='formEmpleados'>
          <div className='dataInputs_Empleados'>

            <section className='firstColumn_Inputs'>
              <label htmlFor="nombre_empleado">Nombres*:</label>
              <input
                type="text"
                id="nombre_empleado"
                value={nombreEmpleado}
                onChange={(e) => setNombreEmpleado(e.target.value)}
                required
              />

              <label htmlFor="apellido_paterno">Apellido Paterno*:</label>
              <input
                type="text"
                id="apellido_paterno"
                value={apellidoPaterno}
                onChange={(e) => setApellidoPaterno(e.target.value)}
                required
              />

              <label htmlFor="apellido_materno">Apellido Materno*:</label>
              <input
                type="text"
                id="apellido_materno"
                value={apellidoMaterno}
                onChange={(e) => setApellidoMaterno(e.target.value)}
              />

              <label htmlFor="email_empleado">Email*:
                <div className='emailInput'>
                  <input
                    type="text"
                    value={emailEmpleado.split('@')[0]}
                    id='emailUsuario'
                    name='emailUsuario'
                    onChange={(e) => {
                      const domain = emailEmpleado.split('@')[1] || '';
                      setEmailEmpleado(`${e.target.value}@${domain}`);
                    }}
                    required
                    placeholder="email"
                  />
                  <span> @ </span>
                  <input
                    type="text"
                    value={emailEmpleado.split('@')[1] || ''}
                    id='emailDomain'
                    name='emailDomain'
                    onChange={(e) => {
                      const firstPart = emailEmpleado.split('@')[0];
                      setEmailEmpleado(`${firstPart}@${e.target.value}`);
                    }}
                    required
                    placeholder="dominio.com"
                  />
                </div>
              </label>

              <label htmlFor="fecha_nacimiento">Fecha Nacimiento*:</label>
              <input
                type="date"
                id="fecha_nacimiento"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                required
              />

            </section>

            <section className='secondColumn_Inputs'>
              <label htmlFor="genero_empleado">Género*:</label>
              <select
                id="genero_empleado"
                value={generoEmpleado}
                onChange={(e) => setGeneroEmpleado(e.target.value)}
                required
              >
                <option value="">Seleccionar</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>

              <label htmlFor="telefono_empleado">Teléfono:</label>
              <input
                type="number"
                id="telefono_empleado"
                value={telefonoEmpleado}
                onChange={(e) => setTelefonoEmpleado(e.target.value)}
              />



              <label> Estatus del Empleado: </label>
              <div className='checkDiv'>

                <span> {estatusActivo ? 'Empleado Activo' : 'Empleado Inactivo'}
                  <input name="cuentaActiva" id="cuentaActiva" type="checkbox" onChange={handleUserActive} checked={estatusActivo} />
                </span>

              </div>

              <label htmlFor="fecha_alta">Fecha Alta:</label>
              <input
                type="datetime-local"
                id="fecha_alta"
                value={fechaAlta}
                onChange={(e) => setFechaAlta(e.target.value)}
              />

              <label htmlFor="fecha_baja">Fecha Baja:</label>
              <input
                type="datetime-local"
                id="fecha_baja"
                disabled={estatusActivo}
                min={fechaAlta} // Asegura que la fecha de baja sea después de la fecha de alta
                value={fechaBaja}
                onChange={(e) => setFechaBaja(e.target.value)}
              />

            </section>

            <section className='thirdColumn_Inputs'>
              <label htmlFor="foto_empleado">Foto Empleado:</label>
              <input
                type="file"
                id="foto_empleado"
                name='avatar'
                accept='image/png, image/jpeg'
                onChange={handleImageChange}
              />

              <label htmlFor="departamento">Departamento*:</label>
              <select
                id="departamento"
                value={departamentoSeleccionado}
                onChange={(e) => setDepartamentoSeleccionado(e.target.value)}
                required
              >
                <option value="">Seleccionar</option>
                {departamentos.map((departamento) => (
                  <option key={departamento.id_departamento} value={departamento.id_departamento}>
                    {departamento.nombre_departamento}
                  </option>
                ))}
              </select>

              <label htmlFor="firma_movimientos">Firma Movimientos:</label>
              <input
                type="text"
                id="firma_movimientos"
                value={firmaMovimientos}
                onChange={(e) => setFirmaMovimientos(e.target.value)}
                required
              />

              <label htmlFor="firma_movimientos">Confirmar Firma Movimientos:</label>
              <input
                type="text"
                id="confirmarfirma_movimientos"
                value={confirmarFirmaMov}
                onChange={(e) => setConfirmarFirmaMov(e.target.value)}
                required
              />


            </section>

            <section className='fourthColumn_Inputs'>
              <div className='imagePreview'>
                {imagenEmpleadoPreview ? (
                  <img
                    src={imagenEmpleadoPreview}
                  />
                ) : (
                  <span>Imagen previa</span>
                )}
              </div>
            </section>

          </div>

          <ModalButtons
            buttons={[
              {
                text: 'Guardar',
                type: 'submit',
                className: 'button_addedit'
              },
              {
                text: 'Cancelar',
                type: 'button',
                className: 'button_close',
                onClick: onClose
              }
            ]}
          />
        </form>

      </div>
    </Modal>

  )
}

export default AddEmpleado

