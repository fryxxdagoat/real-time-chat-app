from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import random

app = Flask(__name__)
socketio = SocketIO(app)

users = {}

@app.route('/')
def main():
    return render_template('index.html')

@socketio.on("connect")
def handle_connect():
    username = f"user_{random.randint(1000,9999)}"
    users[request.sid] = {"username": username}
    emit("set_username", {"username": username})
    emit("user_joined", {"username": username}, broadcast=True)

@socketio.on("disconnect")
def handle_disconnect():
    user = users.pop(request.sid, None)
    if user:
        emit("user_left", {"username": user["username"]}, broadcast=True)

@socketio.on("send_message")
def handle_message(data):
    user = users.get(request.sid)
    if user and "message" in data:
        emit("new_message", {"message": data["message"], "username": user["username"]}, broadcast=True)

@socketio.on("update_username")
def handle_update_username(data):
    old_username = users[request.sid]["username"]
    new_username = data["username"]
    users[request.sid]["username"] = new_username
    emit("username_updated", {"old_username": old_username, "new_user": new_username}, broadcast=True)

if __name__ == "__main__":
    socketio.run(app, debug=True)
