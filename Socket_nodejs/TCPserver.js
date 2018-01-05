var net = require('net')

var server = net.createServer(function (socket) {
  socket.write('hello who there?')
  socket.pipe(socket)
})

server.listen(13000)

console.log('Server is create at port 13000')
