<?php
session_start();
require '../../../../config/conexion.php';

// Decodificar datos recibidos en formato JSON
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['id_producto'])) {
    $id_producto = $data['id_producto'];
    $id_usuario = $_SESSION['id_usuario'];  // Obtener id_usuario desde la sesión

    try {
        // Verificar si el usuario ya tiene un carrito activo (estado = 1)
        $stmt = $conn->prepare("SELECT id_carrito FROM CARRITO WHERE id_usuario = :id_usuario AND estado = 1");
        $stmt->execute([':id_usuario' => $id_usuario]);
        $carrito = $stmt->fetch();

        if (!$carrito) {
            // Si no hay carrito activo, crear un nuevo carrito
            $stmt = $conn->prepare("INSERT INTO CARRITO (id_usuario, estado, cant_productos, precio_total, precio_sin_iva, fecha_add) 
                                    VALUES (:id_usuario, 1, 0, 0, 0, NOW())");
            $stmt->execute([':id_usuario' => $id_usuario]);
            $id_carrito = $conn->lastInsertId();
        } else {
            // Si ya existe un carrito activo, usar el id de carrito existente
            $id_carrito = $carrito['id_carrito'];
        }

        // Verificar si el producto ya está en el carrito
        $stmt = $conn->prepare("SELECT id_producto_FK FROM Contiene WHERE id_carrito_FK = :id_carrito AND id_producto_FK = :id_producto");
        $stmt->execute([':id_carrito' => $id_carrito, ':id_producto' => $id_producto]);
        $productoCarrito = $stmt->fetch();

        if ($productoCarrito) {
            // Incrementar cantidad si ya está en el carrito
            $stmt = $conn->prepare("UPDATE Contiene SET cantidad = cantidad + 1 
                                    WHERE id_carrito_FK = :id_carrito AND id_producto_FK = :id_producto");
            $stmt->execute([':id_carrito' => $id_carrito, ':id_producto' => $id_producto]);
        } else {
            // Agregar el producto al carrito si no está presente
            $stmt = $conn->prepare("INSERT INTO Contiene (id_carrito_FK, id_producto_FK, cantidad) 
                                    VALUES (:id_carrito, :id_producto, 1)");
            $stmt->execute([':id_carrito' => $id_carrito, ':id_producto' => $id_producto]);
        }

        // Calcular el precio_sin_iva y precio_total del carrito
        // Precio sin IVA: Suma de los precios de los productos en el carrito (sin IVA)
        $stmt = $conn->prepare("SELECT SUM(p.precio * c.cantidad) AS precio_sin_iva
                                FROM Contiene c 
                                JOIN PRODUCTO p ON c.id_producto_FK = p.id_producto 
                                WHERE c.id_carrito_FK = :id_carrito");
        $stmt->execute([':id_carrito' => $id_carrito]);
        $precio_sin_iva = $stmt->fetchColumn();

        // Calcular el precio total con IVA (22%)
        $precio_total = $precio_sin_iva * 1.22; // 22% IVA

        // Actualizar cant_productos, precio_sin_iva y precio_total del carrito
        $stmt = $conn->prepare("UPDATE CARRITO 
                                SET cant_productos = (SELECT SUM(cantidad) FROM Contiene WHERE id_carrito_FK = :id_carrito),
                                    precio_sin_iva = :precio_sin_iva,
                                    precio_total = :precio_total
                                WHERE id_carrito = :id_carrito");
        $stmt->execute([
            ':id_carrito' => $id_carrito,
            ':precio_sin_iva' => $precio_sin_iva,
            ':precio_total' => $precio_total
        ]);

        // Responder con éxito
        echo json_encode(['success' => true, 'message' => 'Producto agregado al carrito']);
    } catch (PDOException $e) {
        // Capturar errores de la base de datos
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
} else {
    // Si no se recibe un id_producto válido
    echo json_encode(['success' => false, 'message' => 'ID de producto no proporcionado']);
}
?>
