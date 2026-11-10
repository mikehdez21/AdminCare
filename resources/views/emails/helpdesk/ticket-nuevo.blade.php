@extends('emails.helpdesk.layout')

@section('titulo', "Nuevo ticket {$ticket->folio_ticket}")
@section('encabezado', '📥 Nuevo reporte en tu área')

@section('contenido')
  <p style="font-size: 15px; margin-bottom: 8px;">
    <strong>Se registró un nuevo reporte que requiere atención del área.</strong>
  </p>

  <p style="font-size: 15px; margin-bottom: 20px;">
    <strong>Fecha de creación:</strong> {{ $ticket->created_at?->format('d/m/Y H:i') }}
  </p>

  <p style="font-size: 15px; margin-bottom: 8px;">
    <strong>Folio:</strong> {{ $ticket->folio_ticket }}
  </p>

  <p style="font-size: 15px; margin-bottom: 8px;">
    <strong>Solicitante:</strong> {{ $ticket->solicitante?->nombre_usuario ?? '—' }}
  </p>

  <div style="border-top: 1px dashed #bfa0e6; margin: 20px 0;"></div>

  <h3 style="color: #6a0dad; font-size: 18px; margin-bottom: 10px;">Título del Reporte</h3>
  <p style="background-color: #f2e9ff; padding: 12px; border-radius: 6px; font-weight: 500; margin-bottom: 20px;">
    {{ $ticket->titulo_ticket }}
  </p>

  <h3 style="color: #6a0dad; font-size: 18px; margin-bottom: 10px;">Detalle del Reporte</h3>
  <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e0d0f0; margin-bottom: 20px;">
    <p style="margin: 0; font-size: 15px;">"{!! nl2br(e($ticket->descripcion_ticket)) !!}"</p>
  </div>

  <p style="font-size: 15px; margin-bottom: 8px;">
    <strong>Categoría:</strong> {{ $ticket->categoria?->nombre_categoria ?? '—' }}
  </p>

  <p style="font-size: 15px; margin-bottom: 8px;">
    <strong>Subcategoría:</strong> {{ $ticket->subcategoria?->nombre_subcategoria ?? '—' }}
  </p>

  <p style="font-size: 15px; margin-bottom: 8px;">
    <strong>Prioridad:</strong> {{ $ticket->prioridad?->nombre_prioridad ?? '—' }}
  </p>

  <p style="font-size: 15px; margin-bottom: 25px;">
    <strong>Fecha límite de respuesta:</strong> {{ $ticket->fecha_limite_respuesta?->format('d/m/Y H:i') ?? '—' }}
  </p>

  <p style="font-size: 15px; margin-bottom: 25px;">
    Revisa el ticket en la Mesa de Ayuda para asignarlo y darle seguimiento.
  </p>
@endsection
