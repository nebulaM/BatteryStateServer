#!/bin/bash
# Author: nebuleM [nebulem12@gmail.com]
# Date:	  Mar 6th, 2017
# Intsall node for ARMv6 instead of ARMv7
# pull battery-service from repo BatteryStateServerBinary
mkdir /home/pi/Documents
DOCDIR=/home/pi/Documents
initDIR=$(pwd)

echo "config bluetooth..."
sudo systemctl stop bluetooth
sudo systemctl disable bluetooth
sudo hciconfig hci0 up

echo "install node-v6.4.0..."
source $initDIR/install-node-v6.4.0.sh 

echo "resolve dependences..."
sudo apt-get install -y bluetooth bluez libbluetooth-dev libudev-dev libusb-1.0-0-dev

sudo apt-get install -y git
cd $DOCDIR
git init
git pull https://github.com/nebulaM/BatteryStateServerBinary
rm -r $DOCDIR/.git/*
rmdir $DOCDIR/.git

#for IP addr on Pi
echo "0.0.0.0" > $DOCDIR/ipAddr.txt
chown pi:pi $DOCDIR/ipAddr.txt
chown pi:pi $DOCDIR/battery-service

#setup i2c general(one time setup)
# > to overrite, >> to append
sudo echo "i2c-bcm2708" >> /etc/modules && echo "appended i2c-bcm2708 to /etc/modules..."
sudo modprobe i2c-bcm2708
#check that device is up
lsmod

sudo echo "dtparam=i2c_arm=on" >> /boot/config.txt && echo "appended dtparam=i2c_arm=on to /boot/config.txt..."

#comment out the line below if you have another way to init fuel gauge chip
#python $DOCDIR/init/init_i2c.py

#bashrc setup
sudo cat $initDIR/bashrc_wlog >> /home/pi/.bashrc && echo "setup job onReboot..."

#important,install a crontab on reboot to prevent from a strange "command disallowed error"
echo "@reboot sudo node /home/pi/Documents/battery-service/main.js" >> mycron
crontab mycron && echo "installed crontab..."
rm mycron

#auto start a terminal on boot
sudo echo "@lxterminal" >> /home/pi/.config/lxsession/LXDE-pi/autostart && echo "setup autostart a terminal onReoot..."

#essential for writting IP into a file
cp $initDIR/writeIP.sh $DOCDIR
sudo chmod +x $DOCDIR/writeIP.sh

echo "finsihed all setup... Please reboot your device"




