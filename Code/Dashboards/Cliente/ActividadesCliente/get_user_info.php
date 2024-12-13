<?php
session_start();
include '../../../config/conexion.php';

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(['status' => 'error', 'message' => 'Usuario no autenticado']);
    exit;
}

$user_id = $_SESSION['id_usuario'];

try {
    // Obtener información de la suscripción del usuario
    $stmt = $conn->prepare("
        SELECT s.categoria_sus, s.id_suscripcion, s.descripcion_sus
        FROM Paga p
        JOIN SUSCRIPCION s ON p.id_suscripcion_FK = s.id_suscripcion
        WHERE p.id_usuario_FK = :user_id AND p.fecha_fin >= CURDATE()
        ORDER BY p.fecha_inicio DESC
        LIMIT 1
    ");
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    $subscription = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$subscription) {
        throw new Exception("Usuario sin suscripción activa");
    }

    // Extraer el límite de actividades de la descripción de la suscripción
    preg_match('/Acceso (\d+)/', $subscription['descripcion_sus'], $matches);
    $activity_limit = isset($matches[1]) ? intval($matches[1]) : 0;

    // Obtener las actividades en la agenda del usuario
    $stmt = $conn->prepare("
        SELECT c.nombre as task
        FROM AGENDA a
        JOIN Posee p ON a.id_agenda = p.id_agenda_FK
        JOIN ACTIVIDAD act ON p.id_actividad_FK = act.id_actividad
        JOIN CLASE c ON act.id_actividad = c.id_actividad
        WHERE a.id_usuario = :user_id
    ");
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    $agenda = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'subscription' => [
            'id' => $subscription['id_suscripcion'],
            'category' => $subscription['categoria_sus'],
            'activity_limit' => $activity_limit
        ],
        'agenda' => $agenda
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>