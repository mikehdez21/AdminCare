import React, { Suspense, lazy, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import store from './store/store';
import { AppDispatch } from './store/store';
import { setCurrentUser } from './store/administrador/Users/usersReducer';

const Layout_Public = lazy(() => import('./layouts/LayoutPublic'));
const LayoutAdmin = lazy(() => import('./layouts/LayoutAdmin'));
const LayoutJefatura = lazy(() => import('./layouts/LayoutJefatura'));
const LayoutUsuario = lazy(() => import('./layouts/LayoutUsuario'));

const Status = lazy(() => import('./components/Status'));
const DBStatus = lazy(() => import('./components/DBStatus'));
const PageLogin = lazy(() => import('./components/Login/PageLogin'));
const ActivoQRPublic = lazy(() => import('./pages/ActivoQRPublic'));

const ProtectedRoutes = lazy(() => import('./pages/auth/ProtectedRoutes'));

// Styles
import '../css/app.css'

const RouteLoader: React.FC = () => (
  <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
    Cargando modulo...
  </div>
);

const App: React.FC = () => {
  
  const dispatch = useDispatch<AppDispatch>(); 

  // Recuperar Usuario Logeado y su Información desde LOCALSTORAGE
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');

    if (storedUser) {
      dispatch(setCurrentUser(JSON.parse(storedUser)));
    }

  }, [dispatch]);

  return (
    <Router>
      <Suspense fallback={<RouteLoader />}>
        <Routes>

        
        {/* Rutas públicas */}
        <Route path="/" element={<Layout_Public />} >
          <Route index element={<Navigate to="/login" />} />
          <Route path='/status' element={<Status />} />
          <Route path='/dbstatus' element={<DBStatus />} />
          <Route path='/login' element={<PageLogin />} />
          <Route path='/activosfijos/qraf/scan/:codigoQR' element={<ActivoQRPublic />} />
        </Route>



        {/* Rutas protegidas - Admin */}
        <Route element={<ProtectedRoutes />} >
          <Route path="/admin" element={<LayoutAdmin />} />

          {/* Almacenes */}
          <Route path="/almacen_general/*" element={<LayoutAdmin />} />
          <Route path="/servicios_generales/*" element={<LayoutAdmin />} />
          <Route path="/farmacia_interna/*" element={<LayoutAdmin />} />

          {/* Administrador */}
          <Route path="/gestion_usuarios/*" element={<LayoutAdmin />} />
          <Route path="/gestion_empleados/*" element={<LayoutAdmin />} />
          <Route path="/gestion_roles/*" element={<LayoutAdmin />} />
          <Route path="/gestion_departamentos/*" element={<LayoutAdmin />} />
          <Route path="/gestion_ubicaciones/*" element={<LayoutAdmin />} />


        </Route>



        {/* Rutas protegidas - Jefaturas */}
        <Route element={<ProtectedRoutes />} >
          <Route path="/dashboard" element={<LayoutJefatura />} />
          <Route path="/home" element={<LayoutUsuario />} />


          {/* Almacenes */}
          <Route path="/almacen_general/*" element={<LayoutJefatura />} />
          <Route path="/servicios_generales/*" element={<LayoutJefatura />} />
          <Route path="/farmacia_interna/*" element={<LayoutJefatura />} />

        </Route>




        {/* Rutas protegidas - Usuarios */}
        <Route element={<ProtectedRoutes />} >
          
          {/* Almacenes */}
          <Route path="/almacen_general/*" element={<LayoutUsuario />} />
          <Route path="/almacen_general/facturas/nuevaFactura" element={<LayoutUsuario />} />


          <Route path="/servicios_generales/*" element={<LayoutUsuario />} />
          <Route path="/farmacia_interna/*" element={<LayoutUsuario />} />

        </Route>








      </Routes>
      </Suspense>
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

