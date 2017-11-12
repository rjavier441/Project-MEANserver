// PROJECT: 		MEANserver
// Name: 			Rolando Javier
// File: 			route_handlers.js
// Date Created: 	October 26, 2017
// Last Modified: 	November 5, 2017
// Details:
//				 	This file abstracts all route handler functions to be used by server.js. The server.js file
//				 	takes these and places them to their desired endpoints. This frees up the server code from
//				 	the clutter introduced by placing all route handlers in server.js. All functions defined here
// 					are written to service requests for their corresponding endpoints (defined in server.js)
// Dependencies:
// 					JQuery v1.12.4
// 					ExpressJS 4.x
// 					body-parser (NPM middleware req'd by ExpressJS 4.x to acquire POST data parameters: "npm install --save body-parser")

"use strict"

// Includes
var settings = require("./settings");	// acquire system settings
var logger = require("./logger");		// acquire main system logger
var assert = require("assert");

// Global Constants
const ALL_COLLECTIONS = null;

// Containers
var handle_map = {};		// A map of all endpoint handlers
var database = null;		// A link to our MongoDB database

// ExpressJS transaction options
var options = {
	root: settings.root,	// Server root directory (i.e. where server.js is located)
	dotfiles: "deny",
	headers: {
		"x-timestamp": Date.now(),
		"x-sent": true
	}
};

// MongoDB client
var mongo = require("mongodb").MongoClient;
mongo.connect("mongodb://localhost:27017/testdb", function (err, db) {
	// Log connection status, and error (if any)
	if (err) {
		logger.log("Could not connect to Mongo:\n" + err);
		assert.equal(err, null);	// will throw error if not null
	} else {
		logger.log("Connected to Mongo");

		// First, acquire link to database
		database = db;

		// Then, write server connection information
		var postmark = logger.log("Database connection established");
		var written = insertDoc("serverStarts", {
			"login": postmark
		});
		if (!written) {
			logger.log("Postmark not written to database");
		} else {
			logger.log("Postmark successfully written to server");
		}
	}
});



// BEGIN Handler Functions
/*	
	@function	rootHandler
	@parameter	request - the web request object provided by express.js
	@parameter	response - the web response object provided by express.js
	@returns	n/a
	@details 	This function handles all requests for the server root (i.e. "/"). Used on a GET request
*/
handle_map.rootHandler = function (request, response) {			// GET request on root dir (login page-> index.html)
	response.set("Content-Type", "text/html");
	response.sendFile("index.html", options, function (error) {
		if (error) {
			logger.log(error);
			response.status(500).end();
		} else {
			logger.log(`Sent index.html to ${settings.port}`);
			response.end();
		}
	});
};

/*
	@function	loginHandler
	@parameter	request - the web request object provided by express.js
	@parameter	response - the web response object provided by express.js
	@returns	n/a
	@details 	This function handles login endpoint requests (i.e. for login). Used on a POST request
*/
handle_map.loginHandler = function (request, response) {			// POST request: RESTful login
	var handlerTag = {"src": "loginHandler"};
	logger.log(`Login request from ip ${request.ip}`, handlerTag);
	logger.log(request.toString(), handlerTag);
	response.set("Content-Type", "text/javascript");
	response.sendFile("js/index.js", options, function (error) {
		if (error) {
			logger.log(error, handlerTag);
			response.status(500).end();
		} else {
			logger.log(`Login successful for client on ${settings.port}`, handlerTag);
			response.end();
		}
	});
};

/*
	@function 	app243Handler
	@parameter	request - the web request object provided by express.js
	@parameter	response - the web response object provided by express.js
	@returns	n/a
	@details 	This function handles app243 endpoint requests (i.e. for app). Used on a GET request
*/
handle_map.app243Handler = function (request, response) {
	console.log(`CMPE 243 app request ${request.params.id} from ${request.ip}`);
	logger.log(`CMPE 243 app request ${request.params.id} from ${request.ip}`);
	response.set("Content-Type", "text/javascript");
	response.sendFile("app243/index.html", options, function (error) {
		if (error) {
			console.log(error);
			logger.log(error);
			response.status(500).end();
			throw error;
		} else {
			console.log(`Granted app243 access for client on ${settings.port}`);
			logger.log(`Granted app243 access for client on ${settings.port}`);
			response.end();
		}
	});
}

