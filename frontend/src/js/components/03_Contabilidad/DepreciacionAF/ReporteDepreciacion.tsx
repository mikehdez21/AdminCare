import React from 'react';


// Types

// Componentes

const ReporteDepreciacion: React.FC = () => {


    const renderReporteDepreciacion = () => (
        <h1>Reporte de Depreciación</h1>
    )


    return (
        <div className='mainDiv_AFDepartamentos'>

            {renderReporteDepreciacion()}

        </div>
    )
}

export default ReporteDepreciacion;