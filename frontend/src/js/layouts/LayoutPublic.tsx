import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/variableApi';


const Layout_Public: React.FC = () => {

  const location = useLocation(); // Obtener la ruta actual
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // Estado de autenticación
  
  const storedUser = localStorage.getItem('userData');
  const user = storedUser ? JSON.parse(storedUser) : null;
  
  // Almacenar la ruta actual en localStorage cada vez que cambie
  useEffect(() => {
    // Función para verificar la autenticación con el backend
    const checkAuth = async () => {
      try {
        // Realizar una solicitud al backend para verificar la autenticación
        const response = await axios.get(`${API_BASE_URL}/api/HSS1/auth/check`, {
          withCredentials: true, // Incluir cookies si usas sesiones
        });

        console.log(response)

        // Si el backend responde con éxito, el usuario está autenticado
        if (response.data.isAuthenticated) {
          setIsAuthenticated(true);
          console.log('LayoutPublicAUTH:', response.data.isAuthenticated)
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

  if (location)
  // Si no está autenticado y no hay usuario en localStorage, redirigir al login
    if (isAuthenticated == true && user!) {
      console.log('LayoutPublicAUTH: Usuario Logeado');
    }else{

      console.log('LayoutPublicAUTH: Usuario NO Logeado');
      return <Outlet/>

    }

}

export default Layout_Public
