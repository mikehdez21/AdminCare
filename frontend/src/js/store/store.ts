// store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/authReducer';
import statusReducer from '@/store/statusReducer';

import userReducer from '@/store/administrador/Users/usersReducer'
import empleadosReducer from '@/store/administrador/Empleados/empleadosReducer'
import rolesReducer from '@/store/administrador/Roles/rolesReducer'
import departamentosReducer from '@/store/administrador/Departamentos/departamentosReducer'
import ubicacionesReducer from '@/store/administrador/Ubicaciones/ubicacionesReducer'

import facturasReducer from '@/store/almacengeneral/Facturas/facturasReducer'
import activosReducer from '@/store/almacengeneral/Activos/activosReducer'
import vwMovimientosAFReducer from '@/store/almacengeneral/Activos/vwMovimientosAFReducer';
import movimientosAFReducer from '@/store/almacengeneral/Activos/MovimientosActivos/movimientosAFReducer'
import proveedoresReducer from '@/store/almacengeneral/Proveedores/proveedoresReducer'
import fiscalReducer from '@/store/shared/fiscalReducer'
import clasificacionesReducer from '@/store/almacengeneral/Clasificaciones/clasificacionesReducer'

import sectionReducer from '@/store/sectionReducer'

const store = configureStore({
  reducer: {

    // Menu
    section: sectionReducer,

    // Auth y Usuarios
    auth: authReducer,
    apiStatus: statusReducer,
    users: userReducer,
    roles: rolesReducer,
    departamentos: departamentosReducer,
    empleados: empleadosReducer,
    ubicaciones: ubicacionesReducer,

    // Tipos Compartidos (Catalogos)
    fiscal: fiscalReducer,

    // AlmacenGeneral
    activos: activosReducer,
    vwMovimientosAF: vwMovimientosAFReducer,
    movimientosAF: movimientosAFReducer,
    clasificacion: clasificacionesReducer,
    facturasaf: facturasReducer,
    proveedor: proveedoresReducer,

    //  otros reducers...
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(/* otros middlewares */),
});

// Tipos para el estado y el dispatch del store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
