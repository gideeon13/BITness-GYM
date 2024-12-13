<?php
include '../../../config/conexion.php';
session_start();

// Supón que el ID del usuario está en la sesión.
$id_usuario = $_SESSION['id_usuario'];

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Obtener datos del usuario uniendo las tablas USUARIO y CLIENTE
        $query = "SELECT U.altura, C.peso, C.edad, C.genero, C.nivel_act, C.ruta_perfil, C.descripcion
                FROM USUARIO U
                LEFT JOIN CLIENTE C ON U.id_usuario = C.id_usuario 
                WHERE U.id_usuario = :id_usuario";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Establecer la imagen de perfil por defecto según el género
        if (!$user['ruta_perfil']) {
            if ($user['genero'] === 'Masculino') {
                $ruta_perfil = '/assets/imgGifCliente/default1.jpeg';
            } elseif ($user['genero'] === 'Femenino') {
                $ruta_perfil = '/assets/imgGifCliente/default2.jpg';
            } elseif ($user['genero'] === 'Prefiero no decirlo') {
                $ruta_perfil = '/assets/imgGifCliente/gnome.jpeg'; // Imagen predeterminada para "Prefiero no decirlo"
            } else {
                $ruta_perfil = '/assets/imgGifCliente/default1.jpeg'; // Valor predeterminado en caso de error
            }
        } else {
            $ruta_perfil = $user['ruta_perfil'];
        }

        // Responder con los datos y si debe mostrarse el formulario
        $response = [
            'mostrarFormulario' => false,
            'ruta_perfil' => $ruta_perfil,
        ];

        // Comprobar si faltan datos
        if (!$user['altura'] || !$user['peso'] || !$user['edad'] || !$user['genero'] || !$user['nivel_act'] || !$user['descripcion']) {
            $response['mostrarFormulario'] = true;
        }

        echo json_encode($response);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Recoger datos del formulario
        $altura = $_POST['altura'] ?? null;
        $peso = $_POST['peso'] ?? null;
        $edad = $_POST['edad'] ?? null;
        $genero = $_POST['genero'] ?? null;
        $nivel_act = $_POST['nivel_act'] ?? null;
        $descripcion = $_POST['descripcion'] ?? null;

        // Subir foto de perfil si se ha proporcionado
        // Asignar ruta de perfil según el género
        if ($genero === 'Masculino') {
            $ruta_perfil = '/assets/imgGifCliente/default1.jpeg';
        } elseif ($genero === 'Femenino') {
            $ruta_perfil = '/assets/imgGifCliente/default2.jpg';
        } elseif ($genero === 'Prefiero no decirlo') {
            $ruta_perfil = '/assets/imgGifCliente/gnome.jpeg'; // Imagen predeterminada para "Prefiero no decirlo"
        } else {
            $ruta_perfil = '/assets/imgGifCliente/default1.jpeg'; // Valor predeterminado en caso de error
        }

        // Si se sube una nueva imagen de perfil
        if (isset($_FILES['foto_perfil']) && $_FILES['foto_perfil']['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['foto_perfil']['tmp_name'];
            $fileName = $_FILES['foto_perfil']['name'];
            $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION); // Obtiene la extensión
            $uniqueFileName = uniqid() . '.' . $fileExtension; // Genera un nombre único
            $ruta_perfil = '/assets/imgGifCliente/' . $uniqueFileName;

            move_uploaded_file($fileTmpPath, $_SERVER['DOCUMENT_ROOT'] . $ruta_perfil);
        }

        // Actualizar la tabla USUARIO solo con el campo altura
        $queryUsuario = "UPDATE USUARIO SET altura = :altura WHERE id_usuario = :id_usuario";
        $stmtUsuario = $conn->prepare($queryUsuario);
        $stmtUsuario->bindParam(':altura', $altura);
        $stmtUsuario->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $stmtUsuario->execute();

        // Actualizar la tabla CLIENTE con el resto de los datos, incluyendo descripción
        $queryCliente = "UPDATE CLIENTE SET peso = :peso, edad = :edad, genero = :genero, nivel_act = :nivel_act, descripcion = :descripcion, ruta_perfil = :ruta_perfil WHERE id_usuario = :id_usuario";
        $stmtCliente = $conn->prepare($queryCliente);
        $stmtCliente->bindParam(':peso', $peso);
        $stmtCliente->bindParam(':edad', $edad);
        $stmtCliente->bindParam(':genero', $genero);
        $stmtCliente->bindParam(':nivel_act', $nivel_act);
        $stmtCliente->bindParam(':descripcion', $descripcion);
        $stmtCliente->bindParam(':ruta_perfil', $ruta_perfil);
        $stmtCliente->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $stmtCliente->execute();

        echo json_encode(['success' => true, 'message' => 'Perfil actualizado correctamente']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error en la conexión: ' . $e->getMessage()]);
}
?>
