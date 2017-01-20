var express = require('express');
var app = express();
var fs = require("fs");
var cjson = require('cjson');
var randomstring = require("randomstring");
var https = require('https');
var http = require("http");
var uuid = require('node-uuid');
process.env.NAME = "googleendpoint";
var yaml_config = require('node-yaml-config');
var config = yaml_config.load(__dirname + '/googleendpoint.yaml');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

var googleOAuth2 = require('./google.oauth2');
var google_admin_user_scope = require('./google_admin_user_scope.oauth2');
var randomstring = require("randomstring");

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
	 status.Description = 'google Connections Endpoint Service Running';
	 status.UtcCurrentTime = new Date();
	 status.CurrentTime = status.UtcCurrentTime.toString();
	 status.Port = port;
	 status.UtcStartTime = startTime;
	 status.StartTime = status.UtcStartTime.toString();
	
	 return res.send(status);
});


var port = process.env.PORT;

var consoleMode = false;

if (port === undefined) {

    port = config.port;

    console.log('### console mode: ' + port);

    consoleMode = true;
}

app.all('/apiv1*', function (req, res, next) {

    console.log('enter: all.google: ');
    res.set('Content-Type', 'application/json');
	var respObj = {};
	var resultObj = {};
	resultObj.providerresponse = {};
	
    // authorization

    if (config.skipAuthorization) {

        console.log('===== TESTING: authorization is turned OFF =====');

        return next();
    }
	else{
		if(req.headers.authorization){
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
				resultObj.providerresponse.respcode = 500;					
				resultObj.success = false;
				resultObj.providerresponse.errorcode = 500;
				resultObj.providerresponse.errormessage = 'Failed to authorize the user';
				respObj.result = resultObj;				
			    res.send(respObj);
		}
		else{
			   console.log("***authentication not provided****");
				resultObj.providerresponse.respcode = 500;					
				resultObj.success = false;
				resultObj.providerresponse.errorcode = 500;
				resultObj.providerresponse.errormessage = 'Authorization details not provided, Username:Password expected in base64 encoded format';
				respObj.result = resultObj;				
			    res.send(respObj);
			
		}
	}

    //return next();
});


// Retrieve customer from google 
app.get('/apiv1/account/:accountId', function (req, res) {
  	
    res.set('Content-Type', 'application/json');
	console.log('==========Get Account accountId============'+req.params.accountId);
	
	var respObj = {};
	var resultObj = {};
	resultObj.providerresponse = {};
	var account={};

	// Load client secrets from a local file.
	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		  if (err) {
			console.log('Error loading client secret file: ' + err);
			return;
		  }
		  // Authorize a client with the loaded credentials, then call the
		  // Google Apps Reseller API.
		googleOAuth2.authorize(JSON.parse(content),function(err, result) {
	
				return getCustomer(result,req.params.accountId,function(err,result){
					if(err){
						console.log('Get Account err::::'+JSON.stringify(err));
						resultObj.providerresponse.respcode = err.code;					
						resultObj.success = false;
						resultObj.providerresponse.errorcode = err.code;
						if(err.errors){
							resultObj.message = err.errors[0].message;
							resultObj.providerresponse.errormessage = err.errors[0].message;
						}
						else{
							resultObj.message = 'Unauthorized Client';
							resultObj.providerresponse.errormessage = 'Unauthorized Client';
						}
						respObj.result = resultObj;				
						res.send( respObj );
					}
					else{
							var contactArray=result.postalAddress.contactName.split(' ');
							var accounts=[];
							var profile={};
							var default_address={};
							resultObj.providerresponse.accounts=accounts;
							resultObj.providerresponse.respcode=200;
							account.accountid=result.customerId;
							account.domainName=result.customerDomain;
							account.profile=profile;
							account.profile.default_address=default_address;
							account.profile.first_name=contactArray[0];
							account.profile.last_name=contactArray[1];
							account.profile.company_name=result.postalAddress.organizationName;
							account.profile.default_address.address_line1=result.postalAddress.addressLine1;
							account.profile.default_address.city=result.postalAddress.locality;
							account.profile.default_address.region=result.postalAddress.region;
							account.profile.default_address.postal_code=result.postalAddress.postalCode;
							account.profile.default_address.country=result.postalAddress.countryCode;
							resultObj.providerresponse.accounts.push(account);
							resultObj.success=true;
							resultObj.message='Account retrieved successfully';
							respObj.result = resultObj;	
							res.send(respObj);
					}
				  
				});
		  });
	  });	
})
// Retrieve user from google 
app.get('/apiv1/account/user/:userid', function (req, res) {
  	
    res.set('Content-Type', 'application/json');
	console.log('==========Get User userid============'+req.params.userid);
	
	var respObj = {};
	var resultObj = {};
	resultObj.providerresponse = {};
	var account={};

	// Load client secrets from a local file.
	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		  if (err) {
			console.log('Error loading client secret file: ' + err);
			return;
		  }
		  // Authorize a client with the loaded credentials, then call the
		  // Google Apps Reseller API.
		google_admin_user_scope.authorize(JSON.parse(content),function(err, result) {
	
				return getUser(result,req.params.userid,function(err,result){
					if(err){
						console.log('Get User err::::'+JSON.stringify(err));
						resultObj.providerresponse.respcode = err.code;					
						resultObj.success = false;
						resultObj.providerresponse.errorcode = err.code;
						if(err.errors){
							resultObj.message = err.errors[0].message;
							resultObj.providerresponse.errormessage = err.errors[0].message;
						}
						else{
							resultObj.message = 'Unauthorized Client';
							resultObj.providerresponse.errormessage = 'Unauthorized Client';
						}
						respObj.result = resultObj;				
						res.send( respObj );
					}
					else{
							//var contactArray=result.postalAddress.contactName.split(' ');
							var users=[];
							var profile={};
							var default_address={};
							resultObj.providerresponse.users=users;
							resultObj.providerresponse.respcode=200;
							account.userid=result.id;
							account.domainName=result.customerDomain;
							account.profile=profile;
							account.profile.default_address=default_address;
							account.profile.first_name=result.name.givenName;
							account.profile.last_name=result.name.familyName;
							//account.profile.company_name=result.postalAddress.organizationName;
							account.profile.default_address.email=result.primaryEmail;
/* 							account.profile.default_address.address_line1=result.postalAddress.addressLine1;
							account.profile.default_address.city=result.postalAddress.locality;
							account.profile.default_address.region=result.postalAddress.region;
							account.profile.default_address.postal_code=result.postalAddress.postalCode;
							account.profile.default_address.country=result.postalAddress.countryCode;
 */							resultObj.providerresponse.users.push(account);
							resultObj.success=true;
							resultObj.message='User details retrieved successfully';
							respObj.result = resultObj;	
							res.send(respObj);
					}
				  
				});
		  });
	  });	
})

