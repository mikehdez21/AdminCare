import type {
  CategoriaTicket,
  EstatusTicket,
  HelpdeskEmpleado,
  HelpdeskEtiqueta,
  HelpdeskModuloSIHO,
  HelpdeskProveedorError,
  HelpdeskSistemaProveedor,
  PrioridadTicket,
  SubcategoriaTicket,
  TituloTicket,
} from '@/@types/HelpdeskTypes/ticketTypes';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  getCategorias,
  getEmpleadosHelpdesk,
  getEtiquetas,
  getEstatus,
  getModulosSIHO,
  getPrioridades,
  getProveedoresError,
  getSistemasProveedor,
  getSubcategorias,
  getTitulos,
  type ResultadoCatalogo,
} from './catalogosActions';

export interface CatalogosState {
  categorias: CategoriaTicket[];
  /** Títulos cacheados por categoría: cambiar de paso en el form no refetchea. */
  titulosPorCategoria: Record<number, TituloTicket[]>;
  subcategorias: SubcategoriaTicket[];
  prioridades: PrioridadTicket[];
  estatus: EstatusTicket[];
  etiquetas: HelpdeskEtiqueta[];
  empleados: HelpdeskEmpleado[];
  proveedoresError: HelpdeskProveedorError[];
  sistemasProveedor: HelpdeskSistemaProveedor[];
  modulosSIHO: HelpdeskModuloSIHO[];
  error: string | null;
}

const initialState: CatalogosState = {
  categorias: [],
  titulosPorCategoria: {},
  subcategorias: [],
  prioridades: [],
  estatus: [],
  etiquetas: [],
  empleados: [],
  proveedoresError: [],
  sistemasProveedor: [],
  modulosSIHO: [],
  error: null,
}

const catalogosSlice = createSlice({
  name: 'helpdeskCatalogos',
  initialState,
  reducers: {
    setListCategorias: (state, action: PayloadAction<CategoriaTicket[]>) => {
      state.categorias = action.payload;
    },
    setListSubcategorias: (state, action: PayloadAction<SubcategoriaTicket[]>) => {
      state.subcategorias = action.payload;
    },
    setListPrioridades: (state, action: PayloadAction<PrioridadTicket[]>) => {
      state.prioridades = action.payload;
    },
    setListEstatus: (state, action: PayloadAction<EstatusTicket[]>) => {
      state.estatus = action.payload;
    },
    setListEtiquetas: (state, action: PayloadAction<HelpdeskEtiqueta[]>) => {
      state.etiquetas = action.payload;
    },
    setListTitulos: (state, action: PayloadAction<{ idCategoria: number; titulos: TituloTicket[] }>) => {
      state.titulosPorCategoria[action.payload.idCategoria] = action.payload.titulos;
    },
    /**
     * Vacía los catálogos que la pantalla de Configuración puede modificar.
     *
     * Existe por la razón que impide compartir slice: Configuración pide
     * `incluir_inactivos=1` y el formulario de ticket no, así que cada uno
     * guarda el suyo. El precio de esa separación es que escribir en
     * Configuración dejaba el `helpdeskCatalogos` del formulario con la lista
     * vieja, y ahí no se refrescaba nunca: `useCatalogData` solo pide cuando la
     * lista viene vacía, y `getTitulos` ni siquiera vuelve a mirar la red si la
     * categoría ya está cacheada en `titulosPorCategoria`. Se agregaba una
     * categoría o un título y, al ir a levantar un ticket, seguían sin aparecer.
     *
     * Vaciar basta porque al volver al formulario los controles se montan de
     * cero: `useCatalogData` ve la lista vacía y pide, y el `condition` de
     * `getTitulos` se encuentra `undefined` y también deja pasar la petición.
     *
     * Se vacían las cinco listas que Configuración puede modificar. Los tickets ya
     * cerrados guardan el `id_estatus_ticket` con el que estaban, no el nombre: un
     * estatus renombrado se refleja en el detalle porque este lee el catálogo, y
     * no se rompe el histórico porque el id no cambió.
     */
    invalidarCatalogos: (state) => {
      state.categorias = [];
      state.subcategorias = [];
      state.prioridades = [];
      state.etiquetas = [];
      state.estatus = [];
      state.titulosPorCategoria = {};
      state.proveedoresError = [];
      state.sistemasProveedor = [];
      state.modulosSIHO = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCategorias.fulfilled, (state, action: PayloadAction<ResultadoCatalogo<CategoriaTicket>>) => {
        if (action.payload.success && action.payload.items) {
          state.categorias = action.payload.items;
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener las categorías';
        }
      })

      .addCase(getTitulos.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.items) {
          state.titulosPorCategoria[action.meta.arg] = action.payload.items;
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener los títulos';
        }
      })

      .addCase(getSubcategorias.fulfilled, (state, action: PayloadAction<ResultadoCatalogo<SubcategoriaTicket>>) => {
        if (action.payload.success && action.payload.items) {
          state.subcategorias = action.payload.items;
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener las subcategorías';
        }
      })

      .addCase(getPrioridades.fulfilled, (state, action: PayloadAction<ResultadoCatalogo<PrioridadTicket>>) => {
        if (action.payload.success && action.payload.items) {
          state.prioridades = action.payload.items;
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener las prioridades';
        }
      })

      .addCase(getEstatus.fulfilled, (state, action: PayloadAction<ResultadoCatalogo<EstatusTicket>>) => {
        if (action.payload.success && action.payload.items) {
          state.estatus = action.payload.items;
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener los estatus';
        }
      })

      .addCase(getEtiquetas.fulfilled, (state, action: PayloadAction<ResultadoCatalogo<HelpdeskEtiqueta>>) => {
        if (action.payload.success && action.payload.items) {
          state.etiquetas = action.payload.items;
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener las etiquetas';
        }
      })

      .addCase(getEmpleadosHelpdesk.fulfilled, (state, action: PayloadAction<ResultadoCatalogo<HelpdeskEmpleado>>) => {
        if (action.payload.success && action.payload.items) {
          state.empleados = action.payload.items;
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener los empleados';
        }
      })
      .addCase(getModulosSIHO.fulfilled, (state, action: PayloadAction<ResultadoCatalogo<HelpdeskModuloSIHO>>) => {
        if (action.payload.success && action.payload.items) {
          state.modulosSIHO = action.payload.items;
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener los módulos';
        }
      })

      .addCase(getProveedoresError.fulfilled, (state, action: PayloadAction<ResultadoCatalogo<HelpdeskProveedorError>>) => {
        if (action.payload.success && action.payload.items) {
          state.proveedoresError = action.payload.items;
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener los proveedores';
        }
      })

      .addCase(getSistemasProveedor.fulfilled, (state, action: PayloadAction<ResultadoCatalogo<HelpdeskSistemaProveedor>>) => {
        if (action.payload.success && action.payload.items) {
          state.sistemasProveedor = action.payload.items;
          state.error = null;
        } else {
          state.error = action.payload.message || 'Error al obtener los sistemas';
        }
      })
  }
})

export const {
  setListCategorias,
  setListSubcategorias,
  setListPrioridades,
  setListEstatus,
  setListEtiquetas,
  setListTitulos,
  invalidarCatalogos,
} = catalogosSlice.actions

export default catalogosSlice.reducer;