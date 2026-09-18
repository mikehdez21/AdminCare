import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { ActivoFactura, ActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { getEstatusAF } from '@/store/almacengeneral/Activos/EstatusAF/estatusAFActions';
import { getClasificaciones } from '@/store/almacengeneral/Clasificaciones/clasificacionesActions';
import { getEmpleados } from '@/store/administrador/Empleados/empleadosActions';
import { getUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesActions';
import { getMovimientosActivosFijos, getTipoMovimientosActivosFijos } from '@/store/almacengeneral/Activos/MovimientosActivos/movimientosAFActions';
import { setListMovimientosAF } from '@/store/almacengeneral/Activos/MovimientosActivos/movimientosAFReducer';
import { useCatalogData } from '@/hooks/useCatalogData';
import { formatDateHorasToInputs, getFechaHoraActual } from '@/utils/dateFormat';
import type { SelectOption } from '@/components/00_Utils/ui/SelectField';

/**
 * Valores de todos los campos del formulario de Activo Fijo.
 */
export interface ActivoFijoValores {
  nombreAF: string;
  descripcionAF: string;
  modeloAF: string;
  marcaAF: string;
  noSerieAF: string;
  costoUnitarioAF: number;
  afPropio: boolean;
  tipoEstatusAF: number;
  tipoClasificacionAF: number | null;
  afMenor: boolean;
  fechaRegistroAF: string;
  depreciacionAplicada: boolean;
  observacionesAF: string;
  tipoMovimiento: number;
  responsableActual: number;
  ubicacionActual: number;
  motivoMovimiento: string;
}

/**
 * Setters de todos los campos del formulario de Activo Fijo.
 */
export interface ActivoFijoSetters {
  setNombreAF: (value: string) => void;
  setDescripcionAF: (value: string) => void;
  setModeloAF: (value: string) => void;
  setMarcaAF: (value: string) => void;
  setNoSerieAF: (value: string) => void;
  setCostoUnitarioAF: (value: number) => void;
  setAFPropio: (value: boolean) => void;
  setTipoEstatusAF: (value: number) => void;
  setTipoClasificacionAF: (value: number | null) => void;
  setAFMenor: (value: boolean) => void;
  setFechaRegistroAF: (value: string) => void;
  setDepreciacionAplicada: (value: boolean) => void;
  setObservacionesAF: (value: string) => void;
  setTipoMovimiento: (value: number) => void;
  setResponsableActual: (value: number) => void;
  setUbicacionActual: (value: number) => void;
  setMotivoMovimiento: (value: string) => void;
}

/**
 * Opciones de los selects de catálogo. En modo 'add' empleados y ubicaciones
 * se ordenan alfabéticamente por nombre (igual que hacía AddActivoFijo);
 * en modo 'edit' se conserva el orden original del store (igual que EditActivoFijo).
 */
export interface ActivoFijoOpciones {
  estatus: SelectOption[];
  clasificacion: SelectOption[];
  tipoMovimiento: SelectOption[];
  empleados: SelectOption[];
  ubicaciones: SelectOption[];
}

/**
 * Bindings compartidos que consumen los subcomponentes del formulario.
 */
export interface ActivoFijoFormBindings {
  valores: ActivoFijoValores;
  setters: ActivoFijoSetters;
  opciones: ActivoFijoOpciones;
  upper: (value: string) => string;
}

interface UseActivoFijoFormOptions {
  modo: 'add' | 'edit';
  /** Solo para modo 'edit': activo que se está editando. */
  activoFijoInicial?: ActivosFijos | null;
  /** Modo "solo datos" de AddActivoFijo (usado desde AddActivosFactura). */
  soloDatos?: boolean;
  /** Callback que recibe el ActivoFactura construido en modo soloDatos. */
  onAddAFToFactura?: (activoFijo: ActivoFactura) => void;
}

export interface UseActivoFijoFormReturn extends ActivoFijoFormBindings {
  codigoUnico: string;
  construirActivoFijo: () => ActivosFijos;
  construirActivoFactura: () => ActivoFactura;
  limpiarFormulario: () => void;
  enviarSoloDatos: () => boolean;
}

/**
 * Estado + handlers del formulario de Activo Fijo, compartido entre AddActivoFijo
 * y EditActivoFijo. Extrae los 5 catálogos vía useCatalogData, los efectos de
 * carga propios de edición, la construcción del payload y el modo soloDatos.
 */
export function useActivoFijoForm({
  modo,
  activoFijoInicial = null,
  soloDatos = false,
  onAddAFToFactura,
}: UseActivoFijoFormOptions): UseActivoFijoFormReturn {
  const dispatch = useDispatch<AppDispatch>();

  const upper = (value: string) => value.toUpperCase();

  // Estados para los campos del formulario de Activo Fijo
  const [nombreAF, setNombreAF] = useState<string>('');
  const [descripcionAF, setDescripcionAF] = useState<string>('');
  const [modeloAF, setModeloAF] = useState<string>('');
  const [marcaAF, setMarcaAF] = useState<string>('');
  const [noSerieAF, setNoSerieAF] = useState<string>('');
  const [costoUnitarioAF, setCostoUnitarioAF] = useState<number>(0.00);
  const [afPropio, setAFPropio] = useState<boolean>(true);
  const [tipoEstatusAF, setTipoEstatusAF] = useState<number>(0);
  const [tipoClasificacionAF, setTipoClasificacionAF] = useState<number | null>(null);
  const [afMenor, setAFMenor] = useState<boolean>(false);
  const [fechaRegistroAF, setFechaRegistroAF] = useState<string>(() => (modo === 'add' ? getFechaHoraActual() : ''));
  const [depreciacionAplicada, setDepreciacionAplicada] = useState<boolean>(false);
  const [observacionesAF, setObservacionesAF] = useState<string>('');

  // Código único (solo visible en edición)
  const [codigoUnico, setCodigoUnico] = useState<string>('');

  // Estados para los campos del formulario de Asignación del Activo Fijo
  const [tipoMovimiento, setTipoMovimiento] = useState<number>(0);
  const [responsableActual, setResponsableActual] = useState<number>(0);
  const [ubicacionActual, setUbicacionActual] = useState<number>(0);
  const [motivoMovimiento, setMotivoMovimiento] = useState<string>('');

  // Datos de catálogos y movimientos desde el store
  const empleados = useSelector((state: RootState) => state.empleados.empleados);
  const ubicaciones = useSelector((state: RootState) => state.ubicaciones.ubicaciones);
  const tiposClasificacionAF = useSelector((state: RootState) => state.clasificacion.clasificacionesAF);
  const tiposEstatusAF = useSelector((state: RootState) => state.estatusAF.estatusAF);
  const tipoMovimientoAF = useSelector((state: RootState) => state.movimientosAF.tipoMovimientoAF);
  const MovimientosAF = useSelector((state: RootState) => state.movimientosAF.movimientosAF);

  // Carga de catálogos con patrón "fetch si vacío" (useCatalogData)
  useCatalogData(tiposEstatusAF, () => dispatch(getEstatusAF()));
  useCatalogData(tiposClasificacionAF, () => dispatch(getClasificaciones()));
  useCatalogData(empleados, () => dispatch(getEmpleados()));
  useCatalogData(ubicaciones, () => dispatch(getUbicaciones()));
  useCatalogData(tipoMovimientoAF, () => dispatch(getTipoMovimientosActivosFijos()));

  // En Add, al desmarcar "Activo Propio" el costo se limpia (efecto propio de Add)
  useEffect(() => {
    if (modo !== 'add') return;
    if (!afPropio && costoUnitarioAF !== 0) {
      setCostoUnitarioAF(0);
    }
  }, [afPropio, costoUnitarioAF, modo]);

  // Carga de movimientos de activos fijos (siempre se refresca al montar) — solo edición
  useEffect(() => {
    if (modo !== 'edit') return;
    const cargarMovimientosActivosFijos = async () => {
      try {
        const resultAction = await dispatch(getMovimientosActivosFijos()).unwrap();

        if (resultAction.success) {
          dispatch(setListMovimientosAF(resultAction.movimientosAF!));
        } else {
          console.log('Error', resultAction.message);
        }
      } catch (error) {
        console.error('Error al cargar los movimientos de activos fijos:', error);
      }
    };
    cargarMovimientosActivosFijos();
  }, [dispatch, modo]);

  // Carga de los datos del activo a editar (incluye la última asignación) — solo edición
  useEffect(() => {
    if (modo !== 'edit') return;

    if (activoFijoInicial) {
      setCodigoUnico(activoFijoInicial.codigo_unico || '');
      setNombreAF(activoFijoInicial.nombre_af);
      setDescripcionAF(activoFijoInicial.descripcion_af);
      setModeloAF(activoFijoInicial.modelo_af);
      setMarcaAF(activoFijoInicial.marca_af);
      setNoSerieAF(activoFijoInicial.numero_serie_af);
      setCostoUnitarioAF(activoFijoInicial.costo_unitario_af);
      setAFPropio(activoFijoInicial.af_propio);
      setTipoEstatusAF(activoFijoInicial.id_estado_af || 0);
      setTipoClasificacionAF(activoFijoInicial.id_clasificacion || null);
      setAFMenor(activoFijoInicial.af_menor);
      setFechaRegistroAF(formatDateHorasToInputs(activoFijoInicial.fecha_registro_af) || '');
      setObservacionesAF(activoFijoInicial.observaciones_af || '');

      // Buscar el último movimiento de este activo fijo para cargar los datos de asignación
      const ultimoMovimiento = MovimientosAF
        .filter(am => am.id_activo_fijo === activoFijoInicial.id_activo_fijo)
        .sort((a, b) => new Date(b.fecha_movimiento || '').getTime() - new Date(a.fecha_movimiento || '').getTime())[0];

      if (ultimoMovimiento) {
        // Asignar los valores correctos del último movimiento
        setTipoMovimiento(ultimoMovimiento.id_tipo_movimiento || 0);
        setResponsableActual(ultimoMovimiento.id_responsable_actual || 0);
        setUbicacionActual(ultimoMovimiento.id_ubicacion_actual || 0);
        setMotivoMovimiento(ultimoMovimiento.motivo_movimiento || '');
      } else {
        // Si no hay movimientos previos, limpiar los campos de asignación
        setTipoMovimiento(0);
        setResponsableActual(0);
        setUbicacionActual(0);
        setMotivoMovimiento('');
      }
    } else {
      // Si no hay activoFijoInicial, limpiar los campos
      setCodigoUnico('');
      setNombreAF('');
      setDescripcionAF('');
      setModeloAF('');
      setMarcaAF('');
      setNoSerieAF('');
      setCostoUnitarioAF(0.00);
      setAFPropio(true);
      setTipoEstatusAF(0);
      setTipoClasificacionAF(null);
      setAFMenor(false);
      setFechaRegistroAF('');
      setDepreciacionAplicada(false);
      setObservacionesAF('');
      setTipoMovimiento(0);
      setResponsableActual(0);
      setUbicacionActual(0);
      setMotivoMovimiento('');
    }
  }, [modo, activoFijoInicial, MovimientosAF]);

  // Opciones de los selects de catálogo (se mantiene la memoización de AddActivoFijo)
  const opcionesEstatus = useMemo<SelectOption[]>(() => {
    const lista = Array.isArray(tiposEstatusAF) ? tiposEstatusAF : [];
    return lista.map((estatus) => ({
      value: estatus.id_estatusaf ?? 0,
      label: estatus.descripcion_estatusaf,
    }));
  }, [tiposEstatusAF]);

  const opcionesClasificacion = useMemo<SelectOption[]>(() => {
    const listaBase = Array.isArray(tiposClasificacionAF) ? tiposClasificacionAF : [];
    const lista = [...listaBase].sort((a, b) => a.nombre_clasificacion.localeCompare(b.nombre_clasificacion));
    return lista.map((clasificacion) => ({
      value: clasificacion.id_clasificacion ?? 0,
      label: clasificacion.nombre_clasificacion,
    }));
  }, [tiposClasificacionAF]);

  const opcionesTipoMovimiento = useMemo<SelectOption[]>(() => {
    const lista = Array.isArray(tipoMovimientoAF) ? tipoMovimientoAF : [];
    return lista.map((tipomovimiento) => ({
      value: tipomovimiento.id_tipomovimientoaf ?? 0,
      label: tipomovimiento.nombre_tipomovimientoaf,
    }));
  }, [tipoMovimientoAF]);

  const opcionesEmpleados = useMemo<SelectOption[]>(() => {
    const listaBase = Array.isArray(empleados) ? empleados : [];
    const lista = [...listaBase].sort((a, b) => a.nombre_empleado.localeCompare(b.nombre_empleado));
    return lista.map((empleado) => ({
      value: empleado.id_empleado ?? 0,
      label: `${empleado.nombre_empleado} ${empleado.apellido_paterno} ${empleado.apellido_materno}`,
    }));
  }, [empleados]);

  const opcionesUbicaciones = useMemo<SelectOption[]>(() => {
    const listaBase = Array.isArray(ubicaciones) ? ubicaciones : [];
    const lista = [...listaBase].sort((a, b) => a.nombre_ubicacion.localeCompare(b.nombre_ubicacion));
    return lista.map((ubicacion) => ({
      value: ubicacion.id_ubicacion ?? 0,
      label: ubicacion.nombre_ubicacion,
    }));
  }, [ubicaciones]);

  // Construcción del objeto ActivosFijos para enviar al backend
  const construirActivoFijo = (): ActivosFijos => {
    if (modo === 'edit') {
      return {
        id_activo_fijo: activoFijoInicial?.id_activo_fijo,
        codigo_unico: upper(codigoUnico),
        nombre_af: upper(nombreAF),
        descripcion_af: upper(descripcionAF),
        modelo_af: upper(modeloAF),
        marca_af: upper(marcaAF),
        numero_serie_af: upper(noSerieAF),
        costo_unitario_af: costoUnitarioAF,
        af_propio: afPropio,
        id_estado_af: tipoEstatusAF,
        id_clasificacion: tipoClasificacionAF,
        af_menor: afMenor,
        fecha_registro_af: fechaRegistroAF,
        depreciacion_aplicada: depreciacionAplicada,
        observaciones_af: upper(observacionesAF),
      };
    }

    return {
      nombre_af: upper(nombreAF),
      descripcion_af: upper(descripcionAF),
      modelo_af: upper(modeloAF),
      marca_af: upper(marcaAF),
      numero_serie_af: upper(noSerieAF),
      costo_unitario_af: afPropio ? costoUnitarioAF : 0,
      af_propio: afPropio,
      id_estado_af: tipoEstatusAF,
      id_clasificacion: tipoClasificacionAF,
      af_menor: afMenor,
      fecha_registro_af: fechaRegistroAF,
      depreciacion_aplicada: depreciacionAplicada,
      observaciones_af: upper(observacionesAF),
    };
  };

  // Construcción del ActivoFactura (modo soloDatos de AddActivoFijo)
  const construirActivoFactura = (): ActivoFactura => ({
    ...construirActivoFijo(),
    cantidad: 1,
    descuento_af: 0,
    descuento_porcentajeaf: 0,
    id_tipo_movimiento: tipoMovimiento,
    motivo_movimiento: upper(motivoMovimiento),
    fecha_movimiento: getFechaHoraActual(),
    id_responsable_anterior: 0,
    id_responsable_actual: responsableActual,
    id_ubicacion_anterior: 0,
    id_ubicacion_actual: ubicacionActual,
  });

  // Limpiar el formulario tras guardar o cancelar (mismos valores que AddActivoFijo)
  const limpiarFormulario = () => {
    setNombreAF('');
    setDescripcionAF('');
    setModeloAF('');
    setMarcaAF('');
    setNoSerieAF('');
    setCostoUnitarioAF(0.00);
    setAFPropio(true);
    setFechaRegistroAF(getFechaHoraActual());
    setTipoEstatusAF(0);
    setTipoClasificacionAF(null);
    setAFMenor(false);
    setDepreciacionAplicada(false);
    setObservacionesAF('');
    setTipoMovimiento(0);
    setResponsableActual(0);
    setUbicacionActual(0);
    setMotivoMovimiento('');
    setCodigoUnico('');
  };

  // Envío en modo soloDatos: construye el ActivoFactura, lo entrega vía callback y limpia
  const enviarSoloDatos = (): boolean => {
    if (!soloDatos || !onAddAFToFactura) {
      return false;
    }
    onAddAFToFactura(construirActivoFactura());
    limpiarFormulario();
    return true;
  };

  const bindings: ActivoFijoFormBindings = {
    valores: {
      nombreAF,
      descripcionAF,
      modeloAF,
      marcaAF,
      noSerieAF,
      costoUnitarioAF,
      afPropio,
      tipoEstatusAF,
      tipoClasificacionAF,
      afMenor,
      fechaRegistroAF,
      depreciacionAplicada,
      observacionesAF,
      tipoMovimiento,
      responsableActual,
      ubicacionActual,
      motivoMovimiento,
    },
    setters: {
      setNombreAF,
      setDescripcionAF,
      setModeloAF,
      setMarcaAF,
      setNoSerieAF,
      setCostoUnitarioAF,
      setAFPropio,
      setTipoEstatusAF,
      setTipoClasificacionAF,
      setAFMenor,
      setFechaRegistroAF,
      setDepreciacionAplicada,
      setObservacionesAF,
      setTipoMovimiento,
      setResponsableActual,
      setUbicacionActual,
      setMotivoMovimiento,
    },
    opciones: {
      estatus: opcionesEstatus,
      clasificacion: opcionesClasificacion,
      tipoMovimiento: opcionesTipoMovimiento,
      empleados: opcionesEmpleados,
      ubicaciones: opcionesUbicaciones,
    },
    upper,
  };

  return {
    ...bindings,
    codigoUnico,
    construirActivoFijo,
    construirActivoFactura,
    limpiarFormulario,
    enviarSoloDatos,
  };
}