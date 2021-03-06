/*
  Noble-Sockets example
  
  This example uses Sandeep Mistry's noble library for node.js to
  create a central server that reads and connects to BLE peripherals 
  and sends this info to a browser with socket.io
  
  created 15 Jan 2015
  by Maria Paula Saba
*/

//importing node modules (libraries)
var noble = require('noble'),
    express = require('express'),
    http = require('http'),
    async = require('async'),
    open = require("open");
var count = 0;
//var io = require('socket.io').listen(server);


var uartServiceUuid = 'ffe0';
var txCharacteristicUuid = 'ffe1';
var rxCharacteristicUuid = 'ffe1';

var txCharacteristic, rxCharacteristic, fromBluetooth;
var writeWithoutResponse = false;

// create a server calling the function onRequest
var app = express();
var server = http.createServer(app); 

// start the server 
server.listen(8080);
//console.log('Server is listening to http://localhost on port 8080');
//open("http://localhost:8080");

//read index.html page
app.use('/public/js', express.static(__dirname + '/public/js'));
app.use('/public/css', express.static(__dirname + '/public/css'));
console.log(__dirname + '/public/index.html');
app.get('/', function (request, response) {
	response.sendFile(__dirname + '/public/index.html');
});

//array to save all peripherals found
var peripherals = [];

//variable to save UUID for the connected peripheral
var connected = "";

//to save interval on reading RSSI
var RSSIinterval;

//Bluetooth ON or OFF
noble.on('stateChange', function(state) {
	if (state === 'poweredOn') {
		console.log("start scanning");
		noble.startScanning([], true);//[uartServiceUuid], false);		
		//noble.startScanning();
	} else {
		noble.stopScanning();
		console.log("stop scanning, is Bluetooth on?");
	}
});
//console.log(" Entering discover function !");

noble.on('discover', function(peripheral) {
        // if (peripheral.advertisement.localName !== "DOPEY") {
        // return;
        // }
        noble.stopScanning();
	/*
	var peripheralData = {
		"name": peripheral.advertisement.localName,
		"uuid": peripheral.uuid
	}


	//check if this peripheral has been found previously
	var newPeripheral = true;
	peripherals.forEach(function(element){
	    	if(element.uuid === peripheral.uuid){
    			newPeripheral = false;
	    	}
	});

	//if it is a new one
	if(newPeripheral){
		console.log('Peripheral new found?');
		console.log(peripheral.advertisement.localName);

		//save to array in server
		peripherals.push(peripheral);

		//send peripheral discovered to client
		io.sockets.emit('peripheral', peripheralData);
		console.log(peripheralData);
                console.log('Sent to client?');
		//connectPeripheral(peripheral);
	}
	*/
        peripheral.connect(function(err) {
                if (err) {
	                console.error('Error connecting: ' + err);
        	        return;
                }

                console.log('Connected to ' + peripheral.advertisement.localName);

                peripheral.discoverServices(null, function(err, services) {
                        if (err) {
                	        console.log('Error discovering services: ' + err);
                        	return;
                        }

                        services.forEach(function(service) {
                                	if (service.uuid !== uartServiceUuid) {
                                	return;
                                }

                                service.discoverCharacteristics(null, function(err, characteristics) {
                                        characteristics.forEach(function(characteristic) {

                                                if (txCharacteristicUuid === characteristic.uuid) {
                                        	        txCharacteristic = characteristic;

	                                                if (characteristic.properties.indexOf("writeWithoutResponse") > -1) {
		                                                writeWithoutResponse = true;
	                                                }
                                                }  
                                                if (rxCharacteristicUuid === characteristic.uuid) {

	                                                rxCharacteristic = characteristic;
	                                                rxCharacteristic.notify(true);
	                                                rxCharacteristic.on('read', function(data, notification=false) {
								//console.log("value sent from bluetooth : " + notification);
	                                                        if (notification) {
									count = count + 1;
									//console.log("Read from bluetooth device : ");
									//fromBluetooth = getData(String(data));
									fromBluetooth = String(data);
		                                                        //console.log("Before format : " + data);
									
									//var isNewLine = String(data).search(char(34));
									//if(isNewLine != null)
										//{
										//console.log("Newline Found" + String(data).Substring(0,isNewLine));

											//}
									//fromBluetooth = String(data).trim().endsWith("\n");
		                                                        //console.log(String);
		                                                        //console.log("After format : " + fromBluetooth);
									if (count === 1){

		                                                        	console.log(fromBluetooth);
		                                                        	//console.log(fromBluetooth.split('\n')[0]);
										io.sockets.emit('dataLogged', fromBluetooth);
										count = 0;
									}//logData(String(data));
									/*	
									io.sockets.on('connection', function(socket){
										socket.emit('message', 'You are connected!');
									});
									*/
		                                                        if (txCharacteristic && rxCharacteristic) {
			                                                        //console.log('Ready33');
										//console.log("In first condition");
			                                                        txCharacteristic.write(Buffer.from("received",data));
		                                                        	//console.log('Ready2');
		                                                        }
	                                                        }
                                                        });
                                                }

                                                if (txCharacteristic && rxCharacteristic) {
							//console.log('Ready');
							//console.log("In second condition");
							txCharacteristic.write(Buffer.from("AT"));
							//txCharacteristic.write(Buffer.from("try1"));
							//console.log('Ready2');
                                                }
                                        });
                                });
                        });
                });

                peripheral.once('disconnect', function(err) {
                        console.log('Disconnected');

                        txCharacteristic = null;
                        rxCharacteristic = null;

                        noble.startScanning([uartServiceUuid], false);
                });
        });
});
//console.log("Outside noble : " + fromBluetooth);
///*

