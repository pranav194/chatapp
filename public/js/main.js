const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const room_name = document.getElementById("room-name");
const usersList = document.getElementById("users");
const inputfile = document.getElementById("input-file");

$(document).ready(function () {
  const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });

  const socket = io();

  //Join Chatroom
  socket.emit("joinRoom", { username, room });

  socket.on("message", (message) => {
    outputMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  socket.on("roomUsers", (roomDetails) => {
    room_name.innerHTML = roomDetails.room;
    usersList.innerHTML = roomDetails.users
      .map(
        (user) => `<li class="list-group-item bg-info">${user.username}</li>`
      )
      .join("");
  });
  //Message Submit
  // chatForm.addEventListener("submit", (e) => {
  //   e.preventDefault();
  //   //Message Text
  //   const msg = e.target.elements.msg.value;
  //   //emit message to server
  //   socket.emit("chatMessage", msg);
  //   //clear input
  //   e.target.elements.msg.value = "";
  //   e.target.elements.msg.focus();
  // });

  $("#input-file").on("input", () => {
    $("#msg").val($("#input-file").val());
  });

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const file = e.target.elements["input-file"].value;
    e.target.elements.msg.value = "File Upload";
    if (file) {
      var data;

      data = new FormData();
      data.append("file", $("#input-file")[0].files[0]);

      $.ajax({
        url: "/api/message",
        processData: false,
        contentType: false,
        // contentType: "multipart/form-data",
        data,
        type: "POST",
        success: ({ file }) => {
          socket.emit("chatFile", file);
        },
      });
      e.target.elements.msg.value = "";
      e.target.elements.msg.focus();
      $("#input-file").val("");
    } else {
      //Message Text
      const msg = e.target.elements.msg.value;
      //emit message to server
      socket.emit("chatMessage", msg);
      //clear input
      e.target.elements.msg.value = "";
      e.target.elements.msg.focus();
    }
  });
  //file input
  // document
  function outputMessage(message) {
    const div = document.createElement("div");
    div.className = "box bg-light p-2 m-4 rounded";
    div.innerHTML = `<div class="text-secondary small">${message.username}<span class = "ml-1">${message.time}</span></div>
  <p class="text">
   ${message.text}
  </p>`;
    document.querySelector(".chat-messages").appendChild(div);
  }
});
