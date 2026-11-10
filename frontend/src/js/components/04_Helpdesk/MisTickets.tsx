// Bibliotecas
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Types
import type { User } from '@/@types/mainTypes';
import type { PaginacionMeta } from '@/@types/paginacionTypes';
import type { Ticket } from '@/@types/HelpdeskTypes/ticketTypes';

// Store
import { AppDispatch, RootState } from '@/store/store';
import { getTickets } from '@/store/helpdesk/Tickets/ticketsActions';
import { getCategorias, getEstatus, getPrioridades, getSubcategorias } from '@/store/helpdesk/Catalogos/catalogosActions';
import { getEmpleadosActivos } from '@/store/administrador/Empleados/empleadosActions';
import { nombreCompletoEmpleado, tecnicosDelTicket } from '@/utils/helpdesk';
import { formatFechaMexico } from '@/utils/dateFormat';

// Hooks
import { useCatalogData } from '@/hooks/useCatalogData';
import { usePaginacionServidor, type FetcherPaginacionParams } from '@/hooks/usePaginacionServidor';

// Componentes
import Paginacion from '@/components/00_Utils/Paginacion';
import FiltrosTickets, { VALOR_VACIO } from './FiltrosTickets';

// Icons
import { BiSupport } from 'react-icons/bi';
import { FiAlertTriangle } from 'react-icons/fi';

// Styles
import '@styles/04_Helpdesk/MisTickets.css';

/**
 * Tooltip de la celda Técnico: la columna muestra **solo al responsable** porque
 * esta tabla es de registro y con los cinco huecos se ensancha de más.
 *
 * Aquí no hay botón de asignar, así que los colaboradores viajan en el `title` del
 * propio nombre. Vacío cuando no hay ninguno, y entonces no sale tooltip.
 */
const tituloColaboradores = (ticket: Ticket): string => {
  const colaboradores = tecnicosDelTicket(ticket).slice(1).map(nombreCompletoEmpleado);

  return colaboradores.length === 0 ? '' : `Colaboradores: ${colaboradores.join(', ')}`;
};

const HelpdeskTickets: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((s: RootState) => s.auth.user as User | null | undefined);

  const categorias = useSelector((s: RootState) => s.helpdeskCatalogos.categorias);
  const subcategorias = useSelector((s: RootState) => s.helpdeskCatalogos.subcategorias);
  const prioridades = useSelector((s: RootState) => s.helpdeskCatalogos.prioridades);
  const estatus = useSelector((s: RootState) => s.helpdeskCatalogos.estatus);
  const empleados = useSelector((s: RootState) => s.empleados.empleados);

  useCatalogData(categorias, () => dispatch(getCategorias()));
  useCatalogData(subcategorias, () => dispatch(getSubcategorias()));
  useCatalogData(prioridades, () => dispatch(getPrioridades()));
  useCatalogData(estatus, () => dispatch(getEstatus()));
  useCatalogData(empleados, () => dispatch(getEmpleadosActivos()));

  const [filtros, setFiltros] = useState(VALOR_VACIO);

  // ---------------------------------------------------------------------------
  // Paginación servidor. Los filtros van dentro del `fetcher` por eso el hook
  // vuelve a cargar cuando cambia alguno: `refetch` los reinicia a página 1.
  // `id_usuario_solicitante` fija la lista a los tickets del usuario en sesión.
  // ---------------------------------------------------------------------------
  const fetcher = useCallback(
    async (params: FetcherPaginacionParams): Promise<{ data: Ticket[]; meta: PaginacionMeta | null }> => {
      const resultado = await dispatch(
        getTickets({
          ...params,
          id_usuario_solicitante: user?.id_usuario ?? null,
          ...filtros,
        })
      ).unwrap();

      if (resultado.success && resultado.tickets) {
        return { data: resultado.tickets, meta: resultado.meta ?? null };
      }

      throw new Error(resultado.message || 'Error al obtener los tickets');
    },
    [dispatch, user?.id_usuario, filtros],
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

  const limpiarFiltros = () => {
    setFiltros(VALOR_VACIO);
    refetch();
  };

  return (
    <div className='mainDiv_HelpdeskTickets'>

      <div className='searchAdd_ButtonDiv'>
        <div className='text_Div'>
          <h1><BiSupport className='iconHelpdesk' /> Mis Tickets</h1>
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

      {/* Filtros: cambian la consulta del `fetcher`, `refetch` vuelve a página 1 */}
      <FiltrosTickets
        categorias={categorias}
        subcategorias={subcategorias}
        prioridades={prioridades}
        estatus={estatus}
        valor={filtros}
        empleados={empleados}
        mostrarCategoria
        onChange={(nuevos) => {
          setFiltros(nuevos);
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

          <div className='list_entitiesDiv_helpdeskTickets'>
            <table>
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Prioridad</th>
                  <th>Estatus</th>
                  <th>Técnico</th>
                  <th>Fecha</th>
                  <th>Resuelto</th>
                  <th>Cerrado</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.id_ticket} onClick={() => navigate(`/helpdesk/ticket/${ticket.id_ticket}`)}>
                    <td>{ticket.folio_ticket}</td>
                    <td>{ticket.titulo_ticket}</td>
                    <td>{ticket.categoria?.nombre_categoria ?? '—'}</td>
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
                    <td title={tituloColaboradores(ticket)}>
                      {ticket.tecnico ? nombreCompletoEmpleado(ticket.tecnico) : 'Sin asignar'}
                    </td>
                    <td>{ticket.created_at ?? '—'}</td>
                    <td>{formatFechaMexico(ticket.fecha_resolucion) || '—'}</td>
                    <td>{formatFechaMexico(ticket.fecha_cierre) || '—'}</td>
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

    </div>
  );
};

export default HelpdeskTickets;