const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessages,
} = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("join", ({ username, room }) => {
    socket.join(room);

    socket.emit("message", generateMessage("Welcome!")); //emit to this particular connection
    socket.broadcast
      .to(room)
      .emit("message", generateMessage(`${username} has joined!`)); //send to everyone except to this particular socket in the room

    // socket.emit - send event to specific client
    // io.emit - send event to every connected client
    // socket.broadcast.emit - send event to every connected client except for this one
    // io.to.emit - emit event to everyone in a specific chat room
    // socket.broadcast.to.emit - emit event to everyone except for this client but only to in a specific room
  });

  socket.on("sendMessage", (message, callbackForAcknowledgement) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callbackForAcknowledgement("Profanity is not allowed!");
    }

    io.to("General").emit("message", generateMessage(message));
    callbackForAcknowledgement(); //acknowledgement callback
  });

  socket.on("sendLocation", (coords, callbackForAcknowledgement) => {
    io.emit(
      "locationMessage",
      generateLocationMessages(
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callbackForAcknowledgement();
  });

  //code that runs when client disconnects
  socket.on("disconnect", () => {
    io.emit("message", generateMessage("User has left the chat"));
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
