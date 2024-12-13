<?php
include '../../../../config/conexion.php'; 

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['action'])) {
        $action = $_GET['action'];
        if ($action === 'descargar') {
            descargarFactura($_GET['id_factura']);
        } elseif ($action === 'imprimir') {
            imprimirFactura($_GET['id_factura']);
        } else {
            obtenerFacturas();
        }
    } else {
        obtenerFacturas();
    }
}

function obtenerFacturas() {
    global $conn; 
    try {
        $stmt = $conn->query("SELECT id_factura, id_carrito, id_suscripcion, fecha_emision, total, fecha_pago, metodo_pago FROM FACTURA");
        $facturas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['data' => $facturas]);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Error al obtener las facturas: ' . $e->getMessage()]);
    }
}

// Función para descargar el archivo PDF
function descargarFactura($id_factura) {
    global $conn;
    try {
        $stmt = $conn->prepare("SELECT ruta_pdf FROM FACTURA WHERE id_factura = :id_factura");
        $stmt->bindParam(':id_factura', $id_factura, PDO::PARAM_INT);
        $stmt->execute();
        $factura = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($factura && file_exists($factura['ruta_pdf'])) {
            // Redirigir al archivo PDF para descargarlo
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="factura_' . $id_factura . '.pdf"');
            readfile($factura['ruta_pdf']);
            exit;
        } else {
            echo json_encode(['error' => 'Factura no encontrada o PDF no disponible']);
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Error al obtener el archivo PDF: ' . $e->getMessage()]);
    }
}

// Función para imprimir el archivo PDF
function imprimirFactura($id_factura) {
    global $conn;
    try {
        $stmt = $conn->prepare("SELECT ruta_pdf FROM FACTURA WHERE id_factura = :id_factura");
        $stmt->bindParam(':id_factura', $id_factura, PDO::PARAM_INT);
        $stmt->execute();
        $factura = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($factura && file_exists($factura['ruta_pdf'])) {
            // Redirigir al archivo PDF para abrirlo en una nueva ventana
            header('Location: ' . $factura['ruta_pdf']);
            exit;
        } else {
            echo json_encode(['error' => 'Factura no encontrada o PDF no disponible']);
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Error al obtener el archivo PDF: ' . $e->getMessage()]);
    }
}

?>
