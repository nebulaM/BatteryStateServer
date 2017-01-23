# BatteryStateServer

This repo contains two programs that communicate with [an Mobile App](https://github.com/nebulaM/BatteryStateBLE).

For a new Raspberry Pi that can be used as a Bluetooth Server, use [raspbain](https://www.raspberrypi.org/downloads/raspbian/) OS and run the one time setup script **init_setup.sh** as root(important)
```sh
chmod 777 ./init_setup.sh
sudo ./init_setup.sh
```

The [Bluetooth Server](https://github.com/nebulaM/BatteryStateServer/tree/master/bleno_update) collects battery data via an I2C chip and then sends this data to the phone app.

The phone app then sends the battery data to a [Network Server](https://github.com/nebulaM/BatteryStateServer/tree/master/network_server) which is used to track multiple users' battery status.