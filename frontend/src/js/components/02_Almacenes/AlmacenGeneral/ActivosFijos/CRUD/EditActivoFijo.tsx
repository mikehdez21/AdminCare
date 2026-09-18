import React from 'react';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { ActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { editActivoFijo, getActivosFijos } from '@/store/almacengeneral/Activos/activosActions';
import { setListActivosFijos } from '@/store/almacengeneral/Activos/activosReducer';
import Swal from 'sweetalert2';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import Modal from '@/components/00_Utils/ui/Modal';
import { useActivoFijoForm } from '@/hooks/useActivoFijoForm';
import ActivoFijoFormFields from './subcomponents/ActivoFijoFormFields';
import ActivoFijoAsignacionFields from './subcomponents/ActivoFijoAsignacionFields';

import '@styles/02_Almacenes/AlmacenGeneral/ActivosFijos/modalActivosFijos.css';

interface EditActivoFijoProps {
  isOpen: boolean;
  onClose: () => void;
  activoFijoToEdit: ActivosFijos | null;
  onEdit: () => void;
}

const EditActivoFijo: React.FC<EditActivoFijoProps> = ({ isOpen, onClose, activoFijoToEdit, onEdit }) => {

  const dispatch = useDispatch<AppDispatch>();

  const {
    valores,
    setters,
    opciones,
    upper,
    codigoUnico,
    construirActivoFijo,
    limpiarFormulario,
  } = useActivoFijoForm({
    modo: 'edit',
    activoFijoInicial: activoFijoToEdit,
  });

  const bindings = { valores, setters, opciones, upper };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const activoFijoEditado: ActivosFijos = construirActivoFijo();

      console.log('dataActivoFijo_Enviada: ', activoFijoEditado)
      const resultAction = await dispatch(editActivoFijo(activoFijoEditado)).unwrap();

      console.log('Respuesta del servidor:', resultAction);

      if (resultAction.success) {
        const activosFijosActualizados = await dispatch(getActivosFijos()).unwrap();

        if (activosFijosActualizados.success) {
          dispatch(setListActivosFijos(activosFijosActualizados.activosFijos || [])); // Actualiza la lista de activos fijos en el estado

          limpiarFormulario();

          console.log('Activo fijo editado y lista recargada:', activosFijosActualizados.activosFijos);
        }

        Swal.fire({
          icon: 'success',
          title: 'Activo Fijo Editado',
          text: 'El activo fijo ha sido editado exitosamente.',
          confirmButtonText: 'OK',
        });

        onEdit()
        onClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: resultAction.message || 'Hubo un problema al editar el activo fijo.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error al editar el activo fijo:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al editar el activo fijo. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modalComponent_AlmacenAF"
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
    >
      <div className="modalActivosFijos">
        <h2>Editar ActivoFijo</h2>
        <h3 className='titleCódigoÚnicoAF'>Código Único Consecutivo: <br /> <p className='textCódigoUnico'> {codigoUnico}</p></h3>

        <div className='divInputs_AddEdit_ActivoFijo'>
          <form onSubmit={handleSubmit} className="form_AddEdit_ActivoFijo">

            <div className='dataInputs_ActivoFijo'>

              <ActivoFijoFormFields
                bindings={bindings}
                costoStep
              />

              <ActivoFijoAsignacionFields
                bindings={bindings}
                disabled
              />

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
  )

}

export default EditActivoFijo;