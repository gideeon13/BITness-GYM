
// Inicializar variables globales para los marcadores y el mapa
const geopifyAPIKey = 'e7caa5f08f694add898e03a656bcdd51';
let map;
let markers = [];

// Crear el mapa con Geoapify (reemplazar con tu clave API)
function initMap() {
  const map = L.map('map').setView([-34.901112, -56.164532], 10); // Coordenadas iniciales

  L.tileLayer(`https://maps.geoapify.com/v1/tile/dark-matter/{z}/{x}/{y}.png?apiKey=${geopifyAPIKey}`, {
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

    // Agregar marcadores al mapa (sincronizados con las cartas)
    addMarkers();
}

// Función para agregar marcadores
function addMarkers() {
    const locations = [
        { id: 1, name: "Gimnasio 1", lat: -34.901112, lon: -56.164532 },
        { id: 2, name: "Gimnasio 2", lat: 40.74061, lon: -73.925242 },
        { id: 3, name: "Gimnasio 3", lat: 40.75061, lon: -73.915242 },

    ];

    locations.forEach(location => {
        const marker = L.marker([location.lat, location.lon])
            .addTo(map)
            .bindPopup(location.name);

        // Al hacer clic en el marcador, seleccionar la tarjeta correspondiente
        marker.on('click', function () {
            selectCard(location.id);
        });

        // Hover: Cambiar el estilo del marcador cuando el cursor pasa por encima
        marker.on('mouseover', function () {
            marker._icon.classList.add('marker-hover');
        });

        marker.on('mouseout', function () {
            marker._icon.classList.remove('marker-hover');
        });

        // Guardar el marcador en la lista
        markers.push({ id: location.id, marker });
    });
}
//----------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {



    // Animaciones de selección de ubicaciones y tarjetas de suscripción
    const ubicaciones = document.querySelectorAll('#lista-ubicaciones div');
    const tarjetas = document.querySelectorAll('.tarjeta');

    ubicaciones.forEach(ubicacion => {
        ubicacion.addEventListener('click', () => {
            ubicaciones.forEach(u => u.classList.remove('selected'));
            ubicacion.classList.add('selected');
        });
    });

    tarjetas.forEach(tarjeta => {
        tarjeta.addEventListener('click', () => {
            tarjetas.forEach(t => t.classList.remove('selected'));
            tarjeta.classList.add('selected');
        });
    });


});

const toggleElement = document.querySelector('.toggle');
const monthlyLabel = document.querySelector('.toggle-label:nth-of-type(1)');
const yearlyLabel = document.querySelector('.toggle-label:nth-of-type(2)');

toggleElement.addEventListener('click', () => {
  toggleElement.classList.add('touched');

  const isChecked = toggleElement.getAttribute('aria-checked') === 'true';
  toggleElement.setAttribute('aria-checked', !isChecked);

  // Update labels based on the toggle state
  if (isChecked) {
    monthlyLabel.style.color = ''; // default color
    yearlyLabel.style.color = 'green'; // active color
  } else {
    monthlyLabel.style.color = 'green'; // active color
    yearlyLabel.style.color = ''; // default color
  }
});

// Allow keyboard activation
toggleElement.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    toggleElement.click();
    e.preventDefault(); // Prevent scrolling when space is pressed
  }
});








/* 
TASK CARDS

llamar a la api cargar mapa, 
estilar icono de marcador, con hover, centro y tamaño fijo segun el zoom
agregar ubicaciones vigentes segun json resivido en suscripcionesC.js,
agregar suscripciones vigentes segun json resivido en suscriopnesC.js, (hacer tambien en landing)

cambiar estado de vistas de ubicaciones y suscripciones OnClick ,

cargar fomulario de stripe reisvido talvez 



*/

/* Explicación de las funcionalidades implementadas:
-Selección de marcador y tarjeta sincronizados: Al hacer clic en un marcador, se selecciona la tarjeta correspondiente y viceversa.
-Centrado del mapa y selección automática: Cuando se selecciona una tarjeta, el mapa se centra en el marcador correspondiente.
-Hover en los marcadores: Al pasar el cursor sobre un marcador, su estilo cambia para destacar visualmente.
-Ajuste dinámico del tamaño: El mapa y las tarjetas se ajustan automáticamente al tamaño de la ventana o al hacer zoom.
-Scroll automático a la tarjeta seleccionada: Cuando se selecciona un marcador o tarjeta, la tarjeta correspondiente se centra en la vista.
-Responsividad general: El uso de unidades rem, vw y vh garantiza que la página sea responsiva y los elementos escalen de manera fluida con el zoom.*/
