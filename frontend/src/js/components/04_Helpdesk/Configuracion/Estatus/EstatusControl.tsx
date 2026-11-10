import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Types & Store
import type { EstatusTicket } from '@/@types/HelpdeskTypes/ticketTypes';
import { AppDispatch, RootState } from '@/store/store';
import { getConfigEstatus } from '@/store/helpdesk/Configuracion/configuracionActions';
import { useCatalogData } from '@/hooks/useCatalogData';

// Componentes
import ConfigTablaControl, { type Columna } from '../ConfigTablaControl';
import AddEstatus from './AddEstatus';
import EditEstatus from './EditEstatus';
import DeleteEstatus from './DeleteEstatus';

// Styles
import '@styles/04_Helpdesk/Configuracion/Estatus/estatusControl.css';

const COLUMNAS: Columna<EstatusTicket>[] = [
  { encabezado: 'ID', ancho: '45px', render: (e) => e.id_estatus_ticket },
  { encabezado: 'Nombre', ancho: '200px', render: (e) => e.nombre_estatus },
  { encabezado: 'Orden', ancho: '90px', render: (e) => e.orden_flujo },
  {
    encabezado: 'Color',
    ancho: '140px',
    render: (e) => (
      <>
        <span className='estatusMuestra' style={{ backgroundColor: e.color ?? '#6C757D' }} />
        <code>{e.color ?? '#6C757D'}</code>
      </>
    ),
  },
  {
    encabezado: 'Estado final',
    ancho: '120px',
    render: (e) => (
      <span className={e.es_estado_final ? 'esFinalSi' : 'esFinalNo'}>{e.es_estado_final ? 'Sí' : 'No'}</span>
    ),
  },
  { encabezado: 'Descripción', ancho: '320px', render: (e) => e.descripcion_estatus ?? '-' },
];

const EstatusControl: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const estatus = useSelector((s: RootState) => s.helpdeskConfiguracion.estatus);
  const error = useSelector((s: RootState) => s.helpdeskConfiguracion.error);

  useCatalogData(estatus, () => dispatch(getConfigEstatus()));

  const [isOpenAdd, setOpenAdd] = useState(false);
  const [isOpenEdit, setOpenEdit] = useState(false);
  const [isOpenDelete, setOpenDelete] = useState(false);
  const [estatusSeleccionado, setEstatusSeleccionado] = useState<EstatusTicket | null>(null);

  const recargar = () => dispatch(getConfigEstatus());

  const abrir = (set: (v: boolean) => void) => (e: EstatusTicket) => {
    setEstatusSeleccionado(e);
    set(true);
  };

  return (
    <>
      <ConfigTablaControl
        className='mainDiv_EstatusControl'
        entidad='estatus'
        singular='estatus'
        vacias='registrados'
        textoBoton='Nuevo estatus'
        placeholder='Buscar por nombre o ID'
        error={error}
        filas={estatus}
        clave={(e) => e.id_estatus_ticket as number}
        coincide={(e, texto) =>
          e.nombre_estatus.toLowerCase().includes(texto)
          || e.id_estatus_ticket?.toString().includes(texto) === true
          || (e.descripcion_estatus ?? '').toLowerCase().includes(texto)
        }
        columnas={COLUMNAS}
        onNuevo={() => setOpenAdd(true)}
        onEditar={abrir(setOpenEdit)}
        onEliminar={abrir(setOpenDelete)}
      />

      {isOpenAdd && <AddEstatus isOpen={isOpenAdd} onClose={() => setOpenAdd(false)} onCreado={recargar} />}

      {isOpenEdit && estatusSeleccionado && (
        <EditEstatus isOpen={isOpenEdit} onClose={() => setOpenEdit(false)} estatus={estatusSeleccionado} onEditado={recargar} />
      )}

      {isOpenDelete && estatusSeleccionado && (
        <DeleteEstatus isOpen={isOpenDelete} onClose={() => setOpenDelete(false)} estatus={estatusSeleccionado} onEliminado={recargar} />
      )}
    </>
  );
};

export default EstatusControl;