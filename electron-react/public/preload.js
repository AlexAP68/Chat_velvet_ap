const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('appCommunication', {
    sendMessageIPC:(data) => {
        ipcRenderer.send('enviar_datos', data);
    },

    receiveMessageIPC: (callback) => {
        ipcRenderer.on('send-ip', (event,messages) =>{
            console.log("funciona");
            callback(messages);
        });
    },

    sendMessage:(data) =>{
        ipcRenderer.send('send-message', data);
            // Aquí manejas los datos recibidos
            console.log(data);


    },


    receiveMessage: (callback) => {
        ipcRenderer.on('receive-message-server', (event, message) => {
            console.log("hola");
            callback(message);
        });
    }
});