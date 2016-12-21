var util = require('util');

var bleno = require('../bleno-master');

var Descriptor = bleno.Descriptor;
var Characteristic = bleno.Characteristic;


var max17205 = require('./max17205');
var fuelGauge = new max17205();
fuelGauge.initialize();

//for getting ip
const fs = require('fs');


var testReadCount=0;
var batteryLevel=0;

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

/*function testBattery(){
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
}*/


function readIP(){  
  var ip=fs.readFileSync('/home/pi/Documents/ipAddr.txt', 'ascii');
  ip=ip.trim();
  ip=ip.split(".");
  //console.log(ip);
  var byteArray = new Uint8Array(ip.length);
  for(var i=0;i<ip.length;++i){
	  for(var j=0;j<ip[i].length;++j){
		 switch(ip[i].length-1-j){
			case 0:
				byteArray[i]+=(ip[i].charCodeAt(j)-48);
				break;
			case 1:
				byteArray[i]+=(ip[i].charCodeAt(j)-48)*10;
				break;
			case 2:
				byteArray[i]+=(ip[i].charCodeAt(j)-48)*100;
				break;
			default:
				byteArray[i]+=(ip[i].charCodeAt(j)-48);
				break;
	  }
	}
  }
  //console.log(byteArray)
  return byteArray
}


function readI2C(){
	// Test the connection before using.
  //fuelGauge.testConnection(function(err, testPassed) {
  //if (testPassed) {
      fuelGauge.getVoltage( (function(data){
	  batteryLevel=(data-12)*142.86
	//callback(data);
	console.log("from fuel gauge, voltage is "+data);
  }));
  	fuelGauge.getCurrent((function(data){
		console.log("from fuel gauge, current is "+data);
	}));
}
var x=100
BatteryLevelCharacteristic.prototype.onReadRequest = function(offset, callback) {
  
    readI2C();
	var data=new Uint8Array(6);
	data[0]=parseInt(batteryLevel)&0xFF;
	data[1]=x
	x=x>0?x-1:100;
	//data 2-5 ip addr
	var ip=readIP();
	for(var i=0;i<4;++i){
		data[i+2]=ip[i]
	}
	console.log(data)
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
	
	var data=new Uint8Array(3);
	console.log(batteryLevel);
	data[0]=parseInt(batteryLevel)&0xFF;
	data[1]=95;
	data[3]=0;
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