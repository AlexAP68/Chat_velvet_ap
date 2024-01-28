const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('appCommunication', {
    sendMessageIPC: (data) => {
        ipcRenderer.send('enviar_datos', data);
    },

    receiveMessageIPC: (callback) => {
        ipcRenderer.on('send-ip', (event, messages) => {
            console.log("Funciona");
            callback(messages);
        });
    },

    sendMessage: (data) => {
        ipcRenderer.send('send-message', data);
        // Aquí manejas los datos recibidos
        console.log(data);
    },

    receiveMessage: (callback) => {
        console.log('INITIALIZADO!')
        ipcRenderer.on('receive-message-server', (event, message) => {
            console.log("hola");
            callback(message);
        });
    },


    // Método para cargar mensajes desde el archivo
    loadMessages: async () => {
        return ipcRenderer.invoke('load-messages');
    },


});
