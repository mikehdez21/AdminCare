<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>@yield('titulo', 'Mesa de Ayuda HSS')</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff;">

<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f9f4ff; padding: 20px; border-radius: 10px; border-left: 5px solid #6a0dad; color: #333;">

  <h2 style="color: #6a0dad; margin-top: 0; font-size: 20px;">
    @yield('encabezado')
  </h2>

  @yield('contenido')

  <div style="font-size: 12px; color: #6a0dad; font-weight: bold; border-top: 1px solid #e0d0f0; padding-top: 10px;">
    Hospital San Serafín<br>
    Departamento de Sistemas
  </div>

</div>

</body>
</html>
