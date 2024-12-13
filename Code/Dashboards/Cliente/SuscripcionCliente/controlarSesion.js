// Verificar sesión al cargar la página
function verificarSesion() {
    fetch('../../../Users/Sesiones/verificarSesion.php')
    .then(response => response.json())
    .then(response => {
        if (response.status === 'error') {
            // Si no hay sesión activa, redirigir a la página de inicio de sesión
            window.location.href = '../../../Pages/Landing/landingV.html';
        } else {
            // Solo permitir acceso si el rol es 'admin'
            const rol = response.rol;
            if (rol !== 'cliente') {
                // Mostrar alerta con SweetAlert
                Swal.fire({
                    title: 'Acceso denegado',
                    text: 'No tienes permisos para acceder a esta página.',
                    icon: 'warning',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    // Redirigir después de cerrar la alerta
                    window.location.href = '../../../Pages/Landing/landingV.html';
                });
            }
        }
    })
    .catch(error => console.error('Error:', error));
}

// Llamar a verificarSesion al cargar la página
window.onload = verificarSesion;
