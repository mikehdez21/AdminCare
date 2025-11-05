import React, {useEffect, useState} from 'react'
import Modal from 'react-modal';
import { RootState, AppDispatch } from '@/store/store';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2'; 


import { editEmpleado, getEmpleados } from '@/store/Empleados/empleadosActions';
import { getDepartamentos } from '@/store/Departamentos/departamentosActions';

import { Departamentos, Empleados } from '@/@types/mainTypes';
import { setListEmpleados } from '@/store/Empleados/empleadosReducer';
import { formatDateHorasToInputs, formatDateNacimientoToBackend } from '@/utils/dateFormat';

import '@styles/99_Administrador/addeditdelete_adminEntities.css'


interface EditEmpleadoProps {
  isOpen: boolean;
  onClose: () => void;
  empleadoToEdit: Empleados | null;
}


const EditEmpleado: React.FC<EditEmpleadoProps> = ({isOpen, onClose, empleadoToEdit}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const departamentos = useSelector((state: RootState) => state.departamentos.departamentos);
  
  const [nombreEmpleado, setNombreEmpleado] = React.useState('');
  const [apellidoPaterno, setApellidoPaterno] = React.useState('');
  const [apellidoMaterno, setApellidoMaterno] = React.useState('');
  const [emailEmpleado, setEmailEmpleado] = React.useState('');
  const [telefonoEmpleado, setTelefonoEmpleado] = React.useState('');
  const [generoEmpleado, setGeneroEmpleado] = React.useState('');
  const [fechaNacimiento, setFechaNacimiento] = React.useState('');
  const [estatusActivo, setEstatusActivo] = React.useState<boolean>(true);
  const [fechaAlta, setFechaAlta] = React.useState('');
  const [fechaBaja, setFechaBaja] = React.useState('');
  const [fotoEmpleado, setFotoEmpleado] = React.useState<File | null>(null);
  const [imagenEmpleadoPreview, setImagenEmpleadoPreview] = React.useState<string | null>(null)
  const [firmaMovimientos, setFirmaMovimientos] = React.useState('');
  const [confirmarFirmaMov, setConfirmarFirmaMov] = React.useState('');
  const [departamentoSeleccionado, setEmpleadoDepartamento] = useState<Departamentos['id_departamento']>(0);
  

  // Cargar departamentos si no están disponibles
  useEffect(() => {
    if (departamentos.length === 0) {
      dispatch(getDepartamentos());
    }
  }, [dispatch, departamentos.length]);

  
  const handleUserActive = () => {
    setEstatusActivo((prevState) => !prevState);
    if (estatusActivo === false) {
      setFechaBaja(''); 
    } else {
      
      const getLocalDateTime = () => {
        const date = new Date();
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60 * 1000);
        return localDate.toISOString().slice(0, 16);
      };

      setFechaBaja(getLocalDateTime());
    }
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
          typeof empleadoToEdit.foto_empleado === 'string'
            ? empleadoToEdit.foto_empleado
            : null
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

      const fechaNacimientoFormated = formatDateNacimientoToBackend(empleadoToEdit.fecha_nacimiento);
      const fechaAltaFormated = formatDateHorasToInputs(empleadoToEdit.fecha_alta);
      const fechaBajaFormated = formatDateHorasToInputs(empleadoToEdit.fecha_baja);

      setFechaNacimiento(fechaNacimientoFormated || ''); // Asegúrate de formatear correctamente la fecha
      setEstatusActivo(empleadoToEdit.estatus_activo || true);
      setFechaAlta(fechaAltaFormated || ''); // Formatea la fecha de alta
      setFechaBaja(fechaBajaFormated || ''); // Formatea la fecha de baja
      
      setFotoEmpleado(null); // No se puede asignar string, solo File o null
      setImagenEmpleadoPreview(
        typeof empleadoToEdit.foto_empleado === 'string'
          ? empleadoToEdit.foto_empleado
          : null
   
      ); // Si tienes la URL/base64, úsala como preview
      setFirmaMovimientos('');
      setEmpleadoDepartamento(empleadoToEdit.id_departamento || 0);
        
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
      setEmpleadoDepartamento(0);
        
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

    try{
      const empleadoEditado: Empleados = {
        nombre_empleado: empleadoToEdit?.nombre_empleado || '',
        apellido_paterno: empleadoToEdit?.apellido_paterno || '',
        apellido_materno: empleadoToEdit?.apellido_materno || '',
        email_empleado: empleadoToEdit?.email_empleado || '',
        telefono_empleado: empleadoToEdit?.telefono_empleado || '',
        genero: empleadoToEdit?.genero || '',
        fecha_nacimiento: empleadoToEdit?.fecha_nacimiento || '',
        estatus_activo: empleadoToEdit?.estatus_activo || true,
        fecha_alta: empleadoToEdit?.fecha_alta || '',
        fecha_baja: empleadoToEdit?.fecha_baja || '',
        foto_empleado: empleadoToEdit?.foto_empleado || '',
        firma_movimientos: empleadoToEdit?.firma_movimientos || '',
        id_departamento: empleadoToEdit?.id_departamento || 0,
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
      formData.append('firma_movimientos', firmaMovimientos);
        
      const departamento = departamentos.find((dep) => dep.id_departamento === departamentoSeleccionado);
      if (departamento) {
        formData.append('id_departamento', departamento.id_departamento!.toString());
      } else {
        console.error('Departamento no encontrado:', departamentoSeleccionado);
      }

      for (const [key, value] of formData.entries()) {
        console.log(`EditEmpleado - ${key}: `, value);  // Verifica todos los valores que están siendo agregados
      }

      
      console.log('dataEmpleadoEDIT_Enviada: ', empleadoEditado)
      const resultAction = await dispatch(editEmpleado(empleadoEditado)).unwrap();
      console.log('Respuesta del servidor:', resultAction);
        
    
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

  console.log(empleadoToEdit!.fecha_nacimiento)
  console.log(empleadoToEdit!.fecha_alta)
  console.log(empleadoToEdit!.fecha_baja) 
      
  
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
        <h2>Editar Empleado - {empleadoToEdit?.nombre_empleado} {empleadoToEdit?.apellido_paterno} {empleadoToEdit?.apellido_materno} </h2>
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
                  onChange={(e) => setEmpleadoDepartamento(Number(e.target.value))}
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
              <button type="submit" className="button_addedit">Editar Empleado</button>
              <button type="button" className="button_close" onClick={onClose}>Cancelar</button>
            </div>  
          </form>
        </div>

      </div>
    </Modal>
  )
}

export default EditEmpleado