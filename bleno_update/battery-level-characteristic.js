var util = require('util');

var bleno = require('../bleno-master');

var Descriptor = bleno.Descriptor;
var Characteristic = bleno.Characteristic;


var mpu6050 = require('./mpu6050');
var mpu = new mpu6050();
mpu.initialize();

var testReadCount=0;
var dataBatteryLevel=0;

var BatteryLevelCharacteristic = function() {
  BatteryLevelCharacteristic.super_.call(this, {
    uuid: '2A19',
    properties: ['notify', 'read'],
    descriptors: [
      new Descriptor({
        uuid: '2902',
        value: 'Battery level between 0 and 100 percent'
      })
    ]
  });
};

util.inherits(BatteryLevelCharacteristic, Characteristic);

function testBattery(){
	testReadCount++;
	if((dataBatteryLevel+testReadCount*8)<=100){
		dataBatteryLevel+=testReadCount*8;
		
	}
	else if((dataBatteryLevel-testReadCount*3)>=0){
		dataBatteryLevel-=testReadCount*3;
	}
	else{
		testReadCount=0;
		dataBatteryLevel=50;
	}
}



function readI2C(){
	// Test the connection before using.
  mpu.testConnection(function(err, testPassed) {
  if (testPassed) {
      mpu.getMotion6(function(err, data){
      console.log(data);
    });
    // Put the MPU6050 back to sleep.
    mpu.setSleepEnabled(1);
  }
  else{
	  console.log('error in i2c communication');
  }
});
}

BatteryLevelCharacteristic.prototype.onReadRequest = function(offset, callback) {
  
    // test
	testBattery();
	readI2C();
	var data=new Uint8Array(2);
	data[0]=dataBatteryLevel&0xFF;
	data[1]=(dataBatteryLevel-10)>0?(dataBatteryLevel-10):20;
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
	readI2C();
	testBattery();
	var data=new Uint8Array(2);
	data[0]=dataBatteryLevel&0xFF;
	data[1]=(dataBatteryLevel-10)>0?(dataBatteryLevel-10):20;
	console.log("SUB batteryLevel=",data[0]);
	console.log("SUB batteryHealth=",data[1]);
                //poll sensor or get value or something
                updateValueCallback(data);
            }, 1000);
};

BatteryLevelCharacteristic.prototype.onUnsubscribe = function(){
	 console.log("Device unsubscribed");
     clearInterval(this.interval);
}


module.exports = BatteryLevelCharacteristic;