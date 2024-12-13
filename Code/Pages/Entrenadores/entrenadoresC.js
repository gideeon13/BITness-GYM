// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    let allTrainers = [];
    const cardContainer = document.querySelector('.card-container');
    const searchInput = document.querySelector('.search-input');
    const profileSection = document.querySelector('.profile-section');

    // Cargar entrenadores al iniciar
    loadTrainers();

    // Configurar buscador
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredTrainers = allTrainers.filter(trainer => {
            return trainer.name.toLowerCase().includes(searchTerm) ||
                   trainer.specialties.toLowerCase().includes(searchTerm) ||
                   trainer.format.toLowerCase().includes(searchTerm);
        });
        displayTrainers(filteredTrainers);
    });

    // Función para cargar entrenadores
    function loadTrainers() {
        fetch('entrenadorModelo.php')
            .then(response => response.json())
            .then(data => {
                allTrainers = data;
                displayTrainers(data);
            })
            .catch(error => console.error('Error:', error));
    }

    // Función para mostrar entrenadores
    function displayTrainers(entrenadores) {
        cardContainer.innerHTML = '';

        entrenadores.forEach(entrenador => {
            const especialidades = entrenador.specialties.split('|');
            const especialidadesHTML = especialidades
                .map(esp => `<span class="specialty-tag">${esp.trim()}</span>`)
                .join('');

            const card = document.createElement('div');
            card.className = 'trainer-card';
            card.dataset.id = entrenador.id_usuario;
            card.innerHTML = `
                <div class="trainer-image">
                    <img src="${entrenador.profilePhoto}" alt="${entrenador.name}" class="trainer-img">
                </div>
                <p>50 /mes<p/>
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
            `;

            // Evento para ver perfil
            const viewProfileBtn = card.querySelector('.view-profile-btn');
            viewProfileBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                mostrarPerfil(entrenador.id_usuario);
            });

            cardContainer.appendChild(card);
        });
    }

    // Función para mostrar el perfil específico
    function mostrarPerfil(id) {
        const entrenador = allTrainers.find(e => e.id_usuario === id);
        if (!entrenador) return;

        // Actualizar información del perfil
        document.getElementById('profileName').textContent = entrenador.name;
        document.getElementById('profileDetails').textContent = entrenador.details;
        document.getElementById('profileNumber').textContent = entrenador.telefono;
        document.getElementById('profileExperience').textContent = `🏆 ${entrenador.experience} años exp.`;
        document.getElementById('profileFormat').textContent = `📍 ${entrenador.format}`;
        document.getElementById('profileAvailability').textContent = `⏰ ${entrenador.availability_hour}`;
        document.getElementById('profileImage').src = entrenador.profilePhoto;

        // Actualizar especialidades
        const specialtyContainer = document.getElementById('profileSpecialty');
        specialtyContainer.innerHTML = entrenador.specialties
            .split('|')
            .map(spec => `<span class="tag">${spec.trim()}</span>`)
            .join('');

        // Actualizar certificaciones
        const certContainer = document.getElementById('profileCertifications');
        certContainer.innerHTML = entrenador.certifications
            .split('|')
            .map(cert => `<p>${cert.trim()}</p>`)
            .join('');

        // Configurar carrusel
        setupCarousel(entrenador.carouselImages.split('|'));

        // Mostrar la sección del perfil
        profileSection.style.display = 'block';

        // Al hacer clic en el botón "Conectar con el Entrenador", se llama a la función
        connectButton.addEventListener('click', function() {
            connectWithTrainer(entrenador.id_usuario); // Pasar el id del entrenador
        });
    }

    // Configurar carrusel
    function setupCarousel(images) {
        const carouselContainer = document.querySelector('.carousel-container');
        let currentImageIndex = 0;

        function updateCarousel() {
            carouselContainer.innerHTML = `
                <img src="${images[currentImageIndex].trim()}" alt="Entrenamiento">
                <button class="carousel-btn prev">❮</button>
                <button class="carousel-btn next">❯</button>
                <div class="carousel-dots">
                    ${images.map((_, index) => 
                        `<span class="dot ${index === currentImageIndex ? 'active' : ''}"></span>`
                    ).join('')}
                </div>
            `;

            // Configurar eventos de los botones
            const prevBtn = carouselContainer.querySelector('.prev');
            const nextBtn = carouselContainer.querySelector('.next');

            prevBtn.addEventListener('click', () => {
                currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
                updateCarousel();
            });

            nextBtn.addEventListener('click', () => {
                currentImageIndex = (currentImageIndex + 1) % images.length;
                updateCarousel();
            });
        }

        updateCarousel();
    }
});
