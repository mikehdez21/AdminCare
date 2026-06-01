import { Permission } from '@/@types/mainTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addPermiso, getPermisos } from './permisosActions';

export interface PermisoState {
	permisos: Permission[];
	error: string | null;
}

const initialState: PermisoState = {
	permisos: [] as Permission[],
	error: null,
};

const permisoSlice = createSlice({
	name: 'Permisos',
	initialState,
	reducers: {
		setListPermisos: (state, action: PayloadAction<Permission[]>) => {
			state.permisos = action.payload;
		},
		updatePermiso: (state, action: PayloadAction<Permission>) => {
			const index = state.permisos.findIndex(permiso => permiso.id === action.payload.id);
			if (index !== -1) {
				state.permisos[index] = action.payload;
			}
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getPermisos.fulfilled, (state, action: PayloadAction<{ success: boolean; permisos?: Permission[]; message: string }>) => {
				if (action.payload.success && action.payload.permisos) {
					state.permisos = action.payload.permisos;
				} else {
					state.permisos = [];
					state.error = action.payload.message ? (action.payload.message as string) : 'Error al obtener permisos';
				}
			})
			.addCase(getPermisos.rejected, (state, action) => {
				state.error = action.payload as string;
			})
			.addCase(addPermiso.fulfilled, (state, action: PayloadAction<{ success: boolean; permisos?: Permission[]; message: string }>) => {
				if (action.payload.success && action.payload.permisos) {
					state.permisos = [...state.permisos, ...action.payload.permisos];
				} else {
					state.permisos = [];
					state.error = action.payload.message || 'Error al añadir el permiso';
				}
			})
			.addCase(addPermiso.rejected, (state, action) => {
				state.error = action.payload as string;
			});
	},
});

export const { setListPermisos, updatePermiso } = permisoSlice.actions;
export default permisoSlice.reducer;
