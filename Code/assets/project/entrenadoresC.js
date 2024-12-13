$(document).ready(function () {
    let allTrainers = [];

    // Cargar entrenadores al cargar la página
    loadTrainers();

    // Función para cargar entrenadores
    function loadTrainers() {
        $.ajax({
            url: 'landingM.php',
            method: 'GET',
            dataType: 'json',
            success: function (entrenadores) {
                allTrainers = entrenadores;
                displayTrainers(entrenadores);
                setupSearchHandler();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('Error al cargar los entrenadores:', textStatus, errorThrown);
            }
        });
    }

    // Función para mostrar entrenadores
    function displayTrainers(entrenadores) {
        const container = $('.card-container');
        container.empty();

        entrenadores.forEach(entrenador => {
            const especialidades = entrenador.specialties.split('|');
            const especialidadesHTML = especialidades
                .map(esp => `<span class="specialty-tag">${esp.trim()}</span>`)
                .join('');

            const card = $(`
                <div class="trainer-card" data-id="${entrenador.id_usuario}">
                    <div class="trainer-image">
                        <img src="${entrenador.profilePhoto}" alt="${entrenador.name}" class="trainer-img">
                    </div>
                    <div class="trainer-info">
                        <h3>${entrenador.name}</h3>
                        <div class="specialties-container">
                            ${especialidadesHTML}
                        </div>
                        <div class="trainer-details">
                            <span class="experience">🏆 ${entrenador.experience} años exp.</span>
                            <span class="format">${entrenador.format}</span>
                        </div>
                        <button class="view-profile-btn">Ver Perfil</button>
                    </div>
                </div>
            `);

            container.append(card);
        });

        // Evento para ver perfil
        $('.view-profile-btn').on('click', function(e) {
            e.stopPropagation();
            const trainerId = $(this).closest('.trainer-card').data('id');
            mostrarPerfil(trainerId);
        });
    }

    // Configurar buscador
    function setupSearchHandler() {
        $('.search-input').on('input', function() {
            const searchTerm = $(this).val().toLowerCase();
            const filteredTrainers = allTrainers.filter(trainer => {
                return trainer.name.toLowerCase().includes(searchTerm) ||
                       trainer.specialties.toLowerCase().includes(searchTerm) ||
                       trainer.format.toLowerCase().includes(searchTerm);
            });
            displayTrainers(filteredTrainers);
        });
    }

    // Función para mostrar el perfil específico
    function mostrarPerfil(id) {
        const entrenador = allTrainers.find(e => e.id_usuario === id);
        if (!entrenador) return;

        // Actualizar información del perfil
        $('#profileName').text(entrenador.name);
        $('#profileSpecialty').html(
            entrenador.specialties.split('|')
                .map(spec => `<span class="tag">${spec.trim()}</span>`)
                .join('')
        );
        $('#profileCertifications').html(
            entrenador.certifications.split('|')
                .map(cert => `<p>${cert.trim()}</p>`)
                .join('')
        );
        $('#profileDetails').text(entrenador.details);
        $('#profileExperience').text(`🏆 ${entrenador.experience} años exp.`);
        $('#profileAvailability').text(`⏰ ${entrenador.availability_hour}`);
        $('#profileFormat').text(`📍 ${entrenador.format}`);

        // Configurar carrusel
        const carouselContainer = $('.carousel-container');
        carouselContainer.empty();
        
        const images = entrenador.carouselImages.split('|');
        let currentImageIndex = 0;

        function updateCarousel() {
            carouselContainer.html(`
                <img src="${images[currentImageIndex].trim()}" alt="Entrenamiento">
                <button class="carousel-btn prev">❮</button>
                <button class="carousel-btn next">❯</button>
                <div class="carousel-dots">
                    ${images.map((_, index) => 
                        `<span class="dot ${index === currentImageIndex ? 'active' : ''}"></span>`
                    ).join('')}
                </div>
            `);
        }

        updateCarousel();

        // Eventos del carrusel
        carouselContainer.on('click', '.prev', function() {
            currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
            updateCarousel();
        });

        carouselContainer.on('click', '.next', function() {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            updateCarousel();
        });

        // Mostrar la sección del perfil
        $('.profile-section').show();
    }
});