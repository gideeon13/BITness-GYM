<?php
// Conexión a la base de datos
require_once 'conexion.php';

header('Content-Type: application/json');

// Verificar que el usuario esté autenticado
session_start();
if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(['success' => false, 'message' => 'Usuario no autenticado.']);
    exit;
}

$id_usuario = intval($_SESSION['id_usuario']);

try {
    // Iniciar una transacción para garantizar consistencia
    $conexion->beginTransaction();

    // Consultar el carrito activo del usuario
    $stmt = $conexion->prepare("SELECT id_carrito FROM CARRITO WHERE id_usuario = :id_usuario AND estado = 1 LIMIT 1");
    $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
    $stmt->execute();

    $carrito = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$carrito) {
        // No hay carrito activo para procesar
        echo json_encode(['success' => false, 'message' => 'No hay un carrito activo para completar.']);
        $conexion->rollBack();
        exit;
    }

    $id_carrito = $carrito['id_carrito'];

    // Cambiar el estado del carrito a 2 (completado)
    $stmt_update = $conexion->prepare("UPDATE CARRITO SET estado = 2 WHERE id_carrito = :id_carrito");
    $stmt_update->bindParam(':id_carrito', $id_carrito, PDO::PARAM_INT);
    $stmt_update->execute();

    // Eliminar los productos del carrito de la tabla Contiene
    $stmt_delete = $conexion->prepare("DELETE FROM Contiene WHERE id_carrito = :id_carrito");
    $stmt_delete->bindParam(':id_carrito', $id_carrito, PDO::PARAM_INT);
    $stmt_delete->execute();

    // Confirmar la transacción
    $conexion->commit();

    // Responder éxito
    echo json_encode(['success' => true, 'message' => 'El carrito ha sido completado exitosamente.']);
} catch (Exception $e) {
    // En caso de error, revertir la transacción
    $conexion->rollBack();
    echo json_encode(['success' => false, 'message' => 'Error al completar el carrito: ' . $e->getMessage()]);
}
