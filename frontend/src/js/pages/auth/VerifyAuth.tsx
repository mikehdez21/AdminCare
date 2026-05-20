import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/variableApi';

const VerifyAuth: React.FC = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    localStorage.setItem('lastPath', location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/HSS1/auth/check`, {
          withCredentials: true,
        });

        if (active) {
          setIsAuthenticated(Boolean(response.data.isAuthenticated));
        }
      } catch {
        if (active) {
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();
    return () => {
      active = false;
    };
  }, []);

  if (isAuthenticated === null) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default VerifyAuth;