import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

import { AppDispatch, RootState } from '@/store/store';
import type { HelpdeskConteoCatalogo } from '@/@types/HelpdeskTypes/ticketTypes';
import { getHelpdeskDashboard } from '@/store/helpdesk/Dashboard/helpdeskDashboardActions';
import { getCategorias } from '@/store/helpdesk/Catalogos/catalogosActions';
import { useCatalogData } from '@/hooks/useCatalogData';
import TicketCard from './TicketCard';
import DashboardControl from './DashboardControl';

import { FaArrowCircleRight } from 'react-icons/fa';

import '@styles/04_Helpdesk/DashboardHelpdesk.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

/**
 * Paleta de series categóricas: saturados y con los tonos bien separados, alternando cálidos y
 * fríos para que dos barras vecinas nunca se parezcan. Los conteos de catálogo (estatus,
 * prioridad) traen su propio color y no pasan por aquí.
 *
 * shortcut: 14 colores; con más de 14 elementos distintos en una serie se repiten, subir la
 * paleta si llega a molestar.
 */
const PALETA = [
  '#dc2626', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#db2777',
  '#65a30d', '#ea580c', '#4f46e5', '#0d9488', '#c026d3', '#ca8a04', '#475569',
];

/**
 * Color de cada elemento de una serie categórica (títulos, técnicos, áreas, solicitantes).
 *
 * Va por **posición** en la serie y no por nombre: así la paleta puede alternar cálidos y fríos
 * y dos barras vecinas nunca caen en el mismo tono. El precio es que el color sigue al puesto en
 * la lista —que va de más a menos tickets— y no a la persona.
 */
const coloresDe = (items: HelpdeskConteoCatalogo[]): string[] => items.map((item, i) => item.color || PALETA[i % PALETA.length]);

/** `?categoria=` viaja como texto; vacío o no numérico se lee como "sin mesa". */
const leerIdCategoria = (bruto: string | null): number | null => {
  const n = Number(bruto);

  return bruto !== null && bruto !== '' && Number.isInteger(n) && n > 0 ? n : null;
};

/** Barra vertical: pocas categorías cortas (prioridades). */
const opcionesBarra = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
};

/** Barra horizontal: los títulos y los nombres de técnico son largos y en vertical se pisan. */
const opcionesBarraHorizontal = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  plugins: { legend: { display: false } },
  scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
};

/** Pastel: sin ejes y con la leyenda abajo, que es lo que ocupa el ancho de la tarjeta. */
const opcionesPie = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' as const } },
};