function getData(data){
	var tempData = data;
	var n = tempData.indexOf('\n');
	
	while(~n){
		var tempData1 = tempData.substring((0, n));
		return tempData1;
	}
}
//this function is called in the sockets part
function connectPeripheral(peripheral) {
	/*noble.stopScanning();

	//connect to peripheral
	peripheral.connect(function(error){
        	console.log('connected to peripheral');  
	        connected = peripheral.uuid;

		//log some data from it
		logData(peripheral);
	
		//read RSSI every 60 seconds
		RSSIinterval = setInterval(getRSSI, 60);  

		//callback function to once disconnect happens
		peripheral.once('disconnect', function() {
			console.log('peripheral disconneted');
			connected = "";
			clearInterval();
		        io.sockets.emit('disconnectedPeripheral', peripheral.uuid);
       			noble.startScanning();
		});
  	});*/
}

function logData(peripheral){
	/*
	var advertisement = peripheral.advertisement;
	var localName = advertisement.localName;
	var txPowerLevel = advertisement.txPowerLevel;
	var manufacturerData = advertisement.manufacturerData;
	console.log("Peripheral "+localName + " with UUID " + peripheral.uuid  + " connected");
	console.log("TX Power Level "+ txPowerLevel + ", Manufacturer "+ manufacturerData);
	
	var data = "Peripheral with name "+localName + " and UUID " + peripheral.uuid  + " has signal strenght (RSSI) of <span id='rssi'>"+ peripheral.rssi+".<span>" ;
	//<br/> TX Power Level "+ txtPowerLevel + ", Manufacturer "+ manufacturerData;
	*/
	data = peripheral;
	io.sockets.emit('dataLogged',data);

}

function getRSSI(peripheral){
	for (var i = 0; i < peripherals.length; i++){
		if(connected == peripherals[i].uuid){
			var uuid = peripherals[i].uuid

			peripherals[i].updateRssi(function(error, rssi){
			      	//rssi are always negative values
			        if(rssi < 0) io.sockets.emit('rssi', {'rssi': rssi, 'uuid':uuid});
			});
		}
	}
}
//*/

var io = require('socket.io').listen(server);
io.sockets.on('connection', 
	// We are given a websocket object in our function. This object has an id
	function (socket) {	
		
		//check if clients are connected
		//console.log("We have a new client: " );	
		//console.log("We have a new client: " + socket.id);

		socket.on('scan', function() {
			// Request to rescan
			peripherals = [];
			console.log("start scanning client");
			noble.startScanning();
		});
		
		socket.on('explorePeripheral', function(data) {
			//find the right peripheral to connect
			peripherals.forEach(function(element){
				if(element.uuid === connected){
					element.disconnect();
				}
				else if(element.uuid === data){
			    		connectPeripheral(element);
			    	}
			});
		});
		//console.log("In socket connection : !!!!!!!!!!");
		//socket.emit('message', fromBluetooth);
		socket.on('message', function(data) {
			//console.log('Ready in send function');
			if (txCharacteristic && rxCharacteristic) {
				//console.log('message from client : ');
				//console.log(data);
			        txCharacteristic.write(Buffer.from(data));
				//console.log('Message from bluetooth : ');
				var ack_to_client = fromBluetooth;//data;
				//console.log(ack_to_client);
				//socket.send(JSON.stringify(ack_to_client));	//Sending the Acknowledgement back to the client , this will trigger "message" event on the clients side
				socket.send(ack_to_client);	//Sending the Acknowledgement back to the client , this will trigger "message" event on the clients side
                        }
		});
		socket.on('clicked', function(data){
			console.log("click function : ", fromBluetooth);
			socket.emit('buttonUpdate', fromBluetooth);
		});

		

		socket.on('disconnectPeripheral', function(data) {
			//find the right peripheral to disconnect
			peripherals.forEach(function(element){
		    		if(element.uuid === data){
		    			element.disconnect();
					console.log('peripheral disconnet requested by client');
		    		}
	    		});

		});
		socket.on('disconnect', function() {
			//check if clients have disconnected
			//console.log("Client has disconnected");
			clearInterval(RSSIinterval);
       			noble.startScanning();
		});
		
	}
);
//console.log("Exiting socket connection function !");

