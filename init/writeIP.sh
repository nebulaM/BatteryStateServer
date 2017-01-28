#!/bin/bash
ifconfig wlan0 | grep "inet addr:" | cut -d: -f2 | awk ' {print $1} ' > /home/pi/Documents/ipAddr.txt && echo "updated IP"
