import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { getActivosFijosSinFactura } from '@/store/almacengeneral/Activos/activosActions';
import { ActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { FacturasAF } from '@/@types/AlmacenGeneralTypes/facturasTypes';
import { formatMexicanCurrency } from '@/utils/numbersFormat';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import Swal from 'sweetalert2';
import { useBusquedaActivos } from '@/hooks/useBusquedaActivos';



import '@styles/02_Almacenes/AlmacenGeneral/ActivosFijos/modalAsociarActivosFactura.css';


interface AsociarActivosFacturaProps {
    isOpen: boolean;
    onClose: () => void;
    factura?: FacturasAF;
    onActivosAsociados?: (activosAsociados: ActivosFijos[]) => void;
    activosConfirmados?: ActivosFijos[];
}

Modal.setAppElement('#root');


const AsociarActivosFactura: React.FC<AsociarActivosFacturaProps> = ({ isOpen, onClose, factura, onActivosAsociados, activosConfirmados = [] }) => {

  const dispatch = useDispatch<AppDispatch>();
  const [activosAsociados, setActivosAsociados] = useState<ActivosFijos[]>([]);
  const [activosFijosDisponibles, setActivosFijosDisponibles] = useState<ActivosFijos[]>([]);





  useEffect(() => {


    if (isOpen) {
      const cargarAFSinFactura = async () => {
        try {
          const resultAction = await dispatch(getActivosFijosSinFactura()).unwrap();

          if (resultAction.success && resultAction.activosFijos) {
            const disponibles = resultAction.activosFijos.filter(
              activoStore => !activosConfirmados.some(activoYa => activoYa.id_activo_fijo === activoStore.id_activo_fijo)
            );
            setActivosFijosDisponibles(disponibles);
          } else {
            setActivosFijosDisponibles([]);
          }
        } catch (error) {
          console.error('Error al cargar los activos fijos sin factura:', error);
          setActivosFijosDisponibles([]);
        }
      };
      cargarAFSinFactura();
    } else {
      setActivosFijosDisponibles([]);
      setActivosAsociados([]);
      setBusquedaSeleccionados('');
    }

  }, [isOpen, dispatch]);

  // Búsqueda de activos disponibles (compartida con AddActivosFactura vía useBusquedaActivos)
  const {
    busqueda: busquedaSeleccionados,
    setBusqueda: setBusquedaSeleccionados,
    activosFiltrados: activosFiltradosDisponibles,
  } = useBusquedaActivos(activosFijosDisponibles);


  const handleClose = () => {
    onClose();
  }

  const handleAsociarActivo = (activo: ActivosFijos) => {
    if (!activosAsociados.some(a => a.id_activo_fijo === activo.id_activo_fijo)) { // Evitar duplicados
      setActivosAsociados(prev => [...prev, activo]);
      setActivosFijosDisponibles(prev => prev.filter(a => a.id_activo_fijo !== activo.id_activo_fijo)); // Quitar de disponibles
    }
  };

  const handleDesasociarActivo = (activo: ActivosFijos) => {
    setActivosAsociados(prev => prev.filter(a => a.id_activo_fijo !== activo.id_activo_fijo)); // Quitar de seleccionados
    setActivosFijosDisponibles(prev => [...prev, activo]); // Agregar de nuevo a disponibles

  };

  const handleConfirmar = () => {
    if (activosAsociados.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin activos asociados',
        text: 'Debe agregar al menos un activo para continuar.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (onActivosAsociados) {
      onActivosAsociados(activosAsociados);
    }


    onClose(); // Cerrar el modal después de confirmar
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Asociar Activos a Factura"
      className="modalComponent_AsociarActivosFactura"
    >

      <div className="modalAsociarActivosFactura">
        <h1>Asociar Activos a Factura - {factura?.num_factura ?? 'FACTURA NUEVA'}</h1>

        <div className="modalContent">

          <section className="sectionListActivosSinFactura">
            <h3>Activos Disponibles</h3>

            <div className="divSearch">
              <input
                type="text"
                placeholder="Buscar activos de la factura..."
                value={busquedaSeleccionados}
                onChange={(e) => setBusquedaSeleccionados(e.target.value)}
                className="inputSearch"
              />
            </div>

            <ul>
              {activosFiltradosDisponibles.map((activo) => (
                <li key={activo.id_activo_fijo}>

                  <div className="itemInfo">

                    <div className="itemHeader">
                      <span className="itemName">{activo.nombre_af}</span>
                    </div>

                    <div className="itemDetails">
                      <label>
                                                NoSerie
                        <span className="itemCode">
                          {activo.numero_serie_af}
                        </span>
                      </label>

                      <label>
                                                Marca
                        <span className="itemCode"> {activo.marca_af}</span>
                      </label>

                      <label>
                                                Modelo
                        <span className="itemCode"> {activo.modelo_af}</span>
                      </label>

                      <label>
                                                Código Etiqueta
                        <span className="itemCode"> {activo.codigo_etiqueta}</span>
                      </label>

                      <label>
                                                Costo
                        <span className="itemCode"> {formatMexicanCurrency(activo.costo_unitario_af)}</span>
                      </label>

                      <label>
                                                AF Propio
                        <span className="itemCode"> {activo.af_propio ? 'Sí' : 'No'}</span>
                      </label>
                    </div>


                  </div>

                  <span className="itemActions">
                    <button onClick={() => handleAsociarActivo(activo)}>+</button>
                  </span>



                </li>
              ))}
            </ul>

          </section>

          <section className="sectionListActivosAsociados">
            <h3>Activos Asociados</h3>

            <ul>
              {activosAsociados.map((activo) => (
                <li key={activo.id_activo_fijo}>

                  <span className="itemActions Asociado">
                    <button onClick={() => handleDesasociarActivo(activo)}>+</button>
                  </span>

                  <div className="itemInfo Asociado">

                    <div className="itemHeader">
                      <span className="itemName">{activo.nombre_af}</span>
                    </div>

                    <div className="itemDetails">
                      <label>
                                                NoSerie
                        <span className="itemCode">
                          {activo.numero_serie_af}
                        </span>
                      </label>

                      <label>
                                                Marca
                        <span className="itemCode"> {activo.marca_af}</span>
                      </label>

                      <label>
                                                Modelo
                        <span className="itemCode"> {activo.modelo_af}</span>
                      </label>

                      <label>
                                                Código Etiqueta
                        <span className="itemCode"> {activo.codigo_etiqueta}</span>
                      </label>

                      <label>
                                                Costo
                        <span className="itemCode"> {formatMexicanCurrency(activo.costo_unitario_af)}</span>
                      </label>

                      <label>
                                                AF Propio
                        <span className="itemCode"> {activo.af_propio ? 'Sí' : 'No'}</span>
                      </label>
                    </div>


                  </div>





                </li>
              ))}
            </ul>

            {/* Footer con botones */}
            <ModalButtons
              buttons={[
                {
                  text: `Confirmar (${activosAsociados.length} activos)`,
                  type: 'button',
                  className: 'button_addedit',
                  onClick: handleConfirmar,
                },
                {
                  text: 'Cancelar',
                  type: 'button',
                  className: 'button_close',
                  onClick: handleClose
                }
              ]}
            />



          </section>

        </div>

      </div>
    </Modal>
  )

}

export default AsociarActivosFactura;