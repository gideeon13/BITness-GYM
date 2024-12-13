<?php
header('Content-Type: application/json');
require '../../config/conexion.php';

try {
    $stmt = $conn->query("SELECT id_producto, nombre, precio, descripcion, stock, imagen_url FROM PRODUCTO");
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['productos' => $productos]);
} catch (Exception $e) {
    // En caso de error, devolver un JSON con el mensaje de error
    echo json_encode(['error' => 'Error al cargar los productos']);
}
?>

