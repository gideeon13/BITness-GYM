<?php
// Incluir la configuración de conexión a la base de datos
include '../../../../config/conexion.php';
session_start();

require 'paga.php'; // Incluir archivo que registra la suscripción y devuelve los datos necesarios
require('../../../../vendor/autoload.php');
require('../../../../vendor/setasign/fpdf/fpdf.php');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

    // Asegúrate de que tu servidor esté configurado para aceptar solicitudes JSON
header('Content-Type: application/json');

// Obtener la entrada JSON
$input = file_get_contents('php://input');

// Decodificar el JSON en un array asociativo
$data = json_decode($input, true);

// Comprobar si la decodificación fue exitosa
if (json_last_error() === JSON_ERROR_NONE) {
    // Guardar los datos en variables
    $id_sucursal = $data['id_sucursal'];
    $id_suscripcion = $data['id_suscripcion'];
    $fecha_inicio = $data['fecha_inicio'];
    $fecha_fin = $data['fecha_fin'];

    $id_usuario = $_SESSION['id_usuario'];

    try {
        // Consultar información de la Sucursal
        $sucursalQuery = "SELECT telefono, calle, ciudad FROM SUCURSAL WHERE id_sucursal = :id_sucursal";
        $stmt = $conn->prepare($sucursalQuery); 
        $stmt->bindParam(':id_sucursal', $id_sucursal, PDO::PARAM_INT);
        $stmt->execute();
        $sucursal = $stmt->fetch(PDO::FETCH_ASSOC);

        // Consultar información de la relación Paga
        $pagaQuery = "SELECT fecha_inicio, fecha_fin FROM PAGA WHERE id_usuario_FK = :id_usuario";
        $stmt = $conn->prepare($pagaQuery);
        $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $stmt->execute();
        $paga = $stmt->fetch(PDO::FETCH_ASSOC);

        // Consultar información del Usuario
        $usuarioQuery = "SELECT email, ci, nombre FROM USUARIO WHERE id_usuario = :id_usuario";
        $stmt = $conn->prepare($usuarioQuery);
        $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $stmt->execute();
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        // Consultar información de la Suscripción
        $suscripcionQuery = "SELECT categoria_sus, duracion_sus, precio_sus FROM SUSCRIPCION WHERE id_suscripcion = :id_suscripcion";
        $stmt = $conn->prepare($suscripcionQuery);
        $stmt->bindParam(':id_suscripcion', $id_suscripcion, PDO::PARAM_INT);
        $stmt->execute();
        $suscripcion = $stmt->fetch(PDO::FETCH_ASSOC);

        // Responder con la información obtenida
        echo json_encode([
            'status' => 'success',
            'message' => 'Consulta realizada correctamente.',
            'sucursal' => $sucursal,
            'paga' => $paga,
            'usuario' => $usuario,
            'suscripcion' => $suscripcion,
        ]);

    } catch (Exception $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Error en la consulta: ' . $e->getMessage()
        ]);
    }
}

// Crear una nueva clase que extiende FPDF
class PDF extends FPDF {
    function SimpleRect($x, $y, $w, $h, $style = '') {
        // Método para crear un rectángulo simple
        $this->SetLineWidth(0.3);
        $this->SetFillColor(255, 255, 255);
        $this->SetDrawColor(0, 0, 0);
        $this->Rect($x, $y, $w, $h, $style); // Dibujar el rectángulo
    }
}

// Crear una nueva instancia de PDF
$pdf = new PDF();
$pdf->AddPage();
$pdf->SetFont('Arial', '', 12);

// Datos de la empresa
// Cargar la imagen del logo
$pdf->Image('../../../../assets/img/BITnessGYM_isologo.png', 10, 10, 60); // Ruta, posición X, Y, y ancho 

// Crear un rectángulo simple para los datos de la empresa
$pdf->SimpleRect(10, 50, 60, 60); // X, Y, Ancho, Alto

