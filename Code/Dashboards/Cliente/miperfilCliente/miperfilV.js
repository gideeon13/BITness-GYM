$(document).ready(function () {
    // Realizar solicitud GET al cargar la página
    fetch('miPerfil.php')
        .then(response => response.json())
        .then(data => {
            if (data.mostrarFormulario) {
                Swal.fire({
                    title: 'Complete su Perfil',
                    width: 600, // Ancho del modal reducido
                    padding: '1.5em', // Relleno reducido para compactar
                    html: `
                        <input type="number" id="altura" placeholder="Altura (cm)" class="swal2-input" style="height: 2.5em; font-size: 0.9em; width: 90%;">
                        <input type="number" id="peso" placeholder="Peso (kg)" class="swal2-input" style="height: 2.5em; font-size: 0.9em; width: 90%;">
                        <input type="number" id="edad" placeholder="Edad" class="swal2-input" style="height: 2.5em; font-size: 0.9em; width: 90%;">
                        <select id="genero" class="swal2-input" style="height: 2.5em; font-size: 0.9em; width: 90%;">
                            <option value="" disabled selected>Género</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                        </select>
                        <select id="nivel_act" class="swal2-input" style="height: 2.5em; font-size: 0.9em; width: 90%;">
                            <option value="" disabled selected>Nivel de actividad</option>
                            <option value="Sedentario">Sedentario</option>
                            <option value="Ligeramente Activo">Ligeramente Activo</option>
                            <option value="Moderadamente Activo">Moderadamente Activo</option>
                            <option value="Muy Activo">Muy Activo</option>
                            <option value="Atleta Profesional">Atleta Profesional</option>
                        </select>
                        <textarea id="descripcion" placeholder="Descripción" class="swal2-textarea" style="height: 3em; max-height: 4em; font-size: 0.9em; width: 90%; resize: none;"></textarea>
                        <input type="file" id="foto_perfil" class="swal2-input" style="height: 2.5em; font-size: 0.9em; width: 90%;">
                    `,
                    showCancelButton: false, // Deshabilitar el botón de cancelar
                    confirmButtonText: 'Guardar',
                    allowOutsideClick: false,  // No permitir cerrar haciendo clic fuera
                    allowEscapeKey: false,    // No permitir cerrar con la tecla "Esc"
                    preConfirm: () => {
                        const altura = $('#altura').val();
                        const peso = $('#peso').val();
                        const edad = $('#edad').val();
                        const genero = $('#genero').val();
                        const nivel_act = $('#nivel_act').val();
                        const descripcion = $('#descripcion').val();
                        const foto_perfil = $('#foto_perfil')[0].files[0];

                        // Validación de campos vacíos
                        if (!altura || !peso || !edad || !genero || !nivel_act || !descripcion) {
                            Swal.showValidationMessage(`Por favor, complete todos los campos`);
                            return false; // No cerrar el modal hasta que esté completo
                        }

                        // Crear FormData para POST
                        let formData = new FormData();
                        formData.append('altura', altura);
                        formData.append('peso', peso);
                        formData.append('edad', edad);
                        formData.append('genero', genero);
                        formData.append('nivel_act', nivel_act);
                        formData.append('descripcion', descripcion);

                        // Establecer imagen predeterminada si no se sube ninguna
                        if (foto_perfil) {
                            formData.append('foto_perfil', foto_perfil);
                        } else {
                            formData.append('foto_perfil', 'gnome.jpeg'); // Nombre de la imagen predeterminada
                        }

                        // Enviar datos por POST
                        return fetch('miPerfil.php', {
                            method: 'POST',
                            body: formData,
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    Swal.fire('¡Perfil actualizado!', data.message, 'success').then(() => {
                                        location.reload(); // Recargar la página al cerrar el mensaje de éxito
                                    });
                                } else {
                                    Swal.fire('Error', data.error, 'error');
                                }
                            })
                            .catch(error => Swal.showValidationMessage(`Error: ${error}`));
                    }
                });
            }
        })
        .catch(error => console.error('Error al obtener los datos del perfil:', error));
});