/*
	@function	testHandler
	@parameter	request - the web request object provided by express.js
	@parameter	response - the web response object provided by express.js
	@returns	n/a
	@details 	This function serves the test page for all "/test" endpoint requests. Used on a GET request
*/
handle_map.testHandler = function (request, response) {
	var handlerTag = {"src": "testHandler"};
	logger.log(`Test page requested from ip ${request.ip}`, handlerTag);
	logger.log(request.toString(), handlerTag);
	response.set("Content-Type", "text/html");	// forces the browser to interpret the file as an interactive webpage
	response.sendFile("test.html", options, function (error) {
		if (error) {
			logger.log(error, handlerTag);
			response.status(500).end();
		} else {
			logger.log(`Test Handler passed to client ip ${request.ip} on port ${settings.port}`, handlerTag);
			response.end();
		}
	});
}

/*
	@function 	testWriteHandler
	@parameter	request - the web request object provided by express.js
	@parameter	response - the web response object provided by express.js
	@returns	To Client: If successful, returns a success status (200). Otherwise, returns a server error status (500) and populates the reponse header with the error's details
	@details 	This function performs a database write to the db from the test page for all "/test/write" endpoint requests. Used on a POST request
*/
handle_map.testWriteHandler = function (request, response) {
	var handlerTag = {"src": "testWriteHandler"};
	logger.log(`Client @ ip ${request.ip} is requesting to write to the database`, handlerTag);
	
	// Perform Write
	insertDoc("testMsg", {"sender": "RJ", "msg": "hi"}, function (error) {	// Note: I really should validate this data before passing it to the db
		// Will put inside insertDoc's callback:
		if (error == null) {
			response.status(200).send("Wrote to database").end();
		} else {
			response.status(500).send("Couldn't write to database").end();
		}
	});
}

/*
	@function 	testFindHandler
	@parameter	request - the web request object provided by express.js
	@parameter	response - the web response object provided by express.js
	@returns	To Client: If successful, returns a success status (200) and the list of collections found. Otherwise, returns a server error status (500) and populates the response header with the error's details
	@details 	This function...
*/
handle_map.testFindHandler = function (request, response) {
	var handlerTag = {"src": "testFindHandler"};
	var hasEmptyBody = (Object.keys(request.body).length > 0);
	var searchCriteria = (hasEmptyBody) ? delintRequestBody(request.body).name : ALL_COLLECTIONS;

	logger.log(`Client @ ip ${request.ip} is requesting to find ${(searchCriteria === ALL_COLLECTIONS) ? "all collections" : ("collection " + JSON.stringify(searchCriteria))} from the database`, handlerTag);

	// Testing
	// logger.log(`REQ ROUTE: ${JSON.stringify(request.route)}`);
	// logger.log(`REQ QUERY: ${JSON.stringify(request.query)}`);
	// logger.log(`REQ BODY: ${JSON.stringify(searchCriteria)}`);
	// response.status(200).send("Testing").end();

	findCollections(searchCriteria, function (err, list) {
		if (err == null) {
			logger.log(`A result was returned`, handlerTag);
			response.status(200).send(JSON.stringify(list)).end();
		} else {
			logger.log(`An error occurred`, handlerTag);
			response.status(500).send(err).end();
		}
	});
}
// END Handler Functions



