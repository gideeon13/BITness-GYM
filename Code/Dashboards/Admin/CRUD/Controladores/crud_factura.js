$(document).ready(function() {
    $('#facturaTable').DataTable({
        "ajax": "../Modelos/crud_factura.php",
        "columns": [
            { "data": "id_factura" },
            { "data": "id_carrito" },
            { "data": "id_suscripcion" },
            { "data": "fecha_emision" },
            { "data": "total" },
            { "data": "fecha_pago" },
            { "data": "metodo_pago" },
            {
                "data": null,
                "render": function(data, type, row) {
                    return `
                        <button class="btn btn-primary btn-sm" onclick="descargarPDF(${row.id_factura})"><i class="fas fa-file-download"></i></button>
                        <button class="btn btn-secondary btn-sm" onclick="imprimirPDF(${row.id_factura})"><i class="fas fa-print"></i></button>
                    `;
                }
            }
        ],
        "language": {
            "url": "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json"
        },
        "paging": true,
        "searching": true
    });
});

// Función para descargar el archivo PDF
function descargarPDF(id_factura) {
    window.location.href = `../Modelos/crud_factura.php?action=descargar&id_factura=${id_factura}`;
}

// Función para abrir el archivo PDF en una nueva ventana para impresión
function imprimirPDF(id_factura) {
    window.open(`../Modelos/crud_factura.php?action=imprimir&id_factura=${id_factura}`, '_blank');
}
