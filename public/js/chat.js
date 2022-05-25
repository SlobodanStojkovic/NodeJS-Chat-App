const socket = io();

socket.on("message", (message) => {
  console.log(message);
});

document.querySelector("#message-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const message = e.target.elements.message.value; //target represents target that we listen through the event on, and in this case it is the form, elements we have access to our elements property and we can access any of our inputs by their name, message.value gives out value of our input with name="message"

  socket.emit("sendMessage", message);
});
