import React, {useState, useEffect} from 'react'
import Modal from 'react-modal';
import { RootState, AppDispatch } from '@/store/store';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2'; 

import { addEmpleado, getEmpleados } from '@/store/Empleados/empleadosActions';
import { setListEmpleados } from '@/store/Empleados/empleadosReducer';
import { getDepartamentos } from '@/store/Departamentos/departamentosActions';

import { Empleados } from '@/@types/mainTypes';

import '@styles/99_Administrador/addeditdelete_adminEntities.css'

interface AddUserProps {
    isOpen: boolean;
    onClose: () => void;
  }

Modal.setAppElement('#root');

const AddEmpleado: React.FC<AddUserProps> = ({isOpen, onClose}) => {
  const dispatch = useDispatch<AppDispatch>();

  const getFechaHoraActual = (): string => {
    const ahora = new Date();
    const offset = ahora.getTimezoneOffset(); // Ajuste de zona horaria
    const fechaAjustada = new Date(ahora.getTime() - offset * 60 * 1000); // Convertir a hora local
    return fechaAjustada.toISOString().slice(0, 16); // Formato: YYYY-MM-DDTHH:mm
  };

  const departamentos = useSelector((state: RootState) => state.departamentos.departamentos);

  const [nombreEmpleado, setNombreEmpleado] = React.useState('');
  const [apellidoPaterno, setApellidoPaterno] = React.useState('');
  const [apellidoMaterno, setApellidoMaterno] = React.useState('');
  const [emailEmpleado, setEmailEmpleado] = React.useState('');
  const [telefonoEmpleado, setTelefonoEmpleado] = React.useState('');
  const [generoEmpleado, setGeneroEmpleado] = React.useState('');
  const [fechaNacimiento, setFechaNacimiento] = React.useState('');
  const [estatusActivo, setEstatusActivo] = React.useState<boolean>(true);
  const [fechaAlta, setFechaAlta] = React.useState(getFechaHoraActual);
  const [fechaBaja, setFechaBaja] = React.useState('');
  const [fotoEmpleado, setFotoEmpleado] = React.useState<File | null>(null);
  const [imagenEmpleadoPreview, setImagenEmpleadoPreview] = React.useState<string | null>(null)
  const [firmaMovimientos, setFirmaMovimientos] = React.useState('');
  const [confirmarFirmaMov, setConfirmarFirmaMov] = React.useState('');
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<string>('');

  // Cargar departamentos si no están disponibles
  useEffect(() => {
    if (departamentos.length === 0) {
      dispatch(getDepartamentos());
    }
  }, [dispatch, departamentos.length]);

  const handleUserActive = () => {
    setEstatusActivo((prevState) => !prevState);
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

    try{
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
        fecha_baja: fechaBaja ? fechaBaja : null,
        foto_empleado: fotoEmpleado,
        firma_movimientos: firmaMovimientos,
        id_departamento: Number(departamentoSeleccionado),
      };

      // 👇 Envío correcto con todos los parámetros
      const resultAction = await dispatch(
        addEmpleado({
          empleado: nuevoEmpleado,
          fotoEmpleado: fotoEmpleado,
        })
      ).unwrap();

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
      className="modal_CRUD_AdminEntity"
      overlayClassName="modal_OverlayCRUD_AdminEntity"
    >
      <div className="modal_Content_Admin">
        <h2>Añadir Empleado</h2>

        <div className='mainInputs_addedit_AdminEntity'>
          <form onSubmit={handleSubmit} className='form_AdminEntity'>
            <div className='dataInputs_Empleados'>

              <div className='firstColumn_Inputs'>
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

                <label htmlFor="email_empleado">Email:
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

                <label htmlFor="fecha_nacimiento">Fecha Nacimiento:</label>
                <input
                  type="date"
                  id="fecha_nacimiento"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                />
                
              </div>

              <div className='secondColumn_Inputs'>
                <label htmlFor="genero_empleado">Género:</label>
                <select
                  id="genero_empleado"
                  value={generoEmpleado}
                  onChange={(e) => setGeneroEmpleado(e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>

                <label htmlFor="telefono_empleado">Teléfono:</label>
                <input
                  type="text"
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
                  step={60} // Opcional: para evitar segundos (solo HH:MM)
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

              </div>

              <div className='thirdColumn_Inputs'>
                <label htmlFor="foto_empleado">Foto Empleado:</label>
                <input
                  type="file"
                  id="foto_empleado"
                  name='avatar'
                  accept='image/png, image/jpeg'
                  onChange={handleImageChange}
                />

                <label htmlFor="departamento">Departamento:</label>
                <select
                  id="departamento"
                  value={departamentoSeleccionado}
                  onChange={(e) => setDepartamentoSeleccionado(e.target.value)}
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
                />

                <label htmlFor="firma_movimientos">Confirmar Firma Movimientos:</label>
                <input
                  type="text"
                  id="confirmarfirma_movimientos"
                  value={confirmarFirmaMov}
                  onChange={(e) => setConfirmarFirmaMov(e.target.value)}
                />

                
              </div>

              <div className='fourthColumn_Inputs'>
                <div className='imagePreview'>
                  {imagenEmpleadoPreview ? (
                    <img
                      src={imagenEmpleadoPreview}
                    />
                  ) : (
                    <span>Imagen previa</span>
                  )}
                </div>
              </div>

            </div>

            <div className="modal_buttons">
              <button type="submit" className="button_addedit">Añadir Empleado</button>
              <button type="button" className="button_close" onClick={onClose}>Cancelar</button>
            </div>  
          </form>
        </div>

      </div>
    </Modal>
    
  )
}

export default AddEmpleado

