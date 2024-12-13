<?php
session_start();
if (isset($_SESSION['rol'])) {
    // Enviar el rol y la confirmación de sesión activa
    echo json_encode(['status' => 'success', 'rol' => $_SESSION['rol']]);
} else {
    // Enviar un error si no hay sesión activa
    echo json_encode(['status' => 'error', 'message' => 'No hay sesión activa']);
}
?>
