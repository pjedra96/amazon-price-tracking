const express = require("express");
const app = express();
const http = require("http").Server(app); // HTTP server instance
const httpClient = require("http");	// HTTP client instance
const https = require("https"); // HTTPS client instance
const bodyParser = require('body-parser');
const logger = require('morgan'); // HTTP request logger library
const path = require('path');
const cheerio = require('cheerio');	// HTML parser (text-to-html)
const nodemailer = require('nodemailer'); // Node e-mail service
const cors = require('cors'); // Module for enabling cross-origin resource sharing
const querystring = require('querystring');


const port = process.env.port || 3000;

app.use(express.static(path.join(__dirname, 'public')));  // Sets root/public as the default directory
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(cors());

app.get('/',function(req,res){
  res.redirect('index.html');
  //res.sendFile('index.html');
  //res.sendFile(path.join(__dirname + '/index.htm'))
});

app.post('/track', function(req, response){
	let email = req.body.emailAddress;
	let link = req.body.url;
	let requestedPrice = parseFloat(req.body.price);
	let data = '';
	let trackTimeout;

	// If timeout is set, clear it
	if(trackTimeout){
		clearTimeout(trackTimeout);
	}
	// Make a GET request to the Amazon URL (to get the product details)
	https.get(link, (res) =>{
		// The response is being sent to the client
		res.on('data', (d) => {
			data += d;
		});

		// The whole response has been received. Deal with the result.
		res.on('end', () => {
			//let root = HTMLParser.parse(d.toString());
			let $ = cheerio.load(data.toString());
			// Gets the price of a product
			let actualPrice = $('#priceblock_ourprice').text();
			// Remove any characters but numbers and decimals
			actualPrice = parseFloat(actualPrice.replace(/[^0-9.]/g, ""));

			if(actualPrice > requestedPrice){
				console.log(actualPrice);

				trackTimeout = setTimeout(function(){
					// Set the data to be sent to to the /track path
					let data = querystring.stringify({
						emailAddress: email,
  						url: link,
  						price: requestedPrice
					});
					// Connection option
				    let options = {
				        host: '127.0.0.1',
				        port: 3000,
				        path: '/track',
				        method: 'POST',
				        headers: {
				            'Content-Type': 'application/x-www-form-urlencoded',
				            'Content-Length': data.length
				        }
				    };
				    // Connection establishment
				    let internalRequest = httpClient.request(options, function(res) {
				        res.setEncoding('utf8');
				        res.on('data', function (chunk) {
				            console.log("body: " + chunk);
				        });
				        res.on('error', function(err){
				        	console.log(err);
				        });
				    });
				    // Sending the data
				    internalRequest.write(data);
				    internalRequest.end();

				}, 1000*60*60*24); // 24 hours
			}else{
				if(trackTimeout){
					clearTimeout(trackTimeout);
				}

				let transporter = nodemailer.createTransport({
				    host: 'smtp.ethereal.email',
				    port: 587,
				    auth: {
				        user: 'mervin.predovic46@ethereal.email',
				        pass: 'JwHpgrvf9scu6cwtym'
				    }
				});

				// Format the email message, and set the email headers
				let mailOptions = {
					from: 'mervin.predovic46@ethereal.email',
					to: eMail,
					subject: 'Nodejs Amazon lowest price searched product',
					html: '<h2><b>Hello </b></h2>Below there is a link to the cheapest product that you were looking for. <br><b> Product searched : </b>' + searchTerm + ' <br>' + link + ' <br> Have a good day !' // html body
				};
				// Send the email to a chosen user
				transporter.sendMail(mailOptions, function(error, info){
					if (error) {
						console.log(error);
					} else {
						console.log('Email sent: ' + info.response);
					}
				});
			}
			response.redirect('index.html');
		});
	});
});


http.listen(port, function(){
	console.log("Service running on port "+ port);
});

// Stops the entire process when Signal Interrupt (Control-C) issued in the console
process.on('SIGINT', function(){
	console.log('Signal Interrupt received. Exiting the process');
	process.exit(0);
});