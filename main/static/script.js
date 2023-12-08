function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function toBinary(input) {
    let output = ""
    for (var i = 0; i < input.length; i++) {
        output += input[i].charCodeAt(0).toString(2);
    }
    return output
}
var currentChat, encryptMessageSwitch, privateKey, publicKey, revocationCertificate, password;
// A function that takes a string and a key (a number) and returns the XOR encrypted string as a bit array
function xorEncrypt(string, key) {
    // Convert the key to a binary string
    let keyBits = toBinary(key);
    let newString = "";
    let binString = "";
    // Initialize an empty array to store the encrypted bits
    // Loop through each character of the string
    for (let i = 0; i < string.length; i++) {
        // Get the ASCII code of the character
        let charCode = string.charCodeAt(i);
        // Convert the ASCII code to a binary string
        let charBits = charCode.toString(2);
        // Pad the binary string with zeros if needed to make it 8 bits long
        charBits = charBits.padStart(8, "0");
        let encryptedBits = [];
        // Loop through each bit of the character
        for (let j = 0; j < charBits.length; j++) {
            // Get the corresponding bit of the key by using modulo arithmetic
            let keyBit = keyBits[j % keyBits.length];
            // XOR the character bit and the key bit and push the result to the encrypted bits array
            let encryptedBit = Number(charBits[j]) ^ Number(keyBit);
            encryptedBits.push(encryptedBit);
        }
        binString += encryptedBits.join("");
        let encryptedChar = String.fromCharCode(parseInt(encryptedBits.join(""), 2));
        newString += encryptedChar;
    }
    // Return the encrypted bits array as a string
    return binString;
}
function xorEncryptUint8Array(array, key) {
    let keyBits = toBinary(key);
    let binString = "";
    for (let i = 0; i < array.length; i++) {
        let encryptedBits = [];
        let charBits = array[i].toString(2);
        charBits = charBits.padStart(8, "0");
        for (let j = 0; j < charBits.length; j++) {
            let keyBit = keyBits[j % key.length];
            let encryptedBit = Number(charBits[j]) ^ Number(keyBit);
            encryptedBits.push(encryptedBit);
        }
        binString += encryptedBits.join("");
    }
    return binString
}

// A function that takes an XOR encrypted string as a bit array and a key (a number) and returns the original string
function xorDecrypt(encrypted, key, bin = true) {
    let encryptedBits = bin ? encrypted : toBinary(encrypted);
    // Convert the key to a binary string
    let keyBits = toBinary(key);
    // Initialize an empty array to store the decrypted bits
    let decryptedBits = [];
    originalString = '';
    // Loop through each group of 8 bits in the encrypted bits array
    for (let i = 0; i < encryptedBits.length; i += 8) {
        // Get the substring of 8 bits
        let charBits = encryptedBits.substring(i, i + 8);
        // Loop through each bit of the substring
        for (let j = 0; j < charBits.length; j++) {
            // Get the corresponding bit of the key by using modulo arithmetic
            let keyBit = keyBits[j % keyBits.length];
            // XOR the encrypted bit and the key bit and push the result to the decrypted bits array
            let decryptedBit = Number(charBits[j]) ^ Number(keyBit);
            decryptedBits.push(decryptedBit);
        }
        // Convert the decrypted bits to a binary string
        let decryptedCharBits = decryptedBits.join("");
        // Convert the binary string to an ASCII code
        let decryptedCharCode = parseInt(decryptedCharBits, 2);
        // Convert the ASCII code to a character and append it to the original string
        let decryptedChar = String.fromCharCode(decryptedCharCode);
        originalString += decryptedChar;
        // Reset the decrypted bits array for the next group of 8 bits
        decryptedBits = [];
    }
    // Return the original string
    return originalString;
}
function xorDecryptToUint8Array(encrypted, key, bin = true) {
    let encryptedBits = bin ? encrypted : toBinary(encrypted);
    let keyBits = toBinary(key);
    let decryptedNumbers = [];
    for (let i = 0; i < encryptedBits.length; i += 8) {
        let charBits = encryptedBits.substring(i, i + 8);
        let decryptedBits = [];
        for (let j = 0; j < charBits.length; j++) {
            let keyBit = keyBits[j % key.length];
            let decryptedBit = Number(charBits[j]) ^ Number(keyBit);
            decryptedBits.push(decryptedBit);
        }
        decryptedNumbers.push(parseInt(decryptedBits.join(""), 2));
    }
    return new Uint8Array(decryptedNumbers)
}
// Test the encryption and decryption functions
// let testString = "Hello, World!";
// let testKey = 'Password';
// let encryptedString = xorEncrypt(testString, testKey);
// let decryptedString = xorDecrypt(encryptedString, testKey);
// console.log(testString, encryptedString, decryptedString);


