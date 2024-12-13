$(document).ready(function () {
    let userSubscription = null;
    let userAgenda = null;

    function getUserInfo() {
        $.ajax({
            url: 'get_user_info.php',
            method: 'GET',
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    userSubscription = response.subscription;
                    userAgenda = response.agenda;
                    updateClassCards();
                } else {
                    console.error("Error al cargar información del usuario:", response.message);
                }
            },
            error: function (err) {
                console.error("Error en la solicitud AJAX al cargar información del usuario:", err);
            }
        });
    }

    function updateClassCards() {
        $('.class-card').each(function() {
            const className = $(this).data('class');
            const isEnrolled = userAgenda.some(activity => activity.task === className);
            $(this).find('p').text(isEnrolled ? 'Haz clic para desanotarte' : 'Haz clic para anotarte');
        });
    }

    $('.class-card').on('click', function() {
        const className = $(this).data('class');
        const isEnrolled = userAgenda.some(activity => activity.task === className);

        if (isEnrolled) {
            unenrollFromClass(className);
        } else {
            if (userAgenda.length < userSubscription.activity_limit) {
                enrollInClass(className);
            } else {
                showMessage("Has alcanzado el límite de clases para tu suscripción.");
            }
        }
    });

    function enrollInClass(className) {
        $.ajax({
            url: 'anotarse.php',
            method: 'POST',
            data: { action: 'enroll', class: className },
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    userAgenda.push({ task: className });
                    updateClassCards();
                    showMessage("Te has anotado exitosamente a la clase de " + className);
                } else {
                    showMessage("Error al anotarse: " + response.message);
                }
            },
            error: function (err) {
                console.error("Error en la solicitud AJAX al anotarse:", err);
                showMessage("Error al anotarse. Por favor, intenta de nuevo.");
            }
        });
    }

    function unenrollFromClass(className) {
        $.ajax({
            url: 'anotarse.php',
            method: 'POST',
            data: { action: 'unenroll', class: className },
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    userAgenda = userAgenda.filter(activity => activity.task !== className);
                    updateClassCards();
                    showMessage("Te has desanotado exitosamente de la clase de " + className);
                } else {
                    showMessage("Error al desanotarse: " + response.message);
                }
            },
            error: function (err) {
                console.error("Error en la solicitud AJAX al desanotarse:", err);
                showMessage("Error al desanotarse. Por favor, intenta de nuevo.");
            }
        });
    }

    function showMessage(message) {
        $('#modal-message').text(message);
        $('#message-modal').show();
    }

    $('#close-modal').on('click', function() {
        $('#message-modal').hide();
    });

    getUserInfo();
});