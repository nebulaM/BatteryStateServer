#need sudo apt-get install python-smbus i2c-tools

#check sudo i2cdetect -y 1
import smbus as smbus

PAGE_1 = 0x36      #7 bit address (will be left shifted to add the read write bit)
PAGE_2 = 0x0B

#nVRecall=0x60

#AvCap=0x1F	#Available capacity in capacity unit
#AvSOC=0x0E	#Available SOC in %
#VFSOC=0xFF	#Present state SOC in %
#VFOCV=0xFB		#Calculated open circuit voltage
#Batt=0xDA	#Battery voltage
#Current=0x0A	#Current in current unit
#AvgCurrent=0x0B	#Average current over (Filtercfg) period


def getMax17205Address(regName):
	if regName == "nVRecall":
		return 0x60;
	elif regName =="AvCap":
		return 0x1F;
	elif regName =="AVSOC":	
		return 0x0E;
	elif regName =="VFSOC":	
		return 0xFF;
	elif regName =="VFOCV":
		return 0xFB;
	elif regName =="Batt":
		return 0xDA;
	elif regName =="Current":
		return 0x0A;
	elif regName =="AvgCurrent":
		return 0x0B;
	"""elif regName == ""
		return"""
	elif regName == "nSense"
		return 0x1CF;
	elif regName == "nDesignCap"
		return 0x1B3;
	elif regName == "nVEmpty"
		return 0x19E;
	elif regName == "nDesignVoltage"
		return 0x1D3;
	elif regName == "nPackCfg"
		return 0x1B5;
	elif regName == "nNVCfg"
		return 0x1B8;
		
"""@regAddress integer returned from getMax17205Address(regName)"""
def getPage (regAddress):
	if regAddress>= 0x0E:
		return PAGE_2;
	else:
		return PAGE_1;
		
def readRegs(device, regNames):
	for regName in regNames:
		addr=getMax17205Address(regName);
		print("from %s, read %d\n",%(regName,device.read_byte_data(getPage(addr),addr)))


if __name__ == '__main__':
	#1 = /dev/i2c-1 (port I2C1)
	bus=smbus.SMBus(1)
	bus.write_word_data(getPage(getMax17205Address("nVRecall")),getMax17205Address("nVRecall"),0xE001);
	regsToRead=["AvCap","AVSOC","VFSOC","VFOCV","Batt","Current","AvgCurrent"];
	readRegs(bus,regsToRead);
	
	
	