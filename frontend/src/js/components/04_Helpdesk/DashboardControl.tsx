// Bibliotecas
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Types
import type { User } from '@/@types/mainTypes';

// Store
import { AppDispatch, RootState } from '@/store/store';
import { getCategorias } from '@/store/helpdesk/Catalogos/catalogosActions';

// Hooks
import { useCatalogData } from '@/hooks/useCatalogData';

// Utils
import { veTodasLasMesas } from '@/utils/helpdesk';

// Icons
import { MdCategory } from 'react-icons/md';
import { MdQueryStats } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';

// Styles
import '@styles/04_Helpdesk/DashboardControl.css';

/**
 * Selección de mesa para el dashboard.
 *
 * Es la entrada del dashboard: mismas tarjetas y mismas reglas que
 * `MesasAyudaControl`, pero en vez de abrir la lista de tickets abre las métricas
 * de esa mesa. La categoría viaja en la URL (`?categoria=`), igual que en la mesa
 * de ayuda, para que el dashboard sea compartible y sobreviva a un F5.
 *
 * Quién ve qué tarjetas: el administrador todas; un técnico solo la de su
 * departamento, y para que le aparezca hacen falta las dos marcas (`Usuarios` y
 * `Departamentos.atiende_helpdesk`). Es el mismo recorte que aplica la mesa.
 */
const DashboardControl: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((s: RootState) => s.auth.user as User | null | undefined);
  const alcances = useSelector((s: RootState) => s.auth.alcances);
  const categorias = useSelector((s: RootState) => s.helpdeskCatalogos.categorias);

  useCatalogData(categorias, () => dispatch(getCategorias()));

  // Ver todas las mesas lo decide el alcance global, no el rol ni un permiso
  // `control`: Admin, Dirección y Subdirección lo tienen por override.
  const administra = veTodasLasMesas(alcances, 'reportes');

  const departamentosAtiende = user?.departamentos_atiende?.map(d => d.id_departamento) ?? [];
  const atiendeComoTecnico = user?.atiende_helpdesk === true && departamentosAtiende.length > 0;

  const visibles = administra
    ? categorias
    : atiendeComoTecnico
      ? categorias.filter(c => c.id_departamento_default != null && departamentosAtiende.includes(c.id_departamento_default))
      : [];

  const motivoSinTarjetas = administra
    ? 'No hay categorías activas en el catálogo'
    : !atiendeComoTecnico
      ? 'Su usuario o su departamento no están marcados para atender Helpdesk'
      : categorias.length === 0
        ? 'No hay categorías activas en el catálogo'
        : 'Ninguna categoría tiene asignado su departamento, así que no se puede saber cuáles le tocan. Asígnelas en Helpdesk → Configuración → Clasificaciones.';

  const abrir = (idCategoria: number | 'todas') => {
    // El alcance viaja en la URL, igual que en la mesa de ayuda, para que el
    // dashboard sea compartible y sobreviva a un F5.
    navigate(`/helpdesk/dashboard?categoria=${idCategoria}`);
  };

  return (
    <div className='mainDiv_DashboardControl'>
      <header className='dashboardEncabezado'>
        <h1><MdQueryStats className='iconHelpdesk' /> Dashboard del Helpdesk</h1>
        <p>Seleccione el área para ver las métricas de esa mesa de ayuda</p>
      </header>

      <hr />

      <section className='mesaMenu'>
        {/* La vista global es del administrador, igual que en la mesa: una jefatura
            solo mira la suya, y `scopeVisibleA` recorta sus métricas igual. */}
        {administra && (
          <button type='button' className='divOption divOption_Todas' onClick={() => abrir('todas')}>
            <MdQueryStats className='iconFiltro' />
            <h2>Todas las mesas</h2>
            <p>El Helpdesk completo, sin acotar por categoría</p>
          </button>
        )}

        {visibles.map(categoria => (
          <button
            key={categoria.id_categoria_ticket}
            type='button'
            className='divOption'
            onClick={() => abrir(categoria.id_categoria_ticket as number)}
          >
            <MdCategory className='iconFiltro' />
            <h2>{categoria.departamento_default?.nombre_departamento ?? categoria.nombre_categoria}</h2>
            <p>{categoria.nombre_categoria}</p>
          </button>
        ))}
      </section>

      {visibles.length === 0 && (
        <div className='noEntities'>
          <FiAlertTriangle />
          <p>{motivoSinTarjetas}</p>
          <FiAlertTriangle />
        </div>
      )}
    </div>
  );
};

export default DashboardControl;
