import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

// Types & Store
import type { HelpdeskProveedorError } from '@/@types/HelpdeskTypes/ticketTypes';
import { AppDispatch, RootState } from '@/store/store';
import {
  actualizarProveedorError,
  eliminarProveedorError,
  getConfigProveedoresError,
} from '@/store/helpdesk/Configuracion/configuracionActions';
import { getDepartamentosActivos } from '@/store/administrador/Departamentos/departamentosActions';
import { useCatalogData } from '@/hooks/useCatalogData';

// Componentes
import ConfigTablaControl, { type Columna } from '../ConfigTablaControl';
import ModalProveedorError from '../ErroresProveedor/ModalProveedorError';
import ModalEliminarCatalogoError from '../ErroresProveedor/ModalEliminarCatalogoError';

// Styles
import '@styles/04_Helpdesk/Configuracion/ErroresProveedor/erroresProveedorControl.css';

/**
 * Catálogo de proveedores de error.
 *
 * La columna del switch es la que importa: encendido, capturar el error de ese
 * proveedor pide sistema, no. de ticket externo, módulo y personal SAC. Se cambia
 * desde la propia tabla, sin abrir el modal.
 *
 * HSS vive en esta lista como uno más: es quien suele resolver, y
 * `ErroresProveedor.id_soluciona_error` apunta aquí.
 */
const ProveedoresErrorControl: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const proveedores = useSelector((s: RootState) => s.helpdeskConfiguracion.proveedoresError);
  const error = useSelector((s: RootState) => s.helpdeskConfiguracion.error);
  const departamentos = useSelector((s: RootState) => s.departamentos.departamentos);

  useCatalogData(proveedores, () => dispatch(getConfigProveedoresError()));
  // El desplegable de departamento del modal los necesita.
  useCatalogData(departamentos, () => dispatch(getDepartamentosActivos()));

  const [editando, setEditando] = useState<HelpdeskProveedorError | null>(null);
  const [isOpenModal, setOpenModal] = useState(false);
  const [eliminando, setEliminando] = useState<HelpdeskProveedorError | null>(null);
  const [cambiando, setCambiando] = useState<number | null>(null);

  const recargar = () => dispatch(getConfigProveedoresError());

  /** Cambia el switch desde la tabla, sin abrir el modal. */
  const alternarRequiereSistema = async (proveedor: HelpdeskProveedorError) => {
    setCambiando(proveedor.id_proveedor_error ?? null);

    const resultado = await dispatch(actualizarProveedorError({
      id: proveedor.id_proveedor_error as number,
      cuerpo: {
        nombre_proveedor_error: proveedor.nombre_proveedor_error,
        id_departamento: proveedor.id_departamento,
        requiere_sistema: !proveedor.requiere_sistema,
        estatus_activo: proveedor.estatus_activo,
      },
    })).unwrap();

    setCambiando(null);

    if (!resultado.success) {
      Swal.fire({ icon: 'error', title: 'No se pudo cambiar el switch', text: resultado.message });

      return;
    }

    recargar();
  };

  // Las columnas viven aquí porque el switch necesita el `dispatch`.
  const columnas = useMemo<Columna<HelpdeskProveedorError>[]>(() => [
    { encabezado: 'ID', ancho: '45px', render: (p) => p.id_proveedor_error },
    { encabezado: 'Proveedor', ancho: '160px', render: (p) => p.nombre_proveedor_error },
    { encabezado: 'Departamento', ancho: '160px', render: (p) => p.departamento?.nombre_departamento ?? '—' },
    {
      encabezado: 'Requiere sistema',
      ancho: '150px',
      render: (p) => (
        <button
          type='button'
          className={`switchCatalogo ${p.requiere_sistema ? 'switchCatalogo_Encendido' : ''}`}
          title='Encendido: capturar el error de este proveedor pide sistema, no. de ticket, módulo y personal SAC.'
          onClick={() => alternarRequiereSistema(p)}
          disabled={cambiando === p.id_proveedor_error}
        >
          <span />
        </button>
      ),
    },
    { encabezado: 'Activo', ancho: '80px', render: (p) => (p.estatus_activo ? 'Sí' : 'No') },
  ], [cambiando, proveedores]);

  return (
    <>
      <ConfigTablaControl
        className='mainDiv_ErroresProveedorControl'
        entidad='proveedores'
        singular='proveedor'
        vacias='registrados'
        textoBoton='Nuevo proveedor'
        placeholder='Buscar por nombre o ID'
        nota='El switch marca los proveedores cuyo error pide sistema, no. de ticket externo, módulo y personal SAC.'
        error={error}
        filas={proveedores}
        clave={(p) => p.id_proveedor_error as number}
        coincide={(p, texto) =>
          p.nombre_proveedor_error.toLowerCase().includes(texto)
          || p.id_proveedor_error?.toString().includes(texto) === true
        }
        columnas={columnas}
        onNuevo={() => {
          setEditando(null);
          setOpenModal(true);
        }}
        onEditar={(p) => {
          setEditando(p);
          setOpenModal(true);
        }}
        onEliminar={(p) => setEliminando(p)}
      />

      {isOpenModal && (
        <ModalProveedorError
          isOpen={isOpenModal}
          onClose={() => setOpenModal(false)}
          proveedor={editando}
          onGuardado={recargar}
        />
      )}

      {eliminando && (
        <ModalEliminarCatalogoError
          isOpen
          onClose={() => setEliminando(null)}
          singular='proveedor'
          nombreElemento={eliminando.nombre_proveedor_error}
          aviso='Si tiene errores o sistemas asociados, el sistema lo impedirá. Desactívelo para retirarlo de los formularios sin perder el histórico.'
          onEliminar={() => dispatch(eliminarProveedorError(eliminando.id_proveedor_error as number)).unwrap()}
          onEliminado={recargar}
        />
      )}
    </>
  );
};

export default ProveedoresErrorControl;
