// Inicializar GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Animación inicial
function initAnimations() {
    // Animación del título
    gsap.from('.glitch-text', {
        duration: 1,
        opacity: 0,
        y: -50,
        ease: 'power4.out',
        delay: 0.5
    });

    // Efecto máquina de escribir
    const text = document.querySelector('.typewriter-text');
    const content = text.textContent;
    text.textContent = '';
    let i = 0;

    function typeWriter() {
        if (i < content.length) {
            text.textContent += content.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    }

    typeWriter();

    // Animación de las tarjetas
    gsap.from('.trainer-card', {
        scrollTrigger: {
            trigger: '.trainers-grid',
            start: 'top center',
            toggleActions: 'play none none reverse'
        },
        duration: 0.8,
        opacity: 0,
        y: 50,
        stagger: 0.2,
        ease: 'power3.out'
    });

    // Animación del perfil
    gsap.from('.profile-section', {
        scrollTrigger: {
            trigger: '.profile-section',
            start: 'top center',
            toggleActions: 'play none none reverse'
        },
        duration: 1,
        opacity: 0,
        scale: 0.95,
        ease: 'power3.out'
    });

    // Efecto de hover en las tarjetas
    document.querySelectorAll('.trainer-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                duration: 0.3,
                y: -10,
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                duration: 0.3,
                y: 0,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                ease: 'power2.out'
            });
        });
    });

    // Efecto de parallax en el fondo
    gsap.to('.window-content', {
        scrollTrigger: {
            trigger: '.window-content',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1
        },
        backgroundPosition: '100% 100%',
        ease: 'none'
    });

    // Animación de aparición para elementos de la galería
    gsap.from('.gallery-content img', {
        scrollTrigger: {
            trigger: '.profile-gallery',
            start: 'top center',
            toggleActions: 'play none none reverse'
        },
        duration: 0.8,
        opacity: 0,
        scale: 0.8,
        stagger: 0.2,
        ease: 'back.out(1.7)'
    });
}

// Iniciar animaciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initAnimations);

// Efecto de glitch aleatorio en el título
setInterval(() => {
    const glitchText = document.querySelector('.glitch-text');
    glitchText.style.textShadow = `
        ${Math.random() * 10}px ${Math.random() * 10}px #ff00ff,
        ${Math.random() * -10}px ${Math.random() * 10}px #00ffff
    `;
    setTimeout(() => {
        glitchText.style.textShadow = '2px 2px var(--accent-color)';
    }, 100);
}, 3000);

// Animación del cursor de búsqueda
const searchInput = document.querySelector('.search-input');
searchInput.addEventListener('focus', () => {
    gsap.to(searchInput, {
        duration: 0.3,
        borderColor: 'var(--accent-color)',
        boxShadow: '0 0 10px rgba(255,0,255,0.3)',
        ease: 'power2.out'
    });
});

searchInput.addEventListener('blur', () => {
    gsap.to(searchInput, {
        duration: 0.3,
        borderColor: 'var(--window-border)',
        boxShadow: 'none',
        ease: 'power2.out'
    });
});