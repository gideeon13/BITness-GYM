<?php
include '../../../../config/conexion.php';

header('Content-Type: application/json');

// Verificar el método HTTP
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET': // Obtener todos los clientes
        try {
            // Consulta para obtener los clientes con sus datos
            $query = "SELECT c.id_usuario, c.estado_sus, c.sus_preferida, c.concurrencia
                    FROM CLIENTE c
                    INNER JOIN USUARIO u ON c.id_usuario = u.id_usuario";
            $stmt = $conn->prepare($query);
            $stmt->execute();
            // Obtener todos los resultados
            $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['clientes' => $clientes]); // Devolver la respuesta con los datos
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;
    
    case 'PUT': // Actualizar los datos de un cliente
        try {
            // Obtener los datos de la solicitud PUT
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (isset($data['id_usuario']) && isset($data['estado_sus']) && isset($data['sus_preferida']) && isset($data['concurrencia'])) {
                $id_usuario = $data['id_usuario'];
                $estado_sus = $data['estado_sus'];
                $sus_preferida = $data['sus_preferida'];
                $concurrencia = $data['concurrencia'];

                // Consulta para actualizar los datos del cliente
                $query = "UPDATE CLIENTE SET estado_sus = :estado_sus, sus_preferida = :sus_preferida, concurrencia = :concurrencia WHERE id_usuario = :id_usuario";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':id_usuario', $id_usuario);
                $stmt->bindParam(':estado_sus', $estado_sus);
                $stmt->bindParam(':sus_preferida', $sus_preferida);
                $stmt->bindParam(':concurrencia', $concurrencia);
                $stmt->execute();

                // Verificar si la actualización fue exitosa
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['success' => true, 'message' => 'Cliente actualizado correctamente.']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'No se encontraron cambios.']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Datos incompletos para actualizar.']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;
    
    case 'DELETE': // Eliminar un cliente
        try {
            // Obtener el id_usuario a eliminar
            $data = json_decode(file_get_contents("php://input"), true);
            if (isset($data['id'])) {
                $id_usuario = $data['id'];

                // Consulta para eliminar el cliente
                $query = "DELETE FROM CLIENTE WHERE id_usuario = :id_usuario";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':id_usuario', $id_usuario);
                $stmt->execute();

                // Verificar si la eliminación fue exitosa
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['success' => true, 'message' => 'Cliente eliminado correctamente.']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'No se encontró el cliente a eliminar.']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'ID de cliente no proporcionado.']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        break;
}
?>
