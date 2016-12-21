import RPi.GPIO as GPIO
import time
import subprocess
GPIO.setmode(GPIO.BCM)
GPIO.setup(14, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

while True:
	if (GPIO.input(14) == 1):
		subprocess.call("/home/pi/Documents/writeIP.sh", shell=True)
	time.sleep(1)