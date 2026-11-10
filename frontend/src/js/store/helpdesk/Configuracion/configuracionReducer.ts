import type {
  CategoriaTicket,
  EstatusTicket,
  HelpdeskEtiqueta,
  HelpdeskModuloSIHO,
  HelpdeskProveedorError,
  HelpdeskSistemaProveedor,
  PrioridadTicket,
  SLANivel,
  SubcategoriaTicket,
  TituloTicket,
} from '@/@types/HelpdeskTypes/ticketTypes';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ResultadoCatalogo } from '@/store/helpdesk/Catalogos/catalogosActions';
import {
  getConfigCategorias,
  getConfigEtiquetas,
  getConfigEstatus,
  getConfigModulosSIHO,
  getConfigPrioridades,
  getConfigProveedoresError,
  getConfigSistemasProveedor,
  getConfigSlas,
  getConfigSubcategorias,
  getConfigTitulos,
} from './configuracionActions';

export interface ConfiguracionState {
  categorias: CategoriaTicket[];
  subcategorias: SubcategoriaTicket[];
  titulos: TituloTicket[];
  prioridades: PrioridadTicket[];
  slas: SLANivel[];
  etiquetas: HelpdeskEtiqueta[];
  estatus: EstatusTicket[];
  proveedoresError: HelpdeskProveedorError[];
  sistemasProveedor: HelpdeskSistemaProveedor[];
  modulosSIHO: HelpdeskModuloSIHO[];
  /** Último mensaje de fallo de cualquier lectura, para pintarlo en pantalla. */
  error: string | null;
}

const initialState: ConfiguracionState = {
  categorias: [],
  subcategorias: [],
  titulos: [],
  prioridades: [],
  slas: [],
  etiquetas: [],
  estatus: [],
  proveedoresError: [],
  sistemasProveedor: [],
  modulosSIHO: [],
  error: null,
};

/**
 * Solo guardan lecturas.
 *
 * Las escrituras no pasan por aquí a propósito: la pantalla hace `unwrap()` del
 * thunk y muestra el mensaje del 422 en su propia alerta, que además sabe qué
 * botón se acaba de pulsar. Si el reducer también guardara el error, el mismo
 * mensaje aparecería en dos sitios y habría que elegir cuál mostrar.
 *
 * Las listas tampoco se reescriben al escribir: la pantalla las vuelve a pedir.
 * Un `push` local se desincronizaría del servidor en cuanto el backend
 * normaliza algo (trim, default de columna, orden).
 *
 * El error de una lectura sí se guarda, y las cuatro pantallas lo pintan. Antes
 * un 500 en un catálogo se quedaba en el store sin que nadie lo mirara: por eso
 * un `select` mal escrito en el backend pasó desapercibido y la columna de
 * títulos aparecía vacía sin explicación.
 */
const configuracionSlice = createSlice({
  name: 'helpdeskConfiguracion',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const exito = <T,>(estado: ConfiguracionState, accion: PayloadAction<ResultadoCatalogo<T>>) => {
      estado.error = accion.payload.success ? null : accion.payload.message;
    };

    builder
      .addCase(getConfigCategorias.fulfilled, (state, action: PayloadAction<ResultadoCatalogo<CategoriaTicket>>) => {
        state.categorias = action.payload.items ?? [];
        exito(state, action);
      })

      .addCase(getConfigSubcategorias.fulfilled, (state, action: PayloadAction<ResultadoCatalogo<SubcategoriaTicket>>) => {
        state.subcategorias = action.payload.items ?? [];
        exito(state, action);
      })

      .addCase(getConfigTitulos.fulfilled, (state, action: PayloadAction<ResultadoCatalogo<TituloTicket>>) => {
        state.titulos = action.payload.items ?? [];
        exito(state, action);
      })

      .addCase(getConfigPrioridades.fulfilled, (state, action: PayloadAction<ResultadoCatalogo<PrioridadTicket>>) => {
        state.prioridades = action.payload.items ?? [];
        exito(state, action);
      })

      .addCase(getConfigSlas.fulfilled, (state, action: PayloadAction<ResultadoCatalogo<SLANivel>>) => {
        state.slas = action.payload.items ?? [];
        exito(state, action);
      })

      .addCase(getConfigEtiquetas.fulfilled, (state, action: PayloadAction<ResultadoCatalogo<HelpdeskEtiqueta>>) => {
        state.etiquetas = action.payload.items ?? [];
        exito(state, action);
      })

      .addCase(getConfigEstatus.fulfilled, (state, action: PayloadAction<ResultadoCatalogo<EstatusTicket>>) => {
        state.estatus = action.payload.items ?? [];
        exito(state, action);
      })

      .addCase(getConfigProveedoresError.fulfilled, (state, action: PayloadAction<ResultadoCatalogo<HelpdeskProveedorError>>) => {
        state.proveedoresError = action.payload.items ?? [];
        exito(state, action);
      })

      .addCase(getConfigSistemasProveedor.fulfilled, (state, action: PayloadAction<ResultadoCatalogo<HelpdeskSistemaProveedor>>) => {
        state.sistemasProveedor = action.payload.items ?? [];
        exito(state, action);
      })

      .addCase(getConfigModulosSIHO.fulfilled, (state, action: PayloadAction<ResultadoCatalogo<HelpdeskModuloSIHO>>) => {
        state.modulosSIHO = action.payload.items ?? [];
        exito(state, action);
      });
  },
});

export default configuracionSlice.reducer;