document.addEventListener('DOMContentLoaded', function() {
    // Función para obtener los datos del perfil del usuario desde el servidor
    function cargarDatosPerfil() {
        // Hacer una solicitud a PHP que devolverá los datos del usuario en formato JSON
        fetch('obtenerPerfil.php')  // Cambia 'ruta/al/archivo.php' con la ubicación real de tu archivo PHP
            .then(response => response.json())  // Convertir la respuesta JSON
            .then(data => {
                if (data) {
                    // Si se obtienen datos, actualizamos los elementos HTML
                    document.getElementById('user-name').innerText = data.nombre || 'Nombre no disponible';
                    document.getElementById('user-description').innerText = data.descripcion || 'Descripción no disponible';
                    document.getElementById('user-height').innerText = data.altura || '0';  // Si la altura no está, se pone '0'
                    document.getElementById('user-weight').innerText = data.peso || '0';   // Si el peso no está, se pone '0'
                    document.getElementById('user-age').innerText = data.edad || '0';       // Si la edad no está, se pone '0'
                    document.getElementById('user-gender').innerText = data.genero || 'Desconocido'; // Valor predeterminado
                    document.getElementById('user-activity-level').innerText = data.nivel_act || 'Desconocido'; // Valor predeterminado
                    document.getElementById('profile-photo').src = data.ruta_perfil || 'ruta/de/imagen/por/default.jpg'; // Imagen de perfil
                    // Calcular y mostrar el IMC
                    updateBMIInfo(data.peso, data.altura);
                } else {
                    // Si no hay datos, podemos mostrar un mensaje o manejar el error como sea necesario
                    console.log('No se encontraron datos para este usuario.');
                }
            })
            .catch(error => {
                console.error('Error al cargar los datos del perfil:', error);
            });
    }

    // Llamar a la función para cargar los datos cuando la página esté lista
    cargarDatosPerfil();

});   

$(document).ready(function() {

        // Array simulando datos de la base de datos
        const userData = {
            profilePhoto: 'entrenador1-pf.png',
            name: 'CRIS ALLEN',
            description: '180 KG EN BANCA y desarrollador backend',
            badgeImage: '../../../assets/img/elou.png',
            progress: 69,
            protein: 80,
            carbs: 65,
            fats: 50,
            muscleImages: ['pecho.png', 'espalda.png', 'pierna.png', 'box.png']
        };
        


    // Array simulando eventos preexistentes
    const preloadedEvents = [
        { title: 'Clase de Yoga', start: '2024-11-10' },
        { title: 'Entrenamiento de fuerza', start: '2024-11-12' }
    ];

        // Cargar datos de perfil
        $('#profile-photo').attr('src', userData.profilePhoto);
        $('#user-name').text(userData.name);
        $('#user-description').text(userData.description);
        $('#badge-image').attr('src', userData.badgeImage);
        $('#circle-progress').text(`${userData.progress}%`);
    
        // Llenar barras de progreso
        $('#protein-bar').css('width', `${userData.protein}%`);
        $('#carbs-bar').css('width', `${userData.carbs}%`);
        $('#fats-bar').css('width', `${userData.fats}%`);
    
        // Cargar imágenes de músculos
        userData.muscleImages.forEach((imgSrc, index) => {
            $(`#muscle-${index + 1} img`).attr('src', imgSrc);
        });



    // Inicializar FullCalendar
    let calendarEl = document.getElementById('calendar');
    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        droppable: true,
        events: preloadedEvents,
        dateClick: function(info) {
            $('#event-modal').show();
            $('#event-form').off('submit').on('submit', function(e) {
                e.preventDefault();
                let title = $('#event-title').val();
                if (title) {
                    calendar.addEvent({
                        title: title,
                        start: info.dateStr,
                        allDay: true
                    });

                    // Enviar POST al servidor
                    fetch('/ruta-del-servidor', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ title, date: info.dateStr })
                    })
                    .then(response => response.json())
                    .then(data => console.log('Evento guardado:', data))
                    .catch(error => console.error('Error al guardar:', error));

                    $('#event-title').val('');
                    $('#event-modal').hide();
                }
            });
        }
    });
    calendar.render();

    // Manejadores de arrastrar y soltar
    $('.muscle-box').on('dragstart', function(e) {
        $(this).addClass('dragging');
        e.originalEvent.dataTransfer.setData('text', $(this).text());
    });

    $('.muscle-box').on('dragend', function() {
        $(this).removeClass('dragging');
    });

    calendarEl.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    calendarEl.addEventListener('drop', function(e) {
        e.preventDefault();
        $('#event-modal').show();
    });

    // Manejo del modal
    $('.close').on('click', function() {
        $('#event-modal').hide();
    });
});

function calculateBMI(weight, height) {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(2);
}

