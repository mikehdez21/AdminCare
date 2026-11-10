// Bibliotecas
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Types
import type { User } from '@/@types/mainTypes';
import type { TicketFormData } from '@/@types/HelpdeskTypes/ticketTypes';

// Store
import { AppDispatch, RootState } from '@/store/store';
import { crearTicket, type ResultadoTicket } from '@/store/helpdesk/Tickets/ticketsActions';
import { getCategorias, getEmpleadosHelpdesk, getPrioridades, getTitulos } from '@/store/helpdesk/Catalogos/catalogosActions';
import { getUbicaciones } from '@/store/administrador/Ubicaciones/ubicacionesActions';

// Hooks
import { useCatalogData } from '@/hooks/useCatalogData';

// Utils
import { formatDateHorasToFrontend, getFechaHoraActual } from '@/utils/dateFormat';
import { nombreCompletoEmpleado } from '@/utils/helpdesk';

// Icons
import { BiSupport } from 'react-icons/bi';
import { MdCheck, MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from 'react-icons/md';

// UI
import SearchInput from '@/components/00_Utils/ui/SearchInput';

// Styles
import '@styles/04_Helpdesk/AddTicket.css';

const PASSOS_TITULOS = ['Clasificación del Reporte', 'Detalles del Reporte', 'Prioridad de Atención', 'Resumen del Ticket'];
const TOTAL_PASSOS = PASSOS_TITULOS.length;

const Helpdesk: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((s: RootState) => s.auth.user as User | null | undefined);
  const departamento = useSelector((s: RootState) => s.auth.departamento);

  const categorias = useSelector((s: RootState) => s.helpdeskCatalogos.categorias);
  const titulosPorCategoria = useSelector((s: RootState) => s.helpdeskCatalogos.titulosPorCategoria);
  const prioridades = useSelector((s: RootState) => s.helpdeskCatalogos.prioridades);
  const empleados = useSelector((s: RootState) => s.helpdeskCatalogos.empleados);
  const ubicaciones = useSelector((s: RootState) => s.ubicaciones.ubicaciones);
  const error = useSelector((s: RootState) => s.helpdeskTickets.error);

  useCatalogData(categorias, () => dispatch(getCategorias()));
  useCatalogData(prioridades, () => dispatch(getPrioridades()));
  // Empleados activos del departamento del usuario: la cuenta compartida elige
  // uno y la normal muestra el que ya tiene asociado.
  useCatalogData(empleados, () => dispatch(getEmpleadosHelpdesk()));
  // La ubicación es opcional, pero su selector sale vacío sin esto.
  useCatalogData(ubicaciones, () => dispatch(getUbicaciones()));

  const [idCategoria, setIdCategoria] = useState<number | null>(null);
  const [idSubcategoria, setIdSubcategoria] = useState<number | null>(null);
  const [idTitulo, setIdTitulo] = useState<number | null>(null);
  const [busquedaTitulo, setBusquedaTitulo] = useState('');
  const [idPrioridad, setIdPrioridad] = useState<number | null>(null);
  const [idUbicacion, setIdUbicacion] = useState<number | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);

  // La cuenta normal hereda el empleado de su usuario; la compartida (o la que
  // no tenga empleado) lo elige de la lista de su departamento.
  const empleadoFijoId = user && !user.usuario_compartido ? user.id_empleado ?? null : null;
  const [idEmpleadoSolicitante, setIdEmpleadoSolicitante] = useState<number | null>(empleadoFijoId);

  useEffect(() => {
    if (empleadoFijoId !== null) {
      setIdEmpleadoSolicitante(empleadoFijoId);
    }
  }, [empleadoFijoId]);

  // Los títulos son cacheados por categoría: el fetch solo corre al elegir categoría
  // nueva, no al moverse entre pasos del formulario.
  useEffect(() => {
    if (idCategoria !== null) {
      dispatch(getTitulos(idCategoria));
    }
  }, [dispatch, idCategoria]);

  const titulos = idCategoria === null ? [] : titulosPorCategoria[idCategoria] ?? [];

  // La subcategoría no pide su propio fetch: `getTitulos` aplana los títulos y cada
  // uno ya viaja con `id_subcategoria_ticket` y `nombre_subcategoria`. Se derivan de
  // ahí para no sumar un endpoint ni un paso de red.
  const subcategorias = useMemo(() => {
    const unicas = new Map<number, string>();

    for (const titulo of titulos) {
      if (titulo.id_subcategoria_ticket !== undefined) {
        unicas.set(titulo.id_subcategoria_ticket, titulo.nombre_subcategoria ?? '');
      }
    }

    return [...unicas.entries()]
      .map(([id, nombre]) => ({ id_subcategoria_ticket: id, nombre_subcategoria: nombre }))
      .sort((a, b) => a.nombre_subcategoria.localeCompare(b.nombre_subcategoria));
  }, [titulos]);

  const titulosVisibles = idSubcategoria === null
    ? []
    : titulos.filter(t => t.id_subcategoria_ticket === idSubcategoria);

  const normalizarBusqueda = (texto: string) =>
    texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const titulosFiltrados = useMemo(() => {
    if (busquedaTitulo.trim() === '') {
      return titulosVisibles;
    }

    const termino = normalizarBusqueda(busquedaTitulo);

    return titulosVisibles.filter(t =>
      normalizarBusqueda(t.nombre_titulo_ticket ?? '').includes(termino)
    );
  }, [busquedaTitulo, titulosVisibles]);

  const prioridadElegida = prioridades.find(p => p.id_prioridad_ticket === idPrioridad);
  const categoriaElegida = categorias.find(c => c.id_categoria_ticket === idCategoria);
  const tituloElegido = titulos.find(t => t.id_titulo_ticket === idTitulo);
  const subcategoriaElegida = subcategorias.find(s => s.id_subcategoria_ticket === idSubcategoria);
  const ubicacionElegida = ubicaciones.find(u => u.id_ubicacion === idUbicacion);
  const empleadoElegido = empleados.find(e => e.id_empleado === idEmpleadoSolicitante);
  // La cuenta normal ya trae su empleado en el login; así el nombre se ve de
  // inmediato aunque la lista del departamento todavía no haya cargado.
  const nombreEmpleado = empleadoElegido
    ? nombreCompletoEmpleado(empleadoElegido)
    : user?.empleado
      ? nombreCompletoEmpleado(user.empleado)
      : '';

  // El departamento lo decide el servidor a partir de la categoría; no se envía.
  const departamentoAtencion = categoriaElegida?.departamento_default?.nombre_departamento ?? '';

  // El folio y el NoTicket los genera el servidor; aquí solo se muestra la fecha de captura.
  const fechaActual = formatDateHorasToFrontend(getFechaHoraActual()) ?? '';

  const [pasoActual, setPasoActual] = useState(0);

  const irAnterior = () => setPasoActual((p) => Math.max(0, p - 1));
  const irSiguiente = () => setPasoActual((p) => Math.min(TOTAL_PASSOS - 1, p + 1));

  // El backend exige descripción (mín. 10), empleado, ubicación, categoría, título
  // y prioridad. La subcategoría no se envía: `TicketService` la deduce del título elegido.
  const pasoValido = pasoActual === 0
    ? idCategoria !== null && idSubcategoria !== null && idTitulo !== null
    : pasoActual === 1
      ? descripcion.trim().length >= 10 && idEmpleadoSolicitante !== null && idUbicacion !== null
      : pasoActual === 2
        ? idPrioridad !== null
        : true;

  const handleConfirm = async () => {
    const data: TicketFormData = {
      descripcion_ticket: descripcion.trim(),
      id_categoria_ticket: idCategoria,
      id_titulo_ticket: idTitulo,
      id_prioridad_ticket: idPrioridad,
      id_empleado_solicitante: idEmpleadoSolicitante,
      id_ubicacion: idUbicacion,
      etiquetas: [],
    };

    setEnviando(true);

    const resultado = await dispatch(crearTicket(data));

    setEnviando(false);

    if (crearTicket.fulfilled.match(resultado) && resultado.payload.success) {
      const folio = resultado.payload.ticket?.folio_ticket ?? '';

      await Swal.fire({
        icon: 'success',
        title: 'Ticket creado',
        text: folio === '' ? undefined : `Folio ${folio}. Ya está en "Mis Tickets".`,
        timer: 1600,
        showConfirmButton: false,
      });

      navigate('/helpdesk/mis-tickets');
    } else {
      // El error del backend se queda en el store y se pinta en el resumen; aquí se
      // avisa al instante porque el botón es el final del formulario.
      const mensaje = (resultado.payload as ResultadoTicket | undefined)?.message;

      Swal.fire({
        icon: 'error',
        title: 'No se pudo crear el ticket',
        text: mensaje ?? 'Revise los datos del formulario e intente de nuevo.',
      });
    }
  };

  return (
    <div className='mainDiv_Helpdesk'>

      <div className='helpdeskHeader'>
        <div className='header_Title'>
          <BiSupport className='iconHelpdesk' />
          <h1>Helpdesk</h1>
          <small>(Mesa de Ayuda)</small>
        </div>

        <div className='header_Buttons'>
          <button type='button' className='headerButton' onClick={() => navigate('/helpdesk/mis-tickets')}>Mis Tickets</button>
        </div>
      </div>

      <section className='helpdeskTicket'>
        <form className='ticketForm' onSubmit={(e) => e.preventDefault()}>

          <div className='ticketCarousel'>
            <section className='ticketSection'>

              {/* Encabezado del formulario: va dentro de la caja blanca, encima del
                  encabezado de cada paso */}
              <div className='ticketForm_Title'>
                <h2>Crear un nuevo ticket</h2>
                <p>Complete los pasos para reportar una incidencia. El folio se asigna al confirmar.</p>
              </div>

              {/* Encabezado de la sección: título del paso + contador + flechas */}
              <div className='ticketSection_Header'>
                <h2 className='ticketSection_Title'>{PASSOS_TITULOS[pasoActual]}</h2>

                <div className='ticketSection_Controls'>
                  <span className='ticketStepIndicator'>{pasoActual + 1} / {TOTAL_PASSOS}</span>

                  <div className='ticketArrows'>
                    {pasoActual > 0 && (
                      <button type='button' className='navArrow navArrow_Left' onClick={irAnterior} title='Anterior'>
                        <MdOutlineKeyboardArrowLeft />
                      </button>
                    )}

                    {pasoActual < TOTAL_PASSOS - 1 && (
                      <button type='button' className='navArrow navArrow_Right' onClick={irSiguiente} disabled={!pasoValido} title='Siguiente'>
                        <MdOutlineKeyboardArrowRight />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* --- Paso 1: Clasificación. Categoría, luego subcategoría, luego título.
                  El departamento se muestra solo cuando la categoría lo resuelve. --- */}
              {pasoActual === 0 && (
                <>
                  <div className='ticketRow'>
                    <div className='ticketField'>
                      <label htmlFor='ticket_categoria'>Categoría <span className='required'>*</span></label>
                      <select
                        id='ticket_categoria'
                        value={idCategoria ?? ''}
                        onChange={(e) => {
                          setIdCategoria(e.target.value === '' ? null : Number(e.target.value));
                          // Subcategoría y título cuelgan de la categoría anterior.
                          setIdSubcategoria(null);
                          setIdTitulo(null);
                          setBusquedaTitulo('');
                        }}
                      >
                        <option value=''>Seleccione una categoría</option>
                        {categorias.map(categoria => (
                          <option key={categoria.id_categoria_ticket} value={categoria.id_categoria_ticket}>
                            {categoria.nombre_categoria}
                          </option>
                        ))}
                      </select>
                    </div>

                    {idCategoria !== null && (
                      <div className='ticketField'>
                        <label htmlFor='ticket_subcategoria'>Subcategoría <span className='required'>*</span></label>
                        <select
                          id='ticket_subcategoria'
                          value={idSubcategoria ?? ''}
                          onChange={(e) => {
                            setIdSubcategoria(e.target.value === '' ? null : Number(e.target.value));
                            // El título pertenece a la subcategoría anterior.
                            setIdTitulo(null);
                            setBusquedaTitulo('');
                          }}
                        >
                          <option value=''>Seleccione una subcategoría</option>
                          {subcategorias.map(subcategoria => (
                            <option key={subcategoria.id_subcategoria_ticket} value={subcategoria.id_subcategoria_ticket}>
                              {subcategoria.nombre_subcategoria}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {idSubcategoria !== null && (
                    <div className='ticketField'>
                      <div className='ticketLabelRow'>
                        <label htmlFor='ticket_titulo'>Título <span className='required'>*</span></label>
                        {tituloElegido && (
                          <span className='ticketTituloSeleccionado'>
                            Seleccionado: {tituloElegido.nombre_titulo_ticket}
                          </span>
                        )}
                      </div>
                      <SearchInput
                        id='ticket_titulo'
                        value={busquedaTitulo}
                        onChange={(e) => setBusquedaTitulo(e.target.value)}
                        placeholder='Buscar título…'
                        aria-label='Buscar título'
                        className='ticketTituloBuscador'
                      />
                      {titulosFiltrados.length > 0 && (
                        <ul className='ticketTituloLista' aria-label='Títulos disponibles'>
                          {titulosFiltrados.map(titulo => {
                            const seleccionada = titulo.id_titulo_ticket === idTitulo;

                            return (
                              <li key={titulo.id_titulo_ticket}>
                                <button
                                  type='button'
                                  className={`ticketTituloOpcion ${seleccionada ? 'seleccionada' : ''}`}
                                  onClick={() => setIdTitulo(titulo.id_titulo_ticket ?? null)}
                                  aria-pressed={seleccionada}
                                >
                                  <span>{titulo.nombre_titulo_ticket}</span>
                                  {seleccionada && <MdCheck aria-hidden />}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      {busquedaTitulo.trim() !== '' && titulosFiltrados.length === 0 && (
                        <span className='ticketHint'>
                          Ningún título coincide con «{busquedaTitulo}»
                        </span>
                      )}
                      {busquedaTitulo.trim() === '' && titulosFiltrados.length === 0 && (
                        <span className='ticketHint'>
                          Esta subcategoría no tiene títulos registrados.
                        </span>
                      )}
                    </div>
                  )}

                  {departamentoAtencion !== '' && (
                    <div className='ticketField'>
                      <label htmlFor='ticket_categoria_depto'>Departamento que atenderá</label>
                      <input
                        type='text'
                        id='ticket_categoria_depto'
                        value={departamentoAtencion}
                        readOnly
                        disabled
                      />
                    </div>
                  )}
                </>
              )}

              {/* --- Paso 2: Detalles del Reporte --- */}
              {pasoActual === 1 && (
                <>
                  <div className='ticketField'>
                    <label htmlFor='ticket_empleado'>Empleado <span className='required'>*</span></label>
                    {empleadoFijoId === null ? (
                      <select
                        id='ticket_empleado'
                        value={idEmpleadoSolicitante ?? ''}
                        onChange={(e) => setIdEmpleadoSolicitante(e.target.value === '' ? null : Number(e.target.value))}
                      >
                        <option value=''>Seleccione un empleado</option>
                        {empleados.map(empleado => (
                          <option key={empleado.id_empleado} value={empleado.id_empleado}>
                            {nombreCompletoEmpleado(empleado)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id='ticket_empleado'
                        type='text'
                        value={nombreEmpleado || 'Empleado asociado a tu usuario'}
                        readOnly
                        disabled
                      />
                    )}
                  </div>

                  <div className='ticketField'>
                    <label htmlFor='ticket_descripcion'>Descripción a Detalle del Reporte <span className='required'>*</span></label>
                    <textarea
                      id='ticket_descripcion'
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder='Describe a detalle lo que estás reportando (mínimo 10 caracteres)...'
                      rows={5}
                    />
                  </div>

                  <div className='ticketField'>
                    <label htmlFor='ticket_ubicacion'>Ubicación <span className='required'>*</span></label>
                    <select
                      id='ticket_ubicacion'
                      value={idUbicacion ?? ''}
                      onChange={(e) => setIdUbicacion(e.target.value === '' ? null : Number(e.target.value))}
                    >
                      <option value=''>Seleccione una ubicación</option>
                      {ubicaciones.map(ubicacion => (
                        <option key={ubicacion.id_ubicacion} value={ubicacion.id_ubicacion}>
                          {ubicacion.nombre_ubicacion}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* --- Paso 3: Prioridad de Atención (catálogo del backend) --- */}
              {pasoActual === 2 && (
                <>
                  <div className='priorityGroup'>
                    {prioridades.map(prioridad => (
                      <label key={prioridad.id_prioridad_ticket} className={`priorityOption ${idPrioridad === prioridad.id_prioridad_ticket ? 'selected' : ''}`}>
                        <input
                          type='radio'
                          name='prioridad'
                          value={prioridad.id_prioridad_ticket}
                          checked={idPrioridad === prioridad.id_prioridad_ticket}
                          onChange={() => setIdPrioridad(prioridad.id_prioridad_ticket ?? null)}
                        />
                        <span>{prioridad.nombre_prioridad}</span>
                      </label>
                    ))}
                  </div>

                  {/* Diccionario del catálogo: ayuda a clasificar el ticket sin adivinar. */}
                  <div className='priorityInfo'>
                    {prioridades.map(prioridad => (
                      <div key={prioridad.id_prioridad_ticket} className='priorityInfoItem'>
                        <span className='priorityInfoName'>
                          <span className='priorityInfoDot' style={{ backgroundColor: prioridad.color ?? '#6C757D' }} />
                          {prioridad.nombre_prioridad}
                        </span>
                        <p>{prioridad.descripcion_prioridad}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* --- Paso 4: Resumen del Ticket --- */}
              {pasoActual === 3 && (
                <div className='ticketSummary'>

                  <p className='ticketSummary_Intro'>
                    Revisa la información antes de confirmar. Si algo no es correcto, regresa al paso correspondiente.
                  </p>

                  <div className='ticketSummary_Block'>
                    <h3>Información del Solicitante</h3>
                    <div className='ticketSummary_Grid'>
                      <div className='ticketSummary_Item'>
                        <span>Usuario</span>
                        <strong>{user?.nombre_usuario ?? '—'}</strong>
                      </div>
                      <div className='ticketSummary_Item'>
                        <span>Empleado</span>
                        <strong>{nombreEmpleado || '—'}</strong>
                      </div>
                      <div className='ticketSummary_Item'>
                        <span>Departamento</span>
                        <strong>{departamento ?? '—'}</strong>
                      </div>
                      <div className='ticketSummary_Item ticketSummary_Fecha'>
                        <span>Fecha</span>
                        <strong>{fechaActual || '—'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className='ticketSummary_Block'>
                    <h3>Clasificación del Reporte</h3>
                    <div className='ticketSummary_Grid'>
                      <div className='ticketSummary_Item'>
                        <span>Categoría</span>
                        <strong>{categoriaElegida?.nombre_categoria ?? '—'}</strong>
                      </div>
                      <div className='ticketSummary_Item'>
                        <span>Subcategoría</span>
                        <strong>{subcategoriaElegida?.nombre_subcategoria ?? '—'}</strong>
                      </div>
                      <div className='ticketSummary_Item'>
                        <span>Título</span>
                        <strong>{tituloElegido?.nombre_titulo_ticket ?? '—'}</strong>
                      </div>
                      <div className='ticketSummary_Item'>
                        <span>Departamento que atenderá</span>
                        <strong>{departamentoAtencion || '—'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className='ticketSummary_Block'>
                    <h3>Detalles del Reporte</h3>
                    <div className='ticketSummary_Grid'>
                      <div className='ticketSummary_Item'>
                        <span>Ubicación</span>
                        <strong>{ubicacionElegida?.nombre_ubicacion ?? '—'}</strong>
                      </div>
                      <div className='ticketSummary_Item ticketSummary_Full'>
                        <span>Descripción a Detalle</span>
                        <strong className='ticketSummary_Descripcion'>{descripcion || '—'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className='ticketSummary_Block'>
                    <h3>Prioridad de Atención</h3>
                    <div className='ticketSummary_Grid'>
                      <div className='ticketSummary_Item'>
                        <span>Prioridad</span>
                        <strong className='priorityBadge'>
                          <span className='priorityBadge_Dot' style={{ backgroundColor: prioridadElegida?.color ?? '#6C757D' }} />
                          {prioridadElegida?.nombre_prioridad ?? '—'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {error && <p className='formError'>{error}</p>}

                  <button type='button' className='confirmButton' onClick={handleConfirm} disabled={enviando}>
                    {enviando ? 'Enviando...' : 'Confirmar Ticket'}
                  </button>
                </div>
              )}

            </section>
          </div>

        </form>
      </section>

    </div>
  );
};

export default Helpdesk;