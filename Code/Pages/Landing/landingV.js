$(document).ready(() => {
    const ventana = $('.img-centro-ventana');
    const ventanaFondo = $('.img-centro-ventana-fondo');
    const heroTexto = $('header h1');
    const gameOnText = $('header img');
    const windowsLanding = $('.window-container'); 

    $(window).on('scroll resize', () => {
        const scrollY = window.scrollY;

        // Aplicamos transformaciones en función del scroll
        ventana.css('transform', `translateY(${scrollY * 0.29}px)`);
        ventanaFondo.css('transform', `translateY(${scrollY * 0.29}px)`);
        heroTexto.css('transform', `translatex(${scrollY * -0.25}px)`);
        gameOnText.css('transform', `translatex(${scrollY * -0.6}px)`);
        windowsLanding.css('transform', `translatex(${scrollY * 0.6}px)`);
    });

});


// Registrar GSAP y ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Variables para la animación manual
let marqueeContent = document.querySelector('.marquee-content');
let marqueeSpeed = 2; // Velocidad de movimiento
let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
let currentPosition = 0;

// Función para mover el marquee
function moveMarquee(direction) {
    currentPosition += direction * marqueeSpeed;
    marqueeContent.style.transform = `translateX(${currentPosition}px)`;

    // Si el marquee se mueve fuera de la pantalla a la izquierda o derecha, lo reiniciamos
    if (currentPosition < -marqueeContent.offsetWidth) {
        currentPosition = window.innerWidth;
    } else if (currentPosition > window.innerWidth) {
        currentPosition = -marqueeContent.offsetWidth;
    }
}

// Evento de scroll
window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Detectar dirección del scroll
    if (scrollTop > lastScrollTop) {
        // Scroll hacia abajo (mover a la izquierda)
        moveMarquee(1);
    } else if (scrollTop < lastScrollTop) {
        // Scroll hacia arriba (mover a la derecha)
        moveMarquee(-1);
    }

    // Actualizar la última posición de scroll
    lastScrollTop = scrollTop;
});

// Pausar el marquee si no hay scroll después de un tiempo
let scrollTimeout;
window.addEventListener("scroll", function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
        // Pausar el movimiento del marquee cuando no haya scroll
        marqueeSpeed = 0;
    }, 100);

    // Reanudar la velocidad cuando hay scroll
    marqueeSpeed = 2;
});



/*ANIMACION VNETANAS WINDOWS*/ 
$(document).ready(function () {
    let windowsCount = $(".window").length; // Total de ventanas
    let clickedWindows = 0; // Contador de ventanas clicadas
    let timers = []; // Temporizadores para cada ventana

    // Evento click en el botón "Next"
    $(".next-btn").on("click", function () {
        const windowElement = $(this).closest(".window");

        // Añadir la clase de cierre y animar
        windowElement.addClass("closing");

        // Esperar la animación (0.5s) antes de proceder
        setTimeout(function () {
            windowElement.hide(); // Ocultar ventana
            clickedWindows++; // Aumentar contador

            // Iniciar temporizador de reapertura solo para esta ventana
            startReopenTimer(windowElement);

            // Si estamos en la última ventana
            if (clickedWindows === windowsCount) {
                reopenAllWindows(); // Reabrir todas las ventanas cerradas
            }
        }, 500);
    });

    // Iniciar temporizador de reapertura individual
    function startReopenTimer(windowElement) {
        clearTimeout(timers[windowElement.index()]); // Limpiar temporizador previo

        // Iniciar un temporizador de 8 segundos
        timers[windowElement.index()] = setTimeout(function () {
            if (windowElement.is(":hidden")) {
                reopenWindow(windowElement); // Reabrir si sigue cerrada
            }
        }, 8000);
    }

    // Forzar la reapertura de todas las ventanas cerradas
    function reopenAllWindows() {
        $(".window").each(function () {
            if ($(this).is(":hidden")) {
                reopenWindow($(this)); // Reabrir todas las ventanas cerradas
            }
        });
        clickedWindows = 0; // Reiniciar el contador de clics
    }

    // Función para reabrir una ventana específica
    function reopenWindow(windowElement) {
        windowElement.show().removeClass("closing").addClass("opening");

        // Eliminar clase de apertura tras la animación
        setTimeout(function () {
            windowElement.removeClass("opening");
        }, 500);

        clickedWindows--; // Ajustar el contador al reabrir
    }
});


/*ANIMACIONES SLIDESHOW DE FUNCIONES*/

jQuery(document).ready(function ($) {
    $(".slider-img").on("click", function () {
      $(".slider-img").removeClass("active");
      $(this).addClass("active");
    });
  });


  /*ANIMACIONES BENTO GRID PRODUCTOS*/
  