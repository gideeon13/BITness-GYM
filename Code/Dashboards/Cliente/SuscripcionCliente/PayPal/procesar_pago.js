document.addEventListener('DOMContentLoaded', function() {
    let plan_id = ""; // Valor por defecto

    function loadPaypalScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => resolve();
            script.onerror = (error) => reject(error);
            document.head.appendChild(script);
        });
    }

    const paypal_sdk_url = "https://www.paypal.com/sdk/js";
    const client_id = "Adn7jJOtUQpG45ctKq98nPFbVApSwZzeyiFZ8P5xuISw8efH0gshGhz_E3kEkuHrK1_fwG1zScvUhiuU";
    const currency = "USD";
    const intent = "subscription";

    // Cargar el SDK de PayPal
    loadPaypalScript(paypal_sdk_url + "?client-id=" + client_id + "&vault=true&currency=" + currency + "&intent=" + intent)
    .then(() => {
        const loadingElement = document.getElementById("loading");
        const contentElement = document.getElementById("content");

        if (loadingElement) {
            loadingElement.classList.add("hide");
        }
        if (contentElement) {
            contentElement.classList.remove("hide");
        }

        // Renderizar los botones de PayPal para suscripciones
        paypal.Buttons({
            style: {
                shape: 'rect',
                color: 'gold',
                layout: 'vertical',
                label: 'paypal'
            },
            createSubscription: function(data, actions) {
                // Usar el `plan_id` dinámico
                return actions.subscription.create({
                    'plan_id': plan_id
                });
            },
            onApprove: function(data, actions) {
                alert('Subscription completed with ID: ' + data.subscriptionID);
                
                // Emitir un evento personalizado
                const event = new CustomEvent('subscriptionSuccess', {
                    detail: {
                        subscriptionID: data.subscriptionID
                    }
                });
                window.dispatchEvent(event); // Despachar el evento            
            },
            onError: function(err) {
                console.error('Error during the subscription process:', err);
            }
        }).render('#payment_options');
    })
    .catch((error) => {
        console.error('Error loading PayPal SDK:', error);
    });

    // Escuchar cambios en selectedPlanID desde el otro archivo
    window.addEventListener('selectedPlanIDChanged', (event) => {
        plan_id = event.detail.newPlanID; // Actualizar el plan_id cuando cambie
        console.log('Nuevo Plan ID recibido:', plan_id);
    });
});


