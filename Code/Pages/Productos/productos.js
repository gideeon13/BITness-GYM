let idCarrito = null; // id del carrito
let productosEnCarrito = []; // IDs de los productos en el carrito

// Intentamos obtener el carrito desde localStorage
const savedCart = localStorage.getItem('cart');
if (savedCart) {
    const parsedCart = JSON.parse(savedCart);
    idCarrito = parsedCart.idCarrito || null;
    productosEnCarrito = parsedCart.productosEnCarrito || [];
}

// Función para cargar los productos desde el servidor
function cargarProductos() {
    fetch("productos.php")
        .then(response => response.json())
        .then(data => {
            const productosDiv = document.getElementById("productos");
            productosDiv.innerHTML = ''; // Limpiar productos previos
            data.productos.forEach(producto => {
                const productDiv = document.createElement("div");
                productDiv.classList.add("producto-card");

                const imageUrl = `../../../assets/imgProducts/${producto.imagen_url.split('/').pop()}`;

                productDiv.innerHTML = `
                    <img src="${imageUrl}" alt="${producto.nombre}" class="producto-imagen" />
                    <h3>${producto.nombre}</h3>
                    <p>Precio: $${producto.precio}</p>
                    <p>Stock: ${producto.stock}</p>
                `;
                productosDiv.appendChild(productDiv);
            });
        })
        .catch(error => console.error('Error loading products:', error));
}

// Función para agregar un producto al carrito
function agregarProducto(idProducto, cantidad) {
    if (idCarrito === null) {
        console.log("Carrito no encontrado, creando nuevo...");
        // Primero crea el carrito y luego llama a agregar el producto
        crearCarrito().then(response => {
            if (response && response.id_carrito) {
                idCarrito = response.id_carrito;
                productosEnCarrito.push(idProducto);
                guardarCarritoEnLocalStorage();
                agregarAlCarrito(idProducto, cantidad);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al crear el carrito',
                    text: 'Hubo un problema al crear tu carrito. Intenta nuevamente.'
                });
            }
        });
    } else {
        // Si el carrito ya existe, agrega directamente el producto
        productosEnCarrito.push(idProducto);
        guardarCarritoEnLocalStorage();
        agregarAlCarrito(idProducto, cantidad);
    }
}

// Función para crear el carrito
function crearCarrito() {
    const idSucursal = 1;
    console.log(`Creando carrito para sucursal ${idSucursal}`);

    return fetch(`crear_carrito.php?id_sucursal=${idSucursal}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor al crear el carrito');
            }
            return response.json();
        })
        .then(data => {
            console.log('Carrito creado:', data);
            return data;
        })
        .catch(error => {
            console.error('Error al crear el carrito:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al crear el carrito',
                text: 'Hubo un problema al conectar con el servidor. Intenta más tarde.'
            });
        });
}

// Función para agregar el producto al carrito
function agregarAlCarrito(idProducto, cantidad) {
    fetch(`agregar_producto.php?id_carrito=${idCarrito}&id_producto=${idProducto}&cantidad=${cantidad}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.text();
        })
        .then(data => {
            console.log("Respuesta cruda del servidor:", data);
            try {
                const jsonData = JSON.parse(data);
                if (jsonData.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Producto agregado',
                        text: 'El producto se ha agregado correctamente al carrito.',
                        showConfirmButton: false,
                        timer: 2000
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: jsonData.message || 'Hubo un problema al agregar el producto al carrito. Intenta nuevamente.'
                    });
                }
            } catch (error) {
                console.error('Error al parsear JSON:', error);
            }
        })
        .catch(error => {
            console.error('Error al agregar al carrito:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar al servidor. Intenta más tarde.'
            });
        });
}

// Función para guardar el carrito en localStorage
function guardarCarritoEnLocalStorage() {
    // Eliminar el carrito anterior en el localStorage, si existe
    localStorage.removeItem('cart');

    // Crear el nuevo carrito con los datos actuales
    const cartData = {
        idCarrito: idCarrito,
        productosEnCarrito: productosEnCarrito
    };

    // Guardar el nuevo carrito en el localStorage
    localStorage.setItem('cart', JSON.stringify(cartData));
}
