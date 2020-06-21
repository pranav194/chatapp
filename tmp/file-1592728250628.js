$(document).ready(function () {
  var socket = io();
  //

  var room = $("#groupName").val();
  var sender = $("#sender").val();

  //
  document.addEventListener(
    "DOMContentLoaded",
    function () {
      var socket = io.connect();
      var siofu = new SocketIOFileUpload(socket);

      // Configure the three ways that SocketIOFileUpload can read files:

      siofu.listenOnInput(document.getElementById("siofu_input"));

      // Do something on upload progress:
      siofu.addEventListener("progress", function (event) {
        var percent = (event.bytesLoaded / event.file.size) * 100;
        console.log("File is", percent.toFixed(2), "percent loaded");
      });

      // Do something when a file is uploaded:
      siofu.addEventListener("complete", function (event) {
        console.log(event.success);
        console.log(event.file);
      });
    },
    false
  );
  //

  socket.on("connect", function () {
    console.log("User is now connected");
    var params = {
      room: room,
      name: sender,
    };
    socket.emit("join", params, function () {
      console.log("User has joined this channel");
    });
  });
  socket.on("usersList", function (users) {
    var ol = $("<ol></ol>");

    for (var i = 0; i < users.length; i++) {
      ol.append(
        '<p> <a style="color: #9993B9;" id="val" data-toggle="modal" data-target="#myModal" >' +
          users[i] +
          "</a></p>"
      );
    }

    $(document).on("click", "#val", function () {
      $("#name").text("@" + $(this).text());
      $("#receiverName").val($(this).text());
      $("#nameLink").attr("href", "/profile/" + $(this).text());
    });

    $("#numValue").text("(" + users.length + ")");
    $("#users").html(ol);
  });

  socket.on("newMessage", function (data) {
    var template = $("#message-template").html();
    var message = Mustache.render(template, {
      text: data.text,
      sender: data.from,
    });
    $("#messages").append(message);
  });

  $("#message-form").on("submit", function (e) {
    e.preventDefault();
    var msg = $("#msg").val();

    socket.emit(
      "createMessage",
      {
        text: msg,
        room: room,
        sender: sender,
      },
      function () {
        $("#msg").val("");
      }
    );
  });
});
