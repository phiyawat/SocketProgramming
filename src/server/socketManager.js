const io = require('./index.js').io

const {VERIFY_USER, USER_CONNECTED, USER_DISCONNECTED,
  LOGOUT, COMMUNITY_CHAT, MESSAGE_SENT, MESSAGE_RECIEVED, TYPING} = require('../Events')

const {createUser, createMessage, createChat} = require('../Factories')

let connectedUser = {}

let communityChat = createChat()

module.exports = function (socket) {
  console.log('Socket ID: ' + socket.id)

  let sendMessageToChatFromUser
  let sendTypingFromUser

  socket.on(VERIFY_USER, (nickname, callback) => {
    if (isUser(connectedUser, nickname)) {
      callback({ isUser: true, user: null })
    } else {
      callback({
        isUser: false,
        user: createUser({ name: nickname })
      })
    }
  })
  socket.on(USER_CONNECTED, (user) => {
    connectedUser = addUser(connectedUser, user)
    socket.user = user
    sendMessageToChatFromUser = sendMessageToChat(user.name)
    sendTypingFromUser = sendTypingToChat(user.name)
    io.emit(USER_CONNECTED, connectedUser)
    console.log(connectedUser)
  })
  socket.on('disconnect', () => {
    if ("user" in socket) {
      connectedUser = removeUser(connectedUser, socket.user.name)
      io.emit(USER_DISCONNECTED, connectedUser)
      console.log("Disconnect ", connectedUser)
    }
  })
  socket.on(LOGOUT, () => {
    connectedUser = removeUser(connectedUser, socket.user.name)
    io.emit(USER_DISCONNECTED, connectedUser)
    console.log("Disconnect", connectedUser)
  })
  socket.on(COMMUNITY_CHAT, (callback) => {
    callback(communityChat)
  })
  socket.on(MESSAGE_SENT, ({chatId, message}) => {
    sendMessageToChatFromUser(chatId, message)
  })
  socket.on(TYPING, ({chatId, isTyping}) => {
    sendTypingFromUser(chatId, isTyping)
  })
}
function sendTypingToChat(user) {
  return (chatId, isTyping) => {
    io.emit(`${TYPING}-${chatId}`, { user, isTyping })
  }
}

function sendMessageToChat(sender) {
  return (chatId, message) => {
    io.emit(`${MESSAGE_RECIEVED}-${chatId}`, createMessage({ message, sender }))
  }
}

function addUser(userList, user) {
  let newList = Object.assign({}, userList)
  newList[user.name] = user
  return newList
}

function removeUser(userList, username) {
  let newList = Object.assign({}, userList)
  delete newList[username]
  return newList
}

function isUser(userList, username) {
  return username in userList
}
