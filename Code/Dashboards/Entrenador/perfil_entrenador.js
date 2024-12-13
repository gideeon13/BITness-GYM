document.addEventListener('DOMContentLoaded', function() {
    cargarPerfil();
    setupDropZones();
    setupEspecialidades();

    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        guardarPerfil();
    });
});

function setupDropZones() {
    const dropZonePerfil = document.getElementById('dropZonePerfil');
    const inputFotoPerfil = document.getElementById('foto_perfil');
    setupDropZone(dropZonePerfil, inputFotoPerfil, false, actualizarPreviewPerfil);

    const dropZoneCarousel = document.getElementById('dropZoneCarousel');
    const inputFotosCarousel = document.getElementById('fotos_carousel');
    setupDropZone(dropZoneCarousel, inputFotosCarousel, true, actualizarPreviewCarousel);
}

function setupDropZone(dropZone, input, multiple, previewCallback) {
    dropZone.addEventListener('click', () => input.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        if (multiple) {
            input.files = e.dataTransfer.files;
        } else {
            const dt = new DataTransfer();
            dt.items.add(e.dataTransfer.files[0]);
            input.files = dt.files;
        }
        
        previewCallback(input.files);
    });

    input.addEventListener('change', () => {
        previewCallback(input.files);
    });
}

function actualizarPreviewPerfil(files) {
    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('profileImage').src = e.target.result;
        document.getElementById('cardProfileImage').src = e.target.result;
        
        const previewContainer = document.getElementById('previewPerfil');
        previewContainer.innerHTML = `
            <img src="${e.target.result}" alt="Preview" class="preview-image">
        `;
    }
    reader.readAsDataURL(file);
}

function actualizarPreviewCarousel(files) {
    const previewContainer = document.getElementById('previewCarousel');
    const carouselContainer = document.getElementById('carouselImages');
    
    previewContainer.innerHTML = '';
    carouselContainer.innerHTML = '';
    
    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Preview en el formulario
            const wrapper = document.createElement('div');
            wrapper.className = 'preview-image-wrapper';
            wrapper.innerHTML = `
                <img src="${e.target.result}" alt="Preview ${index + 1}" class="preview-image">
                <button type="button" class="remove-image" data-index="${index}">×</button>
            `;
            
            wrapper.querySelector('.remove-image').addEventListener('click', function() {
                wrapper.remove();
                actualizarInputCarousel();
            });
            
            previewContainer.appendChild(wrapper);

            // Preview en el carrusel
            const carouselImg = document.createElement('img');
            carouselImg.src = e.target.result;
            carouselImg.alt = `Imagen ${index + 1}`;
            carouselContainer.appendChild(carouselImg);
        }
        reader.readAsDataURL(file);
    });
}

function actualizarInputCarousel() {
    const input = document.getElementById('fotos_carousel');
    const previewImages = document.querySelectorAll('#previewCarousel .preview-image');
    const dt = new DataTransfer();
    
    previewImages.forEach((img, index) => {
        if (input.files[index]) {
            dt.items.add(input.files[index]);
        }
    });
    
    input.files = dt.files;
    actualizarPreviewCarousel(input.files);
}

function setupEspecialidades() {
    document.getElementById('addEspecialidad').addEventListener('click', agregarEspecialidad);
    
    const container = document.getElementById('especialidadesContainer');
    if (container.children.length === 0) {
        agregarEspecialidad();
    }
}

function agregarEspecialidad() {
    const container = document.getElementById('especialidadesContainer');
    if (container.children.length >= 5) {
        alert('Máximo 5 especialidades permitidas');
        return;
    }

    const div = document.createElement('div');
    div.className = 'especialidad-input';
    div.innerHTML = `
        <input type="text" name="especialidades[]" required>
        <button type="button" class="remove-especialidad">×</button>
    `;

    div.querySelector('.remove-especialidad').addEventListener('click', function() {
        if (container.children.length > 1) {
            div.remove();
            actualizarEspecialidades();
        }
    });

    div.querySelector('input').addEventListener('input', actualizarEspecialidades);
    container.appendChild(div);
}