window.addEventListener("load", function () {
    // console.log(user);
    publicKey = localStorage.getItem("publicKey");
    privateKey = localStorage.getItem("privateKey");
    revocationCertificate = localStorage.getItem("revocationCertificate");
    //using brainpoolP512r1
    if (!publicKey || !privateKey || !revocationCertificate) {
        (async () => {
            while (true) {
                password = prompt("Create a password (you will need to remember this): ");
                let passwordConfirm = prompt("Confirm the password: ");
                if (password === passwordConfirm) {
                    break;
                }
                alert("Passwords do not match. Please try again.");
            }
            const { privateKey: newPrivateKey, publicKey: newPublicKey, revocationCertificate: newRevocationCertificate } = await openpgp.generateKey({
                type: 'ecc', // Type of the key, defaults to ECC
                curve: 'brainpoolP512r1', // ECC curve name, defaults to curve25519
                userIDs: [{ name: user.username, email: user.email }], // you can pass multiple user IDs
                passphrase: password, // protects the private key
                format: 'binary' // output key format, defaults to 'armored' (other options: 'binary' or 'object')
            });
            console.log(newPrivateKey);
            privateKey = newPrivateKey;
            publicKey = newPublicKey;
            revocationCertificate = newRevocationCertificate;
            console.log(privateKey);     // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
            console.log(publicKey);      // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
            console.log(revocationCertificate); // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
            localStorage.setItem("publicKey", xorEncryptUint8Array(publicKey, password));
            localStorage.setItem("privateKey", xorEncryptUint8Array(privateKey, password));
            localStorage.setItem("revocationCertificate", xorEncrypt(revocationCertificate, password));
        })();
    } else {
        password = prompt("Enter your password (note: you will not be able to decrypt the messages without this): ");
        publicKey = xorDecryptToUint8Array(publicKey, password);
        privateKey = xorDecryptToUint8Array(privateKey, password);
        revocationCertificate = xorDecrypt(revocationCertificate, password);
        // console.log(privateKey, publicKey, revocationCertificate);
    }
    if (!clientRegistered) {
        fetch('/API/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'actions': [{
                    'action': 'add-client',
                    'public-key': uint8ToBase64(publicKey)
                }]
            }),
        });
    }
    const voiceChatElement = document.getElementById("voice-chat-init");
    const videoCallElement = document.getElementById("video-call-init");
    // voiceChatElement.addEventListener("click", function () {
    //     var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    //     getUserMedia({ video: true, audio: true }, function (stream) {
    //         var call = peer.call(, stream);
    //         call.on('stream', function (remoteStream) {
    //             // Show stream in some video/canvas element.
    //         });
    //     }, function (err) {
    //         console.log('Failed to get local stream', err);
    //     });
    // })
    // TODO
    new bootstrap.Tooltip(voiceChatElement);
    new bootstrap.Tooltip(videoCallElement);
    var peer = new Peer(null, {

    });
    peer.on('open', function (id) {
        // Workaround for peer.reconnect deleting previous id
        if (peer.id === null) {
            console.log('Received null id from peer open');
            peer.id = lastPeerId;
        } else {
            lastPeerId = peer.id;
        }
        console.log(publicKey);
        console.log('ID: ' + peer.id);
        console.log('Public Key: ', uint8ToBase64(publicKey));
        fetch('/API/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'actions': [
                    {
                        action: 'set-client-data',
                        'peer-id': peer.id,
                        'public-key': uint8ToBase64(publicKey)
                    }
                ]
            })
        });
    });
    peer.on('close', function () {
        fetch('/API/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'actions': [{ action: 'set-peer-id' }],
                'peer-id': null
            })
        });
    })
    setInterval(function () {
        // Fetch the users in the current chat.
        if (currentChat) {
            let chat = currentChat;
            fetch('/API/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'actions': [
                        {
                            action: 'get-current-users',
                            'chat-id': chat.id
                        },
                        {
                            action: 'get-chats'
                        },
                        {
                            action: 'get-messages',
                            'chat-id': chat.id,
                            start: chat.messages.reduce((a, b) => a.index > b.index ? a : b, { index: -1 }).index + 1
                        }
                    ]
                })
            }).then(function (response) {
                let data = response.json();
                data.then(function (data) {
                    // console.log('1hz ping res', data);
                    for (let id in data.users) {
                        let user = allUsers[id];
                        user = { ...user, ...data.users[id] };
                        allUsers[id] = user;
                    }
                    for (let id in data.chats) {
                        let chat = user.chats[id]
                        user.chats[id] = { ...(chat || {}), ...data.chats[id] };
                        if (!chat) {
                            updateChatList();
                        }
                    }
                    let added = false;
                    for (let id in data.messages) {
                        let message = data.messages[id];
                        if (chat.messages.filter(m => m.id == id).length === 0) {
                            added = true;
                            chat.messages[id] = message;
                        }
                    }
                    if (added && chat == currentChat) {
                        renderChat(chat, chat.messages);
                    }
                    // console.log(data.users)
                });
            });
        }
    }, 1000);
    const mainElement = document.getElementById("main");
    const chatList = document.getElementById("chat-list");
    const newChatBtn = document.getElementById("new-chat-btn");
    const createChatElement = document.getElementById("create-chat-menu");
    const createChatMenuCreateBtn = document.querySelector("#create-chat-menu>header>button.done");
    const exitChatMenuBtn = document.querySelector("#create-chat-menu>header>button.close-menu");
    const newChatName = document.getElementById("new-chat-name");
    let userListInputElement = document.getElementById('users-list-tagify-input');
    const chatNameElement = document.getElementById("chat-name");
    const chatMembersList = document.getElementById("chat-members-list");
    const leaveChatElement = document.getElementById("leave-chat");
    encryptMessageSwitch = document.getElementById("encrypt-message-switch");
    const realMessages = document.getElementById("real-messages");
    const messagesTopArea = document.getElementById("top-element");
    const messagesBeginning = document.getElementById("messages-beginning");
    leaveChatElement.onclick = function () {
        if (!currentChat) return;
        fetch('/API/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'actions': [
                    {
                        action: 'leave-chat',
                        'chat-id': currentChat.id
                    }
                ]
            })
        });
        delete user.chats[currentChat.id];
        currentChat.element.remove();
        currentChat = null;
        selectChat(user.chats[Object.keys(user.chats)[0]]);
    }
    const messageList = document.getElementById("message-list");
    // TODO: Add loading.
    async function loadChat(chat) {
        console.log('Loading chat...')
        let blockSize = 50;
        let oldest = chat.messages.length > 0 ? chat.messages.reduce((a, b) => a.index < b.index ? a : b) : { index: -1 };
        // Load chat messages
        let response = await fetch('/API/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'actions': [
                    {
                        action: 'get-messages',
                        'chat-id': chat.id,
                        'start': Math.max(oldest.index - blockSize, 0),
                        'end': oldest.index
                    },
                    {
                        action: 'get-current-users',
                        'chat-id': chat.id
                    },
                ],


            })
        });
        let data = await response.json();
        for (let id in data.users) {
            let user = allUsers[id];
            user = { ...user, ...data.users[id] };
            allUsers[id] = user;
        }
        for (let id in data.messages) {
            let message = data.messages[id];
            chat.messages[id] = message;
        }
        if (chat === currentChat) {
            renderChatMembers(chat);
            renderChat(chat, chat.messages);
        }
        return data;
    }
    var renderedMessages = [];
    async function renderChat(chat, messages) {
        messages = messages || chat.messages;
        if (chat.id != messageList.getAttribute("data-chat-id")) {
            realMessages.innerHTML = '';
            messagesTopArea.style.removeProperty('height');
            renderedMessages = [];
        }
        messages.sort((a, b) => b.index - a.index);
        console.log(messages)
        for (let id in messages) {
            if (chat != currentChat) { return; }
            let message = messages[id];
            let messageElement = document.querySelector(`.message[data-message-id="${message.id}"]`);
            if (messageElement) {
                return;
            }
            let content = message.content;
            if (message.encrypted && !message.decrypted) {
                try {
                    content = await decryptWithPrivateKey(privateKey, base64ToUint8(content), password, publicKey);
                } catch (error) {
                    message.error = `Decryption error. Showing encrypted data.\n${error}`;
                    message.encryption = false;
                }
            }
            message.content = content;
            message.error = message.error || '';
            message.timestamp = new Date(message.timestamp);
            messages.decrypted = true;
            if (chat != currentChat) return;
            if (!messageElement) {
                renderedMessages.push(message);
                messageElement = renderMessage(message);
                let hasAfter = renderedMessages.filter(m => m.index > message.index).length > 0;
                let hasBefore = renderedMessages.filter(m => m.index < message.index).length > 0;
                if (!hasAfter)
                    realMessages.appendChild(messageElement);
                else if (hasAfter && !hasBefore)
                    realMessages.insertBefore(messageElement, realMessages.firstChild);
                else
                    for (let after of renderedMessages.filter(m => m.index > message.index)) {
                        let afterElement = document.querySelector(`.message[data-message-index="${after.index}"]`);
                        if (!afterElement) continue;
                        realMessages.insertBefore(messageElement, afterElement);
                        break;
                    }
            }
        }
        let first = realMessages.firstChild;
        if (first) {
            if (first.getAttribute('data-message-index') == '0') {
                messagesTopArea.style.height = 0;
                messagesBeginning.style.display = 'block';
            } else {
                messagesTopArea.style.removeProperty('height');
            }
        } else {
            messagesTopArea.style.height = 0;
        }
        messageList.setAttribute("data-chat-id", chat.id);
    }
    function renderChatMembers(chat) {
        chatMembersList.innerHTML = '';
        for (let i of chat.users) {
            let u = allUsers[i];
            console.log(u);
            let li = document.createElement("li");
            li.classList.add('user');
            li.innerText = u.username;
            let online = false;
            for (let c in u.clients) {
                let client = u.clients[c];
                if (client.peerId) {
                    online = true;
                    break;
                }
            }
            if (online) {
                li.classList.add('online');
                new bootstrap.Tooltip(li, {
                    title: "Online"
                });
            } else {
                new bootstrap.Tooltip(li, {
                    title: "Offline"
                });
            }
            chatMembersList.appendChild(li);
        }
    }
    function selectChat(chat) {
        if (!chat) return;
        if (currentChat) {
            currentChat.element.classList.remove("selected");
        }
        currentChat = chat;
        currentChat.element.classList.add("selected");
        chatNameElement.innerText = chat.name;
        renderChatMembers(chat);
        if (chat.messages.length < 1) {
            loadChat(chat)
        } else {
            renderChat(chat, chat.messages);
        }
        for (let member of chat.users) {
            let user = allUsers[member];
            for (let cId in user.clients) {
                let client = user.clients[cId];
                if (client.peerId) {
                    let connection = peer.connect(client.peerId);
                    connection.on('open', function () {
                        client.connection = connection;
                    });
                    connection.on('close', function () {
                        client.connection = null;
                    });
                    connection.on('data', function (data) {
                        if (data.type === 'new-message') {
                            let chat = user.chats[data.chatId];
                            if (chat) {
                                if (!data.message) return;
                                if (chat.messages.filter(m => m.id == data.message.id).length === 0) {
                                    chat.messages.push(data.message);
                                    renderChat(chat, chat.messages);
                                }
                            }
                        }
                    })
                } else {
                    client.connection = null;
                }
            }
        }
    }
    function updateChatList() {
        chatList.innerHTML = '';
        for (let id in user.chats) {
            let chat = user.chats[id];
            let li = document.createElement("li");
            li.setAttribute("data-chat-id", chat.id);
            li.innerText = chat.name;
            chatList.appendChild(li);
            chat.element = li;
            chat.element.addEventListener("click", e => selectChat(chat));
        }
    }
    updateChatList();
    selectChat(user.chats[Object.keys(user.chats)[0]]);
    exitChatMenuBtn.addEventListener("click", function () {
        createChatElement.style.display = "none";
        mainElement.classList.remove('overlay-active');
    })
    newChatBtn.addEventListener("click", function () {
        createChatElement.style.display = "block";
        mainElement.classList.add('overlay-active');
        newChatName.value = "";
        userListInputElement.value = "";
    });
    createChatMenuCreateBtn.addEventListener("click", function () {
        let name = newChatName.value;
        let userList = JSON.parse(userListInputElement.value);
        let userIdList = [];
        for (let i = 0; i < userList.length; i++) {
            userIdList.push(userList[i].id);
        }
        createChatElement.style.display = "none";
        mainElement.classList.remove('overlay-active');
        if (name) {
            fetch('/API/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    actions: [
                        {
                            action: 'create-chat',
                            name: name,
                            users: userIdList
                        }
                    ]
                })
            }).then(function (response) {
                let data = response.json();
                data.then(function (data) {
                    let chat = data["chat"];
                    user.chats[chat.id] = chat;
                    updateChatList();
                    newChatName.value = "";
                    userListInputElement.value = "";
                    selectChat(chat);
                });
            });
        }
    });
});
async function sendMessage(text, chat, encrypt = null, persistent = true) {
    if (encrypt === null) {
        encrypt = encryptMessageSwitch.checked;
    }
    console.log(encrypt);
    let actions = [];
    for (let userId of chat.users) {
        let u = allUsers[userId];
        for (let cId in u.clients) {
            let client = u.clients[cId];
            let content;
            let signing = null;
            if (encrypt) {
                let pk = base64ToUint8(client.publicKey);
                if (pk == publicKey) {
                    signing = {
                        privateKey: privateKey,
                        passphrase: password
                    };
                }

                content = uint8ToBase64(await encryptWithPublicKey(pk, text, signing));
            } else {
                content = text;
            }
            actions.push({
                action: 'send-message',
                'chat-id': chat.id,
                'destination-user': u.id,
                'destination-client': client.id,
                content,
                encrypted: encrypt
            });
            if (client.connection) {
                client.connection.send({
                    type: 'new-message',
                    chatId: chat.id,
                    message: {
                        timestamp: new Date(),
                        content,
                        encrypted: encrypt,
                        sender: user,
                        index: chat.messages.reduce((a, b) => a.index > b.index ? a : b, { index: -1 }).index + 1,
                        id: chat.messages.reduce((a, b) => a.id > b.id ? a : b, { id: -1 }).id + 1
                    }
                });
            }
        }
    }
    // alert('Message sent!');
    fetch('/API/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'actions': actions
        })
    });
    return {
        encrypted: encrypt
    }
}
function toLocaleString(date, locale, options) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date >= today) {
        return 'Today at ' + date.toLocaleTimeString(locale, {
            ...options,
            weekday: undefined,
            year: undefined,
            month: undefined,
            day: undefined
        });
    } else if (date >= yesterday) {
        return 'Yesterday at ' + date.toLocaleTimeString(locale, {
            ...options,
            weekday: undefined,
            year: undefined,
            month: undefined,
            day: undefined
        });
    } else {
        return date.toLocaleString(locale, options);
    }
}
function renderMessage(message) {
    console.log('message', message);
    let messageElement = document.createElement('div');
    messageElement.setAttribute('dir', 'auto');
    messageElement.setAttribute('data-message-id', message.id);
    messageElement.setAttribute('data-message-index', message.index);
    messageElement.classList.add('message');
    let inlineTop = document.createElement('div');
    inlineTop.classList.add('inline-top');
    let messageAuthor = document.createElement('div');
    messageAuthor.innerText = allUsers[message.sender.id].username;
    messageAuthor.classList.add('sender');
    inlineTop.appendChild(messageAuthor);
    let messageTimestamp = document.createElement('time');
    messageTimestamp.innerText = toLocaleString(message.timestamp, navigator.language || navigator.userLanguage, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        // era: 'long',
        // timeZoneName: 'long'
    });
    messageTimestamp.classList.add('timestamp');
    messageTimestamp.setAttribute('datetime', message.timestamp);
    inlineTop.appendChild(messageTimestamp);
    if (message.encrypted) {
        let messageEncrypted = document.createElement('span');
        messageEncrypted.classList.add('message-encrypted');
        messageEncrypted.innerText = 'Encrypted';
        inlineTop.appendChild(messageEncrypted);
        new bootstrap.Tooltip(messageEncrypted, {
            title: "The message is securely encrypted."
        });
    } if (message.error) {
        let messageError = document.createElement('span');
        messageError.classList.add('message-error');
        messageError.innerText = "Error";
        inlineTop.appendChild(messageError);
        new bootstrap.Tooltip(messageError, {
            title: message.error
        });
    }
    messageElement.appendChild(inlineTop);
    let messageContent = document.createElement('span');
    messageContent.classList.add('message-content');
    messageContent.innerText = message.content;
    messageElement.appendChild(messageContent);
    return messageElement;
}