function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Bajo peso';
    if (bmi < 25) return 'Peso normal';
    if (bmi < 30) return 'Sobrepeso';
    return 'Obesidad';
}

function updateBMIInfo(weight, height) {
    if (weight && height) {
        const bmi = calculateBMI(weight, height);
        const category = getBMICategory(bmi);
        $('#bmi-value').text(bmi); // Mostrar el valor del IMC
        $('#bmi-category').text(category); // Mostrar la categoría del IMC
    } else {
        $('#bmi-value').text('N/A');
        $('#bmi-category').text('Datos insuficientes');
    }
}

function handleEditProfile() {
    const currentNivelAct = $('#user-activity-level').text();
    
    Swal.fire({
        title: 'Editar Perfil',
        html: `
            <input type="number" id="altura" placeholder="Altura (cm)" class="swal2-input" value="${$('#user-height').text()}">
            <input type="number" id="peso" placeholder="Peso (kg)" class="swal2-input" value="${$('#user-weight').text()}">
            <input type="number" id="edad" placeholder="Edad" class="swal2-input" value="${$('#user-age').text()}">
            <select id="genero" class="swal2-input">
                <option value="Masculino" ${$('#user-gender').text() === 'Masculino' ? 'selected' : ''}>Masculino</option>
                <option value="Femenino" ${$('#user-gender').text() === 'Femenino' ? 'selected' : ''}>Femenino</option>
                <option value="Prefiero no decirlo" ${$('#user-gender').text() === 'Prefiero no decirlo' ? 'selected' : ''}>Prefiero no decirlo</option>
            </select>
            <select id="nivel_act" class="swal2-input">
                <option value="Sedentario" ${currentNivelAct === 'Sedentario' ? 'selected' : ''}>Sedentario</option>
                <option value="Ligeramente Activo" ${currentNivelAct === 'Ligeramente Activo' ? 'selected' : ''}>Ligeramente Activo</option>
                <option value="Moderadamente Activo" ${currentNivelAct === 'Moderadamente Activo' ? 'selected' : ''}>Moderadamente Activo</option>
                <option value="Muy Activo" ${currentNivelAct === 'Muy Activo' ? 'selected' : ''}>Muy Activo</option>
                <option value="Atleta Profesional" ${currentNivelAct === 'Atleta Profesional' ? 'selected' : ''}>Atleta Profesional</option>
            </select>
            <textarea id="descripcion" placeholder="Descripción" class="swal2-textarea">${$('#user-description').text()}</textarea>
            <input type="file" id="foto_perfil" class="swal2-input" accept="image/*">
        `,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const formData = new FormData();
            formData.append('altura', $('#altura').val());
            formData.append('peso', $('#peso').val());
            formData.append('edad', $('#edad').val());
            formData.append('genero', $('#genero').val());
            formData.append('nivel_act', $('#nivel_act').val());
            formData.append('descripcion', $('#descripcion').val());

            const fotoPerfilInput = $('#foto_perfil')[0];
            if (fotoPerfilInput.files.length > 0) {
                formData.append('foto_perfil', fotoPerfilInput.files[0]);
            }
            
            return fetch('actualizarPerfil.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    return data;
                } else {
                    throw new Error(data.error || 'Error al actualizar el perfil');
                }
            })
            .catch(error => {
                Swal.showValidationMessage(error.message || 'Hubo un error al actualizar el perfil');
                return false;
            });
        }
    }).then((result) => {
        if (result.value && result.value.success) {
            Swal.fire({
                title: '¡Éxito!',
                text: 'Perfil actualizado correctamente',
                icon: 'success'
            }).then(() => {
                location.reload();
            });
        }
    });
}

function handleDeleteAccount() {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción eliminará permanentemente tu cuenta y todos tus datos",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar cuenta',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return fetch('eliminarCuenta.php', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire('Cuenta Eliminada', 'Tu cuenta ha sido eliminada permanentemente', 'success')
                    .then(() => window.location.href = '../../../Pages/Landing/landingV.html');
                } else {
                    Swal.fire('Error', 'No se pudo eliminar la cuenta', 'error');
                }
            })
            .catch(error => {
                Swal.fire('Error', 'Hubo un problema al procesar tu solicitud', 'error');
                console.error('Error al eliminar cuenta:', error);
            });
        }
    });
}

// Initialize when document is ready
$(document).ready(function() {
    $('#btn-edit-profile').on('click', handleEditProfile);
    $('#btn-delete-account').on('click', handleDeleteAccount);
    updateBMIInfo();
});