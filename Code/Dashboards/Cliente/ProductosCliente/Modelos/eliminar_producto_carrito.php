<?php
session_start();
require '../../../../config/conexion.php';

$id_usuario = $_SESSION['id_usuario'];  // Obtener id_usuario desde la sesión

// Comprobar si el usuario está logueado
if (isset($id_usuario)) {
    // Obtener los datos enviados por POST
    $data = json_decode(file_get_contents('php://input'), true);
    $id_producto = $data['id_producto'];

    // Eliminar el producto de la tabla Contiene
    $query = "
        DELETE FROM Contiene
        WHERE id_producto_FK = :id_producto AND id_carrito_FK IN (
            SELECT id_carrito
            FROM CARRITO
            WHERE id_usuario = :id_usuario AND estado = 1
        )
    ";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id_producto', $id_producto, PDO::PARAM_INT);
    $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
    $stmt->execute();

    // Actualizar el precio total y la cantidad de productos en el carrito
    $query = "
        UPDATE CARRITO
        SET cant_productos = (
            SELECT SUM(cantidad) FROM Contiene WHERE id_carrito_FK = (
                SELECT id_carrito FROM CARRITO WHERE id_usuario = :id_usuario AND estado = 1
            )
        ),
        precio_total = (
            SELECT SUM(p.precio * c.cantidad)
            FROM Contiene c
            JOIN PRODUCTO p ON c.id_producto_FK = p.id_producto
            WHERE c.id_carrito_FK = (
                SELECT id_carrito FROM CARRITO WHERE id_usuario = :id_usuario AND estado = 1
            )
        )
        WHERE id_usuario = :id_usuario AND estado = 1
    ";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode(['success' => true, 'message' => 'Producto eliminado']);
} else {
    echo json_encode(['success' => false, 'message' => 'Usuario no logueado']);
}
?>
