import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { checkApiStatus } from '@/store/statusActions';

const Status: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { success, message, statusCode, loading, error } = useSelector(
    (state: RootState) => state.apiStatus
  );

  const handleRetry = () => {
    dispatch(checkApiStatus());
  };

  useEffect(() => {
    dispatch(checkApiStatus());
  }, [dispatch]);

  return (
    <div>
      <h1>Estado de API HSSAdminCare</h1>

      {loading && <p>Verificando conexión...</p>}

      {!loading && error && <p>Error: {error}</p>}

      {!loading && !error && success && (
        <p>
          {message} (HTTP {statusCode})
        </p>
      )}

      {!loading && !error && success === false && (
        <p>No se recibió confirmación de estado correcto.</p>
      )}

      <button type="button" onClick={handleRetry} disabled={loading}>
        {loading ? 'Verificando...' : 'Reintentar'}
      </button>
    </div>
  );
};

export default Status;


