var i2c = require('i2c');
//0x6C on datasheet
MAX17205.LOWER_PAGE =0x36;
//0x16 on datasheet
MAX17205.UPPER_PAGE=0x0b;

function MAX17205(device, address) {
  this.device = device || '/dev/i2c-1';
  this.address = address || MAX17205.LOWER_PAGE;
}

MAX17205.prototype.initialize = function() {
  this.pageL = new i2c(MAX17205.LOWER_PAGE, {device : this.device});
  this.pageH = new i2c(MAX17205.UPPER_PAGE, {device : this.device});
};


MAX17205.RepSoc=0x06;
MAX17205.prototype.getBatteryStatus= function (callback) {
  this.pageL.readBytes(MAX17205.RepSoc, 4, function(err, buffer){
    if (err){callback(err);}
    else{
      //16-8 bit: level, 7-0 bit: health
      var data=((buffer.readUInt8(1)<<8)&0xff00)+((buffer.readUInt8(3))&0xff)
      callback(data);
    }
  });
};

MAX17205.prototype.getTTE= function (callback) {
  this.pageL.readBytes(0x11, 2, function(err, buffer){
    if (err){callback(err);}
    else{
      var data=((buffer.readUInt8(1)<<8)&0xff00)+((buffer.readUInt8(0))&0xff)
	  data=parseInt(data/10.67)
      callback(data);
    }
  });
};
MAX17205.prototype.getTTF= function (callback) {
  this.pageL.readBytes(0x20, 2, function(err, buffer){
    if (err){callback(err);}
    else{
      var data=((buffer.readUInt8(1)<<8)&0xff00)+((buffer.readUInt8(0))&0xff)
	  data=parseInt(data/10.67)
      callback(data);
    }
  });
};
/**
 * return current in mA
 */
MAX17205.CURRENT_REG=0x0A;
MAX17205.prototype.getCurrent= function (callback) {
    this.pageL.readBytes(MAX17205.CURRENT_REG, 2, function(err, buffer){
    if (err) return callback(err);
    var data=(buffer.readUInt8(1)<<8)+buffer.readUInt8(0)
    if((data&0x8000) === 0x8000){
		data=parseInt(((~data)&0xffff)*-0.625)
	}else{
		data=parseInt(data*0.625)
	}
    callback(data);
  });
};


/**
 * return voltage in mV
 */
MAX17205.VOLT_REG=0xDA;
MAX17205.prototype.getVolt= function (callback) {
    this.pageL.readBytes(MAX17205.VOLT_REG, 2, function(err, buffer){
    if (err) return callback(err);
    var data=(buffer.readUInt8(1)<<8)+buffer.readUInt8(0)
    data=parseInt(data*1.25)
    callback(data);
  });
};

/**
 * cycle left
*/
MAX17205.Cycle=0x17
MAX17205.prototype.getCycle= function (callback) {
    this.pageL.readBytes(MAX17205.Cycle, 2, function(err, buffer){
    if (err) return callback(err);
    var data=(buffer.readUInt8(1)<<8)+buffer.readUInt8(0)
    data=parseInt(Math.round(data*0.16))
    callback(data);
  });
};


//1BC-1BF contains a 64-bit unique number for this chip
MAX17205.nROMID0=0x1BC;
MAX17205.prototype.getUniqueID= function (callback) {
  this.pageH.readBytes(MAX17205.nROMID0, 8, function(err, buffer){
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