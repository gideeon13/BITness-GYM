<?php
// Aquí se manejará todo lo relacionado con la suscripción mediante la relación Paga de Cliente a Suscripción
include '../../../../config/conexion.php';
header('Content-Type: application/json');

// Obtener el método de solicitud
$method = $_SERVER['REQUEST_METHOD'];

// Obtener datos de la solicitud en caso de que sea PUT o DELETE
$data = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET': // Obtener todas las suscripciones o una específica, o los IDs para el select
        try {
            if (isset($_GET['id'])) {
                // Obtener una suscripción específica
                $id = $_GET['id'];
                $query = "SELECT id_suscripcion_FK, id_usuario_FK, fecha_inicio, fecha_fin FROM Paga WHERE id_suscripcion_FK = :id";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':id', $id, PDO::PARAM_INT);
                $stmt->execute();
                $suscripcion = $stmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'suscripcion' => $suscripcion]);
            } else if (isset($_GET['action']) && $_GET['action'] == 'GET_SUBSCRIPTIONS') {
                // Obtener los IDs de las suscripciones para llenar el select
                $query = "SELECT id_suscripcion FROM SUSCRIPCION";
                $stmt = $conn->prepare($query);
                $stmt->execute();
                $suscripciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'suscripciones' => $suscripciones]);
            } else if (isset($_GET['action']) && $_GET['action'] == 'GET_USERS') {
                // Obtener los IDs de usuarios que no están en la tabla Paga
                $query = "
                    SELECT id_usuario FROM CLIENTE 
                    WHERE id_usuario NOT IN (SELECT id_usuario_FK FROM Paga)";
                $stmt = $conn->prepare($query);
                $stmt->execute();
                $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'usuarios' => $usuarios]);
            } else {
                // Obtener todas las suscripciones
                $query = "SELECT id_suscripcion_FK, id_usuario_FK, fecha_inicio, fecha_fin FROM Paga";
                $stmt = $conn->prepare($query);
                $stmt->execute();
                $suscripciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'suscripciones' => $suscripciones]);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error al obtener las suscripciones: ' . $e->getMessage()]);
        }
        break;    

    case 'POST': // Crear una nueva suscripción
        if (isset($data['id_suscripcion'], $data['id_usuario'], $data['fecha_inicio'], $data['fecha_fin'])) {
            try {
                $query = "INSERT INTO Paga (id_suscripcion_FK, id_usuario_FK, fecha_inicio, fecha_fin) VALUES (:id_suscripcion, :id_usuario, :fecha_inicio, :fecha_fin)";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':id_suscripcion', $data['id_suscripcion']);
                $stmt->bindParam(':id_usuario', $data['id_usuario']);
                $stmt->bindParam(':fecha_inicio', $data['fecha_inicio']);
                $stmt->bindParam(':fecha_fin', $data['fecha_fin']);
                $stmt->execute();
                echo json_encode(['success' => true, 'message' => 'Suscripción creada correctamente']);
            } catch (PDOException $e) {
                echo json_encode(['success' => false, 'message' => 'Error al crear la suscripción: ' . $e->getMessage()]);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Datos incompletos para crear una suscripción']);
        }
        break;

        case 'PUT':
            if (isset($data['id'], $data['fecha_inicio'], $data['fecha_fin'], $data['id_usuario'])) {
                try {
                    // Validar formato de las fechas
                    $fechaInicioValida = DateTime::createFromFormat('Y-m-d', $data['fecha_inicio']);
                    $fechaFinValida = DateTime::createFromFormat('Y-m-d', $data['fecha_fin']);
                    
                    if (!$fechaInicioValida || !$fechaFinValida) {
                        echo json_encode(['success' => false, 'message' => 'Formato de fecha inválido']);
                        exit;
                    }
        
                    // Actualiza el registro directamente
                    $query = "UPDATE Paga SET fecha_inicio = :fecha_inicio, fecha_fin = :fecha_fin, id_suscripcion_FK = :id, id_usuario_FK = :id_usuario WHERE id_usuario_FK = :id_usuario";
                    $stmt = $conn->prepare($query);
                    $stmt->bindParam(':id', $data['id']);
                    $stmt->bindParam(':fecha_inicio', $data['fecha_inicio']);
                    $stmt->bindParam(':fecha_fin', $data['fecha_fin']);
                    $stmt->bindParam(':id_usuario', $data['id_usuario']);
                    $stmt->execute();
        
                    echo json_encode(['success' => true, 'message' => 'Suscripción actualizada correctamente']);
                } catch (PDOException $e) {
                    error_log('Error al actualizar la suscripción: ' . $e->getMessage());
                    echo json_encode(['success' => false, 'message' => 'Error al actualizar la suscripción']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Datos incompletos para actualizar la suscripción']);
            }
            break;
        
        
            case 'DELETE': // Eliminar una suscripción
                if (isset($data['id_suscripcion'], $data['id_usuario'])) {
                    $id_suscripcion = $data['id_suscripcion'];
                    $id_usuario = $data['id_usuario'];
                    
                    try {
                        $query = "DELETE FROM Paga WHERE id_suscripcion_FK = :id_suscripcion AND id_usuario_FK = :id_usuario";
                        $stmt = $conn->prepare($query);
                        $stmt->bindParam(':id_suscripcion', $id_suscripcion, PDO::PARAM_INT);
                        $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
                        $stmt->execute();
        
                        if ($stmt->rowCount() > 0) {
                            echo json_encode(['success' => true, 'message' => 'Suscripción eliminada exitosamente.']);
                        } else {
                            echo json_encode(['success' => false, 'message' => 'No se encontró la suscripción para eliminar.']);
                        }
                    } catch (PDOException $e) {
                        echo json_encode(['success' => false, 'message' => 'Error al eliminar la suscripción: ' . $e->getMessage()]);
                    }
                } else {
                    echo json_encode(['success' => false, 'message' => 'Datos de eliminación no proporcionados.']);
                }
                break;          

    default:
        echo json_encode(['success' => false, 'message' => 'Método no soportado']);
        break;
}
?>
