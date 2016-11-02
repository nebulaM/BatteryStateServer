var util = require('util');

var bleno = require('../bleno-master');

var Descriptor = bleno.Descriptor;
var Characteristic = bleno.Characteristic;

var testReadCount=0;
var testBatteryValue=0;

var BatteryLevelCharacteristic = function() {
  BatteryLevelCharacteristic.super_.call(this, {
    uuid: '2A19',
    properties: ['notify', 'read'],
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
	console.log("batteryLevel=",data[0]);
	console.log("batteryHealth=",data[1]);
  
};


BatteryLevelCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
console.log('Device  subscribed'); //output that we've subscribed
            //Now the central has subscribed, poll something 
            //(the sensor or whatever you're using) every half 
            //second to see if the value has updated
   this.interval=setInterval(function() {
				testBattery();
	var data=new Uint8Array(2);
	data[0]=testBatteryValue&0xFF;
	data[1]=(testBatteryValue-10)>0?(testBatteryValue-10):20;
	console.log("SUB batteryLevel=",data[0]);
	console.log("SUB batteryHealth=",data[1]);
                //poll sensor or get value or something
                updateValueCallback(data);
            }, 500);
};

BatteryLevelCharacteristic.prototype.onUnsubscribe = function(){
	 console.log("Device unsubscribed");
     clearInterval(this.interval);
}


module.exports = BatteryLevelCharacteristic;