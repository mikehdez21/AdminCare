import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Types & Store
import type { HelpdeskModuloSIHO } from '@/@types/HelpdeskTypes/ticketTypes';
import { AppDispatch, RootState } from '@/store/store';
import { eliminarModuloSIHO, getConfigModulosSIHO } from '@/store/helpdesk/Configuracion/configuracionActions';
import { useCatalogData } from '@/hooks/useCatalogData';

// Componentes
import ConfigTablaControl, { type Columna } from '../ConfigTablaControl';
import ModalModuloSIHO from '../ErroresProveedor/ModalModuloSIHO';
import ModalEliminarCatalogoError from '../ErroresProveedor/ModalEliminarCatalogoError';

// Styles
import '@styles/04_Helpdesk/Configuracion/ErroresProveedor/erroresProveedorControl.css';

const COLUMNAS: Columna<HelpdeskModuloSIHO>[] = [
  { encabezado: 'ID', ancho: '45px', render: (m) => m.id_modulo_siho },
  { encabezado: 'Módulo', ancho: '240px', render: (m) => m.nombre_modulo },
  { encabezado: 'Activo', ancho: '80px', render: (m) => (m.estatus_activo ? 'Sí' : 'No') },
];

/**
 * Módulos de Sistemas, para el desplegable de "Módulo" de un error de proveedor.
 *
 * Es un catálogo plano: los módulos son del sistema, no de cada proveedor. Nace
 * vacío, así que la lista hay que capturarla.
 */
const ModulosSIHOControl: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const modulos = useSelector((s: RootState) => s.helpdeskConfiguracion.modulosSIHO);
  const error = useSelector((s: RootState) => s.helpdeskConfiguracion.error);

  useCatalogData(modulos, () => dispatch(getConfigModulosSIHO()));

  const [editando, setEditando] = useState<HelpdeskModuloSIHO | null>(null);
  const [isOpenModal, setOpenModal] = useState(false);
  const [eliminando, setEliminando] = useState<HelpdeskModuloSIHO | null>(null);

  const recargar = () => dispatch(getConfigModulosSIHO());

  return (
    <>
      <ConfigTablaControl
        className='mainDiv_ErroresProveedorControl'
        entidad='módulos'
        singular='módulo'
        vacias='registrados'
        textoBoton='Nuevo módulo'
        placeholder='Buscar por nombre o ID'
        nota='Los módulos son del sistema, no de cada proveedor.'
        error={error}
        filas={modulos}
        clave={(m) => m.id_modulo_siho as number}
        coincide={(m, texto) =>
          m.nombre_modulo.toLowerCase().includes(texto)
          || m.id_modulo_siho?.toString().includes(texto) === true
        }
        columnas={COLUMNAS}
        onNuevo={() => {
          setEditando(null);
          setOpenModal(true);
        }}
        onEditar={(m) => {
          setEditando(m);
          setOpenModal(true);
        }}
        onEliminar={(m) => setEliminando(m)}
      />

      {isOpenModal && (
        <ModalModuloSIHO
          isOpen={isOpenModal}
          onClose={() => setOpenModal(false)}
          modulo={editando}
          onGuardado={recargar}
        />
      )}

      {eliminando && (
        <ModalEliminarCatalogoError
          isOpen
          onClose={() => setEliminando(null)}
          singular='módulo'
          nombreElemento={eliminando.nombre_modulo}
          aviso='Si tiene errores asociados, el sistema lo impedirá. Desactívelo para retirarlo de los formularios sin perder el histórico.'
          onEliminar={() => dispatch(eliminarModuloSIHO(eliminando.id_modulo_siho as number)).unwrap()}
          onEliminado={recargar}
        />
      )}
    </>
  );
};

export default ModulosSIHOControl;