// Posicionar el cursor para escribir los datos de la empresa dentro del rectángulo
$pdf->SetXY(10, 40); // Ajustar posición dentro del rectángulo
$pdf->Ln(11); // Salto de línea
$pdf->SetFont('Arial', 'B', 12); // Establecer fuente en negrita
$pdf->Cell(100, 7, '  Telefono:', 0, 'L');
$pdf->SetFont('Arial', '', 12); // Volver a la fuente normal para el contenido
$pdf->Cell(100, 7, ' ' . $sucursal['telefono'], 0, 1, 'L');
$pdf->Ln(5); // Salto de línea
$pdf->SetFont('Arial', 'B', 12); // Establecer fuente en negrita para "Dirección"
$pdf->Cell(100, 7, '  Direccion:', 0, 'L');
$pdf->SetFont('Arial', '', 12); // Volver a la fuente normal para el contenido
$pdf->Cell(100, 7, ' ' . $sucursal['calle'], 0, 1, 'L');
$pdf->Ln(4); // Salto de línea
$pdf->SetFont('Arial', 'B', 12); // Establecer fuente en negrita para "Montevideo"
$pdf->Cell(100, 7, ' ' . $sucursal['ciudad'], 0, 'L');
$pdf->Ln(4); // Salto de línea
$pdf->Cell(100, 7, '  Sucursal: ' . $id_sucursal, 0, 'L'); // Aquí también puedes hacer que "Sucursal" esté en negrita si lo deseas.
$pdf->SetFont('Arial', '', 12); // Volver a la fuente normal después de los datos

// Posicionar la tabla de información a la derecha de los datos de la empresa
$margenDerecha = 80; // Ajusta este valor para desplazar más a la derecha si es necesario
$pdf->SetXY($margenDerecha, 10); // Definir posición para empezar al lado de los datos de la empresa

// Celda para RUT con fondo gris y negrita
$pdf->SetFont('Arial', 'B', 12);
$pdf->SetFillColor(200, 200, 200); // Fondo gris para títulos
$pdf->Cell(120, 10, 'R.U.T.', 'B', 1, 'C', true);
$pdf->SetFont('Arial', '', 12); // Cambiar a fuente normal para los datos
$pdf->SetX($margenDerecha);
$pdf->Cell(120, 10, '20.123.456-7', 'B', 1, 'C');

// Celda para Tipo CFE con fondo gris y negrita
$pdf->SetFont('Arial', 'B', 12);
$pdf->SetX($margenDerecha);
$pdf->Cell(120, 10, 'Tipo CFE', 'B', 1, 'C', true);
$pdf->SetFont('Arial', '', 12); // Cambiar a fuente normal
$pdf->SetX($margenDerecha);
$pdf->Cell(120, 10, 'e-Factura','B', 1, 'C');

// Serie, Número, Forma de Pago y Moneda
$pdf->SetFont('Arial', 'B', 12);
$pdf->SetX($margenDerecha);
$pdf->Cell(120, 10, '  Serie          Numero             Forma de Pago         Moneda    ', 'B', 1, 'L', true);
$pdf->SetFont('Arial', '', 12);
$pdf->SetX($margenDerecha);
$pdf->MultiCell(120, 10, "     A              0000399                  Contado                 USD | 1", 'B', 'L');

// Fechas de comprobante y vencimiento
$pdf->SetFont('Arial', 'B', 12);
$pdf->SetX($margenDerecha);
$pdf->Cell(120, 10, '         Fecha Comprobante                Fecha Vencimiento  ', 'B', 1, 'L', true);
$pdf->SetFont('Arial', '', 12);
$pdf->SetX($margenDerecha);
$pdf->MultiCell(120, 10, "                 " . $paga['fecha_inicio'] . "                                " . $paga['fecha_fin'], 'B', 'L');

// RUT Comprador y Cliente
$pdf->SetFont('Arial', 'B', 12);
$pdf->SetX($margenDerecha);
$pdf->Cell(120, 10, '               RUT Comprador                     Cliente', 'B', 1, 'L', true);
$pdf->SetFont('Arial', '', 12);
$pdf->SetX($margenDerecha);
$pdf->MultiCell(120, 10, "                  " . $usuario['ci'] . "                               " . $usuario['nombre'], 'B', 'L');
// Domicilio Fiscal
$pdf->SetFont('Arial', 'B', 12);
$pdf->SetX($margenDerecha);
$pdf->Cell(120, 10, '                                Domicilio Fiscal ', 'B', 1, 'L', true);
$pdf->SetFont('Arial', '', 12);
$pdf->SetX($margenDerecha);
$pdf->MultiCell(120, 10, "                                    Montevideo", 'B', 'L');

