var util = require('util');

var bleno = require('../bleno-master');


var BatteryLevelCharacteristic = require('./battery-level-characteristic');

function BatteryService() {
  bleno.PrimaryService.call(this, {
      uuid: '180F',
      characteristics: [
          new BatteryLevelCharacteristic()
      ]
  });
}

util.inherits(BatteryService, bleno.PrimaryService);

module.exports = BatteryService;
