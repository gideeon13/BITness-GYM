<?php
session_start();
require '../../../../config/conexion.php';

$id_usuario = $_SESSION['id_usuario'];  // Obtener id_usuario desde la sesión

// Comprobar si el usuario está logueado
if (isset($id_usuario)) {
    // Verificar si el carrito tiene productos
    $query = "
        SELECT cant_productos
        FROM CARRITO ca
        WHERE ca.id_usuario = :id_usuario AND ca.estado = 1
    ";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
    $stmt->execute();
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

    // Comprobar si el carrito está vacío
    if ($resultado['cant_productos'] == 0) {
        // Verificar si el carrito está activo antes de actualizar
        $query_check = "
            SELECT COUNT(*) as carrito_activo
            FROM CARRITO
            WHERE id_usuario = :id_usuario AND estado = 1
        ";

        $stmt_check = $conn->prepare($query_check);
        $stmt_check->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $stmt_check->execute();
        $check_result = $stmt_check->fetch(PDO::FETCH_ASSOC);

        if ($check_result['carrito_activo'] > 0) {
            // Cambiar el estado del carrito a 3 (cancelado)
            $query_update = "
                UPDATE CARRITO
                SET estado = 3
                WHERE id_usuario = :id_usuario AND estado = 1
            ";

            $stmt_update = $conn->prepare($query_update);
            $stmt_update->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
            $stmt_update->execute();

            // Verificar si se actualizó alguna fila
            if ($stmt_update->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Carrito cancelado']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se pudo actualizar el carrito']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'No se encontró un carrito activo']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Carrito no vacío']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Usuario no logueado']);
}
?>
