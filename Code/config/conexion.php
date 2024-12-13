<?php
// Datos de la base de datos
$host = "localhost";
$dbname = "BITness_GYM";
$username = "gymbro1234";
$password = "raccoon1234";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Error de conexión: " . $e->getMessage();
    die();
}
?>
