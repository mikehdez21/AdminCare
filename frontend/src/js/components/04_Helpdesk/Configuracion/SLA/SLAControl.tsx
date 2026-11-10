import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Types & Store
import type { SLANivel } from '@/@types/HelpdeskTypes/ticketTypes';
import { AppDispatch, RootState } from '@/store/store';
import { getConfigPrioridades, getConfigSlas } from '@/store/helpdesk/Configuracion/configuracionActions';
import { useCatalogData } from '@/hooks/useCatalogData';

// Componentes
import ConfigTablaControl, { type Columna } from '../ConfigTablaControl';
import AddSLA from './AddSLA';
import EditSLA from './EditSLA';
import DeleteSLA from './DeleteSLA';

// Styles
import '@styles/04_Helpdesk/Configuracion/SLA/slaControl.css';

const COLUMNAS: Columna<SLANivel>[] = [
  { encabezado: 'Prioridad', ancho: '200px', render: (s) => s.prioridad?.nombre_prioridad ?? s.id_prioridad_ticket },
  { encabezado: 'Respuesta (h)', ancho: '130px', render: (s) => s.tiempo_respuesta_horas },
  { encabezado: 'Resolución (h)', ancho: '140px', render: (s) => s.tiempo_resolucion_horas },
  { encabezado: 'Descripción', ancho: '400px', render: (s) => s.descripcion_sla ?? '-' },
  {
    encabezado: 'Estatus',
    ancho: '110px',
    render: (s) => (
      <span className={s.estatus_activo ? 'status-activo' : 'status-inactivo'}>
        {s.estatus_activo ? 'Activo' : 'Inactivo'}
      </span>
    ),
  },
];

const SLAControl: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const slas = useSelector((s: RootState) => s.helpdeskConfiguracion.slas);
  const prioridades = useSelector((s: RootState) => s.helpdeskConfiguracion.prioridades);
  const error = useSelector((s: RootState) => s.helpdeskConfiguracion.error);

  useCatalogData(slas, () => dispatch(getConfigSlas()));
  useCatalogData(prioridades, () => dispatch(getConfigPrioridades()));

  const [isOpenAdd, setOpenAdd] = useState(false);
  const [isOpenEdit, setOpenEdit] = useState(false);
  const [isOpenDelete, setOpenDelete] = useState(false);
  const [slaSeleccionado, setSlaSeleccionado] = useState<SLANivel | null>(null);

  const recargar = () => dispatch(getConfigSlas());

  const abrir = (set: (v: boolean) => void) => (s: SLANivel) => {
    setSlaSeleccionado(s);
    set(true);
  };

  return (
    <>
      <ConfigTablaControl
        className='mainDiv_SLAControl'
        entidad='niveles de SLA'
        singular='nivel de SLA'
        vacias='registrados'
        textoBoton='Nuevo SLA'
        placeholder='Buscar por prioridad o ID'
        error={error}
        filas={slas}
        clave={(s) => s.id_sla_nivel as number}
        coincide={(s, texto) =>
          (s.prioridad?.nombre_prioridad ?? '').toLowerCase().includes(texto)
          || s.id_sla_nivel?.toString().includes(texto) === true
        }
        columnas={COLUMNAS}
        onNuevo={() => setOpenAdd(true)}
        onEditar={abrir(setOpenEdit)}
        onEliminar={abrir(setOpenDelete)}
      />

      {isOpenAdd && <AddSLA isOpen={isOpenAdd} onClose={() => setOpenAdd(false)} prioridades={prioridades} onCreado={recargar} />}

      {isOpenEdit && slaSeleccionado && (
        <EditSLA isOpen={isOpenEdit} onClose={() => setOpenEdit(false)} sla={slaSeleccionado} prioridades={prioridades} onEditado={recargar} />
      )}

      {isOpenDelete && slaSeleccionado && (
        <DeleteSLA isOpen={isOpenDelete} onClose={() => setOpenDelete(false)} sla={slaSeleccionado} onEliminado={recargar} />
      )}
    </>
  );
};

export default SLAControl;