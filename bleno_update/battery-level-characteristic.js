const verbose=true;
const needIP=true;

var i2cInterval=false;

var util = require('util');

var bleno = require('../bleno-master');

var Descriptor = bleno.Descriptor;
var Characteristic = bleno.Characteristic;

var max17205 = require('./max17205');
var fuelGauge = new max17205();
fuelGauge.initialize();

//for getting ip
const fs = require('fs');
const path ='/home/pi/Documents/ipAddr.txt';
var hasIP=false;
if (!fs.existsSync(path)) {
  hasIP=false;
}else{
  hasIP=true;
}

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
  var ip=fs.readFileSync(path, 'ascii');
  ip=ip.trim();
  ip=ip.split(".");
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
  return byteArray
}

var uniqueID=[];
var batteryStatusQueue=[];
BatteryLevelCharacteristic.prototype.setI2cUpdateInterval=function(ms){
  this.i2cUpdateInterval=setInterval(function() {
  //6 byte uniqueID
  if(uniqueID.length!=6){
    fuelGauge.getUniqueID((function (data) {
      uniqueID=data;
      console.log("@setI2cUpdateInterval uniqueID: "+uniqueID);}));
  }
  if(batteryStatusQueue.length>20){
    //dequeue the last item from queue, drop that data
    batteryStatusQueue.shift();
  }
  
  fuelGauge.getBatteryStatus((function(data){batteryStatusQueue.push(data);}));

  fuelGauge.getCurrent((function(data){
    console.log("from fuel gauge, current is "+data);}));
  },ms);
};

BatteryLevelCharacteristic.prototype.onReadRequest = function(offset, callback) {
  var data=[];
  var errorCode=0;
  if(batteryStatusQueue.length<=0){
    errorCode=1;
  }
  if(uniqueID.length!=6){
    errorCode=1;
  }
  data.push(errorCode);
  data=data.concat(uniqueID);
  var temp=batteryStatusQueue[0];
  data.push(parseInt((temp>>8)&0xFF));
  data.push(parseInt(temp&0xFF));
  if(needIP&&hasIP){
    //data 2-5 ip addr
    var ip=readIP();
    for(var i=0;i<4;++i){
      data.push(ip[i]);
    }
  }
  if(errorCode==1){
    callback(this.RESULT_SUCCESS,errorCode);
  }else{
    if(verbose){
      console.log("@onReadRequest data to be sent is "+data);
    }
    callback(this.RESULT_SUCCESS, data);
  }
};

BatteryLevelCharacteristic.prototype.onSubscribe = function(maxValueSize, callback) {
  if(verbose){
    console.log("@onSubscribe Device  subscribed");
  }
  if(this.i2cUpdateInterval!=null){
    clearInterval(this.i2cUpdateInterval);
  }
  //data array is errorCode + uniqueID + level + health (+ IP)
  //				1 byte		6 bytes	   1 byte	1 byte	4 bytes
  //errorCode: 0-no error; 1-error
  this.setI2cUpdateInterval(300);
  this.interval=setInterval(function() {
    var data=[];
    var errorCode=0;
    if(batteryStatusQueue.length<=0){
      errorCode=1;
    }
    data.push(errorCode);
    data=data.concat(uniqueID);
    var temp=batteryStatusQueue.shift();
    data.push(parseInt((temp>>8)&0xFF));
    data.push(parseInt(temp&0xFF));

    if(errorCode==1){
      callback(errorCode);
    }else{
      if(verbose){
        console.log("@onSubscribe data to be sent is "+data);
      }
      callback(data);
    }
  }, 1000);
};

BatteryLevelCharacteristic.prototype.onUnsubscribe = function(){
  if(verbose){
    console.log("@onUnsubscribe Device unsubscribed");
    //console.log("@onUnsubscribe slower battery data update rate from 300ms to 10s");
  }
  clearInterval(this.interval);
  if(this.i2cUpdateInterval!=null){
    clearInterval(this.i2cUpdateInterval);
  }
  //this.setI2cUpdateInterval(10000);
};
module.exports = BatteryLevelCharacteristic;