// Continúa con la tabla de suscripción debajo de la sección de empresa y datos importantes
$pdf->Ln(10); // Espacio entre la tabla y la sección anterior

// Tabla de conceptos (cabecera)
$pdf->SetFont('Arial', 'B', 12);
$pdf->Cell(40, 10, 'CONCEPTO', 'B', 0, 'C', true);
$pdf->Cell(30, 10, 'CANTIDAD', 'B', 0, 'C', true);
$pdf->Cell(40, 10, 'P/UNITARIO', 'B', 0, 'C', true);
$pdf->Cell(40, 10, 'DESCUENTO', 'B', 0, 'C', true);
$pdf->Cell(40, 10, 'TOTAL', 'B', 1, 'C', true);

// Detalle de productos/servicios (valores de la tabla)
$pdf->SetFont('Arial', '', 12);
$pdf->Cell(40, 10, 'Servicio - Suscripcion', 'B', 0, 'C');
$pdf->Cell(30, 10, '1', 'B', 0, 'C'); // Cantidad
$pdf->Cell(40, 10, number_format($suscripcion['precio_sus'], 2, ',', '.'), 'B', 0, 'C');
$pdf->Cell(40, 10, '0', 'B', 0, 'C'); // Descuento
$pdf->Cell(40, 10, number_format($suscripcion['precio_sus'], 2, ',', '.'), 'B', 1, 'C');

// Saltar espacio
$pdf->Ln(5);

// Total final
$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(150, 10, 'TOTAL A PAGAR:', 0, 0, 'R');
$pdf->Cell(40, 10, ' USD ' . number_format($suscripcion['precio_sus'], 2, ',', '.'), 1, 1, 'C');

// Espacio antes del pie de página
$pdf->Ln(45);

// Añadir una línea larga antes del pie de página
$pdf->SetDrawColor(0, 0, 0); // Color negro
$pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY()); // Dibuja una línea horizontal larga

// Pie de página con detalles adicionales
// Cargar la imagen del código QR desde el archivo en la carpeta
$pdf->Image('../../../../assets/pdfs/qr.png', 10, $pdf->GetY() + 3, 40);

// Ajusta el ancho para colocar los detalles a la derecha del QR
$pdf->SetY($pdf->GetY() + 2); // Ajusta 5 o el valor deseado
$pdf->SetX(45); // Posiciona el cursor a la derecha del QR
// Primera línea de detalles
$pdf->SetFont('Arial', 'I', 9);
$pdf->Cell(0, 10, '   Puede verificar comprobante en: www.dgi.gub.uy', 0, 1, 'L');

// Mueve la posición Y un poco hacia abajo y ajusta X para la siguiente línea
$pdf->SetFont('Arial', 'I', 9);
$pdf->SetY($pdf->GetY() + 2); // Ajusta 5 o el valor deseado
$pdf->SetX(45);
$pdf->Cell(0, 10, '   Condiciones de pago: Contado', 0, 1, 'L');

// Mueve la posición Y nuevamente un poco hacia abajo y ajusta X para la última línea
$pdf->SetFont('Arial', 'I', 9);
$pdf->SetY($pdf->GetY() + 2); // Ajusta 5 o el valor deseado
$pdf->SetX(45);
$pdf->Cell(0, 10, '   CAE nro. 90212345678   Serie A del A000201 a A000400', 0, 1, 'L');

// Detalles de la fecha alineados a la derecha
// Posiciona el rectángulo alrededor del texto de "Fecha de vencimiento CAE" y su fecha
$pdf->SetDrawColor(0, 0, 0); // Color negro para el borde del rectángulo
$pdf->SetLineWidth(0.3); // Grosor de la línea del rectángulo
$pdf->Rect(140, $pdf->GetY(), 60, 20); // X, Y, Ancho, Alto del rectángulo

