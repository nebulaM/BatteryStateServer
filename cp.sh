#!/bin/bash
remote="pi@192.168.137.200:/home/pi/"
remotePW="pi123123"
usage () {
	echo ""
	echo "This script copies files from local to remote"
	echo ""
	echo "Usage: bash cp.sh [remoteDir] [localDir(s)] "
	echo ""
	echo "Example 1, copy [1.txt] and [2.txt] in [./a1] to remote:"
	echo "bash cp.sh ./a1/1.txt ./a1/2.txt /home/pi/Documents/a1";
	echo ""
	echo "Example 2, copy all files from [./a1] to remote:";
	echo "bash cp.sh ./a1/* /home/pi/Documents/a1";
	echo ""
	exit 1;
}

if [ $1 == "-h" ]; then
	usage
fi

if [ $# -lt 2 ]; then
	usage
fi

if [ $# == 2 ]; then
	if [ ! -f $1 ]; then
		echo "cannot find file(s)"
		exit 1
	fi
	echo "cp $1 to $remote$2"
	sshpass -p $remotePW scp $1 $remote$2 && echo "finished"
else
	files=""
	declare -a array
	i=0
	for name in "${@}"; do
		array[$i]=$name
		let i=i+1
	done
	i=0
	# convert [$# - 1] to a number using $(($# - 1))
	while [[ i -lt $(($# - 1)) ]]; do
		if [ ! -f ${array[i]} ]; then
			echo "cannot find file(s)"
			exit 1
		fi
		files="$files${array[i]} "
		let i=i+1
	done
	echo "cp ${files}to $remote${@:$#}"
	sshpass -p $remotePW scp $files$remote${@:$#} && echo "finished"
fi



	







