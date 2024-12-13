?php
session_start();
include '../../../config/conexion.php';

if (!isset($_SESSION['id_usuario']) || $_SESSION['rol'] !== 'entrenador') {
    echo json_encode(['error' => 'Acceso no autorizado']);
    exit;
}

$id_usuario = $_SESSION['id_usuario'];
$base_url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://{$_SERVER['HTTP_HOST']}/LA_POSTA";

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        // Fetch details of a specific training
        $idActividad = $_GET['id'];
        try {
            $stmt = $conn->prepare("
                SELECT 
                    e.id_actividad,
                    e.nombre AS nombre_entrenamiento,
                    ej.id_ejercicio,
                    ej.nombre AS nombre_ejercicio,
                    ej.ruta_gif,
                    ej.ruta_img,
                    ej.musculo_img,
                    ej.musculos,
                    ej.equipamiento,
                    r.peso,
                    r.cantidad AS repeticiones
                FROM ENTRENAMIENTO e
                JOIN Compone c ON e.id_actividad = c.id_actividad_FK
                JOIN EJERCICIO ej ON c.id_ejercicio_FK = ej.id_ejercicio
                LEFT JOIN REPETICION r ON ej.id_repeticion = r.id_repeticion
                WHERE e.id_actividad = ? AND e.id_usuario = ?
            ");
            $stmt->execute([$idActividad, $id_usuario]);
            $ejercicios = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($ejercicios) {
                $respuesta = [
                    'id_actividad' => $idActividad,
                    'nombre' => $ejercicios[0]['nombre_entrenamiento'],
                    'ejercicios' => array_map(function($ejercicio) use ($base_url) {
                        return [
                            'id_ejercicio' => $ejercicio['id_ejercicio'],
                            'nombre' => $ejercicio['nombre_ejercicio'],
                            'ruta_img' => $base_url . $ejercicio['ruta_img'],
                            'ruta_gif' => $base_url . $ejercicio['ruta_gif'],
                            'musculo_img' => $base_url . $ejercicio['musculo_img'],
                            'musculos' => explode(',', $ejercicio['musculos']),
                            'equipamiento' => $ejercicio['equipamiento'],
                            'peso' => $ejercicio['peso'],
                            'repeticiones' => $ejercicio['repeticiones']
                        ];
                    }, $ejercicios)
                ];
                echo json_encode($respuesta);
            } else {
                echo json_encode(['error' => 'Entrenamiento no encontrado']);
            }
        } catch (PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    } elseif (isset($_GET['all_exercises'])) {
        // Fetch all exercises for selection
        try {
            $stmt = $conn->query("SELECT id_ejercicio, nombre, ruta_img, musculos FROM EJERCICIO");
            $exercises = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($exercises);
        } catch (PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    } else {
        // Fetch all trainings
        try {
            $stmt = $conn->prepare("
                SELECT DISTINCT 
                    e.id_actividad, 
                    e.nombre,
                    (
                        SELECT ej.ruta_img 
                        FROM Compone c 
                        JOIN EJERCICIO ej ON c.id_ejercicio_FK = ej.id_ejercicio 
                        WHERE c.id_actividad_FK = e.id_actividad 
                        LIMIT 1
                    ) AS ruta_img
                FROM ENTRENAMIENTO e
                WHERE e.id_usuario = ?
            ");
            $stmt->execute([$id_usuario]);
            $entrenamientos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $entrenamientos = array_map(function ($entrenamiento) use ($base_url) {
                if (!empty($entrenamiento['ruta_img'])) {
                    $entrenamiento['ruta_img'] = $base_url . $entrenamiento['ruta_img'];
                }
                return $entrenamiento;
            }, $entrenamientos);

            echo json_encode($entrenamientos);
        } catch (PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $datos = json_decode(file_get_contents('php://input'), true);

    try {
        $conn->beginTransaction();

        $stmt = $conn->prepare("INSERT INTO ACTIVIDAD (hora_inicio, hora_fin, dia) VALUES (NOW(), NOW(), 'Lunes')");
        $stmt->execute();
        $idActividad = $conn->lastInsertId();

        $stmt = $conn->prepare("INSERT INTO ENTRENAMIENTO (id_actividad, id_usuario, nombre) VALUES (?, ?, ?)");
        $stmt->execute([$idActividad, $id_usuario, $datos['nombre']]);

        foreach ($datos['ejercicios'] as $ejercicio) {
            $stmt = $conn->prepare("INSERT INTO REPETICION (peso, cantidad) VALUES (?, ?)");
            $stmt->execute([$ejercicio['peso'], $ejercicio['repeticiones']]);
            $idRepeticion = $conn->lastInsertId();

            $stmt = $conn->prepare("UPDATE EJERCICIO SET id_repeticion = ? WHERE id_ejercicio = ?");
            $stmt->execute([$idRepeticion, $ejercicio['id']]);

            $stmt = $conn->prepare("INSERT INTO Compone (id_actividad_FK, id_ejercicio_FK) VALUES (?, ?)");
            $stmt->execute([$idActividad, $ejercicio['id']]);
        }

        $conn->commit();
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        $conn->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
}