const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const os = require('os');
const path = require('path');
let mainWindow;
const isDev = require('electron-is-dev');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');
const express = require('express');
const expressApp = express();


const firebaseConfig = {
    apiKey: "AIzaSyAX8KL8YK6GlX8s3lrF-0bD-9XPb83jjhc",
    authDomain: "spdvi-chat.firebaseapp.com",
    databaseURL: "https://spdvi-chat-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "spdvi-chat",
    storageBucket: "spdvi-chat.appspot.com",
    messagingSenderId: "172167655749",
    appId: "1:172167655749:web:363d8a6c63665c821bce2c",
    measurementId: "G-QE4X77N1WC"
};
const bd = initializeApp(firebaseConfig);
const db = getDatabase(bd);

function createWindow() {
    mainWindow = new BrowserWindow({ width: 900, height: 680,
    webPreferences:{
        preload: path.join(__dirname, 'preload.js')
    }});
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);


    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    // Enviar la dirección IP a la ventana de renderizado cuando esté lista
    mainWindow.webContents.on('did-finish-load', () => {
        const ip = getIPAddress();
        mainWindow.webContents.send('send-ip', ip);
    });

    mainWindow.on('closed', () => mainWindow = null);



}

app.on('ready', () => {
    createWindow();
    // Inicia el servidor Express cuando la ventana esté lista
    const PORT = 4000;
    expressApp.listen(PORT, () => {
        console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
    });




});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();

    }


});


function getIPAddress() {
    const interfaces = os.networkInterfaces();
    let ipAddress = '';

    Object.keys(interfaces).forEach((iface) => {
        interfaces[iface].forEach((ifaceInfo) => {
            if (ifaceInfo.family === 'IPv4' && !ifaceInfo.internal) {
                ipAddress = ifaceInfo.address;
            }
        });
    });

    console.log(ipAddress)

    return ipAddress;
}

ipcMain.on('enviar_datos', (event, data) => {
    const { userName, ipAddress, lastConnection, statusOnline } = data;

    console.log(userName);
    console.log(ipAddress);
    console.log(lastConnection);
    console.log(statusOnline);

   set(ref(db, 'chatUsers/' + userName), {
        ip: ipAddress,
        lastConnectionTime: lastConnection,
        status: statusOnline
    })
        .then(() => {
            console.log("Se ha completado el registro!!");
        })
        .catch((error) => {
            console.log(error);
        });
});

ipcMain.on('send-message', (event, data) => {
    console.log("Mensaje recibido en el proceso principal:", data);

    // Extraer información del mensaje
    const { userName, message, ip } = data;

    console.log("hola");
    console.log(userName);
    console.log(message);

    // Crear un objeto con la información necesaria para enviar
    const mensajeParaEnviar = {
        userName: userName, // El nombre del usuario que envía el mensaje
        message: message, // El mensaje a enviar
    };

    // Enviar el mensaje al destinatario usando su IP
    enviarMensaje(ip, mensajeParaEnviar)
        .then(() => {
            console.log("Mensaje enviado con éxito a:", ip);
        })
        .catch((error) => {
            console.error("Error al enviar mensaje a:", ip, error);
        });
});


expressApp.use(express.json());

expressApp.post('/chat', (req, res) => {
    const mensajeRecibido = req.body;
    console.log('Mensaje recibido en Express:', mensajeRecibido);

    const {userName, message } = mensajeRecibido;

    // Suponiendo que mensajeRecibido es un objeto con al menos las propiedades 'sender' y 'text'
    const mensajeParaEnviar = {
        userName: userName,
        message: message
    };

    // Envía el mensaje al proceso de renderizado
    if (mainWindow && !mainWindow.isDestroyed()) {
        console.log('Enviando mensaje al proceso de renderizado...');
        mainWindow.webContents.send('receive-message-server', mensajeParaEnviar);
    } else {
        console.log('La ventana no está disponible para enviar el mensaje.');
    }

    res.status(200).send('Mensaje recibido y procesado');
});

const enviarMensaje = async (destinatarioIP, mensaje) => {
    try {
        const response = await fetch(`http://${destinatarioIP}:4000/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mensaje),
        });
        const respuesta = await response.text();
        console.log('Respuesta del servidor:', respuesta);
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
    }
};

