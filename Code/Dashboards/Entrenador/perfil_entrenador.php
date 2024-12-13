<?php
session_start();
include '../../config/conexion.php';

if (!isset($_SESSION['id_usuario']) || $_SESSION['rol'] !== 'entrenador') {
    echo json_encode(['error' => 'Acceso no autorizado']);
    exit;
}

$id_usuario = $_SESSION['id_usuario'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $baseURL = ($_SERVER['REQUEST_SCHEME'] ?? 'http') . '://' . $_SERVER['HTTP_HOST'];

        $stmt = $conn->prepare("SELECT u.nombre, e.* FROM USUARIO u 
                               JOIN ENTRENADOR e ON u.id_usuario = e.id_usuario 
                               WHERE u.id_usuario = ?");
        $stmt->execute([$id_usuario]);
        $perfil = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($perfil) {
            if (!empty($perfil['ruta_perfil'])) {
                $perfil['ruta_perfil'] = $baseURL . $perfil['ruta_perfil'];
            }
            if (!empty($perfil['ruta_carousel'])) {
                $carouselImages = explode('|', $perfil['ruta_carousel']);
                $perfil['ruta_carousel'] = implode('|', array_map(function($img) use ($baseURL) {
                    return $baseURL . $img;
                }, $carouselImages));
            }
            echo json_encode($perfil);
        } else {
            echo json_encode(['error' => 'Perfil no encontrado']);
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $stmt = $conn->prepare("UPDATE ENTRENADOR SET 
            especialidades =?, certificaciones = ?, detalles = ?, precio = ?,
            disponibilidad_dia = ?, disponibilidad_hora = ?, años_experiencia = ?, formato = ?, telefono = ?
            WHERE id_usuario = ?");
        
        $stmt->execute([
            $_POST['especialidades'],
            $_POST['certificaciones'],
            $_POST['detalles'],
            $_POST['precio'],
            $_POST['disponibilidad_dia'],
            $_POST['disponibilidad_hora'],
            $_POST['anos_experiencia'],
            $_POST['formato'],
            $_POST['telefono'],
            $id_usuario
        ]);

        $stmtUser = $conn->prepare("UPDATE USUARIO SET nombre = ? WHERE id_usuario = ?");
        $stmtUser->execute([$_POST['nombre'], $id_usuario]);

        $baseDir = $_SERVER['DOCUMENT_ROOT'] . '/BITnessGYM/assets/imgEntrenador/';

        // Manejar la foto de perfil
        if (isset($_FILES['foto_perfil']) && $_FILES['foto_perfil']['error'] == 0) {
            $foto = $_FILES['foto_perfil'];
            $nombreArchivo = $id_usuario . '_perfil_' . time() . '.' . pathinfo($foto['name'], PATHINFO_EXTENSION);
            $rutaDestino = $baseDir . $nombreArchivo;
            
            if (move_uploaded_file($foto['tmp_name'], $rutaDestino)) {
                $rutaRelativa = '/assets/imgEntrenador/' . $nombreArchivo;
                $stmtFoto = $conn->prepare("UPDATE ENTRENADOR SET ruta_perfil = ? WHERE id_usuario = ?");
                $stmtFoto->execute([$rutaRelativa, $id_usuario]);
            }
        }

        // Manejar las fotos del carrusel
        $rutasCarousel = [];
        if (isset($_FILES['fotos_carousel'])) {
            foreach ($_FILES['fotos_carousel']['tmp_name'] as $key => $tmp_name) {
                if ($_FILES['fotos_carousel']['error'][$key] == 0) {
                    $nombreArchivo = $id_usuario . '_carousel_' . time() . '_' . $key . '.' . pathinfo($_FILES['fotos_carousel']['name'][$key], PATHINFO_EXTENSION);
                    $rutaDestino = $baseDir . $nombreArchivo;
                    if (move_uploaded_file($tmp_name, $rutaDestino)) {
                        $rutasCarousel[] = '/assets/imgEntrenador/' . $nombreArchivo;
                    }
                }
            }
        }

        if (!empty($rutasCarousel)) {
            $rutasCarouselString = implode('|', $rutasCarousel);
            $stmtCarousel = $conn->prepare("UPDATE ENTRENADOR SET ruta_carousel = ? WHERE id_usuario = ?");
            $stmtCarousel->execute([$rutasCarouselString, $id_usuario]);
        }

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
