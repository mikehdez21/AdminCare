import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Types & Store
import type { HelpdeskEtiqueta } from '@/@types/HelpdeskTypes/ticketTypes';
import { AppDispatch, RootState } from '@/store/store';
import { getConfigEtiquetas } from '@/store/helpdesk/Configuracion/configuracionActions';
import { useCatalogData } from '@/hooks/useCatalogData';

// Componentes
import ConfigTablaControl, { type Columna } from '../ConfigTablaControl';
import AddEtiqueta from './AddEtiqueta';
import EditEtiqueta from './EditEtiqueta';
import DeleteEtiqueta from './DeleteEtiqueta';

// Styles
import '@styles/04_Helpdesk/Configuracion/Etiquetas/etiquetasControlHelpdesk.css';

const COLUMNAS: Columna<HelpdeskEtiqueta>[] = [
  { encabezado: 'ID', ancho: '45px', render: (e) => e.id_etiqueta },
  { encabezado: 'Nombre', ancho: '200px', render: (e) => e.nombre_etiqueta },
  {
    encabezado: 'Color',
    ancho: '140px',
    render: (e) => (
      <>
        <span className='etiquetaMuestra' style={{ backgroundColor: e.color ?? '#6C757D' }} />
        <code>{e.color ?? '#6C757D'}</code>
      </>
    ),
  },
];

const EtiquetasControlHelpdesk: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const etiquetas = useSelector((s: RootState) => s.helpdeskConfiguracion.etiquetas);
  const error = useSelector((s: RootState) => s.helpdeskConfiguracion.error);

  useCatalogData(etiquetas, () => dispatch(getConfigEtiquetas()));

  const [isOpenAdd, setOpenAdd] = useState(false);
  const [isOpenEdit, setOpenEdit] = useState(false);
  const [isOpenDelete, setOpenDelete] = useState(false);
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState<HelpdeskEtiqueta | null>(null);

  const recargar = () => dispatch(getConfigEtiquetas());

  const abrir = (set: (v: boolean) => void) => (e: HelpdeskEtiqueta) => {
    setEtiquetaSeleccionada(e);
    set(true);
  };

  return (
    <>
      <ConfigTablaControl
        className='mainDiv_EtiquetasControlHelpdesk'
        entidad='etiquetas'
        singular='etiqueta'
        vacias='registradas'
        textoBoton='Nueva etiqueta'
        placeholder='Buscar por nombre o ID'
        error={error}
        filas={etiquetas}
        clave={(e) => e.id_etiqueta as number}
        coincide={(e, texto) =>
          e.nombre_etiqueta.toLowerCase().includes(texto)
          || e.id_etiqueta?.toString().includes(texto) === true
        }
        columnas={COLUMNAS}
        onNuevo={() => setOpenAdd(true)}
        onEditar={abrir(setOpenEdit)}
        onEliminar={abrir(setOpenDelete)}
      />

      {isOpenAdd && <AddEtiqueta isOpen={isOpenAdd} onClose={() => setOpenAdd(false)} onCreado={recargar} />}

      {isOpenEdit && etiquetaSeleccionada && (
        <EditEtiqueta isOpen={isOpenEdit} onClose={() => setOpenEdit(false)} etiqueta={etiquetaSeleccionada} onEditado={recargar} />
      )}

      {isOpenDelete && etiquetaSeleccionada && (
        <DeleteEtiqueta isOpen={isOpenDelete} onClose={() => setOpenDelete(false)} etiqueta={etiquetaSeleccionada} onEliminado={recargar} />
      )}
    </>
  );
};

export default EtiquetasControlHelpdesk;