<?php
session_start();
require '../../../../config/conexion.php';

$id_usuario = $_SESSION['id_usuario'];  // Obtener id_usuario desde la sesión

// Comprobar si el usuario está logueado
if (isset($id_usuario)) {
    // Obtener los productos del carrito para este usuario, incluyendo el precio sin IVA
    $query = "
        SELECT p.id_producto, p.nombre, p.precio, co.cantidad
        FROM Contiene co
        JOIN PRODUCTO p ON co.id_producto_FK = p.id_producto
        JOIN CARRITO ca ON co.id_carrito_FK = ca.id_carrito
        WHERE ca.id_usuario = :id_usuario AND ca.estado = 1
    ";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
    $stmt->execute();
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Obtener los precios sin IVA y con IVA desde la tabla CARRITO
    $query_precio_carrito = "
        SELECT precio_sin_iva, precio_total
        FROM CARRITO
        WHERE id_usuario = :id_usuario AND estado = 1
    ";

    $stmt = $conn->prepare($query_precio_carrito);
    $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
    $stmt->execute();
    $carrito_precio = $stmt->fetch(PDO::FETCH_ASSOC);

    // Responder con los productos, los precios sin IVA y con IVA
    echo json_encode([
        'success' => true,
        'productos' => $productos,
        'precio_sin_iva' => $carrito_precio['precio_sin_iva'],
        'precio_con_iva' => $carrito_precio['precio_total']
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Usuario no logueado']);
}
?>
