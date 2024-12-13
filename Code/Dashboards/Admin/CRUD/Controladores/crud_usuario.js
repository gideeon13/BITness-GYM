// Array to hold user data
let users = [];
let table; // Declare table variable

$(document).ready(function() {
    initializeDataTable(); // Initialize DataTable
    fetchUsers(); // Fetch users after the table is initialized
});

// Function to initialize DataTable
function initializeDataTable() {
    // Ensure that the table is destroyed before re-initializing
    if ($.fn.DataTable.isDataTable('#userTable')) {
        $('#userTable').DataTable().clear().destroy();
    }

    // Initialize DataTable with desired options
    table = $('#userTable').DataTable({
        "paging": true,
        "searching": true,
        "pageLength": 10,
        "destroy": true,
        "language": {
            "url": "https://cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json"
        },
        "order": [],
        "responsive": true,
        "autoWidth": false
    });
}

// Function to populate the user table
function populateUserTable() {
    table.clear();

    users.forEach(user => {
        table.row.add([
            user.id_usuario,
            user.email,
            user.nombre,
            user.ci,
            user.altura,
            user.rol,
`
<button class="btn btn-warning btn-sm" onclick="openEditUserModal(${user.id_usuario})">Editar</button>
<button class="btn btn-danger btn-sm" onclick="confirmDeleteUser(${user.id_usuario})">Eliminar</button>
`

        ]);
    });

    table.draw();
}

// Function to fetch users from the server
async function fetchUsers() {
    try {
        const response = await fetch('../Modelos/crud_usuario.php', {
            method: 'GET',
        });
        const data = await response.json();
        if (data.success !== false) {
            users = data.users;
            populateUserTable();
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Función para mostrar los campos específicos según el rol seleccionado
function showRoleSpecificFields() {
    const selectedRole = document.getElementById('rol').value;
    
    // Ocultar todos los campos específicos
    document.getElementById('adminFields').style.display = 'none';
    document.getElementById('trainerFields').style.display = 'none';
    document.getElementById('clientFields').style.display = 'none';
    document.getElementById('contableFields').style.display = 'none';

    // Mostrar los campos específicos según el rol seleccionado
    switch (selectedRole) {
        case 'admin':
            document.getElementById('adminFields').style.display = 'block';
            break;
        case 'entrenador':
            document.getElementById('trainerFields').style.display = 'block';
            break;
        case 'cliente':
            document.getElementById('clientFields').style.display = 'block';
            break;
        case 'contable':
            document.getElementById('contableFields').style.display = 'block';
            break;
    }
}

// Función para manejar el envío del formulario y agregar el usuario
document.getElementById("userForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const newUser = {
        email: document.getElementById("email").value,
        nombre: document.getElementById("nombre").value,
        ci: document.getElementById("ci").value,
        altura: document.getElementById("altura").value,
        password: document.getElementById("password").value,  // Agregar contraseña
        rol: document.getElementById("rol").value,
    };

    // Agregar los campos específicos según el rol seleccionado
    if (newUser.rol === 'admin') {
        newUser.cargo = document.getElementById("cargo").value;
    } else if (newUser.rol === 'entrenador') {
        newUser.especialidad = document.getElementById("especialidad").value;
        newUser.detalles = document.getElementById("detalles").value;
        newUser.precio = document.getElementById("precio").value;
    } else if (newUser.rol === 'cliente') {
        newUser.estado_sus = document.getElementById("estado_sus").value;
        newUser.sus_preferida = document.getElementById("sus_preferida").value;
        newUser.concurrencia = document.getElementById("concurrencia").value;
    } else if (newUser.rol === 'contable') {
        newUser.responsabilidad = document.getElementById("responsabilidad").value;
    }

    try {
        const response = await fetch('../modelos/crud_usuario.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser),
        });
        const data = await response.json();
        if (data.success) {
            Swal.fire('Usuario agregado', 'El usuario ha sido agregado exitosamente', 'success');
            document.getElementById("userForm").reset();
            $('#addUserModal').modal('hide');
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error adding user:', error);
    }
});


// Function to open edit user modal
function openEditUserModal(userId) {
    const usuario = users.find(u => u.id_usuario === userId);
    if (usuario) {
        document.getElementById("editUserId").value = usuario.id_usuario;
        document.getElementById("editEmail").value = usuario.email;
        document.getElementById("editNombre").value = usuario.nombre;
        document.getElementById("editCI").value = usuario.ci;
        document.getElementById("editAltura").value = usuario.altura;
        document.getElementById("editRol").value = usuario.rol;
        $('#editUserModal').modal('show');
    } else {
        console.error("Usuario no encontrado");
    }
}

// Function to handle editing a user
document.getElementById("editUserForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const actualizarUsuario = {
        id_usuario: document.getElementById("editUserId").value,
        email: document.getElementById("editEmail").value,
        nombre: document.getElementById("editNombre").value,
        ci: document.getElementById("editCI").value,
        altura: document.getElementById("editAltura").value,
        rol: document.getElementById("editRol").value,
    };

    try {
        const response = await fetch('../modelos/crud_usuario.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(actualizarUsuario),
        });
        const data = await response.json();
        if (data.success) {
            await fetchUsers();
            Swal.fire('Usuario actualizado', 'El usuario ha sido actualizado exitosamente', 'success');
            $('#editUserModal').modal('hide');
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
    }
},

// Function to confirm user deletion with SweetAlert2
function confirmDeleteUser(userId) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch('../modelos/crud_usuario.php', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_usuario: userId }),
                });
                const data = await response.json();
                if (data.success) {
                    users = users.filter(u => u.id_usuario !== userId);
                    populateUserTable();
                    Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    }); // This closes the .then() block correctly
});

// Fetch users on page load
fetchUsers();
