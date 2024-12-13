<?php
include '../../../config/conexion.php';
header('Content-Type: application/json');

try {
    // Consulta para obtener todos los datos del entrenador, incluyendo el teléfono desde la tabla ENTRENADOR
    $sql = "SELECT e.id_usuario, u.nombre AS nombre, e.especialidades, e.certificaciones, e.detalles, e.precio, 
                e.disponibilidad_dia, e.disponibilidad_hora, e.años_experiencia, e.formato, e.ruta_perfil, e.ruta_carousel, e.telefono
            FROM ENTRENADOR e 
            JOIN USUARIO u ON e.id_usuario = u.id_usuario";
    $stmt = $conn->query($sql);

    $entrenadores = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Construir las rutas absolutas para la foto de perfil
        $rutaPerfilAbsoluta = "/BITnessGYM" . $row['ruta_perfil'];
        
        // Procesar las rutas del carrusel
        $rutasCarousel = explode('|', $row['ruta_carousel']);
        $rutasCarouselAbsolutas = array_map(function($ruta) {
            return "/BITnessGYM" . trim($ruta);
        }, $rutasCarousel);
        
        // Crear un arreglo de entrenadores con todos los datos, incluyendo el teléfono
        $entrenadores[] = [
            'id_usuario' => (int)$row['id_usuario'],
            'name' => $row['nombre'],
            'specialties' => $row['especialidades'],
            'certifications' => $row['certificaciones'],
            'details' => $row['detalles'],
            'price' => $row['precio'],
            'availability_day' => $row['disponibilidad_dia'],
            'availability_hour' => $row['disponibilidad_hora'],
            'experience' => (int)$row['años_experiencia'],
            'format' => $row['formato'],
            'profilePhoto' => $rutaPerfilAbsoluta,
            'carouselImages' => implode('|', $rutasCarouselAbsolutas),
            'telefono' => $row['telefono'] // Tomando el teléfono desde la tabla ENTRENADOR
        ];
    }

    // Devolver la respuesta JSON con los datos de los entrenadores
    echo json_encode($entrenadores);
} catch (PDOException $e) {
    // Si hay un error, devolver un código de error 500 y el mensaje
    http_response_code(500);
    echo json_encode(['error' => 'Error en el servidor: ' . $e->getMessage()]);
}
?>
