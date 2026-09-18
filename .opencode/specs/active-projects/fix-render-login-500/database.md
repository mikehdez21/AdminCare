# Base de datos

La migración `007_BD_principal_Usuarios_table.php` es la fuente vigente para
`tableUsuarios` y no contiene `ultimo_acceso`. Esta corrección no añade una
migración de compatibilidad ni modifica datos existentes; simplemente no
intenta actualizar una columna ausente. `id_departamento` es nullable y el
payload debe tolerar una relación inexistente.
