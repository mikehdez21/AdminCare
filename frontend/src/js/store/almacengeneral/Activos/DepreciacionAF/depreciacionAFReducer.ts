import { ActivoConDepreciacion, DepreciacionRecord, MetodoDepreciacion } from '@/@types/AlmacenGeneralTypes/depreciacionTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DepreciacionAFState {
	activosSinDepreciar: ActivoConDepreciacion[];
	activosEnDepreciacion: ActivoConDepreciacion[];
	metodosDepreciacion: MetodoDepreciacion[];
	historicoDepreciaciones: DepreciacionRecord[];
	error: string | null;
}

const initialState: DepreciacionAFState = {
	activosSinDepreciar: [],
	activosEnDepreciacion: [],
	metodosDepreciacion: [],
	historicoDepreciaciones: [],
	error: null,
};

const depreciacionAFSlice = createSlice({
	name: 'depreciacionAF',
	initialState,
	reducers: {
		setActivosSinDepreciar: (state, action: PayloadAction<ActivoConDepreciacion[]>) => {
			state.activosSinDepreciar = action.payload;
		},
		setActivosEnDepreciacion: (state, action: PayloadAction<ActivoConDepreciacion[]>) => {
			state.activosEnDepreciacion = action.payload;
		},
		setMetodosDepreciacion: (state, action: PayloadAction<MetodoDepreciacion[]>) => {
			state.metodosDepreciacion = action.payload;
		},
		setHistoricoDepreciaciones: (state, action: PayloadAction<DepreciacionRecord[]>) => {
			state.historicoDepreciaciones = action.payload;
		},
		setErrorDepreciacionAF: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
		moveActivoToDepreciacion: (state, action: PayloadAction<ActivoConDepreciacion>) => {
			const activo = action.payload;
			state.activosSinDepreciar = state.activosSinDepreciar.filter(
				(item) => item.id_activo_fijo !== activo.id_activo_fijo,
			);

			const index = state.activosEnDepreciacion.findIndex(
				(item) => item.id_activo_fijo === activo.id_activo_fijo,
			);

			if (index === -1) {
				state.activosEnDepreciacion.unshift(activo);
			} else {
				state.activosEnDepreciacion[index] = activo;
			}
		},
		updateActivoConDepreciacion: (state, action: PayloadAction<ActivoConDepreciacion>) => {
			const activo = action.payload;
			const updateList = (list: ActivoConDepreciacion[]) => {
				const index = list.findIndex((item) => item.id_activo_fijo === activo.id_activo_fijo);
				if (index !== -1) {
					list[index] = activo;
				}
			};

			updateList(state.activosSinDepreciar);
			updateList(state.activosEnDepreciacion);
		},
		removeActivoFromSinDepreciar: (state, action: PayloadAction<number>) => {
			state.activosSinDepreciar = state.activosSinDepreciar.filter(
				(item) => item.id_activo_fijo !== action.payload,
			);
		},
		removeActivoFromEnDepreciacion: (state, action: PayloadAction<number>) => {
			state.activosEnDepreciacion = state.activosEnDepreciacion.filter(
				(item) => item.id_activo_fijo !== action.payload,
			);
		},
		clearDepreciacionState: (state) => {
			state.activosSinDepreciar = [];
			state.activosEnDepreciacion = [];
			state.metodosDepreciacion = [];
			state.historicoDepreciaciones = [];
			state.error = null;
		},
	},
});

export const {
	setActivosSinDepreciar,
	setActivosEnDepreciacion,
	setMetodosDepreciacion,
	setHistoricoDepreciaciones,
	setErrorDepreciacionAF,
	moveActivoToDepreciacion,
	updateActivoConDepreciacion,
	removeActivoFromSinDepreciar,
	removeActivoFromEnDepreciacion,
	clearDepreciacionState,
} = depreciacionAFSlice.actions;

export default depreciacionAFSlice.reducer;
