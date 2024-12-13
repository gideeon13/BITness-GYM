let sucursales = []; // Declare sucursales with a higher scope

// Function to initialize the DataTable for branches
function initializeBranchDataTable() {
    if ($.fn.DataTable.isDataTable('#branchTable')) {
        $('#branchTable').DataTable().clear().destroy();
    }

    $('#branchTable').DataTable({
        "data": sucursales, // Use the sucursales array to populate the DataTable
        "columns": [
            { "data": "id_sucursal" },
            { "data": "nombre" },
            { "data": "calle" },
            { "data": "localidad" },
            { "data": "ciudad" },
            { "data": "codigo_postal" },
            { "data": "telefono" },
            { "data": "horario_apertura" },
            { "data": "horario_cierre" },
            { "data": "latitud" },
            { "data": "longitud" },
            {
                "data": null,
                "render": function(data, type, row) {
                    return `
                        <button class="btn btn-warning btn-sm" onclick="openEditBranchModal(${row.id_sucursal})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteBranch(${row.id_sucursal})">Eliminar</button>
                    `;
                }
            }
        ],
        "paging": true,
        "searching": true,
        "pageLength": 10,
        "language": {
            "url": "https://cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json"
        },
        "order": [],
        "responsive": true,
        "autoWidth": false
    });
}

// Call this function after fetching the branches
async function fetchBranches() {
    try {
        const response = await fetch('../Modelos/crud_sucursal.php', {
            method: 'GET',
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();
        sucursales = data.sucursales;

        const branchList = document.getElementById("branchList");
        branchList.innerHTML = '';

        sucursales.forEach(branch => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${branch.id_sucursal}</td>
                <td>${branch.nombre}</td>
                <td>${branch.calle}</td>
                <td>${branch.localidad}</td>
                <td>${branch.ciudad}</td>
                <td>${branch.codigo_postal}</td>
                <td>${branch.telefono}</td>
                <td>${branch.horario_apertura}</td>
                <td>${branch.horario_cierre}</td>
                <td>${branch.latitud}</td>
                <td>${branch.longitud}</td>
                <td>
                    <button class="btn btn-warning" onclick="openEditBranchModal(${branch.id_sucursal})">Editar</button>
                    <button class="btn btn-danger" onclick="deleteBranch(${branch.id_sucursal})">Eliminar</button>
                </td>
            `;
            branchList.appendChild(row);
        });

        // Initialize or re-initialize the DataTable after fetching branches
        initializeBranchDataTable();

    } catch (error) {
        console.error('Error al cargar las sucursales:', error);
        Swal.fire('Error', 'No se pudieron cargar las sucursales.', 'error');
    }
}


document.getElementById("branchForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const newBranch = {
        branch: {
            nombre: document.getElementById("branchName").value,
            calle: document.getElementById("branchStreet").value,
            localidad: document.getElementById("branchLocality").value,
            ciudad: document.getElementById("branchCity").value,
            codigo_postal: document.getElementById("branchPostalCode").value,
            telefono: document.getElementById("branchPhone").value,
            horario_apertura: document.getElementById("branchOpeningHour").value,
            horario_cierre: document.getElementById("branchClosingHour").value,
            latitud: document.getElementById("branchLatitud").value,
            longitud: document.getElementById("branchLongitud").value
        }
    };

    try {
        const response = await fetch('../modelos/crud_sucursal.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBranch)
        });

        const result = await response.json();
        
        if (result.success) {
            Swal.fire('Éxito', 'Sucursal agregada correctamente', 'success');
            fetchBranches(); // Refresh branches after adding
            $('#addBranchModal').modal('hide');
            document.getElementById("branchForm").reset();
        } else {
            Swal.fire('Error', result.message || 'Error al agregar la sucursal', 'error');
        }
    } catch (error) {
        console.error('Error al agregar la sucursal:', error);
        Swal.fire('Error', 'Ocurrió un error al agregar la sucursal', 'error');
    }
});


// Edit branch submission handling
document.getElementById("editBranchForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const updatedBranch = {
        branch: {
            id_sucursal: document.getElementById("editBranchId").value,
            nombre: document.getElementById("editNombre").value,
            calle: document.getElementById("editCalle").value,
            localidad: document.getElementById("editLocalidad").value,
            ciudad: document.getElementById("editCiudad").value,
            codigo_postal: document.getElementById("editCodigoPostal").value,
            telefono: document.getElementById("editTelefono").value,
            horario_apertura: document.getElementById("editHorarioApertura").value,
            horario_cierre: document.getElementById("editHorarioCierre").value,
            latitud: document.getElementById("editLatitud").value,
            longitud: document.getElementById("editLongitud").value,
        }
    };

    try {
        const response = await fetch('../modelos/crud_sucursal.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedBranch)
        });

        const data = await response.json();
        if (data.success) {
            Swal.fire('Sucursal actualizada!', '', 'success');
            fetchBranches(); // Refresh branches after editing
            $('#editBranchModal').modal('hide');
        } else {
            Swal.fire('Error', data.message, 'error');
        }
    } catch (error) {
        console.error('Error al actualizar la sucursal:', error);
        Swal.fire('Error', 'No se pudo actualizar la sucursal.', 'error');
    }
});

// Open edit modal with branch data
function openEditBranchModal(branchId) {
    const branch = sucursales.find(b => b.id_sucursal === branchId);
    if (branch) {
        document.getElementById("editBranchId").value = branch.id_sucursal;
        document.getElementById("editNombre").value = branch.nombre;
        document.getElementById("editCalle").value = branch.calle;
        document.getElementById("editLocalidad").value = branch.localidad;
        document.getElementById("editCiudad").value = branch.ciudad;
        document.getElementById("editCodigoPostal").value = branch.codigo_postal;
        document.getElementById("editTelefono").value = branch.telefono;
        document.getElementById("editHorarioApertura").value = branch.horario_apertura;
        document.getElementById("editHorarioCierre").value = branch.horario_cierre;
        document.getElementById("editLatitud").value = branch.latitud;
        document.getElementById("editLongitud").value = branch.longitud;

        $('#editBranchModal').modal('show');
    }
}

// Delete branch function
async function deleteBranch(branchId) {
    const confirmed = await Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás recuperar esta sucursal!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (confirmed.isConfirmed) {
        try {
            const response = await fetch('../modelos/crud_sucursal.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id_sucursal: branchId })
            });

            const result = await response.json();
            if (result.success) {
                Swal.fire('Sucursal eliminada!', '', 'success');
                fetchBranches(); // Refresh branches after deletion
            } else {
                Swal.fire('Error', result.message, 'error');
            }
        } catch (error) {
            console.error('Error al eliminar la sucursal:', error);
            Swal.fire('Error', 'No se pudo eliminar la sucursal.', 'error');
        }
    }
}

// Load branches on page load
document.addEventListener("DOMContentLoaded", fetchBranches);
