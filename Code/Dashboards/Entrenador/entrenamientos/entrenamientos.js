$(document).ready(function() {
    cargarEntrenamientos();

    const modalEntrenamiento = $('#modalEntrenamiento');
    const modalSelectorEjercicios = $('#modalSelectorEjercicios');
    const modalDetalleEjercicio = $('#modalDetalleEjercicio');

    // Botones de cierre
    $('.close-btn').click(function() {
        modalEntrenamiento.hide();
        modalSelectorEjercicios.hide();
        modalDetalleEjercicio.hide();
    });

    // Botón de agregar entrenamiento
    $('#btnAgregarEntrenamiento').click(function() {
        modalEntrenamiento.show();
        $('#nombreEntrenamiento').val('');
        $('#listaEjercicios').empty();
    });

    // Botón de agregar ejercicio
    $('#btnAgregarEjercicio').click(function() {
        cargarEjercicios();
        modalSelectorEjercicios.show();
    });

    // Búsqueda y filtro
    const busquedaEjercicio = $('#busquedaEjercicio');
    const filtroMusculos = $('#filtroMusculos');

    busquedaEjercicio.on('input', filtrarEjercicios);
    filtroMusculos.on('change', filtrarEjercicios);

    // Botón de confirmar entrenamiento
    $('#btnConfirmarEntrenamiento').click(guardarEntrenamiento);
});

function cargarEntrenamientos() {
    $.ajax({
        url: 'entrenamientos/entrenamientos.php',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            const listaEntrenamientos = $('#listaEntrenamientos');
            listaEntrenamientos.empty();

            data.forEach(entrenamiento => {
                const tarjetaEntrenamiento = crearTarjetaEntrenamiento(entrenamiento);
                listaEntrenamientos.append(tarjetaEntrenamiento);
            });
        },
        error: function(error) {
            console.error('Error al cargar entrenamientos:', error);
        }
    });
}

function crearTarjetaEntrenamiento(entrenamiento) {
    const tarjeta = $('<div>').addClass('training-card').html(`
        <img src="${entrenamiento.ruta_img || '/assets/imgEjercicio/default.jpg'}" alt="${entrenamiento.nombre}">
        <h3>${entrenamiento.nombre}</h3>
    `);
    tarjeta.click(() => editarEntrenamiento(entrenamiento.id_actividad));
    return tarjeta;
}

function cargarEjercicios() {
    $.ajax({
        url: 'entrenamientos/entrenamientos.php',
        method: 'GET',
        data: { all_exercises: true },
        dataType: 'json',
        success: function(data) {
            const gridEjercicios = $('#gridEjercicios');
            gridEjercicios.empty();

            data.forEach(ejercicio => {
                const ejercicioItem = $('<div>').addClass('exercise-option').attr('data-musculos', ejercicio.musculos).html(`
                    <h4>${ejercicio.nombre}</h4>
                    <img src="${ejercicio.ruta_img}" alt="${ejercicio.nombre}">
                `);
                ejercicioItem.click(() => mostrarDetallesEjercicio(ejercicio));
                gridEjercicios.append(ejercicioItem);
            });
        },
        error: function(error) {
            console.error('Error al cargar los ejercicios:', error);
        }
    });
}

function mostrarDetallesEjercicio(ejercicio) {
    const modalDetalle = $('#modalDetalleEjercicio');
    $('#gifEjercicio').attr('src', ejercicio.ruta_gif);
    $('#imgMusculoEjercicio').attr('src', ejercicio.musculo_img);
    $('#nombreEjercicio').text(ejercicio.nombre);
    $('#equipamientoEjercicio').text(ejercicio.equipamiento);

    const etiquetasMusculos = $('#musculosEjercicio');
    etiquetasMusculos.empty();
    ejercicio.musculos.split(',').forEach(musculo => {
        etiquetasMusculos.append($('<span>').addClass('muscle-tag').text(musculo.trim()));
    });

    modalDetalle.show();
}

function guardarEntrenamiento() {
    const nombreEntrenamiento = $('#nombreEntrenamiento').val();
    const ejercicios = $('#listaEjercicios').children().map(function() {
        const item = $(this);
        return {
            id: item.data('ejercicioId'),
            peso: parseFloat(item.find('input[placeholder="Peso (kg)"]').val()),
            repeticiones: parseInt(item.find('input[placeholder="Repeticiones"]').val())
        };
    }).get();

    $.ajax({
        url: 'entrenamientos/entrenamientos.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ nombre: nombreEntrenamiento, ejercicios: ejercicios }),
        success: function(response) {
            if (response.success) {
                $('#modalEntrenamiento').hide();
                cargarEntrenamientos();
            } else {
                alert('Error al guardar el entrenamiento: ' + (response.error || 'Error desconocido'));
            }
        },
        error: function(error) {
            console.error('Error:', error);
        }
    });
}

function editarEntrenamiento(idActividad) {
    $.ajax({
        url: 'entrenamientos/entrenamientos.php',
        method: 'GET',
        data: { id: idActividad },
        dataType: 'json',
        success: function(entrenamiento) {
            $('#nombreEntrenamiento').val(entrenamiento.nombre);
            const listaEjercicios = $('#listaEjercicios');
            listaEjercicios.empty();

            entrenamiento.ejercicios.forEach(ejercicio => {
                const itemEjercicio = crearItemEjercicio(ejercicio);
                listaEjercicios.append(itemEjercicio);
            });

            $('#modalEntrenamiento').show();
        },
        error: function(error) {
            console.error('Error:', error);
        }
    });
}

function crearItemEjercicio(ejercicio) {
    const item = $('<div>').addClass('exercise-item').attr('data-ejercicio-id', ejercicio.id_ejercicio).html(`
        <img src="${ejercicio.ruta_img}" alt="${ejercicio.nombre}" class="exercise-image">
        <div class="exercise-details">
            <h4>${ejercicio.nombre}</h4>
            <div class="series-control">
                <input type="number" placeholder="Repeticiones" value="${ejercicio.repeticiones}" min="1">
                <input type="number" placeholder="Peso (kg)" value="${ejercicio.peso}" min="0" step="0.5">
            </div>
        </div>
        <button class="remove-exercise-btn">&times;</button>
    `);
    item.find('.remove-exercise-btn').click(() => item.remove());
    return item;
}

function filtrarEjercicios() {
    const busqueda = busquedaEjercicio.val().toLowerCase();
    const musculoSeleccionado = filtroMusculos.val().toLowerCase();

    $('.exercise-option').each(function() {
        const ejercicio = $(this);
        const nombre = ejercicio.find('h4').text().toLowerCase();
        const musculos = ejercicio.data('musculos').toLowerCase();

        const coincideNombre = nombre.includes(busqueda);
        const coincideMusculo = musculoSeleccionado === '' || musculos.includes(musculoSeleccionado);

        if (coincideNombre && coincideMusculo) {
            ejercicio.show();
        } else {
            ejercicio.hide();
        }
    });
}