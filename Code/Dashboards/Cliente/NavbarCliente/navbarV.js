
    // Cargar el navbar y ejecutar la lógica una vez que se complete la carga
    $("#navbar-container").load("../NavbarCliente/navbar.html", function() {
        const hamburger = document.querySelector('.hamburger-menu');
        const navCenter = document.querySelector('.navbar-center');
        const profileButton = document.querySelector('.profile-button');
        const dropdownContent = document.querySelector('.dropdown-content');
        const navbar = document.querySelector('.navbar');
        const navBorder = document.querySelector('.nav-border');

        // Toggle mobile menu
        hamburger.addEventListener('click', function() {
            navCenter.classList.toggle('active');
        });

        // Toggle profile dropdown
        profileButton.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            dropdownContent.style.display = 'none';
        });

        // Prevent dropdown from closing when clicking inside it
        dropdownContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        // Navbar scroll effect
        window.addEventListener('scroll', function() {
            if (window.scrollY > 0) {
                navbar.classList.add('scrolled');
                navBorder.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
                navBorder.classList.remove('scrolled');
            }
        });

        // Set active link
        const currentPage = window.location.pathname;
        document.querySelectorAll('.navbar-link').forEach(link => {
            if (currentPage.includes(link.getAttribute('href').substring(3))) {
                link.classList.add('active');
            }
        });
    });

