<?php
include '../../../config/conexion.php';
session_start();

header('Content-Type: application/json');

// ID del usuario actual (en este caso está hardcodeado, pero lo puedes obtener de la sesión)
$idUsuario = $_SESSION['id_usuario'];
try {
    // Preparar la consulta SQL para obtener los datos del usuario y cliente
    $sql = "
        SELECT 
            u.nombre, 
            c.ruta_perfil, 
            c.descripcion, 
            u.altura, 
            c.peso, 
            c.edad, 
            c.genero, 
            c.nivel_act
        FROM 
            USUARIO u
        INNER JOIN 
            CLIENTE c ON u.id_usuario = c.id_usuario
        WHERE 
            u.id_usuario = :idUsuario
    ";

    // Preparar la declaración de la consulta usando PDO
    $stmt = $conn->prepare($sql);
    
    // Vincular el parámetro :idUsuario con la variable $idUsuario
    $stmt->bindParam(':idUsuario', $idUsuario, PDO::PARAM_INT);

    // Ejecutar la consulta
    $stmt->execute();

    // Verificar si se obtuvo algún resultado
    if ($stmt->rowCount() > 0) {
        // Obtener los datos en un formato asociativo
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Modificar la ruta del perfil para agregar la ruta absoluta
        if ($data['ruta_perfil']) {
           if(!file_exists($_SERVER['DOCUMENT_ROOT'] . $data['ruta_perfil'])) {
		$data['ruta_perfil'] = '/BITnessGYM' . $data['ruta_perfil'];
		}
        } 
        
        // Devolver los datos como JSON
        echo json_encode($data);
    } else {
        echo json_encode(null);  // No se encontraron datos
    }
} catch (PDOException $e) {
    // En caso de error, mostrar mensaje
    echo json_encode(["error" => "Error en la base de datos: " . $e->getMessage()]);
}

$conn = null; // Cerrar la conexión PDO
?>
