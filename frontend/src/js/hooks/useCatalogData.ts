import { useEffect, useRef } from 'react';

/**
 * Hook genérico para cargar datos de catálogo desde Redux.
 * Sigue el patrón "fetch si vacío": solo despacha la acción de carga
 * si la lista proporcionada está vacía.
 *
 * Corrección de deps (Fase 2): usa un ref para almacenar fetchAction
 * y evitar re-renders infinitos cuando el callback cambia de referencia
 * entre renders (patrón que causaba riesgo en EditFactura con deps [dispatch]).
 * El efecto solo se re-ejecuta cuando list cambia desde el store.
 *
 * @param list - La lista actual del store (resultado de useAppSelector)
 * @param fetchAction - Acción/thunk que trae los datos del servidor
 */
export function useCatalogData<T>(
  list: T[] | undefined,
  fetchAction: () => void,
): void {
  const fetchActionRef = useRef(fetchAction);
  fetchActionRef.current = fetchAction;

  useEffect(() => {
    if (!list || list.length === 0) {
      fetchActionRef.current();
    }
  }, [list]);
}
