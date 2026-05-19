import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import {
    ActivoConDepreciacion,
    DepreciacionRecord,
    MetodoDepreciacion,
    ActivarDepreciacionPayload,
} from '@/@types/AlmacenGeneralTypes/depreciacionTypes';
import { API_BASE_URL } from '@/variableApi';

// GET: activos sin depreciar
export const fetchActivosSinDepreciar = createAsyncThunk<
    { success: boolean; activos?: ActivoConDepreciacion[]; message: string }
>('depreciacionAF/fetchActivosSinDepreciar', async () => {
    try {
        await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const response = await axios.get(`${API_BASE_URL}/api/HSS1/contabilidad/depreciacion/activos-sin-depreciar`, {
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken || '' },
            withCredentials: true,
        });

        const activosFormateados = (response.data.data || []).map((a: ActivoConDepreciacion) => ({
            ...a,
            fecha_registro_af: a.fecha_registro_af ? formatDateHorasToFrontend(a.fecha_registro_af) : null,
            fecha_inicio_depreciacion: (a as any).fecha_inicio_depreciacion
                ? formatDateHorasToFrontend((a as any).fecha_inicio_depreciacion)
                : null,
            created_at: a.created_at ? formatDateHorasToFrontend(a.created_at) : null,
            updated_at: a.updated_at ? formatDateHorasToFrontend(a.updated_at) : null,
        }));

        return { success: true, activos: activosFormateados, message: response.data.message || '' };
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            return { success: false, message: error.response.data.message || 'Error inesperado' };
        }
        return { success: false, message: 'Error inesperado' };
    }
});

// GET: activos en depreciación
export const fetchActivosEnDepreciacion = createAsyncThunk<
    { success: boolean; activos?: ActivoConDepreciacion[]; message: string }
>('depreciacionAF/fetchActivosEnDepreciacion', async () => {
    try {
        await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const response = await axios.get(`${API_BASE_URL}/api/HSS1/contabilidad/depreciacion/activos-en-depreciacion`, {
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken || '' },
            withCredentials: true,
        });

        const activosFormateados = (response.data.data || []).map((a: ActivoConDepreciacion) => ({
            ...a,

            fecha_inicio_depreciacion: a.ultima_depreciacion?.fecha_inicio_depreciacion
                ? formatDateHorasToFrontend(a.ultima_depreciacion.fecha_inicio_depreciacion) : null,

            created_at: a.created_at ? formatDateHorasToFrontend(a.created_at) : null,
            updated_at: a.updated_at ? formatDateHorasToFrontend(a.updated_at) : null,
        }));

        console.log('Activos en depreciación:', activosFormateados);

        return { success: true, activos: activosFormateados, message: response.data.message || '' };
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            return { success: false, message: error.response.data.message || 'Error inesperado' };
        }
        return { success: false, message: 'Error inesperado' };
    }
});

// GET: métodos de depreciación
export const fetchMetodosDepreciacion = createAsyncThunk<
    { success: boolean; metodos?: MetodoDepreciacion[]; message: string }
>('depreciacionAF/fetchMetodosDepreciacion', async () => {
    try {
        await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const response = await axios.get(`${API_BASE_URL}/api/HSS1/contabilidad/metodos-depreciacion`, {
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken || '' },
            withCredentials: true,
        });

        return { success: true, metodos: response.data.data as MetodoDepreciacion[], message: response.data.message || '' };
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            return { success: false, message: error.response.data.message || 'Error inesperado' };
        }
        return { success: false, message: 'Error inesperado' };
    }
});

// POST: crear nuevo método de depreciación
export const createMetodoDepreciacion = createAsyncThunk<
    { success: boolean; metodo?: MetodoDepreciacion; message: string },
    { nombre_metodo: string; descripcion_metodo?: string; formula?: string; tasa_default?: number; activo?: boolean }
>('depreciacionAF/createMetodoDepreciacion', async (payload) => {
    try {
        await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const response = await axios.post(`${API_BASE_URL}/api/HSS1/contabilidad/metodos-depreciacion`, payload, {
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken || '' },
            withCredentials: true,
        });

        return { success: response.data.success, metodo: response.data.data as MetodoDepreciacion, message: response.data.message || '' };
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            return { success: false, message: error.response.data.message || 'Error inesperado' };
        }
        return { success: false, message: 'Error inesperado' };
    }
});

// GET: histórico de depreciaciones por activo
export const fetchHistoricoDepreciaciones = createAsyncThunk<
    { success: boolean; historico?: DepreciacionRecord[]; message: string },
    number
>('depreciacionAF/fetchHistoricoDepreciaciones', async (idActivo: number) => {
    try {
        await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const response = await axios.get(`${API_BASE_URL}/api/HSS1/contabilidad/depreciacion/historico/${idActivo}`, {
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken || '' },
            withCredentials: true,
        });

        const historicoRaw = Array.isArray(response.data?.data) ? response.data.data : Array.isArray(response.data) ? response.data : [];

        const historicoFormateado = historicoRaw.map((h: DepreciacionRecord) => ({
            ...h,
            fecha_calculo_depreciacion: h.fecha_calculo_depreciacion ? formatDateHorasToFrontend(h.fecha_calculo_depreciacion) : null,
        }));

        return { success: true, historico: historicoFormateado, message: response.data?.message || '' };
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            return { success: false, message: error.response.data.message || 'Error inesperado' };
        }
        return { success: false, message: 'Error inesperado' };
    }
});

