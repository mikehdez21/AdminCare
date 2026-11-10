import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Types & Store
import type { PrioridadTicket } from '@/@types/HelpdeskTypes/ticketTypes';
import { AppDispatch, RootState } from '@/store/store';
import { getConfigPrioridades } from '@/store/helpdesk/Configuracion/configuracionActions';
import { useCatalogData } from '@/hooks/useCatalogData';

// Componentes
import ConfigTablaControl, { type Columna } from '../ConfigTablaControl';
import AddPrioridad from './AddPrioridad';
import EditPrioridad from './EditPrioridad';
import DeletePrioridad from './DeletePrioridad';

// Styles
import '@styles/04_Helpdesk/Configuracion/Prioridades/prioridadesControl.css';

const COLUMNAS: Columna<PrioridadTicket>[] = [
  { encabezado: 'ID', ancho: '45px', render: (p) => p.id_prioridad_ticket },
  { encabezado: 'Nombre', ancho: '200px', render: (p) => p.nombre_prioridad },
  { encabezado: 'Nivel', ancho: '90px', render: (p) => p.nivel_prioridad },
  {
    encabezado: 'Color',
    ancho: '140px',
    render: (p) => (
      <>
        <span className='prioridadMuestra' style={{ backgroundColor: p.color ?? '#6C757D' }} />
        <code>{p.color ?? '#6C757D'}</code>
      </>
    ),
  },
  {
    encabezado: 'Estatus',
    ancho: '110px',
    render: (p) => (
      <span className={p.estatus_activo ? 'status-activo' : 'status-inactivo'}>
        {p.estatus_activo ? 'Activa' : 'Inactiva'}
      </span>
    ),
  },
];

const PrioridadesControl: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const prioridades = useSelector((s: RootState) => s.helpdeskConfiguracion.prioridades);
  const error = useSelector((s: RootState) => s.helpdeskConfiguracion.error);

  useCatalogData(prioridades, () => dispatch(getConfigPrioridades()));

  const [isOpenAdd, setOpenAdd] = useState(false);
  const [isOpenEdit, setOpenEdit] = useState(false);
  const [isOpenDelete, setOpenDelete] = useState(false);
  const [prioridadSeleccionada, setPrioridadSeleccionada] = useState<PrioridadTicket | null>(null);

  const recargar = () => dispatch(getConfigPrioridades());

  const abrir = (set: (v: boolean) => void) => (p: PrioridadTicket) => {
    setPrioridadSeleccionada(p);
    set(true);
  };

  return (
    <>
      <ConfigTablaControl
        className='mainDiv_PrioridadesControl'
        entidad='prioridades'
        singular='prioridad'
        vacias='registradas'
        textoBoton='Nueva prioridad'
        placeholder='Buscar por nombre o ID'
        error={error}
        filas={prioridades}
        clave={(p) => p.id_prioridad_ticket as number}
        coincide={(p, texto) =>
          p.nombre_prioridad.toLowerCase().includes(texto)
          || p.id_prioridad_ticket?.toString().includes(texto) === true
        }
        columnas={COLUMNAS}
        onNuevo={() => setOpenAdd(true)}
        onEditar={abrir(setOpenEdit)}
        onEliminar={abrir(setOpenDelete)}
      />

      {isOpenAdd && <AddPrioridad isOpen={isOpenAdd} onClose={() => setOpenAdd(false)} onCreado={recargar} />}

      {isOpenEdit && prioridadSeleccionada && (
        <EditPrioridad isOpen={isOpenEdit} onClose={() => setOpenEdit(false)} prioridad={prioridadSeleccionada} onEditado={recargar} />
      )}

      {isOpenDelete && prioridadSeleccionada && (
        <DeletePrioridad isOpen={isOpenDelete} onClose={() => setOpenDelete(false)} prioridad={prioridadSeleccionada} onEliminado={recargar} />
      )}
    </>
  );
};

export default PrioridadesControl;