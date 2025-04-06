const socket = io();
const chatMessages = document.getElementById("chats");
const messageInput = document.getElementById("message-input");
const sendButton = document.querySelector(".send-button");
const currentUsernameSpan = document.querySelector(".current-user");
const usernameInput = document.getElementById("user");
const updateUsernameButton = document.querySelector(".Update");

let currentUsername = "";

socket.on("set_username", (data) => {
    currentUsername = data.username;
    currentUsernameSpan.textContent = `Your username: ${currentUsername}`;
});

socket.on("user_joined", (data) => {
    addMessage(`${data.username} joined the chat`, "system");
});

socket.on("user_left", (data) => {
    addMessage(`${data.username} left the chat`, "system");
});

socket.on("new_message", (data) => {
    addMessage(data.message, "user", data.username);
});

socket.on("username_updated", (data) => {
    addMessage(`${data.old_username} changed their name to ${data.new_user}`, "system");
    if (data.old_username === currentUsername) {
        currentUsername = data.new_user;
        currentUsernameSpan.textContent = `Your username: ${currentUsername}`;
    }
});

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

updateUsernameButton.addEventListener("click", updateUsername);

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit("send_message", { message });
        messageInput.value = "";
    }
}

function updateUsername() {
    const newUser = usernameInput.value.trim();
    if (newUser && newUser !== currentUsername) {
        socket.emit("update_username", { username: newUser });
        usernameInput.value = "";
    }
}

function addMessage(message, type, username = "") {
    const messageElement = document.createElement("div");
    if (type === "user") {
        const isSentMessage = username === currentUsername;
        messageElement.classList.add("message", isSentMessage ? "sent" : "received");

        const contentDiv = document.createElement("div");
        contentDiv.className = "message-content";

        const usernameDiv = document.createElement("div");
        usernameDiv.className = "username";
        usernameDiv.textContent = username;

        const messageText = document.createElement("div");
        messageText.className = "text";
        messageText.textContent = message;

        contentDiv.appendChild(usernameDiv);
        contentDiv.appendChild(messageText);
        messageElement.appendChild(contentDiv);
    } else {
        messageElement.className = "system-message";
        messageElement.textContent = message;
    }

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
