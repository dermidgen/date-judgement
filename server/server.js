var http    = require('http'),
	https	= require('https'),
    express = require('express'),
    app     = express(),
    nano	= require('nano')('http://localhost:5984');

var mailtemp = require('./autoresponse.json');

var leads = nano.use('leads');

var saveLead = function(lead) {
	console.log('creating new lead');
	leads.insert(lead, null, function(res, body){
		console.log('created lead:', body.id);
	});
};

var sendMail = function(lead){

	console.log('sending autoresponse');

	mailtemp.message.to[0].name = lead.firstname + ' ' + lead.lastname;
	mailtemp.message.to[0].email = lead.email;
	mailtemp.message.html = mailtemp.message.html.replace('%s',lead.firstname);
	mailtemp.message.text = mailtemp.message.text.replace('%s',lead.firstname);

	var post_data = (JSON.stringify(mailtemp));

	var options = {
		host: 'mandrillapp.com',
		port: 443,
		path: '/api/1.0/messages/send.json',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
        	'Content-Length': post_data.length
		}
	};

	var req = https.request(options, function(res){
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
		  console.log('email sent');
		});
	});
	req.write(post_data);
	req.end();
};

app.configure(function() {

    app.use(function(req, res, next){
    	console.log('%s %s', req.method, req.url);
	    next();
    });

    app.use(express.compress());
    app.use(express.cookieParser('xxx secret'));
    app.use(express.cookieSession());
    app.use(express.bodyParser());

});

app.post('/', function(req, client) {
	res.status(200).set('Content-Type', 'text/html').send('ok');
});

app.get('/', function(req, res) {
	res.status(200).set('Content-Type', 'text/html').send('ok');
});


var server = http.createServer(app);
server.listen(8080);
module.exports = server;

