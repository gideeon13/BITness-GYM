$(document).ready(function() {
    // Inicializar DataTable con opciones personalizadas en español
    var table = $('#tablaContable').DataTable({
        paging: true,  // Activar la paginación
        searching: true,  // Activar la búsqueda
        ordering: true,  // Activar la ordenación de columnas
        info: true,  // Muestra información de la tabla
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

    // Función para cargar las filas desde la base de datos
    function cargarContables() {
        $.ajax({
            url: '../Modelos/contableTabla.php', // Archivo PHP que procesa la solicitud GET
            method: 'GET',
            success: function(response) {
                if (response.contables) {
                    // Limpiar la tabla antes de llenarla
                    table.clear();

                    // Recorrer los contables y agregarlos a la tabla
                    response.contables.forEach(function(contable) {
                        const row = [
                            contable.id_usuario, // ID
                            contable.departamento, // Departamento
                            `<button class="btn btn-warning" onclick="editarContable(${contable.id_contable})">Editar</button>
                             <button class="btn btn-danger" onclick="eliminarContable(${contable.id_usuario})">Eliminar</button>` // Acciones
                        ];
                        // Añadir la fila a la tabla
                        table.row.add(row).draw();
                    });
                } else {
                    Swal.fire('Error', 'No se encontraron contables.', 'error');
                }
            },
            error: function() {
                Swal.fire('Error', 'Error al cargar los contables.', 'error');
            }
        });
    }

    // Llamada inicial para cargar los contables cuando se carga la página
    cargarContables();

    // Función para editar un contable
    window.editarContable = function(id) {
        $.ajax({
            url: '../Modelos/contableTabla.php',
            method: 'GET',
            data: { id: id },
            success: function(response) {
                if (response.contables && response.contables.length > 0) {
                    const contable = response.contables[0];
                    // Rellenar el formulario de edición con los datos obtenidos
                    $('#editContableId').val(contable.id_usuario);  // Aquí se asigna el ID al campo
                    $('#editContableDepartamento').val(contable.departamento);  // Asignar el departamento
                    $('#editContableModal').modal('show');  // Mostrar el modal
                }
            }
        });
    };
    

    // Manejo del evento de submit del formulario de edición
    $('#editContableForm').submit(function(event) {
        event.preventDefault();

        // Verificar si el campo departamento tiene valor
        if ($('#editContableDepartamento').val() === '') {
            Swal.fire('Error', 'El campo Departamento no puede estar vacío.', 'error');
            return;
        }

        const contableData = {
            id_usuario: $('#editContableId').val(),
            departamento: $('#editContableDepartamento').val()
        };

        $.ajax({
            url: '../Modelos/contableTabla.php',
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(contableData),
            success: function(response) {
                if (response.success) {
                    $('#editContableModal').modal('hide');
                    cargarContables(); // Recargar la tabla para ver los cambios
                    Swal.fire('Éxito', 'Contable actualizado correctamente.', 'success');
                } else {
                    Swal.fire('Error', 'Hubo un problema al actualizar el contable.', 'error');
                }
            },
            error: function() {
                Swal.fire('Error', 'Hubo un problema en la conexión con el servidor.', 'error');
            }
        });
    });

    // Función para eliminar un contable
    window.eliminarContable = function(id) {
        console.log(id); // Verificar que el ID se pasa correctamente
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '../Modelos/contableTabla.php',
                    method: 'DELETE',
                    contentType: 'application/json',
                    data: JSON.stringify({ id: id }),  // Asegúrate de que el campo es 'id'
                    success: function(response) {
                        if (response.success) {
                            cargarContables(); // Recargar la tabla después de eliminar
                            Swal.fire('Eliminado', 'El contable ha sido eliminado.', 'success');
                        } else {
                            Swal.fire('Error', response.message, 'error');
                        }
                    },
                    error: function() {
                        Swal.fire('Error', 'Hubo un error al eliminar el contable.', 'error');
                    }
                });
            }
        });
    };    

});
