<?php
include '../../../config/conexion.php';
session_start();

header('Content-Type: application/json');

$id_usuario = $_SESSION['id_usuario']; 
try {
    // Empezar transacción
    $conn->beginTransaction();

    // Borrar usuario de PAga
    $stmt = $conn->prepare("DELETE FROM Paga WHERE id_usuario_FK = :id_usuario");
    $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
    $stmt->execute();

    // Borrar usuario de CLIENTE
    $stmt = $conn->prepare("DELETE FROM CLIENTE WHERE id_usuario = :id_usuario");
    $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
    $stmt->execute();

    // Borrar usuario de PERFIL
    $stmt = $conn->prepare("DELETE FROM PERFIL WHERE id_usuario = :id_usuario");
    $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
    $stmt->execute();

    // Borrar usuario de USUARIO
    $stmt = $conn->prepare("DELETE FROM USUARIO WHERE id_usuario = :id_usuario");
    $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
    $stmt->execute();

    // Finalizar transacción
    $conn->commit();

    // Destruir la sesión
    session_destroy();

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    // en caso de error
    $conn->rollBack();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
