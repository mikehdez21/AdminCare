import type {
  CategoriaTicketPayload,
  EsquemaNivel,
  NivelClasificacion,
  SubcategoriaTicketPayload,
  TituloTicketPayload,
} from '@/@types/HelpdeskTypes/configuracionTypes';
import type { HelpdeskDepartamento } from '@/@types/HelpdeskTypes/ticketTypes';
import type { AppDispatch } from '@/store/store';
import {
  actualizarCategoria,
  actualizarSubcategoria,
  actualizarTitulo,
  crearCategoria,
  crearSubcategoria,
  crearTitulo,
  eliminarCategoria,
  eliminarSubcategoria,
  eliminarTitulo,
  getConfigCategorias,
  getConfigSubcategorias,
  getConfigTitulos,
} from '@/store/helpdesk/Configuracion/configuracionActions';

/**
 * Los tres niveles de la clasificación se administran con los mismos tres
 * componentes (alta, edición y baja). Este módulo es lo único que sabe qué
 * cambia entre un nivel y otro: columnas, textos y thunks.
 *
 * Existe para que `AddClasificacion`, `EditClasificacion` y
 * `DeleteClasificacion` no repitan el mismo `switch` de tres ramas. Los tipos
 * viven en `@/@types/HelpdeskTypes/configuracionTypes`.
 */

const CATEGORIA: EsquemaNivel = {
  idCampo: 'id_categoria_ticket',
  nombreCampo: 'nombre_categoria',
  singular: 'Categoría',
  plural: 'Categorías',
  campos: [
    { nombre: 'nombre_categoria', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 150 },
    { nombre: 'descripcion_categoria', etiqueta: 'Descripción', tipo: 'area', max: 2000 },
    { nombre: 'id_departamento_default', etiqueta: 'Departamento que atiende', tipo: 'seleccion', opciones: [] },
    { nombre: 'estatus_activo', etiqueta: 'Activa', tipo: 'interruptor', valorInicial: true },
  ],
};

const SUBCATEGORIA: EsquemaNivel = {
  idCampo: 'id_subcategoria_ticket',
  nombreCampo: 'nombre_subcategoria',
  singular: 'Subcategoría',
  plural: 'Subcategorías',
  padreCampo: 'id_categoria_ticket',
  campos: [
    { nombre: 'nombre_subcategoria', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 150 },
    { nombre: 'descripcion_subcategoria', etiqueta: 'Descripción', tipo: 'area', max: 2000 },
    // `No` = actividad interna del personal que atiende tickets (administrativa u
    // operativa): no es una solicitud de alguien de fuera.
    { nombre: 'es_publico', etiqueta: 'Pública (No = actividad interna)', tipo: 'interruptor', valorInicial: true },
    { nombre: 'estatus_activo', etiqueta: 'Activa', tipo: 'interruptor', valorInicial: true },
  ],
};

const TITULO: EsquemaNivel = {
  idCampo: 'id_titulo_ticket',
  nombreCampo: 'nombre_titulo_ticket',
  singular: 'Título de ticket',
  plural: 'Títulos de ticket',
  padreCampo: 'id_subcategoria_ticket',
  campos: [
    { nombre: 'nombre_titulo_ticket', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 150 },
    { nombre: 'descripcion_titulo_ticket', etiqueta: 'Descripción', tipo: 'area', max: 2000 },
    { nombre: 'estatus_activo', etiqueta: 'Activo', tipo: 'interruptor', valorInicial: true },
  ],
};

/**
 * Solo el nivel categoría depende del listado de departamentos, y se inyecta
 * para que este módulo no lea el store.
 */
export function esquemaDe(nivel: NivelClasificacion, departamentos: HelpdeskDepartamento[] = []): EsquemaNivel {
  if (nivel === 'subcategoria') return SUBCATEGORIA;
  if (nivel === 'titulo') return TITULO;

  return {
    ...CATEGORIA,
    campos: CATEGORIA.campos.map((campo) =>
      campo.tipo === 'seleccion'
        ? { ...campo, opciones: departamentos.map((d) => ({ valor: d.id_departamento ?? 0, texto: d.nombre_departamento })) }
        : campo
    ),
  };
}

/**
 * El formulario se arma desde `EsquemaNivel`, o sea un `Record<string, unknown>`
 * genérico, mientras cada thunk espera su payload concreto. TypeScript exige pasar
 * por `unknown` en esa conversión; los nombres de campo son responsabilidad del
 * esquema, no de estas funciones.
 */
function comoPayload<P>(cuerpo: Record<string, unknown>): P {
  return cuerpo as unknown as P;
}

/**
 * Los tres niveles comparten los mismos verbos, así que se resuelven en un solo
 * lugar en vez de repetir el `switch` en cada modal.
 */
export function accionesDe(nivel: NivelClasificacion) {
  if (nivel === 'categoria') {
    return {
      crear: (d: AppDispatch, cuerpo: Record<string, unknown>) => d(crearCategoria(comoPayload<CategoriaTicketPayload>(cuerpo))).unwrap(),
      actualizar: (d: AppDispatch, id: number, cuerpo: Record<string, unknown>) => d(actualizarCategoria({ id, cuerpo: comoPayload<CategoriaTicketPayload>(cuerpo) })).unwrap(),
      eliminar: (d: AppDispatch, id: number) => d(eliminarCategoria(id)).unwrap(),
      recargar: (d: AppDispatch) => d(getConfigCategorias()),
    };
  }

  if (nivel === 'subcategoria') {
    return {
      crear: (d: AppDispatch, cuerpo: Record<string, unknown>) => d(crearSubcategoria(comoPayload<SubcategoriaTicketPayload>(cuerpo))).unwrap(),
      actualizar: (d: AppDispatch, id: number, cuerpo: Record<string, unknown>) => d(actualizarSubcategoria({ id, cuerpo: comoPayload<SubcategoriaTicketPayload>(cuerpo) })).unwrap(),
      eliminar: (d: AppDispatch, id: number) => d(eliminarSubcategoria(id)).unwrap(),
      recargar: (d: AppDispatch) => d(getConfigSubcategorias()),
    };
  }

  return {
    crear: (d: AppDispatch, cuerpo: Record<string, unknown>) => d(crearTitulo(comoPayload<TituloTicketPayload>(cuerpo))).unwrap(),
    actualizar: (d: AppDispatch, id: number, cuerpo: Record<string, unknown>) => d(actualizarTitulo({ id, cuerpo: comoPayload<TituloTicketPayload>(cuerpo) })).unwrap(),
    eliminar: (d: AppDispatch, id: number) => d(eliminarTitulo(id)).unwrap(),
    recargar: (d: AppDispatch) => d(getConfigTitulos()),
  };
}