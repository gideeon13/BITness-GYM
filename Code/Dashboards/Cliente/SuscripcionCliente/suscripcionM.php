<?php
// Incluir el archivo de conexión
include '../../../config/conexion.php';

// Verificar si la conexión fue exitosa
if (!isset($conn)) {
    die("La variable de conexión no está definida.");
}

// Establecer el tipo de contenido a JSON
header('Content-Type: application/json');

// Obtener el tipo de datos que se solicita
$requestType = isset($_GET['type']) ? $_GET['type'] : 'ubicaciones';

try {
    if ($requestType === 'ubicaciones') {
        // Consulta SQL para obtener ubicaciones
        $sql = "SELECT * FROM SUCURSAL";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $ubicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($ubicaciones);
    } elseif ($requestType === 'suscripciones') {
        // Consulta SQL para obtener suscripciones
        $sql = "SELECT * FROM SUSCRIPCION ORDER BY id_suscripcion";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $suscripciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Verificar si se obtuvieron resultados
        if (empty($suscripciones)) {
            echo json_encode([]); // Devolver un array vacío si no hay suscripciones
            exit;
        }

        // Devolver los resultados
        echo json_encode($suscripciones);
    } else {
        // Respuesta para tipo no reconocido
        echo json_encode(['error' => 'Tipo de solicitud no válida']);
    }
} catch (PDOException $e) {
    // En caso de error, devolver el mensaje de error
    die(json_encode(['error' => "Error en la consulta: " . $e->getMessage()]));
}

// Cerrar la conexión
$conn = null;
?>
