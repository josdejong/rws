rws
===

A reconnecting WebSocket for node.js and the browser.

Features:

- Automatically reconnect closed sockets.
- Messages are queued while reconnecting, both server side as well as client side.
- Client works both in the browser and in node.js.

`rws` builds upon the [`ws`](https://github.com/einaros/ws) WebSocket library.


## Install

    npm install rws

## Use

### Server

```
var rws = require('rws');

var PORT = 3000;
var server = new rws.ReconnectingWebSocketServer({port: PORT}, function () {
  console.log('listening on port ' + PORT);
});

server.on('connection', function (conn) {
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
```

### Client

```js
var ReconnectingWebSocket = require('rws').ReconnectingWebSocket;

var URL = 'ws://localhost:3000';
var conn = new ReconnectingWebSocket(URL, {
  id: 'client1' // optional id, used by the server to re-identify the client when reconnecting
});

conn.onmessage = function (event) {
  var data = event.data;
  console.log('message', data);
};

setInterval(function () {
  conn.send('Hello from ' + conn.id +  ' ' + new Date().toISOString());
}, 5000);
```


## API

TODO: describe API

    
## Build

To build the library for use in the browser:

    npm run build
    
This basically bundles and minifies `ReconnectingWebSocket` using browserify. When browserifying, the library `ws` is excluded as this is not needed in the browser.


## License

Copyright (C) 2014 Jos de Jong <wjosdejong@gmail.com>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


