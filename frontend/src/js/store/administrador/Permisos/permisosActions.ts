import axios from 'axios';
import { Permission } from '@/@types/mainTypes';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '@/variableApi';


// Agregar un nuevo Permiso
export const addPermiso = createAsyncThunk<{ success: boolean; permisos?: Permission[]; message: string }, Permission>(
    '/addPermiso',
    async (nuevoPermiso: Permission) => {
        try {
            await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await axios.post(
                `${API_BASE_URL}/api/HSS1/admin/permisos`,
                nuevoPermiso,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken || '',
                    },
                    withCredentials: true,
                }
            );

            const permisosData = Array.isArray(response.data.data)
                ? response.data.data
                : [response.data.data];

            const permisosResp = permisosData.filter(Boolean).map((perm: Permission) => ({
                ...perm,
                created_at: perm.created_at ? formatDateHorasToFrontend(perm.created_at) : null,
                updated_at: perm.updated_at ? formatDateHorasToFrontend(perm.updated_at) : null,
            }));

            return { success: response.data.success, permisos: permisosResp as Permission[], message: response.data.message };
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

// Obtener los permisos registrados
export const getPermisos = createAsyncThunk<{ success: boolean; permisos?: Permission[]; message: string }>(
    '/getPermisos',
    async () => {
        try {
            await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await axios.get(`${API_BASE_URL}/api/HSS1/admin/permisos`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                withCredentials: true,
            });

            const permisosFormateados = response.data.data.map((perm: Permission) => ({
                ...perm,
                created_at: perm.created_at ? formatDateHorasToFrontend(perm.created_at) : null,
                updated_at: perm.updated_at ? formatDateHorasToFrontend(perm.updated_at) : null,
            }));

            return { success: response.data.success, permisos: permisosFormateados as Permission[], message: response.data.message };

        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return ({
                    success: false,
                    message: error.response.data.message || 'Error inesperado',
                });
            }

            return ({
                success: false,
                message: 'Error inesperado',
            });
        }
    }
)

// Editar un permiso
export const editPermiso = createAsyncThunk<{ success: boolean; message: string }, Permission>(
    '/editPermiso',
    async (permisoEditado: Permission) => {
        try {
            await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await axios.put(
                `${API_BASE_URL}/api/HSS1/admin/permisos/${permisoEditado.id}`,
                permisoEditado,
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

// Eliminar un permiso
export const deletePermiso = createAsyncThunk<{ success: boolean; message: string }, Permission>(
    '/deletePermiso',
    async (permisoEliminado: Permission) => {
        try {
            await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await axios.delete(
                `${API_BASE_URL}/api/HSS1/admin/permisos/${permisoEliminado.id}`,
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
