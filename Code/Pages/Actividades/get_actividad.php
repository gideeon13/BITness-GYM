<?php
include '../../config/conexion.php'; // Include the database connection

try {
    // Query to get activities, only including classes
    $sql = "SELECT 
                a.hora_inicio AS startTime, 
                a.hora_fin AS endTime, 
                a.dia AS day, 
                c.nombre AS task 
            FROM 
                ACTIVIDAD a
            JOIN 
                CLASE c ON a.id_actividad = c.id_actividad";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();

    // Retrieve all activities as an associative array
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return activities as JSON with a success status
    echo json_encode(['status' => 'success', 'activities' => $activities]);
} catch (Exception $e) {
    // Return an error status and message if an exception occurs
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
