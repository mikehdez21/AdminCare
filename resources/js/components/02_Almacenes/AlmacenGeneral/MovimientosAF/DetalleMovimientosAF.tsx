import React from 'react';
import Modal from 'react-modal';
import { VwMovimientosAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import ModalButtons from '@/components/00_Utils/ModalButtons';

import '@styles/02_Almacenes/AlmacenGeneral/MovimientosAF/modalMovimientosAF.css';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';



interface DetalleActivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  activoDetalle: VwMovimientosAF;
}

const ModalAFDetails: React.FC<DetalleActivoModalProps> = ({ isOpen, onClose, activoDetalle }) => {
  if (!isOpen) return null;
  const estatusActivoFijo = useSelector((state: RootState) => state.activos.estatusActivoFijo);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Añadir Nueva Entity"
      className="modalComponent_AlmacenMovimientoAF"
    >
      <div className='modalDetalleMovimientoAF'>

        <div className='divTitle'>
          <h2>Detalle Completo - {activoDetalle.nombre_af}</h2>
        </div>

        <div className='divInfoAF'>

          <div className='detalleInfo'>

            <div className='DivDetalleSections'>

              {/* Información Básica */}
              <section className='SectionsAF'>
                <h3>Información Básica</h3>
                <div className='rowsInfo'>
                  <li><strong>Código:</strong> {activoDetalle.codigo_unico}</li>
                  <li><strong>Descripción:</strong> {activoDetalle.descripcion_af}</li>
                  <li><strong>Modelo:</strong> {activoDetalle.modelo_af}</li>
                  <li><strong>Marca:</strong> {activoDetalle.marca_af}</li>
                  <li><strong>No. Serie:</strong> {activoDetalle.numero_serie_af}</li>
                  <li><strong>Valor Compra:</strong> ${activoDetalle.valor_compra_af.toLocaleString()}</li>
                  <li><strong>Fecha Compra: </strong>{activoDetalle.fecha_compra_af}</li>
                  <li id='li_estatusAF'><strong>Estado:</strong>
                    {estatusActivoFijo.map((estatusAF) => {
                      if (activoDetalle.estado_actual !== estatusAF.descripcion_estatusaf) return null;

                      const getEstatusClass = (descripcion: string) => {
                        const estatus = descripcion.toLowerCase().trim();
                        if (estatus === 'activo') return 'estatus-activo';
                        if (estatus.includes('mantenimiento') || estatus.includes('revisión')) return 'estatus-mantenimiento-revision';
                        if (estatus.includes('baja') || estatus === 'perdido') return 'estatus-baja-perdido';
                        if (estatus === 'prestado') return 'estatus-prestado';
                        return 'estatus-default';
                      };

                      return (
                        <div key={estatusAF.id_estatusaf} className={`estatus-badge ${getEstatusClass(estatusAF.descripcion_estatusaf)}`}>
                          {estatusAF.descripcion_estatusaf}
                        </div>
                      );
                    })}
                  </li>
                </div>
              </section>

              {/* Ubicación y Responsables */}
              <section className='SectionsAF'>
                <h3>Ubicación y Responsabilidad</h3>
                <div className='rowsInfo'>
                  <li><strong>Responsable Actual:</strong> {activoDetalle.responsable_actual_completo}</li>
                  <li><strong>Ubicación Actual:</strong> {activoDetalle.ubicacion_actual}</li>
                  <li><strong>Responsable Anterior:</strong> {activoDetalle.responsable_anterior_completo}</li>
                  <li><strong>Ubicación Anterior:</strong> {activoDetalle.ubicacion_anterior}</li>
                </div>
              </section>

              {/* Último Movimiento */}
              <section className='SectionsAF'>
                <h3>Último Movimiento</h3>
                <div className='rowsInfo'>
                  <li><strong>Fecha:</strong> {formatDateHorasToFrontend(activoDetalle.fecha_ultimo_movimiento)}</li>
                  <li><strong>Motivo:</strong> {activoDetalle.ultimo_motivo_movimiento}</li>
                  <li><strong>Tipo de Movimiento:</strong> {activoDetalle.tipo_movimiento}</li>
                </div>
              </section>
            </div>

          </div>

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

export default ModalAFDetails;