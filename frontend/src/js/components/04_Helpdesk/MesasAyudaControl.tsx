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

// Permissions
import { hasActionPermission } from '@/utils/permissions';

// Utils
import { veTodasLasMesas } from '@/utils/helpdesk';

// Icons
import { BiSupport } from 'react-icons/bi';
import { MdCategory } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';

// Styles
import '@styles/04_Helpdesk/MesasAyudaControl.css';

/**
 * Selección de categoría para la mesa de ayuda.
 *
 * En Helpdesk el departamento y la categoría son la misma cosa para el usuario:
 * `Departamentos.atiende_helpdesk` marca qué carpetas atienden tickets, y cada
 * categoría apunta a su departamento con `id_departamento_default`. Por eso las
 * tarjetas son de **categoría** y no de departamento: la tarjeta es lo que trae el
 * `id_categoria_ticket` con el que se filtra el listado, y de él cuelga la
 * subcategoría. Y la categoría es la que manda: un ticket de la categoría "Sistemas"
 * entra en la cola de Sistemas sin importar qué área lo abrió.
 *
 * La tarjeta se rotula con el nombre del departamento y se muestra la categoría,
 * que es lo que el técnico pide ("Sistemas", "Servicios Generales") y a la vez
 * queda claro cuál está eligiendo.
 *
 * Quién ve qué tarjetas:
 *
 * - Alcance global (`helpdesk.tickets`): todas las categorías activas. Lo tienen
 *   `Admin`, Dirección y Subdirección; ver todas las áreas es supervisar, no operar.
 * - Un técnico solo ve las de sus departamentos, y para que le aparezcan hacen
 *   falta las dos marcas: que el usuario atienda Helpdesk
 *   (`Usuarios.atiende_helpdesk`) y que el departamento lo atienda
 *   (`Departamentos.atiende_helpdesk`). El backend manda la lista ya filtrada en
 *   `departamentos_atiende`.
 * - Sin ninguna de las dos, ninguna tarjeta.
 *
 * El recorte se aplica dos veces y en los dos lados, a propósito: aquí decide qué
 * tarjetas se ven, y `TicketService::scopeVisibleA` vuelve a recortar cada lista.
 * Que las tarjetas no dejen ver un ticket no debe depender de que esta pantalla
 * acertara.
 *
 * Ojo con el alcance de "ve todo": lo decide el alcance global
 * (`TicketService::veTodasLasMesas`), no el nombre del rol.
 */
const MesaAyuda: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((s: RootState) => s.auth.user as User | null | undefined);
  const permisos = useSelector((s: RootState) => s.auth.permissions);
  const alcances = useSelector((s: RootState) => s.auth.alcances);
  const categorias = useSelector((s: RootState) => s.helpdeskCatalogos.categorias);

  // La pantalla se abre directo por URL, sin pasar antes por la lista: sin estas
  // llamadas los catálogos llegan vacíos y se mostraría el "no hay nada" cuando en
  // realidad es que aún no se ha pedido nada.
  useCatalogData(categorias, () => dispatch(getCategorias()));

  // Ver todas las categorías lo decide el alcance global, no el nombre del rol.
  const administra = veTodasLasMesas(alcances, 'tickets');
  const puedeLeerMesa = administra || hasActionPermission(permisos, 'helpdesk.tickets', 'lectura');

  const departamentosAtiende = user?.departamentos_atiende?.map(d => d.id_departamento) ?? [];
  const atiendeComoTecnico = user?.atiende_helpdesk === true && departamentosAtiende.length > 0;

  // Un usuario marcado que cae en un departamento que no atiende Helpdesk no tiene
  // tarjetas: ni la lista ni `TicketService` le darían tickets de esa categoría, así
  // que la tarjeta sería una lista vacía.
  const visibles = administra
    ? categorias
    : atiendeComoTecnico
      ? categorias.filter(c => c.id_departamento_default != null && departamentosAtiende.includes(c.id_departamento_default))
      : [];

  /**
   * Por qué no se ve nada, en el orden que toca arreglarlo.
   *
   * Se enumeran los casos porque el síntoma es el mismo —una lista vacía— y la
   * causa no: una categoría sin departamento asignado es el caso que más confunde,
   * porque en Configuración se ve completa y parece que debería aparecer.
   */
  const motivoSinTarjetas = administra
    ? 'No hay categorías activas en el catálogo'
    : !atiendeComoTecnico
      ? 'Su usuario o su departamento no están marcados para atender Helpdesk'
      : categorias.length === 0
        ? 'No hay categorías activas en el catálogo'
        : 'Ninguna categoría tiene asignado su departamento, así que no se puede saber cuáles le tocan. Asígnelas en Helpdesk → Configuración → Clasificaciones.';

  const abrir = (idCategoria: number) => {
    // El filtro viaja en la URL y no en el store para que el listado sea
    // compartible y sobreviva a un F5. `HelpdeskAdmin` lo lee al montar.
    navigate(`/helpdesk/admin?categoria=${idCategoria}`);
  };

  const encabezado = (
    <header className='mesaEncabezado'>
      <h1><BiSupport className='iconHelpdesk' /> Mesas de Ayuda</h1>
      <p>Seleccione el área para ver los tickets que le corresponden</p>
    </header>
  );

  if (!puedeLeerMesa) {
    return (
      <div className='mainDiv_MesaAyuda'>
        {encabezado}
        <hr />

        <div className='noEntities'>
          <FiAlertTriangle />
          <p>No tiene permiso para consultar la mesa de ayuda</p>
          <FiAlertTriangle />
        </div>
      </div>
    );
  }

  return (
    <div className='mainDiv_MesaAyuda'>
      {encabezado}

      <hr />

      {visibles.length === 0 ? (
        <div className='noEntities'>
          <FiAlertTriangle />
          <p>{motivoSinTarjetas}</p>
          <FiAlertTriangle />
        </div>
      ) : (
        <section className='mesaMenu'>
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
      )}
    </div>
  );
};

export default MesaAyuda;