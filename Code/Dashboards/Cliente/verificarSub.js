document.addEventListener("DOMContentLoaded", () => {
    fetch("verificarSub.php") // Cambiar por la ruta del archivo PHP
        .then((response) => response.json())
        .then((data) => {
            if (data.redirect) {
                // Redirigir si se especifica
                window.location.href = data.redirect;
            } else {
                // Si no hay redirección, cargar el navbar del cliente
                cargarNavbarCliente();
            }
        })
        .catch((error) => {
            console.error("Error al verificar la suscripción:", error);
        });
});