var WebSocket = require('./WebSocket');

/**
 * Create a reconnecting connection
 * @param {number | string} id      Identifier for this connection
 * @param {WebSocket} [connection]  A client connection
 * @constructor
 */
function ReconnectingConnection(id, connection) {
  this.id = id;
  this.connection = null;
  this.closed = false;
  this.queue = [];

  this.setConnection(connection);
}

ReconnectingConnection.prototype.onclose = function () {
  // Should be overwritten by the ReconnectingConnection instance
};

ReconnectingConnection.prototype.onerror = function (error) {
  // Should be overwritten by the ReconnectingConnection instance
};

ReconnectingConnection.prototype.onmessage = function (event) {
  // Should be overwritten by the ReconnectingConnection instance
};

ReconnectingConnection.prototype.setConnection = function (connection) {
  this.connection = connection || null;

  if (connection) {
    var me = this;
    connection.onerror = function (err) {
      me.onerror(err);
    };

    connection.onclose = function (event) {
      // TODO: start a timer which awaits a reconnect. If timed out, mark this connection as permanently closed and don't accept any more messages to the queue
    };

    // TODO: improve performance by directly binding the onmessage function to the connection,
    //       requires this function a property so we can monitor changes.
    connection.onmessage = function (event) {
      me.onmessage(event);
    };

    // flush all messages in the queue (if any)
    //console.log('flush messages ' + this.queue);
    while (this.queue.length > 0) {
      var data = this.queue.shift();
      this.connection.send(data);
    }
  }
};

ReconnectingConnection.prototype.send = function (data) {
  if (this.connection && this.connection.readyState === WebSocket.OPEN) {
    this.connection.send(data);
  }
  else if (this.closed) {
    throw new Error('Connection is closed');
  }
  else {
    // if not open but reconnecting, queue the request
    this.queue.push(data);
    //console.log('queue message ' + data)
  }
};

ReconnectingConnection.prototype.close = function () {
  this.closed = true;
  this.connection.close();
  this.onclose();
};

module.exports = ReconnectingConnection;
