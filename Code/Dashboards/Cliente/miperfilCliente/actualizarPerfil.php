<?php
include '../../../config/conexion.php';
session_start();

header('Content-Type: application/json');

$id_usuario = $_SESSION['id_usuario'];

try {
    // Actualizar altura en la tabla USUARIO
    if (isset($_POST['altura']) && !empty($_POST['altura'])) {
        $stmt = $conn->prepare("UPDATE USUARIO SET altura = :altura WHERE id_usuario = :id_usuario");
        $stmt->bindValue(':altura', $_POST['altura'], PDO::PARAM_INT);
        $stmt->bindValue(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $stmt->execute();
    }

    // Actualizar peso, edad, genero, nivel_act en la tabla CLIENTE
    if (isset($_POST['peso']) && !empty($_POST['peso'])) {
        $stmt = $conn->prepare("UPDATE CLIENTE SET peso = :peso WHERE id_usuario = :id_usuario");
        $stmt->bindValue(':peso', $_POST['peso'], PDO::PARAM_INT);
        $stmt->bindValue(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $stmt->execute();
    }

    if (isset($_POST['edad']) && !empty($_POST['edad'])) {
        $stmt = $conn->prepare("UPDATE CLIENTE SET edad = :edad WHERE id_usuario = :id_usuario");
        $stmt->bindValue(':edad', $_POST['edad'], PDO::PARAM_INT);
        $stmt->bindValue(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $stmt->execute();
    }

    if (isset($_POST['genero']) && !empty($_POST['genero'])) {
        $stmt = $conn->prepare("UPDATE CLIENTE SET genero = :genero WHERE id_usuario = :id_usuario");
        $stmt->bindValue(':genero', $_POST['genero'], PDO::PARAM_STR);
        $stmt->bindValue(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $stmt->execute();
    }

    if (isset($_POST['nivel_act']) && !empty($_POST['nivel_act'])) {
        $stmt = $conn->prepare("UPDATE CLIENTE SET nivel_act = :nivel_act WHERE id_usuario = :id_usuario");
        $stmt->bindValue(':nivel_act', $_POST['nivel_act'], PDO::PARAM_STR);
        $stmt->bindValue(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $stmt->execute();
    }

    // Actualizar descripción en la tabla CLIENTE
    if (isset($_POST['descripcion']) && !empty($_POST['descripcion'])) {
        $stmt = $conn->prepare("UPDATE CLIENTE SET descripcion = :descripcion WHERE id_usuario = :id_usuario");
        $stmt->bindValue(':descripcion', $_POST['descripcion'], PDO::PARAM_STR);
        $stmt->bindValue(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $stmt->execute();
    }

    // Verificar si ya existe una foto de perfil
    $stmt = $conn->prepare("SELECT ruta_perfil FROM CLIENTE WHERE id_usuario = :id_usuario");
    $stmt->bindValue(':id_usuario', $id_usuario, PDO::PARAM_INT);
    $stmt->execute();
    $existingPhoto = $stmt->fetch(PDO::FETCH_ASSOC);

    // Si no se sube una nueva foto, mantenemos la foto actual
    $newFileName = $existingPhoto['ruta_perfil'];

    // Ruta del directorio de destino para la imagen
    $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/BITnessGYM/assets/imgGifCliente/';

    // Asegurarse de que el directorio exista, si no, crearlo
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true); // Crea el directorio si no existe
    }

    // Manejo de la carga de la foto de perfil
    if (isset($_FILES['foto_perfil']) && $_FILES['foto_perfil']['error'] === UPLOAD_ERR_OK) {
        $photo = $_FILES['foto_perfil'];
        $allowedExtensions = ['jpg', 'jpeg', 'png'];
        $ext = strtolower(pathinfo($photo['name'], PATHINFO_EXTENSION));

        if (in_array($ext, $allowedExtensions)) {
            $newFileName = 'profile_' . $id_usuario . '.' . $ext;

            // Intentar mover el archivo al directorio especificado
            if (move_uploaded_file($photo['tmp_name'], $uploadDir . $newFileName)) {
                // Actualizar la ruta de la foto de perfil en la tabla CLIENTE
                $stmt = $conn->prepare("UPDATE CLIENTE SET ruta_perfil = :foto_perfil WHERE id_usuario = :id_usuario");
                $stmt->bindValue(':foto_perfil', '/assets/imgGifCliente/' . $newFileName, PDO::PARAM_STR); // Se guarda la ruta relativa
                $stmt->bindValue(':id_usuario', $id_usuario, PDO::PARAM_INT);
                $stmt->execute();
            } else {
                throw new Exception('Error al mover el archivo de imagen.');
            }
        } else {
            throw new Exception('El tipo de archivo no es válido. Solo se permiten imágenes JPG, JPEG y PNG.');
        }
    }

    echo json_encode(['success' => true, 'photo' => $newFileName]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
