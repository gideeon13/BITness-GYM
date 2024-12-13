$(document).ready(function () {
    let selectedTask = null;
    let currentDayColumn = null;
    let activities = [];

    // Cargar actividades al inicio
    function cargarActividades() {
        $.ajax({
            url: '../Modelos/crud_actividad.php',
            method: 'GET',
            success: function (response) {
                if (response.status === 'success') {
                    response.activities.forEach(activity => {
                        agregarActividadAlHTML(activity);
                        activities.push(activity);
                    });
                } else {
                    Swal.fire("Error", "Error al cargar actividades: " + response.message, "error");
                }
            },
            error: function (err) {
                Swal.fire("Error", "Error en la solicitud AJAX al cargar actividades.", "error");
            }
        });
    }

    cargarActividades(); // Llamar a la función al cargar la página

    $('.task-btn').on('click', function () {
        selectedTask = $(this).data('task');
        $('#delete').removeClass('active').css('cursor', 'auto');
    });

    $('#delete').on('click', function () {
        selectedTask = null;
        $(this).toggleClass('active');
        $(this).css('cursor', $(this).hasClass('active') ? 'url("path-to-x-cursor.png"), auto' : 'auto');
    });

    $('.day-column').on('click', function () {
        if (selectedTask && !$('#delete').hasClass('active')) {
            currentDayColumn = $(this);
            $('#timeModal').css('display', 'flex');
        }
    });

    $(document).on('click', '.activity-block', function () {
        if ($('#delete').hasClass('active')) {
            const day = $(this).closest('.day-column').data('day');
            const startTime = $(this).data('startTime');
            const endTime = $(this).data('endTime');
            const task = $(this).data('task');

            activities = activities.filter(activity => 
                !(activity.day === day && activity.startTime === startTime && activity.endTime === endTime && activity.task === task)
            );

            $(this).remove();
        }
    });

    $('#saveTime').on('click', function () {
        const startTime = $('#startTime').val();
        const endTime = $('#endTime').val();

        if (startTime && endTime) {
            const activity = {
                task: selectedTask,
                day: currentDayColumn.data('day'),
                startTime: startTime,
                endTime: endTime
            };

            agregarActividadAlHTML(activity);
            activities.push(activity);

            $('#timeModal').hide();
            Swal.fire("Actividad guardada", "La actividad ha sido agregada exitosamente.", "success");
        } else {
            Swal.fire("Campos incompletos", "Por favor ingresa una hora de inicio y fin.", "warning");
        }
    });

    $('#closeModal').on('click', function () {
        $('#timeModal').hide();
    });

    $('#upload').on('click', function () {
        $.ajax({
            url: '../Modelos/crud_actividad.php',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(activities),
            success: function (response) {
                try {
                    const parsedResponse = typeof response === "string" ? JSON.parse(response) : response;
                    
                    if (parsedResponse.status === 'success') {
                        Swal.fire("Éxito", "Actividades subidas con éxito!", "success");
                    } else {
                        Swal.fire("Error", "Error al subir actividades: " + parsedResponse.message, "error");
                    }
                } catch (error) {
                    console.error("Error al parsear la respuesta:", error);
                    Swal.fire("Error", "Error en el formato de la respuesta del servidor.", "error");
                }
            },
            error: function (err) {
                console.error("Error en la solicitud AJAX:", err);
                Swal.fire("Error", "Error al subir actividades", "error");
            }
        });
    });

    function agregarActividadAlHTML(activity) {
        const startHour = parseTime(activity.startTime);
        const endHour = parseTime(activity.endTime);
        const top = startHour * 50;
        const height = (endHour - startHour) * 50;

        const activityBlock = $(`
            <div class="activity-block" style="top: ${top}px; height: ${height}px; background-color: ${getTaskColor(activity.task)};"
                data-task="${activity.task}" data-start-time="${activity.startTime}" data-end-time="${activity.endTime}">
                ${activity.task} (${activity.startTime} - ${activity.endTime})
            </div>
        `);

        $(`.day-column[data-day="${activity.day}"]`).append(activityBlock);
    }

    function parseTime(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours + minutes / 60;
    }


    // Define colors for tasks
    function getTaskColor(task) {
        switch (task) {
            case 'boxeo': return '#FF6F61';
            case 'gap': return '#FFD700';
            case 'calistenia': return '#7FFFD4';
            case 'kickboxing': return '#9370DB';
            case 'aerobicos': return '#4682B4';
            default: return '#FFFFFF';
        }
    }
});