const DashboardHelpdesk: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const dashboard = useSelector((state: RootState) => state.helpdeskDashboard.dashboard);
  const loading = useSelector((state: RootState) => state.helpdeskDashboard.loading);
  const error = useSelector((state: RootState) => state.helpdeskDashboard.error);
  const categorias = useSelector((state: RootState) => state.helpdeskCatalogos.categorias);

  useCatalogData(categorias, () => dispatch(getCategorias()));

  /**
   * El alcance viaja en la URL, como en la mesa de ayuda: **sin** `?categoria` se
   * elige la mesa (las tarjetas de `DashboardControl`), con un id se pinta el
   * dashboard de esa mesa y con `todas` la vista global del Helpdesk.
   */
  const paramCategoria = searchParams.get('categoria');
  const mostrarSeleccion = paramCategoria === null;
  const verTodas = paramCategoria === 'todas';
  const idCategoria = leerIdCategoria(paramCategoria);

  useEffect(() => {
    if (mostrarSeleccion) {
      return;
    }

    dispatch(getHelpdeskDashboard(
      verTodas || idCategoria === null ? undefined : { id_categoria_ticket: idCategoria }
    ));
  }, [dispatch, idCategoria, verTodas, mostrarSeleccion]);

  const categoriaActual = categorias.find(c => c.id_categoria_ticket === idCategoria) ?? null;

  // Sin mesa elegida, la pantalla es la selección: mismas tarjetas que la mesa de ayuda.
  if (mostrarSeleccion) {
    return <DashboardControl />;
  }

  const hayDatos = dashboard !== null && dashboard.total_tickets > 0;
  const alcance = verTodas
    ? 'Todas las mesas de ayuda'
    : `Mesa de ${categoriaActual?.nombre_categoria ?? 'ayuda'}`;

  return (
    <div className='mainDiv_DashboardHelpdesk'>

      <div className='dhHeader'>
        <div className='returnButton'>
          <button type='button' onClick={() => navigate('/helpdesk/dashboard')}>
            <FaArrowCircleRight className='iconAdd' style={{ transform: 'rotate(180deg)' }} /> Volver
          </button>
        </div>

        <h1>Métricas del Helpdesk</h1>
        <span className='dhAlcance'>{alcance}</span>
        {loading && <span className='dhCargando'>Cargando...</span>}
      </div>

      {error && <p className='formError'>{error}</p>}

      <div className='ticketCards'>
        <TicketCard etiqueta='Tickets totales' valor={dashboard?.total_tickets ?? 0} />
        <TicketCard etiqueta='Reabiertos' valor={dashboard?.tickets_reabiertos ?? 0} />
        <TicketCard etiqueta='Cerrados' valor={dashboard?.por_estatus.filter(e => e.nombre === 'Cerrado').reduce((suma, e) => suma + e.total, 0) ?? 0} />
        <TicketCard
          etiqueta='Cumplimiento SLA'
          valor={dashboard?.sla.porcentaje_cumplimiento != null ? `${dashboard.sla.porcentaje_cumplimiento}%` : '—'}
        />
        <TicketCard etiqueta='Tickets medibles' valor={dashboard?.sla.total_medibles ?? 0} />
        <TicketCard etiqueta='Con error de proveedor' valor={dashboard?.por_error_proveedor.reduce((suma, p) => suma + p.total, 0) ?? 0} />
      </div>

      {!loading && !hayDatos && (
        <p className='dhSinDatos'>
          {verTodas || categoriaActual === null
            ? 'Todavía no hay tickets para graficar.'
            : `La mesa de ${categoriaActual.nombre_categoria} no tiene tickets para graficar.`}
        </p>
      )}

      {hayDatos && (
        <div className='dhCharts'>

          <section className='dhPanel dhPanel--estatus'>
            <h2>Tickets por estatus</h2>
            <div className='dhChart'>
              <Pie
                data={{
                  labels: dashboard!.por_estatus.map(e => e.nombre),
                  datasets: [{
                    data: dashboard!.por_estatus.map(e => e.total),
                    backgroundColor: coloresDe(dashboard!.por_estatus),
                    borderColor: '#ffffff',
                    borderWidth: 2,
                  }],
                }}
                options={opcionesPie}
              />
            </div>
          </section>

          <section className='dhPanel dhPanel--prioridad'>
            <h2>Tickets por prioridad</h2>
            {/* El color viene del catálogo: refleja la urgencia, de menor a mayor. */}
            <div className='dhChart'>
              <Bar
                data={{
                  labels: dashboard!.por_prioridad.map(p => p.nombre),
                  datasets: [{
                    label: 'Tickets',
                    data: dashboard!.por_prioridad.map(p => p.total),
                    backgroundColor: coloresDe(dashboard!.por_prioridad),
                    borderWidth: 1,
                    borderRadius: 4,
                  }],
                }}
                options={opcionesBarra}
              />
            </div>
          </section>

          <section className='dhPanel dhPanel--proveedor'>
            <h2>Tickets con error de proveedor</h2>

            {dashboard!.por_error_proveedor.length === 0 ? (
              <p className='dhSinDatos'>
                {verTodas || categoriaActual === null
                  ? 'Ningún ticket está marcado como error de proveedor.'
                  : `Ningún ticket de ${categoriaActual.nombre_categoria} está marcado como error de proveedor.`}
              </p>
            ) : (
              <div className='dhChart'>
                <Pie
                  data={{
                    labels: dashboard!.por_error_proveedor.map(p => p.nombre),
                    datasets: [{
                      data: dashboard!.por_error_proveedor.map(p => p.total),
                      backgroundColor: coloresDe(dashboard!.por_error_proveedor),
                      borderColor: '#ffffff',
                      borderWidth: 2,
                    }],
                  }}
                  options={opcionesPie}
                />
              </div>
            )}
          </section>

          <section className='dhPanel dhPanel--ancho dhPanel--titulo'>
            <h2>Tickets por título</h2>
            <p className='dhNota'>Los diez títulos con más tickets.</p>
            <div className='dhChart dhChart--alto'>
              <Bar
                data={{
                  labels: dashboard!.por_titulo.map(t => t.nombre),
                  datasets: [{
                    label: 'Tickets',
                    data: dashboard!.por_titulo.map(t => t.total),
                    backgroundColor: coloresDe(dashboard!.por_titulo),
                    borderWidth: 1,
                    borderRadius: 4,
                  }],
                }}
                options={opcionesBarraHorizontal}
              />
            </div>
          </section>

          <section className='dhPanel dhPanel--medio dhPanel--tecnico'>
            <h2>Tickets por técnico</h2>
            <p className='dhNota'>Por responsable asignado.</p>
            <div className='dhChart dhChart--alto'>
              <Bar
                data={{
                  labels: dashboard!.por_responsable.map(t => t.nombre),
                  datasets: [{
                    label: 'Tickets',
                    data: dashboard!.por_responsable.map(t => t.total),
                    backgroundColor: coloresDe(dashboard!.por_responsable),
                    borderWidth: 1,
                    borderRadius: 4,
                  }],
                }}
                options={opcionesBarraHorizontal}
              />
            </div>
          </section>

          <section className='dhPanel dhPanel--medio dhPanel--departamento'>
            <h2>Tickets por departamento</h2>
            <p className='dhNota'>Por el área de quien abrió el ticket.</p>
            <div className='dhChart dhChart--alto'>
              <Bar
                data={{
                  labels: dashboard!.por_departamento.map(d => d.nombre),
                  datasets: [{
                    label: 'Tickets',
                    data: dashboard!.por_departamento.map(d => d.total),
                    backgroundColor: coloresDe(dashboard!.por_departamento),
                    borderWidth: 1,
                    borderRadius: 4,
                  }],
                }}
                options={opcionesBarraHorizontal}
              />
            </div>
          </section>

          <section className='dhPanel dhPanel--ancho dhPanel--solicitante'>
            <h2>Tickets por usuario</h2>
            <p className='dhNota'>Los diez solicitantes con más tickets abiertos.</p>
            <div className='dhChart dhChart--alto'>
              <Bar
                data={{
                  labels: dashboard!.por_solicitante.map(u => u.nombre),
                  datasets: [{
                    label: 'Tickets',
                    data: dashboard!.por_solicitante.map(u => u.total),
                    backgroundColor: coloresDe(dashboard!.por_solicitante),
                    borderWidth: 1,
                    borderRadius: 4,
                  }],
                }}
                options={opcionesBarraHorizontal}
              />
            </div>
          </section>

        </div>
      )}

    </div>
  );
};

export default DashboardHelpdesk;
