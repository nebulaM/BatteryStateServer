const util = require('util');
const EventEmitter = require('events');

function Battery() {
  EventEmitter.call(this);
}

util.inherits(Battery, EventEmitter);
//2 byte data, first byte is battery level, second is battery health
Battery.prototype.write = function(data) {
  this.emit('data', data);
};