function actualizarEspecialidades() {
    const inputs = document.querySelectorAll('[name="especialidades[]"]');
    const especialidades = Array.from(inputs).map(input => input.value).filter(Boolean);
    
    // Actualizar en la vista de perfil
    const profileSpecialty = document.getElementById('profileSpecialty');
    profileSpecialty.innerHTML = especialidades.map(esp => `
        <span class="specialty-tag">${esp}</span>
    `).join('');

    // Actualizar en la card
    const cardSpecialties = document.getElementById('cardSpecialties');
    cardSpecialties.innerHTML = especialidades.map(esp => `
        <span class="specialty-tag">${esp}</span>
    `).join('');
}

function cargarPerfil() {
    fetch('perfil_entrenador.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error al cargar el perfil: ' + data.error);
                return;
            }
            
            // Actualizar formulario
            document.getElementById('nombre').value = data.nombre;
            document.getElementById('detalles').value = data.detalles;
            document.getElementById('precio').value = data.precio;
            document.getElementById('disponibilidad_dia').value = data.disponibilidad_dia;
            document.getElementById('disponibilidad_hora').value = data.disponibilidad_hora;
            document.getElementById('anos_experiencia').value = data.años_experiencia;
            document.getElementById('formato').value = data.formato;
            document.getElementById('telefono').value = data.telefono;
            document.getElementById('certificaciones').value = data.certificaciones;

            // Actualizar vista de perfil
            document.getElementById('profileName').textContent = data.nombre;
            document.getElementById('profileDetails').textContent = data.detalles;
            document.getElementById('profilePhone').textContent = data.telefono;
            document.getElementById('profileExperience').textContent = `${data.años_experiencia} años`;
            document.getElementById('profileFormat').textContent = data.formato;
            document.getElementById('profileAvailability').textContent = 
                `📅 ${data.disponibilidad_dia}\n⏰ ${data.disponibilidad_hora}`;

            // Actualizar card
            document.getElementById('cardName').textContent = data.nombre;
            document.getElementById('cardExperience').textContent = `🏆 ${data.años_experiencia} años exp.`;
            document.getElementById('cardFormat').textContent = `📍 ${data.formato}`;

            // Cargar especialidades
            const especialidades = data.especialidades.split('|');
            const especialidadesContainer = document.getElementById('especialidadesContainer');
            especialidadesContainer.innerHTML = '';
            especialidades.forEach(esp => {
                if (esp.trim()) {
                    const div = document.createElement('div');
                    div.className = 'especialidad-input';
                    div.innerHTML = `
                        <input type="text" name="especialidades[]" value="${esp.trim()}" required>
                        <button type="button" class="remove-especialidad">×</button>
                    `;
                    especialidadesContainer.appendChild(div);
                }
            });
            actualizarEspecialidades();

            // Cargar certificaciones
            const certificacionesContainer = document.getElementById('profileCertifications');
            certificacionesContainer.innerHTML = data.certificaciones.split('|')
                .map(cert => `<p>${cert.trim()}</p>`).join('');

            // Cargar imágenes
            if (data.ruta_perfil) {
                document.getElementById('profileImage').src = data.ruta_perfil;
                document.getElementById('cardProfileImage').src = data.ruta_perfil;
            }

            if (data.ruta_carousel) {
                const carouselImages = data.ruta_carousel.split('|');
                const carouselContainer = document.getElementById('carouselImages');
                carouselContainer.innerHTML = '';
                carouselImages.forEach(imgSrc => {
                    if (imgSrc.trim()) {
                        const img = document.createElement('img');
                        img.src = imgSrc.trim();
                        img.alt = 'Imagen del carrusel';
                        carouselContainer.appendChild(img);
                    }
                });
            }
        })
        .catch(error => console.error('Error:', error));
}

function guardarPerfil() {
    const formData = new FormData(document.getElementById('profileForm'));
    
    // Convertir especialidades a string separado por |
    const especialidades = Array.from(formData.getAll('especialidades[]'))
        .filter(Boolean)
        .join('|');
    formData.set('especialidades', especialidades);

    fetch('perfil_entrenador.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Perfil actualizado con éxito');
            cargarPerfil();
        } else {
            alert('Error al actualizar el perfil: ' + data.error);
        }
    })
    .catch(error => console.error('Error:', error));
}