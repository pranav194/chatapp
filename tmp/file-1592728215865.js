module.exports = function (io, Users) {
  const users = new Users();

  var SocketIOFileUpload = require("socketio-file-upload"),
    socketio = require("socket.io"),
    express = require("express");

  // Make your Express server:
  var app = express().use(SocketIOFileUpload.router);

  var http = require("http");
  var app = http.createServer().listen(80);
  SocketIOFileUpload.listen(app);

  // Start up Socket.IO:
  var io = socketio.listen(app);

  io.on("connection", (socket) => {
    // console.log('User connected')

    var uploader = new SocketIOFileUpload(socket);
    uploader.dir = "./public/uploads";

    uploader.listen(socket);

    socket.on("join", (params, callback) => {
      socket.join(params.room);
      users.AddUserData(socket.id, params.name, params.room);
      io.to(params.room).emit("usersList", users.GetUsersList(params.room));
      callback();
    }),
      socket.on("createMessage", (message, callback) => {
        console.log(message);
        io.to(message.room).emit("newMessage", {
          text: message.text,
          room: message.room,
          from: message.sender,
        });
        callback();
      });
    socket.on("disconnect", () => {
      var user = users.RemoveUser(socket.id);
      if (user) {
        io.to(user.room).emit("usersList", users.GetUsersList(user.room));
      }
    });
  });
};
