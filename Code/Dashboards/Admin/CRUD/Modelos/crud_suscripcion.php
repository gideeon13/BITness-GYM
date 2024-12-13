<?php
session_start();
include '../../../../config/conexion.php';
require '../../../../vendor/autoload.php'; 

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

// Si la solicitud es GET, obtener las suscripciones
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Consulta para obtener suscripciones
    $sql = "SELECT * FROM SUSCRIPCION ORDER BY id_suscripcion";

    try {
        // Preparar y ejecutar la consulta
        $stmt = $conn->prepare($sql);
        $stmt->execute();

        // Obtener todos los resultados en formato de array asociativo
        $suscripciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Verificar si se obtuvieron resultados
        if (empty($suscripciones)) {
            error_log("No hay suscripciones disponibles."); // Mensaje en la consola
            echo json_encode([]); // Devolver un array vacío si no hay suscripciones
            exit;
        }

        // Establecer el tipo de contenido a JSON y devolver los resultados
        header('Content-Type: application/json');
        echo json_encode($suscripciones);
    } catch (PDOException $e) {
        // En caso de error, devolver el mensaje de error
        error_log("Error en la consulta: " . $e->getMessage()); // Mensaje en la consola
        die("Error en la consulta: " . $e->getMessage());
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Si la solicitud es PUT, actualizar la suscripción
    parse_str(file_get_contents("php://input"), $_PUT); // Obtener datos de la solicitud PUT
    $cardId = $_PUT['id']; // Esto ahora será 1, 2 o 3 dependiendo de la carta
    $precioMensual = $_PUT['precioMensual'];
    $precioAnual = $_PUT['precioAnual'];
    $descripcion = $_PUT['descripcion'];
    $categoria = $_PUT['categoria'];
    
    // Determinar los IDs de las tuplas a actualizar
    $idMensual = ($cardId - 1) * 2 + 1; // ID de la tupla mensual (1, 3, 5)
    $idAnual = $idMensual + 1; // ID de la tupla anual (2, 4, 6)

    // Preparar la consulta SQL para actualizar ambas tuplas con la misma descripción y categoría
    $sql = "UPDATE SUSCRIPCION 
            SET categoria_sus = :categoria, descripcion_sus = :descripcion 
            WHERE id_suscripcion IN (:idMensual, :idAnual)";

    $sqlUpdatePrecio = "UPDATE SUSCRIPCION 
                        SET precio_sus = CASE
                            WHEN id_suscripcion = :idMensual THEN :precioMensual
                            WHEN id_suscripcion = :idAnual THEN :precioAnual
                        END
                        WHERE id_suscripcion IN (:idMensual, :idAnual)";

    try {
        // Actualizar la categoría y descripción para ambas tuplas
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':categoria', $categoria);
        $stmt->bindParam(':descripcion', $descripcion);
        $stmt->bindParam(':idMensual', $idMensual);
        $stmt->bindParam(':idAnual', $idAnual);
        $stmt->execute();

        // Actualizar los precios para las tuplas mensual y anual
        $stmt = $conn->prepare($sqlUpdatePrecio);
        $stmt->bindParam(':precioMensual', $precioMensual);
        $stmt->bindParam(':precioAnual', $precioAnual);
        $stmt->bindParam(':idMensual', $idMensual);
        $stmt->bindParam(':idAnual', $idAnual);
        $stmt->execute();
        
// Configuración de PayPal
$clientId = 'Adn7jJOtUQpG45ctKq98nPFbVApSwZzeyiFZ8P5xuISw8efH0gshGhz_E3kEkuHrK1_fwG1zScvUhiuU';  // Reemplazar con tu Client ID
$clientSecret = 'EGi4sR0rUmVQ73wHFbE4G4VzULGHw3LqxHFlJ3TZ-QHbVW4b1KmL0abk16OzENmRZHpinFnkPtXOA4Tb';  // Reemplazar con tu Client Secret

// Función para obtener el Access Token automáticamente
function obtenerAccessToken($clientId, $clientSecret) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api-m.sandbox.paypal.com/v1/oauth2/token"); // Cambia a 'api-m.paypal.com' para producción
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_USERPWD, "$clientId:$clientSecret");
    curl_setopt($ch, CURLOPT_POSTFIELDS, "grant_type=client_credentials");

    // Cabeceras
    $headers = [
        "Accept: application/json",
        "Accept-Language: en_US"
    ];
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    // Ejecutar cURL
    $response = curl_exec($ch);
    if ($response === false) {
        echo 'Error en cURL: ' . curl_error($ch);
        return null;
    } else {
        $responseArray = json_decode($response, true);
        curl_close($ch);
        // Verifica si se obtuvo el token correctamente
        if (isset($responseArray['access_token'])) {
            return $responseArray['access_token']; // Retorna el Access Token
        } else {
            echo 'No se pudo obtener el Access Token.';
            return null;
        }
    }
}

