$(document).ready(function() {

    // Función para validar el nombre de usuario (entre 4 y 20 caracteres, solo letras, números y guiones bajos)
    function isValidUsername(username) {
        var usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
        return usernameRegex.test(username);
    }

    // Función para validar el correo electrónico
    function isValidEmail(email) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return emailRegex.test(email);
    }

    // Función para validar la contraseña (mínimo 8 caracteres y al menos un número)
    function isValidPassword(password) {
        var passwordRegex = /^(?=.*[0-9]).{8,}$/;
        return passwordRegex.test(password);
    }

    // Función para habilitar o deshabilitar el botón
    function toggleSubmitButton(email, password) {
        var isValidForm = 
        isValidUsername($('input[name="nombre_usuario"]').val()) &&
        isValidEmail($('input[id="Correo"]').val()) &&
        isValidPassword($('#input-registro-pwrd').val()) &&
        $('#input-registro-pwrd').val() === $('#ConfirmarC').val();
                        
        
        if (isValidForm) {
            $('#registrarse-boton').removeAttr('disabled');
            $('#registrarse-boton').css('cursor', 'pointer');
            $('#registrarse-boton').css('opacity', '1');
        } else {
            $('#registrarse-boton').attr('disabled', 'disabled');
            $('#registrarse-boton').css('cursor', 'not-allowed');
            $('#registrarse-boton').css('opacity', '0.5');
        }
    }

    // Validar nombre de usuario
    $('input[name="nombre_usuario"]').on('focusout input', function() {
        var username = $(this).val();
        if (!isValidUsername(username)) {
            $(".NombreUserError").text("El nombre de usuario debe tener entre 4 y 20 caracteres y solo puede contener letras, números y guiones bajos.").css("visibility", "visible");
            $(this).css("border", "2px solid red");
        } else {
            $(".NombreUserError").css("visibility", "hidden");
            $(this).css("border", "2px solid green");
        }
        toggleSubmitButton();
    });

    // Validar correo electrónico
    $('input[name="correo"]').on('focusout input', function () {
        var email = $(this).val();
        var errorElement = $(".EmailError");

        if (!isValidEmail(email)) {
            errorElement.text("Por favor ingresa un correo válido.").css("visibility", "visible");
            $(this).css("border", "2px solid red");
        } else {
            errorElement.css("visibility", "hidden");
            $(this).css("border", "2px solid green");
        }

        toggleSubmitButton();
    });

    // Validar contraseña
    $('input[name="contrasena"]').on('focusout input', function () {
        var password = $(this).val();
        var errorElement = $(".PasswordError");

        if (password.length === 0) {
            errorElement.text("La contraseña es requerida.").css("visibility", "visible");
            $(this).css("border", "2px solid red");
        } else if (!isValidPassword(password)) {
            errorElement.text("La contraseña debe tener al menos 8 caracteres y un número.")
                    .css("visibility", "visible");
            $(this).css("border", "2px solid red");
        } else {
            errorElement.css("visibility", "hidden");
            $(this).css("border", "2px solid green");
        }

        toggleSubmitButton();
    });


    // Validar confirmación de contraseña
    $('#ConfirmarC, input[name="contrasena"]').on('focusout input', function () {
        var confirmPassword = $('#ConfirmarC').val();
        var password = $('#input-registro-pwrd').val();
        var errorElement = $(".ConfirmPasswordError");

        if (confirmPassword === password) {
            errorElement.css("visibility", "hidden");
            $('#ConfirmarC').css("border", "2px solid green");
        } else {
            errorElement.text("Las contraseñas no coinciden.").css("visibility", "visible");
            $('#ConfirmarC').css("border", "2px solid red");
        }

        toggleSubmitButton();
    });


    // Resetear el error cuando el usuario empieza a escribir
    $('input').on('input', function() {
        $(this).next('.error-message').css('visibility', 'hidden');
        $(this).css("border-bottom", "2px solid green");
    });

    // Inicialmente deshabilitar el botón de registro
    
    $('#registrarse-boton').attr('disabled', 'disabled');
    $('#registrarse-boton').css('cursor', 'not-allowed');
    $('#registrarse-boton').css('opacity', '0.5');
});
