var i2c = require('i2c');
//0x6C on datasheet
MAX17205.DEFAULT_ADDRESS =0x36;
//0x16 on datasheet
MAX17205.UPPER_PAGE_ADDRESS=0x0b;

function MAX17205(device, address) {
  this.device = device || '/dev/i2c-1';
  this.address = address || MAX17205.DEFAULT_ADDRESS;
}

MAX17205.nRSense=0x1CF
//1BC-1BF contains a 64-bit unique number for this chip
MAX17205.nROMID0=0x1BC;

MAX17205.prototype.initialize = function() {
  this.i2cdev = new I2cDev(this.address, {device : this.device});
  this.i2cUpperPage=new I2cDev(MAX17205.UPPER_PAGE_ADDRESS,{device: this.device});

  this.i2cUpperPage.readBytes(MAX17205.nRSense,2, function(err, buffer){
	  if (err){
       console.log(err);
     }else{
       var data=(buffer.readUInt8(1)<<8)+buffer.readUInt8(0);
       console.log("nRsense is "+data);
    }
  });

};

MAX17205.prototype.setNRSense=function(callback){
  console.log("will change sense register to 0x01F4" );
  this.i2cUpperPage.writeBytes(MAX17205.nRSense,[0xF4,0x01],function(err) {if (err) return callback(err);});
};

MAX17205.DEFAULT_PACKCFG=0xA02;
MAX17205.PACKCFG_ADDR=0xBD;
MAX17205.DATA_LENGTH=2;
MAX17205.prototype.getPackCfg= function (callback) {

	/*this.i2cdev.readBytes(MAX17205.PACKCFG_ADDR,MAX17205.DATA_LENGTH,function(err, buffer){
    if (err) return callback(err);
	callback(null, buffer);
  });*/

};



/**
 *reports the voltage of the entire cell stack in 2S to 4S configuration
 * if PackCfg.BtEn = 1, Batt is a direct measurement of the VBATT pin with up to 20.48V range
 */
MAX17205.BATT_REG_ADDR=0xDA;
MAX17205.prototype.getVoltage= function (callback) {
	this.i2cdev.readBytes(MAX17205.BATT_REG_ADDR, 2, function(err, buffer){
  if (err){
     callback(err);
  }else{
  	var data=(buffer.readUInt8(1)<<8)+buffer.readUInt8(0)
  	//resolution is 1.25mv
  	var data=data/800
    callback(data);
  }
  });
};



//Current Register (00Ah)
MAX17205.CURRENT_REG_ADDR=0x0A;
MAX17205.prototype.getCurrent= function (callback) {

	this.i2cdev.readBytes(MAX17205.CURRENT_REG_ADDR, 2, function(err, buffer){
    if (err) return callback(err);
	var data=(buffer.readUInt8(1)<<8)+buffer.readUInt8(0)
	//resolution wrt sense resistance
	//var data=data/500000
	//console.log("data is "+ data);
	//console.log("~data is "+ (~data));
	data=(~data)&0xffff;
    callback(data);
  });
};

//Age Register(Percentage) (0x07)
MAX17205.AGE_REG_ADDR=0x7;
MAX17205.prototype.getHealth= function (callback) {

	this.i2cdev.readBytes(MAX17205.AGE_REG_ADDR, 1, function(err, buffer){
    if (err) return callback(err);
    callback(buffer.readUInt8(0));
  });
};

MAX17205.prototype.getUniqueID= function (callback) {
  this.i2cUpperPage.readBytes(MAX17205.nROMID0, 8, function(err, buffer){
  if (err) return callback(err);
  else{
    var data=[];
    //ONLY need the middle 6 bytes of data.
    for(i=6;i>=1;i--){
      data.push(buffer.readUInt8(i));
    }
    if(buffer.readUInt8(0)!=38){
      console.log("Warnning: This ID may not be correct" );
    }
    console.log("@getUniqueID: ID is "+data);
    callback(data);
  }
  });
};


module.exports = MAX17205;
/**
 * extends the i2c library with some extra functionality
 */
function I2cDev(address, options) {
  i2c.call(this, address, options);
}

I2cDev.prototype = Object.create(i2c.prototype);
I2cDev.prototype.constructor = I2cDev;

I2cDev.prototype.bitMask = function(bit, bitLength) {
  return ((1 << bitLength) - 1) << (1 + bit - bitLength);
};

I2cDev.prototype.readBits = function(func, bit, bitLength, callback) {
  var mask = this.bitMask(bit, bitLength);

  this.readBytes(func, 1, function(err, buf) {
    var bits = (buf[0] & mask) >> (1 + bit - bitLength);
    callback(err, bits);
  });
};

I2cDev.prototype.readBit = function(func, bit, bitLength, callback) {
  this.readBits(func, bit, 1, callback);
};

I2cDev.prototype.writeBits = function(func, bit, bitLength, value) {
  var self = this;
  self.readBytes(func, 1, function(err, oldValue) {
    var mask = self.bitMask(bit, bitLength);
    var newValue = oldValue ^ ((oldValue ^ (value << bit)) & mask);
    self.writeBytes(func, [newValue], function (err) {
      //if (err) {
        //throw err;
      //}
    });
  });
};

I2cDev.prototype.writeBit = function(func, bit, value) {
  this.writeBits(func, bit, 1, value);
};
