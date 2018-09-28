A sample connector app for Google Cloud.
=================================================================================================
 
 
##Component Overview

##Objective / Purpose of the component 

	The purpose of this component is to illustrate an CNSP compatible google apps end point. This endpoint and code is a CNSP compatible endpoint interacting with Google Reseller API for various request fulfillment capabilities.
	
##Workflow description 
	a) All the external API calls will be received by CNSP endpoint Service running on localhost:8081 (http://localhost:8081/apiv1)
	b) Authenticates the User.
	c) Receives the request from CNSP API and processes the request according to the Google Reseller API specific format and interacts with Google API.
	d) Process the response from Google according to the CNSP API format and sends it back to CNSP API.

##Technology Used 
	Node.js

##List of APIs exposed
	a) http://localhost:8081/apiv1/account/    (Create (POST) / Update (PUT) / Retrieve (GET) / Delete (DELETE))
	b) http://localhost:8081/apiv1/user/          (Create (POST) / Update (PUT) / Retrieve (GET) / Delete (DELETE))
	c) http://localhost:8081/apiv1/resource/   (Create (POST) / Update (PUT) / Retrieve (GET) / Delete (DELETE))

##Deployment Considerations
##Pre-Requisites for setting up
	a) Node.js version -  v0.10.13.
	b) All the other modules required for this component are included under node_modules folder.
	c) After installing the Node.js run the application below command to start the service.
	d) To make sure the service is up and running make a status call from Postman as shown in below image --> URL : http://localhost:8081/apiv1/status (GET)

##Configurations

	 a) /cnspendpointcodesamples/googleendpoint/cnspendpoint.yaml 
                   port - The port in which CNSP endpoint listens.
                   skipAuthorization - Will skip user authentication if set to true.
     b) /cnspendpointcodesamples/googleendpoint/endpointusers.json
             Only users included in this json file with username/password are valid to access the CNSP endpoint
 
##Authentication
This API requires username:password in base64 encoded format in Authorization headers
(The username and password should be in the following file - /cnspendpointcodesamples/googleendpoint/endpointusers.json
For making the API call, take username:password from the above file and covert this string to base64 encoded)
Ex : Basic <username:password in base64 encoded>

 
##Instructions
 
1) Download the zip containing googleendpoint
 
2)  Turn on the G Suite Reseller API --> link for reference --> https://developers.google.com/admin-sdk/reseller/v1/quickstart/nodejs
                a) Create or select a project in the Google Developers Console and automatically turn on the API. Click Continue, then Go to credentials.
                b) On the Add credentials to your project page, click the Cancel button.
                c) At the top of the page, select the OAuth consent screen tab. Select an Email address, enter a Product name if not already set, and click the Save button.
                d) Select the Credentials tab, click the Create credentials button and select OAuth client ID.
                e) Select the application type Other, enter the name "G Suite Reseller API Quickstart", and click the Create button.
                f) Click OK to dismiss the resulting dialog.
                g) Click the file_download (Download JSON) button to the right of the client ID.
                h) Move content of this file to to /cnspendpointcodesamples/googleendpoint/client_secret.json
 
3) Add  users who are authorized to access this API to /cnspendpointcodesamples/googleendpoint/endpointusers.json with username and passwrod
 
4) Follow 'Step 3: Set up the sample' with scope as https://www.googleapis.com/auth/apps.order , from url
                --> https://developers.google.com/admin-sdk/reseller/v1/quickstart/nodejs and copy the content from the result to /cnspendpointcodesamples/googleendpoint/credentials/reseller-nodejs-admin-user-quickstart.json
 
5) Follow 'Step 3: Set up the sample' with scope as https://www.googleapis.com/auth/admin.directory.user ,  from url
                --> https://developers.google.com/admin-sdk/reseller/v1/quickstart/nodejs and copy the content from the result to /cnspendpointcodesamples/googleendpoint/credentials/reseller-nodejs-quickstart.json
