var express = require('express');
var app = express();
var cjson = require('cjson');
var randomstring = require("randomstring");
var https = require('https');
process.env.NAME = "cnspendpoint";
var yaml_config = require('node-yaml-config');
var config = yaml_config.load(__dirname + '/cnspendpoint.yaml');


application_root = __dirname,
    express = require("express"),
    path = require("path");
	
app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    
});

var statusCount = 0;
//for /status
var startTime = new Date();

//GET service status
//NOTE: this must be *above* app.all in this file so that is does *not* do the regular "authorization" checks
app.get('/apiv1/status', function (req, res) {
	 if (statusCount < 20 || !(statusCount % 100)) {
	     console.log('enter: /apiv1/status: ' + statusCount++);
	 }
	 else {
	     console.log('enter: /apiv1/status: ' + statusCount++);
	 }
	
	 // status
	
	 var status = {};
	
	 status.Name = 'apiv1';
	 status.Description = 'CNSP compatible endpoint service Running';
	 status.UtcCurrentTime = new Date();
	 status.CurrentTime = status.UtcCurrentTime.toString();
	 status.Port = port;
	 status.UtcStartTime = startTime;
	 status.StartTime = status.UtcStartTime.toString();
	
	 return res.send(status);
});

/*
	This API authorizes the users who request the CNSP endpoint, for an user to authorize and use this API
	one needs to send username:password in base64 encoded format in headers.
	We are maintaing list of valid users in a json file (/cnspendpoint/endpointusers.json)
*/
app.all('/apiv1*', function (req, res, next) {

    console.log('enter: all.cnsp: ');
	
    // authorization

    if (config.skipAuthorization) {

        console.log('===== TESTING: authorization is turned OFF =====');

        return next();
    }
	else{
		var authArray=req.headers.authorization.split(' ');
		var decodedString = new Buffer(authArray[1] || '', 'base64').toString('utf8');

		var decodedArray=decodedString.split(':');
		
		var usersFile = __dirname +'/endpointusers.json';
		var usersFileData = cjson.load(usersFile);
		var usersJson = usersFileData.users;
		for (var count in usersJson){
			var userObj = usersJson[count];
			if(decodedArray[0]===userObj.username && decodedArray[1]===userObj.password){
				console.log("***authentication success****");
				return next();
			}
		}
	   console.log("***authentication failed****");
	   res.set('Content-Type', 'application/json');
	   /* var result ={
						"result":{
							"success":false,
							"message":"Authentication Failed"
						}
				   } */
				   
		 var result = { 
			  "result":{ 
				 "providerresponse":{ 
					"errorcode":"401",
					"errormessage":"The user is not authorized.",
					"respcode" :401
				},
				 "success":false,
				 "message":"Authentication failed"
			  }
		   }				   
	   res.send(result);
	}

});

/* 
    Register customer
	This API requires a JSON input in body of request as specified in specifications document.	
*/
app.post('/apiv1/account', function (req, res) {
  	
	console.log('==========Create Account============'+JSON.stringify(req.body));
	
	
/*
Actual implementation to hit a Provider Service goes below

Below implemented is the dummy response.
*/
			res.set('Content-Type', 'application/json');
	
			var respObj = {};
			var resultObj = {};
			resultObj.providerresponse = {};
			resultObj.providerresponse.respcode = '200';
			resultObj.success = true;
			resultObj.message = "Account created successfully";
			resultObj.providerresponse.accountid = ""+randomstring.generate({length: 8,  charset: 'numeric'});		
			respObj.result = resultObj;				
			console.log('==========Create Account response============'+JSON.stringify(respObj));
			res.send( respObj );
});

/*Update account 
	This API requires a JSON input in body of request as specified in specifications document.	
*/
app.put('/apiv1/account', function (req, res) {
  	
	console.log('==========Update Account============');
	
	
/*
Actual implementation to hit a Provider Service goes below

Below implemented is the dummy response.
*/
			res.set('Content-Type', 'application/json');
	
			var respObj = {};
			var resultObj = {};
			resultObj.providerresponse = {};
			resultObj.providerresponse.respcode = '200';
			resultObj.success = true;
			resultObj.message = "Account updated successfully";
			resultObj.providerresponse.accountid = ""+randomstring.generate({length: 8,  charset: 'numeric'});		
			respObj.result = resultObj;				
			console.log('==========Update Account response============'+JSON.stringify(respObj));
			res.send( respObj );
})

