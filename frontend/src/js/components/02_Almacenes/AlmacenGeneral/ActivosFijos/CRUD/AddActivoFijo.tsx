import React from 'react';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { addActivoFijo, getActivosFijos } from '@/store/almacengeneral/Activos/activosActions';
import { setListActivosFijos } from '@/store/almacengeneral/Activos/activosReducer';
import { ActivoFactura, ActivosFijos, MovimientosActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { addMovimientoActivoFijo, getMovimientosActivosFijos } from '@/store/almacengeneral/Activos/MovimientosActivos/movimientosAFActions';
import { setListMovimientosAF } from '@/store/almacengeneral/Activos/MovimientosActivos/movimientosAFReducer';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import Modal from '@/components/00_Utils/ui/Modal';
import { getFechaHoraActual } from '@/utils/dateFormat';
import { validateClasificacionActivoFijo } from '@/utils/validators';
import { useActivoFijoForm } from '@/hooks/useActivoFijoForm';
import ActivoFijoFormFields from './subcomponents/ActivoFijoFormFields';
import ActivoFijoAsignacionFields from './subcomponents/ActivoFijoAsignacionFields';

import '@styles/02_Almacenes/AlmacenGeneral/ActivosFijos/modalActivosFijos.css';

interface AddActivoFijoProps {
  isOpen: boolean;
  onClose: () => void;
  onActivoCreado?: (activo: ActivosFijos) => void;
  soloDatos?: boolean;
  onAddAFToFactura?: (activoFijo: ActivoFactura) => void;
  onAddSinFactura: () => void;
}

const AddActivoFijo: React.FC<AddActivoFijoProps> = ({
  isOpen,
  onClose,
  onActivoCreado,
  soloDatos = false,
  onAddAFToFactura,
  onAddSinFactura,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    valores,
    setters,
    opciones,
    upper,
    construirActivoFijo,
    limpiarFormulario,
    enviarSoloDatos,
  } = useActivoFijoForm({ modo: 'add', soloDatos, onAddAFToFactura });

  const bindings = { valores, setters, opciones, upper };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {

      const nuevoActivoFijo: ActivosFijos = construirActivoFijo();

      console.log('AddActivoFijo', nuevoActivoFijo);

      const errorClasificacion = validateClasificacionActivoFijo(valores.afMenor, valores.tipoClasificacionAF);

      if (errorClasificacion) {
        Swal.fire({
          icon: 'warning',
          title: errorClasificacion.title,
          text: errorClasificacion.text,
          showCancelButton: errorClasificacion.showCancelButton,
          confirmButtonText: errorClasificacion.confirmButtonText,
          cancelButtonText: errorClasificacion.cancelButtonText,
        }).then((result) => {
          if (!result.isConfirmed) {
            return;
          }
        });
      }

      // Si solo se requieren los datos sin crear en BD
      if (soloDatos && onAddAFToFactura) {
        enviarSoloDatos();

        Swal.fire({
          icon: 'success',
          title: 'Activo agregado',
          text: 'El activo se ha agregado a la factura. Será creado al confirmar.',
          timer: 1500,
          showConfirmButton: false
        });

        onClose();
        return;
      }

      console.log('Nuevo Activo Fijo a crear:', nuevoActivoFijo);
      // Flujo normal: crear en BD inmediatamente
      const resultAction = await dispatch(addActivoFijo(nuevoActivoFijo)).unwrap();

      console.log('Resultado de crear activo fijo:', resultAction);

      if (resultAction.success) {

        const asignacionActivoFijo: MovimientosActivosFijos = {
          id_activo_fijo: resultAction.activofijo!.id_activo_fijo, // Asegurar que se pasa el ID correcto del activo creado
          id_tipo_movimiento: valores.tipoMovimiento,
          motivo_movimiento: valores.motivoMovimiento,
          fecha_movimiento: getFechaHoraActual(),
          id_responsable_anterior: 0,
          id_responsable_actual: valores.responsableActual,
          id_ubicacion_anterior: 0,
          id_ubicacion_actual: valores.ubicacionActual,
        };

        console.log('Asignación:', asignacionActivoFijo);

        const resultActionAsignacion = await dispatch(addMovimientoActivoFijo(asignacionActivoFijo)).unwrap();

        if (resultActionAsignacion.success) {
          const activosFijosActualizados = await dispatch(getActivosFijos()).unwrap();
          const movimientosAFActualizados = await dispatch(getMovimientosActivosFijos()).unwrap();

          if (activosFijosActualizados.success && movimientosAFActualizados.success) {
            dispatch(setListActivosFijos(activosFijosActualizados.activosFijos || []));
            dispatch(setListMovimientosAF(movimientosAFActualizados.movimientosAF || []));

            limpiarFormulario();

            // Llamar callback si existe - PASAR EL ACTIVO CREADO
            if (onActivoCreado) {
              onActivoCreado({
                ...nuevoActivoFijo,
                id_activo_fijo: resultAction.activofijo!.id_activo_fijo, // Asegurar que se pasa el ID correcto del activo creado
              });
            }

            Swal.fire({
              icon: 'success',
              title: 'Activo Fijo Añadido',
              text: 'El activo fijo y su asignación han sido añadidos exitosamente.',
              confirmButtonText: 'OK',
            });

            onAddSinFactura()
            onClose();

          } else {
            console.log('Error al actualizar los datos!');
          }

        } else {
          console.log('Error al añadir la asignación del activo fijo:', resultActionAsignacion.message);

        }

      } else {
        console.log('Error al añadir el activo fijo:', resultAction.message);
      }

    } catch (error) {
      console.error('Error al añadir activo fijo:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al añadir el activo fijo. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modalComponent_AlmacenAF"
    >
      <div className="modalActivosFijos">
        <h2>Añadir ActivoFijo</h2>

        <div className='divInputs_AddEdit_ActivoFijo'>
          <form onSubmit={handleSubmit} className="form_AddEdit_ActivoFijo">

            <div className='dataInputs_ActivoFijo'>

              <ActivoFijoFormFields
                bindings={bindings}
                textareaFields
                placeholders
              />

              {!soloDatos ? (
                <ActivoFijoAsignacionFields
                  bindings={bindings}
                />
              ) : null}

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

      </div>

    </Modal>
  );
};

export default AddActivoFijo;