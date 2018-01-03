var net = require('net')

var client = new net.Socket()

client.connect(13000, 'Friend IP address', function () {
  console.log('Connected')
})

client.on('data', function (data) {
  console.log('SERVER:' + data)
})

process.stdin.on('data', function (text) {
  client.write(text)
})

client.on('close', function () {
  console.log('Connection closed')
})