/*Create user / subscriber 
	This API requires a JSON input in body of request as specified in specifications document.	
*/
app.post('/apiv1/user', function (req, res) {
  	
		console.log('==========Create user============');
	
	
/*
Actual implementation to hit a Provider Service goes below

Below implemented is the dummy response.
*/
		res.set('Content-Type', 'application/json');
		
		var respObj = {};
		var resultObj = {};
		resultObj.providerresponse = {};
		resultObj.providerresponse.respcode = '200';
		resultObj.success = true;
		resultObj.message = "User created successfully";
		resultObj.providerresponse.userid = ""+randomstring.generate({length: 8,  charset: 'numeric'});		
		respObj.result = resultObj;				
		console.log('==========Create user response============'+JSON.stringify(respObj));
		res.send( respObj );			
})

/*Update user / subscriber 
	This API requires a JSON input in body of request as specified in specifications document.	
*/
app.put('/apiv1/user', function (req, res) {
  	
		console.log('==========Update user============');
	
	
/*
Actual implementation to hit a Provider Service goes below

Below implemented is the dummy response.
*/
		res.set('Content-Type', 'application/json');
		
		var respObj = {};
		var resultObj = {};
		resultObj.providerresponse = {};
		resultObj.providerresponse.respcode = '200';
		resultObj.success = true;
		resultObj.message = "User updated successfully";
		resultObj.providerresponse.userid = ""+randomstring.generate({length: 8,  charset: 'numeric'});		
		respObj.result = resultObj;				
		console.log('==========Update user response============'+JSON.stringify(respObj));
		res.send( respObj );			
})

/*Create a subscription
	This API requires a JSON input in body of request as specified in specifications document.	
*/
app.post('/apiv1/resource', function (req, res) {
	
	console.log('==========Create Resource============');
	

/*
Actual implementation to hit a Provider Service goes below

Below implemented is the dummy response.
*/
	    res.set('Content-Type', 'application/json');
	    var respObj = {};
		var resultObj = {};
		resultObj.providerresponse = {};
		resultObj.providerresponse.respcode = '200';
		resultObj.success = true;
		resultObj.message = "Resource created successfully";
		resultObj.providerresponse.instanceid = ''+randomstring.generate({length: 8,  charset: 'numeric'});								    
		respObj.result = resultObj;				
		console.log('==========Create Resource response============'+JSON.stringify(respObj));
		res.send( respObj );
})

/* 
   Actions on subscription like suspend/unsuspend
*/
app.put('/apiv1/resource', function (req, res) {
  	
	console.log('==========Suspend Resource============');
	
	var action = req.body.action; //(suspend/unsuspend)
	var resourceid = req.body.instance.id; // subscriptionId which we get Provider service
	
	console.log('==========actiontype============'+action);
	console.log('==========resourceid============'+resourceid);
	
/*
Actual implementation to hit a Provider Service goes below

Below implemented is the dummy response.
*/
	res.set('Content-Type', 'application/json');
	var provideraction = "";
	var reqBody = {};
	var method = "POST";
	if(action === "update.suspend"){
		provideraction = "suspendSubscription";
	}else if(action === "update.reactivate"){
		provideraction = "unsuspendSubscription";
	}else if(action === "update.quantity"){
			var respObj = {};
			var resultObj = {};
			resultObj.providerresponse = {};
			resultObj.providerresponse.respcode = '200';
			resultObj.success = true;
			resultObj.message = "License updated successfully";
			respObj.result = resultObj;				
			res.send( respObj );
	}

if(action === "update.suspend" || action === "update.reactivate"){

			var respObj = {};
			var resultObj = {};
			resultObj.providerresponse = {};
		    var message='';
			resultObj.providerresponse.respcode = '200';
			if(action === "update.suspend"){
				message='Resource suspended successfully';
			}
			else{
				message='Resource reactivated successfully';
				
			}
			resultObj.success = true;
			resultObj.message = message;
			resultObj.providerresponse.resourceid = resourceid;
			respObj.result = resultObj;				
			res.send( respObj );
}	
})

