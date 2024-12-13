
// cargar el navbar en el contenedor
$(document).ready(() => {
    // Cargar el navbar y ejecutar la lógica una vez que se complete la carga
    $("#navbar-container").load("../Navbar/navbar.html", function() {
        const activePage = window.location.pathname;
       
        $('.navbar-links').each(function() {
            const linkPath = $(this).attr('href'); // Usar $(this) para el elemento actual
    

            // Comparar correctamente la ruta activa con el href del enlace
            if (activePage.includes(linkPath.substring(3))) {
                $('.navbar-links').removeClass('active'); // Eliminar la clase de todos los enlaces
                $(this).addClass('active'); // Añadir la clase solo al enlace correspondiente
            }
        });
    });
});



// navbar scrolled
$(window).on("scroll", () => {


    if (window.scrollY > 0) {
        $(".navbar").addClass("scrolled");
        $(".navbar-links").addClass("scrolled");
        $(".nav-border").addClass("scrolled");

    } else {
        $(".navbar").removeClass("scrolled");
        $(".navbar-links").removeClass("scrolled");
        $(".nav-border").removeClass("scrolled");
    }
  });





