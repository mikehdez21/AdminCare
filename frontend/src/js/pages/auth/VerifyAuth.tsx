import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/variableApi';

const VerifyAuth: React.FC = () => {
  const location = useLocation(); // Obtener la ruta actual
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // Estado de autenticación

  useEffect(() => {
    // Función para verificar la autenticación con el backend
    const checkAuth = async () => {
      try {
        // Realizar una solicitud al backend para verificar la autenticación
        const response = await axios.get(`${API_BASE_URL}/api/HSS1/auth/check`, {
          withCredentials: true, // Incluir cookies si usas sesiones
        });

        // Si el backend responde con éxito, el usuario está autenticado
        if (response.data.isAuthenticated) {
          setIsAuthenticated(true);
          localStorage.setItem('lastPath', location.pathname); // Guardar la última ruta
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Si ocurre un error (por ejemplo, 401 Unauthorized), el usuario no está autenticado
        console.log(error)
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [location]);

  // Si aún no se ha determinado la autenticación, mostrar un estado de carga
  if (isAuthenticated === null) {
    return <div>Cargando...</div>;
  }

  // Si el usuario no está autenticado, redirigir al login
  if (!isAuthenticated) {
    console.log('Usuario no autenticado. Redirigiendo al login...');
    return <Navigate to="/login" />;
  }

  // Si el usuario está autenticado, renderizar el contenido protegido
  return <Outlet />;
};

export default VerifyAuth;