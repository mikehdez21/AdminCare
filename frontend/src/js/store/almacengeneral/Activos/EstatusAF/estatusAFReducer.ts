import { EstatusActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addEstatusAF, deleteEstatusAF, editEstatusAF, getEstatusAF } from './estatusAFActions';

export interface EstatusAFState {
	estatusAF: EstatusActivosFijos[];
	error: string | null;
}

const initialState: EstatusAFState = {
	estatusAF: [],
	error: null,
};

const estatusAFSlice = createSlice({
	name: 'estatusAF',
	initialState,
	reducers: {
		setListEstatusAF: (state, action: PayloadAction<EstatusActivosFijos[]>) => {
			state.estatusAF = action.payload;
		},
		updateEstatusAF: (state, action: PayloadAction<EstatusActivosFijos>) => {
			const index = state.estatusAF.findIndex((estatus) => estatus.id_estatusaf === action.payload.id_estatusaf);
			if (index !== -1) {
				state.estatusAF[index] = action.payload;
			}
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getEstatusAF.fulfilled, (state, action: PayloadAction<{ success: boolean; estatusAF?: EstatusActivosFijos[]; message: string }>) => {
				if (action.payload.success && Array.isArray(action.payload.estatusAF)) {
					state.estatusAF = action.payload.estatusAF;
					state.error = null;
				} else {
					state.error = action.payload.message || 'Error al obtener estatus AF';
				}
			})
			.addCase(getEstatusAF.rejected, (state, action) => {
				state.error = action.error.message || 'Error al obtener estatus AF';
			})
			.addCase(addEstatusAF.fulfilled, (state, action: PayloadAction<{ success: boolean; message: string }>) => {
				state.error = action.payload.success ? null : action.payload.message || 'Error al añadir estatus AF';
			})
			.addCase(addEstatusAF.rejected, (state, action) => {
				state.error = action.error.message || 'Error al añadir estatus AF';
			})
			.addCase(editEstatusAF.fulfilled, (state, action: PayloadAction<{ success: boolean; message: string }>) => {
				state.error = action.payload.success ? null : action.payload.message || 'Error al editar estatus AF';
			})
			.addCase(editEstatusAF.rejected, (state, action) => {
				state.error = action.error.message || 'Error al editar estatus AF';
			})
			.addCase(deleteEstatusAF.fulfilled, (state, action: PayloadAction<{ success: boolean; message: string }>) => {
				state.error = action.payload.success ? null : action.payload.message || 'Error al eliminar estatus AF';
			})
			.addCase(deleteEstatusAF.rejected, (state, action) => {
				state.error = action.error.message || 'Error al eliminar estatus AF';
			});
	},
});

export const { setListEstatusAF, updateEstatusAF } = estatusAFSlice.actions;
export default estatusAFSlice.reducer;
