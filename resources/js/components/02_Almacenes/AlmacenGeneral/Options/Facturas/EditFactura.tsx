import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { FacturasAF } from '@/@types/AlmacenGeneralTypes/FacturasType'; // Asegúrate de importar el tipo correcto

import '@styles/02_Almacenes/AlmacenGeneral/addeditdelete_almacenEntities.css'

interface EditFacturaProps {
  isOpen: boolean;
  onClose: () => void;
  facturaToEdit: FacturasAF | null; // Asegúrate de importar FacturasAF desde el tipo correcto
  
}

Modal.setAppElement('#root');

const EditFactura: React.FC<EditFacturaProps> = ({ isOpen, onClose, facturaToEdit }) => {


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Añadir Nueva Entity"
      className="modal_CRUD_EntityAlmacen"
      overlayClassName="modal_OverlayCRUD_Entity"
    >
      <div className="modal_Content_AlmacenEntities">
        <h2>Editar Factura</h2>

        
      </div>
    </Modal>
  );
};

export default EditFactura;
