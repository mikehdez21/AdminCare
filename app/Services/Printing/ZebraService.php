<?php

namespace App\Services\Printing;

use Exception;
use Illuminate\Support\Facades\Log;

class ZebraService
{
    private $host;
    private $port;
    private $timeout;
    private $printerName;
    private $socket;

    /**
     * Constructor - Inicializa parámetros de conexión
     */
    public function __construct()
    {
        $this->host = config('printing.zebra.host', 'localhost');
        $this->port = config('printing.zebra.port', 9100);
        $this->timeout = config('printing.zebra.timeout', 5);
        $this->printerName = config('printing.zebra.name', 'ZDesigner ZD620-300dpi ZPL');
    }

    /**
     * Conectar a la impresora Zebra por IP (TCP socket)
     * 
     * @return bool
     * @throws Exception
     */
    public function conectarIP()
    {
        try {
            $this->socket = @fsockopen($this->host, $this->port, $errno, $errstr, $this->timeout);

            if (!$this->socket) {
                throw new Exception(
                    "No se pudo conectar a la impresora Zebra en {$this->host}:{$this->port}. Error: $errstr ($errno)"
                );
            }

            // Configurar socket en modo no-bloqueante
            stream_set_blocking($this->socket, false);

            return true;

        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * Desconectar de la impresora
     */
    public function desconectar()
    {
        if ($this->socket) {
            fclose($this->socket);
            $this->socket = null;
        }
    }

    /**
     * Normalizar texto para ZPL (eliminar acentos y caracteres especiales)
     * 
     * @param string $texto
     * @return string
     */
    private function normalizarTextoZPL(string $texto): string
    {
        // Intentar transliterar con iconv
        $textoNormalizado = @iconv('UTF-8', 'ASCII//TRANSLIT', $texto);
        
        // Si iconv falla, hacer reemplazo manual
        if ($textoNormalizado === false) {
            $buscar = ['á', 'é', 'í', 'ó', 'ú', 'Á', 'É', 'Í', 'Ó', 'Ú', 'ñ', 'Ñ', 'ü', 'Ü'];
            $reemplazar = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U', 'n', 'N', 'u', 'U'];
            $textoNormalizado = str_replace($buscar, $reemplazar, $texto);
        }
        
        // Remover caracteres no ASCII restantes
        $textoNormalizado = preg_replace('/[^\x20-\x7E]/', '', $textoNormalizado);
        
        return $textoNormalizado;
    }

    /**
     * Generar código ZPL para etiqueta con QR
     * 
     * @param string $dataQR          - Datos a codificar en el QR (URL o código)
     * @param string $codigoUnico     - Código único del activo
     * @param string $nombreaf        - Nombre del activo
     * @param int    $anchoMM         - Ancho de etiqueta en mm (default 50)
     * @param int    $altoMM          - Alto de etiqueta en mm (default 50)
     * 
     * @return string - Código ZPL listo para imprimir
     */
    public function generarZPL(
        string $dataQR,
        string $codigoUnico,
        string $nombreaf,
        int $anchoMM = 80,
        int $altoMM = 50
    ): string
    {
        // Convertir mm a puntos (1 mm ≈ 2.834645669 puntos en 300 DPI)
        $puntosAncho = (int)($anchoMM * 8.47);    // 300 DPI
        $puntosAlto = (int)($altoMM * 8.47);

        // Normalizar texto para ZPL (sin acentos ni caracteres especiales)
        $codigoUnico = $this->normalizarTextoZPL($codigoUnico);
        $nombreaf = $this->normalizarTextoZPL($nombreaf);

        // Limpiar texto para ZPL (máximo 50 caracteres por línea)
        $codigoUnico = substr($codigoUnico, 0, 30);
        $nombreaf = substr($nombreaf, 0, 80);

        // Generar ZPL (formato 63x30mm aproximadamente)
        $labelWidth = 800;  // 63mm aprox a 300 DPI - 756 Anteriormente
        $labelHeight = 354; // 30mm aprox a 300 DPI

        $zpl = "^XA\n"; // Inicio de formato
        $zpl .= "^LL{$labelHeight}\n"; // Alto
        $zpl .= "^PW{$labelWidth}\n"; // Ancho

        // Titulo centrado (mas cerca del QR)
        $zpl .= "^FO0,20\n";
        $zpl .= "^A0N,24,20\n";
        $zpl .= "^FB{$labelWidth},1,0,C,0^FDHospital San Serafin^FS\n";

        // Codigo QR centrado
        $qrBox = 160;
        $qrX = (int)(($labelWidth - $qrBox) / 2);
        $qrY = 55;
        $zpl .= "^FO{$qrX},{$qrY}\n";
        $zpl .= "^BQN,2,4\n"; // QR: N=rotacion normal, 2=tamano, 4=nivel error medio
        $zpl .= "^FDQA,$dataQR^FS\n";

        // Logos a los lados del QR
        $logoPath = '/var/www/pruebas_hssadmincare/public/img/logo/logoNegro.png';
        $logoSize = 60;
        $logoGap = 20;
        $logoZpl = $this->generarLogoZpl($logoPath, $logoSize, $logoSize);
        if ($logoZpl) {
            $logoLeftX = max(0, $qrX - $logoSize - $logoGap);
            $logoRightX = min($labelWidth - $logoSize, $qrX + $qrBox + $logoGap);
            $logoY = $qrY + 5;
            $zpl .= "^FO{$logoLeftX},{$logoY}\n";
            $zpl .= $logoZpl . "\n";
            $zpl .= "^FO{$logoRightX},{$logoY}\n";
            $zpl .= $logoZpl . "\n";
        }

        // Codigo unico y nombre en la misma linea
        $zpl .= "^A0N,24,20\n";
        $zpl .= "^FO0,245\n";
        $zpl .= "^FB{$labelWidth},1,0,C,0^FD$codigoUnico^FS\n";

        // Nombre del activo centrado (texto mas grande)
        $zpl .= "^FO0,280\n";
        $zpl .= "^A0N,20,18\n";
        $zpl .= "^FB{$labelWidth},2,2,C,0^FD$nombreaf^FS\n";

        $zpl .= "^XZ\n"; // Fin de formato

        return $zpl;
    }

    /**
     * Generar ZPL alternativo más compacto (50x25mm)
     */
    public function generarZPLCompacto(
        string $dataQR,
        string $codigoUnico,
        string $nombreaf,
        int $anchoMM = 80,
        int $altoMM = 25
    ): string
    {
        // Normalizar texto para ZPL
        $codigoUnico = $this->normalizarTextoZPL($codigoUnico);
        $nombreaf = $this->normalizarTextoZPL($nombreaf);

        $codigoUnico = substr($codigoUnico, 0, 25);

        $zpl = "^XA\n";
        $zpl .= "^LL100\n"; // Altura reducida
        $zpl .= "^PW576\n"; // Ancho estándar

        // QR a la izquierda
        $zpl .= "^FO10,10\n";
        $zpl .= "^BQN,2,3\n"; // QR más pequeño
        $zpl .= "^FDQA,$dataQR^FS\n";

        // Datos a la derecha del QR
        $zpl .= "^FO180,15\n";
        $zpl .= "^A0N,16,14^FD$codigoUnico^FS\n";

        $zpl .= "^FO180,40\n";
        $zpl .= "^A0N,16,14^FD$nombreaf^FS\n";

        $zpl .= "^XZ\n";

        return $zpl;
    }

    /**
     * Convertir PNG a ZPL (^GFA) para imprimir logos
     *
     * @param string $ruta
     * @param int $ancho
     * @param int $alto
     * @return string|null
     */
    private function generarLogoZpl(string $ruta, int $ancho, int $alto): ?string
    {
        if (!file_exists($ruta)) {
            Log::warning('Logo Zebra no encontrado', ['ruta' => $ruta]);
            return null;
        }

        if (!function_exists('imagecreatefrompng')) {
            Log::warning('GD no disponible para convertir logo a ZPL');
            return null;
        }

        $img = @imagecreatefrompng($ruta);
        if (!$img) {
            Log::warning('No se pudo cargar PNG para logo', ['ruta' => $ruta]);
            return null;
        }

        $resized = imagecreatetruecolor($ancho, $alto);
        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        imagecopyresampled(
            $resized,
            $img,
            0,
            0,
            0,
            0,
            $ancho,
            $alto,
            imagesx($img),
            imagesy($img)
        );
        imagedestroy($img);

        $bytesPerRow = (int)ceil($ancho / 8);
        $totalBytes = $bytesPerRow * $alto;
        $hexData = '';

        for ($y = 0; $y < $alto; $y++) {
            $byte = 0;
            $bitCount = 0;
            for ($x = 0; $x < $ancho; $x++) {
                $rgba = imagecolorsforindex($resized, imagecolorat($resized, $x, $y));
                $alpha = $rgba['alpha'] ?? 0;
                $luma = (int)(0.299 * $rgba['red'] + 0.587 * $rgba['green'] + 0.114 * $rgba['blue']);
                $isBlack = $alpha < 60 && $luma < 128;

                $byte = ($byte << 1) | ($isBlack ? 1 : 0);
                $bitCount++;

                if ($bitCount === 8) {
                    $hexData .= str_pad(strtoupper(dechex($byte)), 2, '0', STR_PAD_LEFT);
                    $byte = 0;
                    $bitCount = 0;
                }
            }

            if ($bitCount > 0) {
                $byte = $byte << (8 - $bitCount);
                $hexData .= str_pad(strtoupper(dechex($byte)), 2, '0', STR_PAD_LEFT);
            }
        }

        imagedestroy($resized);

        return "^GFA,{$totalBytes},{$totalBytes},{$bytesPerRow},{$hexData}^FS";
    }

    /**
     * Enviar comando ZPL a la impresora
     * 
     * @param string $zpl - Código ZPL a imprimir
     * 
     * @return array - ['success' => bool, 'message' => string]
     * @throws Exception
     */
    public function imprimirZPL(string $zpl): array
    {
        try {
            if (!$this->socket) {
                return [
                    'success' => false,
                    'message' => 'No hay conexión activa con la impresora. Conecta primero.'
                ];
            }

            // Enviar ZPL a la impresora
            $bytesEnviados = fwrite($this->socket, $zpl);

            if ($bytesEnviados === false) {
                return [
                    'success' => false,
                    'message' => 'Error al enviar datos a la impresora'
                ];
            }

            // Esperar confirmación (pequeña pausa)
            usleep(500000); // 500ms

            return [
                'success' => true,
                'message' => 'Etiqueta enviada a la impresora correctamente',
                'bytes_enviados' => $bytesEnviados
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al imprimir: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Procesar impresión completa: conectar, generar ZPL, imprimir
     * 
     * @param array $datos - ['qr' => url/codigo, 'codigo' => string, 'nombreaf' => string]
     * @param bool  $compacto - Usar formato compacto si es true
     * 
     * @return array - ['success' => bool, 'message' => string]
     */
    public function impresionCompleta(array $datos, bool $compacto = false): array
    {
        try {
            // Validar datos
            if (empty($datos['qr']) || empty($datos['codigo'])) {
                return [
                    'success' => false,
                    'message' => 'Faltan datos requeridos para la impresión'
                ];
            }

            // Conectar
            if (!$this->conectarIP()) {
                return [
                    'success' => false,
                    'message' => 'No se pudo conectar a la impresora Zebra'
                ];
            }

            // Generar ZPL
            $zpl = $compacto
                ? $this->generarZPLCompacto(
                    $datos['qr'],
                    $datos['codigo'],
                    $datos['nombreaf'] ?? 'Sin Nombre'
                )
                : $this->generarZPL(
                    $datos['qr'],
                    $datos['codigo'],
                    $datos['nombreaf'] ?? 'Sin Nombre'
                );

            // Imprimir
            $resultado = $this->imprimirZPL($zpl);

            // Desconectar
            $this->desconectar();

            // Log de impresión (opcional)
            Log::info('Impresión Zebra completada', [
                'exito' => $resultado['success'],
                'codigo' => $datos['codigo'],
                'mensaje' => $resultado['message']
            ]);

            return $resultado;

        } catch (Exception $e) {
            $this->desconectar();
            Log::error('Error en impresión Zebra: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Error en el proceso de impresión: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Enviar comando de prueba a la impresora (verificar conexión)
     */
    public function testConexion(): array
    {
        try {
            $this->conectarIP();

            // Comando para obtener información de la impresora
            $comando = "~HI\n"; // Home/Información

            $resultado = $this->imprimirZPL($comando);
            $this->desconectar();

            return $resultado;

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al probar conexión: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Obtener información del host y puerto configurado
     */
    public function getConfiguracion(): array
    {
        return [
            'host' => $this->host,
            'puerto' => $this->port,
            'nombre' => $this->printerName,
            'timeout' => $this->timeout
        ];
    }
}
