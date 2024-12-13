<?php
header('Content-Type: application/json');
require '../../../../config/conexion.php'; // Ensure the path is correct

try {
    // Query to fetch products
    $stmt = $conn->query("SELECT id_producto, nombre, precio, descripcion, stock, imagen_url FROM PRODUCTO");
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Base URL for images
    $baseUrl = '/assets/imgProducts/';

    // Adjust image URLs to absolute paths
    foreach ($productos as &$producto) {
        // Convert relative paths to absolute
        $producto['imagen_url'] = $baseUrl . basename($producto['imagen_url']);
    }

    // Check if products are fetched
    if ($productos) {
        echo json_encode(['productos' => $productos]);
    } else {
        echo json_encode(['error' => 'No products found']);
    }
} catch (Exception $e) {
    // Return a JSON error message
    echo json_encode(['error' => 'Error al cargar los productos: ' . $e->getMessage()]);
}
?>
