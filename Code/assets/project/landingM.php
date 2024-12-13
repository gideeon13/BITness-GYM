<?php
include '../../config/conexion.php';
header('Content-Type: application/json');

try {
    // Consulta para obtener todos los datos del entrenador junto con el nombre de usuario
    $sql = "SELECT e.id_usuario, u.nombre AS nombre, e.especialidades, e.certificaciones, e.detalles, e.precio, 
                   e.disponibilidad_dia, e.disponibilidad_hora, e.años_experiencia, e.formato, e.ruta_perfil, e.ruta_carousel
            FROM ENTRENADOR e 
            JOIN USUARIO u ON e.id_usuario = u.id_usuario";
    $stmt = $conn->query($sql);

    $entrenadores = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Construir las rutas absolutas
        $rutaPerfilAbsoluta = "/LA_POSTA" . $row['ruta_perfil'];
        
        // Procesar las rutas del carrusel
        $rutasCarousel = explode('|', $row['ruta_carousel']);
        $rutasCarouselAbsolutas = array_map(function($ruta) {
            return "/LA_POSTA" . trim($ruta);
        }, $rutasCarousel);
        
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
            'carouselImages' => implode('|', $rutasCarouselAbsolutas)
        ];
    }

    echo json_encode($entrenadores);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en el servidor: ' . $e->getMessage()]);
}
?>