#need sudo apt-get install python-smbus i2c-tools
#check sudo i2cdetect -y 1
import smbus
import sys
from time import sleep as waitSecond

PAGE_1 = 0x36      #7 bit address (will be left shifted to add the read write bit)
PAGE_2 = 0x0B
T_POR=0.05 #10ms on datasheet, extend to 50ms
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
	elif regName =="nSense":
		return 0x1CF;
	elif regName =="nDesignCap":
		return 0x1B3;
	elif regName =="nVEmpty":
		return 0x19E;
	elif regName =="nDesignVoltage":
		return 0x1D3;
	elif regName =="nPackCfg":
		return 0x1B5;
	elif regName =="nNVCfg":
		return 0x1B8;
	elif regName =="CommStat":
		return 0x61;
	elif regName =="FullCapNom":
		return 0x23;
	else:
		sys.exit();
"""@regAddress integer returned from getMax17205Address(regName)"""
def getPage (regAddress):
	if regAddress>= 0xE0:
		#print("address: %04x returns page 2"%(regAddress))
		return PAGE_2;
	else:
		#print("address: %04x returns page 1"%(regAddress))
		return PAGE_1;
		
def readRegs(device, regNames):
	for regName in regNames:
		addr=getMax17205Address(regName);
		print("from %s, read %04x\n" %(regName,device.read_word_data(getPage(addr),addr)));

def writeRegs(device, regNamesWithData):
	for input in regNamesWithData:
		regName, sep, data=input.partition("=");
		data=int(data,16);
		addr=getMax17205Address(regName);
		device.write_word_data(getPage(addr),addr,data);
		print("write %s with data %04x\n" %(regName,data));

def readRegsWCheck(device,regNamesWithData):
	listNotPass=[];
	for input in regNamesWithData:
		regName, sep, data=input.partition("=");
		data=int(data,16);
		addr=getMax17205Address(regName);
		readData=device.read_word_data(getPage(addr),addr);
		print("from %s, read %04x\n" %(regName,readData));
		if readData!=data:
			print("error! at location %s expect %04x but read %04x" %(regName,data,readData));
			listNotPass.append(input);
		return listNotPass;
		
if __name__ == '__main__':
	#1 = /dev/i2c-1 (port I2C1)
	bus=smbus.SMBus(1);
	cmdAddr=getMax17205Address("nVRecall");
	#shallow RAM gets data in nonvolite memory
	bus.write_word_data(getPage(cmdAddr),cmdAddr,0xE001);
	
	regsToRead=["AvCap","AVSOC","VFSOC","VFOCV","Batt","Current","AvgCurrent"];
	readRegs(bus,regsToRead);
	
	regsToWrite=["nSense=0x000A","nDesignCap=0x7530","nVEmpty=0xC4E3","nDesignVoltage=0x1014",
	"nPackCfg=0xA03","nNVCfg=0x34","FullCapNom=0x7530"];
	while True:
		writeRegs(bus,regsToWrite);
		regsToWrite=readRegsWCheck(bus,regsToWrite);
		if len(regsToWrite) == 0:
			print("All write operation passed");
			break;
		print("retry write operation");
		count=count+1;
		if count>50:
			print("error: tried to write "+regsToWrite);
			sys.exit();
			
	#clear CommonStat.NVError
	commStatAddr=getMax17205commStatAddress("CommStat");
	commonStatData=(bus.read_word_data(getPage(commStatAddr),commStatAddr))&0xFFFB;
	while (bus.read_word_data(getPage(commStatAddr),commStatAddr) & 0x4) == 0x4:
		bus.write_word_data(getPage(commStatAddr),commStatAddr,commonStatData);
	print ("CommonStat.NVError is cleared, CommonStat is %04x" %(bus.read_word_data(getPage(commStatAddr),commStatAddr)))
	while True:
		#write to nonvolite memory, the nonvolite memory of max17205 can only be written 7 times
		bus.write_word_data(getPage(cmdcommStatAddr),cmdcommStatAddr,0xE904);
		print ("Now waiting 10s...");
		waitSecond(10);
		commonStat=bus.read_word_data(getPage(commStatAddr),commStatAddr);
		print ("CommonStat %04x" %(commonStat))
		if ( commonStat & 0x4) == 0:
			break;
	print ("CommonStat.NVError is cleared, block copied");
	#POR the flash
	bus.write_word_data(getPage(cmdAddr),cmdAddr,0x000F);
	print("%04x" %(bus.read_word_data(getPage(0x1ED),0x1ED)));
	print ("reset chip");
	bus.write_word_data(getPage(cmdAddr),cmdAddr,0x0F);
	waitSecond(T_POR);
	bus.write_word_data(getPage(0xBB),0xBB,0x01);
	waitSecond(T_POR);
	print ("finished I2C chip setup");