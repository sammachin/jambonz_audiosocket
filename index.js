const express = require('express')
const fs = require('fs')
const app = express()
const expressWs = require('express-ws')(app);
const wavHeaders = require('wav-headers');

const port = 3000

// Serve the JSON verbs to an answer webhook 
app.post('/answer', (req, res) => {
    data = [{
            "verb": "say",
            "text": "Connecting to Socket"
        }, {
            "verb": "listen",
            "url": "/socket",
            "passDtmf": true
        }]
  res.json(data)
})

// Handle the WebSocket Connection
app.ws('/socket', function(conn, req) {
    conn.on('message', function(msg) {
        if (typeof msg != "string") { // These are the binary messages containing the call audio
            let newBuffer = Buffer.concat([conn.callBuffer, msg]); // append the call audio to the call buffer
            conn.callBuffer = newBuffer //write the new buffer to the conn object
        } else {
            let data = JSON.parse(msg)
            if ("callSid" in data){ //This is the initial message for a new call
                conn.calldata=data // Store the call data against the conn object 
                conn.callBuffer =  Buffer.alloc(640) // allocate a buffer on the conn object to record the audio to
            }    
            else if ("event" in data){ //This is a dtmf event message
                let audioContent = fs.readFileSync(`Digits/${data.dtmf}.wav`, 'base64'); //Read the wav file and encode as base64
                let playAudioData = JSON.stringify({ 
                    type: "playAudio",
                    data: {
                        audioContent: audioContent,
                        audioContentType: "wav",
                        sampleRate: "8000",
                    },
                }); // Build the JSON message containing the audio and metadata
                conn.send(playAudioData) // Write the message to the Socket
            }
            else {
                console.log(msg) //These are other notification messages about the playback completing of the sent audio
            } 
        }
    });
    conn.on('close', function(){
        console.log('Call Ended') // When the websocket is closed the call is ended, we will now write the buffered RAW audio to a WAV file.
        //Specify the WAV header data based on the contents of the inital message
        var options = {
            channels: conn.calldata.mixType=='mono' ? 1 : 2,
            sampleRate: conn.calldata.sampleRate,
            bitDepth: 16,
            dataLength: conn.callBuffer.length
        };
        var headersBuffer = wavHeaders (options); // Generate WAV header data buffer
        var fullBuffer = Buffer.concat([ headersBuffer, conn.callBuffer ]); //Combine the wav header with the raw audio buffer
        var stream = fs.createWriteStream(`Recordings/${conn.calldata.callSid}.wav`); // write to a file
        stream.write(fullBuffer, function() {
            stream.end();
        });
    })
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
