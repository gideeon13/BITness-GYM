document.querySelector('.log-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const correo = e.target.querySelector('input[type="email"]').value;
    const contrasena = e.target.querySelector('input[type="password"]').value;

    try {
        const response = await fetch('../../Users/Login/loginM.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ correo, contrasena })
        });

        const result = await response.json();
        console.log(result); // Agrega esta línea para ver la respuesta completa del servidor

        if (result.status === 'success') {
            // Redirigir según el rol
            switch (result.rol) {
                case 'admin':
                    window.location.href = '../../Dashboards/Admin/CRUD/Vistas/admin.html';
                    break;
                case 'entrenador':
                    window.location.href = '../../Dashboards/Entrenador/perfil_entrenador.html';
                    break;
                case 'cliente':
                    // Comprobar si el usuario está suscrito
                    if (result.subscribed) {
                        window.location.href = '../../Dashboards/Cliente/miperfilCliente/miperfilV.html'; // Si está suscrito, va a su perfil
                    } else {
                        window.location.href = '../../Dashboards/Cliente/SuscripcionCliente/suscripcionV.html'; // Si no está suscrito, va a la página de suscripción
                    }
                    break;
                default:
                    alert('Rol de usuario no reconocido');
            }
        } else {
            alert(result.message);
        }        
    } catch (error) {
        console.error('Error:', error);
        alert('Error en la conexión');
    }
});


document.querySelector('.registro-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre_usuario = e.target.querySelector('input[name="nombre_usuario"]').value;
    const correo = e.target.querySelector('input[name="correo"]').value;
    const contrasena = e.target.querySelector('input[name="contrasena"]').value;
    
    try {
        const response = await fetch('../../Users/Registro/registroM.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ nombre_usuario, correo, contrasena })
        });

        const result = await response.json();

        alert(result.message);

        if (result.status === 'success') {
            // Redirigir automáticamente después del registro
            window.location.href = '../../Dashboards/Cliente/SuscripcionCliente/suscripcionV.html';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error en la conexión');
    }
});

