import React from 'react';
import Modal from 'react-modal';

import { Empleados } from '@/@types/mainTypes';


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
      overlayClassName="modal_Overlay_photoEmpleado"
      className="modal_photoEmpleado"
      contentLabel="Foto del Empleado"
    >
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

      <div className='buttons'>
        <button onClick={onClose} className="button_close">
        Cerrar
        </button>

      </div>

    </Modal>
  );
};

export default ShowPhotoEmpleado;
 