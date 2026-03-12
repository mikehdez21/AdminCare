import React from 'react';
import Modal from 'react-modal';

import { Empleados } from '@/@types/mainTypes';
import ModalButtons from '@/components/00_Utils/ModalButtons';


interface showPhotoEmpleadoProps {
  isOpen: boolean;
  onClose: () => void;
  empleadoToShow: Empleados | null;
}

Modal.setAppElement('#root');

const ShowPhotoEmpleado: React.FC<showPhotoEmpleadoProps> = ({ isOpen, onClose, empleadoToShow }) => {
  
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modalFotoEmpleado"
      contentLabel="Foto del Empleado"
    >

      <div className="mainDiv_FotoEmpleado">

        <h3>Empleado <br /> {empleadoToShow?.nombre_empleado} {empleadoToShow?.apellido_paterno} {empleadoToShow?.apellido_materno}</h3>

        <div className="divImage">
          <img
            src={
              typeof empleadoToShow?.foto_empleado === 'string'
                ? empleadoToShow.foto_empleado
                : undefined
            }
          />
        </div>

        <ModalButtons 
          buttons={[
            {
              text: 'Cancelar',
              type: 'button',
              className: 'button_close',
              onClick: onClose
            }
          ]}
        />
      </div>

    </Modal>
  );
};

export default ShowPhotoEmpleado;
 