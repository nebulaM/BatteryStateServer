const verbose=true;
const needIP=true;


var util = require('util');

var bleno = require('../bleno-master');

var Descriptor = bleno.Descriptor;
var Characteristic = bleno.Characteristic;

var max17205 = require('./max17205');
var fuelGauge = new max17205();
fuelGauge.initialize(function(err,data){
  if(err!=null){
    console.log("error when trying to read nRSense");
    console.log(err);
  }
  else if(data!=0x01f4){
    fuelGauge.setNRSense(function(err){if(err!=null) console.log(err);});
  }
});

//for getting ip
const fs = require('fs');

var testReadCount=0;

var batteryHealth=0;

var BatteryLevelCharacteristic = function() {
  BatteryLevelCharacteristic.super_.call(this, {
    uuid: '2A19',
    properties: ['notify', 'read'],
    descriptors: [
      new Descriptor({
        uuid: '2902',
        value: 'Battery ststus'
      })
    ]
  });
};

util.inherits(BatteryLevelCharacteristic, Characteristic);

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
var batteryLevelQueue=[];
function readI2C(){
  this.voltageInterval=setInterval(function() {
    if(batteryLevelQueue.length<=30){
      fuelGauge.getVoltage((function(data){
        batteryLevelQueue.push((data-12)*142.86);
        console.log("@readI2C put into queue: from fuel gauge, voltage is "+data);
      }));
    }else{
      //dequeue the last item from queue
      batteryLevelQueue.shift();
    }
  },500);
  	fuelGauge.getCurrent((function(data){
		console.log("from fuel gauge, current is "+data);
	}));

	fuelGauge.getHealth((function(data){
		console.log("from fuel gauge, health is "+data);
	}));
}
//test
var x=100
BatteryLevelCharacteristic.prototype.onReadRequest = function(offset, callback) {
	var data=new Uint8Array(6);
  if(batteryLevelQueue.length>0){
	   data[0]=parseInt(batteryLevelQueue.shift())&0xFF;
  }else{
    data[0]=0;
  }
	data[1]=x
	x=x>0?x-1:100;
  if(needIP){
    //data 2-5 ip addr
  	var ip=readIP();
  	for(var i=0;i<4;++i){
  		data[i+2]=ip[i]
  	}
  }else{
    //TODO:A better number to indicate no ip
    data[3]=0;
  }
  if(verbose){
  	console.log("@onReadRequest data array "+data);
    console.log("@onReadRequest batteryLevel= "+data[0]);
  	console.log("@onReadRequest batteryHealth= "+data[1]);
  }
	callback(this.RESULT_SUCCESS, data);
};


BatteryLevelCharacteristic.prototype.onSubscribe = function(maxValueSize, callback) {
  if(verbose){
    console.log("@onSubscribe Device  subscribed");
  }
  readI2C();
  this.interval=setInterval(function() {

	var data=new Uint8Array(3);
  if(batteryLevelQueue.length>0){
	   data[0]=parseInt(batteryLevelQueue.shift())&0xFF;
  }else{
    data[0]=0;
  }
	data[1]=95;
	data[3]=0;
  if(verbose){
  	console.log("@onSubscribe batteryLevel is "+data[0]);
  	console.log("@onSubscribe batteryHealth is ",data[1]);
  }
  //poll sensor or get value or something
  callback(data);
  }, 1000);
};

BatteryLevelCharacteristic.prototype.onUnsubscribe = function(){
  if(verbose){
    console.log("@onUnsubscribe Device unsubscribed");
  }
  clearInterval(this.interval);
}


module.exports = BatteryLevelCharacteristic;
