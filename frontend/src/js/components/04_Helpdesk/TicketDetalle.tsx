// Bibliotecas
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Types
import type { User } from '@/@types/mainTypes';

// Store
import { AppDispatch, RootState } from '@/store/store';
import {
  actualizarEtiquetas,
  establecerTecnicos,
  cambiarEstado,
  cerrarTicket,
  getTicketById,
  marcarErrorProveedor,
  reabrirTicket,
  responderEncuesta,
} from '@/store/helpdesk/Tickets/ticketsActions';
import { limpiarTicketSeleccionado } from '@/store/helpdesk/Tickets/ticketsReducer';
import { crearAvance, eliminarAvance, getAvances } from '@/store/helpdesk/Tickets/avancesActions';
import { selectAvancesVisibles, selectPuedeEscribirAvances } from '@/store/helpdesk/Tickets/avancesReducer';
import { getEtiquetas, getEstatus, getModulosSIHO, getProveedoresError, getSistemasProveedor } from '@/store/helpdesk/Catalogos/catalogosActions';
import { getEmpleadosActivos } from '@/store/administrador/Empleados/empleadosActions';

// Hooks
import { useCatalogData } from '@/hooks/useCatalogData';

// Utils
import { formatFechaMexico } from '@/utils/dateFormat';
import { atiendeLaCategoria as ayudaAtiendeLaCategoria, empleadosParaHueco, evaluarSlaTicket, hayTecnicosRepetidos, idsTecnicosDelTicket, nombreCompletoEmpleado, puedeVerErrorProveedor as ayudaPuedeVerErrorProveedor, tecnicosDelTicket } from '@/utils/helpdesk';

// Componentes
import ModalButtons from '@/components/00_Utils/ModalButtons';

// Icons
import { BiSupport } from 'react-icons/bi';
import { FaArrowCircleRight } from 'react-icons/fa';
import { MdSend, MdDeleteForever, MdLock } from 'react-icons/md';

// Styles
import '@styles/04_Helpdesk/TicketDetalle.css';

Modal.setAppElement('#root');

type ModalAccion = 'estado' | 'asignar' | 'cerrar' | 'reabrir' | null;

const CALIFICACIONES = [1, 2, 3, 4, 5];

/**
 * Los cinco huecos del modal de técnicos, en orden. El primero es el responsable
 * —el único que manda— y los demás colaboradores. Los nombres de campo son los del
 * payload de `PUT helpdesk/tickets/{id}/tecnicos`.
 */
const CAMPOS_TECNICOS = [
  { campo: 'id_responsable', id: 'modal_responsable', etiqueta: 'Técnico responsable' },
  { campo: 'id_tecnico_dos', id: 'modal_tecnico_dos', etiqueta: 'Colaborador 1' },
  { campo: 'id_tecnico_tres', id: 'modal_tecnico_tres', etiqueta: 'Colaborador 2' },
  { campo: 'id_tecnico_cuatro', id: 'modal_tecnico_cuatro', etiqueta: 'Colaborador 3' },
  { campo: 'id_tecnico_cinco', id: 'modal_tecnico_cinco', etiqueta: 'Colaborador 4' },
];

/**
 * Títulos legibles del historial.
 *
 * `TicketService::registrarActividad` guarda el tipo en snake_case porque es el
 * valor que se consulta y agrupa; mostrarse tal cual deja `cambio_estado` y
 * `asignacion_tecnico` tal cual en pantalla.
 */
const TITULOS_ACTIVIDAD: Record<string, string> = {
  creacion: 'Creación',
  cambio_estado: 'Cambio de estado',
  cambio_prioridad: 'Cambio de prioridad',
  asignacion_tecnico: 'Asignación de técnico',
  avance_registrado: 'Avance registrado',
  reapertura: 'Reapertura',
};

/** Cualquier tipo nuevo se humaniza quitando el guion bajo, en vez de mostrarlo crudo. */
const tituloActividad = (tipo: string): string => {
  if (TITULOS_ACTIVIDAD[tipo]) {
    return TITULOS_ACTIVIDAD[tipo];
  }

  const palabras = tipo.replace(/_/g, ' ').trim();

  return palabras.charAt(0).toUpperCase() + palabras.slice(1);
};

