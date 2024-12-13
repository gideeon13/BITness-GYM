$(document).ready(function() {
    // Función para formatear la fecha a YYYY-MM-DD
    function formatDate(dateString) {
        const dateParts = dateString.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Los meses son indexados desde 0
        const day = parseInt(dateParts[2]);

        // Crea una fecha en UTC
        const date = new Date(Date.UTC(year, month, day));
        
        // Obtener el año, mes y día en UTC
        const formattedYear = date.getUTCFullYear();
        const formattedMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
        const formattedDay = String(date.getUTCDate()).padStart(2, '0');
        
        return `${formattedYear}-${formattedMonth}-${formattedDay}`;
    }

    // Cargar suscripciones desde la base de datos
    function cargarSuscripciones() {
        $.ajax({
            url: '../Modelos/crud_paga.php',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                if (data.success) {
                    $('#subList').DataTable().clear(); // Limpiar DataTable
                    data.suscripciones.forEach(function(suscripcion) {
                        $('#subList').DataTable().row.add([
                            suscripcion.id_suscripcion_FK,
                            suscripcion.id_usuario_FK,
                            suscripcion.fecha_inicio,
                            suscripcion.fecha_fin,
                            `<button class="btn btn-warning editar" data-id="${suscripcion.id_suscripcion_FK}" data-usuario="${suscripcion.id_usuario_FK}">Editar</button>
                            <button class="btn btn-danger eliminar" data-id="${suscripcion.id_suscripcion_FK}" data-usuario="${suscripcion.id_usuario_FK}">Eliminar</button>`
                        ]);
                    });
                    $('#subList').DataTable().draw(); // Redibujar DataTable
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message
                    });
                }
            },
            error: function(xhr, status, error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al cargar las suscripciones: ' + error
                });
            }
        });
    }

    // Inicializar DataTable
    $('#subList').DataTable();


    function cargarOpcionesSuscripciones() {
        $.ajax({
            url: '../Modelos/crud_paga.php',
            type: 'GET',
            data: { action: 'GET_SUBSCRIPTIONS' },
            dataType: 'json',
            success: function(data) {
                if (data.success) {
                    // Limpiar opciones existentes para el campo de edición
                    $('#editSubId').empty();
                    // Limpiar opciones existentes para el campo de creación
                    $('#createSubId').empty();
                    
                    // Cargar las opciones en ambos select
                    data.suscripciones.forEach(function(suscripcion) {
                        $('#editSubId').append(new Option(suscripcion.id_suscripcion, suscripcion.id_suscripcion));
                        $('#createSubId').append(new Option(suscripcion.id_suscripcion, suscripcion.id_suscripcion));
                    });
                } else {
                    console.error(data.message);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message
                    });
                }
            },
            error: function(xhr, status, error) {
                console.error('Error al cargar opciones de suscripción:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al cargar las opciones de suscripción: ' + error
                });
            }
        });
    }    
    

