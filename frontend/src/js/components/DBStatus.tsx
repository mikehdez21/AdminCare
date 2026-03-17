import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/variableApi';

type DBStatusResponse = {
  success: boolean;
  message: string;
  status_code?: number;
};

const DBStatus: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const checkDBStatus = async () => {
    setLoading(true);
    setMessage('');

    try {
      const base = API_BASE_URL || '';
      const response = await axios.get<DBStatusResponse>(
        base ? `${base}/api/HSS1/dbstatus` : '/api/HSS1/dbstatus',
        { withCredentials: true }
      );

      setSuccess(Boolean(response.data?.success));
      setMessage(response.data?.message || 'Conexión a base de datos OK');
      setStatusCode(response.data?.status_code || response.status);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSuccess(false);
        setStatusCode(error.response?.status || null);
        setMessage(error.response?.data?.message || 'Error verificando la base de datos');
      } else {
        setSuccess(false);
        setMessage('Error desconocido verificando la base de datos');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDBStatus();
  }, []);

  return (
    <div>
      <h1>Estado de Base de Datos</h1>

      {loading && <p>Verificando conexión a BD...</p>}

      {!loading && success === true && (
        <p>
          {message} {statusCode ? `(HTTP ${statusCode})` : ''}
        </p>
      )}

      {!loading && success === false && (
        <p>
          Error: {message} {statusCode ? `(HTTP ${statusCode})` : ''}
        </p>
      )}

      <button type="button" onClick={checkDBStatus} disabled={loading}>
        {loading ? 'Verificando...' : 'Reintentar'}
      </button>
    </div>
  );
};

export default DBStatus;