// Retrieve user from google 
app.get('/apiv1/users/:domain', function (req, res) {
  	
    res.set('Content-Type', 'application/json');
	console.log('==========Get Users userid============'+req.params.domain);
	
	var respObj = {};
	var resultObj = {};
	resultObj.providerresponse = {};
	var account={};

	// Load client secrets from a local file.
	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		  if (err) {
			console.log('Error loading client secret file: ' + err);
			return;
		  }
		  // Authorize a client with the loaded credentials, then call the
		  // Google Apps Reseller API.
		google_admin_user_scope.authorize(JSON.parse(content),function(err, result) {
	
				return getUsers(result,req.params.domain,function(err,result){
					if(err){
						console.log('Get Users err::::'+JSON.stringify(err));
						resultObj.providerresponse.respcode = err.code;					
						resultObj.success = false;
						resultObj.providerresponse.errorcode = err.code;
						if(err.errors){
							resultObj.message = err.errors[0].message;
							resultObj.providerresponse.errormessage = err.errors[0].message;
						}
						else{
							resultObj.message = 'Unauthorized Client';
							resultObj.providerresponse.errormessage = 'Unauthorized Client';
						}
						respObj.result = resultObj;				
						res.send( respObj );
					}
					else{
							//var contactArray=result.postalAddress.contactName.split(' ');
							if(result.users && result.users.length>0){
									var users=[];
								for (var i = 0; i < result.users.length; i++) {
									account={};
									var profile={};
									var default_address={};
									resultObj.providerresponse.users=users;
									resultObj.providerresponse.respcode=200;
									account.userid=result.users[i].id;
									account.customerid=result.users[i].customerId;
									account.domainName=result.users[i].customerDomain;
									account.profile=profile;
									account.profile.default_address=default_address;
									account.profile.first_name=result.users[i].name.givenName;
									account.profile.last_name=result.users[i].name.familyName;
									account.profile.default_address.email=result.users[i].primaryEmail;
		 							resultObj.providerresponse.users.push(account);
									resultObj.success=true;
									resultObj.message='User details retrieved successfully';
									respObj.result = resultObj;	
								}
									res.send(respObj);

							}
					}
				  
				});
		  });
	  });	
})
/**
 * Lists the available users you manage.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getUsers(auth,domain,callback) {

	console.log('getUsers domain:::'+domain);
	var body='';

	var service = google.admin('directory_v1');
	service.users.list({
		auth: auth,
		domain:domain,
		},{}, function(err, response) {
		if (err) {
		  console.log('getUsers The API returned an error: ' + err);
		  callback(err,null);
		}
		else{
			 console.log('getUsers API returned response: ' + JSON.stringify(response));
			return callback(null,response);
		}
  });
}
/**
 * Lists the available users you manage.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getUser(auth,accountId,callback) {

	console.log('getUser accountId:::'+accountId);

	var service = google.admin('directory_v1');
	service.users.get({
		auth: auth,
		userKey:accountId
		},{}, function(err, response) {
		if (err) {
		  console.log('getUser The API returned an error: ' + err);
		  callback(err,null);
		}
		else{
			 console.log('getUser API returned response: ' + JSON.stringify(response));
			return callback(null,response);
		}
  });
}
/**
 * Lists the available customers you manage.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getCustomer(auth,accountId,callback) {

	console.log('getCustomer accountId:::'+accountId);

	var service = google.reseller('v1');
		service.customers.get({
			auth: auth,
			customerId:accountId
			}, function(err, response) {
			if (err) {
			  console.log('The API returned an error: ' + err);
			  return callback(err,null);
			}
			else{
				 console.log('getCustomer returned response: ' + JSON.stringify(response));
				return callback(null,response);
				
			}
	});
}

// Register customer with google 
app.post('/apiv1/account', function (req, res) {
  	
	console.log('==========Create Account============'+JSON.stringify(req.body));
	
	res.set('Content-Type', 'application/json');
	
	var templateFile = __dirname +'/test/customer.create.template.json';

	var templateData = cjson.load(templateFile);
	
	templateData.customerId=randomstring.generate({length: 10,  charset: 'numeric'});
	templateData.customerDomain=req.body.domainName;
	templateData.postalAddress.contactName=req.body.profile.first_name+' '+req.body.profile.last_name;
	templateData.postalAddress.organizationName=req.body.profile.company_name;
	templateData.postalAddress.locality=req.body.profile.default_address.city;
	templateData.postalAddress.region=req.body.profile.default_address.region;
	templateData.postalAddress.postalCode=req.body.profile.default_address.postal_code;
	templateData.postalAddress.countryCode=req.body.profile.default_address.country;
	templateData.postalAddress.addressLine1=req.body.profile.default_address.address_line1;
	templateData.phoneNumber=req.body.profile.default_address.phone_number;
	templateData.alternateEmail=req.body.profile.email;
	templateData.password=req.body.password;

	var respObj = {};
	var resultObj = {};
	resultObj.providerresponse = {};
	
	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		  if (err) {
			console.log('Error loading client secret file: ' + err);
			return;
		  }
		  // Authorize a client with the loaded credentials, then call the
		  // Google Apps Reseller API.
			googleOAuth2.authorize(JSON.parse(content),function(err, result) {
	
				return createCustomer(result,templateData,function(err,custResult){
					if(err){
						console.log('Create Account err::::'+JSON.stringify(err));
						resultObj.providerresponse.respcode = err.code;					
						resultObj.success = false;
						resultObj.providerresponse.errorcode = err.code;
						if(err.errors){
							resultObj.message = err.errors[0].message;
							resultObj.providerresponse.errormessage = err.errors[0].message;
						}
						else{
							resultObj.message = 'Unauthorized Client';
							resultObj.providerresponse.errormessage = 'Unauthorized Client';
						}
						respObj.result = resultObj;				
						res.send( respObj );
					}
					else{
						resultObj.success = true;
						resultObj.message = "Account created successfully";
						resultObj.providerresponse.accountid = custResult.customerId;		
						var endPointData={};
						var path = '/apiv1/account/user';	
						var authArray=req.headers.authorization.split(' ');
						var decodedString = new Buffer(authArray[1] || '', 'base64').toString('utf8');

						var decodedArray=decodedString.split(':');
						operation(path,'POST',JSON.stringify(templateData),decodedArray,function(err,resultCode,resultmasterdata){
								resultmasterdata=JSON.parse(resultmasterdata);
								if(resultmasterdata.result && !resultmasterdata.result.success){
									resultObj.providerresponse.respcode = resultmasterdata.result.providerresponse.errorcode;					
									resultObj.success = false;
									resultObj.providerresponse.errorcode = resultmasterdata.result.providerresponse.errorcode;
									resultObj.message = resultmasterdata.result.providerresponse.errormessage;
									resultObj.providerresponse.errormessage = resultmasterdata.result.providerresponse.errormessage;
									respObj.result = resultObj;				
									console.log('respObj User ::::'+JSON.stringify(respObj));
									res.send( respObj );
								}
								else{
							
									resultObj.providerresponse.customerid = resultmasterdata.id;
									//resultObj.providerresponse.password = templateData.password;
									resultObj.providerresponse.customerDomain = custResult.customerDomain;
									var path = '/apiv1/makeadmin';
									var authArray=req.headers.authorization.split(' ');
									var decodedString = new Buffer(authArray[1] || '', 'base64').toString('utf8');

									var decodedArray=decodedString.split(':');
									operation(path,'POST',JSON.stringify(templateData),decodedArray,function(err,resultCode,resultmasterdata){
										if(err){
											console.log('makeadmin Account err::::'+JSON.stringify(err));
											resultObj.providerresponse.respcode = err.code;					
											resultObj.success = false;
											resultObj.providerresponse.errorcode = err.code;
											if(err.errors){
												resultObj.message = 'Error in assigning Admin role to the user - '+err.errors[0].message;
												resultObj.providerresponse.errormessage = 'Error in assigning Admin role to the user - '+err.errors[0].message;
											}
											else{
												resultObj.message = 'Unauthorized Client';
												resultObj.providerresponse.errormessage = 'Unauthorized Client';
											}
											respObj.result = resultObj;				
											res.send( respObj );
										}
                                        else{ 										
											respObj.result = resultObj;				
											res.send( respObj );
										}
									});
								}
						});

					}
				});	
		  });
	  });
})

// Register user with google 
app.post('/apiv1/account/user', function (req, res) {
  	
	console.log('==========Create User============');
	
    res.set('Content-Type', 'application/json');
	var respObj = {};
	var resultObj = {};
	resultObj.providerresponse = {};
	
	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		  if (err) {
			console.log('createUser Error loading client secret file: ' + err);
			return;
		  }
		  // Authorize a client with the loaded credentials, then call the
		  // Google Apps Reseller API.
			google_admin_user_scope.authorize(JSON.parse(content),function(err, result) {
				
				return createUser(result,req.body,function(err,result){
					if(err){
						console.log('createUser err::::'+JSON.stringify(err));
						resultObj.providerresponse.respcode = err.code;					
						resultObj.success = false;
						resultObj.providerresponse.errorcode = err.code;
						if(err.errors){
							resultObj.message = 'User creation failed - '+err.errors[0].message;
							resultObj.providerresponse.errormessage = 'User creation failed - '+err.errors[0].message;
						}
						else{
							resultObj.message = 'User creation failed - Unauthorized Client';
							resultObj.providerresponse.errormessage = 'User creation failed - Unauthorized Client';
						}
						respObj.result = resultObj;				
						console.log('respObj err::::'+JSON.stringify(respObj));
						res.send( respObj );
					
					}
					else{
						    if(req.body.RoleSet){
								if('admin'===req.body.RoleSet){
									var path = '/apiv1/makeadmin';
									var authArray=req.headers.authorization.split(' ');
									var decodedString = new Buffer(authArray[1] || '', 'base64').toString('utf8');

									var decodedArray=decodedString.split(':');
									operation(path,'POST',JSON.stringify(req.body),decodedArray,function(err,resultCode,resultmasterdata){
										if(err){
											console.log('makeadmin createUser err::::'+JSON.stringify(err));
											resultObj.providerresponse.respcode = err.code;					
											resultObj.success = false;
											resultObj.providerresponse.errorcode = err.code;
											if(err.errors){
												resultObj.message = 'Error in assigning Admin role to the user -'+err.errors[0].message;
												resultObj.providerresponse.errormessage = 'Error in assigning Admin role to the user - '+err.errors[0].message;
											}
											else{
												resultObj.message = 'Error in assigning Admin role to the user - Unauthorized Client';
												resultObj.providerresponse.errormessage = 'Error in assigning Admin role to the user - Unauthorized Client';
											}
											respObj.result = resultObj;				
											console.log('respObj err::::'+JSON.stringify(respObj));
											res.send( respObj );
										
										}
										else{
											resultObj.providerresponse.customerid = result.customerId;
											resultObj.providerresponse.userid = result.id;
											resultObj.providerresponse.customerDomain = req.body.customerDomain;
											resultObj.success = true;
											resultObj.message = "User created successfully";
											respObj.result = resultObj;				
											res.send( respObj );
										}
									});
								}
							}
							else{
									resultObj.providerresponse.customerid = result.customerId;
									resultObj.providerresponse.userid = result.id;
									resultObj.providerresponse.customerDomain = req.body.customerDomain;
									resultObj.success = true;
									resultObj.message = "User created successfully";
									respObj.result = resultObj;				
									res.send( respObj );
							}
					}
				});	
		  });
	  });
})

// make user as admin
app.post('/apiv1/makeadmin', function (req, res) {
  	
	console.log('==========makeadmin User============'+JSON.stringify(req.body));
	
    res.set('Content-Type', 'application/json');
	var respObj = {};
	var resultObj = {};
	resultObj.providerresponse = {};
	console.log('__dirname'+__dirname);
	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		  if (err) {
			console.log('makeadmin Error loading client secret file: ' + err);
			return;
		  }
		  // Authorize a client with the loaded credentials, then call the
		  // Google Apps Reseller API.
			google_admin_user_scope.authorize(JSON.parse(content),function(err, result) {
				
				return makeAdmin(result,req.body,function(err,result){
					if(err){
						console.log('makeadmin err::::'+JSON.stringify(err));
					
					}
					console.log('makeadmin result::::'+JSON.stringify(result));
			  
					   res.send(result);
				});	
		  });
	  });
})

/**
 * Creates the customers you manage.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function createCustomer(auth,body,callback) {

	console.log('createCustomer body:::'+JSON.stringify(body));

	//var templateFile = __dirname +'/test/customer.create.template.json';

	//var templateData = cjson.load(templateFile);

	var service = google.reseller('v1');
	service.customers.insert({
		auth: auth,
		resource:body
		},{}, function(err, response) {
		if (err) {
		  console.log('The API returned an error: ' + err);
		  callback(err,null);
		}
		else{
			 console.log('createCustomer API returned response: ' + JSON.stringify(response));
			return callback(null,response);
		}
  });
}
/**
 * Updates the customers you manage.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function updateCustomer(auth,body,callback) {

	console.log('updateCustomer body:::'+JSON.stringify(body));

	var service = google.reseller('v1');
	service.customers.update({
		auth: auth,
		resource:body,
		customerId:body.customerId
		},{}, function(err, response) {
		if (err) {
		  console.log('updateCustomer The API returned an error: ' + err);
		  callback(err,null);
		}
		else{
			 console.log('updateCustomer API returned response: ' + JSON.stringify(response));
			return callback(null,response);
		}
  });
}
/**
 * Updates the users you manage.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function updateUser(auth,body,callback) {

	console.log('updateUser body:::'+JSON.stringify(body));

	var service = google.admin('directory_v1');
	service.users.update({
		auth: auth,
		resource:body,
		userKey:body.userKey
		},{}, function(err, response) {
		if (err) {
		  console.log('updateUser The API returned an error: ' + err);
		  callback(err,null);
		}
		else{
			 console.log('updateUser API returned response: ' + JSON.stringify(response));
			return callback(null,response);
		}
  });

}
/**
 * Deletes the users you manage.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function deleteUser(auth,userid,callback) {

	console.log('deleteUser body:::'+userid);

	var service = google.admin('directory_v1');
	service.users.delete({
		auth: auth,
		userKey:userid
		},{}, function(err, response) {
		if (err) {
		  console.log('deleteUser The API returned an error: ' + err);
		  callback(err,null);
		}
		else{
			 console.log('deleteUser API returned response: ' + JSON.stringify(response));
			return callback(null,response);
		}
  });

}

/**
 * Creates the users you manage.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function createUser(auth,body,callback) {

	//console.log('createUser body:::'+JSON.stringify(body));

	var templateFile = __dirname +'/test/user.create.template.json';
	
	var nameArray='';
	var firstName='';
	var lastName='';
	var fullName='';
	var primaryEmail='';
	if(body.postalAddress){
		nameArray=body.postalAddress.contactName.split(' ');
		firstName=nameArray[0];
		lastName=nameArray[1];
		fullName=body.postalAddress.contactName;
		primaryEmail='admin@'+body.customerDomain;
	}
	else{
		firstName=body.first_name;
		lastName=body.last_name;
		fullName=body.first_name+' '+body.last_name;
		primaryEmail=body.email;
	}
	


	console.log('firstName::::'+firstName);
	console.log('lastName::::'+lastName);
	
	var templateData = cjson.load(templateFile);
	templateData.primaryEmail=primaryEmail;
	templateData.name.givenName=firstName;
	templateData.name.familyName=lastName;
	templateData.name.fullName=fullName;
	templateData.password=body.password;
	
	console.log('create user body data ::::'+JSON.stringify(templateData));

	var service = google.admin('directory_v1');
	service.users.insert({
		auth: auth,
		resource:templateData
		},{}, function(err, response) {
		if (err) {
		  console.log('createUser The API returned an error: ' + err);
		  callback(err,null);
		}
		else{
			 console.log('createUser API returned response: ' + JSON.stringify(response));
			return callback(null,response);
		}
  });
}
/**
 * makeAdmin the users you manage.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function makeAdmin(auth,body,callback) {

	var templateFile = __dirname +'/test/user.makeadmin.json';
    var userKeys='';
	var templateData = cjson.load(templateFile);
	if(body.customerDomain){
		userKeys='admin@'+body.customerDomain;
	}
	if(body.email){
		userKeys=body.email;
	}
		  console.log('makeAdmin templateData: ' + JSON.stringify(templateData));
		  console.log('makeAdmin userKeys: ' + userKeys);
	var service = google.admin('directory_v1');
	service.users.makeAdmin({
		auth: auth,
		resource:templateData,
		userKey:userKeys
		},{}, function(err, response) {
		if (err) {
		  console.log('makeAdmin The API returned an error: ' + err);
		  callback(err,null);
		}
		else{
			 console.log('makeAdmin API returned response: ' + JSON.stringify(response));
			return callback(null,response);
		}
  });
}

// Create Subscription google for customer  
app.post('/apiv1/resource', function (req, res) {
  	
	console.log('==========Create Subscription============'+JSON.stringify(req.body));
	
	res.set('Content-Type', 'application/json');
	var templateFile = __dirname +'/test/saas.create.template.json';

	var templateData = cjson.load(templateFile);

	templateData.purchaseOrderId=randomstring.generate({length: 10,  charset: 'alphanumeric'});
	templateData.skuId=req.body.parameters.partnumber;
	templateData.seats.numberOfSeats=parseInt(req.body.parameters.license);
	templateData.customerId=req.body.requestor.accountid;

	var respObj = {};
	var resultObj = {};
	resultObj.providerresponse = {};

	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		  if (err) {
			console.log('Error loading client secret file: ' + err);
			return;
		  }
		  // Authorize a client with the loaded credentials, then call the
		  // Google Apps Reseller API.
			googleOAuth2.authorize(JSON.parse(content),function(err, result) {
				return createSubscription(result,templateData,function(err,result){

					if(err){
						console.log('createSubscription err::::'+JSON.stringify(err));
						resultObj.providerresponse.respcode = err.code;					
						resultObj.success = false;
						resultObj.providerresponse.errorcode = err.code;
						if(err.errors){
							resultObj.message = err.errors[0].message;
							resultObj.providerresponse.errormessage = err.errors[0].message;
						}
						else{
							resultObj.message = 'Unauthorized Client';
							resultObj.providerresponse.errormessage = 'Unauthorized Client';
						}
						respObj.result = resultObj;				
						res.send( respObj );
					}
					else{
						resultObj.success = true;
						resultObj.message = "Resource created successfully";
						resultObj.providerresponse.providerInstanceId = result.subscriptionId;		
						resultObj.providerresponse.orderId = result.purchaseOrderId;
						resultObj.providerresponse.instanceStatus = result.status;	
						resultObj.providerresponse.userName = 'admin@'+req.body.parameters.domain;	
						resultObj.providerresponse.licenseQuantity = result.seats.licensedNumberOfSeats;
						resultObj.providerresponse.licenseQuantity = result.seats.licensedNumberOfSeats;
						resultObj.providerresponse.expireDate = parseInt(result.plan.commitmentInterval.endTime);						
						resultObj.providerresponse.password = req.body.password;						
						respObj.result = resultObj;
						console.log('respObj::::'+JSON.stringify(respObj));
					}
				  
					   res.send(respObj);
				});	
		  });
	  });
})

/**
 * Creates subscriptions.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function createSubscription(auth,body,callback) {

	console.log('createSubscription body:::'+JSON.stringify(body));

	var service = google.reseller('v1');
		service.subscriptions.insert({
			auth: auth,
			customerId:body.customerId,
			resource:body
			},{}, function(err, response) {
			if (err) {
			  console.log('The createSubscription API returned an error: ' + err);
			  return callback(err,null);
			}
			else{
				 console.log('createSubscription returned response: ' + JSON.stringify(response));
				return callback(null,response);
				
			}
	});
}

// Actions on subscription like suspend/unsuspend/changeSeats/delete

app.put('/apiv1/resource', function (req, res) {
  	
	console.log('==========Actions on Resource============');
	
	res.set('Content-Type', 'application/json');

	var action = req.body.action;
	var resourceid = req.body.instance.id;
	
	console.log('==========actiontype============'+action);
	console.log('==========resourceid============'+resourceid);
	
	var provideraction = "";
	var reqBody = {};
	if(action === "update.suspend"){
		provideraction = "suspendSubscription";
	}else if(action === "update.reactivate"){
		provideraction = "unsuspendSubscription";
	}else if(action === "update.quantity"){
		
	var templateFile = __dirname +'/test/saas.update.quantity.template.json';

	var templateData = cjson.load(templateFile);

	templateData.numberOfSeats=parseInt(req.body.parameters.license);
	templateData.customerId=req.body.requestor.accountid;
	templateData.subscriptionId=req.body.instance.id;

	var respObj = {};
	var resultObj = {};
	resultObj.providerresponse = {};

	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		  if (err) {
			console.log('Error loading client secret file: ' + err);
			return;
		  }
		  // Authorize a client with the loaded credentials, then call the
		  // Google Apps Reseller API.
			googleOAuth2.authorize(JSON.parse(content),function(err, result) {
				return changeSeats(result,templateData,function(err,result){

					if(err){
						console.log('changeSeats err::::'+JSON.stringify(err));
						resultObj.providerresponse.respcode = err.code;					
						resultObj.success = false;
						resultObj.providerresponse.errorcode = err.code;
						if(err.errors){
							resultObj.message = err.errors[0].message;
							resultObj.providerresponse.errormessage = err.errors[0].message;
						}
						else{
							resultObj.message = 'Unauthorized Client';
							resultObj.providerresponse.errormessage = 'Unauthorized Client';
						}
						respObj.result = resultObj;				
						res.send( respObj );
					}
					else{
						resultObj.providerresponse.respcode = 200;
						resultObj.providerresponse.instanceid = req.body.instance.id;
						resultObj.success = true;
						resultObj.message = "License updated successfully";
						respObj.result = resultObj;
						console.log('changeSeats respObj::::'+JSON.stringify(respObj));
					}
				  
					   res.send(respObj);
				});	
		  });
	  });
		
			
	}

if(action === "update.suspend"){
	
	var respObj = {};
	var resultObj = {};
	resultObj.providerresponse = {};

	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		  if (err) {
			console.log('Error loading client secret file: ' + err);
			return;
		  }
		  // Authorize a client with the loaded credentials, then call the
		  // Google Apps Reseller API.
			googleOAuth2.authorize(JSON.parse(content),function(err, result) {
				return suspendSubscription(result,req.body,function(err,result){

						console.log('suspendSubscription result::::'+JSON.stringify(result));
					if(err){
						console.log('suspendSubscription err::::'+JSON.stringify(err));
						resultObj.providerresponse.respcode = err.code;					
						resultObj.success = false;
						resultObj.providerresponse.errorcode = err.code;
						if(err.errors){
							resultObj.message = err.errors[0].message;
							resultObj.providerresponse.errormessage = err.errors[0].message;
						}
						else{
							resultObj.message = 'Unauthorized Client';
							resultObj.providerresponse.errormessage = 'Unauthorized Client';
						}
						respObj.result = resultObj;				
						res.send( respObj );
					}
					else{
						resultObj.providerresponse.respcode = 200;
						resultObj.providerresponse.instanceid = req.body.instance.id;
						resultObj.success = true;
						resultObj.message = "Resource Suspended successfully";
						respObj.result = resultObj;
						console.log('suspendSubscription respObj::::'+JSON.stringify(respObj));
					}
				  
					   res.send(respObj);
				});	
		  });
	  });


}

if(action === "update.reactivate"){
	
	var respObj = {};
	var resultObj = {};
	resultObj.providerresponse = {};

	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		  if (err) {
			console.log('Error loading client secret file: ' + err);
			return;
		  }
		  // Authorize a client with the loaded credentials, then call the
		  // Google Apps Reseller API.
			googleOAuth2.authorize(JSON.parse(content),function(err, result) {
				return reactivateSubscription(result,req.body,function(err,result){

					if(err){
						console.log('reactivateSubscription err::::'+JSON.stringify(err));
						resultObj.providerresponse.respcode = err.code;					
						resultObj.success = false;
						resultObj.providerresponse.errorcode = err.code;
						if(err.errors){
							resultObj.message = err.errors[0].message;
							resultObj.providerresponse.errormessage = err.errors[0].message;
						}
						else{
							resultObj.message = 'Unauthorized Client';
							resultObj.providerresponse.errormessage = 'Unauthorized Client';
						}
						respObj.result = resultObj;				
						res.send( respObj );
					}
					else{
						resultObj.providerresponse.respcode = 200;
						resultObj.providerresponse.instanceid = req.body.instance.id;
						resultObj.success = true;
						resultObj.message = "Resource Reactivated successfully";
						respObj.result = resultObj;
						console.log('reactivateSubscription respObj::::'+JSON.stringify(respObj));
					}
				  
					   res.send(respObj);
				});	
		  });
	  });


}
if(action === "update.delete"){
	
	var respObj = {};
	var resultObj = {};
	resultObj.providerresponse = {};

	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		  if (err) {
			console.log('Error loading client secret file: ' + err);
			return;
		  }
		  // Authorize a client with the loaded credentials, then call the
		  // Google Apps Reseller API.
			googleOAuth2.authorize(JSON.parse(content),function(err, result) {
				return deleteSubscription(result,req.body,function(err,result){

					if(err){
						console.log('deleteSubscription err::::'+JSON.stringify(err));
						resultObj.providerresponse.respcode = err.code;					
						resultObj.success = false;
						resultObj.providerresponse.errorcode = err.code;
						if(err.errors){
							resultObj.message = err.errors[0].message;
							resultObj.providerresponse.errormessage = err.errors[0].message;
						}
						else{
							resultObj.message = 'Unauthorized Client';
							resultObj.providerresponse.errormessage = 'Unauthorized Client';
						}
						respObj.result = resultObj;				
						res.send( respObj );
					}
					else{
						resultObj.providerresponse.respcode = 200;
						resultObj.providerresponse.instanceid = req.body.instance.id;
						resultObj.success = true;
						resultObj.message = "Resource Deleted successfully";
						respObj.result = resultObj;
						console.log('deleteSubscription respObj::::'+JSON.stringify(respObj));
					}
				  
					   res.send(respObj);
				});	
		  });
	  });


}	
  
})

/**
 * Deletes the subscription.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function deleteSubscription(auth,body,callback) {

	console.log('deleteSubscription body:::'+JSON.stringify(body));

	var service = google.reseller('v1');
	service.subscriptions.delete({
		auth: auth,
		customerId:body.requestor.accountid,
		subscriptionId:body.instance.id,
		resource:body,
		deletionType:'cancel'
		},{}, function(err, response) {
		if (err) {
		  console.log('deleteSubscription API returned an error: ' + err);
		  callback(err,null);
		}
		else{
			 console.log('deleteSubscription API returned response: ' + JSON.stringify(response));
			return callback(null,response);
		}
  });
}/**
 * Updates seats for subscription.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function changeSeats(auth,body,callback) {

	console.log('changeSeats body:::'+JSON.stringify(body));

	var service = google.reseller('v1');
	service.subscriptions.changeSeats({
		auth: auth,
		customerId:body.customerId,
		subscriptionId:body.subscriptionId,
		resource:body
		},{}, function(err, response) {
		if (err) {
		  console.log('changeSeats API returned an error: ' + err);
		  callback(err,null);
		}
		else{
			 console.log('changeSeats API returned response: ' + JSON.stringify(response));
			return callback(null,response);
		}
  });
}
/**
 * Updates seats for subscription.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function suspendSubscription(auth,body,callback) {

	console.log('suspendSubscription body:::'+JSON.stringify(body));

	var service = google.reseller('v1');
	service.subscriptions.suspend({
		auth: auth,
		customerId:body.requestor.accountid,
		subscriptionId:body.instance.id
		},{}, function(err, response) {
		if (err) {
		  console.log('suspendSubscription API returned an error: ' + err);
		  callback(err,null);
		}
		else{
			 console.log('suspendSubscription API returned response: ' + JSON.stringify(response));
			return callback(null,response);
		}
  });
}
/**
 * Updates seats for subscription.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function reactivateSubscription(auth,body,callback) {

	console.log('reactivateSubscription body:::'+JSON.stringify(body));

	var service = google.reseller('v1');
	service.subscriptions.activate({
		auth: auth,
		customerId:body.requestor.accountid,
		subscriptionId:body.instance.id
		},{}, function(err, response) {
		if (err) {
		  console.log('reactivateSubscription API returned an error: ' + err);
		  callback(err,null);
		}
		else{
			 console.log('reactivateSubscription API returned response: ' + JSON.stringify(response));
			return callback(null,response);
		}
  });
}


// Retrieve resource from google 
app.get('/apiv1/resource/:accountId/:resourceid', function (req, res) {

	var respObj = {};
	var resultObj = {};
	resultObj.providerresponse = {};

	console.log('==========Get Account accountId============'+req.params.accountId);
   console.log('in Retrieve resource details resourceid: '+req.params.resourceid);
 	req.body.accountid=req.params.accountId;
 	req.body.resourceid=req.params.resourceid;
    res.set('Content-Type', 'application/json');

	// Load client secrets from a local file.
	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		  if (err) {
			console.log('Error loading client secret file: ' + err);
			return;
		  }
		  // Authorize a client with the loaded credentials, then call the
		  // Google Apps Reseller API.
		googleOAuth2.authorize(JSON.parse(content),function(err, result) {	
				return getSubscription(result,req.body,function(err,subsResult){
					if(err){
						console.log('getSubscription err::::'+JSON.stringify(err));
						resultObj.providerresponse.respcode = err.code;					
						resultObj.success = false;
						resultObj.providerresponse.errorcode = err.code;
						if(err.errors){
							resultObj.message = err.errors[0].message;
							resultObj.providerresponse.errormessage = err.errors[0].message;
						}
						else{
							resultObj.message = 'Unauthorized Client';
							resultObj.providerresponse.errormessage = 'Unauthorized Client';
						}
						respObj.result = resultObj;				
						res.send( respObj );
					}
					else{
					   var resources=[];
						var templateFile = __dirname +'/test/resource.retrieve.template.json';

						var resourceObj = cjson.load(templateFile);
						resourceObj.parameters.name = subsResult.skuId;
						resourceObj.parameters.license = subsResult.seats.licensedNumberOfSeats;
						resourceObj.parameters.domain = subsResult.customerDomain;
						resourceObj.parameters.status = subsResult.status;
						resultObj.providerresponse.respcode = 200;
						resultObj.providerresponse.resources=resources;
						resultObj.providerresponse.resources.push(resourceObj);
						resultObj.success = true;
						resultObj.message = "Resource fetched successfully";
						respObj.result = resultObj;
						console.log('getSubscription respObj::::'+JSON.stringify(respObj));
					}
				  
						res.send( respObj );
				});
		  });
	  });	
})
// Retrieve resources from google 
app.get('/apiv1/resource', function (req, res) {

	var respObj = {};
	var resultObj = {};
	resultObj.providerresponse = {};

    res.set('Content-Type', 'application/json');

	// Load client secrets from a local file.
	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		  if (err) {
			console.log('Error loading client secret file: ' + err);
			return;
		  }
		  // Authorize a client with the loaded credentials, then call the
		  // Google Apps Reseller API.
		googleOAuth2.authorize(JSON.parse(content),function(err, result) {	
				return getSubscriptions(result,req.body,function(err,subsResult){
					if(err){
						console.log('getSubscriptions err::::'+JSON.stringify(err));
						resultObj.providerresponse.respcode = err.code;					
						resultObj.success = false;
						resultObj.providerresponse.errorcode = err.code;
						if(err.errors){
							resultObj.message = err.errors[0].message;
							resultObj.providerresponse.errormessage = err.errors[0].message;
						}
						else{
							resultObj.message = 'Unauthorized Client';
							resultObj.providerresponse.errormessage = 'Unauthorized Client';
						}
						respObj.result = resultObj;				
						res.send( respObj );
					}
					else{
						var templateFile = __dirname +'/test/resource.retrieve.template.json';

						var resourceObj = cjson.load(templateFile);
						if(subsResult.subscriptions && subsResult.subscriptions.length>0){
								var resources=[];
								resultObj.providerresponse.resources=resources;
							for (var i = 0; i < subsResult.subscriptions.length; i++) {
								resourceObj = cjson.load(templateFile);
								resourceObj.parameters.name = subsResult.subscriptions[i].skuId;
								resourceObj.parameters.license = subsResult.subscriptions[i].seats.licensedNumberOfSeats;
								resourceObj.parameters.domain = subsResult.subscriptions[i].customerDomain;
								resourceObj.parameters.status = subsResult.subscriptions[i].status;
								resultObj.providerresponse.respcode = 200;
								resultObj.providerresponse.resources.push(resourceObj);
								resultObj.success = true;
								resultObj.message = "Resources fetched successfully";
								respObj.result = resultObj;
								console.log('getSubscriptions respObj::::'+JSON.stringify(respObj));
							}
						}
					}
				  
						res.send( respObj );
				});
		  });
	  });	
})
/**
 * gets subscriptions.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getSubscriptions(auth,body,callback) {

	console.log('getSubscriptions body:::');

	var service = google.reseller('v1');
	service.subscriptions.list({
		auth: auth
		},{}, function(err, response) {
		if (err) {
		  console.log('getSubscription API returned an error: ' + err);
		  callback(err,null);
		}
		else{
			 console.log('getSubscription API returned response: ' + JSON.stringify(response));
			return callback(null,response);
		}
  });
}

/**
 * gets subscription.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getSubscription(auth,body,callback) {

	console.log('getSubscription body:::'+JSON.stringify(body));

	var service = google.reseller('v1');
	service.subscriptions.get({
		auth: auth,
		customerId:body.accountid,
		subscriptionId:body.resourceid
		},{}, function(err, response) {
		if (err) {
		  console.log('getSubscription API returned an error: ' + err);
		  callback(err,null);
		}
		else{
			 console.log('getSubscription API returned response: ' + JSON.stringify(response));
			return callback(null,response);
		}
  });
}


app.put('/apiv1/account', function (req, res) {
  	
	console.log('==========Update account============');
	
	res.set('Content-Type', 'application/json');

	
	var templateFile = __dirname +'/test/customer.update.template.json';

	var templateData = cjson.load(templateFile);

	templateData.customerId=req.body.requestor.accountid;
	templateData.customerDomain=req.body.domainName;
	templateData.postalAddress.contactName=req.body.profile.default_address.first_name+' '+req.body.profile.default_address.last_name;
	templateData.postalAddress.organizationName=req.body.profile.company_name;
	templateData.postalAddress.locality=req.body.profile.default_address.city;
	templateData.postalAddress.region=req.body.profile.default_address.region;
	templateData.postalAddress.postalCode=req.body.profile.default_address.postal_code;
	templateData.postalAddress.countryCode=req.body.profile.default_address.country;
	templateData.postalAddress.addressLine1=req.body.profile.default_address.address_line1;
	templateData.phoneNumber=req.body.profile.default_address.phone_number;
	templateData.alternateEmail=req.body.profile.email;

	var respObj = {};
	var resultObj = {};
	resultObj.providerresponse = {};

	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		  if (err) {
			console.log('Error loading client secret file: ' + err);
			return;
		  }
		  // Authorize a client with the loaded credentials, then call the
		  // Google Apps Reseller API.
			googleOAuth2.authorize(JSON.parse(content),function(err, result) {
				return updateCustomer(result,templateData,function(err,result){

					if(err){
						console.log('updateCustomer err::::'+JSON.stringify(err));
						resultObj.providerresponse.respcode = err.code;					
						resultObj.success = false;
						resultObj.providerresponse.errorcode = err.code;
						if(err.errors){
							resultObj.message = err.errors[0].message;
							resultObj.providerresponse.errormessage = err.errors[0].message;
						}
						else{
							resultObj.message = 'Unauthorized Client';
							resultObj.providerresponse.errormessage = 'Unauthorized Client';
						}
						respObj.result = resultObj;				
						res.send( respObj );
					}
					else{
						resultObj.providerresponse.respcode = 200;
						resultObj.providerresponse.accountid = req.body.requestor.accountid;
						resultObj.success = true;
						resultObj.message = "Account updated successfully";
						respObj.result = resultObj;
						console.log('updateCustomer respObj::::'+JSON.stringify(respObj));
					}
				  
					   res.send(respObj);
				});	
		  });
	  });

})

app.put('/apiv1/account/user', function (req, res) {
  	
	console.log('==========Update user============');
	
	res.set('Content-Type', 'application/json');

	
	var templateFile = __dirname +'/test/user.update.template.json';

	var templateData = cjson.load(templateFile);

	templateData.name.givenName=req.body.first_name;
	templateData.name.familyName=req.body.last_name;
	templateData.name.fullName=req.body.first_name+' '+req.body.last_name;
	templateData.userKey=req.body.requestor.userid;

	var respObj = {};
	var resultObj = {};
	resultObj.providerresponse = {};

	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		  if (err) {
			console.log('Error loading client secret file: ' + err);
			return;
		  }
		  // Authorize a client with the loaded credentials, then call the
		  // Google Apps Reseller API.
			google_admin_user_scope.authorize(JSON.parse(content),function(err, result) {
				return updateUser(result,templateData,function(err,result){

					if(err){
						console.log('updateUser err::::'+JSON.stringify(err));
						resultObj.providerresponse.respcode = err.code;					
						resultObj.success = false;
						resultObj.providerresponse.errorcode = err.code;
						if(err.errors){
							resultObj.message = err.errors[0].message;
							resultObj.providerresponse.errormessage = err.errors[0].message;
						}
						else{
							resultObj.message = 'Unauthorized Client';
							resultObj.providerresponse.errormessage = 'Unauthorized Client';
						}
						respObj.result = resultObj;				
						res.send( respObj );
					}
					else{
						resultObj.providerresponse.respcode = 200;
						resultObj.providerresponse.userid = req.body.requestor.userid;
						resultObj.success = true;
						resultObj.message = "User updated successfully";
						respObj.result = resultObj;
						console.log('updateUser respObj::::'+JSON.stringify(respObj));
					}
				  
					   res.send(respObj);
				});	
		  });
	  });

})
app.delete('/apiv1/account/user/:userid', function (req, res) {
  	
	console.log('==========Delete user============'+req.params.userid);
	
	res.set('Content-Type', 'application/json');

	

	var respObj = {};
	var resultObj = {};
	resultObj.providerresponse = {};

	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		  if (err) {
			console.log('Error loading client secret file: ' + err);
			return;
		  }
		  // Authorize a client with the loaded credentials, then call the
		  // Google Apps Reseller API.
			google_admin_user_scope.authorize(JSON.parse(content),function(err, result) {
				return deleteUser(result,req.params.userid,function(err,result){

					if(err){
						console.log('deleteUser err::::'+JSON.stringify(err));
						resultObj.providerresponse.respcode = err.code;					
						resultObj.success = false;
						resultObj.providerresponse.errorcode = err.code;
						if(err.errors){
							resultObj.message = err.errors[0].message;
							resultObj.providerresponse.errormessage = err.errors[0].message;
						}
						else{
							resultObj.message = 'Unauthorized Client';
							resultObj.providerresponse.errormessage = 'Unauthorized Client';
						}
						respObj.result = resultObj;				
						res.send( respObj );
					}
					else{
						resultObj.providerresponse.respcode = 200;
						//resultObj.providerresponse.userid = req.body.requestor.userid;
						resultObj.success = true;
						resultObj.message = "User deleted successfully";
						respObj.result = resultObj;
						console.log('deleteUser respObj::::'+JSON.stringify(respObj));
					}
				  
					   res.send(respObj);
				});	
		  });
	  });

})	
//common method for http request
function operation(path, method, body,decodedArray, callback) {

    console.log('::::::::::::::::::::::::::::operation::::::::::::::::::::::::::::::::');

    var headers = {
        "Content-type":"application/json",
		"Authorization" : "Basic " + new Buffer(decodedArray[0] + ':' + decodedArray[1]).toString("base64")
    };


    var options = {
        host:'localhost',
        port: '8081',
        path: path,
        method: method,
        headers: headers
    };

    console.log('Options' + JSON.stringify(options,null,2));
    console.log('body' + JSON.stringify(body,null,2));

    var req = http.request(options, function (res) {
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

                return callback(null, res.statusCode, data);
            }

        });
    });

    req.on('error', function (e) {

        console.log('http request on error: e.message: ' + e.message);
        return callback(e.message);

    });
    req.write(body);
    req.end();

}

var server = app.listen(port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Google endpoint app listening at http://%s:%s", host, port)

})