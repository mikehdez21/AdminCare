<?php

namespace App\Services\Contabilidad;

use App\Models\AlmacenGeneral\ActivosFijos;
use Exception;

class DepreciacionService
{
    
    /**
     * Calcula la depreciación anual de un activo
     * 
     * @param ActivosFijos $activo - Debe tener relación metodoDepreciacion cargada
     * @param int $anio - Año para el cálculo
     * @param float $valorResidual - Valor residual del activo
     * @param int $vidaUtil - Vida útil en años
     * @return array Resultado del cálculo con estructura [valor_depreciacion_anual, valor_depreciacion_acumulada, valor_libros_af]
     * @throws Exception
     */
    public function calcularDepreciacion(ActivosFijos $activo, int $anio, float $valorResidual, int $vidaUtil): array
    {
        // Validar que el activo tenga la relación de método cargada
        if (!$activo->relationLoaded('metodoDepreciacion') || !$activo->metodoDepreciacion) {
            throw new Exception("Activo no tiene método de depreciación cargado");
        }

        $metodo = $activo->metodoDepreciacion->nombre_metodo;

        return match ($metodo) {
            'Lineal' => $this->calcularLineal($activo, $anio, $valorResidual, $vidaUtil),
            /* 'Saldo Decreciente' => $this->calcularSaldoDecreciente($activo, $anio, $valorResidual, $vidaUtil),
            'Dígitos de Suma' => $this->calcularDigitosSuma($activo, $anio, $valorResidual, $vidaUtil), */
            default => throw new Exception("Método desconocido: $metodo")
        };
    }

    private function calcularLineal(ActivosFijos $activo, int $anio, float $valorResidual, int $vidaUtil): array
    {
        $depreciacionAnual = ($activo->costo_unitario_af - $valorResidual) / $vidaUtil;

        // Acceder a la relación como propiedad (sin paréntesis)
        $ultimaDepreciacion = $activo->ultimaDepreciacion;
        $acumuladaAnterior = $ultimaDepreciacion?->valor_depreciacion_acumulada ?? 0;

        return [
            'valor_depreciacion_anual' => $depreciacionAnual,
            'valor_depreciacion_acumulada' => $acumuladaAnterior + $depreciacionAnual,
            'valor_libros_af' => $activo->costo_unitario_af - ($acumuladaAnterior + $depreciacionAnual),
        ];
    }

    /* private function calcularSaldoDecreciente(ActivosFijos $activo, int $anio, float $valorResidual, int $vidaUtil): array
    {
        // Implementar lógica
    }

    private function calcularDigitosSuma(ActivosFijos $activo, int $anio, float $valorResidual, int $vidaUtil): array
    {
        // Implementar lógica
    }
 */
}
