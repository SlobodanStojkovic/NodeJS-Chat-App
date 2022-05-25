const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

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

  socket.on("sendMessage", (message) => {
    io.emit("message", message); //emit to everyone
  });

  //code that runs when client disconnects
  socket.on("disconnect", () => {
    io.emit("message", "User has left the chat");
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
