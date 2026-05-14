import axios from 'axios';
import { EstatusActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { API_BASE_URL } from '@/variableApi';


// Agregar un nuevo Estatus de Activos Fijos
export const addEstatusAF = createAsyncThunk<{ success: boolean; message: string }, EstatusActivosFijos>(
    'almacengeneral/addEstatusAF',
    async (nuevoEstatus: EstatusActivosFijos) => {
        try {
            await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await axios.post(
                `${API_BASE_URL}/api/HSS1/almacengeneral/activosfijos-estatus`,
                nuevoEstatus,
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


// Obtener los estatus de activos fijos registrados
export const getEstatusAF = createAsyncThunk<{ success: boolean; estatusAF?: EstatusActivosFijos[]; message: string }>(
    'almacengeneral/getEstatusAF',
    async () => {
        try {
            await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await axios.get(`${API_BASE_URL}/api/HSS1/almacengeneral/activosfijos-estatus`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                withCredentials: true,
            });

            const estatusFormateados = response.data.data.map((estatus: EstatusActivosFijos) => ({
                ...estatus,
                created_at: estatus.created_at ? formatDateHorasToFrontend(estatus.created_at) : null,
                updated_at: estatus.updated_at ? formatDateHorasToFrontend(estatus.updated_at) : null,
            }));

            return { success: response.data.success, estatusAF: estatusFormateados, message: response.data.message };
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


// Editar un Estatus de Activos Fijos
export const editEstatusAF = createAsyncThunk<{ success: boolean; message: string }, EstatusActivosFijos>(
    'almacengeneral/editEstatusAF',
    async (estatusEditado: EstatusActivosFijos) => {
        try {
            await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await axios.put(
                `${API_BASE_URL}/api/HSS1/almacengeneral/activosfijos-estatus/${estatusEditado.id_estatusaf}`,
                estatusEditado,
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


// Eliminar un Estatus de Activos Fijos
export const deleteEstatusAF = createAsyncThunk<{ success: boolean; message: string }, EstatusActivosFijos>(
    'almacengeneral/deleteEstatusAF',
    async (estatusEliminado: EstatusActivosFijos) => {
        try {
            await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await axios.delete(
                `${API_BASE_URL}/api/HSS1/almacengeneral/activosfijos-estatus/${estatusEliminado.id_estatusaf}`,
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
