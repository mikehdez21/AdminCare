import React, { lazy, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import store from './store/store';
import { AppDispatch } from './store/store';
import { checkAuthSession, } from './store/authActions';
import { setCurrentUser } from './store/administrador/Users/usersReducer';

const Layout_Public = lazy(() => import('./layouts/LayoutPublic'));
const MainLayout = lazy(() => import('./layouts/MainLayout'));

const Status = lazy(() => import('./components/Status'));
const PageLogin = lazy(() => import('./components/Login/PageLogin'));
const ActivoQRPublic = lazy(() => import('./pages/ActivoQRPublic'));
const DemoUnavailable = lazy(() => import('./pages/DemoUnavailable'));

const ProtectedRoutes = lazy(() => import('./pages/auth/ProtectedRoutes'));


// Styles
import '../css/app.css'

const DemoNotice: React.FC = () => (
  <div className="demo-notice" role="status">
    <strong>Demo SQLite</strong> Datos sintéticos y reiniciables. La cuota de escrituras es global y limitada a 100.
  </div>
);

const App: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>();

  // Verificar sesión activa en el servidor al cargar la app + limpiar claves legacy
  useEffect(() => {
    const restoreSession = async () => {
      // checkAuthSession SIEMPRE resuelve fulfilled (nunca rechaza).
      // El resultado contiene { success, userData, ... } en todos los caminos.
      try {
        const result = await dispatch(checkAuthSession()).unwrap();
        if (result.success && result.userData) {
          dispatch(setCurrentUser(result.userData)); // Restaurar currentUser para el shell autenticado
        }
      } catch (error) {
        console.error('Error inesperado al restaurar la sesión:', error);
      }
      // Si success===false, authReducer ya reseteó el estado;
      // se redirige al login vía ProtectedRoutes.
    };
    restoreSession();
    ['userData', 'userRol', 'userDepartamento', 'userRolPermissions', 'selectedSection'].forEach((k) => localStorage.removeItem(k));
  }, [dispatch]);

  return (
    <Router>
      <DemoNotice />
        <Routes>


          {/* Rutas públicas */}
          <Route path="/" element={<Layout_Public />} >
            <Route index element={<Navigate to="/login" />} />
            <Route path='/status' element={<Status />} />
            <Route path='/login' element={<PageLogin />} />
            <Route path='/activosfijos/qraf/scan/:codigoQR' element={<ActivoQRPublic />} />
            <Route path='/activosfijos/qraf/:codigoQR' element={<ActivoQRPublic />} />
          </Route>


          <Route element={<ProtectedRoutes />} >
            {/* Shell autenticado: Sidebar visible y contenido vacío hasta elegir un módulo. */}
            <Route path="/app" element={<MainLayout />} />
            <Route path="/admin" element={<MainLayout />} />

            {/* Almacenes */}
            <Route path="/almacen-general/*" element={<MainLayout />} />
            <Route path="/almacen-general/printer/*" element={<DemoUnavailable />} />
            <Route path="/almacen_general/*" element={<MainLayout />} />

            {/* Contabilidad */}
            <Route path="/contabilidad/depreciacion-af/*" element={<MainLayout />} />
            <Route path="/contabilidad/depreciacionaf/*" element={<MainLayout />} />
            <Route path="/contabilidad/configuracion/*" element={<MainLayout />} />
            <Route path="/contabilidad/auditoria/*" element={<MainLayout />} />

            {/* Administrador */}
            <Route path="/gestion-usuarios/*" element={<MainLayout />} />
            <Route path="/gestion_usuarios/*" element={<MainLayout />} />
            <Route path="/gestion-empleados/*" element={<MainLayout />} />
            <Route path="/gestion_empleados/*" element={<MainLayout />} />
            <Route path="/gestion-roles/*" element={<MainLayout />} />
            <Route path="/gestion_roles/*" element={<MainLayout />} />
            <Route path="/gestion-departamentos/*" element={<MainLayout />} />
            <Route path="/gestion_departamentos/*" element={<MainLayout />} />
            <Route path="/gestion-ubicaciones/*" element={<MainLayout />} />
            <Route path="/gestion_ubicaciones/*" element={<MainLayout />} />


          </Route>



        </Routes>
    </Router>
  )
}

export default App;

const rootElement = document.getElementById('root');
if (rootElement) {
  const Index = ReactDOM.createRoot(rootElement);
  Index.render(
    <Provider store={store}>
        <App />
    </Provider>
  );
}
