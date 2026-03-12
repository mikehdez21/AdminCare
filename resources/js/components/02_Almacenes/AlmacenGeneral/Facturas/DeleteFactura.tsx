import React from 'react';
import Modal from 'react-modal';
import { FacturasAF } from '@/@types/AlmacenGeneralTypes/facturasTypes'; 

import '@styles/02_Almacenes/AlmacenGeneral/Facturas/addFactura.css';


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
      className="modalEntityAlmacen"
      overlayClassName="modal_OverlayEntityAlmacen"
    >
      <div className="DeleteFactura">
        <h2>Eliminar Factura</h2>
        factura a eliminar: {facturaToDelete?.id_factura}

        
      </div>
    </Modal>
  );
};

export default DeleteFactura;
