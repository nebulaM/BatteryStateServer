# BatteryStateBLEServer
This is the server which provides battery data for [an Mobile App](https://github.com/nebulaM/BatteryStateBLE)

This server communicates with the phone App via Bluetooth Low Energy.

The server runs on an Raspberry Pi 3 (OS is [raspbain](https://www.raspberrypi.org/downloads/raspbian/)). Detailed instruction on how to install it can be found in the file [raspberryPiBLE.txt](https://github.com/nebulaM/BatteryStateServer/blob/master/raspberryPiBLE.txt).

The code is heavily based on an example in [bleno](https://github.com/sandeepmistry/bleno).

Due to an issue in UUID 2902, inside an "if" statement at line 283 of file gatt.js(bleno/lib/hci-socket/gatt.js), please replace: 

```javascript
this._handles[i].uuid === '2902' && this._handles[i].value.readUInt16LE(0) !== 0 
```

with 

```javascript
(this._handles[i].uuid === '2902' ||this._handles[i].uuid === '2901')) 
```

Or replace the original gatt.js file with [this one](https://github.com/nebulaM/BatteryStateServer/blob/master/gatt.js).

## Usage
```sh
sudo node $YourFileDir/bleno_update/main.js
```
