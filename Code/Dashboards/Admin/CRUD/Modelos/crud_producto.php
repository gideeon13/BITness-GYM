<?php
include '../../../../config/conexion.php';

header('Content-Type: application/json');

// Ruta de la carpeta donde se guardarán las imágenes
$uploadDir = '../../../../assets/imgProducts/';

// Obtener datos de la solicitud
$data = json_decode(file_get_contents('php://input'), true);

// Verificar el método HTTP
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET': // Obtener todos los productos
        try {
            $query = "SELECT id_producto, id_sucursal, nombre, precio, descripcion, stock, imagen_url FROM PRODUCTO";
            $stmt = $conn->prepare($query);
            $stmt->execute();
            $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'productos' => $productos]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al obtener los productos: ' . $e->getMessage()]);
        }
        break;

    case 'POST': // Insertar producto nuevo con imagen
        if (!empty($_POST)) {
            $id_sucursal = $_POST['id_sucursal'];
            $nombre = $_POST['nombre'];
            $precio = $_POST['precio'];
            $descripcion = $_POST['descripcion'];
            $stock = $_POST['stock'];

            // Validar que todos los datos sean válidos
            if (empty($id_sucursal) || empty($nombre) || !is_numeric($precio) || !is_numeric($stock)) {
                echo json_encode(['success' => false, 'message' => 'Datos inválidos.']);
                exit();
            }

            // Procesar imagen
            if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] == 0) {
                $imagen = $_FILES['imagen'];
                $nombreImagen = uniqid() . '-' . basename($imagen['name']); // Crear un nombre único
                $rutaImagen = $uploadDir . $nombreImagen;

                if (move_uploaded_file($imagen['tmp_name'], $rutaImagen)) {
                    $imagenUrl = $rutaImagen;
                } else {
                    echo json_encode(['success' => false, 'message' => 'Error al mover la imagen.']);
                    exit();
                }
            } else {
                $imagenUrl = '../../../../assets/imgProducts/predeterminada.jpg'; // Imagen predeterminada
            }

            try {
                $stmt = $conn->prepare("INSERT INTO PRODUCTO (id_sucursal, nombre, precio, descripcion, stock, imagen_url) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$id_sucursal, $nombre, $precio, $descripcion, $stock, $imagenUrl]);
                echo json_encode(['success' => true, 'message' => 'Producto creado correctamente.']);
            } catch (PDOException $e) {
                echo json_encode(['success' => false, 'message' => 'Error al procesar la solicitud: ' . $e->getMessage()]);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'No se recibieron datos.']);
        }
        break;

            case 'PUT':
                parse_str(file_get_contents("php://input"), $_PUT);
                
                // Procesar los datos del producto
                $id_producto = $_PUT['id_producto'] ?? null;
                $id_sucursal = $_PUT['id_sucursal'] ?? null;
                $nombre = $_PUT['nombre'] ?? null;
                $precio = $_PUT['precio'] ?? null;
                $descripcion = $_PUT['descripcion'] ?? null;
                $stock = $_PUT['stock'] ?? null;
            
                // Asumiendo que usas json_decode para obtener los datos
                $data = json_decode(file_get_contents("php://input"), true);
            
                // Validar los datos
                if (empty($data['id_producto']) || 
                    !is_numeric($data['id_producto']) || 
                    empty($data['id_sucursal']) || 
                    !is_numeric($data['id_sucursal']) || 
                    empty($data['nombre']) || 
                    empty($data['precio']) || 
                    !is_numeric($data['precio']) || 
                    empty($data['descripcion']) || 
                    empty($data['stock']) || 
                    !is_numeric($data['stock'])) {
                    echo json_encode(['success' => false, 'message' => 'Datos inválidos.']);
                    exit();
                }
            
                try {
                    // Actualizar solo los datos del producto
                    $stmt = $conn->prepare("UPDATE PRODUCTO SET id_sucursal = ?, nombre = ?, precio = ?, descripcion = ?, stock = ? WHERE id_producto = ?");
                    $stmt->execute([$id_sucursal, $nombre, $precio, $descripcion, $stock, $id_producto]);
            
                    // Procesar la imagen utilizando POST
                    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
                        // Obtener información del archivo de imagen
                        $imagen = $_FILES['imagen'];
                        $nombreImagen = uniqid() . '-' . basename($imagen['name']);
                        $rutaImagen = $uploadDir . $nombreImagen;
            
                        // Mover el archivo subido a la carpeta de destino
                        if (move_uploaded_file($imagen['tmp_name'], $rutaImagen)) {
                            // Actualizar la URL de la imagen en la base de datos
                            $stmt = $conn->prepare("UPDATE PRODUCTO SET imagen_url = ? WHERE id_producto = ?");
                            $stmt->execute([$rutaImagen, $id_producto]);
                        } else {
                            echo json_encode(['success' => false, 'message' => 'Error al mover la nueva imagen.']);
                            exit();
                        }
                    }
            
                    echo json_encode(['success' => true, 'message' => 'Producto actualizado correctamente.']);
                } catch (PDOException $e) {
                    echo json_encode(['success' => false, 'message' => 'Error al procesar la solicitud: ' . $e->getMessage()]);
                }
                break;            

                case 'DELETE': // Eliminar producto
                    if (!empty($data)) {
                        $id_producto = $data['id_producto'];
                
                        // Primero, obtener la imagen actual de la base de datos
                        try {
                            $stmt = $conn->prepare("SELECT imagen_url FROM PRODUCTO WHERE id_producto = ?");
                            $stmt->execute([$id_producto]);
                            $producto = $stmt->fetch(PDO::FETCH_ASSOC);
                
                            if ($producto) {
                                $imagenUrl = $producto['imagen_url'];
                                $nombreImagen = basename($imagenUrl); // Obtén solo el nombre del archivo
                
                                // Verificar que la imagen no sea 'predeterminada.jpg' antes de intentar eliminarla
                                if ($nombreImagen !== 'predeterminada.jpg' && file_exists($imagenUrl)) {
                                    unlink($imagenUrl); // Eliminar la imagen del servidor
                                }
                
                                // Ahora, eliminar el producto de la base de datos
                                $stmt = $conn->prepare("DELETE FROM PRODUCTO WHERE id_producto = ?");
                                $stmt->execute([$id_producto]);
                                echo json_encode(['success' => true, 'message' => 'Producto eliminado correctamente.']);
                            } else {
                                echo json_encode(['success' => false, 'message' => 'Producto no encontrado.']);
                            }
                        } catch (PDOException $e) {
                            echo json_encode(['success' => false, 'message' => 'Error al procesar la solicitud: ' . $e->getMessage()]);
                        }
                    } else {
                        echo json_encode(['success' => false, 'message' => 'No se recibió el ID del producto.']);
                    }
                    break;                

    default:
        echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
        break;
}
?>
