// Función para agregar un producto al carrito
function agregarProductoCarrito(id_producto) {
    // Se obtiene el ID del usuario de la sesión del servidor, por ejemplo, utilizando un AJAX o una variable PHP global.
    fetch('Modelos/agregar_producto.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_producto: id_producto })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Si la respuesta es exitosa, mostramos un mensaje con SweetAlert2
            Swal.fire({
                icon: 'success',
                title: 'Producto agregado al carrito',
                text: '¡El producto ha sido agregado exitosamente!',
                confirmButtonText: 'Aceptar'
            });
        } else {
            // Si hubo un error al agregar el producto, mostramos un mensaje con SweetAlert2
            Swal.fire({
                icon: 'error',
                title: 'Hubo un problema al agregar el producto',
                text: 'Intenta nuevamente.',
                confirmButtonText: 'Aceptar'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Si ocurre un error de red o algo inesperado
        Swal.fire({
            icon: 'error',
            title: 'Error al procesar la solicitud',
            text: 'Hubo un problema al procesar la solicitud. Intenta más tarde.',
            confirmButtonText: 'Aceptar'
        });
    });
}

// Función para cargar los productos desde el servidor
function cargarProductos() {
    fetch('Modelos/productos.php') // Ruta al archivo PHP para obtener productos
    .then(response => response.json())
    .then(data => {
        if (data.productos) {
            let productosContainer = document.getElementById('productos_listado');
            productosContainer.innerHTML = ''; // Limpiar el contenedor de productos antes de agregar nuevos

            // Iterar sobre los productos y agregarlos al contenedor
            data.productos.forEach(producto => {
                let productoHTML = `
                    <div class="producto-item">
                        <img src="${producto.imagen_url}" alt="${producto.nombre}" class="producto-imagen">
                        <h3>${producto.nombre}</h3>
                        <p>${producto.descripcion}</p>
                        <p>Precio: $${producto.precio}</p>
                        <p>Stock disponible: ${producto.stock}</p>
                        <button onclick="agregarProductoCarrito(${producto.id_producto})">Agregar al carrito</button>
                    </div>
                `;
                productosContainer.innerHTML += productoHTML;
            });
        } else {
            console.error('Error al cargar productos:', data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Muestra un mensaje de error con SweetAlert2 si no se pueden cargar los productos
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar los productos',
            text: 'Hubo un problema al cargar los productos. Intenta nuevamente.',
            confirmButtonText: 'Aceptar'
        });
    });
}

// Inicializar la carga de productos cuando la página esté lista
document.addEventListener('DOMContentLoaded', function() {
    cargarProductos(); // Llamar a la función para cargar los productos
});

function irAlCarrito() {
    // Cambiar a la página del carrito
    window.location.href = "Carrito.html"; // Asegúrate de que "carrito.html" sea la ruta correcta
}

// Función para cargar el botón de PayPal
function cargarPaypal() {
    // Cargar el botón de PayPal con la SDK
    paypal.Buttons({
        createOrder: function(data, actions) {
            // Crear la orden de pago usando el total del carrito (precio_total)
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: precio_total // Usa la variable precio_total que ya contiene el total
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            // Cuando el pago es aprobado
            return actions.order.capture().then(function(details) {
                // Notificar al usuario sobre el pago exitoso
                Swal.fire({
                    icon: 'success',
                    title: 'Pago exitoso',
                    text: `Gracias por tu compra, ${details.payer.name.given_name}!`
                });
                // Aquí podrías realizar otras acciones como actualizar el carrito en la base de datos
            });
        },
        onError: function(err) {
            // Si hay un error en el proceso de pago
            console.error('Error en el pago:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error de pago',
                text: 'Hubo un problema al procesar tu pago. Intenta nuevamente.'
            });
        }
    }).render('#paypal-button-container'); // Renderiza el botón en el contenedor
}

// Inicializar PayPal cuando la página esté lista
document.addEventListener('DOMContentLoaded', function() {
    cargarPaypal(); // Llamar a la función para cargar el botón de PayPal
});
