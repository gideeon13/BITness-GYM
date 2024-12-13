$(document).ready(function() {
    // Inicializar DataTable con opciones personalizadas en español
    var table = $('#tablaEntrenador').DataTable({
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
            "sSearch": "Buscar:",
            "oPaginate": {
                "sFirst": "Primero",
                "sPrevious": "Anterior",
                "sNext": "Siguiente",
                "sLast": "Último"
            }
        },
        columnDefs: [
            { orderable: false, targets: 3 } // Deshabilitar la ordenación en la columna de acciones
        ]
    });

    // Función para cargar los entrenadores
    function cargarEntrenadores() {
        $.ajax({
            url: '../Modelos/entrenadorTabla.php', // Archivo PHP que procesa la solicitud GET
            method: 'GET',
            success: function(response) {
                if (response.entrenadores) {
                    // Limpiar la tabla antes de llenarla (sin borrar la configuración de DataTable)
                    table.clear();

                    // Recorrer los entrenadores y agregarlos a la tabla
                    response.entrenadores.forEach(function(entrenador) {
                        const row = [
                            entrenador.id_usuario, // ID
                            entrenador.especialidades, // Nombre
                            entrenador.detalles, // Especialidad
                            entrenador.precio,
                            `<button class="btn btn-warning" onclick="editarEntrenador(${entrenador.id_usuario})">Editar</button>
                             <button class="btn btn-danger" onclick="eliminarEntrenador(${entrenador.id_usuario})">Eliminar</button>` // Acciones
                        ];
                        // Añadir la fila a la tabla
                        table.row.add(row).draw();
                    });
                } else {
                    Swal.fire('Error', 'No se encontraron entrenadores.', 'error');
                }
            },
            error: function() {
                Swal.fire('Error', 'Error al cargar los entrenadores.', 'error');
            }
        });
    }

    // Llamada inicial para cargar los entrenadores cuando se carga la página
    cargarEntrenadores();

    // Función para editar un entrenador
    window.editarEntrenador = function(id) {
        $.ajax({
            url: '../Modelos/entrenadorTabla.php',
            method: 'GET',
            data: { id: id },
            success: function(response) {
                if (response.entrenadores && response.entrenadores.length > 0) {
                    const entrenador = response.entrenadores[0];
                    // Rellenar el formulario de edición con los datos obtenidos
                    $('#editEntrenadorId').val(entrenador.id_usuario);
                    $('#editEspecialidad').val(entrenador.especialidades);
                    $('#editDetalles').val(entrenador.detalles);
                    $('#editPrecio').val(entrenador.precio);
                    $('#editEntrenadorModal').modal('show');
                }
            }
        });
    };

    // Manejo del evento de submit del formulario de edición
    $('#editEntrenadorForm').submit(function(event) {
        event.preventDefault();

        // Verificar que los campos no estén vacíos
        if ($('#editEspecialidad').val() === '' || $('#editDetalles').val() === '' || $('#editPrecio').val() === '') {
            Swal.fire('Error', 'Todos los campos deben ser completados.', 'error');
            return;
        }

        const entrenadorData = {
            id_usuario: $('#editEntrenadorId').val(),
            especialidad: $('#editEspecialidad').val(),
            detalles: $('#editDetalles').val(),
            precio: $('#editPrecio').val()
        };

        $.ajax({
            url: '../Modelos/entrenadorTabla.php',
            method: 'PUT',
            contentType: 'application/json', // Enviar como JSON
            data: JSON.stringify(entrenadorData), // Enviar los datos como JSON
            success: function(response) {
                if (response.success) {
                    $('#editEntrenadorModal').modal('hide');
                    cargarEntrenadores(); // Recargar la tabla para ver los cambios
                    Swal.fire('Éxito', 'Entrenador actualizado correctamente.', 'success');
                } else {
                    Swal.fire('Error', 'Hubo un problema al actualizar el entrenador.', 'error');
                }
            },
            error: function() {
                Swal.fire('Error', 'Hubo un problema en la conexión con el servidor.', 'error');
            }
        });
    });

    // Función para eliminar un entrenador
    window.eliminarEntrenador = function(id) {
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
                    url: '../Modelos/entrenadorTabla.php',
                    method: 'DELETE',
                    contentType: 'application/json', // Asegurarse de enviar como JSON
                    data: JSON.stringify({ id: id }), // Enviar el id como JSON
                    success: function(response) {
                        if (response.success) {
                            cargarEntrenadores(); // Recargar la tabla después de eliminar
                            Swal.fire('Eliminado', 'El entrenador ha sido eliminado.', 'success');
                        } else {
                            Swal.fire('Error', response.message, 'error');
                        }
                    },
                    error: function() {
                        Swal.fire('Error', 'Hubo un error al eliminar el entrenador.', 'error');
                    }
                });
            }
        });
    };
});
