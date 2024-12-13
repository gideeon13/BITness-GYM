$(document).ready(function () {
    // Cargar suscripciones al inicio
    $.ajax({
        url: '../Modelos/crud_suscripcion.php',
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

    // Actualizar cartas con los datos de la base de datos
    function actualizarCartas(suscripciones) {
        $('#categoria1').text(suscripciones[0].categoria_sus);
        $('#precioMensual1').text(suscripciones[0].precio_sus);
        $('#descripcion1').text(suscripciones[0].descripcion_sus);
        $('#precioAnual1').text(suscripciones[1].precio_sus);

        $('#categoria2').text(suscripciones[2].categoria_sus);
        $('#precioMensual2').text(suscripciones[2].precio_sus);
        $('#descripcion2').text(suscripciones[2].descripcion_sus);
        $('#precioAnual2').text(suscripciones[3].precio_sus);

        $('#categoria3').text(suscripciones[4].categoria_sus);
        $('#precioMensual3').text(suscripciones[4].precio_sus);
        $('#descripcion3').text(suscripciones[4].descripcion_sus);
        $('#precioAnual3').text(suscripciones[5].precio_sus);
    }


 // Guardar cambios
    $('.guardar').click(function () {
        var cardId = $(this).data('card'); // Obtener el ID de la carta
        var categoria = $('#categoria' + cardId).text();
        var precioMensual = $('#precioMensual' + cardId).text();
        var precioAnual = $('#precioAnual' + cardId).text(); // Asegúrate de obtener el precio anual
        var descripcion = $('#descripcion' + cardId).text();
  console.log(cardId, categoria, precioMensual, precioAnual, descripcion);

        // Enviar los datos al servidor
        $.ajax({
            url: '../Modelos/crud_suscripcion.php', // Primera URL
            method: 'PUT',
            data: {
                id: cardId,
                categoria: categoria,
                precioMensual: precioMensual,
                precioAnual: precioAnual,
                descripcion: descripcion
            },
            success: function (response) {
                // Manejar la respuesta del primer servidor
                Swal.fire({
                    icon: 'success',
                    title: 'Cambios guardados',
                    text: response.message
                });
    
                // Segunda solicitud AJAX
                $.ajax({
                    url: '../Modelos/crud_paypal.php', // Segunda URL
                    method: 'POST',
                    data: {
                        id: cardId,
                        categoria: categoria,
                        precioMensual: precioMensual,
                        precioAnual: precioAnual,
                        descripcion: descripcion
                    },
                    success: function (response) {
                        // Manejar la respuesta del segundo servidor
                        console.log('Respuesta de otro_script.php:', response.message);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error('Error al enviar a otro_script.php:', textStatus, errorThrown);
                    }
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('Error al guardar cambios en crud_suscripcion.php:', textStatus, errorThrown);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron guardar los cambios.'
                });
            }
        });
    });
});
