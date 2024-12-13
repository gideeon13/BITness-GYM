$(document).ready(function () {
    $.ajax({
        url: 'landingM.php',  // Asegúrate que esta ruta sea correcta
        method: 'GET',
        dataType: 'json',
        success: function (suscripciones) {
            if (suscripciones.length === 6) {
                // Llenar las cartas con los datos obtenidos
                actualizarCartas(suscripciones);
            } else {
                console.error('Datos insuficientes o incorrectos:', suscripciones);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error al cargar las suscripciones:', textStatus, errorThrown);
        }
    });

    function actualizarCartas(suscripciones) {
        // Carta 1: ids 1 y 2
        $('#categoria1').text(suscripciones[0].categoria_sus);
        $('#precioMensual1').text(suscripciones[0].precio_sus);
        $('#descripcion1').text(suscripciones[0].descripcion_sus);
        $('#precioAnual1').text(suscripciones[1].precio_sus);

        // Carta 2: ids 3 y 4
        $('#categoria2').text(suscripciones[2].categoria_sus);
        $('#precioMensual2').text(suscripciones[2].precio_sus);
        $('#descripcion2').text(suscripciones[2].descripcion_sus);
        $('#precioAnual2').text(suscripciones[3].precio_sus);

        // Carta 3: ids 5 y 6
        $('#categoria3').text(suscripciones[4].categoria_sus);
        $('#precioMensual3').text(suscripciones[4].precio_sus);
        $('#descripcion3').text(suscripciones[4].descripcion_sus);
        $('#precioAnual3').text(suscripciones[5].precio_sus);
    }
});

async function cargarProductos() {
    try {
        // Agregar estilos dinámicamente
        const estilo = document.createElement('style');
        estilo.textContent = `
            /* Estructura general */
            .grid-item {
                text-align: center;
                margin: 10px;
                transition: box-shadow 0.3s ease;
            }

            .grid-item:hover {
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }

            .product-link {
                text-decoration: none;
                color: inherit;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            /* Estilo del nombre */
            .product-name {
                font-size: 16px;
                font-weight: bold;
                margin: 5px 0;
            }

            /* Estilo del precio */
            .product-price {
                font-size: 14px;
                color: #27ae60; /* Verde para resaltar el precio */
                margin: 5px 0;
            }

            /* Imagen de productos */
            .grid-item img {
                border-radius: 5px;
                transition: transform 0.3s ease;
            }

            .grid-item:hover img {
                transform: scale(1.1); /* Aumentar un poco el tamaño de la imagen */
            }
        `;
        document.head.appendChild(estilo);

        // Fetch productos
        const response = await fetch('../Productos/productos.php');
        const data = await response.json();

        if (data.error) {
            document.querySelector('#product-grid .grid-container').innerHTML = `<p>${data.error}</p>`;
            return;
        }

        const gridContainer = document.querySelector('#product-grid .grid-container');
        gridContainer.innerHTML = ''; // Limpiar el contenido previo

        data.productos.forEach(producto => {
            const item = document.createElement('div');
            item.classList.add('grid-item');

            // Crear enlace que lleva a ProductosV.html con el id del producto
            const link = document.createElement('a');
            link.href = `../Productos/ProductosV.html?id=${producto.id_producto}`;
            link.classList.add('product-link');

            // Construir la URL absoluta de la imagen
            const imageUrl = `../../${producto.imagen_url.replace('../../../../', '')}`;

            // Agregar imagen del producto
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = producto.nombre;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100px'; // Ajusta este valor según la altura deseada
            img.style.objectFit = 'cover'; // Asegura que la imagen se ajuste al cuadro sin distorsión

            // Manejador de error de imagen para cargar imagen predeterminada en caso de error
            img.onerror = () => {
                img.src = '../../assets/imgProducts/predeterminada.jpg';
            };

            // Agregar nombre del producto
            const name = document.createElement('p');
            name.textContent = producto.nombre;
            name.classList.add('product-name');

            // Agregar precio del producto (convalidación y manejo de errores)
            const price = document.createElement('p');
            const precioNumerico = parseFloat(producto.precio); // Convertir a número
            if (!isNaN(precioNumerico)) {
                price.textContent = `$${precioNumerico.toFixed(2)}`; // Formatea el precio
            } else {
                price.textContent = 'Precio no disponible';
            }
            price.classList.add('product-price');

            // Armar el producto
            link.appendChild(img);
            link.appendChild(name);
            link.appendChild(price);
            item.appendChild(link);

            gridContainer.appendChild(item);
        });
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
}

// Llamar a la función para cargar los productos cuando se cargue la página
document.addEventListener('DOMContentLoaded', cargarProductos);
