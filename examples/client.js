var ReconnectingWebSocket = require('../index').ReconnectingWebSocket;

var URL = 'ws://localhost:3000';
var conn = new ReconnectingWebSocket(URL, {
  id: 'client1'
});

conn.onclose = function () {
  console.log('connection closed');
};

conn.onopen = function () {
  console.log('connection opened');
};

conn.onerror = function (err) {
  console.log('connection error', err);
};

conn.onmessage = function (event) {
  var data = event.data;
  console.log('message', data);
};


setInterval(function () {
  conn.send('Hello from ' + conn.id +  ' ' + new Date().toISOString());
}, 5000);

// for debugging
if (typeof window !== 'undefined') {
  window['conn'] = conn;
}