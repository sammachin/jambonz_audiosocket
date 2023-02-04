# Jambonz AudioSocket

This is an example applicaiton for working with websocket audio from the jambonz platform, calls are connected to a websocket using the [listen](https://www.jambonz.org/docs/webhooks/listen/) verb.

The application demonstrates several things:
- Serving the JSON required for connecting a call to the websocket and keeping track of all connections
- The websocket server to handle the call
- Recording the audio from the caller and converting that to a WAV file
- Recieving DTMF events from the caller over the websocket
- Playing back wav audio in response to the DTMF event.
- Playing back WAV audio to each connected call in response to an external http request.

Running
The app uses express and express-ws to serve the socket, download or clone this repository then run `npm install` 

To start the application run `node index.js` 

The application will listen on port 3000 by default 


You will need to configure a jambonz applicaiton to send a webhook to your server on port 3000 at '/answer' for an incomming call, the application will need TTS to be setup as the initial greeting for the caller is done through the say verb.
