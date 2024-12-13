<?php
session_start();
include '../../../config/conexion.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Usuario no autenticado']);
    exit;
}

$user_id = $_SESSION['user_id'];
$action = $_POST['action'];
$class_name = $_POST['class'];

try {
    if ($action === 'enroll') {
        // Obtener el id_actividad de la clase
        $stmt = $conn->prepare("SELECT id_actividad FROM CLASE WHERE nombre = :class_name LIMIT 1");
        $stmt->bindParam(':class_name', $class_name);
        $stmt->execute();
        $activity = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$activity) {
            throw new Exception("Clase no encontrada");
        }

        $activity_id = $activity['id_actividad'];

        // Obtener o crear la agenda del usuario
        $stmt = $conn->prepare("SELECT id_agenda FROM AGENDA WHERE id_usuario = :user_id");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $agenda = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$agenda) {
            $stmt = $conn->prepare("INSERT INTO AGENDA (id_usuario, nombre) VALUES (:user_id, 'Agenda Personal')");
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();
            $agenda_id = $conn->lastInsertId();
        } else {
            $agenda_id = $agenda['id_agenda'];
        }

        // Agregar la actividad a la agenda
        $stmt = $conn->prepare("INSERT INTO Posee (id_agenda_FK, id_actividad_FK) VALUES (:agenda_id, :activity_id)");
        $stmt->bindParam(':agenda_id', $agenda_id);
        $stmt->bindParam(':activity_id', $activity_id);
        $stmt->execute();

        echo json_encode(['status' => 'success', 'message' => 'Anotado exitosamente']);
    } elseif ($action === 'unenroll') {
        // Obtener el id_actividad de la clase
        $stmt = $conn->prepare("SELECT id_actividad FROM CLASE WHERE nombre = :class_name LIMIT 1");
        $stmt->bindParam(':class_name', $class_name);
        $stmt->execute();
        $activity = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$activity) {
            throw new Exception("Clase no encontrada");
        }

        $activity_id = $activity['id_actividad'];

        // Obtener el id_agenda del usuario
        $stmt = $conn->prepare("SELECT id_agenda FROM AGENDA WHERE id_usuario = :user_id");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $agenda = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$agenda) {
            throw new Exception("Agenda no encontrada");
        }

        $agenda_id = $agenda['id_agenda'];

        // Eliminar la actividad de la agenda
        $stmt = $conn->prepare("DELETE FROM Posee WHERE id_agenda_FK = :agenda_id AND id_actividad_FK = :activity_id");
        $stmt->bindParam(':agenda_id', $agenda_id);
        $stmt->bindParam(':activity_id', $activity_id);
        $stmt->execute();

        echo json_encode(['status' => 'success', 'message' => 'Desanotado exitosamente']);
    } else {
        throw new Exception("Acción no válida");
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>