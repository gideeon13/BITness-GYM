$(document).ready(function() {
    // Inicializar DataTable con opciones personalizadas en español
    var table = $('#tablaCliente').DataTable({
        paging: true,  // Activar la paginación
        searching: true,  // Activar la búsqueda
        ordering: true,  // Activar la ordenación de columnas
        info: true,  // Muestra información de la tabla (ej: "Mostrando 1 a 10 de 100 registros")
        language: { 
            "sProcessing": "Procesando...",
            "sLengthMenu": "Mostrar _MENU_ registros por página",
            "sZeroRecords": "No se encontraron resultados",
            "sEmptyTable": "No hay datos disponibles en esta tabla",
            "sInfo": "Mostrando _START_ a _END_ de _TOTAL_ registros",
            "sInfoEmpty": "Mostrando 0 a 0 de 0 registros",
            "sInfoFiltered": "(filtrado de _MAX_ registros en total)",
            "sInfoPostFix": "",
            "sSearch": "Buscar:",
            "sUrl": "",
            "sInfoThousands": ",",
            "sLoadingRecords": "Cargando...",
            "oPaginate": {
                "sFirst": "Primero",
                "sPrevious": "Anterior",
                "sNext": "Siguiente",
                "sLast": "Último"
            },
            "oAria": {
                "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
                "sSortDescending": ": Activar para ordenar la columna de manera descendente"
            }
        },
        columnDefs: [
            { orderable: false, targets: 3 } // Deshabilitar la ordenación en la columna de acciones
        ]
    });

    // Función para obtener los clientes y llenar la tabla
    function cargarClientes() {
        $.ajax({
            url: '../Modelos/clienteTabla.php', // Archivo PHP que procesa la solicitud GET
            method: 'GET',
            success: function(response) {
                if (response.clientes) {
                    // Limpiar la tabla antes de llenarla (sin borrar la configuración de DataTable)
                    table.clear();

                    // Recorrer los clientes y agregarlos a la tabla
                    response.clientes.forEach(function(cliente) {
                        const row = [
                            cliente.id_usuario,
                            cliente.estado_sus,
                            cliente.sus_preferida,
                            cliente.concurrencia,
                            `<button class="btn btn-warning" onclick="editarCliente(${cliente.id_usuario})">Editar</button>
                             <button class="btn btn-danger" onclick="eliminarCliente(${cliente.id_usuario})">Eliminar</button>` // Acciones
                        ];
                        // Añadir la fila a la tabla
                        table.row.add(row).draw();
                    });
                } else {
                    Swal.fire('Error', 'No se encontraron clientes.', 'error');
                }
            },
            error: function() {
                Swal.fire('Error', 'Error al cargar los clientes.', 'error');
            }
        });
    }

    // Llamada inicial para cargar los clientes cuando se carga la página
    cargarClientes();

    // Función para editar un cliente
    window.editarCliente = function(id) {
        $.ajax({
            url: '../Modelos/clienteTabla.php',
            method: 'GET',
            data: { id: id },
            success: function(response) {
                if (response.clientes && response.clientes.length > 0) {
                    const cliente = response.clientes[0];
                    // Rellenar el formulario de edición con los datos obtenidos
                    $('#editClienteId').val(cliente.id_usuario);
                    $('#editClienteEstado').val(cliente.estado_sus);  
                    $('#editClienteSuscripcion').val(cliente.sus_preferida);
                    $('#editClienteConcurrencia').val(cliente.concurrencia);
                    $('#editClienteModal').modal('show');
                }
            }
        });
    };

    // Manejo del evento de submit del formulario de edición
    $('#editClienteForm').submit(function(event) {
        event.preventDefault();

        // Verificar si los campos están vacíos
        if ($('#editClienteEstado').val() === '' || $('#editClienteSuscripcion').val() === '' || $('#editClienteConcurrencia').val() === '') {
            Swal.fire('Error', 'Todos los campos deben estar llenos.', 'error');
            return;
        }

        const clienteData = {
            id_usuario: $('#editClienteId').val(),
            estado_sus: $('#editClienteEstado').val(),
            sus_preferida: $('#editClienteSuscripcion').val(),
            concurrencia: $('#editClienteConcurrencia').val()
        };

        $.ajax({
            url: '../Modelos/clienteTabla.php',
            method: 'PUT',
            contentType: 'application/json', // Enviar como JSON
            data: JSON.stringify(clienteData), // Enviar los datos como JSON
            success: function(response) {
                if (response.success) {
                    $('#editClienteModal').modal('hide');
                    cargarClientes(); // Recargar la tabla para ver los cambios
                    Swal.fire('Éxito', response.message, 'success');
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            },
            error: function() {
                Swal.fire('Error', 'Hubo un error al actualizar el cliente.', 'error');
            }
        });
    });

    // Función para eliminar un cliente
    window.eliminarCliente = function(id) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡Esta acción no puede deshacerse!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '¡Sí, eliminar!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '../Modelos/clienteTabla.php',
                    method: 'DELETE',
                    contentType: 'application/json', // Enviar como JSON
                    data: JSON.stringify({ id: id }), // Enviar los datos como JSON
                    success: function(response) {
                        if (response.success) {
                            cargarClientes(); // Recargar la tabla después de eliminar
                            Swal.fire('Eliminado', response.message, 'success');
                        } else {
                            Swal.fire('Error', response.message, 'error');
                        }
                    },
                    error: function() {
                        Swal.fire('Error', 'Hubo un error al eliminar el cliente.', 'error');
                    }
                });
            }
        });
    };

});
