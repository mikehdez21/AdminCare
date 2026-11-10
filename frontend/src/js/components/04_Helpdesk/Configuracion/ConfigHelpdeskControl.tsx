import React, { useState } from 'react';

// Componentes
import ClasificacionControl from './Clasificacion/ClasificacionControl';
import PrioridadesControl from './Prioridades/PrioridadesControl';
import SLAControl from './SLA/SLAControl';
import EtiquetasControlHelpdesk from './Etiquetas/EtiquetasControlHelpdesk';
import EstatusControl from './Estatus/EstatusControl';
import ProveedoresErrorControl from './ProveedoresError/ProveedoresErrorControl';
import SistemasProveedorControl from './SistemasProveedor/SistemasProveedorControl';
import ModulosSIHOControl from './ModulosSIHO/ModulosSIHOControl';

// Icons
import { FaArrowCircleRight } from 'react-icons/fa';
import { MdCategory, MdOutlineLowPriority, MdTimer, MdLabelOutline, MdToggleOn, MdOutlineSupportAgent, MdOutlineDevices, MdOutlineWidgets } from 'react-icons/md';

// Styles
import '@styles/04_Helpdesk/Configuracion/ConfigHelpdeskControl.css';

type Seccion = 'clasificacion' | 'prioridades' | 'sla' | 'etiquetas' | 'estatus' | 'proveedores' | 'sistemas' | 'modulos' | null;

const OPCIONES: { clave: Seccion; titulo: string; descripcion: string; icono: React.ReactNode }[] = [
  {
    clave: 'clasificacion',
    titulo: 'Clasificaciones de Tickets',
    descripcion: 'Categorías, subcategorías y títulos que usa el solicitante al abrir un ticket',
    icono: <MdCategory className='iconFiltro' />,
  },
  {
    clave: 'prioridades',
    titulo: 'Prioridades del Ticket',
    descripcion: 'Niveles que ordenan los tickets y definen contra qué SLA se mide',
    icono: <MdOutlineLowPriority className='iconFiltro' />,
  },
  {
    clave: 'sla',
    titulo: 'Niveles de SLA',
    descripcion: 'Tiempos de respuesta y resolución por prioridad',
    icono: <MdTimer className='iconFiltro' />,
  },
  {
    clave: 'etiquetas',
    titulo: 'Etiquetas para los Tickets',
    descripcion: 'Etiquetas que se asignan a los tickets para clasificarlos',
    icono: <MdLabelOutline className='iconFiltro' />,
  },
  {
    clave: 'estatus',
    titulo: 'Estatus de los Tickets',
    descripcion: 'Estados del flujo y su orden, incluido cuál es el estado final',
    icono: <MdToggleOn className='iconFiltro' />,
  },
  {
    clave: 'proveedores',
    titulo: 'Proveedores de Error',
    descripcion: 'Proveedores que pueden causar un error y a quién le toca resolverlo.',
    icono: <MdOutlineSupportAgent className='iconFiltro' />,
  },
  {
    clave: 'sistemas',
    titulo: 'Sistemas de Proveedor',
    descripcion: 'Sistemas que ofrece cada proveedor',
    icono: <MdOutlineDevices className='iconFiltro' />,
  },
  {
    clave: 'modulos',
    titulo: 'Módulos de SIHO',
    descripcion: 'Módulos del sistema, para el desplegable de un error de proveedor',
    icono: <MdOutlineWidgets className='iconFiltro' />,
  },
];

/**
 * Padre de la Configuración del Helpdesk.
 *
 * No carga datos ni define tipos de columna: eso es trabajo de cada control, que
 * pide solo lo que necesita. Aquí solo se decide qué sección está abierta, igual
 * que en `ConfigContabilidadControl`.
 */
const HelpdeskConfiguracion: React.FC = () => {
  const [seccion, setSeccion] = useState<Seccion>(null);

  const volver = () => setSeccion(null);

  const encabezado = (titulo: string) => (
    <>
      <header className='configEncabezado'>
        <div className='returnButton'>
          <button type='button' onClick={volver}>
            <FaArrowCircleRight className='iconAdd' style={{ transform: 'rotate(180deg)' }} /> Volver
          </button>
        </div>

        <h1>{titulo}</h1>
      </header>

      <hr />
    </>
  );

  if (seccion) {
    return (
      <div className='mainDiv_HelpdeskConfiguracion'>
        {encabezado(OPCIONES.find((o) => o.clave === seccion)?.titulo ?? 'Configuración')}

        <div className='sectionContent'>
          {seccion === 'clasificacion' && <ClasificacionControl />}
          {seccion === 'prioridades' && <PrioridadesControl />}
          {seccion === 'sla' && <SLAControl />}
          {seccion === 'etiquetas' && <EtiquetasControlHelpdesk />}
          {seccion === 'estatus' && <EstatusControl />}
          {seccion === 'proveedores' && <ProveedoresErrorControl />}
          {seccion === 'sistemas' && <SistemasProveedorControl />}
          {seccion === 'modulos' && <ModulosSIHOControl />}
        </div>
      </div>
    );
  }

  return (
    <div className='mainDiv_HelpdeskConfiguracion'>
      <header className='configMainEncabezado'>
        <h1>Configuración - Helpdesk</h1>
      </header>

      <hr />

      {/* Las tarjetas son botones: se abren con Enter igual que con el ratón. */}
      <section className='configMenu'>
        {OPCIONES.map((opcion) => (
          <button key={opcion.clave} type='button' className='divOption' onClick={() => setSeccion(opcion.clave)}>
            {opcion.icono}
            <h2>{opcion.titulo}</h2>
            <p>{opcion.descripcion}</p>
          </button>
        ))}
      </section>
    </div>
  );
};

export default HelpdeskConfiguracion;