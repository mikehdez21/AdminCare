// Bibliotecas
import React from 'react';

// Styles
import '../../../css/00_Utils/Paginacion.css'

interface PaginacionProps {
  paginaActual: number;
  numeroTotalPaginas: number;
  onPageChange: (nuevaPagina: number) => void;
  onPaginaAnterior: () => void;
  onPaginaSiguiente: () => void;
}

const Paginacion: React.FC<PaginacionProps> = ({ 
  paginaActual, 
  numeroTotalPaginas, 
  onPageChange, 
  onPaginaAnterior, 
  onPaginaSiguiente 
}) => {

  // Obtener el rango de páginas a mostrar (ej. 1-3)
  const obtenerRangoPaginas = () => {
    const maxPaginasVisibles = 3;
    const inicioRango = Math.max(1, paginaActual - Math.floor(maxPaginasVisibles / 2));
    const finRango = Math.min(numeroTotalPaginas, inicioRango + maxPaginasVisibles - 1);
    return Array.from({ length: finRango - inicioRango + 1 }, (_, i) => inicioRango + i);
  };

  return (
    <div className='paginacionDiv'>
      <button onClick={onPaginaAnterior} disabled={paginaActual === 1}>
        {'<'}
      </button>

      <button onClick={() => onPageChange(1)} disabled={paginaActual === 1}>
        Inicio
      </button>
      
      {obtenerRangoPaginas().map(pagina => (
        <button
          key={pagina}
          className={`page-button ${paginaActual === pagina ? 'active' : ''}`}
          onClick={() => onPageChange(pagina)}
        >
          {pagina}
        </button>
      ))}

      <button onClick={() => onPageChange(numeroTotalPaginas)} disabled={paginaActual === numeroTotalPaginas}>
        Final
      </button>

      <button onClick={onPaginaSiguiente} disabled={paginaActual === numeroTotalPaginas}>
        {'>'}
      </button>
    </div>
  );
};

export default Paginacion;