// Obtener el Access Token
$accessToken = obtenerAccessToken($clientId, $clientSecret);

// Asignar los IDs de los planes según el cardId
$planIdMensual = ''; // Reemplaza con el ID de tu plan mensual correspondiente al cardId
$planIdAnual = '';   // Reemplaza con el ID de tu plan anual correspondiente al cardId

if ($cardId == 1) {
    $planIdMensual = 'P-7R123779X6771773AM4K4CUA'; // ID del plan Estándar mensual 
    $planIdAnual = 'P-9A2528415C724623BM4K4DLI';    // ID del plan Estándar anual 
} elseif ($cardId == 2) {
    $planIdMensual = 'P-6N209355GC179425LM4K4D5I'; // ID del plan Avanzada mensual 
    $planIdAnual = 'P-1ET33000CM209935RM4K4EUY';   // ID del plan Avanzada anual 
} elseif ($cardId == 3) {
    $planIdMensual = 'P-8XP438378P971264GM4K4FCI'; // ID del plan Hardcore mensual 
    $planIdAnual = 'P-0R034475SG1035119M4K4FRY';   // ID del plan Hardcore anual 
}

// Formatear el precio en el formato correcto (con dos decimales)
$precioMensualFormatted = number_format((float)$precioMensual, 2, '.', '');
$precioAnualFormatted = number_format((float)$precioAnual, 2, '.', '');

// Crear un cliente de Guzzle
$client = new Client(['base_uri' => 'https://api-m.sandbox.paypal.com']);

// Actualizar el precio del plan mensual en PayPal
try {
    $responseMensual = $client->request('POST', "/v1/billing/plans/$planIdMensual/update-pricing-schemes", [
        'headers' => [
            'Authorization' => "Bearer $accessToken",
            'Content-Type' => 'application/json',
        ],
        'json' => [
            "pricing_schemes" => [
                [
                    "billing_cycle_sequence" => 1,
                    "pricing_scheme" => [
                        "fixed_price" => [
                            "value" => $precioMensualFormatted, // Usar el precio formateado
                            "currency_code" => "USD"
                        ]
                    ]
                ]
            ]
        ]
    ]);

    // Manejo de la respuesta mensual
    $responseCodeMensual = $responseMensual->getStatusCode();
    $responseBodyMensual = json_decode($responseMensual->getBody(), true);
    error_log('Código de respuesta mensual: ' . $responseCodeMensual);
    error_log('Respuesta de actualización del plan mensual: ' . print_r($responseBodyMensual, true));

} catch (RequestException $e) {
    error_log('Error al actualizar el plan mensual: ' . $e->getMessage());
}

// Actualizar el precio del plan anual en PayPal
try {
    $responseAnual = $client->request('POST', "/v1/billing/plans/$planIdAnual/update-pricing-schemes", [
        'headers' => [
            'Authorization' => "Bearer $accessToken",
            'Content-Type' => 'application/json',
        ],
        'json' => [
            "pricing_schemes" => [
                [
                    "billing_cycle_sequence" => 1,
                    "pricing_scheme" => [
                        "fixed_price" => [
                            "value" => $precioAnualFormatted, // Usar el precio formateado
                            "currency_code" => "USD"
                        ]
                    ]
                ]
            ]
        ]
    ]);

    // Manejo de la respuesta anual
    $responseCodeAnual = $responseAnual->getStatusCode();
    $responseBodyAnual = json_decode($responseAnual->getBody(), true);
    error_log('Código de respuesta anual: ' . $responseCodeAnual);
    error_log('Respuesta de actualización del plan anual: ' . print_r($responseBodyAnual, true));

} catch (RequestException $e) {
    error_log('Error al actualizar el plan anual: ' . $e->getMessage());
}

// Mensaje de éxito
echo json_encode(["success" => true, "message" => "Suscripción actualizada correctamente."]);
    } catch (PDOException $e) {
        // En caso de error, devolver el mensaje de error
        error_log("Error en la actualización de la suscripción: " . $e->getMessage());
        echo json_encode(["success" => false, "message" => "Error al actualizar la suscripción: " . $e->getMessage()]);
    }
}
?>