// Editar Suscripción
$(document).on('click', '.editar', function() {
    const id = $(this).data('id');
    const idUsuario = $(this).data('usuario');

    // Cargar opciones de suscripciones antes de mostrar el modal
    cargarOpcionesSuscripciones(); 

    $.ajax({
        url: '../Modelos/crud_paga.php',
        type: 'GET',
        data: { id: id },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                // Esperar a que se carguen las opciones antes de mostrar el modal
                $('#editSubId').val(id); // Selecciona la suscripción actual en el select
                $('#editIdUsuario').val(idUsuario); // Set ID usuario como readonly
                $('#editFechaInicio').val(response.suscripcion.fecha_inicio);
                $('#editFechaFin').val(response.suscripcion.fecha_fin);
                $('#editSubModal').modal('show');
            } else {
                Swal.fire('Error', response.message, 'error');
            }
        },
        error: function(xhr, status, error) {
            Swal.fire('Error', 'Ocurrió un error al obtener los detalles de la suscripción.', 'error');
        }
    });
});


    $('#saveChanges').click(function() {
        const id = parseInt($('#editSubId').val(), 10);
        const idUsuario = parseInt($('#editIdUsuario').val(), 10);
        const fechaInicio = formatDate($('#editFechaInicio').val());
        const fechaFin = formatDate($('#editFechaFin').val());
    
        // Comprobar si los valores son válidos
        if (isNaN(id) || isNaN(idUsuario) || !fechaInicio || !fechaFin) {
            Swal.fire('Error', 'Por favor, complete todos los campos.', 'error');
            return;
        }
    
        console.log('Datos a enviar al PHP:', {
            id: id,
            id_usuario: idUsuario,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin
        });
    
        $.ajax({
            url: '../Modelos/crud_paga.php',
            type: 'PUT',
            data: JSON.stringify({
                id: id,
                id_usuario: idUsuario,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin
            }),
            contentType: 'application/json',
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    Swal.fire('Actualizado', 'La suscripción ha sido actualizada.', 'success');
                    $('#editSubModal').modal('hide');
                    cargarSuscripciones();
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            },
            error: function(xhr, status, error) {
                Swal.fire('Error', 'Ocurrió un error al actualizar la suscripción.', 'error');
            }
        });
    });

    $(document).on('click', '.eliminar', function() {
        const id_suscripcion = $(this).data('id');
        const id_usuario_FK = $(this).data('usuario');
    
        // Mostrar un mensaje de confirmación
        Swal.fire({
            title: '¿Estás seguro que deseas eliminar?',
            text: "¡Esta acción no se puede deshacer!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'No, cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Realiza la llamada AJAX para eliminar si el usuario confirma
                $.ajax({
                    url: '../Modelos/crud_paga.php',
                    type: 'DELETE',
                    data: JSON.stringify({ id_suscripcion: id_suscripcion, id_usuario: id_usuario_FK }),
                    contentType: 'application/json',
                    dataType: 'json',
                    success: function(response) {
                        if (response.success) {
                            cargarSuscripciones(); // Recargar la lista después de eliminar
                            Swal.fire({
                                icon: 'success',
                                title: 'Eliminado',
                                text: 'La suscripción ha sido eliminada.'
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: response.message
                            });
                        }
                    },
                    error: function(xhr, status, error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Error al eliminar la suscripción: ' + error
                        });
                    }
                });
            }
        });
    });
    

// Cargar opciones de usuarios desde la tabla CLIENTE
function cargarOpcionesUsuarios() {
    $.ajax({
        url: '../Modelos/crud_paga.php',
        type: 'GET',
        data: { action: 'GET_USERS' },
        dataType: 'json',
        success: function(data) {
            if (data.success) {
                $('#createIdUsuario').empty(); // Limpiar opciones existentes
                data.usuarios.forEach(function(usuario) {
                    $('#createIdUsuario').append(new Option(usuario.id_usuario, usuario.id_usuario));
                });
            } else {
                console.error(data.message);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message
                });
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar opciones de usuarios:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cargar las opciones de usuarios: ' + error
            });
        }
    });
} 

// Crear Suscripción
$('#createSubscription').click(function() {
    const idSuscripcion = parseInt($('#createSubId').val(), 10); 
    const idUsuario = parseInt($('#createIdUsuario').val(), 10);
    const fechaInicio = formatDate($('#createFechaInicio').val());
    const fechaFin = formatDate($('#createFechaFin').val());

    console.log('Datos a enviar al PHP para creación:', {
        id_suscripcion: idSuscripcion,
        id_usuario: idUsuario,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
    });

    $.ajax({
        url: '../Modelos/crud_paga.php',
        type: 'POST',
        data: JSON.stringify({
            id_suscripcion: idSuscripcion,
            id_usuario: idUsuario,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin
        }),
        contentType: 'application/json',
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                Swal.fire('Creado', 'La suscripción ha sido creada.', 'success');
                $('#createSubModal').modal('hide');
                cargarSuscripciones(); // Cargar nuevamente las suscripciones
            } else {
                Swal.fire('Error', response.message, 'error');
            }
        },
        error: function(xhr, status, error) {
            Swal.fire('Error', 'Ocurrió un error al crear la suscripción.', 'error');
        }
    });
});

// Abrir modal de creación y cargar opciones
$('#createSubscriptionBtn').click(function() {
    cargarOpcionesUsuarios();
    cargarOpcionesSuscripciones(); // Cargar opciones antes de mostrar el modal
    $('#createFechaInicio').val(""); // Limpiar la fecha de inicio
    $('#createFechaFin').val(""); // Limpiar la fecha de fin
    $('#createSubModal').modal('show');
});


    // Llamar a la función para cargar suscripciones al cargar la página
    cargarSuscripciones();
});
