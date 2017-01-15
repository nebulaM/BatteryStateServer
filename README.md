# BatteryStateServer

This repo contains two programs that communicate with [an Mobile App](https://github.com/nebulaM/BatteryStateBLE).

The [Bluetooth Server](https://github.com/nebulaM/BatteryStateServer/tree/master/bleno_update) collects battery data via an I2C chip and then sends this data to the phone app.

The phone app then sends the battery data to a [Network Server](https://github.com/nebulaM/BatteryStateServer/tree/master/network_server) which is used to track multiple users' battery status.