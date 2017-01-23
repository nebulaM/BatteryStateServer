#!/bin/bash

echo "config bluetooth..."
sudo systemctl stop bluetooth
sudo systemctl disable bluetooth
sudo hciconfig hci0 up

echo "resolve dependences..."
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install npm nodejs bluetooth bluez libbluetooth-dev libudev-dev libusb-1.0-0-dev

cd ~/Documents
git clone https://github.com/nebulaM/bleno
mv bleno bleno-master
git clone https://github.com/nebulaM/BatteryStateServer
mkdir battery-service
mv BatteryStateServer/bleno_update/* battery-service/
mv BatteryStateServer/gatt.js bleno/lib/hci-socket/


#enter battery-service directory
cd battery-service
npm install node-hid
npm install
npm install i2c
#also install a module in bleno-master derictory
cd ../bleno-master
npm install

cd ..


#setup i2c general(one time setup)
#add i2c-bcm2708
# > to overrite, >> to append
echo "i2c-bcm2708" > myi2c
sudo cat /etc/modules ./myi2c >> /etc/modules
rm myi2c
sudo modprobe i2c-bcm2708
#check device is up
lsmod

echo "dtparam=i2c_arm=on" > myi2cboot
sudo cat /boot/config.txt ./myi2cboot >> /boot/config.txt
rm myi2cboot

sudo cat ~/.bashrc ./init/bashrc >> ~/.bashrc

#important,install a crontab on reboot to prevent from a strange "command disallowed error"
crontab -l > mycron
echo "@reboot sudo node /home/pi/Documents/battery-service/main.js" >> mycron
crontab mycron
rm mycron
#auto start a terminal on boot
#add this to end of file:
echo "@lxterminal" > myAuto
sudo cat ~/.config/lxsession/LXDE-pi/autostart ./myAuto >> ~/.config/lxsession/LXDE-pi/autostart
rm myAuto

echo "finsihed setup"




