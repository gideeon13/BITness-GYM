<?php
include '../../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $nombre_usuario = $_POST['nombre_usuario'];
    $correo = $_POST['correo'];
    $contrasena = $_POST['contrasena'];

    // Validar campos vacíos
    if (empty($nombre_usuario) || empty($correo) || empty($contrasena)) {
        echo json_encode(['status' => 'error', 'message' => 'Todos los campos son obligatorios.']);
        exit();
    }

    // Verificar si el correo ya está registrado
    $query = $conn->prepare("SELECT * FROM USUARIO WHERE email = :correo");
    $query->bindParam(':correo', $correo);
    $query->execute();

    if ($query->rowCount() > 0) {
        echo json_encode(['status' => 'error', 'message' => 'El correo ya está registrado']);
        exit();
    }

    // Hash de la contraseña
    $hash_password = password_hash($contrasena, PASSWORD_BCRYPT);

    // Obtener la fecha actual
    $fecha_registro = date("Y-m-d"); // Ajusta el formato según tus necesidades

    // Insertar nuevo usuario
    $query = $conn->prepare("INSERT INTO USUARIO (email, contraseña, nombre, rol, fecha_registro) VALUES (:correo, :contrasena, :nombre_usuario, 'cliente', :fecha_registro)");
    $query->bindParam(':correo', $correo);
    $query->bindParam(':contrasena', $hash_password);
    $query->bindParam(':nombre_usuario', $nombre_usuario);
    $query->bindParam(':fecha_registro', $fecha_registro);

    if ($query->execute()) {
        $cookie_lifetime = 30 * 24 * 60 * 60; // 30 días en segundos

        session_set_cookie_params([
            'lifetime' => $cookie_lifetime, // Mantener la sesión durante 30 días
            'path' => '/',
            'secure' => false, // No es necesario usar HTTPS en localhost
            'httponly' => true,
            'samesite' => 'Strict',
            'domain' => false // No es necesario especificar el dominio en este caso
        ]);

        // Iniciar sesión automáticamente después del registro
        session_start();

        // Regenerar el ID de la sesión para mayor seguridad
        session_regenerate_id(true);

        // Obtener el último ID insertado
        $id_usuario = $conn->lastInsertId();

        // Guardar datos en la sesión
        $_SESSION['id_usuario'] = $id_usuario;
        $_SESSION['usuario'] = $nombre_usuario;
        $_SESSION['email'] = $correo;
        $_SESSION['rol'] = 'cliente';

        // Insertar en la tabla PERFIL
        $query_perfil = $conn->prepare("INSERT INTO PERFIL (id_usuario) VALUES (:id_usuario)");
        $query_perfil->bindParam(':id_usuario', $id_usuario);

        // Insertar en la tabla CLIENTE
        $query_cliente = $conn->prepare("INSERT INTO CLIENTE (id_usuario) VALUES (:id_usuario)");
        $query_cliente->bindParam(':id_usuario', $id_usuario);

        // Ejecutar ambas inserciones
        if ($query_perfil->execute() && $query_cliente->execute()) {
            // Enviar respuesta JSON de éxito
            echo json_encode(['status' => 'success', 'message' => 'Registro exitoso']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error al registrar en PERFIL o CLIENTE']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al registrar el usuario']);
    }
}
?>
