import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { FacturasAF } from '@/@types/AlmacenGeneralTypes/FacturasType'; // Asegúrate de importar el tipo correcto

import '@styles/02_Almacenes/AlmacenGeneral/addeditdelete_almacenEntities.css'

interface DeleteFacturaProps {
  isOpen: boolean;
  onClose: () => void;
  facturaToDelete: FacturasAF | null; // Asegúrate de importar FacturasAF desde el tipo correcto
}

Modal.setAppElement('#root');

const DeleteFactura: React.FC<DeleteFacturaProps> = ({ isOpen, onClose, facturaToDelete}) => {


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Añadir Nueva Entity"
      className="modal_CRUD_EntityAlmacen"
      overlayClassName="modal_OverlayCRUD_Entity"
    >
      <div className="modal_Content_AlmacenEntities">
        <h2>Eliminar Factura</h2>

        
      </div>
    </Modal>
  );
};

export default DeleteFactura;