async function encryptWithPublicKey(rawPublicKey, text, signing = null) {
    const publicKey = await openpgp.readKey({ binaryKey: rawPublicKey });
    const message = await openpgp.createMessage({ text });
    let opts = {
        message, // input as Message object
        encryptionKeys: publicKey,
        format: 'binary',
        // signingKeys: undefined
    };
    if (signing) {
        const privateKey = await openpgp.decryptKey({
            privateKey: await openpgp.readPrivateKey({ binaryKey: signing.PrivateKey }),
            passphrase: signing.passphrase
        });
        opts.signingKeys = privateKey;
    }
    const encrypted = await openpgp.encrypt(opts);
    return encrypted;
}
async function decryptWithPrivateKey(rawPrivateKey, encrypted, passphrase, rawPublicKey) {
    const publicKey = await openpgp.readKey({ binaryKey: rawPublicKey });
    const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ binaryKey: rawPrivateKey }),
        passphrase
    });
    const message = await openpgp.readMessage({
        binaryMessage: encrypted
    });
    const { data: decrypted, signatures } = await openpgp.decrypt({
        message,
        verificationKeys: publicKey,
        decryptionKeys: privateKey
    });
    // check signature validity (signed messages only)
    if (signatures.length > 0) {
        try {
            await signatures[0].verified; // throws on invalid signature
            console.log('Signature is valid');
        } catch (e) {
            throw new Error('Signature could not be verified: ' + e.message);
        }
    }
    return decrypted;
}
// Convert Uint8 to base64 encoded string
function uint8ToBase64(uint8Arr) {
    const encoded = String.fromCharCode.apply(null, uint8Arr);
    return btoa(encoded);
}

// Convert base64 encoded string to Uint8
function base64ToUint8(base64Str) {
    const decoded = atob(base64Str);
    const uint8Arr = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
        uint8Arr[i] = decoded.charCodeAt(i);
    }
    return uint8Arr;
}
