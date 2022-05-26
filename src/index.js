const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.emit("message", "Welcome!"); //emit to this particular connection
  socket.broadcast.emit("message", "New user joined the chat"); //send to everyone except to this particular socket

  socket.on("sendMessage", (message, callbackForAcknowledgement) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callbackForAcknowledgement("Profanity is not allowed!");
    }

    io.emit("message", message); //emit to everyone
    callbackForAcknowledgement(); //acknowledgement callback
  });

  socket.on("sendLocation", (coords, callbackForAcknowledgement) => {
    io.emit(
      "locationMessage",
      `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
    );
    callbackForAcknowledgement();
  });

  //code that runs when client disconnects
  socket.on("disconnect", () => {
    io.emit("message", "User has left the chat");
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
