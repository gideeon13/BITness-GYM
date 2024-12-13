<?php
session_start();
require '../../../../config/conexion.php';

$id_usuario = $_SESSION['id_usuario'];  // Obtener id_usuario desde la sesión

// Comprobar si el usuario está logueado
if (isset($id_usuario)) {
    // Obtener los datos enviados por POST
    $data = json_decode(file_get_contents('php://input'), true);
    $id_producto = $data['id_producto'];
    $cantidad = $data['cantidad'];
    $precio_sin_iva = $data['precio_sin_iva'];  // Recibir el precio sin IVA

    // Validar que la cantidad es mayor a 0
    if ($cantidad < 1) {
        echo json_encode(['success' => false, 'message' => 'Cantidad no válida']);
        exit;
    }

    // Actualizar la cantidad del producto en la tabla Contiene
    $query = "
        UPDATE Contiene
        SET cantidad = :cantidad
        WHERE id_producto_FK = :id_producto AND id_carrito_FK IN (
            SELECT id_carrito
            FROM CARRITO
            WHERE id_usuario = :id_usuario AND estado = 1
        )
    ";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':cantidad', $cantidad, PDO::PARAM_INT);
    $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
    $stmt->bindParam(':id_producto', $id_producto, PDO::PARAM_INT);
    $stmt->execute();

    // Calcular el precio total y precio sin IVA de todos los productos en el carrito
    $query = "
        SELECT SUM(p.precio * c.cantidad) AS precio_sin_iva
        FROM Contiene c
        JOIN PRODUCTO p ON c.id_producto_FK = p.id_producto
        WHERE c.id_carrito_FK = (
            SELECT id_carrito
            FROM CARRITO
            WHERE id_usuario = :id_usuario AND estado = 1
        )
    ";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $precio_sin_iva_total = $result['precio_sin_iva'];

    // Calcular el precio total con IVA (22%)
    $iva = 0.22;
    $precio_total = $precio_sin_iva_total * (1 + $iva);  // Precio total con IVA

    // Actualizar el carrito con los nuevos valores
    $query = "
        UPDATE CARRITO
        SET cant_productos = (
            SELECT SUM(cantidad) 
            FROM Contiene 
            WHERE id_carrito_FK = (
                SELECT id_carrito 
                FROM CARRITO 
                WHERE id_usuario = :id_usuario AND estado = 1
            )
        ),
        precio_sin_iva = :precio_sin_iva_total,  -- Actualizamos el precio sin IVA
        precio_total = :precio_total  -- Actualizamos el precio total con IVA
        WHERE id_usuario = :id_usuario AND estado = 1
    ";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
    $stmt->bindParam(':precio_sin_iva_total', $precio_sin_iva_total, PDO::PARAM_STR);  // Bind el precio sin IVA
    $stmt->bindParam(':precio_total', $precio_total, PDO::PARAM_STR);  // Bind el precio con IVA
    $stmt->execute();

    echo json_encode(['success' => true, 'message' => 'Cantidad actualizada']);
} else {
    echo json_encode(['success' => false, 'message' => 'Usuario no logueado']);
}
?>
