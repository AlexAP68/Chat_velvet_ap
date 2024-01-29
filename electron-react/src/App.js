import React, {useState, useEffect} from 'react';
import {getDatabase, ref, onValue} from 'firebase/database';
import {initializeApp} from 'firebase/app';
import './App.css';
import image1 from './perfil/ann.jpg';
import image2 from './perfil/koromaru.jpg';
import image3 from './perfil/Morgana.jpg';
import image4 from './perfil/ryu.jpg';
import image5 from './perfil/tedie.jpg';


//configura la base de datos
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


const imagesArray = [image1, image2, image3, image4, image5];

//coge una imagen Random
const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * imagesArray.length);
    return imagesArray[randomIndex];
};


const App = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [activeTab, setActiveTab] = useState('chatList');
    const [background, setBackground] = useState('url("resources/Fondo_chat.webp")');
    const [inputValue, setInputValue] = useState('');
    const [fecha, setFecha] = useState('');
    const [hora, setHora] = useState('');
    const [ipAddress, setIpAddress] = useState('');
    const [usersData, setUsersData] = useState({});
    const [selectedUserName, setSelectedUserName] = useState(null);
    const [selectedUserInfo, setSelectedUserInfo] = useState(null);
    const [userImages, setUserImages] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chats, setChats] = useState({});

    //trata los mensajes
    const handleMessage = (receivedMessage) => {
        // Asegúrate de que receivedMessage tiene las propiedades necesarias
        if (receivedMessage && receivedMessage.message !== undefined && receivedMessage.userName !== undefined) {
            const newMessage = {
                text: receivedMessage.message,
                sender: receivedMessage.userName,
                direction: 'received',
            };
            addMessageToChat(receivedMessage.userName, newMessage);
        } else {
            console.error('El mensaje recibido no tiene la estructura esperada:', receivedMessage);
        }
    };

    useEffect(() => {
        // Cargar mensajes guardados al iniciar la app
        window.appCommunication.loadMessages().then(loadedMessages => {
            setMessages(loadedMessages);
        });
    }, []);

    //guarda los chats
    useEffect(() => {
        const savedChats = localStorage.getItem('chats');
        if (savedChats) {
            setChats(JSON.parse(savedChats));
        }
    }, []);


    useEffect(() => {
        // Configura el listener para los mensajes entrantes
        window.appCommunication.receiveMessage(handleMessage);

    }, []);

    useEffect(() => {
        //coge todos los usuarios
        const db = getDatabase();
        const usersRef = ref(db, 'chatUsers');

        const unsubscribe = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            setUsersData(data);
            console.log(data);

            // Asignar una imagen aleatoria a cada usuario
            const newImages = {};
            Object.keys(data).forEach((username) => {
                newImages[username] = getRandomImage();
            });
            setUserImages(newImages);
        });

        return () => unsubscribe();
    }, []);


    useEffect(() => {
        if (selectedUserName) {
            const userInfo = usersData[selectedUserName];
            if (userInfo) {
                setSelectedUserInfo({
                    username: selectedUserName,
                    ip: userInfo.ip,
                    status: userInfo.status ? 'Online' : `Última vez: ${formatDate2(userInfo.lastConnectionTime.date, userInfo.lastConnectionTime.time)}`,
                });
                console.log(`Información del usuario seleccionado: ${JSON.stringify(userInfo)}`);
            }
        }
    }, [selectedUserName, usersData]);


    useEffect(() => {
        const handleReceiveMessage = (message) => {
            setIpAddress(message);
        };

        if (window.appCommunication) {
            window.appCommunication.receiveMessageIPC(handleReceiveMessage);
        }

    }, []);

    //recibe la ip
    useEffect(() => {
        if (ipAddress) {
            console.log(ipAddress); // IP obtenida correctamente
        } else {
            console.log("La dirección IP es null o está vacía");
        }
    }, [ipAddress]);




    //La funcion de cambiar tema y actualiza fecha y hora
    useEffect(() => {
            obtenerFechaYHoraActual();

            // Obtén referencia a los radio buttons y al elemento del chat
            const backgroundRadios = document.querySelectorAll('input[name="background"]');
            const chatElement = document.getElementById('cuerpo_mensaje'); // Ajusta 'chat' al ID real de tu elemento de chat
            const perfilElement = document.querySelector('.perfil'); // Ajusta '.perfil' al selector real de tu elemento de perfil
            const bodyElement = document.body;


            // Agrega un evento de cambio a cada radio button
            backgroundRadios.forEach((radio) => {
                radio.addEventListener('change', () => {
                    // Verifica cuál radio button está seleccionado y cambia el fondo del chat
                    let backgroundImage = "";
                    if (radio.checked) {
                        backgroundImage = `url("resources/${radio.value}")`;
                        chatElement.style.backgroundImage = backgroundImage;

                        // Cambia el color de fondo de '.perfil' basado en el radio button seleccionado
                        cambiarColorFondoPerfil(radio.value);
                    } else {
                        backgroundImage = `url("resources/Fondo_chat.webp")`;
                        chatElement.style.backgroundImage = backgroundImage;

                        // Cambia el color de fondo de '.perfil' basado en el radio button seleccionado
                        cambiarColorFondoPerfil('Fondo_chat.webp');
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


        },
        []);




    const handleUserClick = (username) => {
        setSelectedUserName(username);
        const userInfo = usersData[username];
        setSelectedUserInfo({
            username: selectedUserName,
            ip: userInfo.ip,
            status: userInfo.status ? 'Online' : `Última vez: ${formatDate2(userInfo.lastConnectionTime.date, userInfo.lastConnectionTime.time)}`,

        });

        const image = userImages[username];
        setSelectedUser({name: username, image: image});
    };

    //añade mensaje al chat
    const addMessageToChat = (username, message) => {
        setChats(prevChats => {
            const updatedChat = prevChats[username] ? [...prevChats[username], message] : [message];
            const newChats = { ...prevChats, [username]: updatedChat };

            // Guardar en localStorage
            localStorage.setItem('chats', JSON.stringify(newChats));

            return newChats;
        });
    };


    //envia los mensajes
    const sendMessage = () => {
        const messageToSend = inputValue.trim();
        if (messageToSend === '' || !selectedUserName) return;

        const newMessage = {
            sender: "alexalameda", // Tu nombre de usuario
            text: messageToSend,
            direction: "sent",
        };

        addMessageToChat(selectedUserName, newMessage);
        setInputValue('');

        // Envía el mensaje al proceso principal
        const data = {
            userName: "alexalameda",
            message: messageToSend,
            ip: usersData[selectedUserName].ip,
        };
        window.appCommunication.sendMessage(data);
    };

    //la forma del mensaje
    const MessageBubble = ({ message }) => {
        const bubbleClass = message.direction === 'sent' ? 'message-sent' : 'message-received';
        return (
            <div className={`message-bubble ${bubbleClass}`}>
                <div className="message-user">{message.sender}</div>
                <div className="message-text">{message.text}</div>
            </div>
        );
    };




    //cambia de pestañas
    function openTab(tabName) {
        // Oculta todas las pestañas
        const tabs = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => tab.classList.remove('active'));

        // Muestra la pestaña seleccionada
        const activeTab = document.getElementById(tabName);
        activeTab.classList.add('active');


    }

    //Enter para enviar mensajes
    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && inputValue.trim() !== '') {
            sendMessage();
        }
    };

//formulario para actualizar los datos(muy importante al principio)
    function ButtonPage({ipAddress}) {
        const getValuesForm = () => {
            const userName = "alexalameda";
            const dateElement = document.getElementById('date');
            const timeElement = document.getElementById('time');
            const statusOnlineElement = document.getElementById("userOnline");

            console.log(userName);
            console.log(dateElement);
            console.log(timeElement);
            console.log(statusOnlineElement);
            console.log(ipAddress);

            if (!userName || !dateElement || !timeElement || !statusOnlineElement) {
                console.error("Uno o más elementos del formulario no se encuentran.");
                return; // Salir de la función si algún elemento no se encuentra
            }


            const dateConnection = dateElement.value;
            const timeConnection = timeElement.value;
            const statusOnline = statusOnlineElement.checked;

            const lastConnection = {
                date: dateConnection,
                time: timeConnection
            };

            const data2 = {
                userName,
                ipAddress,
                lastConnection,
                statusOnline
            };

            console.log(data2);

            window.appCommunication.sendMessageIPC(data2);
        }

        return <button type="submit" onClick={getValuesForm}>Enviar</button>;
    }


    // obtenerFechaYHoraActual
    const obtenerFechaYHoraActual = () => {
        const ahora = new Date();

        // Formatear la fecha en formato YYYY-MM-DD
        const fechaActual = ahora.toISOString().split('T')[0];

        // Formatear la hora en formato HH:mm
        const horaActual = ahora.toTimeString().split(' ')[0];

        setFecha(fechaActual);
        setHora(horaActual);
    };


    const selectedUserData = selectedUserName ? usersData[selectedUserName] : null;

    // Componente para renderizar cada item de la lista de chats


    const ChatItem = ({username, userData, onUserClick}) => {
        // Usa la imagen del estado userImages
        const userImage = userImages[username];

        return (
            <li
                className={`chat-item ${userData.status ? 'online' : 'offline'}`}
                onClick={() => onUserClick(username)}
            >
                <img src={userImage} alt={username} className="user-photo"/>
                <div className="chat-info">
                    <h3 className="chat-user">{username}</h3>
                    <p className="chat-status">
                        {userData.status ? 'Online' : `Última vez: ${userData.lastConnectionTime?.date ?? 'fecha desconocida'} ${userData.lastConnectionTime?.time ?? 'hora desconocida'}`}

                    </p>
                </div>
            </li>
        );
    };


    // Lista de chats basada en los datos de los usuarios
    const formatDate2 = (date, time) => {
        // Formatear la fecha y la hora como prefieras
        return `${date} ${time}`;
    };

    const chatListItems = Object.keys(usersData).map((username) => (
        <ChatItem
            key={username}
            username={username}
            userData={usersData[username]}
            onUserClick={handleUserClick}
        />
    ));


    return (
        <div>
            <section>
                <div className={`contenido_tab ${darkMode ? 'dark-theme' : ''}`}>
                    <div className="tabs">
                        <a className="link-wrapper Chat" onClick={() => openTab("chatList")}>

                            <span className="fallback">Chat</span>
                            <div className="img-wrapper">
                                <img className="normal" src="/resources/chat2.png" alt={"no funciona"}/>
                                <img className="active" src="/resources/chat22.png" alt={"no funciona"}/>
                            </div>
                            <div className="shape-wrapper">
                                <div className="shape red-fill jelly">
                                    <svg x="6px" y="6px"
                                         viewBox="0 0 108.1 47" enableBackground="new 0 0 108.1 47">
                                        <polygon fill="#FF0000" points="19.5,0,110.7,0,80.1,32.7,3.1,47 "/>
                                    </svg>
                                </div>
                                <div className="shape cyan-fill jelly">
                                    <svg x="0px" y="0px"
                                         viewBox="0 0 108.1 47" enableBackground="new 0 0 108.1 47">
                                        <polygon fill="#00FFFF" points="11,3,85.1,0 118.8,45.6,14.3,29 "/>
                                    </svg>
                                </div>
                            </div>
                        </a>
                        <a className="link-wrapper Config" onClick={() => openTab("config")}>
                            <span className="fallback">Chat</span>
                            <div className="img-wrapper">
                                <img className="normal" src="/resources/cinfiguracion2.png" alt={"no funciona"}/>
                                <img className="active" src="/resources/configuracion12.png" alt={"no funciona"}/>
                            </div>
                            <div className="shape-wrapper">
                                <div className="shape red-fill jelly">
                                    <svg x="6px" y="6px"
                                         viewBox="0 0 108.1 47" enableBackground="new 0 0 108.1 47">
                                        <polygon fill="#FF0000" points="19.5,0,110.7,0,80.1,32.7,3.1,47 "/>
                                    </svg>
                                </div>
                                <div className="shape cyan-fill jelly">
                                    <svg x="0px" y="0px"
                                         viewBox="0 0 108.1 47" enableBackground="new 0 0 108.1 47">
                                        <polygon fill="#00FFFF" points="11,3,85.1,0 118.8,45.6,14.3,29 "/>
                                    </svg>
                                </div>
                            </div>
                        </a>
                    </div>

                    <div id="chatList" className="tab-content">
                        <h2>Chat List</h2>
                        <ul id={"lista"}>{chatListItems}</ul>
                    </div>

                    <div id="config" className="tab-content">
                        <div className={'sesion'}>
                            <h2>Configuration</h2>

                            <label htmlFor="ipInput">IP:</label>
                            <input type="text" id="ipInput" placeholder="Enter IP" value={ipAddress} readOnly/>


                            <div id={"tiempo"}>
                                <label htmlFor="date">Ultima Fecha:</label>
                                <input type="text" id="date" value={fecha} readOnly/>

                                <label htmlFor="time">Ultima Hora:</label>
                                <input type="text" id="time" value={hora} readOnly/>
                            </div>

                            <label htmlFor="userOnline">Online:</label>
                            <input type="checkbox" id="userOnline"/>

                            <ButtonPage ipAddress={ipAddress}/>
                        </div>

                        <h3>Chat Background</h3>

                        <label>
                            <input type="radio" name="background" value="Fondo_chat.webp" id="background1"/>
                            <img src="/resources/Fondo_chat.webp" alt="Background 1 Preview" width="50" height="50"/>
                            Background 1
                        </label>

                        <label>
                            <input type="radio" name="background" value="fondo_amarillo.jpg" id="background2"/>
                            <img src="/resources/fondo_amarillo.jpg" alt="Background 2 Preview" width="50" height="50"/>
                            Background 2
                        </label>

                        <label>
                            <input type="radio" name="background" value="fondo_azul.png" id="background3"/>
                            <img src="/resources/fondo_azul.png" alt="Background 3 Preview" width="50" height="50"/>
                            Background 3
                        </label>
                    </div>
                </div>
                <div id="cuerpo_mensaje">
                    <div className="perfil">
                        {selectedUser && (
                            <>
                                <img src={selectedUser.image} alt="Perfil"/>
                            </>
                        )}
                        <div id="informacion">
                            <h2>{selectedUserData ? selectedUserName : 'Selecciona un usuario'}</h2>
                            {selectedUserData && (
                                <>
                                    <p>IP: {selectedUserData.ip}</p>
                                    <p>
                                        {selectedUserData.status
                                            ? 'Online'
                                            : `Última conexión: ${selectedUserData.lastConnectionTime.date} ${selectedUserData.lastConnectionTime.time}`}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                    <div id="messages">
                        {selectedUserName && chats[selectedUserName] && chats[selectedUserName].map((message, index) => (
                            <MessageBubble key={index} message={message} />
                        ))}
                    </div>



                    <div id="form">
                        <input
                            id="input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            autoComplete="off"
                            autoFocus
                            onKeyPress={handleKeyPress}
                        />

                    </div>
                </div>
            </section>

        </div>

    );
};

export default App;
