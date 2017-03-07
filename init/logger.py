#Copyright TaiZhi Yang
import smbus
import sys
from time import sleep as Second
import logging

PAGE_1 = 0x36      #7 bit address (will be left shifted to add the read write bit)
PAGE_2 = 0x0B

device=smbus.SMBus(1)

"""@regAddress integer returned from getMax17205Address(regName)"""
def getPage (regAddress):
	if regAddress>= 0xE0:
		#print("address: %04x returns page 2"%(regAddress))
		return PAGE_2;
	else:
		#print("address: %04x returns page 1"%(regAddress))
		return PAGE_1;

logging.basicConfig(filename='log2.txt',format='%(created)d %(message)s',level=logging.DEBUG)
print('started logging data to /home/pi/log.txt')

while 1:
	
	vol=device.read_word_data(getPage(0xDA),0xDA)
	vol=vol*1.25/1000

	cur=device.read_word_data(getPage(0x0A),0x0A)
	neg=(cur&0x8000)>>15
	if neg==1:
		cur=((~cur)+1)&0xffff
		cur=cur*0.625*(-1)/1000
	else:
		cur=cur*0.625/1000

	soc=device.read_word_data(getPage(0x06),0x06)
	soc=(soc>>8)&0xff

	cap=device.read_word_data(getPage(0x06),0x35)
	cap=cap*0.002

	#print('%.3f %.3f %d' %(vol,cur,soc))

#logger
	logging.info(', %.3f, %.3f, %d, %.2f' %(vol,cur,soc,cap))
	#print('logged')
	Second(180)