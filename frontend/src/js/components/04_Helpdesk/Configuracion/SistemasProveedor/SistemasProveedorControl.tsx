import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Types & Store
import type { HelpdeskSistemaProveedor } from '@/@types/HelpdeskTypes/ticketTypes';
import { AppDispatch, RootState } from '@/store/store';
import {
  eliminarSistemaProveedor,
  getConfigProveedoresError,
  getConfigSistemasProveedor,
} from '@/store/helpdesk/Configuracion/configuracionActions';
import { useCatalogData } from '@/hooks/useCatalogData';

// Componentes
import ConfigTablaControl, { type Columna } from '../ConfigTablaControl';
import ModalSistemaProveedor from '../ErroresProveedor/ModalSistemaProveedor';
import ModalEliminarCatalogoError from '../ErroresProveedor/ModalEliminarCatalogoError';

// Styles
import '@styles/04_Helpdesk/Configuracion/ErroresProveedor/erroresProveedorControl.css';

const COLUMNAS: Columna<HelpdeskSistemaProveedor>[] = [
  { encabezado: 'ID', ancho: '45px', render: (s) => s.id_sistema_proveedor },
  { encabezado: 'Sistema', ancho: '180px', render: (s) => s.nombre_sistema_proveedor },
  { encabezado: 'Proveedor', ancho: '160px', render: (s) => s.proveedor_error?.nombre_proveedor_error ?? '—' },
  { encabezado: 'Activo', ancho: '80px', render: (s) => (s.estatus_activo ? 'Sí' : 'No') },
];

/**
 * Sistemas de un proveedor. Hoy solo Reliv tiene (SIHO, ECE, Surfing): el
 * desplegable de "Sistema" del detalle se llena con los del proveedor elegido.
 */
const SistemasProveedorControl: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const sistemas = useSelector((s: RootState) => s.helpdeskConfiguracion.sistemasProveedor);
  const proveedores = useSelector((s: RootState) => s.helpdeskConfiguracion.proveedoresError);
  const error = useSelector((s: RootState) => s.helpdeskConfiguracion.error);

  useCatalogData(sistemas, () => dispatch(getConfigSistemasProveedor()));
  // El desplegable de proveedor del modal los necesita.
  useCatalogData(proveedores, () => dispatch(getConfigProveedoresError()));

  const [editando, setEditando] = useState<HelpdeskSistemaProveedor | null>(null);
  const [isOpenModal, setOpenModal] = useState(false);
  const [eliminando, setEliminando] = useState<HelpdeskSistemaProveedor | null>(null);

  const recargar = useCallback(() => {
    dispatch(getConfigSistemasProveedor());
    dispatch(getConfigProveedoresError());
  }, [dispatch]);

  return (
    <>
      <ConfigTablaControl
        className='mainDiv_ErroresProveedorControl'
        entidad='sistemas'
        singular='sistema'
        vacias='registrados'
        textoBoton='Nuevo sistema'
        placeholder='Buscar por nombre o ID'
        nota='Solo aplican a los proveedores que piden sistema (el switch de Proveedores).'
        error={error}
        filas={sistemas}
        clave={(s) => s.id_sistema_proveedor as number}
        coincide={(s, texto) =>
          s.nombre_sistema_proveedor.toLowerCase().includes(texto)
          || s.id_sistema_proveedor?.toString().includes(texto) === true
        }
        columnas={COLUMNAS}
        onNuevo={() => {
          setEditando(null);
          setOpenModal(true);
        }}
        onEditar={(s) => {
          setEditando(s);
          setOpenModal(true);
        }}
        onEliminar={(s) => setEliminando(s)}
      />

      {isOpenModal && (
        <ModalSistemaProveedor
          isOpen={isOpenModal}
          onClose={() => setOpenModal(false)}
          sistema={editando}
          proveedores={proveedores}
          onGuardado={recargar}
        />
      )}

      {eliminando && (
        <ModalEliminarCatalogoError
          isOpen
          onClose={() => setEliminando(null)}
          singular='sistema'
          nombreElemento={eliminando.nombre_sistema_proveedor}
          aviso='Si tiene errores asociados, el sistema lo impedirá. Desactívelo para retirarlo de los formularios sin perder el histórico.'
          onEliminar={() => dispatch(eliminarSistemaProveedor(eliminando.id_sistema_proveedor as number)).unwrap()}
          onEliminado={recargar}
        />
      )}
    </>
  );
};

export default SistemasProveedorControl;
