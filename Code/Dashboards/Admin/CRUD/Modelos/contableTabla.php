<?php
include '../../../../config/conexion.php';

header('Content-Type: application/json');

// Verificar el método HTTP
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET': // Obtener los contables
        try {
            if (isset($_GET['id'])) {
                // Si se proporciona un ID de usuario, obtener los contables correspondientes a ese usuario
                $id_usuario = $_GET['id'];  // Cambié 'id_contable' por 'id_usuario'
                $query = "SELECT c.id_usuario, c.departamento
                        FROM CONTABLE c
                        JOIN USUARIO u ON u.id_usuario = c.id_usuario
                        WHERE u.id_usuario = :id_usuario";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
                $stmt->execute();
                // Obtener los resultados
                $contables = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } else {
                // Si no se proporciona un ID, obtener todos los contables
                $query = "SELECT c.id_usuario, c.departamento
                        FROM CONTABLE c
                        JOIN USUARIO u ON u.id_usuario = c.id_usuario";
                $stmt = $conn->prepare($query);
                $stmt->execute();
                // Obtener todos los resultados
                $contables = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }

            // Verificar si se obtuvieron resultados
            if (count($contables) > 0) {
                echo json_encode(['contables' => $contables]); // Devolver los datos
            } else {
                echo json_encode(['success' => false, 'message' => 'No se encontraron contables.']);
            }

        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;
    
    case 'PUT': // Actualizar los datos de un contable
        try {
            // Obtener los datos de la solicitud PUT
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (isset($data['id_usuario']) && isset($data['departamento'])) {
                $id_usuario = $data['id_usuario'];
                $departamento = $data['departamento'];

                // Consulta para actualizar los datos del contable
                $query = "UPDATE CONTABLE SET departamento = :departamento WHERE id_usuario = :id_usuario";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':id_usuario', $id_usuario);
                $stmt->bindParam(':departamento', $departamento);
                $stmt->execute();

                // Verificar si la actualización fue exitosa
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['success' => true, 'message' => 'Contable actualizado correctamente.']);
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
    
    case 'DELETE': // Eliminar un contable
        try {
            // Obtener el id_contable a eliminar
            $data = json_decode(file_get_contents("php://input"), true);
            if (isset($data['id'])) {
                $id_contable = $data['id'];
            
                // Consulta para eliminar el contable
                $query = "DELETE FROM CONTABLE WHERE id_usuario = :id_contable";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':id_contable', $id_contable);
                $stmt->execute();
            
                // Verificar si la eliminación fue exitosa
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['success' => true, 'message' => 'Contable eliminado correctamente.']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'No se encontró el contable.']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'No se proporcionó un id válido.']);
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
