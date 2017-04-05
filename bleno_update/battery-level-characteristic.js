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
const sizeQ=10
var uniqueID=[]
var batteryStatusQ=[]
var TTEQ=[]
var TTFQ=[]
var currentQ=[]
var voltQ=[]
var cycleQ=[]
var repCapQ=[]
BatteryLevelCharacteristic.prototype.setI2cUpdateInterval=function(ms){
  this.i2cUpdateInterval=setInterval(function() {
  //6 byte uniqueID
  if(uniqueID.length!=6){
    fuelGauge.getUniqueID((function (data) {
      uniqueID=data;
      console.log("@setI2cUpdateInterval uniqueID: "+uniqueID);}));
  }
  if(batteryStatusQ.length>sizeQ){
    //dequeue the last item from queue, drop that data
    batteryStatusQ.shift();
  }
  if(TTEQ.length>sizeQ){
	TTEQ.shift()
  }
  if(TTFQ.length>sizeQ){
	TTFQ.shift()
  }
  if(currentQ.length>sizeQ){
	currentQ.shift() 
  }
  if(voltQ.length>sizeQ){
	voltQ.shift()
  } 
  if(cycleQ.length>sizeQ){
	cycleQ.shift()
  }
  if(repCapQ.length>sizeQ){
	repCapQ.shift()
  }
  fuelGauge.getBatteryStatus((function(data){batteryStatusQ.push(data);}));

  fuelGauge.getTTE((function(data){TTEQ.push(data);}));
  
  fuelGauge.getTTF((function(data){TTFQ.push(data);}));
  
  fuelGauge.getCurrent((function(data){
    currentQ.push(data)
    //console.log("from fuel gauge, current is "+data);
	}));
	
  fuelGauge.getVolt((function(data){voltQ.push(data);}));
  fuelGauge.getCycle((function(data){cycleQ.push(data);}));
  fuelGauge.getRepCap((function(data){repCapQ.push(data);}));
  },ms);
};


/**
  * data array is errorCode(1byte) + uniqueID(6b) + level(1b) + health(1b) +TTE/TTF(2b)+Current(2b)+Voltage(2b)+Cycles(2b)+RepCap(2b)
 
  * errorCode: 0-no error
 */
function prepareData(){
  var data=[]
  var errorCode=0
  if(batteryStatusQ.length<=0){
    errorCode=1
  }else if(TTEQ.length<=0 && TTFQ.length<=0){
	errorCode=2  
  }else if(currentQ.length<=0){
	errorCode=4
  }else if(voltQ.length<=0){
	errorCode=5
  }else if(cycleQ.length<=0){
	errorCode=6
  }
  else if(repCapQ.length<=0){
	errorCode=7
  }
  
  data.push(errorCode);
  data=data.concat(uniqueID);
  var temp=batteryStatusQ.shift();
  data.push(parseInt((temp>>8)&0xFF))
  data.push(parseInt(temp&0xFF))
  
  var current=currentQ.shift()
  if(current<=0){
	temp=TTEQ.shift()
	TTFQ.shift()
    data.push(parseInt((temp>>8)&0xFF))
    data.push(parseInt(temp&0xFF)) 
  }else{
	temp=TTFQ.shift()
	TTEQ.shift()  
	data.push(parseInt((temp>>8)&0xFF))
    data.push(parseInt(temp&0xFF))  
  }
  data.push(parseInt((current>>8)&0xFF))
  data.push(parseInt(current&0xFF))  
  var volt=voltQ.shift()
  data.push(parseInt((volt>>8)&0xFF))
  data.push(parseInt(volt&0xFF))  
  
  var cycle=cycleQ.shift()
  data.push(parseInt((cycle>>8)&0xFF))
  data.push(parseInt(cycle&0xFF))  
  var repCap=repCapQ.shift()
  data.push(parseInt((repCap>>8)&0xFF))
  data.push(parseInt(repCap&0xFF))  
  return data;
}
BatteryLevelCharacteristic.prototype.onReadRequest = function(offset, callback) {

  var data=prepareData();
 
  if(needIP&&hasIP){
    //data 2-5 ip addr
    var ip=readIP();
    for(var i=0;i<4;++i){
      data[15+i]=ip[i];
    }
  }
  data[0]=9
  
    if(verbose){
      console.log("@onReadRequest data to be sent is "+data);
    }
    callback(this.RESULT_SUCCESS, data);
  
};

BatteryLevelCharacteristic.prototype.onSubscribe = function(maxValueSize, callback) {
  if(verbose){
    console.log("@onSubscribe Device  subscribed");
  }
  this.interval=setInterval(function() {
    var data=prepareData();
    
      if(verbose && data[0]!=0){
        console.log("@onSubscribe data to be sent is "+data);
      }
      callback(data);
    
  }, 3003);
};

BatteryLevelCharacteristic.prototype.onUnsubscribe = function(){
  if(verbose){
    console.log("@onUnsubscribe Device unsubscribed");
  }
  clearInterval(this.interval);
};
module.exports = BatteryLevelCharacteristic;
