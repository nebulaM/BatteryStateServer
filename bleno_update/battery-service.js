var util = require('util');

var bleno = require('../bleno-master');


var BatteryLevelCharacteristic = require('./battery-level-characteristic');

var mChar=new BatteryLevelCharacteristic()
mChar.setI2cUpdateInterval(2000);

function BatteryService() {
  bleno.PrimaryService.call(this, {
      uuid: '180F',
      characteristics: [mChar]
  });
}

util.inherits(BatteryService, bleno.PrimaryService);

module.exports = BatteryService;
