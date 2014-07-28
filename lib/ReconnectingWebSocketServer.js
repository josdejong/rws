var url = require('url');
var Emitter = require('emitter-component');
var WebSocket = require('./WebSocket');
var WebSocketServer = WebSocket.Server;
var ReconnectingConnection = require('./ReconnectingConnection');

/**
 * An automatically reconnecting WebSocket server.
 * @param {Object} options    Available options:
 *                            - port: number                 Port number for the server
 *                            - reconnectInterval: number    Reconnect interval in milliseconds
 *                            - reconnectInterval: number    Reconnect interval in milliseconds
 * @param {function} [callback]  Callback invoked when the server is ready
 * @constructor
 */
function ReconnectingWebSocketServer (options, callback) {
  var me = this;

  this.port = options && options.port || null;
  this.server = new WebSocketServer({port: this.port}, callback);
  this.connections = {};

  this.server.on('connection', function (conn) {
    var urlParts = url.parse(conn.upgradeReq.url, true);
    var id = urlParts.query.id;

    if (id) {
      // create a connection with id
      var rConn = me.connections[id];
      if (rConn) {
        // update existing connection
        // TODO: test for conflicts, if the connection or rConn is still opened by another client with the same id
        rConn.setConnection(conn);
      }
      else {
        // create a new connection
        rConn = new ReconnectingConnection(id, conn);
        me.connections[id] = rConn;
        me.emit('connection', rConn);
      }
    }
    else {
      // create an anonymous connection (no support for restoring client connection)
      // TODO: create an option anonymousConnections=true|false
      rConn = new ReconnectingConnection(null, conn);
      me.emit('connection', rConn);
    }
  });

  this.server.on('error', function (err) {
    me.onerror(err);
  });
}

Emitter(ReconnectingWebSocketServer.prototype);

ReconnectingWebSocketServer.prototype.onerror = function (error) {
  // Should be overwritten by the ReconnectingWebSocketServer instance
};

module.exports = ReconnectingWebSocketServer;
