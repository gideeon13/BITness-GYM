<?php
include '../../../../config/conexion.php';

header('Content-Type: application/json');

// Verificar el método HTTP
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET': // Obtener todos los entrenadores
        try {
            // Consulta para obtener los entrenadores
            $query = "SELECT e.id_usuario, u.nombre, e.especialidades, e.detalles, e.precio 
                    FROM ENTRENADOR e
                    INNER JOIN USUARIO u ON e.id_usuario = u.id_usuario";
            $stmt = $conn->prepare($query);
            $stmt->execute();
            // Obtener todos los resultados
            $entrenadores = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['entrenadores' => $entrenadores]); // Devolver la respuesta con los datos
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;
    
    case 'PUT': // Actualizar los datos de un entrenador
        try {
            // Obtener los datos de la solicitud PUT
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (isset($data['id_usuario']) && isset($data['especialidades']) && isset($data['detalles']) && isset($data['precio'])) {
                $id_usuario = $data['id_usuario'];
                $especialidad = $data['especialidades'];
                $detalles = $data['detalles'];
                $precio = $data['precio'];

                // Consulta para actualizar los datos del entrenador
                $query = "UPDATE ENTRENADOR SET especialidades = :especialidad, detalles = :detalles, precio = :precio WHERE id_usuario = :id_usuario";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':id_usuario', $id_usuario);
                $stmt->bindParam(':especialidad', $especialidad);
                $stmt->bindParam(':detalles', $detalles);
                $stmt->bindParam(':precio', $precio);
                $stmt->execute();

                // Verificar si la actualización fue exitosa
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['success' => true, 'message' => 'Entrenador actualizado correctamente.']);
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

    case 'DELETE': // Eliminar un entrenador
        try {
            // Obtener los datos de la solicitud DELETE
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (isset($data['id'])) {
                $id = $data['id'];

                // Consulta para eliminar el entrenador
                $query = "DELETE FROM ENTRENADOR WHERE id_usuario = :id";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':id', $id);
                $stmt->execute();

                // Verificar si la eliminación fue exitosa
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['success' => true, 'message' => 'Entrenador eliminado.']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'No se pudo eliminar el entrenador.']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'No se proporcionó un ID válido.']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}
?>
