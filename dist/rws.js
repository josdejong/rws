!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.rws=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var WebSocket = require('./WebSocket');

/**
 * An automatically reconnecting WebSocket connection
 * @param {string} url
 * @param {Object} options    Available options:
 *                            - id: number | string          An optional identifier for the server
 *                                                           to be able to identify clients.
 *                                                           After connection, the client will send
 *                                                           a message {method: 'greeting', id: id}
 *                            - reconnectInterval: number    Reconnect interval in milliseconds
 *                            - reconnectInterval: number    Reconnect interval in milliseconds
 * @constructor
 */
function ReconnectingWebSocket (url, options) {
  var me = this;

  this.id = options && options.id || randomUUID();
  this.url = url + '/?id=' + this.id;

  this.socket = null;
  this.opened = false;
  this.closed = false;

  this.options = {
    reconnectTimeout: Infinity, // ms
    reconnectInterval: 5000     // ms
    //reconnectDecay: 2 // TODO: reconnect decay
  };

  // copy the options
  if (options) {
    if ('reconnectTimeout' in options)  this.options.reconnectTimeout = options.reconnectTimeout;
    if ('reconnectInterval' in options) this.options.reconnectInterval = options.reconnectInterval;
  }

  this.queue = [];

  this.attempts = 0;
  this.reconnectTimer = null;

  function connect() {
    me.socket = new WebSocket(me.url);

    me.socket.onmessage = function (event) {
      me.onmessage(event);
    };

    me.socket.onerror = function (error) {
      if (me.socket.readyState === WebSocket.OPEN) {
        me.onerror(error);
      }
      else {
        reconnect();
      }
    };

    me.socket.onopen = function (event) {
      // reset the number of connection attempts
      me.attempts = 0;

      // emit events
      if (!me.opened) {
        me.onopen(event);
        me.opened = true;
      }
      else {
        me.onreconnect(event);
      }

      // flush all messages in the queue (if any)
      //console.log('flush messages ' + me.queue);
      while (me.queue.length > 0) {
        var data = me.queue.shift();
        me.socket.send(data);
      }
    };

    me.socket.onclose = function (event) {
      if (me.closed) {
        me.onclose(event);
      }
      else {
        // start auto-reconnect attempts
        reconnect();
      }
    }
  }

  function reconnect() {
    // check whether already reconnecting
    if (me.reconnectTimer) {
      return;
    }

    me.attempts++;
    if (me.attempts < me.options.reconnectTimeout / me.options.reconnectInterval) {
      me.reconnectTimer = setTimeout(function () {
        me.reconnectTimer = null;
        connect();
      }, me.options.reconnectInterval);
    }
    else {
      // no luck, let's give up...
      me.close();
    }
  }

  connect();
}

ReconnectingWebSocket.prototype.onopen = function (event) {
  // Should be overwritten by the ReconnectingWebSocket instance
};

ReconnectingWebSocket.prototype.onreconnect = function (event) {
  // Should be overwritten by the ReconnectingWebSocket instance
};

ReconnectingWebSocket.prototype.onclose = function (event) {
  // Should be overwritten by the ReconnectingWebSocket instance
};

ReconnectingWebSocket.prototype.onerror = function (error) {
  // Should be overwritten by the ReconnectingWebSocket instance
};

ReconnectingWebSocket.prototype.onmessage = function (event) {
  // Should be overwritten by the ReconnectingWebSocket instance
};

ReconnectingWebSocket.prototype.send = function (data) {
  if (this.socket.readyState === WebSocket.OPEN) {
    this.socket.send(data);
  }
  else if (this.closed) {
    throw new Error('Socket is closed');
  }
  else {
    // if not open but reconnecting, queue the request
    this.queue.push(data);
    //console.log('queue message ' + data);
  }
};

ReconnectingWebSocket.prototype.close = function () {
  this.closed = true;
  this.opened = false;
  this.socket.close();
};

/**
 * Create a semi UUID
 * source: http://stackoverflow.com/a/105074/1262753
 * @return {String} uuid
 */
function randomUUID() {
  var S4 = function () {
    return Math.floor(
            Math.random() * 0x10000 /* 65536 */
    ).toString(16);
  };

  return (
      S4() + S4() + '-' +
      S4() + '-' +
      S4() + '-' +
      S4() + '-' +
      S4() + S4() + S4()
      );
}

module.exports = ReconnectingWebSocket;

},{"./WebSocket":2}],2:[function(require,module,exports){
if (typeof window !== 'undefined') {
  // browser
  if (window.WebSocket) {
    module.exports = window.WebSocket;
  }
  else {
    throw new Error('Your browser doesn\'t support WebSocket');
  }
} else {
  // node.js
  module.exports = require('ws');
}

},{"ws":undefined}],3:[function(require,module,exports){
exports.ReconnectingWebSocket = require('./ReconnectingWebSocket');

},{"./ReconnectingWebSocket":1}]},{},[3])(3)
});