let productos = [];
let sucursales = [];

// Espera a que el documento esté listo
$(document).ready(function() {
    fetchProducts(); // Cargar productos primero
    fetchSucursales(); // Cargar sucursales al iniciar
});

// Inicializa el DataTable para mostrar productos
function initializeDataTable() {
    if ($.fn.DataTable.isDataTable('#productTable')) {
        $('#productTable').DataTable().clear().destroy();
    }

    $('#productTable').DataTable({
        "data": productos,
        "columns": [
            { "data": "id_producto" },
            { "data": "nombre" },
            { "data": "precio" },
            { "data": "descripcion" },
            { "data": "stock" },
            { "data": "id_sucursal" },
            {
                "data": "imagen_url",
                "render": function(data) {
                    return `<img src="${data}" alt="Imagen del producto" style="width: 80px; height: 80px;">`;
                }
            },
            {
                "data": null,
                "render": function(data, type, row) {
                    return `
                        <button class="btn btn-warning btn-sm" onclick="openEditProductModal(${row.id_producto})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="confirmDeleteProduct(${row.id_producto})">Eliminar</button>
                    `;
                }
            }
        ],
        "paging": true,
        "searching": true,
        "pageLength": 10,
        "language": {
            "url": "https://cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json"
        },
        "order": [],
        "responsive": true,
        "autoWidth": false
    });
}

// Obtener productos
async function fetchProducts() {
    try {
        const response = await fetch('../Modelos/crud_producto.php', {
            method: 'GET',
        });
        const data = await response.json();
        if (data.success) {
            productos = data.productos;
            if (productos.length > 0) {
                initializeDataTable();
            } else {
                console.warn('No hay productos para mostrar.');
            }
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Obtener sucursales para el menú desplegable
async function fetchSucursales() {
    try {
        const response = await fetch('../Modelos/crud_sucursal.php', {
            method: 'GET',
        });
        const data = await response.json();
        if (data.success) {
            sucursales = data.sucursales;
            populateSucursalSelect(); // Llenar el menú desplegable
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error fetching sucursales:', error);
    }
}

// Llenar el menú desplegable de sucursales
function populateSucursalSelect() {
    const selectElements = [document.getElementById("idSucursalProducto"), document.getElementById("editIdSucursalProducto")];
    selectElements.forEach(selectElement => {
        selectElement.innerHTML = `<option value="">Seleccione una sucursal</option>`;
        sucursales.forEach(sucursal => {
            const option = document.createElement("option");
            option.value = sucursal.id_sucursal;
            option.textContent = sucursal.nombre;
            selectElement.appendChild(option);
        });
    });
}

// Agregar producto
document.getElementById("productForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append("id_sucursal", document.getElementById("idSucursalProducto").value);
    formData.append("nombre", document.getElementById("nombreProducto").value);
    formData.append("precio", document.getElementById("precioProducto").value);
    formData.append("descripcion", document.getElementById("descripcionProducto").value);
    formData.append("stock", document.getElementById("stockProducto").value);
    
    const imagenInput = document.getElementById("imagenProducto");
    if (imagenInput.files.length > 0) {
        formData.append("imagen", imagenInput.files[0]);
    }

    try {
        const response = await fetch('../Modelos/crud_producto.php', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        if (data.success) {
            fetchProducts();
            Swal.fire('Producto agregado', 'El producto ha sido agregado exitosamente', 'success');
            document.getElementById("productForm").reset();
            $('#addProductModal').modal('hide');
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error adding product:', error);
    }
});

// Abre el modal para editar un producto
function openEditProductModal(id) {
    const product = productos.find(p => p.id_producto === id);
    
    if (product) {
        // Llenar el menú desplegable de sucursales antes de mostrar el modal
        populateSucursalSelect();  // Ensure the select is populated
        document.getElementById("editIdSucursalProducto").value = product.id_sucursal;
        document.getElementById("editNombreProducto").value = product.nombre;
        document.getElementById("editPrecioProducto").value = product.precio;
        document.getElementById("editDescripcionProducto").value = product.descripcion;
        document.getElementById("editStockProducto").value = product.stock;
        document.getElementById("editImagenProducto").value = ""; // Limpiar el campo de imagen

        // Mostrar el modal
        $('#editProductModal').modal('show');
        // Almacenar el ID del producto en un atributo del modal para el envío posterior
        $('#editProductModal').data('id', id);
    }
}

// Enviar datos del producto (con imagen) por PUT
document.getElementById("editProductForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    // Obtener el ID del producto del modal y construir el objeto JSON
    const id_producto = $('#editProductModal').data('id'); 
    const updatedProduct = {
        id_producto: id_producto,
        id_sucursal: parseInt(document.getElementById("editIdSucursalProducto").value, 10),
        nombre: document.getElementById("editNombreProducto").value,
        precio: parseFloat(document.getElementById("editPrecioProducto").value).toFixed(2), // Formato de 2 decimales
        descripcion: document.getElementById("editDescripcionProducto").value,
        stock: parseInt(document.getElementById("editStockProducto").value, 10)
    };

    console.log("Datos del producto a enviar (PUT):", updatedProduct); // Agregado para verificar datos

    try {
        // Enviar los datos del producto (sin la imagen) usando PUT
        const response = await fetch('../Modelos/crud_producto_1.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProduct)
        });

        const data = await response.json();
        console.log("Respuesta del servidor al actualizar producto:", data); // Agregado para verificar respuesta

        if (data.success) {
            // Si la respuesta es exitosa, proceder con la imagen
            await updateProductImage(id_producto);
        } else {
            Swal.fire('Error', data.message, 'error');
        }
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        Swal.fire('Error', 'No se pudo actualizar el producto', 'error');
    }
});


// Función para actualizar la imagen del producto
async function updateProductImage(id_producto) {
    const formData = new FormData();
    const imageFile = document.getElementById("editImagenProducto").files[0];
    
    if (imageFile) {
        formData.append("id_producto", id_producto);
        formData.append("imagen", imageFile);

        console.log("Datos de la imagen a enviar (POST):", { id_producto, imagen: imageFile }); // Agregado para verificar datos

        try {
            const response = await fetch('../Modelos/crud_producto_1.php', {
                method: 'POST', // Cambiar a PUT si decides usar el mismo endpoint
                body: formData // Se usa FormData para enviar archivos
            });
            
            const data = await response.json();
            console.log("Respuesta del servidor al actualizar imagen:", data); // Agregado para verificar respuesta

            if (data.success) {
                fetchProducts();
                Swal.fire('Producto actualizado', 'El producto ha sido actualizado exitosamente', 'success');
                $('#editProductModal').modal('hide');
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        } catch (error) {
            console.error('Error al actualizar la imagen del producto:', error);
            Swal.fire('Error', 'No se pudo actualizar la imagen del producto', 'error');
        }
    } else {
        // Si no hay imagen nueva, cerrar el modal después de actualizar los demás datos
        fetchProducts();
        Swal.fire('Producto actualizado', 'El producto ha sido actualizado exitosamente', 'success');
        $('#editProductModal').modal('hide');
    }
}


// Confirmar eliminación del producto
function confirmDeleteProduct(productId) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch('../Modelos/crud_producto.php', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_producto: productId }),
                });
                const data = await response.json();
                if (data.success) {
                    fetchProducts();
                    Swal.fire('Producto eliminado', 'El producto ha sido eliminado exitosamente', 'success');
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    });
}
