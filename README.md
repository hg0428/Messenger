# Encrypto-Chat
This is an end-to-end encrypted chat application featuring messaging as well as group voice and video call capabilities. 
###### Note:
I may or may not have voice and video calls implemented by the time of submission, though the peers.jd connections and backend infrastructure are ready. I just need to set up the canvases and create the UI and JS logic for it.
From now on, anything with a ⚠️ symbol (caution) is something that may or may not be complete at the time of completion. Everything is implemented at the time of writing this README.

This application uses PGP encryption for high-security messaging.
The PGP private key is ONLY stored on the client it was created on and is stored in localStorage XOR encrypted with a special password that IS NOT CACHED. This password must be re-entered correctly on page load or all decryption operations will fail. This password is separate from the account password, which is used to login to and access your account. 

## Messaging and Chats
If encryption is enabled (it is by default, see the switch on the right tab), the sent message will be PGP encrypted.
Each chat has a custom charset schedule NOT STORED IN THE SERVER (⚠️). The charset tells the program what number corresponds to what character. The charset schedule is a schedule of changes to this charset that is agreed upon by all clients as time of chat creation. The charset schedule is stored in localStorage and XOR encrypted with the client's password (remember, not the account password). 
The charset schedule and chat password are securely encrypted and sent to the other chat users.
Moreover, the messages are XOR encrypted with a chat-specific password that is auto-generated upon chat creation and also stored ONLY locally.
See the section on client onboarding for information on how new clients will be onboarded to understand the charset schedule and the password of existing chats.
Messages are stored in the server in encrypted form described above, UNLESS the persistent messages switch is disabled. In that case, messages NEVER even go through the server, instead a direct client to client WebRTC connection is used to send the already fully encrypted messages directly to the other client. because of this, non-persistent messages are only send to currently online clients. You can determine if a user has an online client by hovering the user in the users list on the right (the user also turns green if they are online).

When a message is sent, every user is looped over. For every user, every client is looped over. And for each client, the message is encrypted with the client's public key and sent to its UserReceived object for that chat.
### Calls ⚠️
Calls are established using WebRTC and NEVER go through the server. They are, however, not encrypted. This is because encrypting and decrypting packets for a live call would result in an extremely low performance call that would be almost impossible to use.
Calls can be started using the call buttons in the middle of the topbar. When a call is initiated, a ringing noise will begin to play on the clients of the users in the chat and an answer button will appear next to the call buttons in the topbar. When in a call, you will notice that the messages UI disappears, giving way to the call UI. The call UI features a grid (using CSS display: grid) of all users in the call. If users have video enabled, you will see a canvas displaying live video feed, otherwise, you will just see their username.

## Onboarding ⚠️
When a user logs in on a new device (or web browser), that user must be onboarded by an existing device of theirs. When the newly logged in client is online at the same time an existing client is online, a peers.js connection will be established between them. Then, a popup will appear on the existing device asking to confirm the onboarding. The popup will display information such as user agent, location (a guess from IP address), and IP address. If the user confirms, the existing client will begin sending chat charset schedules and passwords to the new client with PGP encryption. Once complete, the new client will be able to receive messages from all existing chats. They will not, however, be able to access past messages because none of them were encrypted for this client.
A client does not have to be onboarded to receive messages sent in chats that were created after that client was logged in.


## The XOR encryption
This XOR encryption system is very basic. If I have time, I will implement a JavaScript version of my Python PCSS encryption library (look it up on PyPi). If so, then the XOR encryption system's security will be increased.
The current basic information is still very secure, however. The only issue with it is the potential to identify a pattern in the encrypted data. This could be better handled by a more advanced system that converts the data to a format that is less regular than plain text.
So, in all, the encryption system as currently implemented is very secure for all intents and purposes though it can be made better.


## The UI
I used bootstrap's design and icons across the user interface. 

## API
The API is the result of me failing to get websockets working with Django. This is why I prefer Flask and Express.js. 
The API includes features to get messages and chats, as well as set client data (such as PGP keys and peer.js ids).

## Explanation of Files
### views.py
This file includes all the views for the application plus a helper function for setting cookies.
The index view (which maps to /) loads the main page.
The login, logout, and register views have implied meanings and need no further explanation.
The API view handles all API requests, including: getting messages, sending messages, setting client data (such as PGP keys and peer.js ids), adding a new client, getting a list of the users in a chat, getting a list of chats the user is in, getting data for a specific chat, creating a chat, and leaving a chat.

### models.py
This file includes the database models which store all the information for the application. 
##### Client model
The client model stores information for a specific client (i.e. one individual web browser). Information stored includes the client's PGP public key, the client's id, the user who is logged in on that client, and the clients peer id (for voice and video calls as well as low-latency messaging).
##### UserReceived model
This model is per-client and per-chat. Why? Because each message must be separately encrypted for its target client (because each client has a different PGP key). 
I could have chosen to do the PGP keys per-user (like most end to end encrypted chat applications), but that decreases security because the PGP private key would have to be passed around. Other apps, like iMessage, store the private key in the server. But, if the server is compromised, a hacker could with little difficulty retrive that key and thereby decrypt the messages, even if the key was stored in a secure system.

##### Message model
This model represents an individual message. Each "message" is part of a UserReceived object. The messages have an id (Auto Field), a sender (User), content (Text, base64 if encrypted otherwise plain), a timestamp (Date Time), a userRecievedObject (userRecieved), and a field indicating whether the message is encrypted or not (Boolean).

### urls.py
This file just defines the routes and how the connect to the views.

## Distinctiveness and Complexity:
I believe this project meets the requirements set the the course. This project is a E2EE messaging app, something that we have never had to make before. The UI is unique; the design is unique; the code is unique. I wrote about 360 lines of Python code, 1,047 lines of Javascript, 250 lines of HTML, and 750 lines of CSS for this project. I invested hours upon hours and weeks upon weeks building this. It is distinct and complex; I could argue no other way. 
A chat application is very distinct from a social network (although many social networks include chat applications) and very distinct from a E-commerce site (No resemblance there, except the internet). 