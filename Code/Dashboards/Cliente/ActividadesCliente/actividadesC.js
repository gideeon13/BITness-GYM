$(document).ready(function () {
    // Variable to store activities loaded from the database
    let activities = [];

    // Load activities on page load
    function cargarActividades() {
        $.ajax({
            url: 'get_actividad.php', // PHP file to fetch activities
            method: 'GET',
            dataType: 'json', // Ensures the response is parsed as JSON
            success: function (response) {
                if (response.status === 'success') {
                    response.activities.forEach(activity => {
                        agregarActividadAlHTML(activity);
                        activities.push(activity);
                    });
                } else {
                    console.error("Error al cargar actividades:", response.message);
                }
            },
            error: function (err) {
                console.error("Error en la solicitud AJAX al cargar actividades:", err);
            }
        });
    }

    cargarActividades(); // Call function on page load

    // Function to add activity to the HTML
    function agregarActividadAlHTML(activity) {
        const startHour = parseTime(activity.startTime);
        const endHour = parseTime(activity.endTime);
        const top = startHour * 50;
        const height = (endHour - startHour) * 50;

        const activityBlock = $(`
            <div class="activity-block" style="top: ${top}px; height: ${height}px; box-shadow: inset 0.2rem 0.2rem ${getTaskColor(activity.task)}, inset -0.2rem -0.2rem ${getTaskColor(activity.task)}; background-color: ${getTaskColor(activity.task)}61;"
                data-task="${activity.task}" data-start-time="${activity.startTime}" data-end-time="${activity.endTime}">
                ${activity.task} (${activity.startTime} - ${activity.endTime})
            </div>
        `);

        $(`.day-column[data-day="${activity.day}"]`).append(activityBlock);
    }

    // Convert time from "HH:MM" format to decimal hours for layout
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
