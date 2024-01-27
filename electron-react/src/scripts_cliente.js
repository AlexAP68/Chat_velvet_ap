

const username = "alexalameda";


const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');
const themeToggle = document.getElementById('themeToggle');
const fileInput = document.getElementById('fileInput');


function openTab(tabName) {
    // Oculta todas las pestañas
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Muestra la pestaña seleccionada
    const activeTab = document.getElementById(tabName);
    activeTab.classList.add('active');
}

document.addEventListener('DOMContentLoaded', function () {
    // Obtén referencia a los radio buttons y al elemento del chat
    var backgroundRadios = document.querySelectorAll('input[name="background"]');
    var chatElement = document.getElementById('cuerpo_mensaje'); // Ajusta 'chat' al ID real de tu elemento de chat
    var perfilElement = document.querySelector('.perfil'); // Ajusta '.perfil' al selector real de tu elemento de perfil
    var bodyElement = document.body;

    // Agrega un evento de cambio a cada radio button
    backgroundRadios.forEach(function (radio) {
        radio.addEventListener('change', function () {
            // Verifica cuál radio button está seleccionado y cambia el fondo del chat
            if (radio.checked) {
                var backgroundImage = 'url("resources/' + radio.value + '")';
                chatElement.style.backgroundImage = backgroundImage;

                // Cambia el color de fondo de '.perfil' basado en el radio button seleccionado
                cambiarColorFondoPerfil(radio.value);
            }
        });
    });

    // Función para cambiar el color de fondo de '.perfil' según el radio button seleccionado
    function cambiarColorFondoPerfil(radioValue) {
        // Puedes definir lógica personalizada para asignar colores a los diferentes radio buttons
        // En este ejemplo, asignaremos colores específicos para cada radio button
        switch (radioValue) {
            case 'Fondo_chat.webp':
                perfilElement.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // Rojo con transparencia
                bodyElement.style.color = '#ffffff'; // Texto en color blanco
                break;
            case 'fondo_amarillo.jpg':
                perfilElement.style.backgroundColor = 'rgba(255, 255, 0, 0.5)'; // Amarillo con transparencia
                bodyElement.style.color = '#000000'; // Texto en color negro
                break;
            case 'fondo_azul.png':
                perfilElement.style.backgroundColor = 'rgba(0, 0, 255, 0.5)'; // Azul con transparencia
                bodyElement.style.color = '#000000'; // Texto en color blanco
                break;
            // Agrega más casos según sea necesario
            default:
                perfilElement.style.backgroundColor = 'transparent'; // Color de fondo predeterminado si no coincide con ningún caso
                bodyElement.style.color = '#ffffff'; // Texto en color negro (puedes ajustar este color según tus preferencias)
        }
    }

});

var chain = $("#chains")[0];
$(".img-wrapper").mouseenter(function() {
    chain.currentTime = 0;
    chain.play();
});