// Texto "Fecha de vencimiento CAE" dentro del rectángulo
$pdf->SetFont('Arial', 'I', 10);
$pdf->SetX(145); // Ajustar para que el texto esté dentro del rectángulo
$pdf->Cell(0, 10, 'Fecha de vencimiento CAE:', 0, 1, 'L');

// Ajustar la posición de la fecha dentro del rectángulo
$pdf->SetX(145);
$pdf->Cell(0, 10, '11-12-2024   ', 0, 1, 'L');

// Obtener el contenido del PDF como cadena
$pdfContent = $pdf->Output('', 'S');

// Generar una ID única para el nombre del archivo
$uniqueId = uniqid();

// Guardar el archivo PDF en la ruta especificada
$pdfFilePath = '../../../../assets/pdfs/factura_usuario_' . $uniqueId  . '.pdf';

// Guardar el archivo PDF en la ruta especificada
$pdf->Output($pdfFilePath, 'F');  // 'F' indica que el archivo se guardará en el sistema de archivos

// Función para insertar la factura en la base de datos
function insertarFactura($conn, $id_suscripcion, $fecha_emision, $total, $fecha_pago, $pdfFilePath) {
    try {
        // Preparar la consulta SQL para insertar los datos de la factura
        $insertQuery = "INSERT INTO FACTURA (id_suscripcion, fecha_emision, total, fecha_pago, metodo_pago, ruta_pdf) 
                        VALUES (:id_suscripcion, :fecha_emision, :total, :fecha_pago, 'PayPal', :archivo_pdf)";
        
        // Preparar la sentencia
        $stmt = $conn->prepare($insertQuery);
        
        // Vincular los parámetros con los valores
        $stmt->bindParam(':id_suscripcion', $id_suscripcion, PDO::PARAM_INT);
        $stmt->bindParam(':fecha_emision', $fecha_emision, PDO::PARAM_STR);
        $stmt->bindParam(':total', $total, PDO::PARAM_STR);
        $stmt->bindParam(':fecha_pago', $fecha_pago, PDO::PARAM_STR);
        $stmt->bindParam(':archivo_pdf', $pdfFilePath, PDO::PARAM_STR);
        
        // Ejecutar la consulta
        $stmt->execute();

        // Si la inserción fue exitosa, retornar el ID de la factura
        $facturaId = $conn->lastInsertId();
        
        return [
            'status' => 'success',
            'message' => 'Factura insertada correctamente.',
            'factura_id' => $facturaId
        ];
    } catch (Exception $e) {
        // En caso de error, capturar la excepción y retornar el mensaje de error
        return [
            'status' => 'error',
            'message' => 'Error al insertar la factura: ' . $e->getMessage()
        ];
    }
}

// Llamada a la función para insertar la factura
$fecha_emision = date('Y-m-d'); // Fecha actual de emisión
$total = $suscripcion['precio_sus']; // Total a pagar
$fecha_pago = $paga['fecha_fin']; // Fecha de pago

// Insertar la factura en la base de datos
$insercionFactura = insertarFactura($conn, $id_suscripcion, $fecha_emision, $total, $fecha_pago, $pdfFilePath);

// Responder con el resultado de la inserción
echo json_encode([
    'status' => $insercionFactura['status'],
    'message' => $insercionFactura['message'],
    'factura_id' => $insercionFactura['factura_id'] ?? null
]);

// Configurar PHPMailer
$mail = new PHPMailer(true);
try {
    // Configuración del servidor
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'bitnessgym@gmail.com'; // Tu email
    $mail->Password = 'efsq nojc wefa qrhe'; // Contraseña o contraseña de aplicación
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    // Remitente y destinatario
    $mail->setFrom('bitnessgym@gmail.com', 'BITness GYM');
    $mail->addAddress($usuario['email'], $usuario['nombre']);

    // Contenido del correo
    $mail->isHTML(true);
    $mail->Subject = 'Factura de compra';
    $mail->Body    = 'Adjunto encontrarás tu factura en PDF.';

    // Adjuntar el PDF
    $mail->addStringAttachment($pdfContent, 'factura.pdf', 'base64', 'application/pdf');

    // Enviar el correo
    $mail->send();
    echo 'Factura enviada correctamente';
} catch (Exception $e) {
    echo "Error al enviar la factura: {$mail->ErrorInfo}";
}

?>