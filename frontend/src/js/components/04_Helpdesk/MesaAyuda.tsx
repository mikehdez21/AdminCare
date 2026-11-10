// Bibliotecas
import React, { useCallback, useEffect, useState } from 'react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Types
import type { PaginacionMeta } from '@/@types/paginacionTypes';
import type { User } from '@/@types/mainTypes';
import type { Ticket } from '@/@types/HelpdeskTypes/ticketTypes';

// Store
import { AppDispatch, RootState } from '@/store/store';
import { establecerTecnicos, getTickets, marcarErrorProveedor } from '@/store/helpdesk/Tickets/ticketsActions';
import { getCategorias, getEstatus, getPrioridades, getProveedoresError, getSubcategorias } from '@/store/helpdesk/Catalogos/catalogosActions';
import { getHelpdeskDashboard } from '@/store/helpdesk/Dashboard/helpdeskDashboardActions';
import { getEmpleadosActivos } from '@/store/administrador/Empleados/empleadosActions';

// Hooks
import { useCatalogData } from '@/hooks/useCatalogData';
import { usePaginacionServidor, type FetcherPaginacionParams } from '@/hooks/usePaginacionServidor';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';
import ModalButtons from '@/components/00_Utils/ModalButtons';
import FiltrosTickets, { VALOR_VACIO, type TicketFiltrosValor } from './FiltrosTickets';
import TicketCard from './TicketCard';

// Icons
import { BiSupport } from 'react-icons/bi';
import { FaArrowCircleRight } from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';
import { MdAssignmentInd, MdReportProblem } from 'react-icons/md';

import { SIN_ASIGNAR } from '@/@types/HelpdeskTypes/ticketTypes';
import { administraHelpdesk, atiendeLaCategoria, empleadosParaHueco, hayTecnicosRepetidos, idsTecnicosDelTicket, nombreCompletoEmpleado, puedeVerErrorProveedor as ayudaPuedeVerErrorProveedor, tecnicosDelTicket } from '@/utils/helpdesk';
import { formatFechaMexico } from '@/utils/dateFormat';

// Styles
import '@styles/04_Helpdesk/MesaAyuda.css';

Modal.setAppElement('#root');

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
 * Celda de la columna Técnico: **solo el responsable**.
 *
 * La mesa es una tabla de registro y con los cinco huecos la columna crecía de más.
 * Los colaboradores no se pierden: van en el tooltip del botón de asignar, que es
 * donde se cambian.
 */
const CeldaTecnicos: React.FC<{ ticket: Ticket }> = ({ ticket }) => (
  ticket.tecnico
    ? <td className='asignado'>{nombreCompletoEmpleado(ticket.tecnico)}</td>
    : <td className='sin-asignar'>Sin asignar</td>
);

/**
 * Tooltip del botón de asignar. Cuando hay colaboradores se listan ahí, que es el
 * único sitio donde caben sin ensanchar la columna.
 */
const tituloAsignar = (ticket: Ticket): string => {
  const colaboradores = tecnicosDelTicket(ticket).slice(1).map(nombreCompletoEmpleado);

  return colaboradores.length === 0
    ? 'Asignar técnico'
    : `Asignar técnico — colaboradores: ${colaboradores.join(', ')}`;
};

