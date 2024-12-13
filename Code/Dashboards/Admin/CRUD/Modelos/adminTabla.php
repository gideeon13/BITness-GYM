<?php
include '../../../../config/conexion.php';

header('Content-Type: application/json');

// Verificar el método HTTP
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET': // Obtener todos los administradores
        try {
            // Consulta para obtener los administradores con el cargo
            $query = "SELECT a.id_usuario, a.cargo, u.nombre, u.email 
                    FROM ADMINISTRADOR a
                    INNER JOIN USUARIO u ON a.id_usuario = u.id_usuario";
            $stmt = $conn->prepare($query);
            $stmt->execute();
            // Obtener todos los resultados
            $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['admins' => $admins]); // Devolver la respuesta con los datos
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;
    
    case 'PUT': // Actualizar los datos de un administrador
        try {
            // Obtener los datos de la solicitud PUT
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (isset($data['id_usuario']) && isset($data['cargo'])) {
                $id_usuario = $data['id_usuario'];
                $cargo = $data['cargo'];

                // Consulta para actualizar los datos del administrador
                $query = "UPDATE ADMINISTRADOR SET cargo = :cargo WHERE id_usuario = :id_usuario";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':id_usuario', $id_usuario);
                $stmt->bindParam(':cargo', $cargo);
                $stmt->execute();

                // Verificar si la actualización fue exitosa
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['success' => true, 'message' => 'Administrador actualizado correctamente.']);
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
    
    case 'DELETE': // Eliminar un administrador
        try {
            // Obtener el id_usuario a eliminar
            $data = json_decode(file_get_contents("php://input"), true);
            if (isset($data['id'])) {
                $id_usuario = $data['id'];

                // Consulta para eliminar el administrador
                $query = "DELETE FROM ADMINISTRADOR WHERE id_usuario = :id_usuario";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':id_usuario', $id_usuario);
                $stmt->execute();

                // Verificar si la eliminación fue exitosa
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['success' => true, 'message' => 'Administrador eliminado correctamente.']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'No se encontró el administrador a eliminar.']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'ID de administrador no proporcionado.']);
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