// BEGIN Database Functions
/*
	@function 	insertDoc
	@parameter	collection - the string name of the database collection to write to
	@parameter	doc - the JSON object to write to the DB
	@parameter 	callback - (optional) a callback function to run after writing to the database. It is passed two parameters:
					error - if an error occurred, "error" is an object detailing the issue. Otherwise, it is null.
	@returns	n/a
	@details 	This function inserts a single document to the destination collection
*/
function insertDoc (collection, doc, callback) {
	var handlerTag = {"src": "insertDoc"};
	var validInput = (collection !== null && doc !== null && (typeof doc) === "object") ? true : false;

	// Make sure that the parameters are not invalid
	if (validInput) {
		// Check if database collection exists
		// database.collection(collection).insertOne(doc);
		database.collection(collection, {strict: true}, function (error, result) {
			if (error != null) {
				// If an error occurred, log the error and 
				logger.log(`Error looking up collection "${collection}": ` + error.toString(), handlerTag);
				if (typeof callback === "function") {
					callback(error);
				}
			} else {
				// Else, no error occurred, and the database collection was found; use it to write to the database
				result.insertOne(doc);
				logger.log(`Successfully wrote "${JSON.stringify(doc)}" to collection "${collection}"`, handlerTag);
				if (typeof callback === "function") {
					callback(null);
				}
			}
		});
	} else {
		logger.log(`Error: Invalid input`, handlerTag);
	}
}

/*
	@function 	findCollections
	@parameter	collectionName - a string specifying the name of the collection to find. Passing this parameter as null will force @function findCollections() to list all collections in the database
	@parameter 	callback - a callback function to run after writing to the database. It is passed two parameters:
					error - if an error occurred, "error" is an object detailing the issue. Otherwise, it is null.
					list - the array list of collections returned by the search
	@returns	n/a
	@details 	This function searches for collections fitting the filter criteria if given, or all existing collections if not.
	@note 		See MongoDB's Db.listCollections API doc for more information regarding the parameters
*/
function findCollections (collectionName, callback) {
	var handlerTag = {"src": "findCollections"};
	var searchCriteria = (collectionName != undefined && typeof collectionName === "string") ? {"name": collectionName} : undefined;

	switch (searchCriteria === undefined) {
		// Valid searchCriteria was given
		case false: {
			logger.log(`Returning search result for collection ${searchCriteria.name}`, handlerTag);
			database.listCollections(searchCriteria).toArray(callback);
			break;
		}

		// Otherwise, return the full list of database collections
		default: {
			logger.log(`Returning full collection list`, handlerTag);
			database.listCollections().toArray(callback);
		}
	}
}
// END Database Functions



// BEGIN Utility Methods
/*
	@function 	delintRequestBody
	@parameter 	body - the JSON object forming the POST request body
	@parameter 	callback - (optional) a callback function to run after delinting. It is passed the delinted request body object
	@returns 	If callback is undefined, returns the delinted request body object
	@details 	This function is intended for use on the ExpressJS request.body parameter. Since body-parser seems to allow the output JSON's keys to include the starting "?" from the querystring, it needs to be removed from the key. This function does precisely that by adding a new parameter to the object before returning it
	@note		The "?" seems to only appear in the first key passed, and always seems to start at the front of the key.
*/
function delintRequestBody (body, callback) {
	var handlerTag = {"src": "delintRequestBody"};
	// logger.log(`Delinting ${JSON.stringify(body)}`, handlerTag);	// Debug
	var newBody = body;
	var newBodyKeys = Object.keys(newBody);	// array of keys
	for(var i = 0; i < newBodyKeys.length; i++) {
		var qmarkIndex = newBodyKeys[i].indexOf("?");
		if (qmarkIndex !== -1) {
			// logger.log(`Lint found at ${newBodyKeys[i]} index ${qmarkIndex}`, handlerTag);	// Debug
			// If the key has a "?", create a new property without it.
			var newKeyName = newBodyKeys[i].substring(qmarkIndex+1);	// acquires the string without "?" in it
			newBody[newKeyName] = newBody[newBodyKeys[i]];		// copy the original value over
			// logger.log(`New key: ${typeof newKeyName} ${newKeyName}\nNew object: ${JSON.stringify(newBody)}`);	// Debug

			// Since we know there is only one key with the "?", we no longer need to go through the array
			if (typeof callback === "undefined") {
				return newBody;
			} else {
				callback(newBody);
			}
			break;
		}
	}
}
// END Utility Methods



module.exports = handle_map;
// END route_handlers.js 
