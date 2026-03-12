import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { RootState, AppDispatch } from '@/store/store';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { editEmpleado, getEmpleados } from '@/store/administrador/Empleados/empleadosActions';
import { Empleados } from '@/@types/mainTypes';
import { setListEmpleados } from '@/store/administrador/Empleados/empleadosReducer';
import { formatDateHorasToInputs, formatDateNacimientoToInputs, getFechaHoraActual } from '@/utils/dateFormat';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import { getDepartamentos } from '@/store/administrador/Departamentos/departamentosActions';

import '@styles/99_Administrador/Empleados/modalEmpleados.css';

interface EditEmpleadoProps {
  isOpen: boolean;
  onClose: () => void;
  empleadoToEdit: Empleados | null;
}

const EditEmpleado: React.FC<EditEmpleadoProps> = ({ isOpen, onClose, empleadoToEdit }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [nombreEmpleado, setNombreEmpleado] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [emailEmpleado, setEmailEmpleado] = useState('');
  const [telefonoEmpleado, setTelefonoEmpleado] = useState('');
  const [generoEmpleado, setGeneroEmpleado] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [estatusActivo, setEstatusActivo] = useState<boolean>(true);
  const [fechaAlta, setFechaAlta] = useState('');
  const [fechaBaja, setFechaBaja] = useState('');
  const [fotoEmpleado, setFotoEmpleado] = useState<File | null>(null);
  const [imagenEmpleadoPreview, setImagenEmpleadoPreview] = useState<string | null>(null);
  const [firmaMovimientos, setFirmaMovimientos] = useState('');
  const [confirmarFirmaMov, setConfirmarFirmaMov] = useState('');
  const [tipoDepartamento, setTipoDepartamento] = useState<number>(0);

  const tiposDepartamentos = useSelector((state: RootState) => state.departamentos.departamentos);

  useEffect(() => {
    if (!tiposDepartamentos?.length) dispatch(getDepartamentos());
  }, [dispatch]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagenEmpleadoPreview(result);
      };
      reader.readAsDataURL(file);
      setFotoEmpleado(file); // Guardamos el archivo para enviarlo luego
    } else {
      // Si no se seleccionó archivo, dejamos la imagen original
      if (empleadoToEdit?.foto_empleado) {
        setImagenEmpleadoPreview(
          typeof empleadoToEdit.foto_empleado === 'string' ? empleadoToEdit.foto_empleado : null,
        );
        setFotoEmpleado(null); // No se cambia la imagen
      } else {
        setImagenEmpleadoPreview(null);
        setFotoEmpleado(null);
      }
    }
  };

  useEffect(() => {
    if (empleadoToEdit) {
      console.log('Información ACTUAL del empleado:', empleadoToEdit); // Log completo del usuario

      setNombreEmpleado(empleadoToEdit.nombre_empleado || '');
      setApellidoPaterno(empleadoToEdit.apellido_paterno || '');
      setApellidoMaterno(empleadoToEdit.apellido_materno || '');
      setEmailEmpleado(empleadoToEdit.email_empleado || '');
      setTelefonoEmpleado(empleadoToEdit.telefono_empleado || '');
      setGeneroEmpleado(empleadoToEdit.genero || '');

      setFechaNacimiento(formatDateNacimientoToInputs(empleadoToEdit.fecha_nacimiento) || '');
      setEstatusActivo(empleadoToEdit.estatus_activo);
      setFechaAlta(formatDateHorasToInputs(empleadoToEdit.fecha_alta) || ''); // Formatea la fecha de alta
      setFechaBaja(formatDateHorasToInputs(empleadoToEdit.fecha_baja) || ''); // Formatea la fecha de baja

      setFotoEmpleado(null); // No se puede asignar string, solo File o null
      setImagenEmpleadoPreview(typeof empleadoToEdit.foto_empleado === 'string' ? empleadoToEdit.foto_empleado : null); // Si tienes la URL/base64, úsala como preview
      setFirmaMovimientos('');
      setTipoDepartamento(empleadoToEdit.id_departamento || 0);
    } else {
      console.log('Reseteando los estados del formulario porque no hay usuario a editar.');
      setNombreEmpleado('');
      setApellidoPaterno('');
      setApellidoMaterno('');
      setEmailEmpleado('');
      setTelefonoEmpleado('');
      setGeneroEmpleado('');
      setFechaNacimiento('');
      setEstatusActivo(true);
      setFechaAlta('');
      setFechaBaja('');
      setFotoEmpleado(null);
      setImagenEmpleadoPreview(null);
      setFirmaMovimientos('');
      setConfirmarFirmaMov('');
      setTipoDepartamento(0);
    }
  }, [empleadoToEdit]);

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
      const empleadoEditado: Empleados = {
        id_empleado: empleadoToEdit?.id_empleado, // Mantener el ID del empleado
        nombre_empleado: nombreEmpleado,
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno,
        email_empleado: emailEmpleado,
        telefono_empleado: telefonoEmpleado,
        genero: generoEmpleado,
        fecha_nacimiento: fechaNacimiento,
        estatus_activo: estatusActivo,
        fecha_alta: fechaAlta,
        fecha_baja: fechaBaja,
        foto_empleado: fotoEmpleado,
        firma_movimientos: firmaMovimientos,
        id_departamento: tipoDepartamento,
      };

      const formData = new FormData();

      formData.append('id_empleado', empleadoToEdit?.id_empleado!.toString() || '');
      formData.append('nombre_empleado', nombreEmpleado);
      formData.append('apellido_paterno', apellidoPaterno);
      formData.append('apellido_materno', apellidoMaterno);
      formData.append('email_empleado', emailEmpleado);
      formData.append('telefono_empleado', telefonoEmpleado);
      formData.append('genero_empleado', generoEmpleado);
      formData.append('fecha_nacimiento', fechaNacimiento);
      formData.append('estatus_activo', estatusActivo ? '1' : '0');
      formData.append('fecha_alta', fechaAlta);
      formData.append('fecha_baja', fechaBaja);
      if (fotoEmpleado) {
        formData.append('foto_empleado', fotoEmpleado);
      }

      if (empleadoToEdit?.firma_movimientos) {
        formData.append('firma_movimientos', empleadoToEdit.firma_movimientos);
      } else {
        formData.append('firma_movimientos', firmaMovimientos);
      }

      formData.append('id_departamento', tipoDepartamento.toString());

      const resultAction = await dispatch(editEmpleado(empleadoEditado)).unwrap();

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
        }
      } else {
        console.log('Error al agregar al empleado:', resultAction.message);
      }

      // Mostrar SweetAlert para éxito
      Swal.fire({
        icon: 'success',
        title: 'Empleado Actualizado',
        text: 'El Empleado ha sido actualizado exitosamente.',
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
      contentLabel="Editar Nueva Entity"
      className="modalEmpleados"
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
    >
      <div className="mainDiv_modalDepartamentos">
        <h2>Editar Empleado </h2>

        <form onSubmit={handleSubmit} className="formEmpleados">
          <div className="dataInputs_Empleados">
            <div className="firstColumn_Inputs">
              <label htmlFor="nombre_empleado">Nombre:</label>
              <input
                type="text"
                id="nombre_empleado"
                value={nombreEmpleado}
                onChange={(e) => setNombreEmpleado(e.target.value)}
                required
              />

              <label htmlFor="apellido_paterno">Apellido Paterno:</label>
              <input
                type="text"
                id="apellido_paterno"
                value={apellidoPaterno}
                onChange={(e) => setApellidoPaterno(e.target.value)}
                required
              />

              <label htmlFor="apellido_materno">Apellido Materno:</label>
              <input
                type="text"
                id="apellido_materno"
                value={apellidoMaterno}
                onChange={(e) => setApellidoMaterno(e.target.value)}
              />

              <label htmlFor="email_empleado">
                Email:
                <div className="emailInput">
                  <input
                    type="text"
                    value={emailEmpleado.split('@')[0]}
                    id="emailUsuario"
                    name="emailUsuario"
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
                    id="emailDomain"
                    name="emailDomain"
                    onChange={(e) => {
                      const firstPart = emailEmpleado.split('@')[0];
                      setEmailEmpleado(`${firstPart}@${e.target.value}`);
                    }}
                    required
                    placeholder="dominio.com"
                  />
                </div>
              </label>

              <label htmlFor="fecha_nacimiento">Fecha Nacimiento:</label>
              <input
                type="date"
                id="fecha_nacimiento"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
              />
            </div>

            <div className="secondColumn_Inputs">
              <label htmlFor="genero_empleado">Género:</label>
              <select id="genero_empleado" value={generoEmpleado} onChange={(e) => setGeneroEmpleado(e.target.value)}>
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
              <div className="checkDiv">
                <span>
                  {' '}
                  {estatusActivo ? 'Empleado Activo' : 'Empleado Inactivo'}
                  <input
                    name="cuentaActiva"
                    id="cuentaActiva"
                    type="checkbox"
                    onChange={handleUserActive}
                    checked={estatusActivo}
                  />
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
                value={fechaBaja}
                onChange={(e) => setFechaBaja(e.target.value)}
              />
            </div>

            <div className="thirdColumn_Inputs">
              <label htmlFor="foto_empleado">Foto Empleado:</label>
              <input
                type="file"
                id="foto_empleado"
                name="avatar"
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
              />

              <label htmlFor="departamento">Departamento:</label>
              <select
                id="departamento"
                value={tipoDepartamento || ''}
                onChange={(e) => setTipoDepartamento(Number(e.target.value))}
              >
                <option value="" disabled>
                  Seleccione una opción
                </option>
                {Array.isArray(tiposDepartamentos) &&
                  tiposDepartamentos.map((tipoDepartamento) => (
                    <option key={tipoDepartamento.id_departamento} value={tipoDepartamento.id_departamento}>
                      {tipoDepartamento.nombre_departamento}
                    </option>
                  ))}
              </select>

              <label htmlFor="firma_movimientos">Firma Movimientos:</label>
              <input
                type="text"
                id="firma_movimientos"
                value={firmaMovimientos}
                onChange={(e) => setFirmaMovimientos(e.target.value)}
              />

              <label htmlFor="firma_movimientos">Confirmar Firma Movimientos:</label>
              <input
                type="text"
                id="confirmarfirma_movimientos"
                value={confirmarFirmaMov}
                onChange={(e) => setConfirmarFirmaMov(e.target.value)}
              />
            </div>

            <div className="fourthColumn_Inputs">
              <div className="imagePreview">
                {imagenEmpleadoPreview ? <img src={imagenEmpleadoPreview} /> : <span>Imagen previa</span>}
              </div>
            </div>
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
      </div>
    </Modal>
  );
};

export default EditEmpleado;
