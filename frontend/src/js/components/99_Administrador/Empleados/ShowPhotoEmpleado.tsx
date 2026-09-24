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

  // Definir una imagen de respaldo por seguridad en el frontend también
  // En dev Vite sirve frontend/public en la raíz; en prod Laravel sirve public/build
  const defaultImage = import.meta.env.DEV
    ? '/img/profile_users/perfilAdmin.png'
    : '/build/img/profile_users/perfilAdmin.png';

  // Determinar la URL de la imagen
  const imageUrl = empleadoToShow?.foto_empleado && typeof empleadoToShow.foto_empleado === 'string'
    ? empleadoToShow.foto_empleado
    : defaultImage;

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
            src={imageUrl}
            alt={'Foto de perfil del empleado'}
            onError={(e) => {
              // Fallback adicional: si la URL de la BD falla, carga la default;
              // evita reintentar la misma URL para no caer en un bucle infinito
              const current = e.currentTarget.src;
              if (!current.endsWith(defaultImage)) {
                e.currentTarget.src = defaultImage;
              }
            }}
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
