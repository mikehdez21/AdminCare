import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';
import { tagLista } from './tags';
import { formatDateHorasToFrontend } from '@/utils/dateFormat';
import type { AlcanceCatalogo, AlcanceValor, Roles } from '@/@types/mainTypes';
import type { PaginacionMeta, PaginacionParams } from '@/@types/paginacionTypes';

export interface RolesPayload {
  name: string;
  guard_name: string;
  permissions: number[];
  alcances?: Record<string, AlcanceValor | ''>;
}

export interface RolesPaginadoResponse {
  items: Roles[];
  meta?: PaginacionMeta | null;
}

export const rolesApi = createApi({
  reducerPath: 'rolesApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Rol', 'Permiso'],
  endpoints: (builder) => ({
    getRoles: builder.query<RolesPaginadoResponse, PaginacionParams | void>({
      query: (args) => ({
        url: '/api/admin/roles',
        method: 'GET',
        params: args,
      }),
      transformResponse: (response: { data?: Roles[]; meta?: PaginacionMeta | null }) => {
        const data = response.data ?? [];
        const formateados: Roles[] = data.map((rol) => ({
          ...rol,
          created_at: rol.created_at ? formatDateHorasToFrontend(rol.created_at) ?? undefined : undefined,
          updated_at: rol.updated_at ? formatDateHorasToFrontend(rol.updated_at) ?? undefined : undefined,
        }));
        return { items: formateados, meta: response.meta };
      },
      providesTags: [tagLista('Rol')],
    }),
    getAlcancesCatalogo: builder.query<AlcanceCatalogo[], void>({
      query: () => ({
        url: '/api/admin/roles/alcances/catalogo',
        method: 'GET',
      }),
      transformResponse: (response: { success?: boolean; data?: AlcanceCatalogo[] }) =>
        response.success === false ? [] : (response.data ?? []),
      providesTags: [tagLista('Rol')],
    }),
    addRol: builder.mutation<{ success: boolean; message: string }, RolesPayload>({
      query: (body) => ({
        url: '/api/admin/roles',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [tagLista('Rol')],
    }),
    editRol: builder.mutation<{ success: boolean; message: string }, Roles>({
      query: (rol) => ({
        url: `/api/admin/roles/${rol.id}`,
        method: 'PUT',
        data: rol,
      }),
      invalidatesTags: [tagLista('Rol')],
    }),
    deleteRol: builder.mutation<{ success: boolean; message: string }, Roles>({
      query: (rol) => ({
        url: `/api/admin/roles/${rol.id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [tagLista('Rol')],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetAlcancesCatalogoQuery,
  useAddRolMutation,
  useEditRolMutation,
  useDeleteRolMutation,
} = rolesApi;
