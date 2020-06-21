const express = require("express");
const path = require("path");
const http = require("http");

const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  getRoomUser,
  userLeave,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//run when client connects
io.on("connection", (socket) => {
  const botName = "ChatCord Bot";
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    //Welcome user
    socket.join(user.room);

    socket.emit("message", formatMessage(botName, "Welcome to Chat cord"));

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUser(user.room),
    });

    //BroadCast when a user connects exclding the user that connects
    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage(botName, `${user.username} has joined`));

    //listen for chat message
    socket.on("chatMessage", (msg) => {
      const user = getCurrentUser(socket.id);
      io.to(user.room).emit("message", formatMessage(user.username, msg));
    });

    socket.on("chatFile", (msg) => {
      const user = getCurrentUser(socket.id);
      io.to(user.room).emit(
        "message",
        formatMessage(
          user.username,
          `<a href = "/api/getfile/${msg}" target="_blank">${msg}</a>`
        )
      );
    });
    //Runs when client disconnects
    socket.on("disconnect", () => {
      const user = userLeave(socket.id);
      io.to(user.room).emit(
        "message",
        formatMessage(botName, user.username + " has left the chat")
      );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUser(user.room),
      });
    });
  });
});

app.use("/api", require("./routes/api"));

//set static folder
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log("Server running on port " + PORT));
