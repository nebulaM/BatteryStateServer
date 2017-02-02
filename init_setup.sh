#!/bin/bash
# Author: nebuleM [nebulem12@gmail.com]
# Date:	  Jan 27th, 2017
DOCDIR=/home/pi/Documents
echo "config bluetooth..."
sudo systemctl stop bluetooth
sudo systemctl disable bluetooth
sudo hciconfig hci0 up

echo "resolve dependences..."
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y npm 
sudo apt-get install -y nodejs
sudo apt-get install -y bluetooth bluez libbluetooth-dev libudev-dev libusb-1.0-0-dev git
cd $DOCDIR
git clone https://github.com/nebulaM/bleno
mv bleno bleno-master
git clone https://github.com/nebulaM/BatteryStateServer
mkdir battery-service
mv BatteryStateServer/bleno_update/* battery-service/
mv BatteryStateServer/gatt.js bleno-master/lib/hci-socket/

#enter battery-service directory
cd battery-service
npm install node-hid
npm install
npm install i2c
#also install a module in bleno-master derictory
cd ../bleno-master
npm install

cd ../BatteryStateServer

#setup i2c general(one time setup)
# > to overrite, >> to append
sudo echo "i2c-bcm2708" >> /etc/modules && echo "appended i2c-bcm2708 to /etc/modules..."
sudo modprobe i2c-bcm2708
#check that device is up
lsmod

sudo echo "dtparam=i2c_arm=on" >> /boot/config.txt && echo "appended dtparam=i2c_arm=on to /boot/config.txt..."

python init/init_i2c.py

#bashrc setup
sudo cat ./init/bashrc >> ~/.bashrc && echo "setup job onReboot..."

#important,install a crontab on reboot to prevent from a strange "command disallowed error"
crontab -l > mycron
echo "@reboot sudo node /home/pi/Documents/battery-service/main.js" >> mycron
crontab mycron && echo "installed crontab..."
rm mycron

#auto start a terminal on boot
sudo echo "@lxterminal" >> ~/.config/lxsession/LXDE-pi/autostart && echo "setup autostart a terminal onReoot..."

#essential for writting IP into a file
cp ./writeIP.sh DOCDIR
sudo chmod +x DOCDIR/writeIP.sh

echo "finsihed all setup..."

sudo reboot now




