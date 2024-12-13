// Función para obtener la información del carrito
function obtenerInfoCarrito() {
    fetch('Modelos/obtener_info_carrito.php')
        .then(response => response.json())
        .then(data => {
            console.log(data); // Verifica lo que se está recibiendo del servidor

            if (data.success) {
                // Mostrar productos en el carrito
                mostrarProductosCarrito(data.productos);

                // Obtener el precio total sin IVA y con IVA
                const precioSinIVA = parseFloat(data.precio_sin_iva);  // Aseguramos que sea un número
                const precioConIVA = parseFloat(data.precio_con_iva);  // Aseguramos que sea un número

                if (!isNaN(precioSinIVA) && !isNaN(precioConIVA)) {
                    // Actualizar los elementos en el HTML
                    document.getElementById('precio-sin-iva').textContent = precioSinIVA.toFixed(2);
                    document.getElementById('precio-con-iva').textContent = precioConIVA.toFixed(2);
                } else {
                    console.error('Error: precio no definido o no es un número válido');
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo obtener el precio total con IVA.'
                    });
                }
                
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message
                });
            }
        })
        .catch(error => console.error('Error al obtener información del carrito:', error));
}


// Función para mostrar los productos en el carrito
function mostrarProductosCarrito(productos) {
    const productosCarrito = document.getElementById('productos-carrito');
    productosCarrito.innerHTML = ''; // Limpiar los productos actuales

    productos.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('producto');

        productoDiv.innerHTML = `
            <p>${producto.nombre}</p>
            <p>$${producto.precio}</p>
            <input type="number" min="1" value="${producto.cantidad}" id="cantidad-${producto.id_producto}" onchange="actualizarCantidad(${producto.id_producto})">
            <button onclick="eliminarProducto(${producto.id_producto})">Eliminar</button>
        `;

        productosCarrito.appendChild(productoDiv);
    });
}


// Función para actualizar la cantidad de un producto en el carrito
function actualizarCantidad(id_producto) {
    const cantidad = document.getElementById(`cantidad-${id_producto}`).value;

    fetch('Modelos/actualizar_carrito.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_producto, cantidad })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                obtenerInfoCarrito(); // Actualizar la información del carrito
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message
                });
            }
        })
        .catch(error => console.error('Error al actualizar la cantidad:', error));
}


// Función para eliminar un producto del carrito
function eliminarProducto(id_producto) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Este producto será eliminado del carrito.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(result => {
        if (result.isConfirmed) {
            fetch('Modelos/eliminar_producto_carrito.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_producto })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Producto eliminado',
                            text: data.message
                        });
                        obtenerInfoCarrito(); // Actualizar el carrito
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.message
                        });
                    }
                })
                .catch(error => console.error('Error al eliminar el producto:', error));
        }
    });
}

// Función para cancelar el carrito si está vacío
function cancelarCarrito() {
    fetch('Modelos/estado_carrito_cancelado.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Carrito cancelado',
                    text: data.message
                });
                obtenerInfoCarrito(); // Actualizar el carrito
            }
        })
        .catch(error => console.error('Error al verificar el estado del carrito:', error));
}

// Inicializar el carrito cuando se carga la página
document.addEventListener('DOMContentLoaded', function () {
    // Primero verificamos el estado del carrito y actualizamos si es necesario
    cancelarCarrito(); // Verifica y cancela el carrito si está vacío

    // Luego obtenemos la información del carrito
    obtenerInfoCarrito();
});


// Función para cargar el botón de PayPal
function cargarPaypal(precioConIVA) {
    // Renderizar el botón de PayPal
    paypal.Buttons({
        createOrder: function (data, actions) {
            // Configurar la orden de PayPal con el precio con IVA
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        currency_code: "USD",
                        value: precioConIVA.toFixed(2) // Asegurar el formato "XX.XX"
                    }
                }]
            });
        },
        onApprove: function (data, actions) {
            // Capturar la transacción una vez aprobada
            return actions.order.capture().then(function (details) {
                // Mostrar mensaje de éxito
                Swal.fire({
                    icon: 'success',
                    title: 'Pago completado',
                    text: `Gracias, ${details.payer.name.given_name}. Tu transacción fue exitosa.`
                });

                console.log('Detalles de la transacción:', details);

                // Llamar al archivo PHP para completar el carrito
                fetch('Modelos/estado_carrito_completado.php')
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Carrito completado',
                                text: data.message
                            });
                            // Aquí puedes redirigir o actualizar la interfaz, si es necesario
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error al completar el carrito',
                                text: data.message
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error al completar el carrito:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error interno',
                            text: 'Hubo un problema al procesar el carrito. Por favor, inténtalo nuevamente.'
                        });
                    });
            });
        },
        onError: function (err) {
            // Manejar errores durante el pago
            console.error('Error en el pago:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error en el pago',
                text: 'Ocurrió un problema al procesar el pago. Por favor, inténtalo de nuevo.'
            });
        }
    }).render('#paypal-button-container'); // Renderizar en el contenedor con este ID
}

// Inicializar PayPal con el precio con IVA cuando el carrito se actualice
function inicializarPaypal() {
    fetch('Modelos/obtener_info_carrito.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const precioConIVA = parseFloat(data.precio_con_iva); // Obtener el precio con IVA
                if (!isNaN(precioConIVA)) {
                    // Llamar a la función para cargar PayPal con el precio correcto
                    cargarPaypal(precioConIVA);
                } else {
                    console.error('Error: precio con IVA no es un número válido');
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo obtener el precio total con IVA.'
                    });
                }
            } else {
                console.error('Error al obtener la información del carrito:', data.message);
            }
        })
        .catch(error => console.error('Error al inicializar PayPal:', error));
}

// Inicializar PayPal cuando la página esté lista
document.addEventListener('DOMContentLoaded', function () {
    // Asegurarse de que PayPal se cargue después de obtener la información del carrito
    inicializarPaypal();
});