// POST: activar depreciación (guarda snapshot + primer registro)
export const activarDepreciacion = createAsyncThunk<
    { success: boolean; depreciacion?: DepreciacionRecord; message: string },
    { idActivo: number; payload: ActivarDepreciacionPayload }
>('depreciacionAF/activarDepreciacion', async ({ idActivo, payload }) => {
    try {
        await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const response = await axios.post(`${API_BASE_URL}/api/HSS1/contabilidad/depreciacion/activar/${idActivo}`, payload, {
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken || '' },
            withCredentials: true,
        });

        return { success: response.data.success, depreciacion: response.data.data as DepreciacionRecord, message: response.data.message || '' };
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            return { success: false, message: error.response.data.message || 'Error inesperado' };
        }
        return { success: false, message: 'Error inesperado' };
    }
});

// POST: calcular depreciación manual (para un año)
export const calcularDepreciacionManual = createAsyncThunk<
    { success: boolean; depreciacion?: DepreciacionRecord; message: string },
    { idActivo: number; anio: number }
>('depreciacionAF/calcularDepreciacionManual', async ({ idActivo, anio }) => {
    try {
        await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const response = await axios.post(
            `${API_BASE_URL}/api/HSS1/contabilidad/depreciacion/calcular/${idActivo}`,
            { anio },
            { headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken || '' }, withCredentials: true },
        );

        return { success: response.data.success, depreciacion: response.data.data as DepreciacionRecord, message: response.data.message || '' };
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            return { success: false, message: error.response.data.message || 'Error inesperado' };
        }
        return { success: false, message: 'Error inesperado' };
    }
});

// PUT: actualizar datos de depreciación/activo (ej. ajustar snapshot)
export const actualizarDepreciacionActivo = createAsyncThunk<
    { success: boolean; message: string },
    { idActivo: number; payload: Partial<ActivoConDepreciacion> }
>('depreciacionAF/actualizarDepreciacionActivo', async ({ idActivo, payload }) => {
    try {
        await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const response = await axios.put(`${API_BASE_URL}/api/HSS1/contabilidad/depreciacion/activo/${idActivo}`, payload, {
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken || '' },
            withCredentials: true,
        });

        return { success: response.data.success, message: response.data.message || '' };
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            return { success: false, message: error.response.data.message || 'Error inesperado' };
        }
        return { success: false, message: 'Error inesperado' };
    }
});

// DELETE: remover activo de depreciación (quitar snapshot/flujo)
export const removerActivoDepreciacion = createAsyncThunk<
    { success: boolean; message: string },
    number
>('depreciacionAF/removerActivoDepreciacion', async (idActivo: number) => {
    try {
        await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const response = await axios.delete(`${API_BASE_URL}/api/HSS1/contabilidad/depreciacion/activo/${idActivo}`, {
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken || '' },
            withCredentials: true,
        });

        return { success: response.data.success, message: response.data.message || '' };
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            return { success: false, message: error.response.data.message || 'Error inesperado' };
        }
        return { success: false, message: 'Error inesperado' };
    }
});

// Limpiar estado local (redux)
export const clearDepreciacionStore = createAsyncThunk('depreciacionAF/clearDepreciacionStore', async () => {
    return null;
});

// PUT: actualizar un método de depreciación
export const updateMetodoDepreciacion = createAsyncThunk<
    { success: boolean; metodo?: MetodoDepreciacion; message: string },
    { id: number; payload: { nombre_metodo: string; descripcion_metodo?: string; formula?: string; tasa_default?: number; activo?: boolean } }
>('depreciacionAF/updateMetodoDepreciacion', async ({ id, payload }) => {
    try {
        await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const response = await axios.put(`${API_BASE_URL}/api/HSS1/contabilidad/metodos-depreciacion/${id}`, payload, {
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken || '' },
            withCredentials: true,
        });

        return { success: response.data.success, metodo: response.data.data as MetodoDepreciacion, message: response.data.message || '' };
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            return { success: false, message: error.response.data.message || 'Error inesperado' };
        }
        return { success: false, message: 'Error inesperado' };
    }
});

// DELETE: eliminar un método de depreciación
export const deleteMetodoDepreciacion = createAsyncThunk<
    { success: boolean; message: string },
    number
>('depreciacionAF/deleteMetodoDepreciacion', async (id: number) => {
    try {
        await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const response = await axios.delete(`${API_BASE_URL}/api/HSS1/contabilidad/metodos-depreciacion/${id}`, {
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken || '' },
            withCredentials: true,
        });

        return { success: response.data.success, message: response.data.message || '' };
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            return { success: false, message: error.response.data.message || 'Error inesperado' };
        }
        return { success: false, message: 'Error inesperado' };
    }
});