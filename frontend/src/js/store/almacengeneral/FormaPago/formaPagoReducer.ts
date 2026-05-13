import { FormasPago } from '@/@types/fiscalTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addFormaPago, getFormasPago, editFormaPago, deleteFormaPago } from './formaPagoActions';

export interface FormaPagoState {
	formasPago: FormasPago[];
	error: string | null;
}

const initialState: FormaPagoState = {
	formasPago: [],
	error: null,
};

const formaPagoSlice = createSlice({
	name: 'formaPago',
	initialState,
	reducers: {
		setListFormasPago: (state, action: PayloadAction<FormasPago[]>) => {
			state.formasPago = action.payload;
		},
		updateFormaPago: (state, action: PayloadAction<FormasPago>) => {
			const index = state.formasPago.findIndex(
				(forma) => forma.id_formapago === action.payload.id_formapago
			);
			if (index !== -1) {
				state.formasPago[index] = action.payload;
			}
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getFormasPago.fulfilled, (state, action: PayloadAction<{ success: boolean; formasPago?: FormasPago[]; message: string }>) => {
				if (action.payload.success && Array.isArray(action.payload.formasPago)) {
					state.formasPago = action.payload.formasPago;
					state.error = null;
				} else {
					state.error = action.payload.message ? action.payload.message : 'Error al obtener formas de pago';
				}
			})
			.addCase(getFormasPago.rejected, (state, action) => {
				state.error = action.error.message || 'Error al obtener formas de pago';
			})
			.addCase(addFormaPago.fulfilled, (state, action: PayloadAction<{ success: boolean; message: string }>) => {
				if (action.payload.success) {
					state.error = null;
				} else {
					state.error = action.payload.message || 'Error al añadir la forma de pago';
				}
			})
			.addCase(addFormaPago.rejected, (state, action) => {
				state.error = action.error.message || 'Error al añadir la forma de pago';
			})
			.addCase(editFormaPago.fulfilled, (state, action: PayloadAction<{ success: boolean; message: string }>) => {
				if (action.payload.success) {
					state.error = null;
				} else {
					state.error = action.payload.message || 'Error al editar la forma de pago';
				}
			})
			.addCase(editFormaPago.rejected, (state, action) => {
				state.error = action.error.message || 'Error al editar la forma de pago';
			})
			.addCase(deleteFormaPago.fulfilled, (state, action: PayloadAction<{ success: boolean; message: string }>) => {
				if (action.payload.success) {
					state.error = null;
				} else {
					state.error = action.payload.message || 'Error al eliminar la forma de pago';
				}
			})
			.addCase(deleteFormaPago.rejected, (state, action) => {
				state.error = action.error.message || 'Error al eliminar la forma de pago';
			});
	},
});

export const { setListFormasPago, updateFormaPago } = formaPagoSlice.actions;
export default formaPagoSlice.reducer;
