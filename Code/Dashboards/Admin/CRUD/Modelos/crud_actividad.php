<?php
include '../../../../config/conexion.php';

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); // Permitir solicitudes de cualquier origen

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener actividades de la base de datos para mostrarlas al cargar la página
    try {
        $sql = "SELECT a.hora_inicio AS startTime, a.hora_fin AS endTime, a.dia AS day, c.nombre AS task 
                FROM ACTIVIDAD a
                JOIN CLASE c ON a.id_actividad = c.id_actividad";
        $stmt = $conn->prepare($sql);
        $stmt->execute();

        $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'activities' => $activities]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Vaciar tablas ACTIVIDAD y CLASE antes de insertar nuevas actividades
    $activities = json_decode(file_get_contents('php://input'), true);

    try {
        $conn->beginTransaction();

        // Eliminar todas las actividades y clases antes de realizar la inserción
        $deleteActividadSql = "DELETE FROM ACTIVIDAD";
        $deleteClaseSql = "DELETE FROM CLASE";
        $conn->exec($deleteClaseSql);
        $conn->exec($deleteActividadSql);

        // Insertar nuevas actividades
        $insertActividadSql = "INSERT INTO ACTIVIDAD (hora_inicio, hora_fin, dia) VALUES (:hora_inicio, :hora_fin, :dia)";
        $stmtActividad = $conn->prepare($insertActividadSql);

        foreach ($activities as $activity) {
            $stmtActividad->execute([
                ':hora_inicio' => $activity['startTime'],
                ':hora_fin' => $activity['endTime'],
                ':dia' => $activity['day']
            ]);

            $lastId = $conn->lastInsertId();

            $insertClaseSql = "INSERT INTO CLASE (id_actividad, nombre) VALUES (:id_actividad, :nombre)";
            $stmtClase = $conn->prepare($insertClaseSql);
            $stmtClase->execute([
                ':id_actividad' => $lastId,
                ':nombre' => $activity['task']
            ]);
        }

        $conn->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
}
?>
