# BatteryStateNetworkServer

This server receives battery data from [an Mobile App](https://github.com/nebulaM/BatteryStateBLE) via Internet and deal with that data

##Dependency

```sh
sudo apt-get install openjdk-7-jdk
sudo apt-get install default-jre
```

##Build

in parent folder of network_server(for example if network_server is inside folder /home/usr/package, then cd home/usr/package):

```sh
javac -cp . network_server/*.java
```

##Usage

in parent folder of network_server:

```sh
java -cp . network_server.Server
```