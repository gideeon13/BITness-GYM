$(document).ready(function () {
    var modal = $('#modal');
    var modalBody = $('#modalBody');
    
    // Carga el contenido de formularioV.html cuando se inicie el script
    modalBody.load('../../Users/formularioV.html', function() {
        modal.hide(); // Asegúrate de que el modal esté oculto inicialmente
        
        // Abre el modal al hacer clic en el botón
        $('#navbar-container').on('click', '#btn-registro', function() {
            modal.show();

        
        // Cierra el modal si el usuario hace clic fuera del contenido del modal
        $(window).on('click', function(event) {
            if ($(event.target).is(modal)) {
                modal.hide();
            }
        });
    
            let contenedorForms = document.querySelector(".contenedor-form");
            let formLogin = document.querySelector(".log-form");
            let formRegister = document.querySelector(".registro-form");
            let mensajeToReg = document.querySelector(".mensaje-ir-registro");
            let mensajeToLog = document.querySelector(".mensaje-ir-login");

            // Verifica que los elementos existan antes de manipularlos
            if (formLogin && formRegister && mensajeToReg && mensajeToLog && contenedorForms) {
                let anchoPagina = () => {
                    if (window.innerWidth > 850) {
                        mensajeToLog.style.display = "block";
                        mensajeToReg.style.display = "block";
                    } else {
                        mensajeToReg.style.display = "block";
                        mensajeToReg.style.opacity = "1";
                        mensajeToLog.style.display = "none";    
                        formLogin.style.display = "block";
                        formRegister.style.display = "none";
                        contenedorForms.style.left = "0px";
                    }
                };

                let toLogin = () => {
                    if (window.innerWidth > 850) {
                        formRegister.style.display = "none";
                        contenedorForms.style.left = "0px";
                        formLogin.style.display = "block";
                        mensajeToReg.style.opacity = "1";
                        mensajeToLog.style.opacity = "0";
                    } else {
                        formRegister.style.display = "none";
                        contenedorForms.style.left = "0px";
                        formLogin.style.display = "block";
                        mensajeToReg.style.display = "block";
                        mensajeToLog.style.display = "none";
                    }
                };

                let toRegister = () => {
                    if (window.innerWidth > 850) {
                        formRegister.style.display = "block";
                        contenedorForms.style.left = "410px";
                        formLogin.style.display = "none";
                        mensajeToReg.style.opacity = "0";
                        mensajeToLog.style.opacity = "1";
                    } else {
                        formRegister.style.display = "block";
                        contenedorForms.style.left = "0px";
                        formLogin.style.display = "none";
                        mensajeToReg.style.display = "none";
                        mensajeToLog.style.display = "block";
                    }
                };

                let events = () => {
                    document.querySelector("#btn-ir-login").addEventListener("click", toLogin);
                    document.querySelector("#btn-ir-registro").addEventListener("click", toRegister);
                    window.addEventListener("resize", anchoPagina);
                };

                events();
                anchoPagina();

            }
        });

          // Mostrar/Ocultar contraseña para Login
          const toggleLoginPassword = document.getElementById('toggleLoginPassword');
          const loginPasswordInput = document.getElementById('login-password');
          toggleLoginPassword.addEventListener('click', () => {
              const type = loginPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
              loginPasswordInput.setAttribute('type', type);
              toggleLoginPassword.querySelector('i').classList.toggle('fa-eye');
              toggleLoginPassword.querySelector('i').classList.toggle('fa-eye-slash');
          });

          // Mostrar/Ocultar contraseña para Registro
          const toggleRegistroPassword = document.getElementById('toggleRegistroPassword');
          const registroPasswordInput = document.getElementById('input-registro-pwrd');
          toggleRegistroPassword.addEventListener('click', () => {
              const type = registroPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
              registroPasswordInput.setAttribute('type', type);
              toggleRegistroPassword.querySelector('i').classList.toggle('fa-eye');
              toggleRegistroPassword.querySelector('i').classList.toggle('fa-eye-slash');
          });
    });
});
