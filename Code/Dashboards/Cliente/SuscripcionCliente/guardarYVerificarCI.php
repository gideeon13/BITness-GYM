<?php
include '../../../config/conexion.php';
session_start();
// Verificar si el id_usuario está definido en la sesión
if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(array("success" => false, "error" => "Usuario no autenticado"));
    exit;
}

$response = array("success" => false, "ci_existe" => false); // Añadimos la clave ci_existe

// Verificar si la solicitud es GET (para verificar si el CI existe)
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $id_usuario = $_SESSION['id_usuario'];

    try {
        // Verificar si el usuario ya tiene un CI registrado en la base de datos
        $sqlCheck = "SELECT ci FROM USUARIO WHERE id_usuario = :id_usuario";
        $stmtCheck = $conn->prepare($sqlCheck);
        $stmtCheck->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $stmtCheck->execute();

        $ci = $stmtCheck->fetchColumn();

        if ($ci) {
            // Si el CI ya está registrado, responder con ci_existe = true
            $response["ci_existe"] = true;
        } else {
            // Si el CI no está registrado, responder con ci_existe = false
            $response["ci_existe"] = false;
        }
    } catch (PDOException $e) {
        error_log("Error en la operación: " . $e->getMessage());
    }
}

// Verificar si la solicitud es POST (para guardar el CI)
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['ci'])) {
    $ci = trim($_POST['ci']);
    $id_usuario = $_SESSION['id_usuario'];

    try {
        // Verificar si el CI ya existe para otros usuarios
        $sqlCheck = "SELECT COUNT(*) FROM USUARIO WHERE ci = :ci AND id_usuario != :id_usuario";
        $stmtCheck = $conn->prepare($sqlCheck);
        $stmtCheck->bindParam(':ci', $ci, PDO::PARAM_STR);
        $stmtCheck->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $stmtCheck->execute();

        $count = $stmtCheck->fetchColumn();

        if ($count == 0) {
            // Si el CI no existe para otros usuarios, proceder a guardarlo
            $sqlUpdate = "UPDATE USUARIO SET ci = :ci WHERE id_usuario = :id_usuario";
            $stmtUpdate = $conn->prepare($sqlUpdate);
            $stmtUpdate->bindParam(':ci', $ci, PDO::PARAM_STR);
            $stmtUpdate->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);

            if ($stmtUpdate->execute()) {
                $response["success"] = true;
            }
        } else {
            // Si el CI ya existe, indicar que el CI ya está registrado
            $response["success"] = true;
            $response["ci_existe"] = true; // Indicamos que el CI ya existe
        }
    } catch (PDOException $e) {
        error_log("Error en la operación: " . $e->getMessage());
    }
}

echo json_encode($response);
$conn = null;
?>
