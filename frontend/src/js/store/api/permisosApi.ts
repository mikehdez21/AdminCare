import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';
import { tagLista } from './tags';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import type { Permission } from '@/@types/mainTypes';

export const permisosApi = createApi({
  reducerPath: 'permisosApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Permiso'],
  endpoints: (builder) => ({
    getPermisos: builder.query<Permission[], void>({
      query: () => ({
        url: '/api/admin/permisos',
        method: 'GET',
      }),
      transformResponse: (response: { success?: boolean; data?: Permission[] }) => {
        if (response.success === false) return [];
        const data = response.data ?? [];
        const formateados: Permission[] = data.map((perm) => ({
          ...perm,
          created_at: perm.created_at ? formatDateHorasToFrontend(perm.created_at) ?? undefined : undefined,
          updated_at: perm.updated_at ? formatDateHorasToFrontend(perm.updated_at) ?? undefined : undefined,
        }));
        return formateados;
      },
      providesTags: [tagLista('Permiso')],
    }),
    addPermiso: builder.mutation<{ success: boolean; message: string }, Permission>({
      query: (body) => ({
        url: '/api/admin/permisos',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [tagLista('Permiso')],
    }),
    editPermiso: builder.mutation<{ success: boolean; message: string }, Permission>({
      query: (permiso) => ({
        url: `/api/admin/permisos/${permiso.id}`,
        method: 'PUT',
        data: permiso,
      }),
      invalidatesTags: [tagLista('Permiso')],
    }),
    deletePermiso: builder.mutation<{ success: boolean; message: string }, Permission>({
      query: (permiso) => ({
        url: `/api/admin/permisos/${permiso.id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [tagLista('Permiso')],
    }),
  }),
});

export const {
  useGetPermisosQuery,
  useAddPermisoMutation,
  useEditPermisoMutation,
  useDeletePermisoMutation,
} = permisosApi;
