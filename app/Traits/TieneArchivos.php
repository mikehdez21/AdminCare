<?php

namespace App\Traits;

use App\Models\AlmacenGeneral\ArchivosDigitales;

trait TieneArchivos
{
    // Relación polimórfica con archivos
    public function archivos()
    {
        return ArchivosDigitales::porReferencia($this->getTable(), $this->getKey());
    }

    // Obtener archivos activos
    public function archivosActivos()
    {
        return $this->archivos()->where('activo', true)->get();
    }

    // Agregar adjunto
    public function agregarAdjunto($archivo, $descripcion = null)
    {
        $nombreOriginal = $archivo->getClientOriginalName();
        $nombreAlmacenado = time() . '_' . $nombreOriginal;
        $ruta = $archivo->storeAs('archivos/' . $this->getTable(), $nombreAlmacenado);

        return ArchivosDigitales::create([
            'nombre_original' => $nombreOriginal,
            'nombre_almacenado' => $nombreAlmacenado,
            'tipo_contenido' => $archivo->getMimeType(),
            'tamano' => $archivo->getSize(),
            'ruta_archivo' => $ruta,
            'descripcion' => $descripcion,
            'tabla_referencia' => $this->getTable(),
            'id_referencia' => $this->getKey(),
            'id_usuario_subida' => auth()->id(),
        ]);
    }
}