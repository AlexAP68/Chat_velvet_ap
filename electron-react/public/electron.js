const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const os = require('os');
const path = require('path');
let mainWindow;
const isDev = require('electron-is-dev');
const {initializeApp} = require('firebase/app');
const {getDatabase, ref, set} = require('firebase/database');
const express = require('express');
const expressApp = express();
const fs = require('fs');

const messagesFilePath = path.join(app.getPath('userData'), 'messages.json');

//configura el firebase
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


//crea la ventana
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1900, height: 1080,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.setMenu(null);
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



//consigue la dirrecion ip del usuario
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
    const {userName, ipAddress, lastConnection, statusOnline} = data;

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

    // Crear un objeto con la información necesaria para enviar
    const mensajeParaEnviar = {
        userName: "alexalameda",
        message: message,
    };

    // Enviar el mensaje al destinatario usando su IP
    enviarMensaje(ip, mensajeParaEnviar)
        .then(() => {
            console.log("Mensaje enviado con éxito a:", ip);
        })
        .catch((error) => {
            console.error("Error al enviar mensaje a:", ip, error);
        });

    // Guardar el mensaje en el archivo
    const currentMessages = loadMessages();
    currentMessages.push(mensajeParaEnviar);
    saveMessages(currentMessages);
});



expressApp.use(express.json());

//recibe los mensajes de otros usuarios
expressApp.post('/chat', (req, res) => {
    const mensajeRecibido = req.body;
    console.log('Mensaje recibido en Express:', mensajeRecibido);

    if (!(req.body && req.body.userName && req.body.message && req.body.message.length > 0)) {
        res.status(400).send('Mensaje vacio. SPAM');
        return;
    }

    // Envía el mensaje al proceso de renderizado
    if (mainWindow && !mainWindow.isDestroyed()) {
        console.log('Enviando mensaje al proceso de renderizado...');
        mainWindow.webContents.send('receive-message-server', mensajeRecibido);
    } else {
        console.log('La ventana no está disponible para enviar el mensaje.');
    }

    res.status(200).send('Mensaje recibido y procesado');
})

//envia el mensaje a otros usuarios
const enviarMensaje = async (destinatarioIP, mensaje) => {
    try {
        const response = await fetch(`http://${destinatarioIP}:4000/chat`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(mensaje),
        });
        const respuesta = await response.text();
        console.log('Respuesta del servidor:', respuesta);
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
    }
};

//carga los mensajes
function loadMessages() {
    if (fs.existsSync(messagesFilePath)) {
        try {
            const data = fs.readFileSync(messagesFilePath);
            return JSON.parse(data);
        } catch (error) {
            console.error('Error al cargar los mensajes:', error);
            return [];
        }
    } else {
        // Si no existe el archivo, retorna un array vacío
        return [];
    }
}

//guarda mensajes
function saveMessages(messages) {
    try {
        fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));
        console.log('Mensajes guardados correctamente.');
    } catch (error) {
        console.error('Error al guardar los mensajes:', error);
    }
}

// IPC para cargar mensajes
ipcMain.handle('load-messages', async (event) => {
    return loadMessages();
});

// IPC para guardar mensajes
ipcMain.on('save-messages', (event, messages) => {
    saveMessages(messages);
});


