var ReconnectingWebSocketServer = require('../index').ReconnectingWebSocketServer;

var PORT = 3000;
var server = new ReconnectingWebSocketServer({port: PORT}, function () {
  console.log('listening on port ' + PORT);
});

server.on('connection', function (conn) {
  console.log('connection opened');

  conn.onerror = function (err) {
    console.log('connection error', err);
  };

  conn.onclose = function () {
    console.log('connection closed');
  };

  conn.onmessage = function (event) {
    var data = event.data;
    console.log('message', data);
  };
});

setInterval(function () {
  for (var id in server.connections) {
    if (server.connections.hasOwnProperty(id)) {
      server.connections[id].send('Hello ' + id + ' ' + new Date().toISOString());
    }
  }
}, 5000);