/* 
   Assign a subscription to subscriber / user
*/
app.put('/apiv1/account/user/resource', function (req, res) {
  	
	console.log('==========entitle user============');
	
	var action = req.body.action;
	var userid = req.body.requestor.userid; // userId which we get Provider service
	var resourceid = req.body.instance.id; // subscriptionId which we get Provider service
//	var acceptTOU = req.body.parameters.TOC;
//	var force = req.body.parameters.force;
	
	var path = "";
	
	console.log('==========actiontype============'+action);
	console.log('==========resourceid============'+resourceid);
	console.log('==========userid============'+userid);
	console.log('==========config.host============'+config.host);
		
	if(action === "assign"){
		console.log("assign Resource *******");
		provideraction = "entitleSubscriber";
	}else if(action === "revoke"){
		console.log("revoke Resource *******");
		provideraction = "revokeSubscriber";
	}

	
/*
Actual implementation to hit a Provider Service goes below

Below implemented is the dummy response.
*/
	res.set('Content-Type', 'application/json');
	
	var respObj = {};
	var resultObj = {};
	resultObj.providerresponse = {};
	var message='';
	resultObj.providerresponse.respcode = '200';
	if(action === "assign"){
				resultObj.success = true;
				resultObj.message = "Subscription entitled successfully";
				resultObj.providerresponse.resourceid = ""+randomstring.generate({length: 5,  charset: 'numeric'});		
				resultObj.providerresponse.instanceid = ""+randomstring.generate({length: 4,  charset: 'numeric'});		
			
	}else if(action === "revoke"){
				resultObj.success = true;
				resultObj.message = "The given subscription revoked successfully for the subscriber";
				resultObj.providerresponse.instanceid = resourceid;		
			}
		respObj.result = resultObj;				
		res.send( respObj );
   
})


/* 
   Get all customers
*/
app.get('/apiv1/account', function (req, res) {
	
    console.log('in Retrieve all Accounts : ');

/*
Actual implementation to hit a Provider Service goes below

Below implemented is the dummy response.
*/
			   var data=__dirname +'/getAllCustomers.json'; // currently loading data from json file
			   data = cjson.load(data);
			   res.set('Content-Type', 'application/json');
			   res.send( data );
 
})


/* 
   Get customer by id
*/
app.get('/apiv1/account/:accountid', function (req, res) {
	
    console.log('in Retrieve Account : ' + req.params.accountid );
    var accountid = req.params.accountid; // accountId which we get Provider service

/*
Actual implementation to hit a Provider Service goes below

Below implemented is the dummy response.
*/
			   var data=__dirname +'/getCustomer.json'; // currently loading data from json file
			   data = cjson.load(data);
			   res.set('Content-Type', 'application/json');
			   res.send( data );

})

/* 
   Get all resources / subscriptions
*/
app.get('/apiv1/resource', function (req, res) {
	
    console.log('in Retrieve all Resources : ');

/*
Actual implementation to hit a Provider Service goes below

Below implemented is the dummy response.
*/
			   var data=__dirname +'/getAllResources.json'; // currently loading data from json file
			   data = cjson.load(data);
			   res.set('Content-Type', 'application/json');
			   res.send( data );
 
})

/* 
   Get resource / subscription details
*/
app.get('/apiv1/resource/:resourceid', function (req, res) {
	
       console.log('in Retrieve resource details : '+req.params.resourceid);
/*
Actual implementation to hit a Provider Service goes below

Below implemented is the dummy response.
*/
       var resourceid = req.params.resourceid; // subscriptionId which we get Provider service
	   var data=__dirname +'/getResource.json'; // currently loading data from json file
	   data = cjson.load(data);
	   res.set('Content-Type', 'application/json');
	   res.send( data );
 
})

/* 
   Get all users/subscribers details
*/
app.get('/apiv1/user', function (req, res) {
	
       console.log('in Retrieve all user details : ');
/*
Actual implementation to hit a Provider Service goes below

Below implemented is the dummy response.
*/
	   var data=__dirname +'/getAllUserDetails.json'; // currently loading data from json file
	   data = cjson.load(data);
	   res.set('Content-Type', 'application/json');
	   res.send( data );
  
})

/* 
   Get user/subscriber details
*/
app.get('/apiv1/user/:userid', function (req, res) {
	
       console.log('in Retrieve user details : '+req.params.userid);
/*
Actual implementation to hit a Provider Service goes below

Below implemented is the dummy response.
*/
       var userid = req.params.userid; // userId which we get Provider service
	   var data=__dirname +'/getUserDetails.json'; // currently loading data from json file
	   data = cjson.load(data);
	   res.set('Content-Type', 'application/json');
	   res.send( data );
  
});

