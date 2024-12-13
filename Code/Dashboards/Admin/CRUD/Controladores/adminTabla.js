$(document).ready(function() {
    // Inicializar DataTable con opciones personalizadas en español
    var table = $('#tablaAdmin').DataTable({
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
            { orderable: false, targets: 2 } // Deshabilitar la ordenación en la columna de acciones
        ]
    });

    // Función para obtener los administradores y llenar la tabla
    function cargarAdministradores() {
        $.ajax({
            url: '../Modelos/adminTabla.php', // Archivo PHP que procesa la solicitud GET
            method: 'GET',
            success: function(response) {
                if (response.admins) {
                    // Limpiar la tabla antes de llenarla (sin borrar la configuración de DataTable)
                    table.clear();

                    // Recorrer los administradores y agregarlos a la tabla
                    response.admins.forEach(function(admin) {
                        const row = [
                            admin.id_usuario, // ID
                            admin.cargo, // Cargo
                            `<button class="btn btn-warning" onclick="editarAdmin(${admin.id_usuario})">Editar</button>
                             <button class="btn btn-danger" onclick="eliminarAdmin(${admin.id_usuario})">Eliminar</button>` // Acciones
                        ];
                        // Añadir la fila a la tabla
                        table.row.add(row).draw();
                    });
                } else {
                    Swal.fire('Error', 'No se encontraron administradores.', 'error');
                }
            },
            error: function() {
                Swal.fire('Error', 'Error al cargar los administradores.', 'error');
            }
        });
    }

    // Llamada inicial para cargar los administradores cuando se carga la página
    cargarAdministradores();

    // Función para editar un admin
    window.editarAdmin = function(id) {
        $.ajax({
            url: '../Modelos/adminTabla.php',
            method: 'GET',
            data: { id: id },
            success: function(response) {
                if (response.admins && response.admins.length > 0) {
                    const admin = response.admins[0];
                    // Rellenar el formulario de edición con los datos obtenidos
                    $('#editAdminId').val(admin.id_usuario);
                    $('#editAdminCargo').val(admin.cargo);  // Asegúrate de que el cargo se asigne correctamente
                    $('#editAdminModal').modal('show');
                }
            }
        });
    };

    // Manejo del evento de submit del formulario de edición
    $('#editAdminForm').submit(function(event) {
        event.preventDefault();

        // Verificar si el campo cargo tiene valor
        if ($('#editAdminCargo').val() === '') {
            Swal.fire('Error', 'El campo Cargo no puede estar vacío.', 'error');
            return;
        }

        const adminData = {
            id_usuario: $('#editAdminId').val(),
            cargo: $('#editAdminCargo').val()
        };

        $.ajax({
            url: '../Modelos/adminTabla.php',
            method: 'PUT',
            contentType: 'application/json', // Enviar como JSON
            data: JSON.stringify(adminData), // Enviar los datos como JSON
            success: function(response) {
                if (response.success) {
                    $('#editAdminModal').modal('hide');
                    cargarAdministradores(); // Recargar la tabla para ver los cambios
                    Swal.fire('Éxito', 'Administrador actualizado correctamente.', 'success');
                } else {
                    Swal.fire('Error', 'Hubo un problema al actualizar el administrador.', 'error');
                }
            },
            error: function() {
                Swal.fire('Error', 'Hubo un problema en la conexión con el servidor.', 'error');
            }
        });
    });

    // Función para eliminar un admin
    window.eliminarAdmin = function(id) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                // Enviar la solicitud DELETE con el id como JSON
                $.ajax({
                    url: '../Modelos/adminTabla.php',
                    method: 'DELETE',
                    contentType: 'application/json', // Asegurarse de enviar como JSON
                    data: JSON.stringify({ id: id }), // Enviar el id como JSON
                    success: function(response) {
                        if (response.success) {
                            cargarAdministradores(); // Recargar la tabla después de eliminar
                            Swal.fire('Eliminado', 'El administrador ha sido eliminado.', 'success');
                        } else {
                            Swal.fire('Error', response.message, 'error');
                        }
                    },
                    error: function() {
                        Swal.fire('Error', 'Hubo un error al eliminar el administrador.', 'error');
                    }
                });
            }
        });
    };

});
