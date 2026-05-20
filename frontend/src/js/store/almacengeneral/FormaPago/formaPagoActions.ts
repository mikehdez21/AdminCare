import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { FormasPago } from '@/@types/fiscalTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { API_BASE_URL } from '@/variableApi';
import type { RootState } from '@/store/store';

// Agregar una nueva Forma de Pago
export const addFormaPago = createAsyncThunk<{ success: boolean; message: string }, FormasPago>(
	'almacengeneral/addFormaPago',
	async (nuevaFormaPago: FormasPago) => {
		try {
			await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
			const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

			const response = await axios.post(
				`${API_BASE_URL}/api/HSS1/almacengeneral/formaspago`,
				nuevaFormaPago,
				{
					headers: {
						'Content-Type': 'application/json',
						'X-CSRF-TOKEN': csrfToken || '',
					},
					withCredentials: true,
				}
			);

			return { success: response.data.success, message: response.data.message };
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				return {
					success: false,
					message: error.response.data.message || 'Error inesperado',
				};
			}

			return {
				success: false,
				message: 'Error inesperado',
			};
		}
	}
);

// Obtener las formas de pago registradas
export const getFormasPago = createAsyncThunk<{ success: boolean; formasPago?: []; message: string }>(
	'almacengeneral/getFormasPago',
	async (_, { getState }) => {
		const state = getState() as RootState;

		if (state.fiscal.formasPago.length > 0) {
			return {
				success: true,
				formasPago: state.fiscal.formasPago as [],
				message: 'Formas de pago cargadas desde cache local',
			};
		}

		try {
			await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
			const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

			const response = await axios.get(`${API_BASE_URL}/api/HSS1/almacengeneral/formaspago`, {
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-TOKEN': csrfToken || '',
				},
				withCredentials: true,
			});

			const formasPagoFormateadas = response.data.data.map((forma: FormasPago) => ({
				...forma,
				created_at: forma.created_at ? formatDateHorasToFrontend(forma.created_at) : null,
				updated_at: forma.updated_at ? formatDateHorasToFrontend(forma.updated_at) : null,
			}));

			return { success: response.data.success, formasPago: formasPagoFormateadas, message: response.data.message };
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				return {
					success: false,
					message: error.response.data.message || 'Error inesperado',
				};
			}

			return {
				success: false,
				message: 'Error inesperado',
			};
		}
	}
);

// Editar una Forma de Pago
export const editFormaPago = createAsyncThunk<{ success: boolean; message: string }, FormasPago>(
	'almacengeneral/editFormaPago',
	async (formaEditada: FormasPago) => {
		try {
			await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
			const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

			const response = await axios.put(
				`${API_BASE_URL}/api/HSS1/almacengeneral/formaspago/${formaEditada.id_formapago}`,
				formaEditada,
				{
					headers: {
						'Content-Type': 'application/json',
						'X-CSRF-TOKEN': csrfToken || '',
					},
					withCredentials: true,
				}
			);

			return { success: response.data.success, message: response.data.message };
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				return {
					success: false,
					message: error.response.data.message || 'Error inesperado',
				};
			}

			return {
				success: false,
				message: 'Error inesperado',
			};
		}
	}
);

// Eliminar una Forma de Pago
export const deleteFormaPago = createAsyncThunk<{ success: boolean; message: string }, FormasPago>(
	'almacengeneral/deleteFormaPago',
	async (formaEliminada: FormasPago) => {
		try {
			await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
			const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

			const response = await axios.delete(
				`${API_BASE_URL}/api/HSS1/almacengeneral/formaspago/${formaEliminada.id_formapago}`,
				{
					headers: {
						'Content-Type': 'application/json',
						'X-CSRF-TOKEN': csrfToken || '',
					},
					withCredentials: true,
				}
			);

			return { success: response.data.success, message: response.data.message };
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				return {
					success: false,
					message: error.response.data.message || 'Error inesperado',
				};
			}

			return {
				success: false,
				message: 'Error inesperado',
			};
		}
	}
);