/* 
   Delete resource/subscription
*/
app.delete('/apiv1/resource', function (req, res) {
	
	console.log('Delete subscription : ');
	var action = req.body.action;
	var resourceid = req.body.instance.id; // instanceId which we get Provider service
	
	console.log('==========actiontype============'+action);
	console.log('==========resourceid============'+resourceid);
    
	
/*
Actual implementation to hit a Provider Service goes below

Below implemented is the dummy response.
*/
			res.set('Content-Type', 'application/json');
			
			var respObj = {};
			var resultObj = {};
			resultObj.providerresponse = {};
			resultObj.providerresponse.respcode = '200';
			resultObj.providerresponse.resourceid = ""+randomstring.generate({length: 8,  charset: 'numeric'});
			resultObj.success = true;
			resultObj.message = "Subscription removed successfully";												    
			respObj.result = resultObj;				
			res.send( respObj );
});

/* 
   Delete account
*/
app.delete('/apiv1/account', function (req, res) {
	
	console.log('Delete account : ');
	var action = req.body.action;
	var accountid = req.body.accountid; // accountid which we get Provider service
	
	console.log('==========actiontype============'+action);
	console.log('==========accountid============'+accountid);
    
	
/*
Actual implementation to hit a Provider Service goes below

Below implemented is the dummy response.
*/
			res.set('Content-Type', 'application/json');
			
			var respObj = {};
			var resultObj = {};
			resultObj.providerresponse = {};
			resultObj.providerresponse.respcode = '200';
			resultObj.providerresponse.accountid = ""+randomstring.generate({length: 8,  charset: 'numeric'});
			resultObj.success = true;
			resultObj.message = "Account deleted successfully";												    
			respObj.result = resultObj;				
			res.send( respObj );
});


/* 
   Delete user/subscriber
*/
app.delete('/apiv1/user', function (req, res) {
	
	console.log('Delete user : ');
	var action = req.body.action;
	var userid = req.body.userid; // userid which we get Provider service
	
	console.log('==========actiontype============'+action);
	console.log('==========userid============'+userid);
    
	
/*
Actual implementation to hit a Provider Service goes below

Below implemented is the dummy response.
*/
			res.set('Content-Type', 'application/json');
			
			var respObj = {};
			var resultObj = {};
			resultObj.providerresponse = {};
			resultObj.providerresponse.respcode = '200';
			resultObj.providerresponse.userid = ""+randomstring.generate({length: 8,  charset: 'numeric'});	
			resultObj.success = true;
			resultObj.message = "User profile deleted successfully";												    
			respObj.result = resultObj;				
			res.send( respObj );
});

app.get('/apiv1/billing/:customerid', function (req, res) {
	
       console.log('Retrieve customer subscriptions: '+req.params.customerid);
       var customerid = req.params.customerid;
		var headers = {
			
			"Content-Type" : "application/json",
			"Authorization" : "Basic " + new Buffer(config.username + ':' + config.password).toString("base64")
		};
	
		var options = {
			host : config.host,
			path : '/api/bss/resource/subscription?_namedQuery=getSubscriptionByCustomer&customerId='+customerid,
			method : 'GET',
			headers : headers
		};
	
	return operation(options,'',function(err,resCode,data){
		
			if(err) return callback(err);
			
			console.log("Retrieve customer subscriptions*******"+resCode);

			//if(resCode==200){
			   	
			   console.log("Retrieve customer subscriptions*******"+JSON.stringify(data));
			   var list = data.List;
			   console.log("Number of subscriptions*******"+list.length);
			   res.set('Content-Type', 'application/json');
			   res.send( data );
			
			//}

	});   
})

//Common method for http request operation - customerid - 20752287 subscriptionid - 48887 - password - cnspcon@123

function operation(options,body, callback) {

    console.log('::::::::::::::::::::::::::::operation::::::::::::::::::::::::::::::::'); 	
    console.log("options*******"+JSON.stringify(options));
	options.rejectUnauthorized= false;

	options.requestCert= true;

	options.agent= false;
	
    var req = https.request(options, function (res) {
		
        var data = '';

        //the listener that handles the response chunks
        
        res.addListener('data', function (chunk) {
			
            data += chunk.toString();
        });

        res.addListener('end', function (err, result) {
			
            if (err) {
				
                console.log(err);
                return callback(err);
            } else {
			
				var resultdata = '';
				
				if(data != ''){ resultdata=JSON.parse(data); }
				
				else {  resultdata = data;  }

                return callback(null, res.statusCode, resultdata);
            }

        });
    });

    req.on('error', function (e) {

        console.log('http request on error: e.message: ' + e.message);
        return callback(e.message);

    });
    
    req.write(body);
    req.end();

};



var port = process.env.PORT;

var consoleMode = false;

if (port === undefined) {

    port = config.port;

    console.log('### console mode: ' + port);

    consoleMode = true;
}

var server = app.listen(port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("CNSP endpoint listening at http://%s:%s", host, port)

})











