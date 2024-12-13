<?php
include '../../../../config/conexion.php';

header('Content-Type: application/json');

// Obtener datos de la solicitud
$data = json_decode(file_get_contents('php://input'), true);

// Verificar el método HTTP
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET': // Obtener todas las sucursales
        try {
            $query = "SELECT id_sucursal, nombre, calle, localidad, ciudad, codigo_postal, telefono, horario_apertura, horario_cierre, latitud, longitud FROM SUCURSAL";
            $stmt = $conn->prepare($query);
            $stmt->execute();
            $sucursales = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'sucursales' => $sucursales]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al obtener sucursales: ' . $e->getMessage()]);
        }
        break;

        case 'POST': // Insertar sucursal
            // Extraer datos de la solicitud y limpiar espacios
            $data = json_decode(file_get_contents('php://input'), true);
            $branch = $data['branch'] ?? null; // Asegúrate de obtener los datos correctamente
        
            if ($branch) {
                // Limpiar espacios en los datos de la sucursal
                $nombre = trim($branch['nombre'] ?? '');
                $calle = trim($branch['calle'] ?? '');
                $localidad = trim($branch['localidad'] ?? '');
                $ciudad = trim($branch['ciudad'] ?? '');
                $codigo_postal = trim($branch['codigo_postal'] ?? '');
                $telefono = trim($branch['telefono'] ?? '');
                $horario_apertura = trim($branch['horario_apertura'] ?? '');
                $horario_cierre = trim($branch['horario_cierre'] ?? '');
                $latitud = trim($branch['latitud'] ?? '');
                $longitud = trim($branch['longitud'] ?? '');
        
                // Validar que todos los campos obligatorios estén presentes
                $requiredFields = [$nombre, $calle, $localidad, $ciudad, $codigo_postal, $telefono, $horario_apertura, $horario_cierre, $latitud, $longitud];
                if (in_array('', $requiredFields, true)) { // Cambiar null por '' para la validación
                    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
                    exit();
                }
        
                try {
                    // Insertar sucursal
                    $query = "INSERT INTO SUCURSAL (nombre, calle, localidad, ciudad, codigo_postal, telefono, horario_apertura, horario_cierre, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    $stmt = $conn->prepare($query);
                    $stmt->execute([$nombre, $calle, $localidad, $ciudad, $codigo_postal, $telefono, $horario_apertura, $horario_cierre, $latitud, $longitud]);
                    echo json_encode(['success' => true, 'message' => 'Sucursal agregada con éxito.']);
                } catch (PDOException $e) {
                    echo json_encode(['success' => false, 'message' => 'Error al guardar la sucursal: ' . $e->getMessage()]);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'No se recibieron datos de sucursal.']);
            }
            break;            

            case 'PUT': // Actualizar sucursal
                // Extraer datos de la solicitud y limpiar espacios
                $data = json_decode(file_get_contents('php://input'), true);
                $branch = $data['branch'] ?? null; // Asegúrate de obtener el branch correctamente
                $id_sucursal = trim($branch['id_sucursal'] ?? null); // Ahora accede a los datos del branch
                $nombre = trim($branch['nombre'] ?? null);
                $calle = trim($branch['calle'] ?? null);
                $localidad = trim($branch['localidad'] ?? null);
                $ciudad = trim($branch['ciudad'] ?? null);
                $codigo_postal = trim($branch['codigo_postal'] ?? null);
                $telefono = trim($branch['telefono'] ?? null);
                $horario_apertura = trim($branch['horario_apertura'] ?? null);
                $horario_cierre = trim($branch['horario_cierre'] ?? null);
                $latitud = trim($branch['latitud'] ?? null);
                $longitud = trim($branch['longitud'] ?? null);
            
                // Continuación del código para el caso PUT
                if (!$id_sucursal || in_array('', [$nombre, $calle, $localidad, $ciudad, $codigo_postal, $telefono, $horario_apertura, $horario_cierre, $latitud, $longitud], true)) {
                    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
                    exit();
                }

                try {
                // Actualizar la sucursal
                $query = "UPDATE SUCURSAL SET nombre = ?, calle = ?, localidad = ?, ciudad = ?, codigo_postal = ?, telefono = ?, horario_apertura = ?, horario_cierre = ?, latitud = ?, longitud = ? WHERE id_sucursal = ?";
                $stmt = $conn->prepare($query);
                $stmt->execute([$nombre, $calle, $localidad, $ciudad, $codigo_postal, $telefono, $horario_apertura, $horario_cierre, $latitud, $longitud, $id_sucursal]);
                echo json_encode(['success' => true, 'message' => 'Sucursal actualizada con éxito.']);
                } catch (PDOException $e) {
                echo json_encode(['success' => false, 'message' => 'Error al actualizar la sucursal: ' . $e->getMessage()]);
                }
                break;
            

    case 'DELETE': // Eliminar sucursal
        // Se sugiere pasar el id_sucursal a través del cuerpo de la solicitud
        $data = json_decode(file_get_contents('php://input'), true);
        $id_sucursal = trim($data['id_sucursal'] ?? null);

        if (!$id_sucursal) {
            echo json_encode(['success' => false, 'message' => 'ID de sucursal requerido.']);
            exit();
        }

        try {
            $query = "DELETE FROM SUCURSAL WHERE id_sucursal=?";
            $stmt = $conn->prepare($query);
            $stmt->execute([$id_sucursal]);
            echo json_encode(['success' => true, 'message' => 'Sucursal eliminada con éxito.']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar la sucursal: ' . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Método no soportado.']);
        break;
}
?>