const TicketDetalle: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // El id se saca del pathname, no de `useParams`. Esta vista no se monta desde un
  // `<Route>`: `MainContent` resuelve el componente con `getSectionForPath` y lo
  // renderiza como `<SectionComponent />`, fuera del matcher de react-router. Ah�
  // `useParams` devuelve `{}` siempre y el id sal�a `undefined`.
  const { pathname } = useLocation();
  const idTicket = Number(pathname.split('/').pop());

  const ticket = useSelector((s: RootState) => s.helpdeskTickets.ticketSeleccionado);
  const loading = useSelector((s: RootState) => s.helpdeskTickets.loading);
  const errorTicket = useSelector((s: RootState) => s.helpdeskTickets.error);
  const errorAvances = useSelector((s: RootState) => s.helpdeskAvances.error);

  // El selector ya descarta las notas internas si el usuario no tiene por qué verlas.
  const avances = useSelector((s: RootState) => selectAvancesVisibles(s));
  const puedeEscribir = useSelector((s: RootState) => selectPuedeEscribirAvances(s));

  const usuario = useSelector((s: RootState) => s.auth.user as User | null | undefined);
  const esSolicitante = usuario?.id_usuario === ticket?.id_usuario_solicitante;

  const empleados = useSelector((s: RootState) => s.empleados.empleados);
  const estatusCatalogo = useSelector((s: RootState) => s.helpdeskCatalogos.estatus);
  const etiquetasCatalogo = useSelector((s: RootState) => s.helpdeskCatalogos.etiquetas);
  const proveedoresError = useSelector((s: RootState) => s.helpdeskCatalogos.proveedoresError);
  const sistemasProveedor = useSelector((s: RootState) => s.helpdeskCatalogos.sistemasProveedor);
  const modulosSIHO = useSelector((s: RootState) => s.helpdeskCatalogos.modulosSIHO);

  useCatalogData(empleados, () => dispatch(getEmpleadosActivos()));
  useCatalogData(estatusCatalogo, () => dispatch(getEstatus()));
  useCatalogData(etiquetasCatalogo, () => dispatch(getEtiquetas()));
  useCatalogData(proveedoresError, () => dispatch(getProveedoresError()));
  useCatalogData(sistemasProveedor, () => dispatch(getSistemasProveedor()));
  useCatalogData(modulosSIHO, () => dispatch(getModulosSIHO()));

  const [modalAccion, setModalAccion] = useState<ModalAccion>(null);
  const [idEstatus, setIdEstatus] = useState<number | null>(null);
  const [idsTecnicos, setIdsTecnicos] = useState<(number | null)[]>([null, null, null, null, null]);
  const [comentario, setComentario] = useState('');
  const [motivo, setMotivo] = useState('');
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const [contenidoAvance, setContenidoAvance] = useState('');
  const [avanceInterno, setAvanceInterno] = useState(false);

  const [calificacion, setCalificacion] = useState(5);
  const [comentarioEncuesta, setComentarioEncuesta] = useState('');

  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<number[]>([]);
  const [guardandoEtiquetas, setGuardandoEtiquetas] = useState(false);

  // Campos del error de proveedor. El catálogo decide qué se pide: el switch
  // `requiere_sistema` del proveedor elegido enciende sistema, no. de ticket
  // externo, módulo y personal SAC.
  const [idProveedorError, setIdProveedorError] = useState<number | null>(null);
  const [idSolucionaError, setIdSolucionaError] = useState<number | null>(null);
  const [idSistema, setIdSistema] = useState<number | null>(null);
  const [noTicketExterno, setNoTicketExterno] = useState('');
  const [idModulo, setIdModulo] = useState<number | null>(null);
  const [personalSac, setPersonalSac] = useState(false);
  const [guardandoErrorProveedor, setGuardandoErrorProveedor] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(idTicket)) {
      return;
    }

    dispatch(getTicketById(idTicket));
    dispatch(getAvances(idTicket));

    return () => {
      dispatch(limpiarTicketSeleccionado());
    };
  }, [dispatch, idTicket]);

  // Las casillas arrancan desde lo que el ticket ya tiene. Se sincroniza por id de
  // ticket, no por el contenido: si el guardado reescribiera las casillas mientras
  // el usuario edita otra, se perdería lo recién marcado.
  const etiquetasDelTicket = (ticket?.etiquetas ?? [])
    .map(etiqueta => etiqueta.id_etiqueta)
    .filter((id): id is number => id !== undefined);

  useEffect(() => {
    setEtiquetasSeleccionadas(etiquetasDelTicket);
  }, [ticket?.id_ticket]);

  // Siembra los campos de error de proveedor desde el ticket. Se re-ejecuta al
  // cambiar de ticket, no en cada guardado: mientras el usuario edita, lo que
  // escribe manda.
  useEffect(() => {
    const detalle = ticket?.errorProveedorDetalle;

    setIdProveedorError(detalle?.id_proveedor_error ?? null);
    setIdSolucionaError(detalle?.id_soluciona_error ?? null);
    setIdSistema(detalle?.id_sistema ?? null);
    setNoTicketExterno(detalle?.no_ticket_externo ?? '');
    setIdModulo(detalle?.id_modulo_sistema ?? null);
    setPersonalSac(Boolean(detalle?.personal_sac));
  }, [ticket?.id_ticket]);

  if (!Number.isFinite(idTicket)) {
    return <p className='formError'>Ticket inválido.</p>;
  }

  const alternarEtiqueta = (idEtiqueta?: number) => {
    if (idEtiqueta === undefined) {
      return;
    }

    setEtiquetasSeleccionadas(actuales => actuales.includes(idEtiqueta)
      ? actuales.filter(id => id !== idEtiqueta)
      : [...actuales, idEtiqueta]);
  };

  /**
   * Aviso de éxito. Las acciones de esta pantalla cambian el ticket sin mover al
   * usuario de sitio, así que sin esto no hay forma de saber que el guardado entró.
   */
  const avisoExito = (titulo: string) => {
    Swal.fire({ icon: 'success', title: titulo, timer: 1200, showConfirmButton: false });
  };

  const guardarEtiquetas = async () => {
    if (!ticket?.id_ticket) {
      return;
    }

    setGuardandoEtiquetas(true);

    const resultado = await dispatch(actualizarEtiquetas({
      id: ticket.id_ticket,
      etiquetas: etiquetasSeleccionadas,
    })).unwrap();

    setGuardandoEtiquetas(false);

    if (!resultado.success) {
      Swal.fire({ icon: 'error', title: 'No se pudieron guardar las etiquetas', text: resultado.message });

      return;
    }

    avisoExito('Etiquetas guardadas');
    recargar();
  };

  /** Guarda la bandera y los campos de "Errores de Proveedor" del ticket abierto. */
  const guardarErrorProveedor = async () => {
    if (!ticket?.id_ticket) {
      return;
    }

    setGuardandoErrorProveedor(true);

    const resultado = await dispatch(marcarErrorProveedor({
      id: ticket.id_ticket,
      cuerpo: {
        // Guardar desde el detalle implica que el ticket es de este tipo.
        error_proveedor: true,
        id_proveedor_error: idProveedorError,
        id_soluciona_error: idSolucionaError,
        // Los campos de sistema solo aplican al proveedor que los pide; el backend
        // los limpia igual si no corresponden.
        id_sistema: requiereSistema ? idSistema : null,
        no_ticket_externo: requiereSistema && noTicketExterno.trim() !== '' ? noTicketExterno.trim() : null,
        id_modulo_sistema: requiereSistema ? idModulo : null,
        personal_sac: requiereSistema ? personalSac : null,
      },
    })).unwrap();

    setGuardandoErrorProveedor(false);

    if (!resultado.success) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: resultado.message });

      return;
    }

    avisoExito('Error de proveedor guardado');
    recargar();
  };

  const abrirModal = (accion: Exclude<ModalAccion, null>) => {
    setModalAccion(accion);
    setErrorModal(null);
    setComentario('');
    setMotivo('');
    setIdsTecnicos(idsTecnicosDelTicket(ticket));
    setIdEstatus(ticket?.id_estatus_ticket ?? null);
  };

  const cerrarModal = () => {
    setModalAccion(null);
    setErrorModal(null);
  };

  /** Recarga el detalle: todas las acciones devuelven el ticket, pero la encuesta
   *  y el borrado de avances sí necesitan volver a preguntar al backend. */
  const recargar = () => {
    dispatch(getTicketById(idTicket));
    dispatch(getAvances(idTicket));
  };

  const confirmarAccion = async () => {
    if (!ticket?.id_ticket) {
      return;
    }

    if (modalAccion === 'estado' && idEstatus === null) {
      setErrorModal('Seleccione un estatus.');
      return;
    }

    if (modalAccion === 'asignar' && idsTecnicos[0] === null) {
      setErrorModal('Seleccione un responsable.');
      return;
    }

    if (modalAccion === 'asignar' && hayTecnicosRepetidos(idsTecnicos)) {
      setErrorModal('Un empleado no puede repetirse como responsable y colaborador.');
      return;
    }

    if (modalAccion === 'reabrir' && motivo.trim().length < 10) {
      setErrorModal('El motivo debe tener al menos 10 caracteres.');
      return;
    }

    setEnviando(true);
    setErrorModal(null);

    let resultado;

    switch (modalAccion) {
    case 'estado':
      resultado = await dispatch(cambiarEstado({
        id: ticket.id_ticket,
        id_estatus_ticket: idEstatus!,
        comentario: comentario.trim() || null,
      })).unwrap();
      break;
    case 'asignar':
      resultado = await dispatch(establecerTecnicos({
        id: ticket.id_ticket,
        cuerpo: {
          id_responsable: idsTecnicos[0] as number,
          id_tecnico_dos: idsTecnicos[1],
          id_tecnico_tres: idsTecnicos[2],
          id_tecnico_cuatro: idsTecnicos[3],
          id_tecnico_cinco: idsTecnicos[4],
        },
      })).unwrap();
      break;
    case 'cerrar':
      resultado = await dispatch(cerrarTicket(ticket.id_ticket)).unwrap();
      break;
    case 'reabrir':
      resultado = await dispatch(reabrirTicket({ id: ticket.id_ticket, motivo: motivo.trim() })).unwrap();
      break;
    default:
      setEnviando(false);
      return;
    }

    setEnviando(false);

    if (!resultado.success) {
      setErrorModal(resultado.message);
      return;
    }

    // El modal se cierra en el acto, así que el aviso es lo que confirma el cambio.
    avisoExito({
      estado: 'Estatus actualizado',
      asignar: 'Técnicos actualizados',
      cerrar: 'Ticket cerrado',
      reabrir: 'Ticket reabierto',
    }[modalAccion as Exclude<ModalAccion, null>]);

    cerrarModal();
    recargar();
  };

  const enviarAvance = async () => {
    if (!ticket?.id_ticket || contenidoAvance.trim().length < 3) {
      return;
    }

    const resultado = await dispatch(crearAvance({
      ticketId: ticket.id_ticket,
      contenido_avance: contenidoAvance.trim(),
      es_interno: avanceInterno,
    })).unwrap();

    if (resultado.success) {
      setContenidoAvance('');
      setAvanceInterno(false);
      avisoExito('Avance registrado');
    }
  };

  const borrarAvance = async (idAvance?: number) => {
    if (idAvance === undefined) {
      return;
    }

    const resultado = await dispatch(eliminarAvance(idAvance)).unwrap();

    if (resultado.success) {
      avisoExito('Avance eliminado');
      recargar();
    }
  };

  const enviarEncuesta = async () => {
    const resultado = await dispatch(responderEncuesta({
      id: idTicket,
      calificacion,
      comentario_satisfaccion: comentarioEncuesta.trim() || null,
    })).unwrap();

    if (resultado.success) {
      setComentarioEncuesta('');
      avisoExito('Calificación registrada');
      recargar();
    }
  };

  // Nombre del estatus actual. Las acciones del solicitante dependen de él, no de
  // `es_estado_final`: en el catálogo solo "Cerrado" tiene esa bandera, y la
  // encuesta se hace en "Resuelto".
  const estatusActual = ticket?.estatus?.nombre_estatus ?? '';
  const esResuelto = estatusActual === 'Resuelto';
  const esCerrado = estatusActual === 'Cerrado';

  // El técnico que atiende la categoría del ticket ve el bloque de error de
  // proveedor, sea cual sea su área; el Admin lo ve en todos.
  const puedeVerErrorProveedor = ayudaPuedeVerErrorProveedor(ticket, usuario);

  // Solo los proveedores del departamento que atiende la categoría del ticket.
  const proveedoresErrorDelTicket = proveedoresError.filter(
    p => p.id_departamento === ticket?.categoria?.id_departamento_default,
  );

  // El proveedor elegido manda: su switch decide si se piden los campos de sistema.
  const requiereSistema = proveedoresErrorDelTicket
    .find(p => p.id_proveedor_error === idProveedorError)?.requiere_sistema === true;

  const sistemasDelProveedor = sistemasProveedor.filter(s => s.id_proveedor_error === idProveedorError);

  // Personas que atienden el ticket, con el responsable primero.
  const tecnicos = tecnicosDelTicket(ticket);

  // Cálculo de SLA sobre los hitos de respuesta y resolución.
  const sla = ticket ? evaluarSlaTicket(ticket) : null;

  // Solo empleados activos y del área que atiende la categoría: es lo que exige el
  // backend. El solicitante también aparece, porque puede asignarse su propio ticket.
  const tecnicosDisponibles = empleados.filter(e => e.estatus_activo
    && (ticket?.categoria?.id_departamento_default == null
      || e.id_departamento === ticket.categoria.id_departamento_default));

  const cambiarTecnico = (indice: number, idEmpleado: number | null) => {
    setIdsTecnicos(actuales => actuales.map((valor, i) => (i === indice ? idEmpleado : valor)));
  };

  // El área del usuario atiende esta categoría. Va por la categoría y no por el
  // solicitante: el mismo criterio con el que `MesaAyuda` decide qué tarjetas ver y
  // `TicketService::scopeVisibleA` qué tickets listar.
  const atiendeLaCategoria = ayudaAtiendeLaCategoria(ticket, usuario);

  // `puedeEscribir` ya es `esTecnicoDelTicket || atiendeLaCategoria || Admin`, que es lo
  // que autoriza `TicketService::autorizarGestion` para cambiar estado y cerrar. El
  // solicitante entra por la misma regla de categoría: quien atiende su propia categoría
  // lleva su ticket de principio a fin.
  const puedeGestionar = puedeEscribir || atiendeLaCategoria;

  // El solicitante reabre solo cuando el ticket ya está Cerrado, y califica cuando
  // hay solución (Resuelto) o ya no quedó nada por hacer (Cerrado). "Cerrado" se
  // acepta porque el flujo normal es Resuelto → calificar → Cerrar, y queda el caso
  // de quien cerró sin que nadie alcanzara a calificar.
  const puedeReabrir = esSolicitante && esCerrado;
  const puedeCalificar = esSolicitante && (esResuelto || esCerrado) && !ticket?.encuesta;

  return (
    <div className='mainDiv_TicketDetalle'>

      <div className='detalleHeader'>
        <div className='returnButton'>
          <button type='button' onClick={() => navigate(-1)}>
            <FaArrowCircleRight className='iconAdd' style={{ transform: 'rotate(180deg)' }} /> Volver
          </button>
        </div>

        {ticket && (
          <>
            <h1><BiSupport className='iconHelpdesk' /> {ticket.folio_ticket}</h1>
            <span className='badge' style={{ backgroundColor: ticket.estatus?.color ?? '#9b9b9b' }}>
              {ticket.estatus?.nombre_estatus ?? '—'}
            </span>
            <span className='badge' style={{ backgroundColor: ticket.prioridad?.color ?? '#9b9b9b' }}>
              {ticket.prioridad?.nombre_prioridad ?? '—'}
            </span>
          </>
        )}
      </div>

      {loading && <p className='detalleCargando'>Cargando ticket...</p>}
      {errorTicket && <p className='formError'>{errorTicket}</p>}

      {!loading && !ticket && <p className='formError'>No se encontró el ticket.</p>}

      {ticket && (
        <>
          <div className='detalleColumnas'>
            {/* Columna principal: los bloques de datos, de arriba a abajo. Las
                acciones van aparte, a la derecha. */}
            <div className='detalleColumnaPrincipal'>
              <section className='detallePanel'>
                <h2>Información del Ticket</h2>

                <div className='detalleGrid'>
                  <div><span>Título</span><strong>{ticket.titulo_ticket}</strong></div>
                  <div><span>Categoría</span><strong>{ticket.categoria?.nombre_categoria ?? '—'}</strong></div>
                  <div><span>Subcategoría</span><strong>{ticket.subcategoria?.nombre_subcategoria ?? '—'}</strong></div>
                  <div><span>Creado <span className='slaTag'>SLA</span></span><strong>{formatFechaMexico(ticket.created_at) || '—'}</strong></div>
                  <div><span>Resuelto</span><strong>{formatFechaMexico(ticket.fecha_resolucion) || '—'}</strong></div>
                  <div><span>Cerrado</span><strong>{formatFechaMexico(ticket.fecha_cierre) || '—'}</strong></div>
                  <div><span>Reabierto</span><strong>{ticket.ticket_reapertura ? 'Sí' : 'No'}</strong></div>
                </div>

                <h3>Descripción</h3>
                <p className='detalleDescripcion'>{ticket.descripcion_ticket}</p>
              </section>

              <section className='detallePanel'>
                <h2>Quién Solicita</h2>

                <div className='detalleGrid'>
                  <div><span>Solicitante</span><strong>{ticket.solicitante?.nombre_usuario ?? '—'}</strong></div>
                  <div><span>Empleado solicitante</span><strong>{ticket.empleadoSolicitante ? nombreCompletoEmpleado(ticket.empleadoSolicitante) : '—'}</strong></div>
                  <div><span>Departamento solicitante</span><strong>{ticket.departamento?.nombre_departamento ?? '—'}</strong></div>
                  <div><span>Ubicación del problema</span><strong>{ticket.ubicacion?.nombre_ubicacion ?? '—'}</strong></div>
                </div>
              </section>

              <section className='detallePanel'>
                <h2>Quién Resuelve</h2>

                <div className='detalleGrid'>
                  <div className='detalleTecnicos'>
                    <span>Técnicos</span>
                    {tecnicos.length === 0 ? (
                      <strong>Sin asignar</strong>
                    ) : (
                      <ul>
                        {tecnicos.map((persona, indice) => (
                          <li key={persona.id_empleado ?? indice}>
                            {nombreCompletoEmpleado(persona)}
                            {indice === 0 && <em className='detalleResponsable'>Responsable</em>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div><span>Límite de respuesta <span className='slaTag'>SLA</span></span><strong>{formatFechaMexico(ticket.fecha_limite_respuesta) || '—'}</strong></div>
                  <div><span>Límite de solución <span className='slaTag'>SLA</span></span><strong>{formatFechaMexico(ticket.fecha_limite_resolucion) || '—'}</strong></div>
                </div>
              </section>

              <section className='detallePanel'>
                <h2>SLA del Ticket</h2>

                <table className='slaTabla'>
                  <thead>
                    <tr>
                      <th>Hito</th>
                      <th>Límite</th>
                      <th>Real</th>
                      <th>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Respuesta</td>
                      <td>{formatFechaMexico(sla?.respuesta.limite) || '—'}</td>
                      <td>{formatFechaMexico(sla?.respuesta.real) || '—'}</td>
                      <td>
                        <span className={'slaEstado sla-' + sla?.respuesta.estado}>{sla?.respuesta.etiqueta}</span>
                        <small>{sla?.respuesta.diferencia}</small>
                      </td>
                    </tr>
                    <tr>
                      <td>Solución</td>
                      <td>{formatFechaMexico(sla?.solucion.limite) || '—'}</td>
                      <td>{formatFechaMexico(sla?.solucion.real) || '—'}</td>
                      <td>
                        <span className={'slaEstado sla-' + sla?.solucion.estado}>{sla?.solucion.etiqueta}</span>
                        <small>{sla?.solucion.diferencia}</small>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p className='slaNota'>Los tiempos se miden en horas corridas desde la creación del ticket.</p>
              </section>

              <section className='detallePanel'>
                <h2>Etiquetas</h2>

                {ticket.etiquetas && ticket.etiquetas.length > 0 && (
                  <div className='detalleEtiquetas'>
                    {ticket.etiquetas.map(etiqueta => (
                      <span key={etiqueta.id_etiqueta} className='badge' style={{ backgroundColor: etiqueta.color ?? '#9b9b9b' }}>
                        {etiqueta.nombre_etiqueta}
                      </span>
                    ))}
                  </div>
                )}

                {/* Etiquetar es opcional y lo hace quien atiende el ticket: no es
                    parte del flujo del solicitante ni del alta. */}
                {puedeGestionar ? (
                  <div className='detalleEtiquetasEditor'>
                    {etiquetasCatalogo.length === 0 ? (
                      <p className='detalleAviso'>No hay etiquetas configuradas.</p>
                    ) : (
                      <>
                        <div className='detalleEtiquetasOpciones'>
                          {etiquetasCatalogo.map(etiqueta => (
                            <label key={etiqueta.id_etiqueta} className='etiquetaOption' style={{ backgroundColor: etiqueta.color ?? '#9b9b9b' }}>
                              <input
                                type='checkbox'
                                checked={etiquetasSeleccionadas.includes(etiqueta.id_etiqueta ?? -1)}
                                onChange={() => alternarEtiqueta(etiqueta.id_etiqueta)}
                              />
                              <span>{etiqueta.nombre_etiqueta}</span>
                            </label>
                          ))}
                        </div>

                        <button
                          type='button'
                          className='buttonGuardarEtiquetas'
                          onClick={guardarEtiquetas}
                          disabled={guardandoEtiquetas}
                        >
                          {guardandoEtiquetas ? 'Guardando...' : 'Guardar etiquetas'}
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  ticket.etiquetas?.length === 0 && (
                    <p className='detalleAviso'>
                      {esSolicitante ? 'Este ticket aún no tiene etiquetas.' : 'Solo quien atiende el ticket puede etiquetarlo.'}
                    </p>
                  )
                )}
              </section>
            </div>

            <section className='detallePanel'>
              <h2>Acciones</h2>

              {puedeGestionar && (
                <div className='detalleAcciones'>
                  <button onClick={() => abrirModal('asignar')}>Asignar técnico</button>
                </div>
              )}

              {puedeGestionar && (
                <div className='detalleAcciones'>
                  <button onClick={() => abrirModal('estado')}>Cambiar estatus</button>
                  {!esCerrado && <button onClick={() => abrirModal('cerrar')}>Cerrar ticket</button>}
                </div>
              )}

              {puedeReabrir && (
                <div className='detalleAcciones'>
                  <button onClick={() => abrirModal('reabrir')}>Reabrir ticket</button>
                </div>
              )}

              {!puedeGestionar && !esSolicitante && (
                <p className='detalleAviso'>Solo el técnico asignado o un administrador del módulo puede gestionar este ticket.</p>
              )}

              {esSolicitante && !puedeGestionar && (
                <p className='detalleAviso'>
                  Como solicitante solo puede reabrir el ticket cuando esté cerrado y calificar la solución.
                </p>
              )}

              {ticket.encuesta && (
                <div className='detalleEncuestaHecha'>
                  <strong>Encuesta registrada</strong>
                  <span>{ticket.encuesta.calificacion} / 5</span>
                  {ticket.encuesta.comentario_satisfaccion && <p>{ticket.encuesta.comentario_satisfaccion}</p>}
                </div>
              )}

              {puedeCalificar && (
                <div className='detalleEncuesta'>
                  <h3>Califica la atención</h3>

                  <div className='calificacionGroup'>
                    {CALIFICACIONES.map(numero => (
                      <label key={numero} className={`calificacionOption ${calificacion === numero ? 'selected' : ''}`}>
                        <input type='radio' name='calificacion' checked={calificacion === numero} onChange={() => setCalificacion(numero)} />
                        <span>{numero}</span>
                      </label>
                    ))}
                  </div>

                  <textarea value={comentarioEncuesta} onChange={e => setComentarioEncuesta(e.target.value)} rows={3} placeholder='Comentario (opcional)' />

                  <button onClick={enviarEncuesta}>Enviar encuesta</button>
                </div>
              )}
            </section>
          </div>

          {puedeVerErrorProveedor && ticket.error_proveedor && (
            <section className='detallePanel'>
              <h2>Errores de Proveedor</h2>

              <div className='detalleGrid'>
                <div>
                  <span>Proveedor</span>
                  <select value={idProveedorError ?? ''} onChange={e => setIdProveedorError(e.target.value === '' ? null : Number(e.target.value))}>
                    <option value=''>Seleccione un proveedor</option>
                    {proveedoresErrorDelTicket.map(p => (
                      <option key={p.id_proveedor_error} value={p.id_proveedor_error}>{p.nombre_proveedor_error}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span>Quién resuelve</span>
                  <select value={idSolucionaError ?? ''} onChange={e => setIdSolucionaError(e.target.value === '' ? null : Number(e.target.value))}>
                    <option value=''>Sin especificar</option>
                    {proveedoresErrorDelTicket.map(p => (
                      <option key={p.id_proveedor_error} value={p.id_proveedor_error}>{p.nombre_proveedor_error}</option>
                    ))}
                  </select>
                </div>

                {/* Lo que sigue solo aplica al proveedor que trae el switch encendido
                    (Reliv). Para el resto, el error es nada más el proveedor. */}
                {requiereSistema && (
                  <>
                    <div>
                      <span>Sistema</span>
                      <select value={idSistema ?? ''} onChange={e => setIdSistema(e.target.value === '' ? null : Number(e.target.value))}>
                        <option value=''>Seleccione un sistema</option>
                        {sistemasDelProveedor.map(s => (
                          <option key={s.id_sistema_proveedor} value={s.id_sistema_proveedor}>{s.nombre_sistema_proveedor}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span>No. Ticket Externo</span>
                      <input type='text' maxLength={60} value={noTicketExterno} onChange={e => setNoTicketExterno(e.target.value)} />
                    </div>

                    <div>
                      <span>Módulo</span>
                      <select value={idModulo ?? ''} onChange={e => setIdModulo(e.target.value === '' ? null : Number(e.target.value))}>
                        <option value=''>Sin especificar</option>
                        {modulosSIHO.map(m => (
                          <option key={m.id_modulo_siho} value={m.id_modulo_siho}>{m.nombre_modulo}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span>Personal SAC</span>
                      <select value={personalSac ? 'si' : 'no'} onChange={e => setPersonalSac(e.target.value === 'si')}>
                        <option value='si'>Sí</option>
                        <option value='no'>No</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {idProveedorError !== null && !requiereSistema && (
                <p className='detalleAviso'>Este proveedor no pide sistema, no. de ticket externo, módulo ni personal SAC.</p>
              )}

              <div className='detalleAcciones'>
                <button type='button' onClick={guardarErrorProveedor} disabled={guardandoErrorProveedor}>
                  {guardandoErrorProveedor ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </section>
          )}

          <section className='detallePanel'>
            <h2>Avances</h2>

            {errorAvances && <p className='formError'>{errorAvances}</p>}

            {puedeEscribir && (
              <div className='avanceForm'>
                <textarea value={contenidoAvance} onChange={e => setContenidoAvance(e.target.value)} rows={3} placeholder='Registrar avance...' />

                <label className='avanceInternoToggle'>
                  <input type='checkbox' checked={avanceInterno} onChange={e => setAvanceInterno(e.target.checked)} />
                  <MdLock /> Nota interna (no la ve el solicitante)
                </label>

                <button onClick={enviarAvance} disabled={contenidoAvance.trim().length < 3}><MdSend /> Registrar</button>
              </div>
            )}

            {!puedeEscribir && (
              <p className='detalleAviso'>Solo el técnico que atiende el ticket puede registrar avances.</p>
            )}

            <div className='avancesTimeline'>
              {avances.length === 0 ? (
                <p className='detalleAviso'>Este ticket aún no tiene avances.</p>
              ) : (
                avances.map(avance => (
                  <div key={avance.id_avance_ticket} className={`avanceItem ${avance.es_interno ? 'avanceItem_Interno' : ''}`}>
                    <div className='avanceItem_Header'>
                      <strong>{avance.autor?.nombre_usuario ?? '—'}</strong>
                      <span>{formatFechaMexico(avance.created_at)}</span>
                      {avance.es_interno && <span className='avanceInternoTag'><MdLock /> Interna</span>}
                      {puedeEscribir && (
                        <button title='Eliminar avance' onClick={() => borrarAvance(avance.id_avance_ticket)}>
                          <MdDeleteForever />
                        </button>
                      )}
                    </div>
                    <p>{avance.contenido_avance}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          {ticket.actividades && ticket.actividades.length > 0 && (
            <section className='detallePanel'>
              <h2>Historial</h2>

              <div className='actividadesTimeline'>
                {ticket.actividades.map(actividad => {
                  // Los cambios de estado guardan la etiqueta anterior y la nueva en
                  // valor_anterior / valor_nuevo; su descripcion es el comentario que
                  // opcionalmente escribio quien hizo el cambio, y a menudo va vacia.
                  const esCambioEstado = actividad.tipo_actividad === 'cambio_estado';

                  return (
                    <div key={actividad.id_actividad_ticket} className='actividadItem'>
                      <span className='actividadFecha'>{formatFechaMexico(actividad.created_at)}</span>
                      <div>
                        <strong>{tituloActividad(actividad.tipo_actividad)}</strong>

                        {esCambioEstado && (
                          <p className='actividadCambio'>
                            <span>Estado anterior: <strong>{actividad.valor_anterior ?? '—'}</strong></span>
                            <span>Fue cambiado a: <strong>{actividad.valor_nuevo ?? '—'}</strong></span>
                          </p>
                        )}

                        {actividad.descripcion_actividad && (
                          <p className='actividadComentario'>{actividad.descripcion_actividad}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}

      <Modal isOpen={modalAccion !== null} onRequestClose={cerrarModal} contentLabel='Acción del ticket' className='modalTicketDetalle'>
        <div className='mainDiv_modalTicketDetalle'>
          <h2>
            {modalAccion === 'estado' && 'Cambiar Estatus'}
            {modalAccion === 'asignar' && 'Asignar Técnico'}
            {modalAccion === 'cerrar' && 'Cerrar Ticket'}
            {modalAccion === 'reabrir' && 'Reabrir Ticket'}
          </h2>

          {modalAccion === 'estado' && (
            <>
              <div className='ticketField'>
                <label htmlFor='modal_estatus'>Estatus</label>
                <select id='modal_estatus' value={idEstatus ?? ''} onChange={e => setIdEstatus(e.target.value === '' ? null : Number(e.target.value))}>
                  <option value=''>Seleccione un estatus</option>
                  {estatusCatalogo.map(e => (
                    <option key={e.id_estatus_ticket} value={e.id_estatus_ticket}>{e.nombre_estatus}</option>
                  ))}
                </select>
              </div>

              <div className='ticketField'>
                <label htmlFor='modal_comentario'>Comentario</label>
                <textarea id='modal_comentario' rows={3} value={comentario} onChange={e => setComentario(e.target.value)} />
              </div>
            </>
          )}

          {modalAccion === 'asignar' && (
            <div className='tecnicosModal'>
              {/* El primero es el responsable: es el único que manda. Los demás son
                  colaboradores y quedan como información de apoyo. */}
              {CAMPOS_TECNICOS.map((campo, indice) => (
                <div
                  key={campo.campo}
                  className={`ticketField ${indice === 0 ? 'ticketField_Responsable' : ''}`}
                >
                  <label htmlFor={campo.id}>{campo.etiqueta}</label>

                  <select
                    id={campo.id}
                    value={idsTecnicos[indice] ?? ''}
                    onChange={e => cambiarTecnico(indice, e.target.value === '' ? null : Number(e.target.value))}
                  >
                    <option value=''>Sin asignar</option>
                    {empleadosParaHueco(tecnicosDisponibles, idsTecnicos, indice).map(e => (
                      <option key={e.id_empleado} value={e.id_empleado}>{nombreCompletoEmpleado(e)}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {modalAccion === 'cerrar' && (
            <p>Al cerrar el ticket se registra la fecha de resolución y deja de aceptar cambios de estado.</p>
          )}

          {modalAccion === 'reabrir' && (
            <div className='ticketField'>
              <label htmlFor='modal_motivo'>Motivo de la reapertura <span className='required'>*</span></label>
              <textarea id='modal_motivo' rows={4} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder='Mínimo 10 caracteres' />
            </div>
          )}

          {errorModal && <p className='formError'>{errorModal}</p>}

          <ModalButtons
            buttons={[
              { text: 'Confirmar', type: 'button', className: 'button_addedit', onClick: confirmarAccion, disabled: enviando },
              { text: 'Cancelar', type: 'button', className: 'button_close', onClick: cerrarModal },
            ]}
          />
        </div>
      </Modal>

    </div>
  );
};

export default TicketDetalle;
