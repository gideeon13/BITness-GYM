<?php
session_start();
include '../../../config/conexion.php'; // Archivo para configurar la conexión PDO

// Suponiendo que la sesión tiene el ID del usuario
$id_usuario = $_SESSION['id_usuario'] ?? null;

if (!$id_usuario) {
    echo json_encode(['redirect' => '../../Pages/Landing/landingV.html']);
    exit();
}

try {
    // Crear la consulta preparada con PDO
    $sql = "SELECT id_usuario_FK FROM Paga 
            WHERE id_usuario_FK = :id_usuario 
            AND CURDATE() BETWEEN fecha_inicio AND fecha_fin";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        // El cliente tiene una suscripción activa
        echo json_encode(['redirect' => '']);
    } else {
        // El cliente no tiene suscripción activa
        echo json_encode(['redirect' => '../SuscripcionCliente/suscripcionV.html']);
    }
} catch (PDOException $e) {
    // Manejo de errores de conexión o consulta
    echo json_encode(['error' => 'Error al verificar la suscripción: ' . $e->getMessage()]);
}
