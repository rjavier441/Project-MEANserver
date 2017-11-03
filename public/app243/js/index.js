// 	PROJECT: 		Vindicator
// 	Name: 			Rolando Javier
// 	File: 			index.js
// 	Date Created: 	November 1, 2017
// 	Last Modified: 	November 1, 2017
// 	Details:
// 					This file runs the index.html page in the Vindicator Project directory (/app243 in the rj_personal branch of Project_MEANskills)
"use strict"

// Initialize page
const DBG_MODE = false;
const CMDLINE_MAXLINES = 80;	// must be greater than 1
const intervalDelayMS = 1000;
var intervalObj = null;
var currentLineCnt = 0;
var intervalCnt = 0;
$(document).ready(init());

// Containers



// Methods
/*
	@function		init
	@parameter		n/a
	@returns		n/a
	@details 		This function initializes the page
*/
function init () {
	setDebug(true);
	console.log("Vindicator Initialized");

	testIntervalControlInit();
	modeSwitchInit();

	if (DBG_MODE) {
		intervalObj = setInterval(testPeriodicCmdlineOutput, intervalDelayMS);
	}
}

/*
	@function		modeSwitchInit
	@parameter		n/a
	@returns		n/a
	@details 		This function adds a callback to the "click" event of the navbar's mode selection buttons
*/
function modeSwitchInit () {
	// Removes class "active" from all nav elements with class "modeSelector"
	$(".modeSelector").on("click", function (){
		$(".modeSelector").removeClass("active");
		$(this).addClass("active");
		cliLog(`${$(this).attr("id")} is now active`);
	});
}

/*
	@function		testIntervalControlInit
	@parameter		n/a
	@returns		n/a
	@details 		This function adds a callback to the "click" event of the navbar option dropdown's interval button
*/
function testIntervalControlInit () {
	// Removes class "active" from all nav elements with class "modeSelector"
	$("#intervalToggle").on("click", function (){
		switch (intervalObj !== null) {
			// If true, stop test interval and reset it to null
			case true: {
				clearInterval(intervalObj);
				intervalObj = null;
				cliLog(`Stopped Console Interval Test`);
				break;
			}
			default: {
				intervalObj = setInterval(testPeriodicCmdlineOutput, intervalDelayMS);
				cliLog(`Started Console Interval Test`);
			}
		}
	});
}



// Utility Methods
/*
	@function		cliLog
	@parameter		msg - the string to log to the "consoleMain" virtual command line
	@returns		the number of characters written
	@details 		This function "logs" to the virtual "console" shown on the page. Useful for displaying raw data output from the ESP
	@note			Newlines are automatically appended to the message.
*/
function cliLog (msg) {
	currentLineCnt++;
	var previousConsoleContent = $("#consoleMain").html();
	var lastLinePosition = previousConsoleContent.lastIndexOf("\n", previousConsoleContent.length);

	// limits console's memory
	if (currentLineCnt >= CMDLINE_MAXLINES) {
		previousConsoleContent = previousConsoleContent.substring(0, lastLinePosition);
	}

	$("#consoleMain").html(`${msg}\n${previousConsoleContent}`);

	return msg.length;
}

/*
	@function		testPeriodicCmdlineOutput
	@parameter		n/a
	@returns		n/a
	@details 		This function defines a periodic time function that runs at a predefined interval
*/
function testPeriodicCmdlineOutput () {
	sendData("POST", {"stuff": "stuff"});
}

/*
	@function		sendData
	@parameter		type - the string specifying the request type (i.e. "GET", "POST", "UPDATE", etc.)
	@parameter		data - a JSON object containing the data to send
	@returns		false if invalid data/type was passed; true, otherwise
	@details 		This utility function sends data to the ESP Web Server using various request types: TBD
	@notes			This function uses post() from utility.js
*/
function sendData (type, data) {
	var invalid = true;
	switch (type) {
		case "POST": {
			post("/login", data, function (response, status, jqxhr) {
				cliLog(response);
			});
			break;
		}
		default: {
			invalid = false;
		}
	}

	return invalid;
}
// END RJ's Code 