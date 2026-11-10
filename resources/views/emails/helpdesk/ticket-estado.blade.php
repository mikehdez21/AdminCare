@extends('emails.helpdesk.layout')

@section('titulo', "Ticket {$ticket->folio_ticket} ahora está en {$estatusNuevo}")
@section('encabezado', '🔄 El ticket cambió de estado')

@section('contenido')
  <p style="font-size: 15px; margin-bottom: 20px;">
    <strong>El siguiente reporte llegó a un estado final con fecha:</strong> {{ $ticket->updated_at?->format('d/m/Y H:i') }}
  </p>

  <p style="font-size: 15px; margin-bottom: 8px;">
    <strong>Folio:</strong> {{ $ticket->folio_ticket }}
  </p>

  <div style="border-top: 1px dashed #bfa0e6; margin: 20px 0;"></div>

  <h3 style="color: #6a0dad; font-size: 18px; margin-bottom: 10px;">Estatus del Reporte</h3>
  <p style="background-color: #f2e9ff; padding: 12px; border-radius: 6px; font-weight: 500; margin-bottom: 20px;">
    {{ $estatusAnterior }} → {{ $estatusNuevo }}
  </p>

  <h3 style="color: #6a0dad; font-size: 18px; margin-bottom: 10px;">Título del Reporte</h3>
  <p style="background-color: #f2e9ff; padding: 12px; border-radius: 6px; font-weight: 500; margin-bottom: 20px;">
    {{ $ticket->titulo_ticket }}
  </p>

  @if($comentario)
    <h3 style="color: #6a0dad; font-size: 18px; margin-bottom: 10px;">Comentario</h3>
    <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e0d0f0; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 15px;">"{!! nl2br(e($comentario)) !!}"</p>
    </div>
  @endif

  @if($actor)
    <p style="font-size: 15px; margin-bottom: 25px;">
      <strong>Realizado por:</strong> {{ $actor }}
    </p>
  @endif

  <p style="font-size: 15px; margin-bottom: 25px;">
    Puede dar seguimiento a este reporte en la Mesa de Ayuda.
  </p>
@endsection