const HelpdeskAdmin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();

  const categorias = useSelector((s: RootState) => s.helpdeskCatalogos.categorias);
  const subcategorias = useSelector((s: RootState) => s.helpdeskCatalogos.subcategorias);
  const prioridades = useSelector((s: RootState) => s.helpdeskCatalogos.prioridades);
  const estatus = useSelector((s: RootState) => s.helpdeskCatalogos.estatus);
  const proveedoresError = useSelector((s: RootState) => s.helpdeskCatalogos.proveedoresError);
  const empleados = useSelector((s: RootState) => s.empleados.empleados);
  const dashboard = useSelector((s: RootState) => s.helpdeskDashboard.dashboard);
  const usuario = useSelector((s: RootState) => s.auth.user as User | null | undefined);
  const permisos = useSelector((s: RootState) => s.auth.permissions);

  // Asignar lo hace quien es del área que atiende la categoría
  // (`TicketService::autorizarAsignacion`) o tiene la gestión interna. El botón se
  // muestra con esa misma regla para que un usuario de solo lectura no reciba un 403.
  const puedeAsignar = (ticket: Ticket) => administraHelpdesk(permisos) || atiendeLaCategoria(ticket, usuario);

  // El filtro de error de proveedor se ofrece a cualquier técnico de Helpdesk; cada
  // fila decide si muestra la acción según la categoría del ticket.
  const puedeFiltrarErrorProveedor = administraHelpdesk(permisos) || (usuario?.departamentos_atiende?.length ?? 0) > 0;

  useCatalogData(categorias, () => dispatch(getCategorias()));
  useCatalogData(subcategorias, () => dispatch(getSubcategorias()));
  useCatalogData(prioridades, () => dispatch(getPrioridades()));
  useCatalogData(estatus, () => dispatch(getEstatus()));
  // Catálogo del filtro que cuelga de "Errores de proveedor".
  useCatalogData(proveedoresError, () => dispatch(getProveedoresError()));
  // Listado auxiliar para el modal de asignación. Se pide completo porque el
  // filtro por `estatus_activo` se aplica aquí y no en el backend, que lo vuelve
  // a exigir al asignar (ver `TicketController::establecerTecnicos`).
  useCatalogData(empleados, () => dispatch(getEmpleadosActivos()));

  // La mesa de ayuda se entra desde `MesaAyuda`, que deja la categoría en la URL con
  // `?categoria=<id>`. Va en la query y no solo en el store para que el listado sea
  // compartible y sobreviva a un F5.
  //
  // Los ids llegan como texto y `Number('')` es 0, que sería un id válido, así que
  // el parseo descarta lo vacío antes de convertir.
  const leerId = (bruto: string | null): number | null => {
    const n = Number(bruto);

    return bruto !== null && bruto !== '' && Number.isInteger(n) && n > 0 ? n : null;
  };

  const [filtros, setFiltros] = useState<TicketFiltrosValor>(() => {
    const tecnico = searchParams.get('tecnico');

    return {
      ...VALOR_VACIO,
      id_categoria_ticket: leerId(searchParams.get('categoria')),
      id_responsable: tecnico === SIN_ASIGNAR ? SIN_ASIGNAR : leerId(tecnico),
    };
  });

  /**
   * Único punto por el que cambian los filtros, y sincroniza la URL en el mismo
   * acto. Se hace en el manejador y no en un `useEffect` a propósito: un efecto
   * que lee la URL para sembrar el estado y otro que lo escribe desde el estado
   * se realimentan entre sí.
   *
   * El técnico es el único filtro que puede ir en `SIN_ASIGNAR`, y es un texto, no
   * un número: se manda tal cual a la URL para que un F5 lo reconstruya igual.
   */
  const aplicarFiltros = (valor: TicketFiltrosValor) => {
    setFiltros(valor);

    const query: Record<string, string> = {};

    if (valor.id_categoria_ticket) query.categoria = String(valor.id_categoria_ticket);
    if (valor.id_responsable === SIN_ASIGNAR) query.tecnico = SIN_ASIGNAR;
    else if (valor.id_responsable) query.tecnico = String(valor.id_responsable);

    setSearchParams(query, { replace: true });
  };

  const [ticketAccion, setTicketAccion] = useState<Ticket | null>(null);
  const [idsTecnicos, setIdsTecnicos] = useState<(number | null)[]>([null, null, null, null, null]);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Fase 1 (prueba): sin backend, la marca de "error de proveedor" se guarda local
  // por ticket mientras dure la pantalla.
  const [ticketErrorProveedor, setTicketErrorProveedor] = useState<Ticket | null>(null);
  const [esErrorProveedor, setEsErrorProveedor] = useState(false);

  const fetcher = useCallback(
    async (params: FetcherPaginacionParams): Promise<{ data: Ticket[]; meta: PaginacionMeta | null }> => {
      const resultado = await dispatch(
        getTickets({ ...params, ...filtros })
      ).unwrap();

      if (resultado.success && resultado.tickets) {
        return { data: resultado.tickets, meta: resultado.meta ?? null };
      }

      throw new Error(resultado.message || 'Error al obtener los tickets');
    },
    [dispatch, filtros],
  );

  const {
    busqueda,
    paginaActual,
    setPaginaActual,
    perPage,
    items: tickets,
    totalItems,
    numeroTotalPaginas,
    loading,
    error,
    refetch,
    handleSearch,
    handleChangePerPage,
  } = usePaginacionServidor<Ticket>({ fetcher, perPageDefault: 10 });

  // Las tarjetas resumen respetan los filtros activos, para que coincidan con la tabla.
  useEffect(() => {
    dispatch(getHelpdeskDashboard(filtros));
  }, [dispatch, filtros]);

  /**
   * `/helpdesk/admin` sin categoría no tiene sentido: la mesa se entra por una
   * tarjeta de `MesaAyuda`, que es la que fija el área. Sin `?categoria=<id>` no hay
   * alcance que mostrar —y para un técnico significaría asomarse a otras áreas—, así
   * que se regresa a la selección de área.
   */
  const sinCategoria = filtros.id_categoria_ticket === null;

  useEffect(() => {
    if (sinCategoria) {
      navigate('/helpdesk/mesas', { replace: true });
    }
  }, [sinCategoria, navigate]);

  /**
     * "Limpiar" suelta los filtros que eligió el usuario, no el alcance.
     *
     * La categoría se conserva a propósito: es la que puso la tarjeta de `MesaAyuda`
     * y de dónde viene el usuario. Borrarla devolvía la mesa entera sin filtro, que
     * para un técnico significa verse los tickets de otras áreas, y el botón decía
     * "limpiar filtros" no "quitar el filtro de categoría". Cambiar de área se hace
     * volviendo a las tarjetas.
     */
  const limpiarFiltros = () => {
    aplicarFiltros({ ...VALOR_VACIO, id_categoria_ticket: filtros.id_categoria_ticket });
    refetch();
  };

  // Un ticket puede venir con un técnico que ya no está activo. Se excluye del
  // desplegable, pero el valor ya asignado se muestra para que quede visible en vez
  // de desaparecer sin explicación. Además el técnico tiene que ser del área que
  // atiende la categoría —es lo que exige el backend—. El solicitante sí aparece: se
  // le puede asignar su propio ticket.
  const departamentoDelTicket = ticketAccion?.categoria?.id_departamento_default ?? null;

  const tecnicosDisponibles = empleados.filter(e =>
    e.estatus_activo
    && (departamentoDelTicket === null || e.id_departamento === departamentoDelTicket));

  const abrirModal = (ticket: Ticket) => {
    setTicketAccion(ticket);
    setErrorModal(null);
    setIdsTecnicos(idsTecnicosDelTicket(ticket));
  };

  const cambiarTecnico = (indice: number, idEmpleado: number | null) => {
    setIdsTecnicos(actuales => actuales.map((valor, i) => (i === indice ? idEmpleado : valor)));
  };

  const cerrarModal = () => {
    setTicketAccion(null);
    setErrorModal(null);
  };

  const confirmarAccion = async () => {
    if (!ticketAccion?.id_ticket) {
      return;
    }

    if (idsTecnicos[0] === null) {
      setErrorModal('Seleccione un responsable.');
      return;
    }

    if (hayTecnicosRepetidos(idsTecnicos)) {
      setErrorModal('Un empleado no puede repetirse como responsable y colaborador.');
      return;
    }

    setEnviando(true);
    setErrorModal(null);

    const resultado = await dispatch(
      establecerTecnicos({
        id: ticketAccion.id_ticket,
        cuerpo: {
          id_responsable: idsTecnicos[0] as number,
          id_tecnico_dos: idsTecnicos[1],
          id_tecnico_tres: idsTecnicos[2],
          id_tecnico_cuatro: idsTecnicos[3],
          id_tecnico_cinco: idsTecnicos[4],
        },
      })
    ).unwrap();

    setEnviando(false);

    if (!resultado.success) {
      setErrorModal(resultado.message);
      return;
    }

    Swal.fire({ icon: 'success', title: 'Técnicos actualizados', timer: 1200, showConfirmButton: false });
    cerrarModal();
    refetch();
  };

  const abrirModalErrorProveedor = (ticket: Ticket) => {
    setTicketErrorProveedor(ticket);
    setEsErrorProveedor(Boolean(ticket.error_proveedor));
  };

  const cerrarModalErrorProveedor = () => {
    setTicketErrorProveedor(null);
  };

  /**
   * Marca o desmarca el ticket como error de proveedor. Es lo que decide si el
   * detalle muestra su sección, así que va al backend: apagarla limpia sus campos.
   */
  const confirmarErrorProveedor = async () => {
    const id = ticketErrorProveedor?.id_ticket;

    if (id === undefined) {
      return;
    }

    setEnviando(true);
    setErrorModal(null);

    const resultado = await dispatch(
      marcarErrorProveedor({
        id,
        cuerpo: { error_proveedor: esErrorProveedor },
      })
    ).unwrap();

    setEnviando(false);

    if (!resultado.success) {
      setErrorModal(resultado.message);
      return;
    }

    Swal.fire({
      icon: 'success',
      title: esErrorProveedor ? 'Marcado como error de proveedor' : 'Desmarcado como error de proveedor',
      timer: 1200,
      showConfirmButton: false,
    });

    cerrarModalErrorProveedor();
    refetch();
  };

  // Categoría con la que se entró (la deja la tarjeta de `MesaAyuda` en la URL). Se
  // muestra en el título para saber de qué área es la lista. Mientras el catálogo no
  // cargue, `find` no encuentra nada y tampoco se pinta: no hay que inventar el nombre.
  const categoriaActual = categorias.find(c => c.id_categoria_ticket === filtros.id_categoria_ticket);

  // Sin categoría ya se disparó el regreso a `MesaAyuda`; no se pinta la mesa a medias.
  if (sinCategoria) {
    return null;
  }

  return (
    <div className='mainDiv_HelpdeskAdmin'>

      <div className='searchAdd_ButtonDiv'>
        <div className='text_Div'>
          <div className='titleConVolver'>

            <div className='returnButton'>
              <button type='button' onClick={() => navigate('/helpdesk/mesas')}>
                <FaArrowCircleRight className='iconAdd' style={{ transform: 'rotate(180deg)' }} /> Volver
              </button>
            </div>

            <h1>
              <BiSupport className='iconHelpdesk' /> Mesa de Ayuda
              {categoriaActual ? ` — ${categoriaActual.nombre_categoria}` : ''}
            </h1>
          </div>
          <p>Mostrando {tickets.length} de {totalItems} tickets</p>
        </div>

        <div className='buttons_Div'>
          <input type='text' placeholder='Buscar por folio, título o descripción' value={busqueda} onChange={handleSearch} />

          <select className='selectList' value={perPage} onChange={handleChangePerPage}>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>

          <button className='buttonNuevoTicket' onClick={() => navigate('/helpdesk')}>Nuevo Ticket</button>
        </div>
      </div>

      {/* Resumen: los conteos respetan los filtros que se apliquen. */}
      <div className='dashboardCards'>
        <TicketCard etiqueta='Total' valor={dashboard?.total_tickets ?? 0} />
        <TicketCard etiqueta='Reabiertos' valor={dashboard?.tickets_reabiertos ?? 0} />
        <TicketCard
          etiqueta='Cumplimiento SLA'
          valor={dashboard?.sla.porcentaje_cumplimiento != null ? `${dashboard.sla.porcentaje_cumplimiento}%` : '—'}
        />
        <TicketCard etiqueta='Abiertos' valor={dashboard?.por_estatus.find(e => e.nombre === 'Abierto')?.total ?? 0} />
      </div>

      <FiltrosTickets
        categorias={categorias}
        subcategorias={subcategorias}
        prioridades={prioridades}
        estatus={estatus}
        valor={filtros}
        empleados={empleados}
        mostrarErrorProveedor={puedeFiltrarErrorProveedor}
        proveedoresError={proveedoresError}
        onChange={(nuevos) => {
          aplicarFiltros(nuevos);
          refetch();
        }}
        onLimpiar={limpiarFiltros}
      />

      <hr />

      {error && <p className='formError'>{error}</p>}

      {!loading && tickets.length === 0 ? (
        <div className='noEntities'>
          <FiAlertTriangle /> <p>No hay tickets registrados</p> <FiAlertTriangle />
        </div>
      ) : (
        <>
          <Paginacion
            paginaActual={paginaActual}
            numeroTotalPaginas={numeroTotalPaginas}
            onPageChange={setPaginaActual}
            onPaginaAnterior={() => setPaginaActual(paginaActual - 1)}
            onPaginaSiguiente={() => setPaginaActual(paginaActual + 1)}
          />

          <div className='list_entitiesDiv_helpdeskAdmin'>
            <table>
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Solicitante</th>
                  <th>Técnico</th>
                  <th>Departamento</th>
                  <th>Prioridad</th>
                  <th>Estatus</th>
                  <th>Creado</th>
                  <th>Resuelto</th>
                  <th>Cerrado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.id_ticket}>
                    <td>
                      <button
                        type='button'
                        className='ticketFolioLink'
                        onClick={() => navigate(`/helpdesk/ticket/${ticket.id_ticket}`)}
                      >
                        {ticket.folio_ticket}
                      </button>
                    </td>
                    <td>{ticket.titulo_ticket}</td>
                    <td>{ticket.categoria?.nombre_categoria ?? '—'}</td>
                    <td>{ticket.solicitante?.nombre_usuario ?? '—'}</td>
                    <CeldaTecnicos ticket={ticket} />
                    <td>{ticket.departamento?.nombre_departamento ?? '—'}</td>
                    <td>
                      <span className='badge' style={{ backgroundColor: ticket.prioridad?.color ?? '#9b9b9b' }}>
                        {ticket.prioridad?.nombre_prioridad ?? '—'}
                      </span>
                    </td>
                    <td>
                      <span className='badge' style={{ backgroundColor: ticket.estatus?.color ?? '#9b9b9b' }}>
                        {ticket.estatus?.nombre_estatus ?? '—'}
                      </span>
                    </td>
                    <td>{ticket.created_at ?? '—'}</td>
                    <td>{formatFechaMexico(ticket.fecha_resolucion) || '—'}</td>
                    <td>{formatFechaMexico(ticket.fecha_cierre) || '—'}</td>
                    <td>
                      <div className='divActions'>
                        {puedeAsignar(ticket) && (
                          <button className='button_editEntity' title={tituloAsignar(ticket)} onClick={() => abrirModal(ticket)}>
                            <MdAssignmentInd />
                          </button>
                        )}
                        {ayudaPuedeVerErrorProveedor(ticket, usuario, permisos) && (
                          <button
                            className={`button_editEntity${ticket.error_proveedor ? ' activo' : ''}`}
                            title='Marcar error de proveedor'
                            onClick={() => abrirModalErrorProveedor(ticket)}
                          >
                            <MdReportProblem />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Paginacion
            paginaActual={paginaActual}
            numeroTotalPaginas={numeroTotalPaginas}
            onPageChange={setPaginaActual}
            onPaginaAnterior={() => setPaginaActual(paginaActual - 1)}
            onPaginaSiguiente={() => setPaginaActual(paginaActual + 1)}
          />
        </>
      )}

      <Modal isOpen={ticketAccion !== null} onRequestClose={cerrarModal} contentLabel='Asignar técnico' className='modalHelpdeskAdmin'>
        <div className='mainDiv_modalHelpdeskAdmin'>
          <h2>Asignar Técnicos</h2>

          <p className='modalTicketFolio'>
            Ticket <strong>{ticketAccion?.folio_ticket}</strong> — {ticketAccion?.titulo_ticket}
          </p>

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
                  onChange={(e) => cambiarTecnico(indice, e.target.value === '' ? null : Number(e.target.value))}
                >
                  <option value=''>Sin asignar</option>
                  {empleadosParaHueco(tecnicosDisponibles, idsTecnicos, indice).map(e => (
                    <option key={e.id_empleado} value={e.id_empleado}>{nombreCompletoEmpleado(e)}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {errorModal && <p className='formError'>{errorModal}</p>}

          <ModalButtons
            buttons={[
              { text: 'Confirmar', type: 'button', className: 'button_addedit', onClick: confirmarAccion, disabled: enviando },
              { text: 'Cancelar', type: 'button', className: 'button_close', onClick: cerrarModal },
            ]}
          />
        </div>
      </Modal>

      <Modal isOpen={ticketErrorProveedor !== null} onRequestClose={cerrarModalErrorProveedor} contentLabel='Error de proveedor' className='modalHelpdeskAdmin'>
        <div className='mainDiv_modalHelpdeskAdmin'>
          <h2>Error de Proveedor</h2>

          <p className='modalTicketFolio'>
            Ticket <strong>{ticketErrorProveedor?.folio_ticket}</strong> — {ticketErrorProveedor?.titulo_ticket}
          </p>

          <label className='errorProveedorSwitch'>
            <input
              type='checkbox'
              checked={esErrorProveedor}
              onChange={(e) => setEsErrorProveedor(e.target.checked)}
            />
            <span>Es error de proveedor</span>
          </label>

          {errorModal && <p className='formError'>{errorModal}</p>}

          <ModalButtons
            buttons={[
              { text: 'Confirmar', type: 'button', className: 'button_addedit', onClick: confirmarErrorProveedor, disabled: enviando },
              { text: 'Cancelar', type: 'button', className: 'button_close', onClick: cerrarModalErrorProveedor },
            ]}
          />
        </div>
      </Modal>

    </div>
  );
};

export default HelpdeskAdmin;