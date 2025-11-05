// store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authReducer';

import userReducer from './Users/usersReducer'
import empleadosReducer from './Empleados/empleadosReducer'
import rolesReducer from './Roles/rolesReducer'
import departamentosReducer from './Departamentos/departamentosReducer'

import facturasReducer from './almacenGeneral/Facturas/facturasReducer'
import activosReducer from './almacenGeneral/Activos/activosReducer'
import proveedoresReducer from './almacenGeneral/Proveedores/proveedoresReducer'
import almacenGeneralTipos_Reducer from './almacenGeneral/Tipos/almacenGeneralTipos_Reducer'
import clasificacionesReducer from './almacenGeneral/Clasificaciones/clasificacionesReducer'

import sectionReducer from './sectionReducer'

const store = configureStore({
  reducer: {
    // Auth
    authUser: authReducer,

    // Users
    users: userReducer,

    // Empleados
    empleados: empleadosReducer,

    // Roles
    roles: rolesReducer,

    // Departamentos
    departamentos: departamentosReducer,

    // Menu
    section: sectionReducer,

    // AlmacenGeneral
    facturasaf: facturasReducer,
    activos: activosReducer,
    proveedor: proveedoresReducer,
    tiposAlmacenGeneral: almacenGeneralTipos_Reducer,
    clasificacion: clasificacionesReducer,

    //  otros reducers...
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(/* otros middlewares */),
});

// Tipos para el estado y el dispatch del store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
