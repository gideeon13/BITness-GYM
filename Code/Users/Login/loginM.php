<?php 
include '../../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $correo = $_POST['correo'];
    $contrasena = $_POST['contrasena'];

    // Validar campos vacíos
    if (empty($correo) || empty($contrasena)) {
        echo json_encode(['status' => 'error', 'message' => 'Todos los campos son obligatorios']);
        exit();
    }

    // Buscar el usuario por correo en la tabla USUARIO
    $query = $conn->prepare("SELECT * FROM USUARIO WHERE email = :correo");
    $query->bindParam(':correo', $correo);
    $query->execute();
    $usuario = $query->fetch(PDO::FETCH_ASSOC);

    if ($usuario) {
        // Verificar si la contraseña está hasheada con password_hash (por ejemplo, bcrypt)
        if (password_verify($contrasena, $usuario['contraseña'])) {
            // Obtener el rol del usuario
            $rol = $usuario['rol'];

            // Verificar si el usuario tiene algún tipo de suscripción en la tabla Paga
            $isSubscribed = false;
            if ($rol == 'cliente') {
                // Si es cliente, verificar suscripción
                $checkSubscriptionQuery = $conn->prepare("SELECT * FROM Paga WHERE id_usuario_FK = :id_usuario");
                $checkSubscriptionQuery->bindParam(':id_usuario', $usuario['id_usuario']);
                $checkSubscriptionQuery->execute();
                $subscription = $checkSubscriptionQuery->fetch(PDO::FETCH_ASSOC);
                
                if ($subscription) {
                    $isSubscribed = true;
                }
            }

            // Llamar a la función de iniciar sesión, pasando la información de la suscripción
            iniciarSesion($usuario, $isSubscribed);
        } else {
            // Verificar si la contraseña está hasheada con SHA2
            $sha2_hash = hash('sha256', $contrasena);
            if ($sha2_hash === $usuario['contraseña']) {
                // Obtener el rol del usuario
                $rol = $usuario['rol'];

                // Verificar si el usuario tiene algún tipo de suscripción en la tabla Paga
                $isSubscribed = false;
                if ($rol == 'cliente') {
                    // Si es cliente, verificar suscripción
                    $checkSubscriptionQuery = $conn->prepare("SELECT * FROM Paga WHERE id_usuario_FK = :id_usuario");
                    $checkSubscriptionQuery->bindParam(':id_usuario', $usuario['id_usuario']);
                    $checkSubscriptionQuery->execute();
                    $subscription = $checkSubscriptionQuery->fetch(PDO::FETCH_ASSOC);
                    
                    if ($subscription) {
                        $isSubscribed = true;
                    }
                }

                // Llamar a la función de iniciar sesión, pasando la información de la suscripción
                iniciarSesion($usuario, $isSubscribed);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Correo o contraseña incorrectos.']);
            }
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Correo o contraseña incorrectos.']);
    }
}

function iniciarSesion($usuario, $isSubscribed) {
    $cookie_lifetime = 30 * 24 * 60 * 60; // 30 días en segundos

    session_set_cookie_params([
        'lifetime' => $cookie_lifetime, // Mantener la sesión durante 30 días
        'path' => '/',
        'secure' => false, // No es necesario usar HTTPS en localhost
        'httponly' => true,
        'samesite' => 'Strict',
        'domain' => false // No es necesario especificar el dominio en este caso
    ]);

    session_start();
    // Guardar información del usuario en la sesión
    $_SESSION['id_usuario'] = $usuario['id_usuario'];
    $_SESSION['usuario'] = $usuario['nombre'];
    $_SESSION['email'] = $usuario['email'];
    $_SESSION['rol'] = $usuario['rol'];

    // Enviar respuesta JSON con la información
    echo json_encode([
        'status' => 'success', 
        'rol' => $usuario['rol'], 
        'subscribed' => $isSubscribed
    ]);
}
?>
