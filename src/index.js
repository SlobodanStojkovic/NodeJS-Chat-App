const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessages,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("join", ({ username, room }, callbackForAcknowledgement) => {
    // socket.id provides unique id for that particular connection
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callbackForAcknowledgement(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage("System:", "Welcome!")); // emit to this particular connection
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("System:", `${user.username} has joined the chat`)
      ); //send to everyone except to this particular socket in the room

    // socket.emit - send event to specific client
    // io.emit - send event to every connected client
    // socket.broadcast.emit - send event to every connected client except for this one
    // io.to.emit - emit event to everyone in a specific chat room
    // socket.broadcast.to.emit - emit event to everyone except for this client but only to in a specific room
  });

  socket.on("sendMessage", (message, callbackForAcknowledgement) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callbackForAcknowledgement("Profanity is not allowed!");
    }

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callbackForAcknowledgement(); //acknowledgement callback
  });

  socket.on("sendLocation", (coords, callbackForAcknowledgement) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessages(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callbackForAcknowledgement();
  });

  // Code that runs when client disconnects
  socket.on("disconnect", () => {
    const leftUser = removeUser(socket.id);

    if (leftUser) {
      io.to(leftUser.room).emit(
        "message",
        generateMessage("System", `${leftUser.username} has left the chat`)
      );
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
