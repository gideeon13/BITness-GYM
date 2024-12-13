<?php
// Incluir el archivo de conexión
include '../../../../config/conexion.php';
session_start();

// Establecer el tipo de contenido a JSON
header('Content-Type: application/json');

// Obtener el contenido de la solicitud POST
$requestBody = file_get_contents('php://input');
$data = json_decode($requestBody, true);

try {
    // Validar que se recibió el ID de la suscripción
    if (isset($data['id_suscripcion'])) {
        $id_usuario = $_SESSION['id_usuario'];

        // Descomponer los datos restantes en variables individuales
        $id_sucursal = $data['id_sucursal'];
        $id_suscripcion = $data['id_suscripcion'];
        $fecha_inicio = $data['fecha_inicio'];
        $fecha_fin = $data['fecha_fin'];

        // Preparar la consulta para insertar los datos de la suscripción
        $sql = "INSERT INTO Paga (id_suscripcion_FK, id_usuario_FK, fecha_inicio, fecha_fin) VALUES (:id_suscripcion, :id_usuario, :fecha_inicio, :fecha_fin)";
        $stmt = $conn->prepare($sql);
        
        // Vincular los parámetros
        $stmt->bindParam(':id_usuario', $id_usuario);
        $stmt->bindParam(':id_suscripcion', $id_suscripcion);
        $stmt->bindParam(':fecha_inicio', $fecha_inicio);
        $stmt->bindParam(':fecha_fin', $fecha_fin);

        // Ejecutar la consulta
        if ($stmt->execute()) {
            // Devolver una respuesta JSON exitosa
            echo json_encode(['status' => 'success', 'message' => 'Suscripción registrada con éxito.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error al registrar la suscripción.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'ID de suscripción no recibido.']);
    }
} catch (PDOException $e) {
    // En caso de error, devolver el mensaje de error
    echo json_encode(['status' => 'error', 'message' => "Error en la consulta: " . $e->getMessage()]);
}
?>
