<?php
// Incluir el archivo de conexión
include '../../config/conexion.php';

// Verificar si la conexión fue exitosa
if (!isset($conn)) {
    die("La variable de conexión no está definida.");
}

// Consulta SQL
$sql = "SELECT * FROM SUSCRIPCION ORDER BY id_suscripcion";

try {
    // Preparar y ejecutar la consulta
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    // Obtener todos los resultados en formato de array asociativo
    $suscripciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Verificar si se obtuvieron resultados
    if (empty($suscripciones)) {
        echo json_encode([]); // Devolver un array vacío si no hay suscripciones
        exit;
    }

    // Establecer el tipo de contenido a JSON y devolver los resultados
    header('Content-Type: application/json');
    echo json_encode($suscripciones);
} catch (PDOException $e) {
    // En caso de error, devolver el mensaje de error
    die("Error en la consulta: " . $e->getMessage());
}

// Cerrar la conexión
$conn = null;
?>
