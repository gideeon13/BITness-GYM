<?php
include '../../../../config/conexion.php';
header('Content-Type: application/json');

switch ($_SERVER['REQUEST_METHOD']) {
    case 'PUT':
        // Leer el JSON de la entrada y decodificarlo
        $data = json_decode(file_get_contents("php://input"), true);

        // Validar los datos
        if (empty($data['id_producto']) || !is_numeric($data['id_producto']) ||
            empty($data['id_sucursal']) || !is_numeric($data['id_sucursal']) ||
            empty($data['nombre']) || empty($data['precio']) || !is_numeric($data['precio']) ||
            empty($data['descripcion']) || empty($data['stock']) || !is_numeric($data['stock'])) {
            echo json_encode(['success' => false, 'message' => 'Datos inválidos.']);
            exit();
        }

        // Asignar datos a variables locales
        $id_producto = $data['id_producto'];
        $id_sucursal = $data['id_sucursal'];
        $nombre = $data['nombre'];
        $precio = $data['precio'];
        $descripcion = $data['descripcion'];
        $stock = $data['stock'];

        try {
            // Actualizar solo los datos del producto
            $stmt = $conn->prepare("UPDATE PRODUCTO SET id_sucursal = ?, nombre = ?, precio = ?, descripcion = ?, stock = ? WHERE id_producto = ?");
            $stmt->execute([$id_sucursal, $nombre, $precio, $descripcion, $stock, $id_producto]);

            echo json_encode(['success' => true, 'message' => 'Producto actualizado correctamente.']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al procesar la solicitud: ' . $e->getMessage()]);
        }
        break;

    case 'POST':
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $id_producto = $_POST['id_producto'] ?? null;
            $imagen = $_FILES['imagen'];
            $nombreImagen = uniqid() . '-' . basename($imagen['name']);
            $rutaImagen = '../../../../assets/imgProducts/' . $nombreImagen;

            if (move_uploaded_file($imagen['tmp_name'], $rutaImagen)) {
                $stmt = $conn->prepare("UPDATE PRODUCTO SET imagen_url = ? WHERE id_producto = ?");
                $stmt->execute([$rutaImagen, $id_producto]);

                echo json_encode(['success' => true, 'message' => 'Imagen actualizada correctamente.']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error al mover la nueva imagen.']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'No se ha recibido ninguna imagen.']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
        break;
}
