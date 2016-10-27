var util = require('util');
var exec = require('child_process').exec;

var bleno = require('../bleno-master');

var Descriptor = bleno.Descriptor;
var Characteristic = bleno.Characteristic;

var testReadCount=0;
var testBatteryValue=0;

var BatteryLevelCharacteristic = function() {
  BatteryLevelCharacteristic.super_.call(this, {
    uuid: '2A19',
    properties: ['read'],
    descriptors: [
      new Descriptor({
        uuid: '2901',
        value: 'Battery level between 0 and 100 percent'
      })
    ]
  });
};

util.inherits(BatteryLevelCharacteristic, Characteristic);
function testBattery(){
	testReadCount++;
	if((testBatteryValue+testReadCount*8)<=100){
		testBatteryValue+=testReadCount*8;
		
	}
	else if((testBatteryValue-testReadCount*3)>=0){
		testBatteryValue-=testReadCount*3;
	}
	else{
		testReadCount=0;
		testBatteryValue=50;
	}
}
BatteryLevelCharacteristic.prototype.onReadRequest = function(offset, callback) {
  
    // test
	testBattery();
	var data=new Uint8Array(2);
	data[0]=testBatteryValue&0xFF;
	data[1]=(testBatteryValue-10)>0?(testBatteryValue-10):20;
	callback(this.RESULT_SUCCESS, data);
	console.log("testBatteryValue=",testBatteryValue);
	console.log("data[0]=",data[0]);
	console.log("data[1]=",data[1]);
  
};

module.exports = BatteryLevelCharacteristic;
1